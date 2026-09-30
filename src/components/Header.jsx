// src/components/Header.jsx
import React from 'react';
import { useAppContext } from '../context/AppContext';

function Header({ currentMonth, onMonthChange, onExportCSV, isDarkMode, onToggleDarkMode }) {
  // 🌐 取得全域 i18n 字典檔
  const { t } = useAppContext();

  return (
    <>
      <h1 style={{
        textAlign: 'center',
        fontSize: '28px',
        fontWeight: '800', 
        marginBottom: '20px',
        color: isDarkMode ? '#38bdf8' : '#1e3a8a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'color 0.3s ease'
      }}>
        💰 {t.appTitle || '我的記帳 App'}
      </h1>

      <div 
        className="header-bar"
        style={{ 
          display: 'flex',
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'nowrap',                 /* 🎯 強迫單行，絕對不換行 */
          backgroundColor: isDarkMode ? '#2c3846' : '#1e3a8a',
          color: '#ffffff',
          padding: '8px 10px',                 /* 🎯 縮小容器邊距 */
          borderRadius: '16px',
          marginBottom: '24px', 
          boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(30, 58, 138, 0.25)',
          border: isDarkMode ? '1.5px solid #3a4859' : '2px solid #1e3a8a',
          transition: 'all 0.3s ease',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {/* 左側：模式切換 */}
        <button
          type="button"
          onClick={onToggleDarkMode}
          style={{
            backgroundColor: isDarkMode ? '#1e2632' : 'rgba(255,255,255,0.2)',
            color: '#ffffff',
            border: isDarkMode ? '1px solid #3a4859' : 'none',
            borderRadius: '8px',
            padding: '5px 8px',
            fontSize: 'clamp(11px, 3.2vw, 13px)',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          {isDarkMode 
            ? `🌙 ${t.themeDark || '深色'}` 
            : `☀️ ${t.themeLight || '淺色'}`}
        </button>

        {/* 中間：月份切換 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          <button 
            type="button" 
            onClick={() => onMonthChange(-1)} 
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#fff',
              fontSize: '12px',
              borderRadius: '6px',
              width: '26px',
              height: '26px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ◀
          </button>
          <span style={{ 
            fontSize: 'clamp(13px, 3.8vw, 16px)', 
            fontWeight: '800', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '2px', 
            whiteSpace: 'nowrap' 
          }}>
            🗓️ {currentMonth}
          </span>
          <button 
            type="button" 
            onClick={() => onMonthChange(1)} 
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#fff',
              fontSize: '12px',
              borderRadius: '6px',
              width: '26px',
              height: '26px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ▶
          </button>
        </div>

        {/* 右側：匯出 Excel */}
        <button
          type="button"
          onClick={onExportCSV}
          style={{
            backgroundColor: isDarkMode ? '#0284c7' : '#e0f2fe',
            color: isDarkMode ? '#ffffff' : '#0284c7',
            border: '1.5px solid #38bdf8',
            borderRadius: '8px',
            padding: '5px 8px',
            fontSize: 'clamp(11px, 3.2vw, 12px)',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
          }}
        >
          📊 {t.exportExcelHeaderBtn || 'Excel 匯出'}
        </button>
      </div>
    </>
  );
}

export default Header;