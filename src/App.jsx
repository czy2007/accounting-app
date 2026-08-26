import React, { useState, useEffect } from 'react';

function App() {
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getCurrentYearMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const [items, setItems] = useState(() => {
    const savedItems = localStorage.getItem('accounting_items');
    if (!savedItems) return [];
    const parsedItems = JSON.parse(savedItems);
    return parsedItems.map(item => ({
      ...item,
      date: item.date || getTodayDate()
    }));
  });

  useEffect(() => {
    localStorage.setItem('accounting_items', JSON.stringify(items));
  }, [items]);

  // 表單狀態
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('🍔 餐飲');
  const [type, setType] = useState('expense');
  const [date, setDate] = useState(getTodayDate());

  // 編輯與視窗控制狀態
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // 💡 控制表單視窗開關

  // 當前瀏覽月份與頁籤
  const [currentMonth, setCurrentMonth] = useState(getCurrentYearMonth());
  const [activeTab, setActiveTab] = useState('all');
  const [filterCategory, setFilterCategory] = useState('ALL');

  const handleMonthChange = (delta) => {
    const [yearStr, monthStr] = currentMonth.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10) + delta;

    if (month < 1) {
      month = 12;
      year -= 1;
    } else if (month > 12) {
      month = 1;
      year += 1;
    }

    setCurrentMonth(`${year}-${String(month).padStart(2, '0')}`);
  };

  // 打開新增視窗
  const handleOpenAddModal = () => {
    setEditingId(null);
    setName('');
    setAmount('');
    setDate(getTodayDate());
    setType('expense');
    setCategory('🍔 餐飲');
    setIsModalOpen(true);
  };

  // 打開編輯視窗
  const handleEdit = (item) => {
    setEditingId(item.id);
    setName(item.name || '');
    setAmount(item.amount);
    setCategory(item.category);
    setType(item.type);
    setDate(item.date || getTodayDate());
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  // 送出表單
  const handleAdd = (e) => {
    if (e) e.preventDefault();
    if (!amount) {
      alert('請填寫金額！');
      return;
    }
    if (Number(amount) <= 0) {
      alert('金額必須大於 0 元！');
      return;
    }

    if (editingId) {
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === editingId
            ? { ...item, name: name.trim(), amount: Number(amount), category, type, date }
            : item
        )
      );
    } else {
      setItems(prevItems => [
        ...prevItems,
        { id: Date.now(), name: name.trim(), amount: Number(amount), category, type, date }
      ]);
    }

    handleCloseModal();
  };

  const handleDelete = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  // 過濾當月與條件資料
  const filteredItems = items.filter(item => {
    const itemMonth = item.date ? item.date.slice(0, 7) : '未分類';
    const matchesMonth = itemMonth === currentMonth;
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    const matchesCategory = filterCategory === 'ALL' || item.category === filterCategory;

    return matchesMonth && matchesTab && matchesCategory;
  });

  // 當月統計
  const monthStats = items
    .filter(item => (item.date ? item.date.slice(0, 7) : '未分類') === currentMonth)
    .reduce(
      (acc, item) => {
        const val = Number(item.amount) || 0;
        if (item.type === 'income') acc.income += val;
        else acc.expense += val;
        acc.net = acc.income - acc.expense;
        return acc;
      },
      { income: 0, expense: 0, net: 0 }
    );

  // 日期分組
  const groupedDataByDate = filteredItems.reduce((acc, item) => {
    const dateKey = item.date || '未分類日期';
    if (!acc[dateKey]) acc[dateKey] = { dateTotal: 0, items: [] };
    const val = item.type === 'income' ? item.amount : -item.amount;
    acc[dateKey].dateTotal += val;
    acc[dateKey].items.push(item);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedDataByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cg fill='none' stroke='%231e3a8a' stroke-width='2' stroke-linejoin='round'%3E%3Cpolygon points='20,5 25,18 38,18 28,26 31,39 20,31 9,39 12,26 2,18 15,18' transform='translate(10, 10) rotate(15 20 20) scale(0.75)'/%3E%3Cpolygon points='20,5 25,18 38,18 28,26 31,39 20,31 9,39 12,26 2,18 15,18' transform='translate(110, 25) rotate(-28 20 20) scale(0.5)'/%3E%3Cpolygon points='20,5 25,18 38,18 28,26 31,39 20,31 9,39 12,26 2,18 15,18' transform='translate(55, 95) rotate(42 20 20) scale(0.65)'/%3E%3Cpolygon points='20,5 25,18 38,18 28,26 31,39 20,31 9,39 12,26 2,18 15,18' transform='translate(135, 120) rotate(-18 20 20) scale(0.85)'/%3E%3Cpolygon points='20,5 25,18 38,18 28,26 31,39 20,31 9,39 12,26 2,18 15,18' transform='translate(5, 140) rotate(33 20 20) scale(0.45)'/%3E%3C/g%3E%3C/svg%3E")`,
      backgroundRepeat: 'repeat',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      <div style={{ 
        maxWidth: '480px', 
        margin: '0 auto', 
        padding: '32px 28px', 
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)',
        borderRadius: '20px',
        backgroundColor: '#ffffff',
        color: '#1e293b'
      }}>
        <h1 style={{ textAlign: 'center', fontSize: '26px', fontWeight: '800', marginBottom: '20px' }}>
          💰 我的記帳 App
        </h1>

        {/* 月份切換列 */}
        <div style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          backgroundColor: '#3b82f6', color: '#ffffff', padding: '12px 18px', 
          borderRadius: '14px', marginBottom: '16px', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
        }}>
          <button type="button" onClick={() => handleMonthChange(-1)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', fontSize: '18px', borderRadius: '8px', padding: '4px 12px', cursor: 'pointer' }}>◀</button>
          <span style={{ fontSize: '18px', fontWeight: '800' }}>🗓️ {currentMonth}</span>
          <button type="button" onClick={() => handleMonthChange(1)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', fontSize: '18px', borderRadius: '8px', padding: '4px 12px', cursor: 'pointer' }}>▶</button>
        </div>

        {/* 當月財務概要 */}
        <div style={{ 
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center',
          backgroundColor: '#f8fafc', padding: '12px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e2e8f0'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>月收入</div>
            <div translate="no" className="notranslate" style={{ fontSize: '13px', fontWeight: '700', color: '#10b981' }}>+${monthStats.income.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>月支出</div>
            <div translate="no" className="notranslate" style={{ fontSize: '13px', fontWeight: '700', color: '#ef4444' }}>-${monthStats.expense.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>月結餘</div>
            <div translate="no" className="notranslate" style={{ fontSize: '13px', fontWeight: '700', color: monthStats.net >= 0 ? '#2563eb' : '#e11d48' }}>${monthStats.net.toLocaleString()}</div>
          </div>
        </div>

        {/* 明細頁籤與分類選單 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#334155', margin: 0 }}>當月明細</h2>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', backgroundColor: '#f8fafc' }}
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

        {/* 頁籤 Tab (全部 / 支出 / 收入) */}
        <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: '16px' }}>
          <button type="button" onClick={() => setActiveTab('all')} style={{ flex: 1, padding: '10px', border: 'none', background: 'none', fontWeight: '700', fontSize: '14px', cursor: 'pointer', color: activeTab === 'all' ? '#2563eb' : '#64748b', borderBottom: activeTab === 'all' ? '3px solid #2563eb' : '3px solid transparent', marginBottom: '-2px' }}>全部</button>
          <button type="button" onClick={() => setActiveTab('expense')} style={{ flex: 1, padding: '10px', border: 'none', background: 'none', fontWeight: '700', fontSize: '14px', cursor: 'pointer', color: activeTab === 'expense' ? '#ef4444' : '#64748b', borderBottom: activeTab === 'expense' ? '3px solid #ef4444' : '3px solid transparent', marginBottom: '-2px' }}>💸 支出</button>
          <button type="button" onClick={() => setActiveTab('income')} style={{ flex: 1, padding: '10px', border: 'none', background: 'none', fontWeight: '700', fontSize: '14px', cursor: 'pointer', color: activeTab === 'income' ? '#10b981' : '#64748b', borderBottom: activeTab === 'income' ? '3px solid #10b981' : '3px solid transparent', marginBottom: '-2px' }}>💵 收入</button>
        </div>

        {/* 明細列表 */}
        {sortedDates.length === 0 ? (
          <div style={{ color: '#64748b', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'center', padding: '32px 20px', fontSize: '14px' }}>
            {currentMonth} 月份尚無紀錄
          </div>
        ) : (
          sortedDates.map(dateKey => {
            const dateData = groupedDataByDate[dateKey];
            return (
              <div key={dateKey} style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '12px', border: '1px solid #cbd5e1', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #e2e8f0', paddingBottom: '8px', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '700', fontSize: '14px', color: '#475569' }}>📅 {dateKey}</span>
                  <span translate="no" className="notranslate" style={{ fontSize: '13px', fontWeight: '700', color: dateData.dateTotal >= 0 ? '#059669' : '#e11d48' }}>
                    日小計: {dateData.dateTotal >= 0 ? '+' : ''}NT$ {dateData.dateTotal.toLocaleString()}
                  </span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {dateData.items.map(item => (
                    <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#475569' }}>{item.category}</span>
                        <span style={{ fontWeight: '500', fontSize: '14px', color: '#1e293b' }}>{item.name || item.category}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong translate="no" className="notranslate" style={{ fontSize: '14px', color: item.type === 'income' ? '#059669' : '#e11d48', marginRight: '4px' }}>
                          {item.type === 'income' ? '+' : '-'} NT$ {item.amount.toLocaleString()}
                        </strong>
                        <button type="button" onClick={() => handleEdit(item)} style={{ backgroundColor: '#e0f2fe', color: '#0284c7', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>編輯</button>
                        <button type="button" onClick={() => handleDelete(item.id)} style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>刪除</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })
        )}

        {/* 💡 右下角浮動按鈕：打開新增視窗 */}
        <button
          type="button"
          onClick={handleOpenAddModal}
          style={{
            marginTop: '20px',
            width: '100%',
            padding: '14px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ➕ 新增一筆記帳
        </button>
      </div>

      {/* 💡 彈出式表單視窗 (Modal) */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          padding: '20px', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#ffffff', width: '100%', maxWidth: '420px',
            borderRadius: '20px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                {editingId ? '✏️ 編輯記帳' : '➕ 新增記帳'}
              </h3>
              <button type="button" onClick={handleCloseModal} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* 收支選擇 */}
              <div style={{ display: 'flex', gap: '8px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
                <button
                  type="button"
                  onClick={() => { setType('expense'); setCategory('🍔 餐飲'); }}
                  style={{
                    flex: 1, padding: '10px', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer',
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
                    flex: 1, padding: '10px', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer',
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
                  style={{ padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '14px', outline: 'none' }}
                />

                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '15px', outline: 'none', cursor: 'pointer' }}
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

              {/* 備註 */}
              <input 
                type="text" 
                placeholder="備註 (例如: 午餐麥當勞)" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '15px', outline: 'none' }}
              />

              {/* 金額 */}
              <input 
                type="number" 
                inputMode="decimal"
                placeholder="金額 ($)" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '15px', outline: 'none' }}
              />

              {/* 按鈕 */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  style={{ flex: 1, padding: '12px', cursor: 'pointer', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '15px' }}
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  style={{ 
                    flex: 1, padding: '12px', cursor: 'pointer', 
                    background: type === 'expense' ? '#ef4444' : '#10b981', 
                    color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '15px'
                  }}
                >
                  {editingId ? '儲存修改' : '確認新增'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;