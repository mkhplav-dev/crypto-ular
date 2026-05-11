-- База данных SQLite для крипто-приложения
-- Запуск: sqlite3 crypto_app.db < database.sql

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,  -- хешированный пароль (bcrypt), NULL для OAuth
    username TEXT,
    phone TEXT,
    google_id TEXT UNIQUE,         -- для OAuth Google
    yandex_id TEXT UNIQUE,         -- для OAuth Yandex
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Таблица избранных монет пользователя
CREATE TABLE IF NOT EXISTS user_favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    coin_id TEXT NOT NULL,         -- ID монеты из CoinGecko (bitcoin, ethereum...)
    coin_symbol TEXT,              -- символ (BTC, ETH...)
    coin_name TEXT,                -- название
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, coin_id)
);

-- Таблица сессий (для remember me)
CREATE TABLE IF NOT EXISTS user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Таблица для алертов (уведомлений о цене)
CREATE TABLE IF NOT EXISTS price_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    coin_id TEXT NOT NULL,
    target_price REAL NOT NULL,
    condition TEXT CHECK(condition IN ('above', 'below')) DEFAULT 'above',
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    triggered_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_yandex ON users(yandex_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
