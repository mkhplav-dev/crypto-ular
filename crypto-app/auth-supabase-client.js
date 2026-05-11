import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabase-config.js";

function hasPlaceholders() {
    return (
        !SUPABASE_URL ||
        SUPABASE_URL.includes("YOUR_PROJECT") ||
        !SUPABASE_ANON_KEY ||
        SUPABASE_ANON_KEY.includes("YOUR_SUPABASE")
    );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        // Для корректной обработки редиректа после OAuth (Google/Yandex).
        detectSessionInUrl: true,
        flowType: "pkce",
    },
});

export function assertSupabaseConfigOrThrow() {
    if (hasPlaceholders()) {
        const err = new Error(
            "Supabase не настроен: заполните `supabase-config.js` (SUPABASE_URL / SUPABASE_ANON_KEY)."
        );
        // Плюс показываем предупреждение в консоли, чтобы было проще диагностировать.
        console.warn(err.message);
        throw err;
    }
}

