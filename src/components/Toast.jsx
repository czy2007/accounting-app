import React from 'react';

function Toast({ message, type = 'info', onClose, isDarkMode }) {
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

  return (
    <div
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
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: style.color,
            cursor: 'pointer',
            fontSize: '14px',
            marginLeft: '8px',
            padding: 0
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default Toast;