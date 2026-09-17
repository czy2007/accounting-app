import React from 'react';

function Header({ currentMonth, onMonthChange, onExportCSV, isDarkMode, onToggleDarkMode }) {
  return (
    <>
      <h1 style={{
        textAlign: 'center', fontSize: '28px', fontWeight: '800', 
        marginBottom: '20px', color: isDarkMode ? '#38bdf8' : '#1e3a8a', // 🎯 依主題調整標題顏色 (亮藍)
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        transition: 'color 0.3s ease'
      }}>
        💰 我的記帳 App
      </h1>

      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center', 
        backgroundColor: isDarkMode ? '#2c3846' : '#1e3a8a', // 🎯 對齊財務分析的鋼鐵藍灰背景
        color: '#ffffff', padding: '10px 16px', 
        borderRadius: '16px', marginBottom: '24px', 
        boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(30, 58, 138, 0.25)',
        border: isDarkMode ? '1.5px solid #3a4859' : '2px solid #1e3a8a',
        transition: 'all 0.3s ease'
      }}>
        {/* 左側區塊：主題切換按鈕 */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            type="button"
            onClick={onToggleDarkMode}
            style={{
              backgroundColor: isDarkMode ? '#1e2632' : 'rgba(255,255,255,0.2)',
              color: '#ffffff',
              border: isDarkMode ? '1px solid #3a4859' : 'none',
              borderRadius: '10px',
              padding: '6px 12px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            {isDarkMode ? '🌙 暗黑' : '☀️ 白天'}
          </button>
        </div>

        {/* 中間區塊：月份切換（維持絕對置中） */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            type="button" 
            onClick={() => onMonthChange(-1)} 
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', fontSize: '16px', borderRadius: '10px', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ◀
          </button>
          <span style={{ fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🗓️ {currentMonth}
          </span>
          <button 
            type="button" 
            onClick={() => onMonthChange(1)} 
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', fontSize: '16px', borderRadius: '10px', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ▶
          </button>
        </div>

        {/* 右側區塊：匯出 Excel 按鈕 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onExportCSV}
            style={{
              backgroundColor: isDarkMode ? '#0284c7' : '#e0f2fe',
              color: isDarkMode ? '#ffffff' : '#0284c7',
              border: isDarkMode ? '1.5px solid #38bdf8' : '1.5px solid #38bdf8',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '14px',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
          >
            📥 匯出 Excel
          </button>
        </div>
      </div>
    </>
  );
}

export default Header;