import React from 'react';

function Header({ currentMonth, onMonthChange }) {
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
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        backgroundColor: '#1e3a8a', color: '#ffffff', padding: '10px 16px', 
        borderRadius: '16px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(30, 58, 138, 0.25)',
        border: '2px solid #1e3a8a'
      }}>
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
    </>
  );
}

export default Header;