// 預設匯率 (保底用，當離線或 API 故障時使用)
export const DEFAULT_RATES = {
  TWD: { symbol: 'NT$', rate: 1, flag: '🇹🇼', name: '新台幣', label: '新台幣 (TWD)' },
  USD: { symbol: '$', rate: 0.031, flag: '🇺🇸', name: '美元', label: '美元 (USD)' },
  JPY: { symbol: '¥', rate: 4.65, flag: '🇯🇵', name: '日圓', label: '日圓 (JPY)' },
  EUR: { symbol: '€', rate: 0.028, flag: '🇪🇺', name: '歐元', label: '歐元 (EUR)' },
  GBP: { symbol: '£', rate: 0.024, flag: '🇬🇧', name: '英鎊', label: '英鎊 (GBP)' },
  HKD: { symbol: 'HK$', rate: 0.24, flag: '🇭🇰', name: '港幣', label: '港幣 (HKD)' },
  KRW: { symbol: '₩', rate: 41.5, flag: '🇰🇷', name: '韓元', label: '韓元 (KRW)' }
};

// 快取有效時間：1 小時 (以毫秒計算)
const CACHE_EXPIRE_TIME = 60 * 60 * 1000;

/**
 * 從免費即時 API 抓取最新匯率（支援基準幣別與快取機制）
 * @param {string} baseCurrency - 主要基準幣別，預設為 'TWD'
 * @param {boolean} forceRefresh - 是否強制跳過快取重新發送 API 請求
 */
export const fetchExchangeRates = async (baseCurrency = 'TWD', forceRefresh = false) => {
  const cacheKey = `accounting_rates_${baseCurrency}`;
  const now = Date.now();

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
            lastUpdated: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
      // 保留原本的 symbol, flag, name 與 label，僅更新最新的 rate 數值
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
        lastUpdated: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    } else {
      throw new Error('API 回傳資料格式異常');
    }
  } catch (error) {
    console.warn('⚠️ 抓取即時匯率失敗，改用預設保底匯率:', error.message);
    return {
      rates: DEFAULT_RATES,
      isFallback: true,
      lastUpdated: '離線備用'
    };
  }
};