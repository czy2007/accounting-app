import React from 'react';

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
  setName
}) {
  if (!isOpen) return null;

  return (
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
          <button type="button" onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>✕</button>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
              onClick={onClose}
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
  );
}

export default ExpenseForm;