// 幣別基礎資訊
export const DEFAULT_RATES = {
  TWD: { symbol: 'NT$', rate: 1, flag: '🇹🇼', code: 'TWD' },
  USD: { symbol: '$', rate: 0.031, flag: '🇺🇸', code: 'USD' },
  JPY: { symbol: '¥', rate: 4.65, flag: '🇯🇵', code: 'JPY' },
  EUR: { symbol: '€', rate: 0.028, flag: '🇪🇺', code: 'EUR' },
  GBP: { symbol: '£', rate: 0.024, flag: '🇬🇧', code: 'GBP' },
  HKD: { symbol: 'HK$', rate: 0.24, flag: '🇭🇰', code: 'HKD' },
  KRW: { symbol: '₩', rate: 41.5, flag: '🇰🇷', code: 'KRW' }
};

// 幣別多語系名稱字典（提供 繁中、英文、日文、韓文 預設備用）
export const CURRENCY_NAMES = {
  'zh-TW': {
    TWD: '新台幣', USD: '美元', JPY: '日圓', EUR: '歐元', GBP: '英鎊', HKD: '港幣', KRW: '韓元',
    offline: '離線備用'
  },
  'en': {
    TWD: 'NTD', USD: 'USD', JPY: 'JPY', EUR: 'EUR', GBP: 'GBP', HKD: 'HKD', KRW: 'KRW',
    offline: 'Offline Fallback'
  },
  'ja': {
    TWD: '新台湾ドル', USD: '米ドル', JPY: '日本円', EUR: 'ユーロ', GBP: '英ポンド', HKD: '香港ドル', KRW: '韓国ウォン',
    offline: 'オフライン予備'
  },
  'ko': {
    TWD: '대만 달러', USD: '미국 달러', JPY: '일본 엔', EUR: '유로', GBP: '영국 파운드', HKD: '홍콩 달러', KRW: '대한민국 원',
    offline: '오프라인 백업'
  }
};

// 快取有效時間：1 小時 (以毫秒計算)
const CACHE_EXPIRE_TIME = 60 * 60 * 1000;

/**
 * 從免費即時 API 抓取最新匯率（支援基準幣別、多語系與快取機制）
 * @param {string} baseCurrency - 主要基準幣別，預設為 'TWD'
 * @param {boolean} forceRefresh - 是否強制跳過快取重新發送 API 請求
 * @param {string} lang - 當前語言 (zh-TW, en, ja, ko)
 */
export const fetchExchangeRates = async (baseCurrency = 'TWD', forceRefresh = false, lang = 'zh-TW') => {
  const cacheKey = `accounting_rates_${baseCurrency}`;
  const now = Date.now();
  const langDict = CURRENCY_NAMES[lang] || CURRENCY_NAMES['zh-TW'];

  // 1. 檢查 LocalStorage 是否有未過期的快取 (非強制刷新時才檢查)
  if (!forceRefresh) {
    try {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const { rates, timestamp } = JSON.parse(cachedData);
        // 若未超過 1 小時，直接回傳快取資料
        if (now - timestamp < CACHE_EXPIRE_TIME) {
          console.log(`⚡ [快取生效] 使用本地存儲的 ${baseCurrency} 匯率資料`);
          return {
            rates,
            isFallback: false,
            lastUpdated: new Date(timestamp).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })
          };
        }
      }
    } catch (e) {
      console.warn('⚠️ 讀取本地匯率快取失敗：', e);
    }
  }

  // 2. 若無快取、快取過期，或使用者手動刷新，則向 API 發送請求
  try {
    console.log(`🌐 發送 API 請求最新匯率 (基準幣別: ${baseCurrency})...`);
    const response = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`);

    if (!response.ok) {
      throw new Error(`HTTP 錯誤！狀態碼: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.result === 'success' && data.rates) {
      const updatedRates = {};
      Object.keys(DEFAULT_RATES).forEach((code) => {
        updatedRates[code] = {
          ...DEFAULT_RATES[code],
          rate: data.rates[code] || DEFAULT_RATES[code].rate
        };
      });

      // 寫入快取
      localStorage.setItem(cacheKey, JSON.stringify({
        rates: updatedRates,
        timestamp: now
      }));

      return {
        rates: updatedRates,
        isFallback: false,
        lastUpdated: new Date(now).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })
      };
    } else {
      throw new Error('API 回傳資料格式異常');
    }
  } catch (error) {
    console.warn('⚠️ 抓取即時匯率失敗，改用預設保底匯率:', error.message);
    return {
      rates: DEFAULT_RATES,
      isFallback: true,
      lastUpdated: langDict.offline
    };
  }
};