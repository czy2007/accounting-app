import React from 'react';

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
  onOpenAddModal
}) {
  return (
    <div style={{
      flex: '1 1 450px',
      backgroundColor: '#ffffff',
      padding: '24px',
      borderRadius: '24px',
      boxShadow: '0 10px 25px -5px rgba(30, 58, 138, 0.08)',
      border: '2.5px solid #1e3a8a',
      boxSizing: 'border-box'
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
            border: '2px solid #1e3a8a', backgroundColor: '#f8fafc',
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
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e3a8a', margin: 0 }}>當月明細</h2>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: '10px', border: '2px solid #1e3a8a', fontSize: '12px', outline: 'none', backgroundColor: '#ffffff', cursor: 'pointer', fontWeight: '700', color: '#1e3a8a' }}
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

      {/* 頁籤切換 */}
      <div style={{ display: 'flex', borderBottom: '2px solid #1e3a8a', marginBottom: '16px' }}>
        <button type="button" onClick={() => setActiveTab('all')} style={{ flex: 1, padding: '10px', border: 'none', background: 'none', fontWeight: '800', fontSize: '14px', cursor: 'pointer', color: activeTab === 'all' ? '#1e3a8a' : '#64748b', borderBottom: activeTab === 'all' ? '3.5px solid #1e3a8a' : '3.5px solid transparent', marginBottom: '-2px' }}>全部</button>
        <button type="button" onClick={() => setActiveTab('expense')} style={{ flex: 1, padding: '10px', border: 'none', background: 'none', fontWeight: '800', fontSize: '14px', cursor: 'pointer', color: activeTab === 'expense' ? '#ef4444' : '#64748b', borderBottom: activeTab === 'expense' ? '3.5px solid #ef4444' : '3.5px solid transparent', marginBottom: '-2px' }}>💸 支出</button>
        <button type="button" onClick={() => setActiveTab('income')} style={{ flex: 1, padding: '10px', border: 'none', background: 'none', fontWeight: '800', fontSize: '14px', cursor: 'pointer', color: activeTab === 'income' ? '#10b981' : '#64748b', borderBottom: activeTab === 'income' ? '3.5px solid #10b981' : '3.5px solid transparent', marginBottom: '-2px' }}>💵 收入</button>
      </div>

      {/* 清單內容 */}
      {sortedDates.length === 0 ? (
        <div style={{ color: '#64748b', backgroundColor: '#f8fafc', border: '2px solid #1e3a8a', borderRadius: '16px', textAlign: 'center', padding: '32px 20px', fontSize: '14px' }}>
          {searchQuery ? `找不到符合「${searchQuery}」的紀錄` : `${currentMonth} 月份尚無紀錄`}
        </div>
      ) : (
        sortedDates.map(dateKey => {
          const dateData = groupedDataByDate[dateKey];
          return (
            <div key={dateKey} style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '14px', border: '2px solid #1e3a8a', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px dashed #cbd5e1', paddingBottom: '8px', marginBottom: '8px' }}>
                <span style={{ fontWeight: '700', fontSize: '13px', color: '#1e3a8a' }}>📅 {dateKey}</span>
                <span style={{ fontSize: '13px', fontWeight: '800', color: dateData.dateTotal >= 0 ? '#059669' : '#e11d48' }}>
                  日小計: {dateData.dateTotal >= 0 ? '+' : ''}NT$ {dateData.dateTotal.toLocaleString()}
                </span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {dateData.items.map(item => (
                  <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '10px', border: '1px solid #1e3a8a', color: '#1e3a8a', fontWeight: '700' }}>{item.category}</span>
                      <span style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>{item.name || item.category}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ fontSize: '14px', color: item.type === 'income' ? '#059669' : '#e11d48', marginRight: '4px' }}>
                        {item.type === 'income' ? '+' : '-'} NT$ {item.amount.toLocaleString()}
                      </strong>
                      <button type="button" onClick={() => onEdit(item)} style={{ backgroundColor: '#e0f2fe', color: '#0284c7', border: '1px solid #0284c7', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>編輯</button>
                      <button type="button" onClick={() => onDelete(item.id)} style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>刪除</button>
                    </div>
                  </li>
                ))}
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
          backgroundColor: '#f1f5f9', color: '#334155',
          border: '2px solid #475569', borderRadius: '16px',
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