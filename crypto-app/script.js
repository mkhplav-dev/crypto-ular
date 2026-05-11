

const CONFIG = {
    // Binance API для основных данных
    BINANCE_API: 'https://api.binance.com/api/v3',
    // Кыргызские крипто-сайты
    KYRGYZ_SITES: {
        netex: 'https://netex.kg/ru/main/home',
        xbt: 'https://xbt.kg/',
    },
    REFRESH_INTERVAL: 60000,
    PRICE_ALERT_THRESHOLD: 5,
    MA_PERIOD: 7,
    // Top 100 coin symbols для отслеживания
    TOP_SYMBOLS: [
        'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'SOLUSDT',
        'ADAUSDT', 'DOGEUSDT', 'MATICUSDT', 'LINKUSDT', 'AVAXUSDT',
        'TRXUSDT', 'LTCUSDT', 'TONUSDT', 'USDCUSDT', 'FDUSDUSDT',
        'SUIUSDT', 'XTZUSDT', 'ATOMUSDT', 'MANAUSDT', 'FLOWUSDT',
        'ARBUSDT', 'OPTIMUSDT', 'INJUSDT', 'FILECOINUSDT', 'SHIUSDT'
    ],
};

const state = {
    coins: [],
    filteredCoins: [],
    favorites: new Set(JSON.parse(localStorage.getItem('crypto-favorites') || '[]')),
    sortField: 'market_cap_rank',
    sortDirection: 'asc',
    filterMode: 'all',
    searchQuery: '',
    priceHistory: {},
    previousPrices: {},
    lastUpdate: null,
    lang: localStorage.getItem('crypto-lang') || 'ru',
    tickerPaused: false,
};


const I18N = {
    ru: {
        brand_badge: 'Инсайты',
        nav_overview: 'Обзор',
        nav_charts: 'Графики',
        nav_portfolio: 'Портфель',
        nav_about: 'О сайте',
        about_badge: 'О проекте',
        nav_markets: 'Рынок',
        nav_products: 'Продукты',
        nav_faq: 'Справка',
        hero_eyebrow: 'Данные уровня research · Binance + ForkLog + Локальные источники',
        hero_title_html:
            'Крипто-аналитика <span class="hero__gradient">для команд</span>',
        hero_subtitle:
            'Интерфейс в стиле ведущих crypto-платформ: чистая структура, market intelligence, real-time метрики и продвинутая аналитика.',
        hero_cta_markets: 'Исследовать рынок',
        hero_cta_analytics: 'Открыть аналитику',
        hero_chip_live: 'Живые обновления',
        hero_chip_chart: 'Chart.js',
        hero_chip_alerts: 'Алерты по цене',
        analytics_eyebrow: 'Продвинутая аналитика',
        analytics_title: 'График и прогноз',
        live_badge: 'В реальном времени',
        features_eyebrow: 'Сделано как настоящий продукт',
        feature_api_title: 'Живой Market API',
        feature_models_title: 'Прогностические модели',
        feature_terminal_title: 'UX уровня терминала',
        search_placeholder: 'Поиск по названию или тикеру...',
        meta_description:
            'CryptoUlarbek — крипто-аналитика: графики, прогнозы, избранное и живые обновления.',
        title: 'CryptoUlarbek — Аналитика криптовалют',
    },
    en: {
        brand_badge: 'Insights',
        nav_overview: 'Overview',
        nav_charts: 'Charts',
        nav_portfolio: 'Portfolio',
        nav_about: 'About',
        about_badge: 'About Project',
        nav_markets: 'Markets',
        nav_products: 'Products',
        nav_faq: 'FAQ',
        hero_eyebrow: 'Research-grade data · Binance + ForkLog + Local sources',
        hero_title_html:
            'Crypto intelligence <span class="hero__gradient">for modern teams</span>',
        hero_subtitle:
            'An interface inspired by leading crypto platforms: clear market intelligence, real-time metrics and predictive views.',
        hero_cta_markets: 'Explore markets',
        hero_cta_analytics: 'Open analytics',
        hero_chip_live: 'Live updates',
        hero_chip_chart: 'Chart.js',
        hero_chip_alerts: 'Price alerts',
        analytics_eyebrow: 'Advanced analytics',
        analytics_title: 'Price chart & forecast',
        live_badge: 'Live',
        features_eyebrow: 'Built like a real product',
        feature_api_title: 'Live Market API',
        feature_models_title: 'Predictive Models',
        feature_terminal_title: 'Terminal-grade UX',
        search_placeholder: 'Search by name or ticker...',
        meta_description:
            'CryptoUlarbek — crypto intelligence: charts, forecasts, favorites and live updates.',
        title: 'CryptoUlarbek — Crypto Analytics',
    },
    ky: {
        brand_badge: 'Түшүндүрмөлөр',
        nav_overview: 'Карап чыгуу',
        nav_charts: 'Графиктер',
        nav_portfolio: 'Портфель',
        nav_about: 'Сайт жөнүндө',
        about_badge: 'Долбоор жөнүндө',
        nav_markets: 'Рынок',
        nav_products: 'Продукттар',
        nav_faq: 'Суроо-Жооп',
        hero_eyebrow: 'Изилдөө деңгээлиндеги маалымат · Binance + ForkLog + Жергиликтүү булактар',
        hero_title_html:
            'Крипто-аналитика <span class="hero__gradient">топторго</span>',
        hero_subtitle:
            'Ведущий крипто-платформалар стилиндеги интерфейс: таза түзүлүш, рынок аналитикасы, реалдүу убакыт көрсөтмөлөрү жана өнөктөө аналитика.',
        hero_cta_markets: 'Рынокту изилдөө',
        hero_cta_analytics: 'Аналитиканы ачуу',
        hero_chip_live: 'Тирүү жаңыланууттар',
        hero_chip_chart: 'Chart.js',
        hero_chip_alerts: 'Баа сигналдары',
        analytics_eyebrow: 'Өнөктөө аналитика',
        analytics_title: 'График жана прогноз',
        live_badge: 'Реалдүү убакыт',
        features_eyebrow: 'Чыныгы продукт сымса жасалган',
        feature_api_title: 'Тирүү Market API',
        feature_models_title: 'Пролептик моделдер',
        feature_terminal_title: 'Терминал деңгээли UX',
        search_placeholder: 'Аты же тикер боюнча издөө...',
        meta_description:
            'CryptoUlarbek — крипто-аналитика: графиктер, прогнозор, сүргүлтүүлөр жана тирүү жаңыланууттар.',
        title: 'CryptoUlarbek — Крипто валютасы аналитикасы',
    },
};

function applyLanguage(lang) {
    const langs = ['ru', 'en', 'ky'];
    const l = langs.includes(lang) ? lang : 'ru';
    state.lang = l;
    localStorage.setItem('crypto-lang', l);

    document.documentElement.lang = l;

    // HTML-тексты (h1)
    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
        const key = el.dataset.i18nHtml;
        if (key && I18N[l][`${key}_html`]) {
            el.innerHTML = I18N[l][`${key}_html`];
        }
    });

    // Обычные текстовые элементы
    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.dataset.i18n;
        if (key && I18N[l][key] != null) {
            // If element has a span child, update the span's textContent
            const span = el.querySelector('span');
            if (span) {
                span.textContent = I18N[l][key];
            } else {
                el.textContent = I18N[l][key];
            }
        }
    });

    const meta = document.querySelector('meta[name=\"description\"]');
    if (meta) meta.setAttribute('content', I18N[l].meta_description);
    document.title = I18N[l].title;

    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.placeholder = I18N[l].search_placeholder;

    // Update lang-btn active states
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === l);
    });
}

// Global function for onclick handlers
function setLang(lang) {
    applyLanguage(lang);
}

/* ========== API с поддержкой Binance, ForkLog и локальных источников ========== */
const Api = {
    // Преобразование между символами и ID для совместимости
    symbolToId: {
        BTCUSDT: 'bitcoin', ETHUSDT: 'ethereum', BNBUSDT: 'binancecoin',
        XRPUSDT: 'ripple', SOLUSDT: 'solana', ADAUSDT: 'cardano',
        DOGEUSDT: 'dogecoin', MATICUSDT: 'polygon', LINKUSDT: 'chainlink',
        AVAXUSDT: 'avalanche', TRXUSDT: 'tron', LTCUSDT: 'litecoin',
        TONUSDT: 'the-open-network', USDCUSDT: 'usd-coin', FDUSDUSDT: 'first-digital-usd',
        SUIUSDT: 'sui', XTZUSDT: 'tezos', ATOMUSDT: 'cosmos', MANAUSDT: 'decentraland',
        FLOWUSDT: 'flow', ARBUSDT: 'arbitrum', OPTIMUSDT: 'optimism', INJUSDT: 'injective',
        FILECOINUSDT: 'filecoin', SHIUSDT: 'shiba-inu'
    },

    idToSymbol: null, // инициализируется из symbolToId

    // Получить данные о монетах из Binance
    async fetchCoins(limit = 100) {
        try {
            // Получить 24-часовые изменения цен
            const tickers = await fetch(`${CONFIG.BINANCE_API}/ticker/24hr`).then(r => r.json());
            
            // Получить информацию о торговых парах для расчета маркет-капа
            const exchangeInfo = await fetch(`${CONFIG.BINANCE_API}/exchangeInfo`).then(r => r.json());
            
            // Фильтруем только нужные торговые пары
            let filteredTickers = tickers
                .filter(t => t.symbol.endsWith('USDT') && CONFIG.TOP_SYMBOLS.includes(t.symbol))
                .sort((a, b) => parseFloat(b.quoteAssetVolume) - parseFloat(a.quoteAssetVolume))
                .slice(0, limit);

            // Если фильтр вернул пустой результат, берем топ по объему из всех USDT пар
            if (filteredTickers.length === 0) {
                filteredTickers = tickers
                    .filter(t => t.symbol.endsWith('USDT'))
                    .sort((a, b) => parseFloat(b.quoteAssetVolume) - parseFloat(a.quoteAssetVolume))
                    .slice(0, 20);
            }

            // Преобразуем в формат, совместимый с приложением
            const coins = filteredTickers.map((ticker, index) => {
                const symbol = ticker.symbol.replace('USDT', '').toLowerCase();
                const id = this.symbolToId[ticker.symbol] || symbol;
                const price = parseFloat(ticker.lastPrice);
                const change24h = parseFloat(ticker.priceChangePercent);
                const volume = parseFloat(ticker.quoteAssetVolume);

                return {
                    id: id,
                    symbol: symbol,
                    name: this.getFullName(id),
                    current_price: price,
                    price_change_percentage_24h: change24h,
                    total_volume: volume,
                    market_cap: volume * 10 || 1000000, // Примерная оценка или минимум 1M
                    market_cap_rank: index + 1,
                    image: `https://assets.coingecko.com/coins/images/1/small/${symbol}.png`,
                    sparkline_in_7d: { price: [price] } // Плейсхолдер
                };
            });

            console.log('✓ Данные загружены из Binance:', coins.length, 'монет');
            return coins;
        } catch (error) {
            console.error('❌ Ошибка загрузки из Binance:', error);
            return this.getMockCoins();
        }
    },

    // Получить полное имя монеты по ID
    getFullName(id) {
        const names = {
            'bitcoin': 'Bitcoin',
            'ethereum': 'Ethereum',
            'binancecoin': 'BNB',
            'ripple': 'XRP',
            'solana': 'Solana',
            'cardano': 'Cardano',
            'dogecoin': 'Dogecoin',
            'polygon': 'Polygon',
            'chainlink': 'Chainlink',
            'avalanche': 'Avalanche',
            'tron': 'TRON',
            'litecoin': 'Litecoin',
            'the-open-network': 'Ton',
            'usd-coin': 'USDC',
            'first-digital-usd': 'FDUSD',
            'sui': 'Sui',
            'tezos': 'Tezos',
            'cosmos': 'Cosmos',
            'decentraland': 'Decentraland',
            'flow': 'Flow',
            'arbitrum': 'Arbitrum',
            'optimism': 'Optimism',
            'injective': 'Injective',
            'filecoin': 'Filecoin',
            'shiba-inu': 'Shiba Inu'
        };
        return names[id] || id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    },

    getMockCoins() {
        // Мок-данные для демонстрации
        const coins = [
            { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 64231.42, price_change_percentage_24h: 2.34, market_cap: 1265000000000, total_volume: 34500000000, sparkline_in_7d: { price: [63000, 63500, 64231] } },
            { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 3456.78, price_change_percentage_24h: -1.23, market_cap: 415000000000, total_volume: 15600000000, sparkline_in_7d: { price: [3500, 3480, 3456] } },
            { id: 'tether', symbol: 'usdt', name: 'Tether', current_price: 1.00, price_change_percentage_24h: 0.01, market_cap: 95000000000, total_volume: 52000000000, sparkline_in_7d: { price: [1, 1, 1] } },
            { id: 'binancecoin', symbol: 'bnb', name: 'BNB', current_price: 567.89, price_change_percentage_24h: 3.45, market_cap: 85000000000, total_volume: 1200000000, sparkline_in_7d: { price: [550, 558, 567] } },
            { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 145.67, price_change_percentage_24h: 5.67, market_cap: 65000000000, total_volume: 2800000000, sparkline_in_7d: { price: [138, 141, 145] } },
            { id: 'cardano', symbol: 'ada', name: 'Cardano', current_price: 0.456, price_change_percentage_24h: -2.34, market_cap: 16000000000, total_volume: 450000000, sparkline_in_7d: { price: [0.467, 0.461, 0.456] } },
            { id: 'ripple', symbol: 'xrp', name: 'XRP', current_price: 0.612, price_change_percentage_24h: 1.23, market_cap: 33000000000, total_volume: 890000000, sparkline_in_7d: { price: [0.605, 0.608, 0.612] } },
            { id: 'polkadot', symbol: 'dot', name: 'Polkadot', current_price: 7.23, price_change_percentage_24h: -3.45, market_cap: 9800000000, total_volume: 230000000, sparkline_in_7d: { price: [7.48, 7.35, 7.23] } },
            { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', current_price: 0.123, price_change_percentage_24h: 8.90, market_cap: 17600000000, total_volume: 1200000000, sparkline_in_7d: { price: [0.113, 0.117, 0.123] } },
            { id: 'avalanche', symbol: 'avax', name: 'Avalanche', current_price: 34.56, price_change_percentage_24h: 4.56, market_cap: 12500000000, total_volume: 340000000, sparkline_in_7d: { price: [33.1, 33.8, 34.56] } }
        ];
        // Add image URLs
        return coins.map(c => ({
            ...c,
            image: `https://assets.coingecko.com/coins/images/1/small/${c.symbol}.png`
        }));
    },

    // Получить глобальные данные рынка
    async fetchMarketData() {
        try {
            // Получить общие статистики от Binance
            const response = await fetch(`${CONFIG.BINANCE_API}/exchangeInfo`);
            const data = await response.json();

            // Получить топовые монеты для расчёта доминирования
            const tickers = await fetch(`${CONFIG.BINANCE_API}/ticker/24hr`).then(r => r.json());
            
            // Расчёт доминирования BTC и ETH
            const btcTicker = tickers.find(t => t.symbol === 'BTCUSDT');
            const ethTicker = tickers.find(t => t.symbol === 'ETHUSDT');
            const totalVolume = tickers.reduce((sum, t) => sum + parseFloat(t.quoteAssetVolume || 0), 0);

            const btcVolume = parseFloat(btcTicker?.quoteAssetVolume || 0);
            const ethVolume = parseFloat(ethTicker?.quoteAssetVolume || 0);

            return {
                data: {
                    total_market_cap: { usd: totalVolume * 10 }, // приблизительная оценка
                    total_volume: { usd: totalVolume },
                    market_cap_percentage: {
                        btc: totalVolume > 0 ? (btcVolume / totalVolume) * 100 : 45,
                        eth: totalVolume > 0 ? (ethVolume / totalVolume) * 100 : 20
                    },
                    market_cap_change_percentage_24h_usd: 1.5 // плейсхолдер
                }
            };
        } catch (error) {
            console.error('❌ Ошибка загрузки глобальных данных:', error);
            return this.getMockGlobalData();
        }
    },

    getMockGlobalData() {
        return {
            data: {
                total_market_cap: { usd: 2450000000000 },
                total_volume: { usd: 89000000000 },
                market_cap_percentage: { btc: 51.2, eth: 16.8 },
                market_cap_change_percentage_24h_usd: 2.34
            }
        };
    },

    async fetchCoinsByIds(ids = []) {
        if (!ids.length) return [];
        try {
            // Загрузить монеты из основного списка
            const coins = await this.fetchCoins(100);
            return coins.filter(c => ids.includes(c.id));
        } catch (error) {
            console.error('❌ Ошибка загрузки монет:', error);
            return [];
        }
    },

    // Получить историческую цену из Binance
    async fetchPriceHistory(coinId, days = 7) {
        try {
            // Найти символ для монеты
            const symbol = Object.entries(this.symbolToId).find(([_, id]) => id === coinId)?.[0];
            if (!symbol) {
                console.warn(`⚠ Символ не найден для ${coinId}`);
                return this.getMockPriceHistory();
            }

            // Получить кандлстики с Binance
            const interval = days <= 7 ? '1h' : '1d';
            const limit = days <= 7 ? Math.min(days * 24, 1000) : Math.min(days, 1000);
            
            const url = `${CONFIG.BINANCE_API}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
            const response = await fetch(url);
            const klines = await response.json();

            const prices = klines.map(([timestamp, open, high, low, close]) => ({
                timestamp: parseInt(timestamp),
                price: parseFloat(close)
            }));

            console.log(`✓ История цены загружена для ${coinId}:`, prices.length, 'точек');
            return prices.length > 0 ? prices : this.getMockPriceHistory();
        } catch (error) {
            console.error(`❌ Ошибка загрузки истории для ${coinId}:`, error);
            return this.getMockPriceHistory();
        }
    },

    getMockPriceHistory() {
        const prices = [];
        let price = 60000;
        for (let i = 0; i < 7; i++) {
            price = price * (1 + (Math.random() - 0.5) * 0.05);
            prices.push({ timestamp: Date.now() - (6-i) * 86400000, price });
        }
        return prices;
    }
};

const Forecasting = {
    movingAverage(data, period) {
        if (!data || data.length < period) return [];
        const result = [];
        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) result.push(null);
            else {
                let sum = 0;
                for (let j = 0; j < period; j++) sum += data[i - j].price;
                result.push(sum / period);
            }
        }
        return result;
    },

    linearRegression(data) {
        if (!data || data.length < 2) return { slope: 0, intercept: 0 };
        const n = data.length;
        let sumX = 0,
            sumY = 0,
            sumXY = 0,
            sumX2 = 0;
        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += data[i].price;
            sumXY += i * data[i].price;
            sumX2 += i * i;
        }
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        return { slope, intercept };
    },

    predictNext(prices, count = 5) {
        if (!prices || prices.length < 2) return [];
        const data = prices.map((p) => ({ price: p }));
        const { slope, intercept } = this.linearRegression(data);
        const n = prices.length;
        const result = [];
        for (let i = 0; i < count; i++) result.push(slope * (n + i) + intercept);
        return result;
    },

    getTrend(prices) {
        if (!prices || prices.length < 2) return 'neutral';
        const recent = prices.slice(-5);
        const avgFirst = recent.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
        const avgLast = recent.slice(-2).reduce((a, b) => a + b, 0) / 2;
        const change = ((avgLast - avgFirst) / avgFirst) * 100;
        if (change > 0.5) return 'up';
        if (change < -0.5) return 'down';
        return 'neutral';
    },
};

const Utils = {
    formatPrice(price) {
        if (price >= 1e9) return '$' + (price / 1e9).toFixed(2) + 'B';
        if (price >= 1e6) return '$' + (price / 1e6).toFixed(2) + 'M';
        if (price >= 1e3) return '$' + (price / 1e3).toFixed(2) + 'K';
        if (price >= 1)
            return '$' + price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        if (price >= 0.01) return '$' + price.toFixed(4);
        return '$' + price.toFixed(6);
    },

    formatNumber(num, decimals = 2) {
        return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    },

    formatPercent(value) {
        if (value == null) return '—';
        const sign = value >= 0 ? '+' : '';
        return sign + value.toFixed(2) + '%';
    },

    formatDate(date) {
        return new Date(date).toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    },
};

function renderSparkline(prices) {
    if (!prices || prices.length < 2)
        return '<span class="crypto-cell--spark-empty" style="color:var(--text-muted);font-size:0.75rem">—</span>';
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const w = 72;
    const h = 28;
    const pad = 2;
    const range = max - min || 1;
    const pts = prices.map((p, i) => {
        const x = pad + (i / (prices.length - 1)) * (w - 2 * pad);
        const y = h - pad - ((p - min) / range) * (h - 2 * pad);
        return `${x},${y}`;
    });
    const up = prices[prices.length - 1] >= prices[0];
    const stroke = up ? '#34d399' : '#fb7185';
    return `<div class="spark"><svg viewBox="0 0 72 28" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${stroke}" stop-opacity="0.35"/><stop offset="100%" stop-color="${stroke}" stop-opacity="0"/></linearGradient></defs><polygon fill="url(#sg)" points="0,${h} ${pts.join(' ')} ${w},${h}"/><polyline fill="none" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" points="${pts.join(' ')}" /></svg></div>`;
}

const Notifications = {
    container: null,
    init() {
        this.container = document.getElementById('notifications');
    },
    show(type, title, text, duration = 5500) {
        if (!this.container) return;
        const el = document.createElement('div');
        el.className = `notification notification--${type}`;
        el.innerHTML = `
            <div class="notification__content">
                <div class="notification__title">${title}</div>
                <div class="notification__text">${text}</div>
            </div>
            <button type="button" class="notification__close" aria-label="Закрыть">×</button>`;
        this.container.appendChild(el);
        const close = () => {
            el.style.opacity = '0';
            el.style.transform = 'translateX(-12px)';
            setTimeout(() => el.remove(), 250);
        };
        el.querySelector('.notification__close').addEventListener('click', close);
        if (duration > 0) setTimeout(close, duration);
    },
};

function checkPriceAlerts() {
    state.coins.forEach((coin) => {
        const prev = state.previousPrices[coin.id];
        if (!prev) return;
        const change = Math.abs(coin.price_change_percentage_24h || 0);
        const prevChange = Math.abs(prev.price_change_percentage_24h || 0);
        const diff = Math.abs(change - prevChange);
        if (diff >= CONFIG.PRICE_ALERT_THRESHOLD) {
            const type = coin.price_change_percentage_24h >= 0 ? 'up' : 'down';
            const dir = type === 'up' ? 'рост' : 'падение';
            Notifications.show(
                type,
                `${coin.name} (${coin.symbol.toUpperCase()})`,
                `Резкое ${dir}: ${Utils.formatPercent(coin.price_change_percentage_24h)} за 24ч`
            );
        }
    });
}

function renderTicker() {
    const track = document.getElementById('tickerTrack');
    if (!track || !state.coins.length) return;
    const slice = state.coins.slice(0, 24);
    const items = slice
        .map((c) => {
            const ch = c.price_change_percentage_24h;
            const cls = ch > 0 ? 'up' : ch < 0 ? 'down' : '';
            return `<span class="ticker__item"><strong>${c.symbol.toUpperCase()}</strong> ${Utils.formatPrice(c.current_price)} <span class="${cls}">${Utils.formatPercent(ch)}</span></span>`;
        })
        .join('');
    track.innerHTML = items + items;
    track.classList.toggle('is-paused', state.tickerPaused);
}

function initTickerControls() {
    const track = document.getElementById('tickerTrack');
    if (!track) return;

    track.title = 'Клик: пауза/продолжить';
    track.addEventListener('click', () => {
        state.tickerPaused = !state.tickerPaused;
        track.classList.toggle('is-paused', state.tickerPaused);
    });
}

// Get crypto icon with fallback sources
function getCryptoIconUrl(symbol) {
    if (!symbol) return '';
    const symbolLower = symbol.toLowerCase();
    // Try multiple icon sources
    const sources = [
        `https://assets.coingecko.com/coins/images/1/small/${symbolLower}.png`,
        `https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/${symbolLower}.png`,
        `https://cryptoicons.org/api/icon/${symbolLower}/128`,
    ];
    return sources[0];
}

// Generate placeholder icon with symbol letter
function getPlaceholderIcon(symbol) {
    const firstLetter = (symbol || '?').charAt(0).toUpperCase();
    const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];
    const color = colors[(symbol || '').length % colors.length] || '#6366F1';
    const svg = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="16" fill="${color}"/>
        <text x="16" y="22" font-family="Arial" font-size="14" font-weight="bold" fill="white" text-anchor="middle">${firstLetter}</text>
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// Handle icon error by using placeholder
function handleMoverIconError(img) {
    const symbol = img.dataset.symbol || '';
    img.src = getPlaceholderIcon(symbol);
}

function renderMovers() {
    const gainersEl = document.getElementById('topGainers');
    const losersEl = document.getElementById('topLosers');
    console.log('renderMovers called:', { gainersEl: !!gainersEl, losersEl: !!losersEl, coinsLength: state.coins.length });
    if (!gainersEl || !losersEl || !state.coins.length) {
        console.log('renderMovers: Elements or data not available', { gainersEl, losersEl, coinsLength: state.coins.length });
        return;
    }

    // Sort by change percentage
    const sorted = [...state.coins].sort(
        (a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)
    );
    
    // Get top gainers (positive change) or just top 5 if no positive
    let gainers = sorted.filter((c) => (c.price_change_percentage_24h || 0) > 0).slice(0, 5);
    if (!gainers.length) gainers = sorted.slice(0, 5); // Fallback to top 5 if no gainers
    
    // Get top losers (negative change) or bottom 5 if no negative
    let losers = [...state.coins]
        .sort((a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0))
        .filter((c) => (c.price_change_percentage_24h || 0) < 0)
        .slice(0, 5);
    if (!losers.length) losers = sorted.slice(-5).reverse(); // Fallback to bottom 5

    const row = (c, up) => {
        const pct = c.price_change_percentage_24h || 0;
        const isUp = pct >= 0;
        const cls = isUp ? 'up' : 'down';
        const iconUrl = c.image || getCryptoIconUrl(c.symbol);
        return `<li class="movers__row" onclick="location.href='charts.html?coin=${c.symbol}'">
            <div class="movers__left">
                <img class="movers__img" src="${iconUrl}" alt="${c.symbol}" loading="lazy" 
                    data-symbol="${c.symbol}" 
                    onerror="handleMoverIconError(this)">
                <div class="movers__info">
                    <div class="movers__name">${c.name}</div>
                    <div class="movers__sym">${c.symbol.toUpperCase()}</div>
                </div>
            </div>
            <span class="movers__pct ${cls}">${isUp ? '+' : ''}${pct.toFixed(2)}%</span>
        </li>`;
    };

    gainersEl.innerHTML = gainers.map((c) => row(c, true)).join('');
    losersEl.innerHTML = losers.map((c) => row(c, false)).join('');
    console.log('renderMovers completed:', { gainersCount: gainers.length, losersCount: losers.length });
}

function animateValue(el, end, formatter, duration = 900) {
    if (!el || end == null || isNaN(end)) return;
    const start = parseFloat(el.dataset.animated || '0') || 0;
    const startTime = performance.now();
    function frame(now) {
        const t = Math.min(1, (now - startTime) / duration);
        const ease = 1 - Math.pow(1 - t, 3);
        const val = start + (end - start) * ease;
        el.textContent = formatter(val);
        if (t < 1) requestAnimationFrame(frame);
        else {
            el.textContent = formatter(end);
            el.dataset.animated = String(end);
        }
    }
    requestAnimationFrame(frame);
}

function renderTable() {
    const tbody = document.getElementById('cryptoTableBody');
    const loadingRow = document.getElementById('tableLoading');
    const emptyState = document.getElementById('emptyState');

    if (!tbody) return;

    if (state.filteredCoins.length === 0) {
        loadingRow?.remove();
        if (emptyState) emptyState.style.display = 'flex';
        tbody.innerHTML = '';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    loadingRow?.remove();

    const rows = state.filteredCoins
        .map((coin) => {
            const change = coin.price_change_percentage_24h;
            const changeClass = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
            const isFavorite = state.favorites.has(coin.id);
            const sparkPrices = coin.sparkline_in_7d?.price;
            const sparkHtml = renderSparkline(sparkPrices);

            return `<tr class="crypto-row" data-id="${coin.id}">
                <td class="crypto-cell">${coin.market_cap_rank || '—'}</td>
                <td class="crypto-cell crypto-cell--name">
                    <img src="${coin.image}" alt="" class="crypto-cell__img" loading="lazy">
                    <div class="crypto-cell__info">
                        <span class="crypto-cell__symbol">${coin.symbol.toUpperCase()}</span>
                        <span class="crypto-cell__name">${coin.name}</span>
                    </div>
                </td>
                <td class="crypto-cell crypto-cell--price">${Utils.formatPrice(coin.current_price)}</td>
                <td class="crypto-cell crypto-cell--change ${changeClass}">${Utils.formatPercent(change)}</td>
                <td class="crypto-cell crypto-cell--vol">${Utils.formatPrice(coin.total_volume)}</td>
                <td class="crypto-cell crypto-cell--cap">${Utils.formatPrice(coin.market_cap)}</td>
                <td class="crypto-cell crypto-cell--spark">${sparkHtml}</td>
                <td class="crypto-cell">
                    <button type="button" class="btn-favorite ${isFavorite ? 'active' : ''}" data-id="${coin.id}" aria-label="Избранное">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                </td>
            </tr>`;
        })
        .join('');

    tbody.innerHTML = rows;

    tbody.querySelectorAll('.btn-favorite').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(btn.dataset.id);
        });
    });

    tbody.querySelectorAll('.crypto-row').forEach((row) => {
        row.addEventListener('click', (e) => {
            if (e.target.closest('.btn-favorite')) return;
            const coin = state.coins.find((c) => c.id === row.dataset.id);
            if (!coin) return;
            const select = document.getElementById('coinSelect');
            if (select) {
                if (!select.querySelector(`option[value="${coin.id}"]`)) {
                    const opt = document.createElement('option');
                    opt.value = coin.id;
                    opt.textContent = coin.name;
                    select.appendChild(opt);
                }
                select.value = coin.id;
            }
            const selectedCoinLabelEl = document.getElementById('selectedCoinLabel');
            const tvSymbolNameEl = document.getElementById('tvSymbolName');
            if (selectedCoinLabelEl) selectedCoinLabelEl.textContent = coin.name;
            if (tvSymbolNameEl) tvSymbolNameEl.textContent = coin.name;
            renderWatchlist();
            loadChart(coin.id);
            document.getElementById('analytics')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

let chartInstance = null;

function chartColors() {
    const light = document.documentElement.getAttribute('data-theme') === 'light';
    return {
        grid: light ? 'rgba(15, 23, 42, 0.06)' : 'rgba(148, 163, 184, 0.08)',
        text: light ? '#64748b' : '#94a3b8',
        line1: light ? '#0891b2' : '#00e5c8',
        fill1: light ? 'rgba(8, 145, 178, 0.12)' : 'rgba(0, 229, 200, 0.12)',
        line2: '#a855f7',
    };
}

function initChart() {
    const canvas = document.getElementById('priceChart');
    if (!canvas) return;
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded');
        return;
    }
    
    // Destroy existing chart if it exists
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
    
    const ctx = canvas.getContext('2d');
    const c = chartColors();

    const crosshairState = { x: null, y: null };
    const crosshairPlugin = {
        id: 'tvCrosshair',
        afterEvent(chart, args) {
            const event = args.event;
            if (!event || !chart.chartArea) return;

            if (event.type === 'mousemove') {
                crosshairState.x = event.x;
                crosshairState.y = event.y;
                chart.draw();
            } else if (event.type === 'mouseout') {
                crosshairState.x = null;
                crosshairState.y = null;
                chart.draw();
            }
        },
        beforeDatasetsDraw(chart) {
            if (crosshairState.x == null) return;
            const { ctx, chartArea } = chart;
            if (!chartArea) return;
            if (crosshairState.x < chartArea.left || crosshairState.x > chartArea.right) return;

            ctx.save();
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(crosshairState.x, chartArea.top);
            ctx.lineTo(crosshairState.x, chartArea.bottom);
            ctx.stroke();
            ctx.restore();
        },
    };

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Цена (USD)',
                    data: [],
                    borderColor: c.line1,
                    backgroundColor: c.fill1,
                    fill: true,
                    tension: 0.42,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    borderWidth: 2,
                },
                {
                    label: 'Прогноз (MA + регрессия)',
                    data: [],
                    borderColor: c.line2,
                    borderDash: [6, 4],
                    fill: false,
                    tension: 0.35,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    borderWidth: 2,
                },
            ],
        },
        plugins: [crosshairPlugin],
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { intersect: false, mode: 'index' },
            plugins: {
                legend: {
                    labels: {
                        color: c.text,
                        font: { family: "'Outfit', sans-serif", size: 12 },
                    },
                },
                tooltip: {
                    backgroundColor: 'rgba(12, 16, 28, 0.92)',
                    titleFont: { family: "'JetBrains Mono', monospace" },
                    bodyFont: { family: "'JetBrains Mono', monospace" },
                    padding: 12,
                    cornerRadius: 8,
                },
            },
            scales: {
                x: {
                    grid: { color: c.grid },
                    ticks: {
                        color: c.text,
                        maxTicksLimit: 10,
                        font: { size: 10 },
                    },
                },
                y: {
                    grid: { color: c.grid },
                    ticks: {
                        color: c.text,
                        callback: (v) => '$' + Utils.formatNumber(v),
                    },
                },
            },
        },
    });
}

async function loadChart(coinId) {
    const loader = document.getElementById('chartLoader');
    const period = parseInt(document.getElementById('chartPeriod').value, 10);
    const showForecast = document.getElementById('showForecast').checked;
    const chartCanvas = document.getElementById('priceChart');

    if (!chartCanvas || !chartInstance) {
        loader?.setAttribute('hidden', '');
        return;
    }

    const coin = state.coins.find((c) => c.id === coinId);
    if (coin) {
        const selectedCoinLabelEl = document.getElementById('selectedCoinLabel');
        const tvSymbolNameEl = document.getElementById('tvSymbolName');
        if (selectedCoinLabelEl) selectedCoinLabelEl.textContent = coin.name;
        if (tvSymbolNameEl) tvSymbolNameEl.textContent = coin.name;
        setActiveTimeButton(period);
    }

    loader?.removeAttribute('hidden');

    try {
        chartInstance.data.labels = [];
        chartInstance.data.datasets[0].data = [];
        chartInstance.data.datasets[1].data = [];
        chartInstance.update();

        const now = Date.now();

        let prices;
        let usedFallback = false;
        try {
            prices = await Api.fetchPriceHistory(coinId, period);
            if (!Array.isArray(prices) || prices.length < 2) throw new Error('Empty price history');
        } catch (e) {
            await new Promise((r) => setTimeout(r, 350));
            try {
                prices = await Api.fetchPriceHistory(coinId, period);
                if (!Array.isArray(prices) || prices.length < 2) throw new Error('Empty price history');
            } catch (e2) {
                const spark = coin?.sparkline_in_7d?.price;
                if (Array.isArray(spark) && spark.length >= 2) {
                    usedFallback = true;
                    const stepMs = 24 * 60 * 60 * 1000; // 1 day (sparkline: 7 days)
                    const startTs = now - stepMs * (spark.length - 1);
                    prices = spark.map((p, i) => ({
                        timestamp: startTs + i * stepMs,
                        price: p,
                    }));
                } else {
                    throw e2;
                }
            }
        }

        state.priceHistory[coinId] = prices;

        const priceValues = prices.map((p) => p.price);
        if (!priceValues.length || priceValues[priceValues.length - 1] == null) throw new Error('Invalid price values');
        const labels = prices.map((p) => new Date(p.timestamp));

        const maData = Forecasting.movingAverage(prices, CONFIG.MA_PERIOD);
        const forecastData = [...maData];
        const forecastPredict = Forecasting.predictNext(
            priceValues,
            Math.min(12, Math.floor(prices.length / 4))
        );
        forecastPredict.forEach((v, i) => {
            const lastTs = prices[prices.length - 1].timestamp;
            const step = prices.length > 1 ? prices[1].timestamp - prices[0].timestamp : 3600000;
            labels.push(new Date(lastTs + (i + 1) * step));
            forecastData.push(showForecast ? v : null);
        });

        const trend = Forecasting.getTrend(priceValues);
        const trendEl = document.getElementById('trendValue');
        trendEl.textContent = usedFallback
            ? (trend === 'up'
                  ? '↑ Рост (fallback)'
                  : trend === 'down'
                    ? '↓ Падение (fallback)'
                    : '→ Боковик (fallback)')
            : trend === 'up'
              ? '↑ Рост'
              : trend === 'down'
                ? '↓ Падение'
                : '→ Боковик';
        trendEl.className =
            'analytics-card__value ' + (trend === 'up' ? 'positive' : trend === 'down' ? 'negative' : '');

        const lastPrice = priceValues[priceValues.length - 1];
        const prevPrice = priceValues.length > 1 ? priceValues[priceValues.length - 2] : null;

        const tvPriceEl = document.getElementById('tvSymbolPrice');
        const tvChgEl = document.getElementById('tvSymbolChange');
        if (tvPriceEl) tvPriceEl.textContent = Utils.formatPrice(lastPrice);

        if (tvChgEl) {
            if (prevPrice && prevPrice !== 0) {
                const changePct = ((lastPrice - prevPrice) / prevPrice) * 100;
                tvChgEl.textContent = Utils.formatPercent(changePct);
                tvChgEl.className =
                    'tv-symbolbar__chg ' +
                    (changePct > 0
                        ? 'tv-symbolbar__chg--positive'
                        : changePct < 0
                          ? 'tv-symbolbar__chg--negative'
                          : 'tv-symbolbar__chg--neutral');
            } else {
                tvChgEl.textContent = '—';
                tvChgEl.className = 'tv-symbolbar__chg tv-symbolbar__chg--neutral';
            }
        }

        const forecastPrice = forecastPredict[0];
        const forecastEl = document.getElementById('forecastValue');
        if (forecastPrice && showForecast) {
            const change = ((forecastPrice - lastPrice) / lastPrice) * 100;
            forecastEl.textContent = Utils.formatPrice(forecastPrice) + ` (${Utils.formatPercent(change)})`;
            forecastEl.className = 'analytics-card__value ' + (change >= 0 ? 'positive' : 'negative');
        } else {
            forecastEl.textContent = '—';
            forecastEl.className = 'analytics-card__value';
        }

        const actualData = [...priceValues];
        forecastPredict.forEach(() => actualData.push(null));

        chartInstance.data.labels = labels;
        chartInstance.data.datasets[0].data = actualData;
        chartInstance.data.datasets[1].data = showForecast
            ? forecastData
            : new Array(forecastData.length).fill(null);
        
        chartInstance.update('active');
        
        // Force redraw
        setTimeout(() => {
            if (chartInstance) {
                try {
                    chartInstance.resize();
                } catch (e) {
                    console.warn('Chart resize on update:', e);
                }
            }
        }, 100);
    } catch (err) {
        console.error('Chart load error:', err);
        const trendEl = document.getElementById('trendValue');
        const forecastEl = document.getElementById('forecastValue');

        if (chartInstance) {
            chartInstance.data.labels = [];
            chartInstance.data.datasets[0].data = [];
            chartInstance.data.datasets[1].data = [];
            chartInstance.update();
        }

        if (trendEl) {
            trendEl.textContent = 'Ошибка данных: ' + (err?.message || 'unknown');
            trendEl.className = 'analytics-card__value negative';
        }
        if (forecastEl) {
            forecastEl.textContent = '—';
            forecastEl.className = 'analytics-card__value';
        }
    } finally {
        loader?.setAttribute('hidden', '');
    }
}

function updateChartTheme() {
    if (!chartInstance) return;
    const c = chartColors();
    chartInstance.data.datasets[0].borderColor = c.line1;
    chartInstance.data.datasets[0].backgroundColor = c.fill1;
    chartInstance.options.scales.x.grid.color = c.grid;
    chartInstance.options.scales.x.ticks.color = c.text;
    chartInstance.options.scales.y.grid.color = c.grid;
    chartInstance.options.scales.y.ticks.color = c.text;
    chartInstance.options.plugins.legend.labels.color = c.text;
    chartInstance.update();
}

function populateCoinSelect() {
    const select = document.getElementById('coinSelect');
    if (!select) return;
    const currentValue = select.value;
    const topCoins = [
        'bitcoin', 'ethereum', 'solana', 'binancecoin', 'ripple',
        'cardano', 'dogecoin', 'chainlink', 'tron', 'tether',
    ];
    const coinsToAdd = state.coins.filter((c) => topCoins.includes(c.id) || state.favorites.has(c.id));
    const existing = new Set([...select.querySelectorAll('option')].map((o) => o.value));

    coinsToAdd.forEach((coin) => {
        if (!existing.has(coin.id)) {
            existing.add(coin.id);
            const opt = document.createElement('option');
            opt.value = coin.id;
            opt.textContent = coin.name;
            select.appendChild(opt);
        }
    });

    if (currentValue && select.querySelector(`option[value="${currentValue}"]`)) select.value = currentValue;
}

function toggleFavorite(id) {
    if (state.favorites.has(id)) state.favorites.delete(id);
    else state.favorites.add(id);
    localStorage.setItem('crypto-favorites', JSON.stringify([...state.favorites]));
    updateFilteredCoins();
    renderTable();
    updateFavoritesCount();
    populateCoinSelect();
    renderWatchlist();
}

function updateFavoritesCount() {
    const el = document.getElementById('favoritesCount');
    if (el) el.textContent = state.favorites.size;
}

/* ========== TradingView-like UI (Watchlist + Toolbar) ========== */
function getSelectedCoinId() {
    const select = document.getElementById('coinSelect');
    return select ? select.value : null;
}

function ensureCoinOption(id) {
    const select = document.getElementById('coinSelect');
    if (!select) return;
    if (select.querySelector(`option[value="${id}"]`)) return;

    const coin = state.coins.find((c) => c.id === id);
    if (!coin) return;

    const opt = document.createElement('option');
    opt.value = coin.id;
    opt.textContent = coin.name;
    select.appendChild(opt);
}

function setActiveTimeButton(period) {
    document.querySelectorAll('.tv-chip--time[data-period]').forEach((btn) => {
        const p = btn.dataset.period;
        btn.classList.toggle('is-active', String(p) === String(period));
    });
}

function updateForecastChip() {
    const chip = document.getElementById('tvForecastToggle');
    const input = document.getElementById('showForecast');
    if (!chip || !input) return;
    chip.classList.toggle('is-active', !!input.checked);
    chip.setAttribute('aria-pressed', input.checked ? 'true' : 'false');
}

function selectCoinFromId(id) {
    ensureCoinOption(id);

    const select = document.getElementById('coinSelect');
    const coin = state.coins.find((c) => c.id === id);
    if (!select || !coin) return;

    select.value = id;
    const selectedCoinLabelEl = document.getElementById('selectedCoinLabel');
    const tvSymbolNameEl = document.getElementById('tvSymbolName');
    if (selectedCoinLabelEl) selectedCoinLabelEl.textContent = coin.name;
    if (tvSymbolNameEl) tvSymbolNameEl.textContent = coin.name;

    renderWatchlist();
    loadChart(id);
}

function renderWatchlist() {
    const body = document.getElementById('watchlistBody');
    const empty = document.getElementById('watchlistEmpty');
    const count = document.getElementById('watchlistCount');
    if (!body || !empty || !count) return;

    count.textContent = state.favorites.size;

    const favoritesCoins = [...state.favorites]
        .map((id) => state.coins.find((c) => c.id === id))
        .filter(Boolean);

    const sortedByRank = [...state.coins].sort(
        (a, b) => (a.market_cap_rank ?? Number.POSITIVE_INFINITY) - (b.market_cap_rank ?? Number.POSITIVE_INFINITY)
    );
    const others = sortedByRank.filter((c) => !state.favorites.has(c.id));

    const watchCoinsAll = [...favoritesCoins, ...others];
    const watchCoins = [];
    const seen = new Set();
    watchCoinsAll.forEach((c) => {
        if (seen.has(c.id)) return;
        seen.add(c.id);
        watchCoins.push(c);
    });
    watchCoins.splice(12);

    empty.style.display = watchCoins.length ? 'none' : 'block';
    body.innerHTML = watchCoins.length
        ? watchCoins
              .map((coin) => {
                  const change = coin.price_change_percentage_24h;
                  const changeClass = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
                  const isActive = coin.id === getSelectedCoinId();
                  const isFavorite = state.favorites.has(coin.id);

                  return `<li>
                      <button type="button" class="tv-watchlist__row ${isActive ? 'is-active' : ''}" data-id="${coin.id}" aria-label="Открыть ${coin.name}">
                        <div class="tv-watchlist__left">
                          <div class="tv-watchlist__symbol">${isFavorite ? '★ ' : ''}${coin.symbol.toUpperCase()}</div>
                          <div class="tv-watchlist__name">${coin.name}</div>
                        </div>
                        <div class="tv-watchlist__right">
                          <div class="tv-watchlist__price">${Utils.formatPrice(coin.current_price)}</div>
                          <div class="tv-watchlist__chg ${changeClass}">${Utils.formatPercent(change)}</div>
                        </div>
                      </button>
                    </li>`;
              })
              .join('')
        : '';

    body.querySelectorAll('.tv-watchlist__row').forEach((btn) => {
        btn.addEventListener('click', () => selectCoinFromId(btn.dataset.id));
    });
}

function initTradingViewLikeControls() {
    document.querySelectorAll('.tv-chip--time[data-period]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const period = btn.dataset.period;
            setActiveTimeButton(period);

            const coinId = getSelectedCoinId() || document.getElementById('coinSelect')?.value;
            const periodSelect = document.getElementById('chartPeriod');
            if (periodSelect) periodSelect.value = period;

            updateForecastChip();
            if (coinId) loadChart(coinId);
        });
    });

    const forecastChip = document.getElementById('tvForecastToggle');
    forecastChip?.addEventListener('click', () => {
        const input = document.getElementById('showForecast');
        if (!input) return;
        input.checked = !input.checked;
        updateForecastChip();

        const coinId = getSelectedCoinId();
        if (coinId) loadChart(coinId);
    });

    // Initial sync
    const selectedPeriod = document.getElementById('chartPeriod')?.value;
    if (selectedPeriod) setActiveTimeButton(selectedPeriod);
    updateForecastChip();
    renderWatchlist();
}

/* ========== Filter & sort ========== */
function updateFilteredCoins() {
    let list = [...state.coins];

    if (state.filterMode === 'favorites') list = list.filter((c) => state.favorites.has(c.id));
    else if (state.filterMode === 'gainers')
        list = list.filter((c) => (c.price_change_percentage_24h || 0) > 0);
    else if (state.filterMode === 'losers')
        list = list.filter((c) => (c.price_change_percentage_24h || 0) < 0);

    if (state.searchQuery.trim()) {
        const q = state.searchQuery.toLowerCase();
        list = list.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                c.symbol.toLowerCase().includes(q) ||
                c.id.toLowerCase().includes(q)
        );
    }

    const field = state.sortField;
    const dir = state.sortDirection === 'asc' ? 1 : -1;
    list.sort((a, b) => {
        let va = a[field];
        let vb = b[field];
        if (va == null) va = field === 'name' ? '' : 0;
        if (vb == null) vb = field === 'name' ? '' : 0;
        if (typeof va === 'string') return dir * va.localeCompare(vb);
        return dir * (va - vb);
    });

    state.filteredCoins = list;
}

function applySort(field) {
    if (state.sortField === field) state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
    else {
        state.sortField = field;
        state.sortDirection = field === 'name' ? 'asc' : 'desc';
    }
    document.querySelectorAll('.crypto-table__th').forEach((th) => th.classList.remove('sorted', 'sorted-asc'));
    const th = document.querySelector(`[data-sort="${field}"]`);
    if (th) {
        th.classList.add('sorted');
        if (state.sortDirection === 'asc') th.classList.add('sorted-asc');
    }
    updateFilteredCoins();
    renderTable();
}

function setActiveTab(tabEl) {
    document.querySelectorAll('.tab').forEach((t) => {
        t.classList.remove('tab--active');
        t.setAttribute('aria-selected', 'false');
    });
    tabEl.classList.add('tab--active');
    tabEl.setAttribute('aria-selected', 'true');
}

/* ========== Refresh ========== */
async function refreshData() {
    try {
        state.previousPrices = {};
        state.coins.forEach((c) => {
            state.previousPrices[c.id] = {
                current_price: c.current_price,
                price_change_percentage_24h: c.price_change_percentage_24h,
            };
        });

        const [coins, globalData] = await Promise.all([Api.fetchCoins(), Api.fetchMarketData()]);

        // Merge coins (no need for extra coins anymore with Binance)
        const byId = new Map();
        coins.forEach((c) => {
            if (c?.id) byId.set(c.id, c);
        });
        state.coins = [...byId.values()].sort(
            (a, b) => (a.market_cap_rank ?? Number.POSITIVE_INFINITY) - (b.market_cap_rank ?? Number.POSITIVE_INFINITY)
        );
        state.lastUpdate = new Date();

        populateCoinSelect();
        checkPriceAlerts();

        updateFilteredCoins();
        renderTable();
        renderTicker();
        renderMovers();
        updateFavoritesCount();
        renderWatchlist();

        const g = globalData?.data;
        if (g) {
            const mc = g.total_market_cap?.usd;
            const vol = g.total_volume?.usd;
            const mcEl = document.getElementById('totalMarketCap');
            const volEl = document.getElementById('totalVolume');
            const btcEl = document.getElementById('btcDominance');
            const ethEl = document.getElementById('ethDominance');
            const mcCh = document.getElementById('marketCapChange');

            if (mcEl && mc != null) {
                mcEl.dataset.target = mc;
                animateValue(mcEl, mc, (v) => Utils.formatPrice(v));
            }
            if (volEl && vol != null) {
                volEl.dataset.target = vol;
                animateValue(volEl, vol, (v) => Utils.formatPrice(v));
            }
            if (btcEl) btcEl.textContent = (g.market_cap_percentage?.btc || 0).toFixed(2) + '%';
            if (ethEl) ethEl.textContent = (g.market_cap_percentage?.eth || 0).toFixed(2) + '%';

            const ch24 =
                g.market_cap_change_percentage_24h_usd ?? g.market_cap_change_percentage_24h;
            if (mcCh) {
                if (ch24 != null) {
                    mcCh.textContent = '24ч: ' + Utils.formatPercent(ch24);
                    mcCh.style.color = ch24 >= 0 ? 'var(--green)' : 'var(--red)';
                } else mcCh.textContent = '—';
            }
        }

        const lastUpdateEl = document.getElementById('lastUpdate');
        if (lastUpdateEl) lastUpdateEl.textContent = Utils.formatDate(state.lastUpdate);
    } catch (err) {
        console.error('Refresh failed:', err);
        throw err;
    }
}

/* ========== Theme ========== */
function initTheme() {
    const saved = localStorage.getItem('crypto-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('crypto-theme', next);
    updateChartTheme();
}

/* ========== UI helpers ========== */
function initScrollProgress() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;
    window.addEventListener(
        'scroll',
        () => {
            const h = document.documentElement.scrollHeight - window.innerHeight;
            const p = h > 0 ? (window.scrollY / h) * 100 : 0;
            bar.style.width = p + '%';
        },
        { passive: true }
    );
}

function initBackToTop() {
    const btn = document.getElementById('backTop');
    if (!btn) return;
    window.addEventListener(
        'scroll',
        () => {
            if (window.scrollY > 500) btn.classList.add('is-visible');
            else btn.classList.remove('is-visible');
        },
        { passive: true }
    );
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function initReveal() {
    if (document.body.classList.contains('reduce-motion')) return;
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add('is-visible');
                    io.unobserve(e.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => io.observe(el));
}

function initMobileNav() {
    const burger = document.getElementById('menuToggle');
    const header = document.getElementById('header');
    if (!burger || !header) return;
    burger.addEventListener('click', () => {
        const open = header.classList.toggle('nav-open');
        burger.setAttribute('aria-expanded', open);
    });
    document.querySelectorAll('.nav__link').forEach((link) => {
        link.addEventListener('click', () => {
            header.classList.remove('nav-open');
            burger.setAttribute('aria-expanded', 'false');
        });
    });
}

function initHorizontalShiftFix() {
    const resetX = () => {
        if (window.scrollX !== 0) window.scrollTo({ left: 0, top: window.scrollY, behavior: 'auto' });
    };
    resetX();
    window.addEventListener('resize', resetX, { passive: true });
    window.addEventListener('pageshow', resetX, { passive: true });
}

function initChartResize() {
    const resizeChart = () => {
        if (chartInstance) {
            try {
                chartInstance.resize();
            } catch (e) {
                console.warn('Chart resize error:', e);
            }
        }
    };
    window.addEventListener('resize', resizeChart, { passive: true });
}

/* ========== Init ========== */
function init() {
    Notifications.init();
    applyLanguage(state.lang);
    initTheme();
    initChart();
    initChartResize();
    initScrollProgress();
    initBackToTop();
    initReveal();
    initMobileNav();
    initHorizontalShiftFix();
    initTickerControls();
    updateFavoritesCount();
    initTradingViewLikeControls();

    // Initialize with mock data immediately so movers are visible
    state.coins = Api.getMockCoins();
    renderMovers();

    // Double-check render after DOM is fully ready
    setTimeout(() => {
        renderMovers();
        console.log('Delayed renderMovers called, coins:', state.coins.length);
    }, 100);

    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const coinSelectEl = document.getElementById('coinSelect');
    if (coinSelectEl) {
        coinSelectEl.addEventListener('change', (e) => {
            const id = e.target.value;
            const c = state.coins.find((x) => x.id === id);
            if (c) {
                const selectedCoinLabelEl = document.getElementById('selectedCoinLabel');
                const tvSymbolNameEl = document.getElementById('tvSymbolName');
                if (selectedCoinLabelEl) selectedCoinLabelEl.textContent = c.name;
                if (tvSymbolNameEl) tvSymbolNameEl.textContent = c.name;
            }
            renderWatchlist();
            loadChart(id);
        });
    }

    const chartPeriodEl = document.getElementById('chartPeriod');
    const showForecastEl = document.getElementById('showForecast');
    if (coinSelectEl && chartPeriodEl) {
        chartPeriodEl.addEventListener('change', () => loadChart(coinSelectEl.value));
    }
    if (coinSelectEl && showForecastEl) {
        showForecastEl.addEventListener('change', () => loadChart(coinSelectEl.value));
    }

    const themeToggleEl = document.getElementById('themeToggle');
    themeToggleEl?.addEventListener('click', toggleTheme);

    document.getElementById('favoritesBtn')?.addEventListener('click', () => {
        const tab = document.querySelector('.tab[data-filter="favorites"]');
        if (tab) {
            setActiveTab(tab);
            state.filterMode = 'favorites';
            updateFilteredCoins();
            renderTable();
            document.getElementById('markets')?.scrollIntoView({ behavior: 'smooth' });
        }
    });

    const searchInputEl = document.getElementById('searchInput');
    console.log('Search input element:', searchInputEl);
    
    if (searchInputEl) {
        searchInputEl.addEventListener('input', (e) => {
            console.log('Search input:', e.target.value);
            state.searchQuery = e.target.value;
            updateFilteredCoins();
            renderTable();
        });
    } else {
        console.error('Search input not found!');
    }

    document.querySelectorAll('.tab').forEach((tab) => {
        tab.addEventListener('click', () => {
            setActiveTab(tab);
            state.filterMode = tab.dataset.filter;
            updateFilteredCoins();
            renderTable();
        });
    });

    document.querySelectorAll('.crypto-table__th.sortable').forEach((th) => {
        th.addEventListener('click', () => applySort(th.dataset.sort));
    });

    const refreshIndicatorEl = document.getElementById('refreshIndicator');
    const refreshTextEl = document.querySelector('.refresh-indicator__text');
    let secondsLeft = CONFIG.REFRESH_INTERVAL / 1000;
    let refreshTimeoutId = null;

    const updateRefreshLabel = () => {
        if (refreshTextEl) refreshTextEl.textContent = `Синхронизация: ${secondsLeft}с`;
    };

    const resetRefreshCountdown = () => {
        secondsLeft = CONFIG.REFRESH_INTERVAL / 1000;
        updateRefreshLabel();
    };

    const scheduleAutoRefresh = () => {
        if (refreshTimeoutId) clearTimeout(refreshTimeoutId);
        refreshTimeoutId = setTimeout(async () => {
            await refreshData().catch(() => {});
            resetRefreshCountdown();
            scheduleAutoRefresh();
        }, CONFIG.REFRESH_INTERVAL);
    };

    const refreshNow = async () => {
        resetRefreshCountdown();
        if (refreshTimeoutId) clearTimeout(refreshTimeoutId);
        await refreshData().catch(() => {});
        scheduleAutoRefresh();
    };

    refreshIndicatorEl?.addEventListener('click', refreshNow);
    refreshIndicatorEl?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            refreshNow();
        }
    });
    updateRefreshLabel();
    setInterval(() => {
        secondsLeft -= 1;
        if (secondsLeft <= 0) secondsLeft = CONFIG.REFRESH_INTERVAL / 1000;
        updateRefreshLabel();
    }, 1000);
    scheduleAutoRefresh();

    refreshData()
        .then(() => {
            if (!coinSelectEl) return;
            const sel = coinSelectEl.value;
            const c = state.coins.find((x) => x.id === sel);
            if (c) {
                const selectedCoinLabelEl = document.getElementById('selectedCoinLabel');
                const tvSymbolNameEl = document.getElementById('tvSymbolName');
                if (selectedCoinLabelEl) selectedCoinLabelEl.textContent = c.name;
                if (tvSymbolNameEl) tvSymbolNameEl.textContent = c.name;
            }
            loadChart(sel);
        })
        .catch(() => {
            // Use mock data as fallback when API fails
            state.coins = Api.getMockCoins();
            updateFilteredCoins();
            renderTable();
            renderTicker();
            renderMovers();
            updateFavoritesCount();
            renderWatchlist();

            const tbody = document.getElementById('cryptoTableBody');
            const loadingRow = document.getElementById('tableLoading');
            loadingRow?.remove();
        });
}

// Global functions for inline event handlers
window.handleMoverIconError = function(img) {
    const symbol = img?.dataset?.symbol || '';
    const firstLetter = symbol.charAt(0).toUpperCase() || '?';
    const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];
    const color = colors[symbol.length % colors.length] || '#6366F1';
    const svg = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="16" fill="${color}"/>
        <text x="16" y="22" font-family="Arial" font-size="14" font-weight="bold" fill="white" text-anchor="middle">${firstLetter}</text>
    </svg>`;
    img.src = 'data:image/svg+xml;base64,' + btoa(svg);
};

document.addEventListener('DOMContentLoaded', init);
