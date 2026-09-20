// 預設匯率 (保底用)
export const DEFAULT_RATES = {
  TWD: { symbol: 'NT$', rate: 1, label: '新台幣 (TWD)' },
  USD: { symbol: '$', rate: 0.031, label: '美元 (USD)' },
  JPY: { symbol: '¥', rate: 4.65, label: '日圓 (JPY)' },
  EUR: { symbol: '€', rate: 0.028, label: '歐元 (EUR)' },
  GBP: { symbol: '£', rate: 0.024, label: '英鎊 (GBP)' }
};

/**
 * 從免費即時 API 抓取最新台幣匯率
 */
export const fetchExchangeRates = async () => {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/TWD');
    const data = await response.json();

    if (data && data.rates) {
      return {
        TWD: { symbol: 'NT$', rate: 1, label: '新台幣 (TWD)' },
        USD: { symbol: '$', rate: data.rates.USD || 0.031, label: '美元 (USD)' },
        JPY: { symbol: '¥', rate: data.rates.JPY || 4.65, label: '日圓 (JPY)' },
        EUR: { symbol: '€', rate: data.rates.EUR || 0.028, label: '歐元 (EUR)' },
        GBP: { symbol: '£', rate: data.rates.GBP || 0.024, label: '英鎊 (GBP)' }
      };
    }
  } catch (error) {
    console.warn('⚠️ 抓取即時匯率失敗，使用預設匯率:', error);
  }
  return DEFAULT_RATES;
};