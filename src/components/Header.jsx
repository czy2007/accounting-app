import React from 'react';

function Header({ currentMonth, onMonthChange, onExportCSV }) {
  return (
    <>
      <h1 style={{
        textAlign: 'center', fontSize: '28px', fontWeight: '800', 
        marginBottom: '20px', color: '#1e3a8a', display: 'flex', 
        alignItems: 'center', justifyContent: 'center', gap: '8px'
      }}>
        💰 我的記帳 App
      </h1>

      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr', // 三等分欄位：左留白、中置中、右靠右
        alignItems: 'center', 
        backgroundColor: '#1e3a8a', color: '#ffffff', padding: '10px 16px', 
        borderRadius: '16px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(30, 58, 138, 0.25)',
        border: '2px solid #1e3a8a'
      }}>
        {/* 左側佔位區（維持中央元素絕對置中） */}
        <div />

        {/* 中間區塊：月份切換（完美置中） */}
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

        {/* 右側區塊：淡藍色「匯出 Excel」按鈕 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onExportCSV}
            style={{
              backgroundColor: '#e0f2fe',  // 淡藍色背景
              color: '#0284c7',            // 深天藍文字
              border: '1.5px solid #38bdf8',
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
             匯出 Excel
          </button>
        </div>
      </div>
    </>
  );
}

export default Header;