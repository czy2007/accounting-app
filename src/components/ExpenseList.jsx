import React, { useState, useMemo } from 'react';
import { useAppContext } from "../context/AppContext";

// 預設多語系字典 (包含繁體中文、英文、日文與韓文)
const DEFAULT_TRANSLATIONS = {
  'zh-TW': {
    searchPlaceholder: '🔍 搜尋日期 (如 08-25) 或備註關鍵字...',
    monthlyDetails: '當月明細',
    selectAll: '全選',
    deleteSelected: '🚨 刪除選取',
    clearAll: '⚠️ 一鍵清空',
    tabAll: '全部',
    tabExpense: '💸 支出',
    tabIncome: '💵 收入',
    notFound: '找不到符合「{query}」的紀錄',
    noRecord: '{month} 月份尚無紀錄',
    dailyTotal: '日小計',
    btnEdit: '編輯',
    btnDelete: '刪除',
    btnAdd: '➕ 新增一筆記帳',
    categories: {
      ALL: '🏷️ 全部分類',
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
    searchPlaceholder: '🔍 Search date (e.g. 08-25) or notes...',
    monthlyDetails: 'Monthly Details',
    selectAll: 'Select All',
    deleteSelected: '🚨 Delete Selected',
    clearAll: '⚠️ Clear All',
    tabAll: 'All',
    tabExpense: '💸 Expense',
    tabIncome: '💵 Income',
    notFound: 'No records found matching "{query}"',
    noRecord: 'No records for {month}',
    dailyTotal: 'Daily Total',
    btnEdit: 'Edit',
    btnDelete: 'Delete',
    btnAdd: '➕ Add New Transaction',
    categories: {
      ALL: '🏷 All Categories',
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
    searchPlaceholder: '🔍 日付 (例: 08-25) やメモで検索...',
    monthlyDetails: '今月の明細',
    selectAll: 'すべて選択',
    deleteSelected: '🚨 選択した項目を削除',
    clearAll: '⚠️ 一括クリア',
    tabAll: 'すべて',
    tabExpense: '💸 支出',
    tabIncome: '💵 収入',
    notFound: '「{query}」に一致する記録が見つかりません',
    noRecord: '{month} 月の記録はありません',
    dailyTotal: '日計',
    btnEdit: '編集',
    btnDelete: '削除',
    btnAdd: '➕ 記録を追加',
    categories: {
      ALL: '🏷️ すべてのカテゴリ',
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
    searchPlaceholder: '🔍 날짜 (예: 08-25) 또는 메모 검색...',
    monthlyDetails: '이번 달 내역',
    selectAll: '전체 선택',
    deleteSelected: '🚨 선택 삭제',
    clearAll: '⚠️ 전체 삭제',
    tabAll: '전체',
    tabExpense: '💸 지출',
    tabIncome: '💵 수입',
    notFound: '"{query}" (와)과 일치하는 내역이 없습니다',
    noRecord: '{month}월 내역이 없습니다',
    dailyTotal: '일일 소계',
    btnEdit: '수정',
    btnDelete: '삭제',
    btnAdd: '➕ 내역 추가',
    categories: {
      ALL: '🏷️ 전체 카테고리',
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

// 輔助函式：動態匯率換算
const convertAmount = (amount, fromCurrency, toCurrency, rates) => {
  const numericAmount = Number(amount) || 0;
  if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) return numericAmount;

  const fallbackRates = {
    USD: 1,
    TWD: 32.5,
    JPY: 155,
    EUR: 0.92,
    GBP: 0.78,
    CNY: 7.25,
    HKD: 7.8
  };

  const fromRate = rates?.[fromCurrency]?.rate || fallbackRates[fromCurrency] || 1;
  const toRate = rates?.[toCurrency]?.rate || fallbackRates[toCurrency] || 1;

  const amountInUSD = numericAmount / fromRate;
  return amountInUSD * toRate;
};

// 輔助函式：將儲存的分類字串對應至多語系分類標籤
const getLocalizedCategory = (category, t) => {
  if (!category) return '';
  const cleanCat = category.replace(/^[^\w\s\u4e00-\u9fa5]+/, '').trim();
  
  const categoryKeyMap = {
    '餐飲': 'FOOD', 'Food': 'FOOD', '外食・食費': 'FOOD', '식비': 'FOOD',
    '交通': 'TRANSPORT', 'Transport': 'TRANSPORT', '交通費': 'TRANSPORT', '교통': 'TRANSPORT',
    '娛樂': 'ENTERTAINMENT', 'Entertainment': 'ENTERTAINMENT', '娯楽・趣味': 'ENTERTAINMENT', '문화/유흥': 'ENTERTAINMENT',
    '購物': 'SHOPPING', 'Shopping': 'SHOPPING', '買い物': 'SHOPPING', '쇼핑': 'SHOPPING',
    '服飾': 'CLOTHING', 'Clothing': 'CLOTHING', '衣服・美容': 'CLOTHING', '의류/미용': 'CLOTHING',
    '禮物': 'GIFT', 'Gift': 'GIFT', 'プレゼント': 'GIFT', '선물': 'GIFT',
    '雜項': 'MISC', 'Misc': 'MISC', '雜費': 'MISC', '기타 지출': 'MISC',
    '薪水': 'SALARY', 'Salary': 'SALARY', '給料': 'SALARY', '급여': 'SALARY',
    '投資': 'INVESTMENT', 'Investment': 'INVESTMENT', '投資収入': 'INVESTMENT', '투자': 'INVESTMENT',
    '紅包': 'RED_ENVELOPE', 'Red Packet': 'RED_ENVELOPE', 'お小遣い・祝儀': 'RED_ENVELOPE', '용돈/축의금': 'RED_ENVELOPE',
    '副業': 'SIDE_JOB', 'Side Hustle': 'SIDE_JOB', '부업': 'SIDE_JOB',
    '其他收入': 'OTHER_INCOME', 'Other Income': 'OTHER_INCOME', 'その他収入': 'OTHER_INCOME', '기타 수입': 'OTHER_INCOME'
  };

  const key = categoryKeyMap[cleanCat] || categoryKeyMap[category] || category;
  if (t.categories && t.categories[key]) {
    return t.categories[key];
  }
  return category;
};

function ExpenseList({
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  activeTab,
  setActiveTab,
  sortedDates,
  groupedDataByDate,
  currentMonth,
  onEdit,
  onDelete,
  onBatchDelete,
  onClearAll,
  onOpenAddModal,
  isDarkMode,
  baseCurrency = 'TWD',
  rates = {}
}) {
  const [selectedIds, setSelectedIds] = useState([]);

  // 🌐 從 Context 取得當前語言設定與翻譯字典
  const appContext = useAppContext ? useAppContext() : {};
  const currentLang = appContext?.lang || appContext?.language || 'zh-TW';
  const customTranslations = appContext?.translations || appContext?.t || {};

  const t = useMemo(() => {
    const defaultDict = DEFAULT_TRANSLATIONS[currentLang] || DEFAULT_TRANSLATIONS['zh-TW'];
    const customDict = customTranslations[currentLang] || (typeof customTranslations.dailyTotal === 'string' ? customTranslations : {});
    return {
      ...defaultDict,
      ...customDict,
      categories: {
        ...defaultDict.categories,
        ...(customDict.categories || {})
      }
    };
  }, [currentLang, customTranslations]);

  const visibleAllIds = useMemo(() => {
    let ids = [];
    sortedDates.forEach((dateKey) => {
      if (groupedDataByDate[dateKey]) {
        groupedDataByDate[dateKey].items.forEach((item) => {
          ids.push(item.id);
        });
      }
    });
    return ids;
  }, [sortedDates, groupedDataByDate]);

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (visibleAllIds.length === 0) return;
    const isAllSelected = visibleAllIds.every((id) => selectedIds.includes(id));

    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleAllIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleAllIds])));
    }
  };

  const handleExecuteBatchDelete = () => {
    if (selectedIds.length === 0) return;
    if (onBatchDelete) {
      onBatchDelete(selectedIds);
      setSelectedIds([]);
    }
  };

  const isCurrentAllSelected =
    visibleAllIds.length > 0 && visibleAllIds.every((id) => selectedIds.includes(id));

  return (
    <div style={{
      flex: '1 1 450px',
      backgroundColor: isDarkMode ? '#2c3846' : '#ffffff',
      color: isDarkMode ? '#f8fafc' : '#0f172a',
      padding: '24px',
      borderRadius: '24px',
      boxShadow: isDarkMode ? '0 10px 25px rgba(0,0,0,0.2)' : '0 10px 25px -5px rgba(30, 58, 138, 0.08)',
      border: isDarkMode ? '1.5px solid #3a4859' : '2.5px solid #1e3a8a',
      boxSizing: 'border-box',
      transition: 'all 0.3s ease'
    }}>
      {/* 搜尋列 */}
      <div style={{ marginBottom: '16px', position: 'relative' }}>
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%', padding: '12px 14px', borderRadius: '14px',
            border: isDarkMode ? '1.5px solid #3a4859' : '2px solid #1e3a8a',
            backgroundColor: isDarkMode ? '#1e2632' : '#f8fafc',
            color: isDarkMode ? '#f8fafc' : '#0f172a',
            fontSize: '14px', outline: 'none', boxSizing: 'border-box'
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px'
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* 標題與分類篩選 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: isDarkMode ? '#38bdf8' : '#1e3a8a', margin: 0 }}>
          {t.monthlyDetails}
        </h2>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            padding: '6px 12px',
            borderRadius: '10px',
            border: isDarkMode ? '1.5px solid #3a4859' : '2px solid #1e3a8a',
            fontSize: '12px',
            outline: 'none',
            backgroundColor: isDarkMode ? '#1e2632' : '#ffffff',
            cursor: 'pointer',
            fontWeight: '700',
            color: isDarkMode ? '#f8fafc' : '#1e3a8a'
          }}
        >
          <option value="ALL">{t.categories.ALL}</option>
          <option value="🍔 餐飲">{t.categories.FOOD}</option>
          <option value="🚗 交通">{t.categories.TRANSPORT}</option>
          <option value="🎬 娛樂">{t.categories.ENTERTAINMENT}</option>
          <option value="🛒 購物">{t.categories.SHOPPING}</option>
          <option value="👔 服飾">{t.categories.CLOTHING}</option>
          <option value="🎁 禮物">{t.categories.GIFT}</option>
          <option value="💡 雜項">{t.categories.MISC}</option>
          <option value="💰 薪水">{t.categories.SALARY}</option>
          <option value="📈 投資">{t.categories.INVESTMENT}</option>
          <option value="🧧 紅包">{t.categories.RED_ENVELOPE}</option>
          <option value="💼 副業">{t.categories.SIDE_JOB}</option>
          <option value="💡 其他收入">{t.categories.OTHER_INCOME}</option>
        </select>
      </div>

      {/* 控制列 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: '14px',
        padding: '8px 12px',
        backgroundColor: isDarkMode ? '#1e2632' : '#f8fafc',
        borderRadius: '12px',
        border: isDarkMode ? '1.5px solid #3a4859' : '1.5px solid #cbd5e1',
        boxSizing: 'border-box'
      }}>
        <label style={{ cursor: 'pointer', userSelect: 'none', fontSize: '13px', fontWeight: '700', color: isDarkMode ? '#f8fafc' : '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="checkbox"
            checked={isCurrentAllSelected}
            onChange={handleSelectAll}
            disabled={visibleAllIds.length === 0}
            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
          />
          {t.selectAll} ({selectedIds.length}/{visibleAllIds.length})
        </label>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: 'auto' }}>
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handleExecuteBatchDelete}
              style={{
                backgroundColor: '#ef4444',
                color: '#ffffff',
                border: '1.5px solid #dc2626',
                borderRadius: '8px',
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {t.deleteSelected} ({selectedIds.length})
            </button>
          )}

          <button
            type="button"
            onClick={onClearAll}
            style={{
              backgroundColor: isDarkMode ? '#7f1d1d' : '#fee2e2',
              color: isDarkMode ? '#fca5a5' : '#ef4444',
              border: isDarkMode ? '1.5px solid #991b1b' : '1.5px solid #fca5a5',
              borderRadius: '8px',
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            {t.clearAll}
          </button>
        </div>
      </div>

      {/* 頁籤切換 */}
      <div style={{ display: 'flex', borderBottom: isDarkMode ? '2px solid #3a4859' : '2px solid #1e3a8a', marginBottom: '16px' }}>
        <button type="button" onClick={() => setActiveTab('all')} style={{ flex: 1, padding: '10px', border: 'none', background: 'none', fontWeight: '800', fontSize: '14px', cursor: 'pointer', color: activeTab === 'all' ? (isDarkMode ? '#38bdf8' : '#1e3a8a') : '#94a3b8', borderBottom: activeTab === 'all' ? `3.5px solid ${isDarkMode ? '#38bdf8' : '#1e3a8a'}` : '3.5px solid transparent', marginBottom: '-2px' }}>
          {t.tabAll}
        </button>
        <button type="button" onClick={() => setActiveTab('expense')} style={{ flex: 1, padding: '10px', border: 'none', background: 'none', fontWeight: '800', fontSize: '14px', cursor: 'pointer', color: activeTab === 'expense' ? '#ef4444' : '#94a3b8', borderBottom: activeTab === 'expense' ? '3.5px solid #ef4444' : '3.5px solid transparent', marginBottom: '-2px' }}>
          {t.tabExpense}
        </button>
        <button type="button" onClick={() => setActiveTab('income')} style={{ flex: 1, padding: '10px', border: 'none', background: 'none', fontWeight: '800', fontSize: '14px', cursor: 'pointer', color: activeTab === 'income' ? '#10b981' : '#94a3b8', borderBottom: activeTab === 'income' ? '3.5px solid #10b981' : '3.5px solid transparent', marginBottom: '-2px' }}>
          {t.tabIncome}
        </button>
      </div>

      {/* 清單內容 */}
      {sortedDates.length === 0 ? (
        <div style={{ color: '#94a3b8', backgroundColor: isDarkMode ? '#1e2632' : '#f8fafc', border: isDarkMode ? '1.5px solid #3a4859' : '2px solid #1e3a8a', borderRadius: '16px', textAlign: 'center', padding: '32px 20px', fontSize: '14px' }}>
          {searchQuery
            ? t.notFound.replace('{query}', searchQuery)
            : t.noRecord.replace('{month}', currentMonth)}
        </div>
      ) : (
        sortedDates.map(dateKey => {
          const dateData = groupedDataByDate[dateKey];

          const calculatedDateTotal = dateData.items.reduce((sum, item) => {
            const itemOrigCurrency = item.originalCurrency || item.currency || 'TWD';
            const itemOrigAmount = Number(item.originalAmount || item.amount) || 0;

            const amountInBaseCurrency = convertAmount(itemOrigAmount, itemOrigCurrency, baseCurrency, rates);
            return sum + (item.type === 'income' ? amountInBaseCurrency : -amountInBaseCurrency);
          }, 0);

          return (
            <div key={dateKey} style={{ backgroundColor: isDarkMode ? '#1e2632' : '#ffffff', borderRadius: '16px', padding: '14px', border: isDarkMode ? '1.5px solid #3a4859' : '2px solid #1e3a8a', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isDarkMode ? '1.5px dashed #3a4859' : '1.5px dashed #cbd5e1', paddingBottom: '8px', marginBottom: '8px' }}>
                <span style={{ fontWeight: '700', fontSize: '13px', color: isDarkMode ? '#38bdf8' : '#1e3a8a' }}>📅 {dateKey}</span>
                <span style={{ fontSize: '13px', fontWeight: '800', color: calculatedDateTotal >= 0 ? '#10b981' : '#f43f5e' }}>
                  {t.dailyTotal}: {baseCurrency} {calculatedDateTotal >= 0 ? '+' : ''}{calculatedDateTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {dateData.items.map(item => {
                  const itemCurrency = item.originalCurrency || item.currency || 'TWD';
                  const rawAmount = Number(item.originalAmount || item.amount) || 0;

                  const isSameWithBase = itemCurrency === baseCurrency;
                  const convertedAmount = isSameWithBase
                    ? null
                    : convertAmount(rawAmount, itemCurrency, baseCurrency, rates);

                  const localizedCategory = getLocalizedCategory(item.category, t);

                  return (
                    <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => handleToggleSelect(item.id)}
                          style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                        />
                        <span style={{ fontSize: '11px', backgroundColor: isDarkMode ? '#2c3846' : '#f1f5f9', padding: '2px 8px', borderRadius: '10px', border: isDarkMode ? '1.5px solid #3a4859' : '1px solid #1e3a8a', color: isDarkMode ? '#38bdf8' : '#1e3a8a', fontWeight: '700' }}>
                          {localizedCategory}
                        </span>
                        <span style={{ fontWeight: '600', fontSize: '14px', color: isDarkMode ? '#f8fafc' : '#0f172b' }}>
                          {item.name || localizedCategory}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong style={{ fontSize: '14px', color: item.type === 'income' ? '#10b981' : '#f43f5e', marginRight: '4px' }}>
                          {item.type === 'income' ? '+' : '-'}
                          {itemCurrency} {rawAmount.toLocaleString()}

                          {!isSameWithBase && convertedAmount !== null && (
                            <span style={{ fontSize: '12px', fontWeight: '600', opacity: 0.85, marginLeft: '5px' }}>
                              (≈ {baseCurrency} {convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })})
                            </span>
                          )}
                        </strong>
                        <button type="button" onClick={() => onEdit(item)} style={{ backgroundColor: isDarkMode ? '#0c4a6e' : '#e0f2fe', color: isDarkMode ? '#38bdf8' : '#0284c7', border: isDarkMode ? '1px solid #0284c7' : '1px solid #0284c7', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>
                          {t.btnEdit}
                        </button>
                        <button type="button" onClick={() => onDelete(item.id)} style={{ backgroundColor: isDarkMode ? '#451a1a' : '#fee2e2', color: isDarkMode ? '#fca5a5' : '#ef4444', border: isDarkMode ? '1px solid #991b1b' : '1px solid #ef4444', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>
                          {t.btnDelete}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })
      )}

      <button
        type="button"
        onClick={onOpenAddModal}
        style={{
          marginTop: '16px', width: '100%', padding: '14px',
          backgroundColor: isDarkMode ? '#1e2632' : '#f1f5f9',
          color: isDarkMode ? '#f8fafc' : '#334155',
          border: isDarkMode ? '1.5px solid #3a4859' : '2px solid #475569', borderRadius: '16px',
          fontSize: '16px', fontWeight: '800', cursor: 'pointer',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
        }}
      >
        {t.btnAdd}
      </button>
    </div>
  );
}

export default ExpenseList;