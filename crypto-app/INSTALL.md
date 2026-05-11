# ПОЛНАЯ ИНСТРУКЦИЯ: Настройка PHP + SQL бэкенда для Crypto App

## Содержание
1. [Проверка требований](#1-проверка-требований)
2. [Установка и настройка](#2-установка-и-настройка)
3. [Создание базы данных](#3-создание-базы-данных)
4. [Настройка веб-сервера](#4-настройка-веб-сервера)
5. [Проверка работы](#5-проверка-работы)
6. [Настройка OAuth Google](#6-настройка-oauth-google)
7. [Настройка OAuth Yandex](#7-настройка-oauth-yandex)
8. [Решение проблем](#8-решение-проблем)

---

## 1. Проверка требований

### Необходимое ПО:
- ✅ PHP 7.4 или выше (желательно 8.0+)
- ✅ SQLite 3 (обычно встроен в PHP)
- ✅ Веб-браузер

### Проверка PHP:
Откройте командную строку (CMD) и выполните:

```cmd
php --version
```

Должно показать что-то вроде:
```
PHP 8.1.0 (cli) (built: Nov 23 2021)
```

Если PHP не установлен:
1. Скачайте: https://windows.php.net/download/
2. Распакуйте в `C:\php`
3. Добавьте в системную переменную PATH: `C:\php`
4. Перезапустите CMD и проверьте `php --version`

### Проверка расширений PHP:

```cmd
php -m | findstr sqlite
```

Должно показать:
```
pdo_sqlite
sqlite3
```

Если нет — откройте `C:\php\php.ini` (или создайте копию `php.ini-development` как `php.ini`) и раскомментируйте:
```ini
extension=pdo_sqlite
extension=sqlite3
extension=curl
extension=openssl
```

---

## 2. Установка и настройка

### Шаг 2.1: Перейдите в папку проекта

```cmd
cd c:\Users\Мугалим\Desktop\crypto-app
```

### Шаг 2.2: Создайте базу данных

**Способ A — Через командную строку (если есть sqlite3):**

```cmd
sqlite3 crypto_app.db < database.sql
```

**Способ B — Автоматически через PHP:**

Создайте файл `init_db.php` в папке проекта:

```php
<?php
require_once __DIR__ . '/api/config.php';
echo "База данных создана!\n";
```

И выполните:
```cmd
php init_db.php
```

**Способ C — Вручную:**

1. Создайте пустой файл `crypto_app.db` в папке `crypto-app/`
2. Выполните SQL из файла `database.sql` через любой SQLite менеджер

### Шаг 2.3: Проверьте права доступа

Убедитесь что папка `crypto-app` доступна для записи:
- Windows: права должны быть по умолчанию
- Если ошибка — запускайте от имени администратора

---

## 3. Создание базы данных

### Структура базы данных уже создана в файле `database.sql`:

```sql
-- Основные таблицы:
-- 1. users - пользователи
-- 2. user_favorites - избранные монеты
-- 3. user_sessions - сессии
-- 4. price_alerts - уведомления о ценах
```

### Проверка базы:

```cmd
sqlite3 crypto_app.db ".tables"
```

Должно показать:
```
price_alerts  user_favorites  user_sessions  users
```

### Проверка структуры:

```cmd
sqlite3 crypto_app.db ".schema users"
```

---

## 4. Настройка веб-сервера

### Вариант A: Встроенный PHP сервер (РЕКОМЕНДУЕТСЯ для разработки)

**Шаг 4.1.1:** Откройте командную строку и перейдите в папку:

```cmd
cd c:\Users\Мугалим\Desktop\crypto-app
```

**Шаг 4.1.2:** Запустите сервер:

```cmd
php -S localhost:8080
```

Вы увидите:
```
PHP 8.1.0 Development Server started
Listening on http://localhost:8080
```

**Шаг 4.1.3:** Откройте браузер:

```
http://localhost:8080
```

⚠️ **Не закрывайте командную строку!** Сервер работает пока окно открыто.

### Вариант B: XAMPP

**Шаг 4.2.1:** Скачайте и установите XAMPP: https://www.apachefriends.org/

**Шаг 4.2.2:** Скопируйте папку `crypto-app` в:
```
C:\xampp\htdocs\crypto-app
```

**Шаг 4.2.3:** Откройте XAMPP Control Panel

**Шаг 4.2.4:** Нажмите **Start** на Apache

**Шаг 4.2.5:** Откройте в браузере:
```
http://localhost/crypto-app/
```

### Вариант C: OpenServer

**Шаг 4.3.1:** Установите OpenServer

**Шаг 4.3.2:** Поместите папку `crypto-app` в:
```
C:\OpenServer\domains\localhost\crypto-app
```

**Шаг 4.3.3:** Запустите OpenServer и откройте:
```
http://localhost/crypto-app/
```

---

## 5. Проверка работы

### Тест 1: Проверка API

Откройте в браузере:
```
http://localhost:8080/api/me.php
```

Должно показать:
```json
{"success":false,"error":"Не авторизован"}
```

Это нормально — значит API работает!

### Тест 2: Проверка главной страницы

1. Откройте `http://localhost:8080`
2. Должно появиться модальное окно входа
3. Нажмите "Зарегистрироваться"
4. Заполните форму:
   - Email: `test@test.com`
   - Пароль: `123456`
   - Подтвердите пароль: `123456`
5. Нажмите "Зарегистрироваться"
6. Должно появиться сообщение об успехе

### Тест 3: Проверка входа

1. Выйдите (если вошли)
2. Введите email и пароль
3. Нажмите "Войти"
4. Должно перейти на страницу профиля

### Тест 4: Проверка профиля

Откройте:
```
http://localhost:8080/profile.html
```

Должны отобразиться данные пользователя.

---

## 6. Настройка OAuth Google

### Шаг 6.1: Создание проекта в Google Cloud

1. Перейдите: https://console.cloud.google.com/
2. Войдите в Google аккаунт
3. Нажмите **Create Project** (создать проект)
4. Название: `Crypto App`
5. Нажмите **Create**

### Шаг 6.2: Настройка OAuth

1. Перейдите в **APIs & Services** → **OAuth consent screen**
2. Выберите **External** (для тестирования)
3. Нажмите **Create**
4. Заполните:
   - App name: `Crypto App`
   - User support email: ваш email
   - Developer contact email: ваш email
5. Нажмите **Save and Continue**
6. На вкладке **Scopes** нажмите **Save and Continue**
7. На вкладке **Test users** добавьте свой email
8. Нажмите **Save and Continue**

### Шаг 6.3: Создание credentials

1. Перейдите в **APIs & Services** → **Credentials**
2. Нажмите **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `Crypto App Web`
5. Authorized redirect URIs:
   - Добавьте: `http://localhost:8080/oauth/google/callback.php`
   - Если используете XAMPP: `http://localhost/crypto-app/oauth/google/callback.php`
6. Нажмите **Create**

### Шаг 6.4: Получение ключей

После создания вы увидите:
- **Client ID** (например: `123456789-abc123.apps.googleusercontent.com`)
- **Client Secret** (например: `GOCSPX-xyz123`)

**ВАЖНО:** Сохраните эти значения!

### Шаг 6.5: Настройка в проекте

Откройте файл `api/config.php` и замените:

```php
// Было:
define('GOOGLE_CLIENT_ID', 'YOUR_GOOGLE_CLIENT_ID');
define('GOOGLE_CLIENT_SECRET', 'YOUR_GOOGLE_CLIENT_SECRET');
define('GOOGLE_REDIRECT_URI', 'http://localhost/crypto-app/oauth/google/callback.php');

// Стало (ваши реальные значения):
define('GOOGLE_CLIENT_ID', '123456789-abc123.apps.googleusercontent.com');
define('GOOGLE_CLIENT_SECRET', 'GOCSPX-xyz123');
define('GOOGLE_REDIRECT_URI', 'http://localhost:8080/oauth/google/callback.php');
```

⚠️ **URI должен точно совпадать** с тем что указан в Google Cloud!

### Шаг 6.6: Тестирование

1. Перезапустите PHP сервер (Ctrl+C, затем снова `php -S localhost:8080`)
2. Откройте главную страницу
3. Нажмите "Войти с Google"
4. Должно открыться окно Google для выбора аккаунта
5. После выбора аккаунта — редирект на профиль

---

## 7. Настройка OAuth Yandex

### Шаг 7.1: Создание приложения

1. Перейдите: https://oauth.yandex.com/
2. Войдите в Яндекс аккаунт
3. Нажмите **Создать приложение**

### Шаг 7.2: Настройка приложения

**Название:** `Crypto App`

**Платформы:**
- Выберите **Веб-сервисы**

**Callback URL:**
```
http://localhost:8080/oauth/yandex/callback.php
```
(или для XAMPP: `http://localhost/crypto-app/oauth/yandex/callback.php`)

**Доступы:**
- ✅ Доступ к email
- ✅ Доступ к аватару

Нажмите **Создать приложение**

### Шаг 7.3: Получение ключей

После создания:
1. Перейдите в настройки приложения
2. Вы увидите:
   - **ClientID** (например: `a1b2c3d4e5f6`)
   - **Client secret** (нажмите "Показать", например: `a1b2c3d4e5f6g7h8i9`)

### Шаг 7.4: Настройка в проекте

Откройте `api/config.php` и замените:

```php
// Было:
define('YANDEX_CLIENT_ID', 'YOUR_YANDEX_CLIENT_ID');
define('YANDEX_CLIENT_SECRET', 'YOUR_YANDEX_CLIENT_SECRET');
define('YANDEX_REDIRECT_URI', 'http://localhost/crypto-app/oauth/yandex/callback.php');

// Стало:
define('YANDEX_CLIENT_ID', 'a1b2c3d4e5f6');
define('YANDEX_CLIENT_SECRET', 'a1b2c3d4e5f6g7h8i9');
define('YANDEX_REDIRECT_URI', 'http://localhost:8080/oauth/yandex/callback.php');
```

### Шаг 7.5: Тестирование

1. Перезапустите сервер
2. Нажмите "Войти с Яндекс"
3. Подтвердите доступ
4. Должно перейти на профиль

---

## 8. Решение проблем

### Проблема: "Database connection failed"

**Причины:**
- Нет прав на запись
- Нет расширения pdo_sqlite

**Решение:**
```cmd
# Проверьте расширения
php -m | findstr sqlite

# Если пусто — отредактируйте php.ini
```

### Проблема: "CORS error" в консоли браузера

**Причина:** Разные порты или домены

**Решение:**
Откройте `api/config.php` и добавьте ваш origin:

```php
$allowed_origins = [
    'http://localhost',
    'http://127.0.0.1',
    'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost:5500',  // Добавьте если нужно
];
```

### Проблема: "redirect_uri_mismatch" в Google

**Причина:** URI в коде не совпадает с настройками Google

**Решение:**
1. Проверьте в Google Cloud Console exact URI
2. Проверьте в `config.php` exact тот же URI
3. Обратите внимание на:
   - http vs https
   - порт (:8080)
   - наличие / в конце

### Проблема: После входа редиректит на index.html вместо profile.html

**Причина:** Путь в JavaScript

**Решение:**
Проверьте в `auth-index.js`:
```javascript
// Должно быть:
window.location.href = "profile.html";
// А не:
window.location.href = "/profile.html";
```

### Проблема: "Cannot POST /api/register.php" 404

**Причина:** Неверный путь к API

**Решение:**
Проверьте файл `auth-client.js`:
```javascript
const API_BASE_URL = '/crypto-app/api';  // Если в подпапке
// или
const API_BASE_URL = '/api';  // Если в корне
```

### Проблема: Сессия не сохраняется после обновления страницы

**Причина:** Cookies не работают

**Решение:**
1. Проверьте что используете http://localhost (не file://)
2. Откройте DevTools → Application → Cookies
3. Должна быть cookie с именем `crypto_session`
4. Проверьте время жизни cookie

### Проблема: "password_verify failed"

**Причина:** Пароль хеширован с другой солью

**Решение:**
Пересоздайте базу данных:
```cmd
del crypto_app.db
sqlite3 crypto_app.db < database.sql
```

И зарегистрируйтесь заново.

---

## Чеклист для проверки

После настройки проверьте:

- [ ] PHP установлен и работает
- [ ] База данных создана (`crypto_app.db` существует)
- [ ] Встроенный сервер запущен (`php -S localhost:8080`)
- [ ] Главная страница открывается
- [ ] Модальное окно появляется
- [ ] Регистрация работает
- [ ] Вход работает
- [ ] Профиль открывается
- [ ] Выход работает
- [ ] Избранное сохраняется (если реализовано)
- [ ] OAuth Google работает (опционально)
- [ ] OAuth Yandex работает (опционально)

---

## Быстрая команда для старта

Создайте файл `start.bat` в папке проекта:

```bat
@echo off
cd /d "%~dp0"
echo Starting PHP server on http://localhost:8080
echo Press Ctrl+C to stop
php -S localhost:8080
pause
```

Двойной клик — и сервер запущен!

---

**Готово!** Теперь у вас полноценный бэкенд на PHP с SQLite базой данных, OAuth входом и управлением сессиями.

Если что-то не работает — проверьте консоль браузера (F12 → Console) и логи PHP сервера (командная строка).
