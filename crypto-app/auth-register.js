import { supabase, assertSupabaseConfigOrThrow } from "./auth-supabase-client.js";

function getRedirectTo() {
    const { origin, pathname } = window.location;
    if (!origin || origin === "null") return "profile.html";
    const basePath = pathname.substring(0, pathname.lastIndexOf('/') + 1);
    return `${origin}${basePath}profile.html`;
}

function showError(el, text) {
    if (!el) return;
    el.textContent = text;
    el.style.display = "block";
    el.classList.add("auth-error--visible");
}

function clearError(el) {
    if (!el) return;
    el.textContent = "";
    el.style.display = "none";
    el.classList.remove("auth-error--visible");
}

function showSuccess(el, text) {
    if (!el) return;
    el.textContent = text;
    el.style.display = "block";
}

function showConfirmationMessage(message = "Регистрация прошла успешно! Ссылка для подтверждения отправлена на вашу почту. Пожалуйста, откройте письмо и подтвердите аккаунт.") {
    const successEl = document.getElementById("authSuccess");
    const form = document.getElementById("registerForm");
    if (form) form.style.display = "none";
    if (successEl) {
        showSuccess(successEl, `${message} Если письмо не пришло, проверьте папку «Спам» и подождите 30 секунд.`);
    }
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
        // Update icon
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

function validateForm(username, email, phone, password, confirm) {
    if (!username || !email || !password || !confirm) {
        return "Заполните все обязательные поля";
    }

    if (username.length < 3) {
        return "Имя пользователя должно быть не менее 3 символов";
    }

    if (username.length > 30) {
        return "Имя пользователя не должно превышать 30 символов";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return "Введите корректный email";
    }

    if (password.length < 6) {
        return "Пароль должен быть не менее 6 символов";
    }

    if (password !== confirm) {
        return "Пароли не совпадают";
    }

    return null;
}

document.addEventListener("DOMContentLoaded", async () => {
    const usernameInput = document.getElementById("usernameInput");
    const emailInput = document.getElementById("emailInput");
    const phoneInput = document.getElementById("phoneInput");
    const passwordInput = document.getElementById("passwordInput");
    const confirmInput = document.getElementById("confirmInput");
    const agreeTerms = document.getElementById("agreeTerms");
    const form = document.getElementById("registerForm");
    const errorEl = document.getElementById("authError");

    const googleBtn = document.getElementById("googleOAuthBtn");
    const yandexBtn = document.getElementById("yandexOAuthBtn");

    // Setup password toggles
    setupPasswordToggle("passwordInput", "togglePassword");
    setupPasswordToggle("confirmInput", "toggleConfirm");

    // Setup phone formatting
    setupPhoneFormatting("phoneInput");

    if (!form) return;

    try {
        assertSupabaseConfigOrThrow();
    } catch {
        showError(errorEl, "Заполните `supabase-config.js`, чтобы включить регистрацию.");
        return;
    }

    // Check if already logged in
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) {
        window.location.href = "profile.html";
        return;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearError(errorEl);

        const username = usernameInput?.value.trim() || "";
        const email = emailInput?.value.trim() || "";
        const phone = phoneInput?.value.trim() || "";
        const password = passwordInput?.value || "";
        const confirm = confirmInput?.value || "";
        const agreed = agreeTerms?.checked || false;

        // Check terms
        if (!agreed) {
            showError(errorEl, "Необходимо согласиться с условиями использования");
            return;
        }

        // Validate
        const validationError = validateForm(username, email, phone, password, confirm);
        if (validationError) {
            showError(errorEl, validationError);
            return;
        }

        // Register with Supabase
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                    phone,
                },
            },
        });

        if (error) {
            const message = String(error.message || "Не удалось зарегистрироваться.");
            const rateLimitMessage =
                "Письмо подтверждения уже отправлялось. Проверьте почту, папку «Спам» и подождите 30 секунд перед новой попыткой.";
            if (message.toLowerCase().includes("email rate limit")) {
                showConfirmationMessage(rateLimitMessage);
                const submitButton = form.querySelector("button[type='submit']");
                if (submitButton) {
                    submitButton.disabled = true;
                    setTimeout(() => { submitButton.disabled = false; }, 30000);
                }
                return;
            }
            showError(errorEl, message);
            return;
        }

        // Check if session is active immediately
        const { data: afterSession } = await supabase.auth.getSession();
        if (afterSession.session) {
            // Registration successful and session created
            window.location.href = "profile.html";
        } else {
            // Email confirmation required
            showConfirmationMessage();
        }
    });

    async function oauth(provider) {
        clearError(errorEl);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: { redirectTo: getRedirectTo() },
            });
            if (error) showError(errorEl, error.message || "OAuth ошибка.");
        } catch (err) {
            showError(errorEl, err?.message || "OAuth ошибка.");
        }
    }

    googleBtn?.addEventListener("click", () => oauth("google"));
    yandexBtn?.addEventListener("click", () => oauth("yandex"));
});

