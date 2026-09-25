// src/context/AppContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n';
import { fetchExchangeRates, DEFAULT_RATES } from '../components/currencyUtils';

const AppContext = createContext();

export function AppProvider({ children }) {
  // 🌐 1. 多國語言 (i18n) 狀態
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('accounting_lang') || 'zh-TW';
    } catch (e) {
      return 'zh-TW';
    }
  });

  useEffect(() => {
    localStorage.setItem('accounting_lang', lang);
  }, [lang]);

  const t = translations[lang] || translations['zh-TW'];

  // 🔔 2. 全域 Toast 提示狀態
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'info' });
    }, duration);
  };

  const handleCloseToast = () => {
    setToast({ show: false, message: '', type: 'info' });
  };

  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    const msg = newLang === 'zh-TW' 
      ? translations['zh-TW'].langChanged 
      : (translations[newLang]?.langChanged || translations['en'].langChanged);
    showToast(msg, 'success');
  };

  // 🌙 3. 暗黑模式狀態
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('accounting_theme');
      return savedTheme ? JSON.parse(savedTheme) : false;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem('accounting_theme', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // 💰 4. 主要結算幣別與匯率狀態
  const [baseCurrency, setBaseCurrency] = useState(() => {
    try {
      return localStorage.getItem('accounting_base_currency') || 'TWD';
    } catch (e) {
      return 'TWD';
    }
  });

  useEffect(() => {
    localStorage.setItem('accounting_base_currency', baseCurrency);
  }, [baseCurrency]);

  const [rates, setRates] = useState(DEFAULT_RATES);
  const [isRatesLoading, setIsRatesLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const [isFallback, setIsFallback] = useState(false);

  const loadRates = async (force = false) => {
    setIsRatesLoading(true);
    const result = await fetchExchangeRates(baseCurrency, force);
    setRates(result.rates);
    setLastUpdated(result.lastUpdated || '');
    setIsFallback(result.isFallback || false);
    setIsRatesLoading(false);

    // 手動更新匯率成功時，彈出 Toast 提示通知！
    if (force) {
      showToast(t.ratesUpdated || '即時匯率已成功更新！', 'success');
    }
  };

  useEffect(() => {
    loadRates();
  }, [baseCurrency]);

  const value = {
    lang,
    setLang,
    t,
    handleLanguageChange,
    toast,
    showToast,
    handleCloseToast,
    isDarkMode,
    handleToggleDarkMode,
    baseCurrency,
    setBaseCurrency,
    rates,
    isRatesLoading,
    lastUpdated,
    isFallback,
    loadRates
  };

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