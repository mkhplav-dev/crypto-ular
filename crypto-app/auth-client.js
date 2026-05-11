/**
 * Supabase Auth Client
 * Взаимодействие с Supabase для аутентификации
 */

import { supabase } from "./auth-supabase-client.js";

function getRedirectTo() {
    const { origin, pathname } = window.location;
    if (!origin || origin === "null") return "auth.html";
    const basePath = pathname.substring(0, pathname.lastIndexOf('/') + 1);
    // OAuth callback should return to auth.html to handle the code
    return `${origin}${basePath}auth.html`;
}

/**
 * Получить текущего пользователя
 */
export async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { success: true, user };
}

/**
 * Регистрация
 */
export async function register(email, password, username = '', firstName = '', lastName = '') {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: getRedirectTo().replace('auth.html', 'profile.html'), // Email confirmation goes to profile
            data: {
                username,
                first_name: firstName,
                last_name: lastName,
            },
        },
    });

    if (error) {
        return { success: false, error };
    }

    return { success: true, data };
}

/**
 * Вход
 */
export async function login(email, password, remember = true) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { success: false, error };
    }

    if (!remember) {
        await supabase.auth.setSession({
            access_token: data.session?.access_token,
            refresh_token: data.session?.refresh_token,
        });
    }

    return { success: true, data };
}

/**
 * Войти через OAuth провайдера
 */
export async function signInWithProvider(provider) {
    return supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: getRedirectTo() },
    });
}

/**
 * Выход
 */
export async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
}

/**
 * Получить избранные монеты (из localStorage)
 */
export async function getFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    return { success: true, favorites };
}

/**
 * Добавить в избранное
 */
export async function addFavorite(coinId, coinSymbol, coinName) {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (!favorites.find(f => f.coin_id === coinId)) {
        favorites.push({ coin_id: coinId, coin_symbol: coinSymbol, coin_name: coinName });
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
    return { success: true };
}

/**
 * Удалить из избранного
 */
export async function removeFavorite(coinId) {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const filtered = favorites.filter(f => f.coin_id !== coinId);
    localStorage.setItem('favorites', JSON.stringify(filtered));
    return { success: true };
}

/**
 * Проверка авторизации
 */
export async function isAuthenticated() {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
}
