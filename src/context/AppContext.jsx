// src/context/AppContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { translations } from '../i18n';
import { fetchExchangeRates, DEFAULT_RATES } from '../components/currencyUtils';
import { getStorageItem, setStorageItem } from '../components/storage';

const AppContext = createContext();

export function AppProvider({ children }) {
  // 🌐 1. 多國語言 (i18n) 狀態 (安全載入)
  const [lang, setLang] = useState(() => getStorageItem('accounting_lang', 'zh-TW'));

  useEffect(() => {
    setStorageItem('accounting_lang', lang);
  }, [lang]);

  const t = translations[lang] || translations['zh-TW'];

  // 🔔 2. 全域 Toast 提示狀態 (包含 Timer 清理機制)
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const toastTimerRef = useRef(null);

  const handleCloseToast = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast({ show: false, message: '', type: 'info' });
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({ show: true, message, type });

    if (duration > 0) {
      toastTimerRef.current = setTimeout(() => {
        setToast({ show: false, message: '', type: 'info' });
        toastTimerRef.current = null;
      }, duration);
    }
  }, []);

  // 元件卸載時自動清理 Timer
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleLanguageChange = useCallback((newLang) => {
    setLang(newLang);
    const targetDict = translations[newLang] || translations['zh-TW'];
    const msg = targetDict?.langChanged || translations['zh-TW'].langChanged || 'Language changed successfully!';
    showToast(msg, 'success');
  }, [showToast]);

  // 🌙 3. 暗黑模式狀態 (安全載入)
  const [isDarkMode, setIsDarkMode] = useState(() => getStorageItem('accounting_theme', false));

  useEffect(() => {
    setStorageItem('accounting_theme', isDarkMode);
  }, [isDarkMode]);

  const handleToggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  // 💰 4. 主要結算幣別與匯率狀態 (安全載入)
  const [baseCurrency, setBaseCurrency] = useState(() => getStorageItem('accounting_base_currency', 'TWD'));

  useEffect(() => {
    setStorageItem('accounting_base_currency', baseCurrency);
  }, [baseCurrency]);

  const [rates, setRates] = useState(DEFAULT_RATES);
  const [isRatesLoading, setIsRatesLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const [isFallback, setIsFallback] = useState(false);

  const loadRates = useCallback(async (force = false) => {
    setIsRatesLoading(true);
    try {
      const result = await fetchExchangeRates(baseCurrency, force);
      setRates(result.rates || DEFAULT_RATES);
      setLastUpdated(result.lastUpdated || '');
      setIsFallback(result.isFallback || false);

      // 手動更新匯率成功時，彈出 Toast 提示通知！
      if (force) {
        const currentDict = translations[lang] || translations['zh-TW'];
        showToast(currentDict.ratesUpdated || '即時匯率已成功更新！', 'success');
      }
    } catch (error) {
      console.error('Failed to load rates:', error);
      if (force) {
        const currentDict = translations[lang] || translations['zh-TW'];
        showToast(currentDict.ratesError || '匯率更新失敗，請稍後再試', 'error');
      }
    } finally {
      setIsRatesLoading(false);
    }
  }, [baseCurrency, lang, showToast]);

  useEffect(() => {
    loadRates();
  }, [baseCurrency, loadRates]);

  // Memoize Context value 以避免無謂的子元件重繪
  const value = useMemo(() => ({
    // 語言與 i18n (同時提供短寫與完整拼寫相容性)
    lang,
    language: lang,
    setLang,
    t,
    translations,
    handleLanguageChange,

    // Toast 提示
    toast,
    showToast,
    handleCloseToast,

    // 主題模式
    isDarkMode,
    setIsDarkMode,
    handleToggleDarkMode,

    // 匯率與幣別
    baseCurrency,
    setBaseCurrency,
    rates,
    isRatesLoading,
    lastUpdated,
    isFallback,
    loadRates
  }), [
    lang,
    t,
    handleLanguageChange,
    toast,
    showToast,
    handleCloseToast,
    isDarkMode,
    handleToggleDarkMode,
    baseCurrency,
    rates,
    isRatesLoading,
    lastUpdated,
    isFallback,
    loadRates
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext 必須在 <AppProvider> 內部使用！');
  }
  return context;
}