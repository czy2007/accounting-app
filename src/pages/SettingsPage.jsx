import React from 'react';

function SettingsPage({ isDarkMode, baseCurrency, onBaseCurrencyChange, rates }) {
  const cardStyle = {
    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
    transition: 'all 0.3s ease'
  };

  const selectStyle = {
    padding: '10px 14px',
    borderRadius: '10px',
    border: isDarkMode ? '1px solid #475569' : '1px solid #cbd5e1',
    backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
    color: isDarkMode ? '#f8fafc' : '#1e293b',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    outline: 'none'
  };

  return (
    <div style={{ flex: 1, width: '100%' }}>
      <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        ⚙️ 系統設定
      </h2>

      {/* 主要幣別設定 */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '17px', fontWeight: '700', marginBottom: '4px' }}>
              🌐 主要結算幣別
            </div>
            <div style={{ fontSize: '13px', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
              設定您慣用的預設貨幣，所有統計與圖表將以此幣別為主。
            </div>
          </div>

          <select 
            value={baseCurrency} 
            onChange={(e) => onBaseCurrencyChange(e.target.value)}
            style={selectStyle}
          >
            {Object.entries(rates).map(([code, info]) => (
              <option key={code} value={code}>
                {info.flag} {code} ({info.name})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;