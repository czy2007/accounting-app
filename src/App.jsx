import React, { useState, useEffect } from 'react';

function App() {
  // 1. 初始化 state：從 localStorage 讀取資料
  const [items, setItems] = useState(() => {
    const savedItems = localStorage.getItem('accounting_items');
    return savedItems ? JSON.parse(savedItems) : [];
  });

  // 2. 當 items 改變時，自動同步儲存至 localStorage
  useEffect(() => {
    localStorage.setItem('accounting_items', JSON.stringify(items));
  }, [items]);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('🍔 餐飲');

  const handleAdd = (e) => {
    if (e) e.preventDefault();
    
    if (!name.trim() || !amount) {
      alert('請填寫完整的項目名稱與金額！');
      return;
    }

    if (Number(amount) <= 0) {
      alert('金額必須大於 0 元！');
      return;
    }

    setItems(prevItems => [
      ...prevItems, 
      { 
        id: Date.now(), 
        name: name.trim(), 
        amount: Number(amount),
        category 
      }
    ]);

    setName('');
    setAmount('');
  };

  const handleDelete = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  // 計算總金額（直接對原始數據加總）
  const totalAmount = items.reduce((sum, item) => {
    const currentAmount = Number(item.amount);
    return sum + (isNaN(currentAmount) ? 0 : currentAmount);
  }, 0);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cg fill='none' stroke='%231e3a8a' stroke-width='2' stroke-linejoin='round'%3E%3Cpolygon points='20,5 25,18 38,18 28,26 31,39 20,31 9,39 12,26 2,18 15,18' transform='translate(10, 10) rotate(15 20 20) scale(0.75)'/%3E%3Cpolygon points='20,5 25,18 38,18 28,26 31,39 20,31 9,39 12,26 2,18 15,18' transform='translate(110, 25) rotate(-28 20 20) scale(0.5)'/%3E%3Cpolygon points='20,5 25,18 38,18 28,26 31,39 20,31 9,39 12,26 2,18 15,18' transform='translate(55, 95) rotate(42 20 20) scale(0.65)'/%3E%3Cpolygon points='20,5 25,18 38,18 28,26 31,39 20,31 9,39 12,26 2,18 15,18' transform='translate(135, 120) rotate(-18 20 20) scale(0.85)'/%3E%3Cpolygon points='20,5 25,18 38,18 28,26 31,39 20,31 9,39 12,26 2,18 15,18' transform='translate(5, 140) rotate(33 20 20) scale(0.45)'/%3E%3C/g%3E%3C/svg%3E")`,
      backgroundRepeat: 'repeat',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxSizing: 'border-box'
    }}>
      <div style={{ 
        maxWidth: '480px', 
        margin: '0 auto', 
        padding: '32px 28px', 
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
        borderRadius: '20px',
        backgroundColor: '#ffffff',
        color: '#1e293b'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          fontSize: '26px', 
          fontWeight: '800',
          marginBottom: '24px',
          letterSpacing: '-0.5px'
        }}>
          💰 我的記帳 App
        </h1>
        
        {/* 新增項目表單 */}
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              style={{ 
                padding: '12px', 
                borderRadius: '10px', 
                border: '1px solid #cbd5e1', 
                backgroundColor: '#f8fafc', 
                fontSize: '15px',
                outline: 'none',
                cursor: 'pointer' 
              }}
            >
              <option value="🍔 餐飲">🍔 餐飲</option>
              <option value="🚗 交通">🚗 交通</option>
              <option value="🎬 娛樂">🎬 娛樂</option>
              <option value="🛒 購物">🛒 購物</option>
              <option value="👔 服飾">👔 服飾</option>
              <option value="🎁 禮物">🎁 禮物</option>
              <option value="💡 雜項">💡 雜項</option>
            </select>

            <input 
              type="text" 
              inputMode="text"
              placeholder="項目名稱 (如: 晚餐)" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              style={{ 
                padding: '12px 14px', 
                flex: 1, 
                borderRadius: '10px', 
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                fontSize: '15px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="number" 
              inputMode="decimal"
              placeholder="金額" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              style={{ 
                padding: '12px 14px', 
                flex: 1, 
                borderRadius: '10px', 
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                fontSize: '15px',
                outline: 'none'
              }}
            />
            <button 
              type="submit" 
              style={{ 
                padding: '12px 24px', 
                cursor: 'pointer', 
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '15px',
                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
              }}
            >
              新增
            </button>
          </div>
        </form>

        {/* 總金額顯示卡片 (已加入防翻譯屬性) */}
        <div style={{ 
          background: 'linear-gradient(135deg, #fff5f5 0%, #ffe4e6 100%)', 
          padding: '18px 20px', 
          borderRadius: '14px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '28px',
          border: '1px solid #fecdd3'
        }}>
          <span style={{ fontWeight: '600', color: '#9f1239', fontSize: '15px' }}>總支出金額</span>
          <span translate="no" className="notranslate" style={{ fontSize: '24px', fontWeight: '800', color: '#e11d48' }}>
            NT$ {totalAmount.toLocaleString()}
          </span>
        </div>

        <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#64748b', marginBottom: '16px' }}>
          消費明細
        </h2>
        
        {/* 消費紀錄列表 */}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.length === 0 ? (
            <li style={{ 
              color: '#475569', 
              backgroundColor: '#f1f5f9', 
              border: '1px solid #64748b', 
              borderRadius: '12px', 
              textAlign: 'center', 
              padding: '20px', 
              fontSize: '14px' 
            }}>
              目前尚無消費紀錄，開始記第一筆吧！
            </li>
          ) : (
            items.map(item => (
              <li key={item.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px 16px', 
                backgroundColor: '#f1f5f9', 
                borderRadius: '12px',
                border: '1px solid #64748b'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ 
                    fontSize: '13px', 
                    backgroundColor: '#ffffff', 
                    padding: '4px 10px', 
                    borderRadius: '20px', 
                    border: '1px solid #bfdbfe',
                    fontWeight: '500',
                    color: '#1e40af'
                  }}>
                    {item.category}
                  </span>
                  <span style={{ fontWeight: '500', fontSize: '15px', color: '#1e293b' }}>
                    {item.name}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <strong translate="no" className="notranslate" style={{ fontSize: '15px', color: '#0f172a' }}>
                    NT$ {item.amount.toLocaleString()}
                  </strong>
                  <button 
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    style={{
                      backgroundColor: '#fee2e2',
                      color: '#ef4444',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                  >
                    刪除
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default App;