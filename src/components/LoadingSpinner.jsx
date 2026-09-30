// src/components/LoadingSpinner.jsx
import React from 'react';
import { useAppContext } from '../context/AppContext';

function LoadingSpinner({ isDarkMode, text }) {
  // 🌐 i18n 辞書データの取得
  const { t } = useAppContext();

  // 外部から text が渡された場合はそれを優先し、なければ辞書データ、最後にフォールバック値を使用
  const spinnerText = text || t.loading || '読み込み中...';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1900,
        gap: '12px'
      }}
    >
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spinner-ring {
          width: 44px;
          height: 44px;
          border: 4px solid ${isDarkMode ? '#334155' : '#e2e8f0'};
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
      `}</style>
      <div className="spinner-ring" />
      <div
        style={{
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: '15px',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
        }}
      >
        {spinnerText}
      </div>
    </div>
  );
}

export default LoadingSpinner;