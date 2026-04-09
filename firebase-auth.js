import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const GUEST_ACTIONS = {
  account: `
    <a class="button button-ghost" href="#login">Accedi</a>
    <a class="button button-primary" href="#register">Registrati</a>
  `,
  default: `
    <a class="button button-ghost" href="account.html#login">Accedi</a>
    <a class="button button-primary" href="account.html#register">Registrati</a>
  `,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);

window.CRIMI_FIREBASE_AUTH_READY = true;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function authErrorMessage(error) {
  const code = error?.code || "";

  const messages = {
    "auth/email-already-in-use": "Questa email e gia registrata.",
    "auth/invalid-credential": "Email o password non corretti.",
    "auth/invalid-email": "Inserisci un'email valida.",
    "auth/user-not-found": "Non risulta nessun account con questa email.",
    "auth/missing-email": "Inserisci un'email prima di continuare.",
    "auth/missing-password": "Inserisci la password.",
    "auth/network-request-failed": "Connessione assente o instabile. Riprova tra poco.",
    "auth/operation-not-allowed":
      "Email e password non sono ancora attivati in Firebase Authentication.",
    "auth/too-many-requests": "Troppi tentativi. Aspetta un attimo e riprova.",
    "auth/user-disabled": "Questo account e stato disattivato.",
    "auth/weak-password": "La password deve avere almeno 6 caratteri.",
  };

  return messages[code] || "Qualcosa non ha funzionato. Controlla Firebase e riprova.";
}

function isAccountPage() {
  return document.body?.dataset?.page === "account";
}

function isProfilePage() {
  return document.body?.dataset?.page === "profile";
}

function isForgotPasswordPage() {
  return document.body?.dataset?.page === "forgot-password";
}

function isVerifyEmailPage() {
  return document.body?.dataset?.page === "verify-email";
}

function redirectToProfile() {
  if (!isAccountPage()) {
    return;
  }

  if (window.location.pathname.endsWith("/profile.html")) {
    return;
  }

  window.location.replace("profile.html");
}

function redirectToAccountLogin() {
  if (!isProfilePage()) {
    return;
  }

  if (window.location.pathname.endsWith("/account.html") && window.location.hash === "#login") {
    return;
  }

  window.location.replace("account.html#login");
}

function redirectToVerifyEmail(email = auth.currentUser?.email || "") {
  const nextEmail = email ? `?email=${encodeURIComponent(email)}` : "";

  if (window.location.pathname.endsWith("/verify-email.html")) {
    return;
  }

  window.location.replace(`verify-email.html${nextEmail}`);
}

function setNotice(element, message, status = "neutral") {
  if (!element) {
    return;
  }

  element.textContent = message;
  element.dataset.status = status;
}

function setButtonLoading(button, loading, idleLabel, loadingLabel) {
  if (!button) {
    return;
  }

  button.disabled = loading;
  button.textContent = loading ? loadingLabel : idleLabel;
}

function headerGuestMarkup() {
  return isAccountPage() ? GUEST_ACTIONS.account : GUEST_ACTIONS.default;
}

function renderHeaderActions(user) {
  document.querySelectorAll(".header-actions").forEach((actions) => {
    if (!user) {
      actions.innerHTML = headerGuestMarkup();
      return;
    }

    const accountLabel = escapeHtml(user.displayName || user.email || "Profilo");

    actions.innerHTML = `
      <a class="button button-ghost header-user-pill" href="profile.html">${accountLabel}</a>
      <button class="button button-primary" type="button" data-auth-logout-global>Esci</button>
    `;
  });

  document.querySelectorAll("[data-auth-logout-global]").forEach((button) => {
    button.addEventListener("click", async () => {
      button.disabled = true;

      try {
        await signOut(auth);
      } finally {
        button.disabled = false;
      }
    });
  });
}

function renderAccountState(user) {
  const title = document.querySelector("[data-auth-title]");
  const copy = document.querySelector("[data-auth-copy]");
  const logoutButton = document.querySelector("[data-auth-logout]");
  const profileLink = document.querySelector("[data-auth-profile-link]");

  if (!title || !copy || !logoutButton || !profileLink) {
    return;
  }

  if (!user) {
    title.textContent = "Non hai ancora effettuato l'accesso.";
    copy.textContent =
      "Registrati oppure accedi per salvare il tuo profilo e preparare il collegamento con ordini e drop.";
    logoutButton.hidden = true;
    profileLink.hidden = true;
    return;
  }

  const displayName = user.displayName || "Membro Crimi Gang";

  if (!user.emailVerified) {
    title.textContent = `Benvenuto ${displayName}, manca ancora la conferma email.`;
    copy.textContent =
      "Apri la mail di conferma che ti abbiamo inviato e poi continua con il tuo profilo Crimi Gang.";
    logoutButton.hidden = false;
    profileLink.hidden = true;
    return;
  }

  title.textContent = `Sei dentro come ${displayName}.`;
  copy.textContent = `Email collegata: ${user.email || "non disponibile"}. La sessione resta attiva su questo dispositivo anche mentre cambi pagina.`;
  logoutButton.hidden = false;
  profileLink.hidden = false;
}

function renderProfileState(user) {
  const title = document.querySelector("[data-profile-title]");
  const copy = document.querySelector("[data-profile-copy]");
  const email = document.querySelector("[data-profile-email]");
  const form = document.querySelector("[data-profile-form]");
  const nameInput = document.querySelector("[data-profile-name]");
  const memberBlock = document.querySelector("[data-profile-member]");
  const logoutButton = document.querySelector("[data-profile-logout]");

  if (!title || !copy || !email || !form || !nameInput || !memberBlock || !logoutButton) {
    return;
  }

  if (!user) {
    title.textContent = "Caricamento profilo...";
    copy.textContent =
      "Stiamo controllando la tua sessione prima di mostrarti il profilo Crimi Gang.";
    email.textContent = "Email: non disponibile";
    memberBlock.hidden = true;
    logoutButton.hidden = true;
    return;
  }

  const displayName = user.displayName || "Membro Crimi Gang";

  if (!user.emailVerified) {
    title.textContent = `Conferma l'email di ${displayName}`;
    copy.textContent =
      "Prima di usare il profilo, conferma il tuo indirizzo email dalla mail che ti abbiamo inviato.";
    email.textContent = `Email: ${user.email || "non disponibile"}`;
    memberBlock.hidden = true;
    logoutButton.hidden = false;
    return;
  }

  title.textContent = `Profilo di ${displayName}`;
  copy.textContent =
    "Qui puoi cambiare il nome mostrato sul sito e uscire dal tuo account quando vuoi.";
  email.textContent = `Email: ${user.email || "non disponibile"}`;
  nameInput.value = user.displayName || "";
  memberBlock.hidden = false;
  logoutButton.hidden = false;
}

function renderForgotPasswordState(user) {
  if (!isForgotPasswordPage()) {
    return;
  }

  const input = document.querySelector("[data-reset-email]");
  const copy = document.querySelector("[data-reset-copy]");
  const queryEmail = new URLSearchParams(window.location.search).get("email") || "";

  if (!input || !copy) {
    return;
  }

  if (queryEmail && !input.value.trim()) {
    input.value = queryEmail;
  }

  if (user?.email && !input.value.trim()) {
    input.value = user.email;
    copy.textContent = `Ti prepariamo il reset per ${user.email}. Puoi anche cambiare email se vuoi recuperare un altro account.`;
    return;
  }

  copy.textContent = "Usa la stessa email con cui hai creato il tuo account Crimi Gang.";
}

function renderVerifyEmailState(user) {
  if (!isVerifyEmailPage()) {
    return;
  }

  const email = document.querySelector("[data-verify-email]");
  const copy = document.querySelector("[data-verify-copy]");
  const queryEmail = new URLSearchParams(window.location.search).get("email") || "";

  if (!email || !copy) {
    return;
  }

  const nextEmail = user?.email || queryEmail || "non disponibile";
  email.textContent = `Email: ${nextEmail}`;

  if (user?.emailVerified) {
    copy.textContent = "Email confermata. Ora puoi entrare nel profilo Crimi Gang.";
    return;
  }

  copy.textContent =
    "Ti abbiamo inviato una mail di conferma. Aprila e clicca il link per attivare il profilo.";
}

function refreshSignedInUi(user = auth.currentUser) {
  renderHeaderActions(user);
  renderAccountState(user);
  renderProfileState(user);
  renderForgotPasswordState(user);
  renderVerifyEmailState(user);
}

function bindSharedLogoutButtons() {
  document.querySelectorAll("[data-auth-logout], [data-profile-logout]").forEach((button) => {
    button.addEventListener("click", async () => {
      button.disabled = true;
      const originalLabel = button.textContent;
      button.textContent = "Uscita...";

      try {
        await signOut(auth);
      } finally {
        button.disabled = false;
        button.textContent = originalLabel;
      }
    });
  });
}

function bindAccountForm(form) {
  const action = form.dataset.accountForm;
  const notice = form.querySelector("[data-account-notice]");
  const button = form.querySelector("[data-account-button]");

  if (!action || !notice || !button) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();
    const name = String(formData.get("name") || "").trim();

    if (!email || !password) {
      setNotice(notice, "Compila email e password prima di continuare.", "error");
      return;
    }

    if (action === "register" && password.length < 6) {
      setNotice(notice, "La password deve avere almeno 6 caratteri.", "error");
      return;
    }

    const idleLabel = action === "register" ? "Registrati" : "Accedi";
    const loadingLabel = action === "register" ? "Creazione..." : "Accesso...";

    setButtonLoading(button, true, idleLabel, loadingLabel);
    setNotice(notice, "Controllo in corso...", "neutral");

    try {
      if (action === "register") {
        const credentials = await createUserWithEmailAndPassword(auth, email, password);

        if (name) {
          await updateProfile(credentials.user, { displayName: name });
        }

        await sendEmailVerification(credentials.user);
        await reload(credentials.user);
        refreshSignedInUi(credentials.user);
        form.reset();
        redirectToVerifyEmail(credentials.user.email || email);
        return;
      }

      const credentials = await signInWithEmailAndPassword(auth, email, password);
      await reload(credentials.user);

      if (!credentials.user.emailVerified) {
        refreshSignedInUi(credentials.user);
        form.reset();
        redirectToVerifyEmail(credentials.user.email || email);
        return;
      }

      refreshSignedInUi(credentials.user);
      form.reset();
      redirectToProfile();
    } catch (error) {
      setNotice(notice, authErrorMessage(error), "error");
    } finally {
      setButtonLoading(button, false, idleLabel, loadingLabel);
    }
  });
}

function bindForgotPasswordForm() {
  if (!isForgotPasswordPage()) {
    return;
  }

  const form = document.querySelector("[data-reset-form]");
  const button = document.querySelector("[data-reset-button]");
  const emailInput = document.querySelector("[data-reset-email]");
  const notice = document.querySelector("[data-reset-notice]");

  if (!form || !button || !emailInput || !notice) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();

    if (!email) {
      setNotice(notice, "Inserisci prima la tua email per recuperare la password.", "error");
      emailInput.focus();
      return;
    }

    setButtonLoading(button, true, "Invia link di reset", "Invio...");
    setNotice(notice, "Invio email di recupero in corso...", "neutral");

    try {
      await sendPasswordResetEmail(auth, email);
      setNotice(
        notice,
        "Se esiste un account con questa email, ti arrivera una mail per reimpostare la password. Controlla anche Spam e Promozioni.",
        "success",
      );
    } catch (error) {
      setNotice(notice, authErrorMessage(error), "error");
    } finally {
      setButtonLoading(button, false, "Invia link di reset", "Invio...");
    }
  });
}

function bindVerifyEmailControls() {
  if (!isVerifyEmailPage()) {
    return;
  }

  const refreshButton = document.querySelector("[data-verify-refresh]");
  const resendButton = document.querySelector("[data-verify-resend]");
  const notice = document.querySelector("[data-verify-notice]");
  const queryEmail = new URLSearchParams(window.location.search).get("email") || "";

  if (!refreshButton || !resendButton || !notice) {
    return;
  }

  refreshButton.addEventListener("click", async () => {
    if (!auth.currentUser) {
      setNotice(
        notice,
        "Rientra con il tuo account e poi torna qui per controllare la conferma email.",
        "error",
      );
      return;
    }

    setButtonLoading(refreshButton, true, "Ho confermato, continua", "Controllo...");
    setNotice(notice, "Controllo conferma email in corso...", "neutral");

    try {
      await reload(auth.currentUser);

      if (auth.currentUser.emailVerified) {
        setNotice(notice, "Email confermata. Ti portiamo nel profilo.", "success");
        refreshSignedInUi(auth.currentUser);
        window.location.replace("profile.html");
        return;
      }

      setNotice(
        notice,
        "Non risulta ancora confermata. Apri la mail ricevuta e clicca il link, poi riprova.",
        "error",
      );
    } catch (error) {
      setNotice(notice, authErrorMessage(error), "error");
    } finally {
      setButtonLoading(refreshButton, false, "Ho confermato, continua", "Controllo...");
    }
  });

  resendButton.addEventListener("click", async () => {
    if (!auth.currentUser) {
      setNotice(
        notice,
        `Accedi prima con ${queryEmail || "la tua email"} per poter inviare di nuovo la mail di conferma.`,
        "error",
      );
      return;
    }

    setButtonLoading(resendButton, true, "Invia di nuovo la mail", "Invio...");
    setNotice(notice, "Invio della mail di conferma in corso...", "neutral");

    try {
      await sendEmailVerification(auth.currentUser);
      setNotice(
        notice,
        "Mail di conferma inviata di nuovo. Controlla Posta in arrivo, Spam e Promozioni.",
        "success",
      );
    } catch (error) {
      setNotice(notice, authErrorMessage(error), "error");
    } finally {
      setButtonLoading(resendButton, false, "Invia di nuovo la mail", "Invio...");
    }
  });
}

function bindAccountForms() {
  if (!isAccountPage()) {
    return;
  }

  document.querySelectorAll("[data-account-form]").forEach(bindAccountForm);
}

function bindProfileControls() {
  if (!isProfilePage()) {
    return;
  }

  const form = document.querySelector("[data-profile-form]");
  const notice = document.querySelector("[data-profile-notice]");
  const input = document.querySelector("[data-profile-name]");
  const button = document.querySelector("[data-profile-button]");
  const passwordButton = document.querySelector("[data-profile-password]");

  if (!form || !notice || !input || !button || !passwordButton) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nextName = input.value.trim();

    if (!auth.currentUser) {
      setNotice(notice, "Effettua prima l'accesso per modificare il nome.", "error");
      return;
    }

    if (!nextName) {
      setNotice(notice, "Scrivi un nome prima di salvare.", "error");
      return;
    }

    setButtonLoading(button, true, "Salva nome", "Salvataggio...");
    setNotice(notice, "Aggiornamento profilo in corso...", "neutral");

    try {
      await updateProfile(auth.currentUser, { displayName: nextName });
      refreshSignedInUi(auth.currentUser);
      setNotice(notice, "Nome aggiornato correttamente.", "success");
    } catch (error) {
      setNotice(notice, authErrorMessage(error), "error");
    } finally {
      setButtonLoading(button, false, "Salva nome", "Salvataggio...");
    }
  });

  passwordButton.addEventListener("click", (event) => {
    if (!auth.currentUser?.email) {
      event.preventDefault();
      setNotice(
        notice,
        "Non riusciamo a leggere l'email del tuo account. Rientra e riprova.",
        "error",
      );
      return;
    }

    passwordButton.href = `forgot-password.html?email=${encodeURIComponent(auth.currentUser.email)}`;
  });
}

async function initFirebaseAuth() {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch {
    // Ignore and continue with Firebase default persistence.
  }

  auth.languageCode = "it";

  bindAccountForms();
  bindForgotPasswordForm();
  bindVerifyEmailControls();
  bindProfileControls();
  bindSharedLogoutButtons();

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        await reload(user);
      } catch {
        // Ignore transient reload issues and use cached user state.
      }
    }

    if (user && !user.emailVerified && isProfilePage()) {
      redirectToVerifyEmail(user.email || "");
      return;
    }

    if (user && user.emailVerified && isVerifyEmailPage()) {
      window.location.replace("profile.html");
      return;
    }

    if (user && isAccountPage()) {
      if (!user.emailVerified) {
        redirectToVerifyEmail(user.email || "");
        return;
      }

      redirectToProfile();
      return;
    }

    if (!user && isProfilePage()) {
      redirectToAccountLogin();
      return;
    }

    refreshSignedInUi(user);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    void initFirebaseAuth();
  }, { once: true });
} else {
  void initFirebaseAuth();
}
