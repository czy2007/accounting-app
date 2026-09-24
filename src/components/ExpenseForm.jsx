import React from 'react';
import { DEFAULT_RATES } from './currencyUtils';

function ExpenseForm({
  isOpen,
  onClose,
  onSubmit,
  editingId,
  type,
  setType,
  date,
  setDate,
  category,
  setCategory,
  amount,
  setAmount,
  name,
  setName,
  currency = 'TWD',
  setCurrency,
  rates = DEFAULT_RATES,
  isDarkMode = false
}) {
  if (!isOpen) return null;

  // 確保 rates 有資料，避開 undefined 崩潰
  const currentRates = rates || DEFAULT_RATES;
  const selectedCurrencyInfo = currentRates[currency] || DEFAULT_RATES[currency] || DEFAULT_RATES.TWD || { rate: 1, symbol: 'NT$' };
  const currentRate = selectedCurrencyInfo.rate || 1;

  // 安全計算折合台幣
  const numAmount = Number(amount) || 0;
  const twdEquivalent = numAmount > 0 ? Math.round(numAmount / currentRate) : 0;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      padding: '20px', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: isDarkMode ? '#2c3846' : '#ffffff',
        color: isDarkMode ? '#f8fafc' : '#0f172a',
        width: '100%', maxWidth: '420px',
        borderRadius: '24px', padding: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: isDarkMode ? '1.5px solid #3a4859' : '2.5px solid #1e3a8a'
      }}>
        {/* 標題與關閉按鈕 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: isDarkMode ? '#38bdf8' : '#1e3a8a' }}>
            {editingId ? '✏️ 編輯記帳' : '➕ 新增記帳'}
          </h3>
          <button type="button" onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* 收入 / 支出 切換 */}
          <div style={{ display: 'flex', gap: '8px', backgroundColor: isDarkMode ? '#1e2632' : '#f1f5f9', padding: '4px', borderRadius: '12px', border: isDarkMode ? '1px solid #3a4859' : '1.5px solid #1e3a8a' }}>
            <button
              type="button"
              onClick={() => { setType('expense'); setCategory('🍔 餐飲'); }}
              style={{
                flex: 1, padding: '10px', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer',
                backgroundColor: type === 'expense' ? '#ef4444' : 'transparent',
                color: type === 'expense' ? '#ffffff' : '#64748b'
              }}
            >
              💸 支出
            </button>
            <button
              type="button"
              onClick={() => { setType('income'); setCategory('💰 薪水'); }}
              style={{
                flex: 1, padding: '10px', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer',
                backgroundColor: type === 'income' ? '#10b981' : 'transparent',
                color: type === 'income' ? '#ffffff' : '#64748b'
              }}
            >
              💵 收入
            </button>
          </div>

          {/* 日期與分類 */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                padding: '12px', borderRadius: '12px',
                border: isDarkMode ? '1.5px solid #3a4859' : '2px solid #1e3a8a',
                backgroundColor: isDarkMode ? '#1e2632' : '#f8fafc',
                color: isDarkMode ? '#f8fafc' : '#1e293b', fontSize: '14px', outline: 'none'
              }}
            />

            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              style={{
                flex: 1, padding: '12px', borderRadius: '12px',
                border: isDarkMode ? '1.5px solid #3a4859' : '2px solid #1e3a8a',
                backgroundColor: isDarkMode ? '#1e2632' : '#f8fafc',
                color: isDarkMode ? '#f8fafc' : '#1e293b', fontSize: '15px', outline: 'none', cursor: 'pointer'
              }}
            >
              {type === 'expense' ? (
                <>
                  <option value="🍔 餐飲">🍔 餐飲</option>
                  <option value="🚗 交通">🚗 交通</option>
                  <option value="🎬 娛樂">🎬 娛樂</option>
                  <option value="🛒 購物">🛒 購物</option>
                  <option value="👔 服飾">👔 服飾</option>
                  <option value="🎁 禮物">🎁 禮物</option>
                  <option value="💡 雜項">💡 雜項</option>
                </>
              ) : (
                <>
                  <option value="💰 薪水">💰 薪水</option>
                  <option value="📈 投資">📈 投資</option>
                  <option value="🧧 紅包">🧧 紅包</option>
                  <option value="💼 副業">💼 副業</option>
                  <option value="💡 其他收入">💡 其他收入</option>
                </>
              )}
            </select>
          </div>

          {/* 💱 金額與幣別選擇區塊 */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="number" 
              placeholder="輸入金額" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              style={{
                flex: 1, padding: '12px 14px', borderRadius: '12px',
                border: isDarkMode ? '1.5px solid #3a4859' : '2px solid #1e3a8a',
                backgroundColor: isDarkMode ? '#1e2632' : '#f8fafc',
                color: isDarkMode ? '#f8fafc' : '#0f172a', fontSize: '15px', outline: 'none'
              }}
            />

            <select
              value={currency}
              onChange={(e) => {
                const selected = e.target.value;
                if (setCurrency) {
                  setCurrency(selected);
                } else {
                  console.error('⚠️ setCurrency 未傳入 ExpenseForm！');
                }
              }}
              style={{
                padding: '12px', borderRadius: '12px',
                border: isDarkMode ? '1.5px solid #3a4859' : '2px solid #1e3a8a',
                backgroundColor: isDarkMode ? '#1e2632' : '#f8fafc',
                color: isDarkMode ? '#f8fafc' : '#1e3a8a', fontWeight: '700', fontSize: '14px', cursor: 'pointer'
              }}
            >
              {Object.keys(currentRates).map((code) => (
                <option key={code} value={code}>
                  {currentRates[code]?.symbol || ''} {code}
                </option>
              ))}
            </select>
          </div>

          {/* 換算折合台幣即時提示 */}
          {currency !== 'TWD' && numAmount > 0 && (
            <div style={{
              fontSize: '12px', fontWeight: '700', color: isDarkMode ? '#38bdf8' : '#0284c7',
              backgroundColor: isDarkMode ? '#1e2632' : '#e0f2fe',
              padding: '6px 12px', borderRadius: '8px', textAlign: 'right'
            }}>
              💱 折合台幣約：NT$ {twdEquivalent.toLocaleString()}
            </div>
          )}

          {/* 備註 */}
          <input 
            type="text" 
            placeholder="備註 (選填，例如：東京拉麵、公車)" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            style={{
              padding: '12px 14px', borderRadius: '12px',
              border: isDarkMode ? '1.5px solid #3a4859' : '2px solid #1e3a8a',
              backgroundColor: isDarkMode ? '#1e2632' : '#f8fafc',
              color: isDarkMode ? '#f8fafc' : '#0f172a', fontSize: '15px', outline: 'none'
            }}
          />

          {/* 送出與取消按鈕 */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: '12px', borderRadius: '12px', border: isDarkMode ? '1.5px solid #3a4859' : '2px solid #cbd5e1', backgroundColor: 'transparent', color: isDarkMode ? '#94a3b8' : '#64748b', fontWeight: '800', cursor: 'pointer' }}
            >
              取消
            </button>
            <button
              type="submit"
              style={{
                flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                backgroundColor: type === 'expense' ? '#ef4444' : '#10b981',
                color: '#ffffff', fontWeight: '800', cursor: 'pointer'
              }}
            >
              {editingId ? '儲存修改' : '確認新增'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ExpenseForm;