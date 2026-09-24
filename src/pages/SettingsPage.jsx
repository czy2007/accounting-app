import React from 'react';

function SettingsPage({ 
  isDarkMode, 
  baseCurrency, 
  onBaseCurrencyChange, 
  rates = {}, 
  isRatesLoading = false, 
  lastUpdated = '', 
  onRefreshRates 
}) {
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

  const buttonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: isRatesLoading ? (isDarkMode ? '#334155' : '#cbd5e1') : '#3b82f6',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '600',
    cursor: isRatesLoading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none'
  };

  return (
    <div style={{ flex: 1, width: '100%' }}>
      <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        ⚙️ 系統設定
      </h2>

      {/* 1. 主要幣別設定 */}
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
                {info.flag || ''} {code} ({info.label || info.name || code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. 實時匯率狀態與手動刷新 */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '17px', fontWeight: '700', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              💱 即時匯率資料
            </div>
            <div style={{ fontSize: '13px', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
              {lastUpdated ? `最後同步時間：${lastUpdated}` : '系統每 1 小時自動快取並更新最新國際匯率。'}
            </div>
          </div>

          {onRefreshRates && (
            <button 
              onClick={onRefreshRates} 
              disabled={isRatesLoading}
              style={buttonStyle}
            >
              <span style={{ 
                display: 'inline-block', 
                animation: isRatesLoading ? 'spin 1s linear infinite' : 'none' 
              }}>
                🔄
              </span>
              {isRatesLoading ? '刷新中...' : '手動更新匯率'}
            </button>
          )}
        </div>

        {/* 幣別對照參考表 */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
          gap: '10px',
          marginTop: '12px' 
        }}>
          {Object.entries(rates).map(([code, info]) => {
            const isBase = code === baseCurrency;
            return (
              <div 
                key={code} 
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
                  border: isBase ? '1px solid #3b82f6' : (isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0'),
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '12px', color: isDarkMode ? '#94a3b8' : '#64748b', marginBottom: '2px' }}>
                  1 {baseCurrency} ≈
                </div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: isBase ? '#3b82f6' : 'inherit' }}>
                  {info.symbol || ''} {Number(info.rate).toFixed(3)} {code}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 簡單加入旋轉 Keyframes CSS */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default SettingsPage;