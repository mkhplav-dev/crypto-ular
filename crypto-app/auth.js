import { login, register, isAuthenticated, googleLogin } from "./auth-client.js";

// Google Client ID
const GOOGLE_CLIENT_ID = '266481878514-560m42fvs5pen51p0v2b0rvt17f1oumg.apps.googleusercontent.com';

function showError(el, text) {
    if (!el) return;
    el.textContent = text;
    el.style.display = "block";
}

function clearError(el) {
    if (!el) return;
    el.textContent = "";
    el.style.display = "none";
}

// Переключение табов
function setupTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    const loginContainer = document.getElementById('loginFormContainer');
    const registerContainer = document.getElementById('registerFormContainer');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Убираем active у всех табов
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Переключаем контейнеры
            if (targetTab === 'login') {
                loginContainer.classList.add('active');
                registerContainer.classList.remove('active');
                document.title = 'Вход — CryptoUlarbek';
            } else {
                loginContainer.classList.remove('active');
                registerContainer.classList.add('active');
                document.title = 'Регистрация — CryptoUlarbek';
            }
            
            clearError(document.getElementById('authError'));
        });
    });
}

// Toggle password visibility
function setupPasswordToggle(inputId, toggleId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);
    if (!input || !toggle) return;

    toggle.addEventListener("click", () => {
        const isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";
        toggle.setAttribute("aria-label", isPassword ? "Скрыть пароль" : "Показать пароль");
    });
}

// Phone number formatting
function setupPhoneFormatting(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.startsWith("7") || value.startsWith("8")) {
            value = value.substring(1);
        }
        if (value.length > 10) value = value.substring(0, 10);

        let formatted = "";
        if (value.length > 0) {
            formatted = "+7 ";
            if (value.length > 0) formatted += "(" + value.substring(0, 3);
            if (value.length >= 3) formatted += ") " + value.substring(3, 6);
            if (value.length >= 6) formatted += "-" + value.substring(6, 8);
            if (value.length >= 8) formatted += "-" + value.substring(8, 10);
        }
        e.target.value = formatted;
    });
}

// Инициализация Google Sign-In
function initGoogleSignIn(errorEl) {
    if (typeof google === 'undefined' || !google.accounts) {
        console.warn('Google Identity Services not loaded');
        return;
    }

    // Для входа
    const loginContainer = document.getElementById('googleSignInDiv');
    if (loginContainer) {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (response) => handleGoogleSignIn(response, errorEl),
            auto_select: false,
            cancel_on_tap_outside: true
        });

        google.accounts.id.renderButton(loginContainer, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left'
        });
    }

    // Для регистрации
    const registerContainer = document.getElementById('googleSignUpDiv');
    if (registerContainer) {
        google.accounts.id.renderButton(registerContainer, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signup_with',
            shape: 'rectangular',
            logo_alignment: 'left'
        });
    }

    // One Tap prompt
    google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('Google One Tap not displayed');
        }
    });
}

// Обработка ответа от Google
async function handleGoogleSignIn(response, errorEl) {
    try {
        const credential = response.credential;
        const payload = JSON.parse(atob(credential.split('.')[1]));
        
        const userData = {
            id: payload.sub,
            email: payload.email,
            username: payload.name || payload.email.split('@')[0],
            avatar_url: payload.picture || null,
            provider: 'google'
        };

        await googleLogin(userData);
        window.location.href = "profile.html";
    } catch (error) {
        console.error('Google Sign-In error:', error);
        showError(errorEl, "Не удалось войти через Google. Попробуйте снова.");
    }
}

// Валидация регистрации
function validateRegisterForm(username, email, phone, password, confirm) {
    if (!username || !email || !password || !confirm) {
        return "Заполните все обязательные поля";
    }
    if (username.length < 3) return "Имя пользователя минимум 3 символа";
    if (password.length < 6) return "Пароль минимум 6 символов";
    if (password !== confirm) return "Пароли не совпадают";
    return null;
}

document.addEventListener("DOMContentLoaded", async () => {
    const errorEl = document.getElementById('authError');
    
    // Проверка авторизации
    const authenticated = await isAuthenticated();
    if (authenticated) {
        window.location.href = "profile.html";
        return;
    }

    // Настройка табов
    setupTabs();

    // Password toggles
    setupPasswordToggle("loginPasswordInput", "toggleLoginPassword");
    setupPasswordToggle("regPasswordInput", "toggleRegPassword");
    setupPasswordToggle("regConfirmInput", "toggleRegConfirm");

    // Phone formatting
    setupPhoneFormatting("regPhoneInput");

    // Форма входа
    const loginForm = document.getElementById('loginForm');
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearError(errorEl);

        const email = document.getElementById('loginEmailInput')?.value.trim();
        const password = document.getElementById('loginPasswordInput')?.value;
        const remember = document.getElementById('loginRememberMe')?.checked ?? true;

        if (!email || !password) {
            showError(errorEl, "Заполните email и пароль");
            return;
        }

        try {
            await login(email, password, remember);
            window.location.href = "profile.html";
        } catch (error) {
            showError(errorEl, error?.message || "Не удалось войти");
        }
    });

    // Форма регистрации
    const registerForm = document.getElementById('registerForm');
    registerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearError(errorEl);

        const username = document.getElementById('regUsernameInput')?.value.trim();
        const email = document.getElementById('regEmailInput')?.value.trim();
        const phone = document.getElementById('regPhoneInput')?.value.trim();
        const password = document.getElementById('regPasswordInput')?.value;
        const confirm = document.getElementById('regConfirmInput')?.value;
        const agreed = document.getElementById('agreeTerms')?.checked;

        if (!agreed) {
            showError(errorEl, "Согласитесь с условиями использования");
            return;
        }

        const validationError = validateRegisterForm(username, email, phone, password, confirm);
        if (validationError) {
            showError(errorEl, validationError);
            return;
        }

        try {
            await register(email, password, username, phone);
            window.location.href = "profile.html";
        } catch (error) {
            showError(errorEl, error?.message || "Не удалось зарегистрироваться");
        }
    });

    // Инициализация Google
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(() => initGoogleSignIn(errorEl), 100);
    } else {
        window.addEventListener('load', () => initGoogleSignIn(errorEl));
    }
});
