import {
    getCurrentUser,
    logout,
    getFavorites
} from "./auth-client.js";
import { supabase } from "./auth-supabase-client.js";

function $(id) {
    return document.getElementById(id);
}

function setLoading(loadingEl, isLoading) {
    if (!loadingEl) return;
    loadingEl.style.display = isLoading ? "block" : "none";
}

function showError(errorEl, text) {
    if (!errorEl) return;
    errorEl.textContent = text;
    errorEl.style.display = "block";
}

function hideError(errorEl) {
    if (!errorEl) return;
    errorEl.textContent = "";
    errorEl.style.display = "none";
}

function renderUser(user) {
    const userEmail = $("userEmail");
    const userProvider = $("userProvider");
    const userIdEl = $("userId");
    const userDisplayName = $("userDisplayName");
    const userEmailDisplay = $("userEmailDisplay");
    const userFirstName = $("userFirstName");
    const userLastName = $("userLastName");
    const userJoinDate = $("userJoinDate");
    const logoutBtn = $("logoutBtn");

    // Email
    if (userEmail) userEmail.textContent = user.email || "—";
    if (userEmailDisplay) userEmailDisplay.textContent = user.email || "email@example.com";
    
    // Display name (full name or email prefix)
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || "Пользователь";
    if (userDisplayName) userDisplayName.textContent = fullName;
    
    // First and Last name
    const nameParts = fullName.split(' ');
    if (userFirstName) userFirstName.textContent = nameParts[0] || "—";
    if (userLastName) userLastName.textContent = nameParts.slice(1).join(' ') || "—";
    
    // User ID (shortened)
    if (userIdEl) userIdEl.textContent = user.id ? user.id.substring(0, 8) + "..." : "—";
    
    // Provider
    const provider = user.app_metadata?.provider || "email";
    const providerNames = { email: "Email", google: "Google", github: "GitHub" };
    if (userProvider) userProvider.textContent = providerNames[provider] || provider;
    
    // Join date
    if (userJoinDate && user.created_at) {
        const date = new Date(user.created_at);
        userJoinDate.textContent = date.toLocaleDateString('ru-RU');
    } else if (userJoinDate) {
        userJoinDate.textContent = new Date().toLocaleDateString('ru-RU');
    }
    
    // Show logout button
    if (logoutBtn) logoutBtn.style.display = "flex";
}

async function renderFavorites() {
    const container = $("userFavorites");
    const favoritesCountEl = $("userFavoritesCount");
    
    try {
        const data = await getFavorites();
        const count = data.success && data.favorites ? data.favorites.length : 0;
        
        // Update count in profile stats
        if (favoritesCountEl) favoritesCountEl.textContent = count;
        
        if (container) {
            if (count > 0) {
                container.innerHTML = data.favorites.map(f => `
                    <div class="favorite-item">
                        <span class="favorite-symbol">${f.coin_symbol || f.coin_id}</span>
                        <span class="favorite-name">${f.coin_name || ''}</span>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<p class="text-muted">Нет избранных монет</p>';
            }
        }
    } catch (err) {
        if (container) container.innerHTML = '<p class="text-error">Не удалось загрузить избранное</p>';
        console.log("Favorites error:", err);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const logoutBtn = $("logoutBtn");
    const errorEl = $("authError");
    const loadingEl = $("profileLoading");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            try {
                await logout();
                window.location.href = "index.html";
            } catch (err) {
                console.error("Logout error:", err);
            }
        });
    }

    // Таймаут на случай если запрос завис
    const timeoutId = setTimeout(() => {
        setLoading(loadingEl, false);
        showError(errorEl, "Таймаут загрузки. Проверьте подключение к серверу или перезагрузите страницу.");
    }, 8000);

    async function refresh() {
        setLoading(loadingEl, true);
        hideError(errorEl);

        try {
            const data = await getCurrentUser();
            clearTimeout(timeoutId);
            
            if (!data.success || !data.user) {
                setLoading(loadingEl, false);
                showError(errorEl, "Вы не вошли. Перейдите на страницу входа.");
                // Show empty state
                const displayName = $("userDisplayName");
                if (displayName) displayName.textContent = "Гость";
                return;
            }

            renderUser(data.user);
            try {
                await renderFavorites();
            } catch (favErr) {
                console.log("Favorites error:", favErr);
            }
            setLoading(loadingEl, false);
        } catch (err) {
            clearTimeout(timeoutId);
            setLoading(loadingEl, false);
            showError(errorEl, "Ошибка: " + (err.message || "Не удалось загрузить профиль"));
            console.error("Profile load error:", err);
        }
    }

    await refresh();
});

