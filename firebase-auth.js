import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
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

    const accountLabel = escapeHtml(user.displayName || user.email || "Account");

    actions.innerHTML = `
      <a class="button button-ghost header-user-pill" href="account.html">${accountLabel}</a>
      <button class="button button-primary" type="button" data-auth-logout-global>Esci</button>
    `;
  });

  document.querySelectorAll("[data-auth-logout-global]").forEach((button) => {
    button.addEventListener("click", async () => {
      await signOut(auth);
    });
  });
}

function renderAccountState(user) {
  const title = document.querySelector("[data-auth-title]");
  const copy = document.querySelector("[data-auth-copy]");
  const logoutButton = document.querySelector("[data-auth-logout]");

  if (!title || !copy || !logoutButton) {
    return;
  }

  if (!user) {
    title.textContent = "Non hai ancora effettuato l'accesso.";
    copy.textContent =
      "Registrati oppure accedi per salvare il tuo profilo e preparare il collegamento con ordini e drop.";
    logoutButton.hidden = true;
    return;
  }

  const displayName = user.displayName || "Membro Crimi Gang";
  title.textContent = `Sei dentro come ${displayName}.`;
  copy.textContent = `Email collegata: ${user.email || "non disponibile"}. La sessione resta attiva su questo dispositivo.`;
  logoutButton.hidden = false;
}

function bindLogoutButton() {
  const logoutButton = document.querySelector("[data-auth-logout]");

  if (!logoutButton) {
    return;
  }

  logoutButton.addEventListener("click", async () => {
    logoutButton.disabled = true;
    logoutButton.textContent = "Uscita...";

    try {
      await signOut(auth);
    } finally {
      logoutButton.disabled = false;
      logoutButton.textContent = "Esci";
    }
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
      await setPersistence(auth, browserLocalPersistence);

      if (action === "register") {
        const credentials = await createUserWithEmailAndPassword(auth, email, password);

        if (name) {
          await updateProfile(credentials.user, { displayName: name });
        }

        setNotice(
          notice,
          "Registrazione completata. Il tuo account Crimi Gang e pronto.",
          "success",
        );
        form.reset();
        return;
      }

      await signInWithEmailAndPassword(auth, email, password);
      setNotice(notice, "Accesso eseguito con successo.", "success");
      form.reset();
    } catch (error) {
      setNotice(notice, authErrorMessage(error), "error");
    } finally {
      setButtonLoading(button, false, idleLabel, loadingLabel);
    }
  });
}

function bindAccountForms() {
  if (!isAccountPage()) {
    return;
  }

  document.querySelectorAll("[data-account-form]").forEach(bindAccountForm);
}

function initFirebaseAuth() {
  bindAccountForms();
  bindLogoutButton();

  onAuthStateChanged(auth, (user) => {
    renderHeaderActions(user);
    renderAccountState(user);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFirebaseAuth, { once: true });
} else {
  initFirebaseAuth();
}
