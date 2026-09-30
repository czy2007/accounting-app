// src/components/Toast.jsx
import React, { useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';

// 預設多語系字典 (備用關閉提示與常見通知)
const DEFAULT_TRANSLATIONS = {
  'zh-TW': { close: '關閉通知' },
  'zh-CN': { close: '关闭通知' },
  'ja': { close: '通知を閉じる' },
  'ko': { close: '알림 닫기' },
  'en': { close: 'Close notification' }
};

function Toast({ message, type = 'info', onClose, duration = 3000, isDarkMode }) {
  // 從 Context 取得當前語言設定
  const appContext = useAppContext ? useAppContext() : {};
  const currentLang = appContext?.language || 'zh-TW';
  const customTranslations = appContext?.translations || {};

  const t = useMemo(() => {
    const defaultDict = DEFAULT_TRANSLATIONS[currentLang] || DEFAULT_TRANSLATIONS['zh-TW'];
    const customDict = customTranslations[currentLang] || {};
    return { ...defaultDict, ...customDict };
  }, [currentLang, customTranslations]);

  // ⏱️ 自動倒數關閉提示
  useEffect(() => {
    if (!message || !onClose || duration <= 0) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  if (!message) return null;

  // 根據通知類型決定顏色與圖示
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: isDarkMode ? '#064e3b' : '#d1fae5',
          border: '#10b981',
          color: isDarkMode ? '#a7f3d0' : '#065f46',
          icon: '✅'
        };
      case 'error':
        return {
          bg: isDarkMode ? '#7f1d1d' : '#fee2e2',
          border: '#ef4444',
          color: isDarkMode ? '#fca5a5' : '#991b1b',
          icon: '❌'
        };
      case 'warning':
        return {
          bg: isDarkMode ? '#78350f' : '#fef3c7',
          border: '#f59e0b',
          color: isDarkMode ? '#fde68a' : '#92400e',
          icon: '⚠️'
        };
      default:
        return {
          bg: isDarkMode ? '#1e293b' : '#eff6ff',
          border: '#3b82f6',
          color: isDarkMode ? '#93c5fd' : '#1e40af',
          icon: 'ℹ️'
        };
    }
  };

  const style = getTypeStyles();

  // 若 message 為多語系 key 則自動翻譯，否則直接顯示原字串
  const displayMessage = t[message] || message;

  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 20px',
        borderRadius: '12px',
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        color: style.color,
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
        fontWeight: 'bold',
        fontSize: '14px',
        animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        maxWidth: '90%',
        boxSizing: 'border-box'
      }}
    >
      <style>{`
        @keyframes slideDown {
          from {
            transform: translate(-50%, -20px);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
      `}</style>
      <span>{style.icon}</span>
      <span>{displayMessage}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close || 'Close'}
          style={{
            background: 'none',
            border: 'none',
            color: style.color,
            cursor: 'pointer',
            fontSize: '14px',
            marginLeft: '8px',
            padding: 0,
            lineHeight: 1
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default Toast;