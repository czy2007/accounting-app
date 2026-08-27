import React, { useState, useEffect, useRef } from 'react';

// 🎨 原生 HTML5 Canvas 圓餅圖元件
function PieChart({ title, data, totalAmount, emptyMessage }) {
  const canvasRef = useRef(null);

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const radius = Math.min(width, height) / 2 - 10;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    if (data.length === 0 || totalAmount === 0) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#f8fafc';
      ctx.fill();
      ctx.strokeStyle = '#1e3a8a';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      return;
    }

    let startAngle = -0.5 * Math.PI;
    data.forEach((item, index) => {
      const sliceAngle = (item.amount / totalAmount) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      startAngle += sliceAngle;
    });
  }, [data, totalAmount]);

  return (
    <div style={{
      backgroundColor: '#ffffff',
      padding: '16px',
      borderRadius: '16px',
      border: '2px solid #1e3a8a', // 深藍色邊框
      textAlign: 'center',
      marginBottom: '16px'
    }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '800', color: '#1e3a8a' }}>
        {title}
      </h3>

      {data.length === 0 ? (
        <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '13px' }}>
          {emptyMessage}
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <canvas ref={canvasRef} width={140} height={140} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left', maxHeight: '120px', overflowY: 'auto' }}>
            {data.map((item, index) => {
              const percentage = ((item.amount / totalAmount) * 100).toFixed(1);
              return (
                <div key={item.category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: colors[index % colors.length], display: 'inline-block' }}></span>
                    <span style={{ color: '#1e293b', fontWeight: '600' }}>{item.category}</span>
                  </div>
                  <span style={{ color: '#475569', fontWeight: '700' }}>
                    {percentage}% (${item.amount.toLocaleString()})
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

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

  // 表單與功能狀態
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('🍔 餐飲');
  const [type, setType] = useState('expense');
  const [date, setDate] = useState(getTodayDate());

  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
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

  const handleOpenAddModal = () => {
    setEditingId(null);
    setName('');
    setAmount('');
    setDate(getTodayDate());
    setType('expense');
    setCategory('🍔 餐飲');
    setIsModalOpen(true);
  };

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

  // 資料過濾與統計
  const currentMonthItems = items.filter(item => (item.date ? item.date.slice(0, 7) : '未分類') === currentMonth);

  const filteredItems = currentMonthItems.filter(item => {
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    const matchesCategory = filterCategory === 'ALL' || item.category === filterCategory;

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || 
      (item.date && item.date.includes(q)) || 
      (item.name && item.name.toLowerCase().includes(q)) || 
      (item.category && item.category.toLowerCase().includes(q));

    return matchesTab && matchesCategory && matchesSearch;
  });

  const monthStats = currentMonthItems.reduce(
    (acc, item) => {
      const val = Number(item.amount) || 0;
      if (item.type === 'income') acc.income += val;
      else acc.expense += val;
      acc.net = acc.income - acc.expense;
      return acc;
    },
    { income: 0, expense: 0, net: 0 }
  );

  const getChartData = (targetType) => {
    const categoryTotals = currentMonthItems
      .filter(item => item.type === targetType)
      .reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + Number(item.amount);
        return acc;
      }, {});

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  };

  const expenseChartData = getChartData('expense');
  const incomeChartData = getChartData('income');

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
      backgroundColor: '#eef5ff', // 💡 淡藍色背景
      // ✨ 修正 URL 特殊符號轉譯 (%23) 的中空星星圖案 SVG
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpath fill='none' stroke='%231e3a8a' stroke-opacity='0.3' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' d='M20 5l2.4 5.2 5.6.8-4 4 1 5.6-5-2.8-5 2.8 1-5.6-4-4 5.6-.8zm40 40l2.4 5.2 5.6.8-4 4 1 5.6-5-2.8-5 2.8 1-5.6-4-4 5.6-.8zM60 5l1.5 3.2 3.5.5-2.5 2.5.6 3.5-3.1-1.7-3.1 1.7.6-3.5-2.5-2.5 3.5-.5zm-40 40l1.5 3.2 3.5.5-2.5 2.5.6 3.5-3.1-1.7-3.1 1.7.6-3.5-2.5-2.5 3.5-.5z'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'repeat',
      padding: '30px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxSizing: 'border-box'
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        
        <h1 style={{ textAlign: 'center', fontSize: '28px', fontWeight: '800', marginBottom: '20px', color: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          💰 我的記帳 App
        </h1>

        {/* 🗓️ 切換月份深藍色長條 */}
        <div style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          backgroundColor: '#1e3a8a', color: '#ffffff', padding: '10px 16px', 
          borderRadius: '16px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(30, 58, 138, 0.25)',
          border: '2px solid #1e3a8a'
        }}>
          <button type="button" onClick={() => handleMonthChange(-1)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', fontSize: '16px', borderRadius: '10px', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>◀</button>
          <span style={{ fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>🗓️ {currentMonth}</span>
          <button type="button" onClick={() => handleMonthChange(1)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', fontSize: '16px', borderRadius: '10px', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▶</button>
        </div>

        {/* ↔️ 雙欄卡片佈局 */}
        <div style={{
          display: 'flex',
          gap: '24px',
          flexWrap: 'wrap',
          alignItems: 'flex-start'
        }}>

          {/* 👈 左欄：列表與搜尋 */}
          <div style={{
            flex: '1 1 450px',
            backgroundColor: '#ffffff',
            padding: '24px',
            borderRadius: '24px',
            boxShadow: '0 10px 25px -5px rgba(30, 58, 138, 0.08)',
            border: '2.5px solid #1e3a8a', // 💡 深藍色框框
            boxSizing: 'border-box'
          }}>
            {/* 🔍 搜尋框 */}
            <div style={{ marginBottom: '16px', position: 'relative' }}>
              <input
                type="text"
                placeholder="🔍 搜尋日期 (如 08-25) 或備註關鍵字..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}

                // ✨ 關鍵改在這裡：監聽鍵盤按下 Esc 鍵 (Escape)
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setSearchQuery('');
                  }
                }}
                
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

            {/* 標題與分類選單 */}
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

            {/* Tab 頁籤 */}
            <div style={{ display: 'flex', borderBottom: '2px solid #1e3a8a', marginBottom: '16px' }}>
              <button type="button" onClick={() => setActiveTab('all')} style={{ flex: 1, padding: '10px', border: 'none', background: 'none', fontWeight: '800', fontSize: '14px', cursor: 'pointer', color: activeTab === 'all' ? '#1e3a8a' : '#64748b', borderBottom: activeTab === 'all' ? '3.5px solid #1e3a8a' : '3.5px solid transparent', marginBottom: '-2px' }}>全部</button>
              <button type="button" onClick={() => setActiveTab('expense')} style={{ flex: 1, padding: '10px', border: 'none', background: 'none', fontWeight: '800', fontSize: '14px', cursor: 'pointer', color: activeTab === 'expense' ? '#ef4444' : '#64748b', borderBottom: activeTab === 'expense' ? '3.5px solid #ef4444' : '3.5px solid transparent', marginBottom: '-2px' }}>💸 支出</button>
              <button type="button" onClick={() => setActiveTab('income')} style={{ flex: 1, padding: '10px', border: 'none', background: 'none', fontWeight: '800', fontSize: '14px', cursor: 'pointer', color: activeTab === 'income' ? '#10b981' : '#64748b', borderBottom: activeTab === 'income' ? '3.5px solid #10b981' : '3.5px solid transparent', marginBottom: '-2px' }}>💵 收入</button>
            </div>

            {/* 紀錄列表 */}
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
                      <span translate="no" className="notranslate" style={{ fontSize: '13px', fontWeight: '800', color: dateData.dateTotal >= 0 ? '#059669' : '#e11d48' }}>
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
                            <strong translate="no" className="notranslate" style={{ fontSize: '14px', color: item.type === 'income' ? '#059669' : '#e11d48', marginRight: '4px' }}>
                              {item.type === 'income' ? '+' : '-'} NT$ {item.amount.toLocaleString()}
                            </strong>
                            {/* 保留原本的編輯與刪除顏色 */}
                            <button type="button" onClick={() => handleEdit(item)} style={{ backgroundColor: '#e0f2fe', color: '#0284c7', border: '1px solid #0284c7', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>編輯</button>
                            <button type="button" onClick={() => handleDelete(item.id)} style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>刪除</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })
            )}

            {/* ➕ 灰底深灰框新增按鈕 */}
            <button
              type="button"
              onClick={handleOpenAddModal}
              style={{
                marginTop: '16px', width: '100%', padding: '14px',
                backgroundColor: '#f1f5f9', // 淡灰底
                color: '#334155',           // 深灰字
                border: '2px solid #475569', // 深灰外框
                borderRadius: '16px', fontSize: '16px', fontWeight: '800',
                cursor: 'pointer', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
              }}
            >
              ➕ 新增一筆記帳
            </button>
          </div>

          {/* 👉 右欄：統計概要與圓餅圖 */}
          <div style={{
            flex: '1 1 350px',
            backgroundColor: '#ffffff',
            padding: '24px',
            borderRadius: '24px',
            boxShadow: '0 10px 25px -5px rgba(30, 58, 138, 0.08)',
            border: '2.5px solid #1e3a8a', // 💡 深藍色框框
            boxSizing: 'border-box'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e3a8a', marginTop: 0, marginBottom: '16px' }}>
              📊 財務圖表分析
            </h2>

            {/* 💰 月度總計小卡片 */}
            <div style={{ 
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center',
              backgroundColor: '#ffffff', padding: '12px', borderRadius: '16px', marginBottom: '20px', border: '2px solid #1e3a8a'
            }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>月收入</div>
                <div translate="no" className="notranslate" style={{ fontSize: '13px', fontWeight: '800', color: '#10b981' }}>+${monthStats.income.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>月支出</div>
                <div translate="no" className="notranslate" style={{ fontSize: '13px', fontWeight: '800', color: '#ef4444' }}>-${monthStats.expense.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>月結餘</div>
                <div translate="no" className="notranslate" style={{ fontSize: '13px', fontWeight: '800', color: monthStats.net >= 0 ? '#1e3a8a' : '#e11d48' }}>${monthStats.net.toLocaleString()}</div>
              </div>
            </div>

            <PieChart 
              title="💸 支出類別佔比" 
              data={expenseChartData} 
              totalAmount={monthStats.expense}
              emptyMessage="本月尚無支出紀錄"
            />

            <PieChart 
              title="💵 收入類別佔比" 
              data={incomeChartData} 
              totalAmount={monthStats.income}
              emptyMessage="本月尚無收入紀錄"
            />
          </div>

        </div>
      </div>

      {/* Modal 視窗 */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          padding: '20px', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#ffffff', width: '100%', maxWidth: '420px',
            borderRadius: '24px', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '2.5px solid #1e3a8a'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1e3a8a' }}>
                {editingId ? '✏️ 編輯記帳' : '➕ 新增記帳'}
              </h3>
              <button type="button" onClick={handleCloseModal} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '8px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px', border: '1.5px solid #1e3a8a' }}>
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

              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{ padding: '12px', borderRadius: '12px', border: '2px solid #1e3a8a', backgroundColor: '#f8fafc', fontSize: '14px', outline: 'none', color: '#1e293b' }}
                />

                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #1e3a8a', backgroundColor: '#f8fafc', fontSize: '15px', outline: 'none', cursor: 'pointer', color: '#1e293b' }}
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

              <input 
                type="number" 
                placeholder="金額 (NT$)" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                style={{ padding: '12px 14px', borderRadius: '12px', border: '2px solid #1e3a8a', backgroundColor: '#f8fafc', fontSize: '15px', outline: 'none' }}
              />

              <input 
                type="text" 
                placeholder="備註 (選填，例如：晚餐、公車)" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                style={{ padding: '12px 14px', borderRadius: '12px', border: '2px solid #1e3a8a', backgroundColor: '#f8fafc', fontSize: '15px', outline: 'none' }}
              />

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #cbd5e1', backgroundColor: '#ffffff', color: '#64748b', fontWeight: '800', cursor: 'pointer' }}
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
      )}

    </div>
  );
}

export default App;