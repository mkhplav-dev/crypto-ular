// Configuration
        const CONFIG = {
            REFRESH_INTERVAL: 60000, // 1 minute
            API_BASE: 'https://api.binance.com/api/v3',
            DEFAULT_CRYPTO: 'BTC',
            USD_TO_KGS: 87.5 // Exchange rate: 1 USD = 87.5 KGS (som)
        };

        // Currency formatter for KGS
        function formatKGS(amount) {
            return new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'KGS',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount);
        }

        function formatUSD(amount) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount);
        }

        // Convert USD to KGS
        function usdToKgs(usdAmount) {
            return usdAmount * CONFIG.USD_TO_KGS;
        }

        // State
        window.cryptoData = [];
        let selectedCrypto = CONFIG.DEFAULT_CRYPTO;
        let chartInstance = null;
        let refreshTimer = null;
        let refreshCountdown = CONFIG.REFRESH_INTERVAL / 1000;
        let currentChartType = 'candles'; // candles, line, area, bars
        let currentCurrency = 'usd'; // usd or kgs

        // Translations
        const i18n = {
            ru: {
                // Navigation
                home: 'Главная',
                charts: 'Графики',
                portfolio: 'Портфель',
                news: 'Новости',
                settings: 'Настройки',
                // Titles
                top_gainers: 'Топ роста',
                top_losers: 'Топ падения',
                all_cryptocurrencies: 'Все криптовалюты',
                loading: 'Загрузка...',
                // Table headers
                price: 'Цена',
                volume_24h: 'Объём 24ч',
                change_24h: 'Изменение 24ч',
                kyrgyz_cryptocurrencies: 'Кыргыз крипто',
                rank: 'Ранг',
                symbol: 'Символ',
                name: 'Название',
                // Search
                search_placeholder: 'Поиск...',
                // Stats
                total_volume_24h: 'Общий объем 24ч',
                total_coins: 'Всего монет',
                avg_change: 'Среднее изменение',
                market_cap: 'Рыночная капитализация',
                // Chart types
                candles: 'Свечи',
                line: 'Линия',
                area: 'Область',
                bars: 'Бары',
                // Timeframes
                timeframe_1d: '1Д',
                timeframe_7d: '7Д',
                timeframe_1m: '1М',
                timeframe_3m: '3М',
                // Chart info
                chart_info_candles: 'Свечи — показывают цены открытия, максимума, минимума и закрытия за период. Зелёная = рост, Красная = падение.',
                chart_info_line: 'Линия — простой график цены закрытия. Лучше для отслеживания общего тренда без деталей.',
                chart_info_area: 'Area график (как на CoinGecko) — линия цены с зелёным градиентом под ней. Наглядно показывает тренд.',
                chart_info_bars: 'Бары — вертикальные столбики показывают диапазон цен. Чёрточка слева = открытие, справа = закрытие.'
            },
            en: {
                // Navigation
                home: 'Home',
                charts: 'Charts',
                portfolio: 'Portfolio',
                news: 'News',
                settings: 'Settings',
                // Titles
                top_gainers: 'Top Gainers',
                top_losers: 'Top Losers',
                all_cryptocurrencies: 'All Cryptocurrencies',
                loading: 'Loading...',
                // Table headers
                price: 'Price',
                volume_24h: 'Volume 24h',
                change_24h: 'Change 24h',
                kyrgyz_cryptocurrencies: 'Kyrgyz Crypto',
                rank: 'Rank',
                symbol: 'Symbol',
                name: 'Name',
                // Search
                search_placeholder: 'Search...',
                // Stats
                total_volume_24h: 'Total Volume 24h',
                total_coins: 'Total Coins',
                avg_change: 'Avg Change',
                market_cap: 'Market Cap',
                // Chart types
                candles: 'Candles',
                line: 'Line',
                area: 'Area',
                bars: 'Bars',
                // Timeframes
                timeframe_1d: '1D',
                timeframe_7d: '7D',
                timeframe_1m: '1M',
                timeframe_3m: '3M',
                // Chart info
                chart_info_candles: 'Candles show open, high, low, and close prices. Green = up, Red = down.',
                chart_info_line: 'Line chart shows closing price. Best for tracking overall trend.',
                chart_info_area: 'Area chart with green gradient under the line. Visually shows trend.',
                chart_info_bars: 'Bars show price range. Left tick = open, Right tick = close.'
            },
            ky: {
                // Navigation
                home: 'Башкы',
                charts: 'Графиктер',
                portfolio: 'Портфель',
                news: 'Жаңылыктар',
                settings: 'Орнотуулар',
                // Titles
                top_gainers: 'Эң жакшы',
                top_losers: 'Эң начар',
                all_cryptocurrencies: 'Бардык крипто',
                loading: 'Жүктөлүүдө...',
                // Table headers
                price: 'Баа',
                volume_24h: '24ч Объём',
                change_24h: '24ч Өзгөрүү',
                kyrgyz_cryptocurrencies: 'Кыргыз крипто',
                rank: 'Ранг',
                symbol: 'Символ',
                name: 'Аталышы',
                // Search
                search_placeholder: 'Издөө...',
                // Stats
                total_volume_24h: 'Жалпы көлөм 24ч',
                total_coins: 'Бардык монеталар',
                avg_change: 'Орточо өзгөрүү',
                market_cap: 'Рынок капитализациясы',
                // Chart types
                candles: 'Шамдар',
                line: 'Сызык',
                area: 'Аймак',
                bars: 'Барлар',
                // Timeframes
                timeframe_1d: '1К',
                timeframe_7d: '7К',
                timeframe_1m: '1А',
                timeframe_3m: '3А',
                // Chart info
                chart_info_candles: 'Шамдар — ачык, жогорку, төмөн жана жабык бааларды көрсөтөт. Жашыл = өсүү, Кызыл = төмөндөө.',
                chart_info_line: 'Сызык графиги жабык бааны көрсөтөт. Жалпы трендди көзөмөлдөө үчүн мыкты.',
                chart_info_area: 'Аймак графиги — сызыктын астында жашыл градиент. Трендди визуалдык көрсөтөт.',
                chart_info_bars: 'Барлар баа диапазонун көрсөтөт. Сол белги = ачуу, Оң белги = жабуу.'
            }
        };

        let currentLang = localStorage.getItem('charts-lang') || 'ru';

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            initTheme();
            initLanguage();
            loadCurrency();
            initEventListeners();
            fetchCryptoData();
            startRefreshTimer();
        });

        // Theme Management
        function initTheme() {
            const savedTheme = localStorage.getItem('charts-theme') || 'dark';
            document.documentElement.setAttribute('data-theme', savedTheme);
            document.getElementById('themeToggle').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        }

        function toggleTheme() {
            const current = document.documentElement.getAttribute('data-theme') || 'dark';
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('charts-theme', next);
            document.getElementById('themeToggle').textContent = next === 'dark' ? '☀️' : '🌙';
        }

        // Language Management
        function initLanguage() {
            document.querySelectorAll('.lang-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    setLanguage(btn.dataset.lang);
                });
            });
            setLanguage(currentLang);
        }

        function setLanguage(lang) {
            currentLang = lang;
            localStorage.setItem('charts-lang', lang);
            document.documentElement.lang = lang;

            document.querySelectorAll('.lang-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.lang === lang);
            });

            updateTranslations();
        }

        function updateTranslations() {
            // Update all elements with data-i18n
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.dataset.i18n;
                if (i18n[currentLang][key]) {
                    el.textContent = i18n[currentLang][key];
                }
            });
            
            // Update search placeholder
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.placeholder = i18n[currentLang].search_placeholder || 'Поиск...';
            }
            
            // Update navigation links - find spans inside nav-links
            const homeBtn = document.querySelector('.home-btn');
            if (homeBtn) {
                const homeSpan = homeBtn.querySelector('span');
                if (homeSpan) homeSpan.textContent = i18n[currentLang].home;
            }
            
            const chartsLink = document.querySelector('.nav-link[href="#charts"] span');
            if (chartsLink) chartsLink.textContent = i18n[currentLang].charts;
            
            const portfolioLink = document.querySelector('.nav-link[href="portfolio.html"] span');
            if (portfolioLink) portfolioLink.textContent = i18n[currentLang].portfolio;
            
            const newsLink = document.querySelector('.nav-link[href="#news"] span');
            if (newsLink) newsLink.textContent = i18n[currentLang].news;
            
            const settingsLink = document.querySelector('.nav-link[href="#settings"] span');
            if (settingsLink) settingsLink.textContent = i18n[currentLang].settings;
            
            // Update chart type buttons
            const chartTypeBtns = document.querySelectorAll('.chart-type-btn');
            chartTypeBtns.forEach(btn => {
                const type = btn.dataset.chartType;
                const span = btn.querySelector('span');
                if (span && i18n[currentLang][type]) {
                    span.textContent = i18n[currentLang][type];
                }
            });
            
            // Update timeframe buttons
            const timeframeBtns = document.querySelectorAll('.timeframe-btn');
            const timeframeMap = {
                '1D': 'timeframe_1d',
                '7D': 'timeframe_7d',
                '1M': 'timeframe_1m',
                '3M': 'timeframe_3m'
            };
            timeframeBtns.forEach(btn => {
                const tf = btn.dataset.timeframe;
                const key = timeframeMap[tf];
                if (key && i18n[currentLang][key]) {
                    btn.textContent = i18n[currentLang][key];
                }
            });
            
            // Update stats labels
            const statLabels = document.querySelectorAll('.stat-label');
            const statKeys = ['total_volume_24h', 'total_coins', 'avg_change', 'market_cap'];
            statLabels.forEach((label, index) => {
                if (statKeys[index] && i18n[currentLang][statKeys[index]]) {
                    label.textContent = i18n[currentLang][statKeys[index]];
                }
            });
            
            // Update chart info text
            updateChartInfo(currentChartType);
            
            // Update page title
            document.title = i18n[currentLang].charts + ' — CryptoUlarbek';
        }

        // Event Listeners
        function initEventListeners() {
            document.getElementById('themeToggle').addEventListener('click', toggleTheme);
            document.getElementById('refreshIndicator').addEventListener('click', () => {
                fetchCryptoData();
                resetRefreshTimer();
            });

            document.querySelectorAll('.timeframe-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.timeframe-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    updateChart(btn.dataset.timeframe);
                });
            });

            // Chart type selector
            document.querySelectorAll('.chart-type-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.chart-type-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentChartType = btn.dataset.chartType;
                    updateChartInfo(currentChartType);
                    const activeTimeframe = document.querySelector('.timeframe-btn.active')?.dataset.timeframe || '1D';
                    updateChart(activeTimeframe);
                });
            });

            document.getElementById('searchInput').addEventListener('input', filterTable);
        }

        // Data Fetching
        async function fetchCryptoData() {
            try {
                // Using local data to avoid CORS issues
                window.cryptoData = getLocalCryptoData();
                updateStats();
                renderTopLists();
                renderTable();
                updateSelectedCrypto();
                updateKyrgyzstanPrices();
                updateChart('1D');
            } catch (error) {
                console.error('Error fetching crypto data:', error);
                showError('Не удалось загрузить данные криптовалют');
            }
        }

        function getLocalCryptoData() {
            return [
                { symbol: 'BTC', name: 'Bitcoin', price: 81305.18, change24h: 0.83, volume: 64763000000, rank: 1, marketCap: 1600000000000 },
                { symbol: 'ETH', name: 'Ethereum', price: 2349.07, change24h: 1.36, volume: 23450000000, rank: 2, marketCap: 282000000000 },
                { symbol: 'BNB', name: 'BNB', price: 580.45, change24h: -0.24, volume: 1850000000, rank: 3, marketCap: 85000000000 },
                { symbol: 'SOL', name: 'Solana', price: 145.23, change24h: 2.15, volume: 3200000000, rank: 4, marketCap: 68000000000 },
                { symbol: 'XRP', name: 'XRP', price: 0.52, change24h: -1.45, volume: 1200000000, rank: 5, marketCap: 29000000000 },
                { symbol: 'ADA', name: 'Cardano', price: 0.35, change24h: 0.95, volume: 850000000, rank: 6, marketCap: 12500000000 },
                { symbol: 'DOGE', name: 'Dogecoin', price: 0.145, change24h: 1.85, volume: 950000000, rank: 7, marketCap: 21000000000 },
                { symbol: 'AVAX', name: 'Avalanche', price: 28.45, change24h: -0.75, volume: 650000000, rank: 8, marketCap: 11000000000 },
                { symbol: 'LINK', name: 'Chainlink', price: 12.85, change24h: 1.25, volume: 480000000, rank: 9, marketCap: 7800000000 },
                { symbol: 'DOT', name: 'Polkadot', price: 4.25, change24h: 0.65, volume: 320000000, rank: 10, marketCap: 5900000000 },
                { symbol: 'MATIC', name: 'Polygon', price: 0.42, change24h: -0.35, volume: 280000000, rank: 11, marketCap: 3900000000 },
                { symbol: 'UNI', name: 'Uniswap', price: 7.85, change24h: 2.45, volume: 195000000, rank: 12, marketCap: 5900000000 },
                { symbol: 'LTC', name: 'Litecoin', price: 75.20, change24h: 0.95, volume: 450000000, rank: 13, marketCap: 5600000000 },
                { symbol: 'ETC', name: 'Ethereum Classic', price: 19.85, change24h: -1.25, volume: 180000000, rank: 14, marketCap: 2900000000 },
                { symbol: 'ICP', name: 'Internet Computer', price: 8.45, change24h: 3.25, volume: 165000000, rank: 15, marketCap: 3900000000 },
                { symbol: 'FIL', name: 'Filecoin', price: 3.95, change24h: 1.85, volume: 220000000, rank: 16, marketCap: 2200000000 },
                { symbol: 'TRX', name: 'TRON', price: 0.155, change24h: -0.45, volume: 380000000, rank: 17, marketCap: 14000000000 },
                { symbol: 'NEAR', name: 'NEAR Protocol', price: 4.85, change24h: 2.15, volume: 195000000, rank: 18, marketCap: 5100000000 },
                { symbol: 'FTM', name: 'Fantom', price: 0.68, change24h: 1.75, volume: 165000000, rank: 19, marketCap: 1900000000 },
                { symbol: 'HBAR', name: 'Hedera', price: 0.055, change24h: -0.85, volume: 85000000, rank: 20, marketCap: 2000000000 },
                { symbol: 'VET', name: 'VeChain', price: 0.023, change24h: 0.65, volume: 95000000, rank: 21, marketCap: 1700000000 },
                { symbol: 'FLOW', name: 'Flow', price: 0.55, change24h: -1.35, volume: 65000000, rank: 22, marketCap: 830000000 },
                { symbol: 'MANA', name: 'Decentraland', price: 0.31, change24h: 2.25, volume: 125000000, rank: 23, marketCap: 580000000 },
                { symbol: 'SAND', name: 'The Sandbox', price: 0.27, change24h: 1.95, volume: 185000000, rank: 24, marketCap: 620000000 },
                { symbol: 'AXS', name: 'Axie Infinity', price: 4.85, change24h: -0.75, volume: 85000000, rank: 25, marketCap: 720000000 },
                { symbol: 'USDT', name: 'Tether', price: 1.00, change24h: 0.01, volume: 65000000000, rank: 26, marketCap: 83000000000 },
                { symbol: 'USDC', name: 'USD Coin', price: 1.00, change24h: 0.01, volume: 24000000000, rank: 27, marketCap: 55000000000 },
                { symbol: 'BUSD', name: 'Binance USD', price: 1.00, change24h: 0.01, volume: 2600000000, rank: 28, marketCap: 23000000000 },
                { symbol: 'SHIB', name: 'Shiba Inu', price: 0.000021, change24h: 1.15, volume: 1560000000, rank: 29, marketCap: 13000000000 },
                { symbol: 'APE', name: 'ApeCoin', price: 4.20, change24h: -0.45, volume: 350000000, rank: 30, marketCap: 1800000000 },
                { symbol: 'PEPE', name: 'Pepe', price: 0.000005, change24h: 3.20, volume: 420000000, rank: 31, marketCap: 4000000000 },
                { symbol: 'LDO', name: 'Lido DAO', price: 2.35, change24h: 0.85, volume: 120000000, rank: 32, marketCap: 3500000000 },
                { symbol: 'MKR', name: 'Maker', price: 1900, change24h: 0.65, volume: 23000000, rank: 33, marketCap: 2200000000 },
                { symbol: 'AAVE', name: 'Aave', price: 80, change24h: 1.10, volume: 410000000, rank: 34, marketCap: 1200000000 },
                { symbol: 'CRV', name: 'Curve', price: 0.62, change24h: -0.15, volume: 190000000, rank: 35, marketCap: 1500000000 },
                { symbol: 'SUSHI', name: 'SushiSwap', price: 1.20, change24h: 2.10, volume: 95000000, rank: 36, marketCap: 1400000000 },
                { symbol: 'XLM', name: 'Stellar', price: 0.10, change24h: -0.55, volume: 125000000, rank: 37, marketCap: 2200000000 },
                { symbol: 'ATOM', name: 'Cosmos', price: 9.10, change24h: 0.95, volume: 275000000, rank: 38, marketCap: 3400000000 },
                { symbol: 'NEO', name: 'NEO', price: 16.35, change24h: 1.20, volume: 95000000, rank: 39, marketCap: 1300000000 },
                { symbol: 'EOS', name: 'EOS', price: 1.15, change24h: -0.35, volume: 72000000, rank: 40, marketCap: 1250000000 },
                { symbol: 'XMR', name: 'Monero', price: 171.90, change24h: 0.50, volume: 220000000, rank: 41, marketCap: 3400000000 },
                { symbol: 'ZEC', name: 'Zcash', price: 62.10, change24h: -0.80, volume: 54000000, rank: 42, marketCap: 1400000000 },
                { symbol: 'BSV', name: 'Bitcoin SV', price: 41.20, change24h: 0.20, volume: 24000000, rank: 43, marketCap: 870000000 },
                { symbol: 'DASH', name: 'Dash', price: 54.80, change24h: -1.10, volume: 22000000, rank: 44, marketCap: 760000000 },
                { symbol: 'YFI', name: 'yearn.finance', price: 21200, change24h: 2.90, volume: 24000000, rank: 45, marketCap: 1280000000 },
                { symbol: 'COMP', name: 'Compound', price: 45.30, change24h: 1.15, volume: 72000000, rank: 46, marketCap: 890000000 },
                { symbol: 'SNX', name: 'Synthetix', price: 3.35, change24h: 1.55, volume: 72000000, rank: 47, marketCap: 560000000 },
                { symbol: 'ENJ', name: 'Enjin', price: 0.29, change24h: 0.95, volume: 36000000, rank: 48, marketCap: 520000000 },
                { symbol: 'ZRX', name: '0x', price: 0.57, change24h: -0.30, volume: 18000000, rank: 49, marketCap: 560000000 },
                { symbol: 'KSM', name: 'Kusama', price: 39.45, change24h: 2.50, volume: 85000000, rank: 50, marketCap: 3600000000 },
                { symbol: 'EGLD', name: 'Elrond', price: 52.90, change24h: 4.15, volume: 45000000, rank: 51, marketCap: 2600000000 },
                { symbol: 'HNT', name: 'Helium', price: 8.15, change24h: -0.95, volume: 22000000, rank: 52, marketCap: 1100000000 },
                { symbol: 'RUNE', name: 'THORChain', price: 4.99, change24h: 2.20, volume: 34000000, rank: 53, marketCap: 1400000000 },
                { symbol: 'ONT', name: 'Ontology', price: 0.74, change24h: -0.10, volume: 12500000, rank: 54, marketCap: 720000000 },
                { symbol: 'NEXO', name: 'Nexo', price: 1.90, change24h: 1.05, volume: 15500000, rank: 55, marketCap: 820000000 },
                { symbol: 'XTZ', name: 'Tezos', price: 1.90, change24h: -0.15, volume: 95000000, rank: 56, marketCap: 1700000000 },
                { symbol: 'CELO', name: 'Celo', price: 0.88, change24h: 1.45, volume: 12000000, rank: 57, marketCap: 640000000 },
                { symbol: 'GRT', name: 'The Graph', price: 0.25, change24h: 0.60, volume: 22000000, rank: 58, marketCap: 1300000000 },
                { symbol: 'CHZ', name: 'Chiliz', price: 0.15, change24h: 0.80, volume: 15500000, rank: 59, marketCap: 1200000000 },
                { symbol: 'ALGO', name: 'Algorand', price: 0.14, change24h: -0.45, volume: 18500000, rank: 60, marketCap: 960000000 },
                { symbol: 'QTUM', name: 'Qtum', price: 3.30, change24h: 1.10, volume: 6900000, rank: 61, marketCap: 800000000 },
                { symbol: 'ZIL', name: 'Zilliqa', price: 0.022, change24h: -0.25, volume: 5200000, rank: 62, marketCap: 340000000 },
                { symbol: 'ANKR', name: 'Ankr', price: 0.09, change24h: 0.75, volume: 6800000, rank: 63, marketCap: 620000000 },
                { symbol: 'OCEAN', name: 'Ocean Protocol', price: 0.42, change24h: 1.35, volume: 13500000, rank: 64, marketCap: 640000000 },
                { symbol: 'RAY', name: 'Raydium', price: 4.70, change24h: -0.25, volume: 32000000, rank: 65, marketCap: 910000000 },
                { symbol: 'FTT', name: 'FTX Token', price: 4.50, change24h: 0.15, volume: 12000000, rank: 66, marketCap: 470000000 },
                { symbol: 'LRC', name: 'Loopring', price: 0.55, change24h: 0.40, volume: 9500000, rank: 67, marketCap: 900000000 },
                { symbol: 'KNC', name: 'Kyber Network', price: 0.95, change24h: 0.30, volume: 5600000, rank: 68, marketCap: 830000000 },
                { symbol: 'IOTA', name: 'IOTA', price: 0.34, change24h: -0.40, volume: 11200000, rank: 69, marketCap: 920000000 },
                { symbol: 'IOTX', name: 'IoTeX', price: 0.03, change24h: 1.10, volume: 4800000, rank: 70, marketCap: 410000000 },
                { symbol: 'KAVA', name: 'Kava', price: 0.78, change24h: 0.95, volume: 4200000, rank: 71, marketCap: 610000000 },
                { symbol: 'AR', name: 'Arweave', price: 6.10, change24h: 0.60, volume: 12500000, rank: 72, marketCap: 510000000 },
                { symbol: 'STX', name: 'Stacks', price: 0.91, change24h: 0.75, volume: 6300000, rank: 73, marketCap: 720000000 },
                { symbol: 'SXP', name: 'Swipe', price: 1.20, change24h: 0.20, volume: 4100000, rank: 74, marketCap: 550000000 },
                { symbol: 'OGN', name: 'Origin Protocol', price: 0.25, change24h: -0.40, volume: 3200000, rank: 75, marketCap: 420000000 },
                { symbol: 'BTM', name: 'Bytom', price: 0.10, change24h: 0.75, volume: 2100000, rank: 76, marketCap: 290000000 },
                { symbol: 'NANO', name: 'Nano', price: 8.20, change24h: 1.05, volume: 3400000, rank: 77, marketCap: 690000000 },
                { symbol: 'GNO', name: 'Gnosis', price: 220, change24h: -0.60, volume: 1200000, rank: 78, marketCap: 760000000 },
                { symbol: 'KLAY', name: 'Klaytn', price: 0.22, change24h: 0.50, volume: 2500000, rank: 79, marketCap: 330000000 },
                { symbol: 'FLR', name: 'Flare', price: 0.012, change24h: 0.10, volume: 2200000, rank: 80, marketCap: 260000000 },
                { symbol: 'WBTC', name: 'Wrapped BTC', price: 81400, change24h: 0.81, volume: 120000000, rank: 81, marketCap: 8400000000 },
                { symbol: 'SNT', name: 'Status', price: 0.04, change24h: 0.20, volume: 1500000, rank: 82, marketCap: 250000000 },
                { symbol: 'HOT', name: 'Holo', price: 0.008, change24h: -0.10, volume: 9000000, rank: 83, marketCap: 220000000 },
                { symbol: 'RLY', name: 'Rally', price: 0.12, change24h: 1.40, volume: 1700000, rank: 84, marketCap: 200000000 },
                { symbol: 'LPT', name: 'Livepeer', price: 8.10, change24h: 0.95, volume: 5200000, rank: 85, marketCap: 410000000 },
                { symbol: 'QNT', name: 'Quant', price: 117, change24h: 1.65, volume: 7800000, rank: 86, marketCap: 3200000000 },
                { symbol: 'DGB', name: 'DigiByte', price: 0.022, change24h: -0.15, volume: 1300000, rank: 87, marketCap: 260000000 },
                { symbol: 'SC', name: 'Siacoin', price: 0.004, change24h: -0.20, volume: 1900000, rank: 88, marketCap: 310000000 },
                { symbol: 'XEM', name: 'NEM', price: 0.045, change24h: 0.35, volume: 1450000, rank: 89, marketCap: 460000000 },
                { symbol: 'REN', name: 'Ren', price: 0.22, change24h: -0.05, volume: 8200000, rank: 90, marketCap: 420000000 },
                { symbol: 'STORJ', name: 'Storj', price: 0.70, change24h: 0.85, volume: 5600000, rank: 91, marketCap: 290000000 },
                { symbol: 'THETA', name: 'Theta', price: 1.35, change24h: -0.25, volume: 21000000, rank: 92, marketCap: 1500000000 },
                { symbol: 'TFUEL', name: 'Theta Fuel', price: 0.048, change24h: 0.40, volume: 4800000, rank: 93, marketCap: 800000000 },
                { symbol: 'LUNA', name: 'Terra Classic', price: 0.0003, change24h: 2.10, volume: 3700000, rank: 94, marketCap: 190000000 },
                { symbol: 'STMX', name: 'StormX', price: 0.025, change24h: 0.90, volume: 2100000, rank: 95, marketCap: 180000000 },
                { symbol: 'LINA', name: 'Linear Finance', price: 0.012, change24h: 1.25, volume: 1700000, rank: 96, marketCap: 140000000 },
                // Kyrgyz coins
                { symbol: 'HUMO', name: 'Humo Token', price: 0.12, change24h: 1.8, volume: 180000, rank: 999, marketCap: 1200000, isKyrgyz: true },
                { symbol: 'KGS', name: 'Kyrgyz Som Coin', price: 0.05, change24h: -0.7, volume: 72000, rank: 999, marketCap: 500000, isKyrgyz: true },
                { symbol: 'BISH', name: 'Bishkek Token', price: 0.08, change24h: 2.2, volume: 94000, rank: 999, marketCap: 800000, isKyrgyz: true },
                { symbol: 'ATA', name: 'Ala-Too Coin', price: 0.03, change24h: 0.5, volume: 45000, rank: 999, marketCap: 300000, isKyrgyz: true }
            ];
        }

        // Stats Update
        function updateStats() {
            const totalVolume = window.cryptoData.reduce((sum, coin) => sum + coin.volume, 0);
            const totalCoins = window.cryptoData.length;
            const avgChange = window.cryptoData.reduce((sum, coin) => sum + coin.change24h, 0) / totalCoins;
            const marketCap = window.cryptoData.reduce((sum, coin) => sum + coin.marketCap, 0);

            document.getElementById('totalVolume').textContent = formatVolume(totalVolume);
            document.getElementById('totalCoins').textContent = totalCoins;
            document.getElementById('avgChange').textContent = `${avgChange.toFixed(2)}%`;
            document.getElementById('marketCap').textContent = formatVolume(marketCap);
        }

        // Format Volume with currency support
        function formatVolume(volume) {
            const symbol = currentCurrency === 'kgs' ? 'сом' : '$';
            const multiplier = currentCurrency === 'kgs' ? CONFIG.USD_TO_KGS : 1;
            const val = volume * multiplier;

            if (val >= 1e12) return `${symbol}${(val / 1e12).toFixed(2)}T`;
            if (val >= 1e9) return `${symbol}${(val / 1e9).toFixed(2)}B`;
            if (val >= 1e6) return `${symbol}${(val / 1e6).toFixed(2)}M`;
            if (val >= 1e3) return `${symbol}${(val / 1e3).toFixed(2)}K`;
            return `${symbol}${val.toFixed(2)}`;
        }

        // Render Top Lists
        function renderTopLists() {
            const gainers = [...window.cryptoData].filter(c => !c.isKyrgyz).sort((a, b) => b.change24h - a.change24h).slice(0, 5);
            const losers = [...window.cryptoData].filter(c => !c.isKyrgyz).sort((a, b) => a.change24h - b.change24h).slice(0, 5);
            const kyrgyz = window.cryptoData.filter(c => c.isKyrgyz);

            renderTopList('topGainers', gainers);
            renderTopList('topLosers', losers);
            renderTopList('kyrgyzCoins', kyrgyz);
        }

        function renderTopList(containerId, coins) {
            const container = document.getElementById(containerId);
            container.innerHTML = coins.map(coin => `
                <div class="crypto-item" onclick="selectCrypto('${coin.symbol}')">
                    <div style="display:flex; align-items:center; gap:0.75rem;">
                        <span class="crypto-item-icon"><img src="${getCryptoIcon(coin.symbol)}" alt="${coin.symbol} icon" loading="lazy" onerror="handleIconError(this, '${coin.symbol}')" data-symbol="${coin.symbol}" data-source-index="0"></span>
                        <div>
                            <div class="crypto-symbol">${coin.symbol}</div>
                            <div class="crypto-price-small">${formatPrice(coin.price)}</div>
                        </div>
                    </div>
                    <div class="crypto-change-small ${coin.change24h >= 0 ? 'positive' : 'negative'}">
                        ${coin.change24h >= 0 ? '+' : ''}${coin.change24h.toFixed(2)}%
                    </div>
                </div>
            `).join('');
        }

        // Render Table
        function renderTable() {
            const table = document.getElementById('cryptoTable');
            const allCoins = window.cryptoData;

            table.innerHTML = `
                <table class="table">
                    <thead>
                        <tr>
                            <th>${i18n[currentLang].rank}</th>
                            <th></th>
                            <th>${i18n[currentLang].symbol}</th>
                            <th>${i18n[currentLang].name}</th>
                            <th>${i18n[currentLang].price}</th>
                            <th>${i18n[currentLang].change_24h}</th>
                            <th>${i18n[currentLang].volume_24h}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${allCoins.map(coin => `
                            <tr onclick="selectCrypto('${coin.symbol}')" class="${selectedCrypto === coin.symbol ? 'selected' : ''}">
                                <td><span class="rank">#${coin.rank}</span></td>
                                <td><span class="table-icon"><img src="${getCryptoIcon(coin.symbol)}" alt="${coin.symbol} icon" loading="lazy" onerror="handleIconError(this, '${coin.symbol}')" data-symbol="${coin.symbol}" data-source-index="0"></span></td>
                                <td><span class="symbol">${coin.symbol}</span></td>
                                <td>${coin.name}</td>
                                <td><span class="price">${formatPrice(coin.price)}</span></td>
                                <td><span class="change ${coin.change24h >= 0 ? 'positive' : 'negative'}">${coin.change24h >= 0 ? '+' : ''}${coin.change24h.toFixed(2)}%</span></td>
                                <td><span class="volume">${formatVolume(coin.volume)}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }

        // Filter Table
        function filterTable() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const rows = document.querySelectorAll('.table tbody tr');

            rows.forEach(row => {
                const symbol = row.querySelector('.symbol').textContent.toLowerCase();
                const name = row.cells[2].textContent.toLowerCase();
                const visible = symbol.includes(searchTerm) || name.includes(searchTerm);
                row.style.display = visible ? '' : 'none';
            });
        }

        // Select Crypto
        function selectCrypto(symbol) {
            selectedCrypto = symbol;
            updateSelectedCrypto();

            const activeTimeframe = document.querySelector('.timeframe-btn.active')?.dataset.timeframe || '1D';
            updateChart(activeTimeframe);

            // Update table selection
            document.querySelectorAll('.table tbody tr').forEach(row => {
                const symbolEl = row.querySelector('.symbol');
                row.classList.toggle('selected', symbolEl && symbolEl.textContent === symbol);
            });

            // Scroll to chart smoothly
            scrollToChart();
        }

        // Scroll to Chart
        function scrollToChart() {
            const chartContainer = document.querySelector('.chart-container');
            if (chartContainer) {
                chartContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        // Update Chart Info Text
        function updateChartInfo(type) {
            const infoKey = 'chart_info_' + type;
            const infoEl = document.querySelector('.chart-info-text');
            if (infoEl && i18n[currentLang][infoKey]) {
                infoEl.textContent = i18n[currentLang][infoKey];
            }
        }

        // Currency Switcher
        function setCurrency(currency) {
            currentCurrency = currency;
            localStorage.setItem('crypto-currency', currency);

            // Update active button
            document.querySelectorAll('.currency-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.currency === currency);
            });

            // Refresh display
            updateSelectedCrypto();
            renderTable();
            updateStats();
        }

        // Update Kyrgyzstan Section Prices
        function updateKyrgyzstanPrices() {
            const coins = ['BTC', 'ETH', 'BNB', 'SOL'];
            coins.forEach(symbol => {
                const coin = window.cryptoData.find(c => c.symbol === symbol);
                if (coin) {
                    const kgsPrice = usdToKgs(coin.price);
                    const el = document.getElementById(symbol.toLowerCase() + 'KgsPrice');
                    if (el) el.textContent = formatKGS(kgsPrice);
                }
            });
        }

        // Scroll to chart section
        function scrollToChart() {
            document.querySelector('.chart-container').scrollIntoView({ behavior: 'smooth' });
        }

        // Load saved currency
        function loadCurrency() {
            const saved = localStorage.getItem('crypto-currency');
            if (saved) {
                currentCurrency = saved;
                document.querySelectorAll('.currency-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.currency === saved);
                });
            }
        }

        // Update Selected Crypto
        function updateSelectedCrypto() {
            const coin = window.cryptoData.find(c => c.symbol === selectedCrypto);
            if (!coin) return;

            const iconEl = document.getElementById('cryptoIcon');
            iconEl.dataset.symbol = coin.symbol;
            iconEl.src = getCryptoIcon(coin.symbol);
            document.getElementById('cryptoName').textContent = coin.name;
            document.getElementById('cryptoPrice').textContent = formatPrice(coin.price);
            document.getElementById('cryptoChange').textContent = `${coin.change24h >= 0 ? '+' : ''}${coin.change24h.toFixed(2)}%`;
            document.getElementById('cryptoChange').className = `crypto-change ${coin.change24h >= 0 ? 'positive' : 'negative'}`;
        }

        // Get Crypto Icon with multiple fallback sources
        function getCryptoIcon(symbol) {
            const symbolLower = symbol.toLowerCase();
            const placeholder = getPlaceholderIcon(symbol);

            // Kyrgyz coins - use placeholder with symbol letter
            if (['humo','kgs','bish','ata'].includes(symbolLower)) {
                return getKyrgyzIcon(symbol);
            }

            // Try multiple icon sources in order
            const iconSources = [
                // Source 1: CoinGecko (most reliable for popular coins)
                `https://assets.coingecko.com/coins/images/1/small/${symbolLower}.png`,
                // Source 2: CryptoCompare
                `https://www.cryptocompare.com/media/37746251/${symbolLower}.png`,
                // Source 3: Trust Wallet assets (GitHub CDN)
                `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${symbolLower}/logo.png`,
                // Source 4: Original cryptocurrency-icons
                `https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/${symbolLower}.png`,
                // Source 5: Alternative CDN
                `https://cryptoicons.org/api/icon/${symbolLower}/128`,
                // Source 6: Binance icon API
                `https://bin.bnbstatic.com/image/token/${symbolLower}.png`,
            ];

            // Return first source with onerror fallback chain
            return iconSources[0];
        }

        // Handle image error by trying next source
        function handleIconError(img, symbol) {
            const symbolLower = symbol.toLowerCase();
            const currentIndex = parseInt(img.getAttribute('data-source-index') || '0');

            const iconSources = [
                `https://assets.coingecko.com/coins/images/1/small/${symbolLower}.png`,
                `https://www.cryptocompare.com/media/37746251/${symbolLower}.png`,
                `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${symbolLower}/logo.png`,
                `https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/${symbolLower}.png`,
                `https://cryptoicons.org/api/icon/${symbolLower}/128`,
                `https://bin.bnbstatic.com/image/token/${symbolLower}.png`,
            ];

            const nextIndex = currentIndex + 1;
            if (nextIndex < iconSources.length) {
                img.src = iconSources[nextIndex];
                img.setAttribute('data-source-index', nextIndex);
            } else {
                // All sources failed, use generated placeholder
                img.src = getPlaceholderIcon(symbol);
            }
        }

        // Generate placeholder icon with symbol letter
        function getPlaceholderIcon(symbol) {
            const firstLetter = symbol.charAt(0).toUpperCase();
            const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];
            const color = colors[symbol.length % colors.length];

            const svg = `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="24" fill="${color}"/>
                <text x="24" y="32" font-family="Arial" font-size="20" font-weight="bold" fill="white" text-anchor="middle">${firstLetter}</text>
            </svg>`;

            return `data:image/svg+xml;base64,${btoa(svg)}`;
        }

        // Get Kyrgyz coin icons
        function getKyrgyzIcon(symbol) {
            const colors = {
                'humo': '#E11D48',
                'kgs': '#059669',
                'bish': '#7C3AED',
                'ata': '#D97706'
            };
            const names = {
                'humo': 'H',
                'kgs': 'K',
                'bish': 'B',
                'ata': 'A'
            };

            const color = colors[symbol.toLowerCase()] || '#6366F1';
            const letter = names[symbol.toLowerCase()] || symbol.charAt(0).toUpperCase();

            const svg = `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="24" fill="${color}"/>
                <text x="24" y="32" font-family="Arial" font-size="20" font-weight="bold" fill="white" text-anchor="middle">${letter}</text>
            </svg>`;

            return `data:image/svg+xml;base64,${btoa(svg)}`;
        }

        // Format Price with currency support
        function formatPrice(price, currency = currentCurrency) {
            if (currency === 'kgs') {
                const kgsPrice = usdToKgs(price);
                return formatKGS(kgsPrice);
            }
            // USD default
            if (price >= 1) return `$${price.toFixed(2)}`;
            if (price >= 0.01) return `$${price.toFixed(4)}`;
            return `$${price.toFixed(6)}`;
        }

        // Chart Management
        function updateChart(timeframe) {
            const wrapper = document.getElementById('chartWrapper');
            wrapper.innerHTML = '';

            setTimeout(() => {
                if (chartInstance && typeof chartInstance.dispose === 'function') {
                    chartInstance.dispose();
                }

                const coin = window.cryptoData.find(c => c.symbol === selectedCrypto);
                if (!coin) return;

                const chartData = generateChartData(timeframe, coin.price, coin.change24h);

                chartInstance = LightweightCharts.createChart(wrapper, {
                    layout: {
                        background: { color: 'transparent' },
                        textColor: 'var(--text-primary)',
                    },
                    grid: {
                        vertLines: { color: 'var(--border)' },
                        horzLines: { color: 'var(--border)' },
                    },
                    crosshair: {
                        mode: LightweightCharts.CrosshairMode.Normal,
                        vertLine: {
                            color: 'var(--primary)',
                            width: 1,
                            style: LightweightCharts.LineStyle.Dashed,
                            labelBackgroundColor: 'var(--primary)',
                        },
                        horzLine: {
                            color: 'var(--primary)',
                            width: 1,
                            style: LightweightCharts.LineStyle.Dashed,
                            labelBackgroundColor: 'var(--primary)',
                        },
                    },
                    rightPriceScale: {
                        borderColor: 'var(--border)',
                    },
                    timeScale: {
                        borderColor: 'var(--border)',
                        timeVisible: true,
                        secondsVisible: false,
                    },
                    localization: {
                        timeFormatter: (timestamp) => {
                            const date = new Date(timestamp * 1000);
                            return date.toLocaleString('ru-RU', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                            }) + ' GMT' + (date.getTimezoneOffset() / -60);
                        },
                    },
                });

                // Create series based on chart type
                let series;
                const chartColors = {
                    up: '#45b7d1',
                    down: '#ff6b6b',
                    line: '#00d4ff',
                    areaLine: '#10b981',
                    areaTop: 'rgba(16, 185, 129, 0.5)',
                    areaBottom: 'rgba(16, 185, 129, 0.05)'
                };

                switch (currentChartType) {
                    case 'line':
                        series = chartInstance.addLineSeries({
                            color: chartColors.line,
                            lineWidth: 2,
                            title: 'Цена закрытия',
                            priceFormat: {
                                type: 'price',
                                precision: 8,
                                minMove: 0.00000001,
                            },
                            crosshairMarkerVisible: true,
                            crosshairMarkerRadius: 4,
                        });
                        // Convert OHLC to line data (use close price)
                        const lineData = chartData.map(d => ({
                            time: d.time,
                            value: d.close
                        }));
                        series.setData(lineData);
                        break;

                    case 'area':
                        series = chartInstance.addAreaSeries({
                            lineColor: chartColors.areaLine,
                            topColor: chartColors.areaTop,
                            bottomColor: chartColors.areaBottom,
                            lineWidth: 2,
                            title: 'Цена',
                            lastValueVisible: true,
                            priceLineVisible: true,
                            priceFormat: {
                                type: 'price',
                                precision: 8,
                                minMove: 0.00000001,
                            },
                            crosshairMarkerVisible: true,
                            crosshairMarkerRadius: 4,
                        });
                        const areaData = chartData.map(d => ({
                            time: d.time,
                            value: d.close
                        }));
                        series.setData(areaData);
                        break;

                    case 'bars':
                        series = chartInstance.addBarSeries({
                            upColor: chartColors.up,
                            downColor: chartColors.down,
                            thinBars: false,
                            priceFormat: {
                                type: 'price',
                                precision: 8,
                                minMove: 0.00000001,
                            },
                        });
                        series.setData(chartData);
                        break;

                    case 'candles':
                    default:
                        series = chartInstance.addCandlestickSeries({
                            upColor: chartColors.up,
                            downColor: chartColors.down,
                            borderVisible: false,
                            wickUpColor: chartColors.up,
                            wickDownColor: chartColors.down,
                            priceFormat: {
                                type: 'price',
                                precision: 8,
                                minMove: 0.00000001,
                            },
                        });
                        series.setData(chartData);
                        // Add tooltip data for candles
                        series.applyOptions({
                            lastValueVisible: true,
                        });
                        break;
                }

                chartInstance.timeScale().fitContent();

                // Create custom tooltip
                const tooltipEl = document.createElement('div');
                tooltipEl.className = 'chart-tooltip';
                tooltipEl.style.cssText = `
                    position: absolute;
                    display: none;
                    background: var(--bg-glass);
                    backdrop-filter: blur(10px);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    padding: 12px;
                    font-size: 12px;
                    color: var(--text-primary);
                    pointer-events: none;
                    z-index: 100;
                    box-shadow: var(--shadow);
                `;
                wrapper.appendChild(tooltipEl);

                // Format price helper
                const formatTooltipPrice = (price) => {
                    if (price >= 1) return price.toFixed(2);
                    if (price >= 0.01) return price.toFixed(4);
                    if (price >= 0.0001) return price.toFixed(6);
                    return price.toFixed(8);
                };

                // Subscribe to crosshair move for tooltip
                chartInstance.subscribeCrosshairMove((param) => {
                    if (!param.time || !param.point) {
                        tooltipEl.style.display = 'none';
                        return;
                    }

                    const data = param.seriesData.get(series);
                    if (!data) {
                        tooltipEl.style.display = 'none';
                        return;
                    }

                    const date = new Date(param.time * 1000);
                    const dateStr = date.toLocaleString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    }) + ' GMT' + (date.getTimezoneOffset() / -60);

                    let price, volume;
                    if (currentChartType === 'candles' || currentChartType === 'bars') {
                        price = data.close || data.value || 0;
                        // Generate fake volume for display
                        volume = Math.floor(Math.random() * 100000000) + 10000000;
                    } else {
                        price = data.value || 0;
                        volume = Math.floor(Math.random() * 100000000) + 10000000;
                    }

                    tooltipEl.innerHTML = `
                        <div style="margin-bottom: 6px; color: var(--text-secondary);">${dateStr}</div>
                        <div style="margin-bottom: 4px;"><span style="color: var(--text-secondary);">Цена:</span> <span style="font-weight: 600;">${formatTooltipPrice(price)} $</span></div>
                        <div><span style="color: var(--text-secondary);">Объём:</span> <span style="font-weight: 600;">${(volume / 1000000).toFixed(0)} ${volume >= 1000000000 ? 'M' : 'M'} $</span></div>
                    `;

                    // Position tooltip near crosshair but keep inside chart
                    const chartRect = wrapper.getBoundingClientRect();
                    let left = param.point.x + 15;
                    let top = param.point.y + 15;

                    // Keep tooltip inside chart bounds
                    if (left + 200 > chartRect.width) {
                        left = param.point.x - 215;
                    }
                    if (top + 100 > chartRect.height) {
                        top = param.point.y - 100;
                    }

                    tooltipEl.style.left = left + 'px';
                    tooltipEl.style.top = top + 'px';
                    tooltipEl.style.display = 'block';
                });

            }, 500);
        }

        // Generate Chart Data
        function generateChartData(timeframe, currentPrice, changePercent) {
            const now = Math.floor(Date.now() / 1000);
            const data = [];
            let price = currentPrice * (1 - changePercent / 100);

            const intervals = {
                '1D': 3600, // 1 hour intervals for 1 day
                '7D': 21600, // 6 hour intervals for 7 days
                '1M': 86400, // 1 day intervals for 1 month
                '3M': 259200 // 3 day intervals for 3 months
            };

            const interval = intervals[timeframe] || 3600;
            const points = timeframe === '1D' ? 24 : timeframe === '7D' ? 28 : timeframe === '1M' ? 30 : 30;

            for (let i = points; i >= 0; i--) {
                const time = now - (i * interval);
                const volatility = 0.02; // 2% volatility
                const change = (Math.random() - 0.5) * volatility;
                price = price * (1 + change);

                const open = price;
                const close = price * (1 + (Math.random() - 0.5) * 0.01);
                const high = Math.max(open, close) * (1 + Math.random() * 0.005);
                const low = Math.min(open, close) * (1 - Math.random() * 0.005);

                data.push({
                    time: time,
                    open: open,
                    high: high,
                    low: low,
                    close: close,
                });
            }

            return data;
        }

        // Refresh Timer
        function startRefreshTimer() {
            refreshCountdown = CONFIG.REFRESH_INTERVAL / 1000;
            updateRefreshCountdown();

            refreshTimer = setInterval(() => {
                refreshCountdown--;
                updateRefreshCountdown();

                if (refreshCountdown <= 0) {
                    fetchCryptoData();
                    resetRefreshTimer();
                }
            }, 1000);
        }

        function resetRefreshTimer() {
            clearInterval(refreshTimer);
            startRefreshTimer();
        }

        function updateRefreshCountdown() {
            document.getElementById('refreshCountdown').textContent = refreshCountdown;
        }

        // Error Handling
        function showError(message) {
            console.error(message);
            // Could add toast notification here
        }

        // Global functions for onclick handlers
        window.selectCrypto = selectCrypto;
        window.handleIconError = handleIconError;
        window.getCryptoIcon = getCryptoIcon;
        window.getPlaceholderIcon = getPlaceholderIcon;
        window.getKyrgyzIcon = getKyrgyzIcon;