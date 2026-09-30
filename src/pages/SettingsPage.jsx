// src/pages/SettingsPage.jsx
import React from 'react';
import { translations } from '../i18n';
import { useAppContext } from '../context/AppContext';
import * as XLSX from 'xlsx';

function SettingsPage() {
  const {
    isDarkMode,
    baseCurrency,
    setBaseCurrency,
    rates,
    isRatesLoading,
    lastUpdated,
    loadRates,
    lang,
    handleLanguageChange,
    t,
    transactions = []
  } = useAppContext();

  // 語言代碼對應的顯示名稱
  const languageNames = {
    'zh-TW': '繁體中文 (Traditional Chinese)',
    'zh-CN': '簡體中文 (Simplified Chinese)',
    'en': 'English',
    'ja': '日本語 (Japanese)',
    'ko': '한국어 (Korean)'
  };

  // 🌟 Excel 匯出功能
  const handleExportExcel = () => {
    if (!transactions || transactions.length === 0) {
      alert(t.noDataToExport || '目前沒有交易紀錄可供匯出');
      return;
    }

    const dataToExport = transactions.map((item, index) => ({
      [t.excelIndex || '序號']: index + 1,
      [t.excelDate || '日期']: item.date || '',
      [t.excelType || '類型']: item.type === 'income' ? (t.income || '收入') : (t.expense || '支出'),
      [t.excelCategory || '分類']: item.category || '',
      [t.excelAmount || '金額']: item.amount || 0,
      [t.excelCurrency || '幣別']: item.currency || baseCurrency,
      [t.excelWallet || '錢包']: item.wallet || '',
      [t.excelNote || '備註']: item.note || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

    const fileName = `Accounting_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const cardStyle = {
    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
    transition: 'all 0.3s ease',
    color: isDarkMode ? '#f8fafc' : '#1e293b'
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

  const exportButtonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#10b981',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none'
  };

  return (
    <div style={{ flex: 1, width: '100%', color: isDarkMode ? '#f8fafc' : '#1e293b' }}>
      <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        ⚙️ {t.settingsTitle || '系統設定'}
      </h2>

      {/* 1. 🌐 介面語言選擇 */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '17px', fontWeight: '700', marginBottom: '4px' }}>
              🌐 {t.languageSetting || '介面語言'}
            </div>
            <div style={{ fontSize: '13px', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
              {t.languageDesc || '切換系統顯示語言'}
            </div>
          </div>

          <select 
            value={lang} 
            onChange={(e) => handleLanguageChange(e.target.value)}
            style={selectStyle}
          >
            {Object.keys(translations).map((langKey) => (
              <option key={langKey} value={langKey} style={{ backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', color: isDarkMode ? '#f8fafc' : '#1e293b' }}>
                {languageNames[langKey] || langKey}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. 💰 主要幣別設定 */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '17px', fontWeight: '700', marginBottom: '4px' }}>
              💰 {t.baseCurrencySetting || '主要結算貨幣'}
            </div>
            <div style={{ fontSize: '13px', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
              {t.baseCurrencyDesc || '變更全站紀錄顯示之基準貨幣'}
            </div>
          </div>

          <select 
            value={baseCurrency} 
            onChange={(e) => setBaseCurrency(e.target.value)}
            style={selectStyle}
          >
            {Object.entries(rates).map(([code, info]) => (
              <option key={code} value={code} style={{ backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', color: isDarkMode ? '#f8fafc' : '#1e293b' }}>
                {info.flag || ''} {code} ({info.label || info.name || code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. 📊 資料匯出 (Excel) */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '17px', fontWeight: '700', marginBottom: '4px' }}>
              📊 {t.exportExcelTitle || '匯出 Excel 報表'}
            </div>
            <div style={{ fontSize: '13px', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
              {t.exportExcelDesc || '將所有記帳歷史紀錄匯出為 Excel 檔案'}
            </div>
          </div>

          <button 
            onClick={handleExportExcel}
            style={exportButtonStyle}
          >
            📥 {t.exportExcelBtn || '匯出 Excel'}
          </button>
        </div>
      </div>

      {/* 4. 💱 實時匯率狀態與手動刷新 */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '17px', fontWeight: '700', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              💱 {t.refreshRates || '強制更新即時匯率'}
            </div>
            <div style={{ fontSize: '13px', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
              {lastUpdated ? `${t.lastSynced || '最後同步時間'}：${lastUpdated}` : (t.autoRateDesc || '系統每 1 小時自動快取並更新最新國際匯率。')}
            </div>
          </div>

          <button 
            onClick={() => loadRates(true)} 
            disabled={isRatesLoading}
            style={buttonStyle}
          >
            <span style={{ 
              display: 'inline-block', 
              animation: isRatesLoading ? 'spin 1s linear infinite' : 'none' 
            }}>
              🔄
            </span>
            {isRatesLoading ? (t.updating || '更新中...') : (t.refreshRatesBtn || '手動更新匯率')}
          </button>
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
                <div style={{ fontSize: '15px', fontWeight: '700', color: isBase ? '#3b82f6' : (isDarkMode ? '#f8fafc' : '#1e293b') }}>
                  {info.symbol || ''} {Number(info.rate).toFixed(3)} {code}
                </div>
              </div>
            );
          })}
        </div>
      </div>

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