import {
    register,
    login,
    logout,
    getCurrentUser,
    signInWithProvider
} from "./auth-client.js";

let isRegisterMode = false;
let currentUser = null;
let lastRegistrationData = null;

function storeLastRegistrationData(data) {
    lastRegistrationData = data;
}

function setAuthUI({ isAuthed, email, logoutBtnVisible, userBadgeText }) {
    const authBtn = document.getElementById("authBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const userBadge = document.getElementById("userBadge");

    if (!authBtn || !logoutBtn || !userBadge) return;

    authBtn.style.display = isAuthed ? "none" : "inline-flex";
    logoutBtn.style.display = logoutBtnVisible ? "inline-flex" : "none";

    if (userBadgeText) {
        userBadge.textContent = userBadgeText;
        userBadge.style.display = "inline-flex";
    } else {
        userBadge.style.display = "none";
    }
}

function showModalError(text) {
    const errorEl = document.getElementById("authModalError");
    if (!errorEl) return;
    errorEl.innerHTML = text;
    errorEl.style.display = "block";
    errorEl.className = "auth-error auth-error--visible";
}

function showModalSuccess(text) {
    const errorEl = document.getElementById("authModalError");
    if (!errorEl) return;
    errorEl.innerHTML = text;
    errorEl.style.display = "block";
    errorEl.className = "auth-error auth-error--success";
}

function hideModalError() {
    const errorEl = document.getElementById("authModalError");
    if (!errorEl) return;
    errorEl.textContent = "";
    errorEl.style.display = "none";
    errorEl.className = "auth-error";
}

// Password visibility toggle
function setupPasswordToggle(inputId, toggleId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);
    if (!input || !toggle) return;

    toggle.addEventListener("click", () => {
        const isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";
        toggle.setAttribute("aria-label", isPassword ? "Скрыть пароль" : "Показать пароль");
        toggle.innerHTML = isPassword
            ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
               </svg>`
            : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
               </svg>`;
    });
}

function toggleAuthMode() {
    isRegisterMode = !isRegisterMode;
    const loginForm = document.getElementById("authModalLoginForm");
    const registerForm = document.getElementById("authModalRegisterForm");
    const toggleText = document.getElementById("authModalToggleText");
    const toggleBtn = document.getElementById("authModalToggleBtn");

    if (!loginForm || !registerForm) return;

    if (isRegisterMode) {
        loginForm.style.display = "none";
        registerForm.style.display = "flex";
        toggleText.textContent = "Уже есть аккаунт?";
        toggleBtn.textContent = "Войти";
    } else {
        loginForm.style.display = "flex";
        registerForm.style.display = "none";
        toggleText.textContent = "Нет аккаунта?";
        toggleBtn.textContent = "Зарегистрироваться";
    }
    hideModalError();
}

function closeAuthModal() {
    const modal = document.getElementById("authModal");
    if (modal) {
        modal.style.display = "none";
    }
}

function openAuthModal() {
    const modal = document.getElementById("authModal");
    if (modal) {
        modal.style.display = "flex";
    }
}

async function handleLogin(e) {
    e.preventDefault();
    hideModalError();

    const email = document.getElementById("authModalEmail")?.value.trim();
    const password = document.getElementById("authModalPassword")?.value;

    if (!email || !password) {
        showModalError("Заполните email и пароль");
        return;
    }

    try {
        const data = await login(email, password, true);
        if (data.success) {
            currentUser = data.user;
            closeAuthModal();
            updateAuthUI();
            showModalSuccess("Вход выполнен успешно!");
            setTimeout(() => {
                window.location.href = "profile.html";
            }, 1000);
        } else {
            showModalError(data.error || "Не удалось войти");
        }
    } catch (err) {
        showModalError(err.message || "Ошибка входа");
    }
}

async function handleRegister(e) {
    e.preventDefault();
    hideModalError();

    const firstName = document.getElementById("authModalRegFirstName")?.value.trim();
    const lastName = document.getElementById("authModalRegLastName")?.value.trim();
    const username = document.getElementById("authModalRegUsername")?.value.trim();
    const email = document.getElementById("authModalRegEmail")?.value.trim();
    const password = document.getElementById("authModalRegPassword")?.value;
    const confirm = document.getElementById("authModalRegConfirm")?.value;

    if (!firstName || !lastName || !username || !email || !password || !confirm) {
        showModalError("Заполните все поля");
        return;
    }

    if (password !== confirm) {
        showModalError("Пароли не совпадают");
        return;
    }

    if (password.length < 6) {
        showModalError("Пароль должен быть не менее 6 символов");
        return;
    }

    storeLastRegistrationData({ email, password, username, firstName, lastName });

    try {
        const data = await register(email, password, username, firstName, lastName);
        const registerButton = document.querySelector("#authModalRegisterForm button[type='submit']");
    const rateLimitMessage =
        "Письмо подтверждения уже отправлялось. Проверьте почту, папку «Спам» и подождите 30 секунд перед новой попыткой.";

    if (data.success) {
            // Если сессия уже доступна, переходим в профиль.
            if (data.data?.session) {
                currentUser = data.data.user;
                showModalSuccess("Регистрация успешна! Переходим в профиль...");
                setTimeout(() => {
                    window.location.href = "profile.html";
                }, 1500);
                return;
            }

            // Если сессия не создана, показываем экран подтверждения email.
            showConfirmationScreen(
                "Регистрация прошла успешно! Ссылка для подтверждения отправлена на вашу почту. " +
                "Откройте письмо и перейдите по ссылке, чтобы подтвердить аккаунт."
            );
        } else {
            const message = String(data.error?.message || data.error || "Не удалось зарегистрироваться");
            if (message.toLowerCase().includes("email rate limit")) {
                showConfirmationScreen(rateLimitMessage);
                if (registerButton) {
                    registerButton.disabled = true;
                    setTimeout(() => { registerButton.disabled = false; }, 30000);
                }
            } else {
                showModalError(message);
            }
        }
    } catch (err) {
        const message = String(err.message || "Ошибка регистрации");
        const rateLimitMessage =
            "Письмо подтверждения уже отправлялось. Проверьте почту, папку «Спам» и подождите 30 секунд перед новой попыткой.";
        if (message.toLowerCase().includes("email rate limit")) {
            showConfirmationScreen(rateLimitMessage);
            const registerButton = document.querySelector("#authModalRegisterForm button[type='submit']");
            if (registerButton) {
                registerButton.disabled = true;
                setTimeout(() => { registerButton.disabled = false; }, 30000);
            }
        } else {
            showModalError(message);
        }
    }
}

function showConfirmationScreen(message) {
    const loginForm = document.getElementById("authModalLoginForm");
    const registerForm = document.getElementById("authModalRegisterForm");
    const oauthButtons = document.querySelector(".auth-oauth");
    const toggleSection = document.querySelector(".auth-modal__toggle");
    const skipBtn = document.getElementById("authModalSkipBtn");
    const successEl = document.getElementById("authModalSuccess");
    const confirmationEl = document.getElementById("authModalConfirmation");
    const confirmationText = document.getElementById("authModalConfirmationText");
    const confirmationHelp = document.getElementById("authModalConfirmationHelp");
    const confirmationBtn = document.getElementById("authModalConfirmationBtn");
    const errorEl = document.getElementById("authModalError");
    const titleEl = document.querySelector(".auth-modal__title");
    const subtitleEl = document.querySelector(".auth-modal__subtitle");

    if (loginForm) loginForm.style.display = "none";
    if (registerForm) registerForm.style.display = "none";
    if (oauthButtons) oauthButtons.style.display = "none";
    if (toggleSection) toggleSection.style.display = "none";
    if (skipBtn) skipBtn.style.display = "none";

    if (successEl) {
        successEl.textContent = message;
        successEl.style.display = "block";
    }
    if (confirmationEl) {
        confirmationEl.style.display = "block";
    }
    if (confirmationText) {
        confirmationText.textContent = "Письмо отправлено. Перейдите по ссылке из письма, чтобы подтвердить аккаунт.";
    }
    if (confirmationHelp) {
        confirmationHelp.style.display = "block";
        confirmationHelp.textContent = "Если письмо не пришло, проверьте папку «Спам» и подождите 30 секунд.";
    }
    const resendBtn = document.getElementById("authModalResendBtn");
    if (confirmationBtn) {
        confirmationBtn.style.display = "inline-flex";
    }
    if (resendBtn) {
        resendBtn.style.display = "inline-flex";
        resendBtn.disabled = false;
        resendBtn.textContent = "Отправить снова";
    }
    if (errorEl) {
        errorEl.style.display = "none";
    }
    if (titleEl) titleEl.textContent = "Подтвердите email";
    if (subtitleEl) subtitleEl.textContent = "Проверьте вашу почту и перейдите по ссылке из письма.";
}

function hideConfirmationScreen() {
    const confirmationEl = document.getElementById("authModalConfirmation");
    const successEl = document.getElementById("authModalSuccess");
    const confirmationHelp = document.getElementById("authModalConfirmationHelp");
    const resendBtn = document.getElementById("authModalResendBtn");
    if (confirmationEl) confirmationEl.style.display = "none";
    if (successEl) successEl.style.display = "none";
    if (confirmationHelp) confirmationHelp.style.display = "none";
    if (resendBtn) resendBtn.style.display = "none";
}

async function resendConfirmationEmail() {
    const resendBtn = document.getElementById("authModalResendBtn");
    const errorEl = document.getElementById("authModalError");
    if (!lastRegistrationData?.email) {
        showModalError("Сначала зарегистрируйтесь, чтобы отправить письмо снова.");
        return;
    }

    if (resendBtn) {
        resendBtn.disabled = true;
        resendBtn.textContent = "Отправка...";
    }

    try {
        const data = await register(
            lastRegistrationData.email,
            lastRegistrationData.password,
            lastRegistrationData.username,
            lastRegistrationData.firstName,
            lastRegistrationData.lastName
        );

        if (data.success) {
            showConfirmationScreen(
                "Ссылка подтверждения отправлена повторно. Проверьте почту и папку «Спам»."
            );
            if (resendBtn) {
                resendBtn.disabled = false;
                resendBtn.textContent = "Отправить снова";
            }
            return;
        }

        const message = String(data.error?.message || data.error || "Не удалось отправить письмо повторно.");
        if (message.toLowerCase().includes("email rate limit")) {
            showConfirmationScreen(
                "Письмо подтверждения уже отправлялось. Проверьте почту, папку «Спам» и подождите 30 секунд перед новой попыткой."
            );
            if (resendBtn) {
                resendBtn.textContent = "Повторно через 30 секунд";
                setTimeout(() => {
                    resendBtn.disabled = false;
                    resendBtn.textContent = "Отправить снова";
                }, 30000);
            }
            return;
        }

        showModalError(message);
    } catch (err) {
        const message = String(err.message || "Ошибка отправки повторного письма");
        if (message.toLowerCase().includes("email rate limit")) {
            showConfirmationScreen(
                "Письмо подтверждения уже отправлялось. Проверьте почту, папку «Спам» и подождите 30 секунд перед новой попыткой."
            );
            if (resendBtn) {
                resendBtn.textContent = "Повторно через 30 секунд";
                setTimeout(() => {
                    resendBtn.disabled = false;
                    resendBtn.textContent = "Отправить снова";
                }, 30000);
            }
            return;
        }
        showModalError(message);
    } finally {
        if (resendBtn && !resendBtn.disabled) {
            resendBtn.textContent = "Отправить снова";
        }
    }
}

async function handleGoogleAuth() {
    try {
        const { error } = await signInWithProvider("google");
        if (error) showModalError(error.message || "OAuth ошибка.");
    } catch (err) {
        showModalError(err.message || "OAuth ошибка.");
    }
}

async function handleYandexAuth() {
    try {
        const { error } = await signInWithProvider("yandex");
        if (error) showModalError(error.message || "OAuth ошибка.");
    } catch (err) {
        showModalError(err.message || "OAuth ошибка.");
    }
}

function showRedirectMessage() {
    const searchParams = new URLSearchParams(window.location.search);
    const type = searchParams.get('type');
    if (!type) return;

    if (type === 'signup') {
        showModalSuccess('Email подтверждён. Теперь войдите в свой аккаунт.');
    } else if (type === 'recovery') {
        showModalSuccess('Проверьте почту, чтобы завершить восстановление.');
    }

    // Удаляем параметры из URL, чтобы сообщение не повторялось при перезагрузке.
    window.history.replaceState(null, '', window.location.pathname);
}

function initAuthModal() {
    console.log("[Auth] Initializing modal...");

    // Setup password toggles
    setupPasswordToggle("authModalPassword", "authModalTogglePassword");
    setupPasswordToggle("authModalRegPassword", "authModalToggleRegPassword");
    setupPasswordToggle("authModalRegConfirm", "authModalToggleRegConfirm");

    // Login form
    const loginForm = document.getElementById("authModalLoginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
        console.log("[Auth] Login form attached");
    }

    // Register form
    const registerForm = document.getElementById("authModalRegisterForm");
    if (registerForm) {
        registerForm.addEventListener("submit", handleRegister);
        console.log("[Auth] Register form attached");
    }

    // Toggle between login/register
    const toggleBtn = document.getElementById("authModalToggleBtn");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", toggleAuthMode);
        console.log("[Auth] Toggle button attached");
    }

    // OAuth buttons
    const googleBtn = document.getElementById("authModalGoogleBtn");
    const yandexBtn = document.getElementById("authModalYandexBtn");
    if (googleBtn) {
        googleBtn.addEventListener("click", handleGoogleAuth);
        console.log("[Auth] Google button attached");
    }
    if (yandexBtn) {
        yandexBtn.addEventListener("click", handleYandexAuth);
        console.log("[Auth] Yandex button attached");
    }

    // Skip button
    const skipBtn = document.getElementById("authModalSkipBtn");
    if (skipBtn) {
        skipBtn.addEventListener("click", closeAuthModal);
        console.log("[Auth] Skip button attached");
    }

    const confirmationBtn = document.getElementById("authModalConfirmationBtn");
    if (confirmationBtn) {
        confirmationBtn.addEventListener("click", () => {
            toggleAuthMode();
            hideConfirmationScreen();
        });
        console.log("[Auth] Confirmation button attached");
    }

    const resendBtn = document.getElementById("authModalResendBtn");
    if (resendBtn) {
        resendBtn.addEventListener("click", resendConfirmationEmail);
        console.log("[Auth] Resend button attached");
    }
}

async function updateAuthUI() {
    try {
        const data = await getCurrentUser();
        if (data.success && data.user) {
            currentUser = data.user;
            closeAuthModal();
            setAuthUI({
                isAuthed: true,
                email: data.user.email,
                logoutBtnVisible: true,
                userBadgeText: data.user.username || data.user.email.split('@')[0]
            });
        } else {
            setAuthUI({
                isAuthed: false,
                email: null,
                logoutBtnVisible: false,
                userBadgeText: null
            });
        }
    } catch (err) {
        // Не авторизован
        setAuthUI({
            isAuthed: false,
            email: null,
            logoutBtnVisible: false,
            userBadgeText: null
        });
        openAuthModal();
    }
}

async function handleLogout() {
    try {
        await logout();
        currentUser = null;
        window.location.href = "index.html";
    } catch (err) {
        console.error("Logout error:", err);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    console.log("[Auth] DOM loaded, initializing auth modal...");

    // Initialize modal event listeners
    initAuthModal();
    showRedirectMessage();

    const authBtn = document.getElementById("authBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    // Auth button in header - reopen modal
    authBtn?.addEventListener("click", () => {
        openAuthModal();
    });

    // Logout button
    logoutBtn?.addEventListener("click", handleLogout);

    // Always show auth modal while checking login status
    openAuthModal();

    // Check auth status
    await updateAuthUI();
});

