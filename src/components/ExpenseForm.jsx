import React, { useMemo } from 'react';
import { DEFAULT_RATES } from './currencyUtils';
import { useAppContext } from "../context/AppContext";

// 預設多語系字典 (包含繁體中文、英文、日文與韓文)
const DEFAULT_TRANSLATIONS = {
  'zh-TW': {
    editTitle: '✏️ 編輯記帳',
    addTitle: '➕ 新增記帳',
    btnExpense: '💸 支出',
    btnIncome: '💵 收入',
    amountPlaceholder: '輸入金額',
    notePlaceholder: '備註 (選填，例如：東京拉麵、公車)',
    twdEquivalent: '💱 折合台幣約：NT$ {amount}',
    btnCancel: '取消',
    btnSave: '儲存修改',
    btnConfirmAdd: '確認新增',
    errSetCurrency: '⚠️ setCurrency 未傳入 ExpenseForm！',
    categories: {
      FOOD: '🍔 餐飲',
      TRANSPORT: '🚗 交通',
      ENTERTAINMENT: '🎬 娛樂',
      SHOPPING: '🛒 購物',
      CLOTHING: '👔 服飾',
      GIFT: '🎁 禮物',
      MISC: '💡 雜項',
      SALARY: '💰 薪水',
      INVESTMENT: '📈 投資',
      RED_ENVELOPE: '🧧 紅包',
      SIDE_JOB: '💼 副業',
      OTHER_INCOME: '💡 其他收入'
    }
  },
  'en': {
    editTitle: '✏️ Edit Transaction',
    addTitle: '➕ Add Transaction',
    btnExpense: '💸 Expense',
    btnIncome: '💵 Income',
    amountPlaceholder: 'Enter amount',
    notePlaceholder: 'Notes (Optional, e.g., Tokyo Ramen, Bus)',
    twdEquivalent: '💱 Approx. TWD: NT$ {amount}',
    btnCancel: 'Cancel',
    btnSave: 'Save Changes',
    btnConfirmAdd: 'Confirm Add',
    errSetCurrency: '⚠️ setCurrency is not passed to ExpenseForm!',
    categories: {
      FOOD: '🍔 Food',
      TRANSPORT: '🚗 Transport',
      ENTERTAINMENT: '🎬 Entertainment',
      SHOPPING: '🛒 Shopping',
      CLOTHING: '👔 Clothing',
      GIFT: '🎁 Gift',
      MISC: '💡 Misc',
      SALARY: '💰 Salary',
      INVESTMENT: '📈 Investment',
      RED_ENVELOPE: '🧧 Red Packet',
      SIDE_JOB: '💼 Side Hustle',
      OTHER_INCOME: '💡 Other Income'
    }
  },
  'ja': {
    editTitle: '✏️ 編集',
    addTitle: '➕ 新規記録',
    btnExpense: '💸 支出',
    btnIncome: '💵 収入',
    amountPlaceholder: '金額を入力',
    notePlaceholder: 'メモ (任意、例：東京ラーメン、バス)',
    twdEquivalent: '💱 台湾ドル換算：NT$ {amount}',
    btnCancel: 'キャンセル',
    btnSave: '変更を保存',
    btnConfirmAdd: '追加を確定',
    errSetCurrency: '⚠️ setCurrency が ExpenseForm に渡されていません！',
    categories: {
      FOOD: '🍔 外食・食費',
      TRANSPORT: '🚗 交通費',
      ENTERTAINMENT: '🎬 娯楽・趣味',
      SHOPPING: '🛒 買い物',
      CLOTHING: '👔 衣服・美容',
      GIFT: '🎁 プレゼント',
      MISC: '💡 雑費',
      SALARY: '💰 給料',
      INVESTMENT: '📈 投資収入',
      RED_ENVELOPE: '🧧 お小遣い・祝儀',
      SIDE_JOB: '💼 副業',
      OTHER_INCOME: '💡 その他収入'
    }
  },
  'ko': {
    editTitle: '✏️ 내역 수정',
    addTitle: '➕ 내역 추가',
    btnExpense: '💸 지출',
    btnIncome: '💵 수입',
    amountPlaceholder: '금액 입력',
    notePlaceholder: '메모 (선택, 예: 도쿄 라멘, 버스)',
    twdEquivalent: '💱 대만 달러 환산 약: NT$ {amount}',
    btnCancel: '취소',
    btnSave: '수정 저장',
    btnConfirmAdd: '추가 확인',
    errSetCurrency: '⚠️ setCurrency가 ExpenseForm에 전달되지 않았습니다!',
    categories: {
      FOOD: '🍔 식비',
      TRANSPORT: '🚗 교통',
      ENTERTAINMENT: '🎬 문화/유흥',
      SHOPPING: '🛒 쇼핑',
      CLOTHING: '👔 의류/미용',
      GIFT: '🎁 선물',
      MISC: '💡 기타 지출',
      SALARY: '💰 급여',
      INVESTMENT: '📈 투자',
      RED_ENVELOPE: '🧧 용돈/축의금',
      SIDE_JOB: '💼 부업',
      OTHER_INCOME: '💡 기타 수입'
    }
  }
};

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
  // 從 Context 取得當前語言設定或字典，若無則預設為 'zh-TW'
  const appContext = useAppContext ? useAppContext() : {};
  const currentLang = appContext?.language || 'zh-TW';
  const customTranslations = appContext?.translations || {};

  // 多語系字典整合與 Fallback 處理
  const t = useMemo(() => {
    const defaultDict = DEFAULT_TRANSLATIONS[currentLang] || DEFAULT_TRANSLATIONS['zh-TW'];
    const customDict = customTranslations[currentLang] || {};
    return {
      ...defaultDict,
      ...customDict,
      categories: {
        ...defaultDict.categories,
        ...(customDict.categories || {})
      }
    };
  }, [currentLang, customTranslations]);

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
            {editingId ? t.editTitle : t.addTitle}
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
              {t.btnExpense}
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
              {t.btnIncome}
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
                  <option value="🍔 餐飲">{t.categories.FOOD}</option>
                  <option value="🚗 交通">{t.categories.TRANSPORT}</option>
                  <option value="🎬 娛樂">{t.categories.ENTERTAINMENT}</option>
                  <option value="🛒 購物">{t.categories.SHOPPING}</option>
                  <option value="👔 服飾">{t.categories.CLOTHING}</option>
                  <option value="🎁 禮物">{t.categories.GIFT}</option>
                  <option value="💡 雜項">{t.categories.MISC}</option>
                </>
              ) : (
                <>
                  <option value="💰 薪水">{t.categories.SALARY}</option>
                  <option value="📈 投資">{t.categories.INVESTMENT}</option>
                  <option value="🧧 紅包">{t.categories.RED_ENVELOPE}</option>
                  <option value="💼 副業">{t.categories.SIDE_JOB}</option>
                  <option value="💡 其他收入">{t.categories.OTHER_INCOME}</option>
                </>
              )}
            </select>
          </div>

          {/* 💱 金額與幣別選擇區塊 */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="number" 
              placeholder={t.amountPlaceholder} 
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
                  console.error(t.errSetCurrency);
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
              {t.twdEquivalent.replace('{amount}', twdEquivalent.toLocaleString())}
            </div>
          )}

          {/* 備註 */}
          <input 
            type="text" 
            placeholder={t.notePlaceholder} 
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
              {t.btnCancel}
            </button>
            <button
              type="submit"
              style={{
                flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                backgroundColor: type === 'expense' ? '#ef4444' : '#10b981',
                color: '#ffffff', fontWeight: '800', cursor: 'pointer'
              }}
            >
              {editingId ? t.btnSave : t.btnConfirmAdd}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ExpenseForm;