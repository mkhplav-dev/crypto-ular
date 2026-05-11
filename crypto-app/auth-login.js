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

document.addEventListener("DOMContentLoaded", async () => {
    const emailInput = document.getElementById("emailInput");
    const passwordInput = document.getElementById("passwordInput");
    const rememberMe = document.getElementById("rememberMe");
    const form = document.getElementById("loginForm");
    const errorEl = document.getElementById("authError");

    const googleBtn = document.getElementById("googleOAuthBtn");
    const yandexBtn = document.getElementById("yandexOAuthBtn");

    // Setup password toggle
    setupPasswordToggle("passwordInput", "togglePassword");

    if (!form) return;

    try {
        assertSupabaseConfigOrThrow();
    } catch {
        showError(errorEl, "Заполните `supabase-config.js`, чтобы включить вход.");
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
        showError(errorEl, "");

        const email = emailInput?.value.trim() || "";
        const password = passwordInput?.value || "";
        const remember = rememberMe?.checked ?? true;

        if (!email || !password) {
            showError(errorEl, "Заполните email и пароль.");
            return;
        }

        const { error } = await supabase.auth.signInWithPassword({ 
            email, 
            password,
        });
        
        if (error) {
            showError(errorEl, error.message || "Не удалось войти.");
            return;
        }

        // If remember me is not checked, use session-only persistence
        if (!remember) {
            await supabase.auth.setSession({
                access_token: (await supabase.auth.getSession()).data.session?.access_token,
                refresh_token: (await supabase.auth.getSession()).data.session?.refresh_token,
            });
        }

        window.location.href = "profile.html";
    });

    async function oauth(provider) {
        showError(errorEl, "");
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

