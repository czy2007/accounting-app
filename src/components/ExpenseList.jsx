import React, { useState, useMemo } from 'react';

// 輔助函式：動態匯率換算
const convertAmount = (amount, fromCurrency, toCurrency, rates) => {
  const numericAmount = Number(amount) || 0;
  if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) return numericAmount;
  
  // 若未傳入匯率表或找不到對應幣別，回傳原金額
  if (!rates || !rates[fromCurrency] || !rates[toCurrency]) return numericAmount;

  // 經由 USD 當中間基準進行換算
  const amountInUSD = numericAmount / rates[fromCurrency].rate;
  const converted = amountInUSD * rates[toCurrency].rate;
  
  return converted;
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
  baseCurrency = 'TWD', // 預設主要幣別
  rates = {}            // 匯率資料表
}) {
  const [selectedIds, setSelectedIds] = useState([]);

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
          placeholder="🔍 搜尋日期 (如 08-25) 或備註關鍵字..."
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
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: isDarkMode ? '#38bdf8' : '#1e3a8a', margin: 0 }}>當月明細</h2>
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
          <option value="ALL">🏷️ 全部分類</option>
          <option value="🍔 餐飲">🍔 餐飲</option>
          <option value="🚗 交通">🚗 交通</option>
          <option value="🎬 娛樂">🎬 娛樂</option>
          <option value="🛒 購物">🛒 購物</option>
          <option value="👔 服飾">👔 服飾</option>
          <option value="🎁 禮物">🎁 禮物</option>
          <option value="💡 雜項">💡 雜項</option>
          <option value="💰 薪水">💰 薪水</option>
          <option value="📈 投資">📈 投資</option>
          <option value="🧧 紅包">🧧 紅包</option>
          <option value="💼 副業">💼 副業</option>
          <option value="💡 其他收入">💡 其他收入</option>
        </select>
      </div>

      {/* 控制列 */}
      <div style={{
        display: 'flex',
        justify: 'space-between',
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
          全選 ({selectedIds.length}/{visibleAllIds.length})
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
              🚨 一鍵清空 ({selectedIds.length})
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
            ⚠️ 一鍵清空
          </button>
        </div>
      </div>

      {/* 頁籤切換 */}
      <div style={{ display: 'flex', borderBottom: isDarkMode ? '2px solid #3a4859' : '2px solid #1e3a8a', marginBottom: '16px' }}>
        <button type="button" onClick={() => setActiveTab('all')} style={{ flex: 1, padding: '10px', border: 'none', background: 'none', fontWeight: '800', fontSize: '14px', cursor: 'pointer', color: activeTab === 'all' ? (isDarkMode ? '#38bdf8' : '#1e3a8a') : '#94a3b8', borderBottom: activeTab === 'all' ? `3.5px solid ${isDarkMode ? '#38bdf8' : '#1e3a8a'}` : '3.5px solid transparent', marginBottom: '-2px' }}>全部</button>
        <button type="button" onClick={() => setActiveTab('expense')} style={{ flex: 1, padding: '10px', border: 'none', background: 'none', fontWeight: '800', fontSize: '14px', cursor: 'pointer', color: activeTab === 'expense' ? '#ef4444' : '#94a3b8', borderBottom: activeTab === 'expense' ? '3.5px solid #ef4444' : '3.5px solid transparent', marginBottom: '-2px' }}>💸 支出</button>
        <button type="button" onClick={() => setActiveTab('income')} style={{ flex: 1, padding: '10px', border: 'none', background: 'none', fontWeight: '800', fontSize: '14px', cursor: 'pointer', color: activeTab === 'income' ? '#10b981' : '#94a3b8', borderBottom: activeTab === 'income' ? '3.5px solid #10b981' : '3.5px solid transparent', marginBottom: '-2px' }}>💵 收入</button>
      </div>

      {/* 清單內容 */}
      {sortedDates.length === 0 ? (
        <div style={{ color: '#94a3b8', backgroundColor: isDarkMode ? '#1e2632' : '#f8fafc', border: isDarkMode ? '1.5px solid #3a4859' : '2px solid #1e3a8a', borderRadius: '16px', textAlign: 'center', padding: '32px 20px', fontSize: '14px' }}>
          {searchQuery ? `找不到符合「${searchQuery}」的紀錄` : `${currentMonth} 月份尚無紀錄`}
        </div>
      ) : (
        sortedDates.map(dateKey => {
          const dateData = groupedDataByDate[dateKey];

          // 重新計算「日小計」（自動換算為目前系統預設主要幣別 baseCurrency）
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
                  日小計: {calculatedDateTotal >= 0 ? '+' : ''}{baseCurrency} {calculatedDateTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {dateData.items.map(item => {
                  // 1. 取得該筆資料的原始幣別與原始金額
                  const itemCurrency = item.originalCurrency || item.currency || 'TWD';
                  const rawAmount = Number(item.originalAmount || item.amount) || 0;

                  // 2. 判斷原始幣別是否與系統主要幣別相同
                  const isSameWithBase = itemCurrency === baseCurrency;

                  // 3. 若幣別不同，換算成主要幣別的金額
                  const convertedAmount = isSameWithBase
                    ? null
                    : convertAmount(rawAmount, itemCurrency, baseCurrency, rates);

                  return (
                    <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => handleToggleSelect(item.id)}
                          style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                        />
                        <span style={{ fontSize: '11px', backgroundColor: isDarkMode ? '#2c3846' : '#f1f5f9', padding: '2px 8px', borderRadius: '10px', border: isDarkMode ? '1.5px solid #3a4859' : '1px solid #1e3a8a', color: isDarkMode ? '#38bdf8' : '#1e3a8a', fontWeight: '700' }}>{item.category}</span>
                        <span style={{ fontWeight: '600', fontSize: '14px', color: isDarkMode ? '#f8fafc' : '#1e293b' }}>{item.name || item.category}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {/* 💱 雙金額顯示邏輯 */}
                        <strong style={{ fontSize: '14px', color: item.type === 'income' ? '#10b981' : '#f43f5e', marginRight: '4px' }}>
                          {item.type === 'income' ? '+' : '-'}
                          {/* 主要顯示：使用者當時輸入的幣別與金額 */}
                          {itemCurrency} {rawAmount.toLocaleString()}

                          {/* 括號顯示：若原始幣別與主要結算幣別不同，則換算後顯示 */}
                          {!isSameWithBase && convertedAmount !== null && (
                            <span style={{ fontSize: '12px', fontWeight: '600', opacity: 0.85, marginLeft: '5px' }}>
                              (≈ {baseCurrency} {convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })})
                            </span>
                          )}
                        </strong>
                        <button type="button" onClick={() => onEdit(item)} style={{ backgroundColor: isDarkMode ? '#0c4a6e' : '#e0f2fe', color: isDarkMode ? '#38bdf8' : '#0284c7', border: isDarkMode ? '1px solid #0284c7' : '1px solid #0284c7', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>編輯</button>
                        <button type="button" onClick={() => onDelete(item.id)} style={{ backgroundColor: isDarkMode ? '#451a1a' : '#fee2e2', color: isDarkMode ? '#fca5a5' : '#ef4444', border: isDarkMode ? '1px solid #991b1b' : '1px solid #ef4444', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>刪除</button>
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
        ➕ 新增一筆記帳
      </button>
    </div>
  );
}

export default ExpenseList;