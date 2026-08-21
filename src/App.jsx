import { useState } from 'react'

function App() {
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')

  // 新增消費項目
  const handleAdd = (e) => {
    e.preventDefault()
    if (!name || !amount) return
    // 關鍵：使用 Number(amount) 把字串轉成數字
    setItems([...items, { id: Date.now(), name, amount: Number(amount) }])
    setName('')
    setAmount('')
  }

  // 刪除消費項目
  const handleDelete = (id) => {
    setItems(items.filter(item => item.id !== id))
  }

  // 計算總金額
  // 強制將每一個 item.amount 轉為數字再相加
  const totalAmount = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)

  return (
    <div style={{ 
      maxWidth: '450px', 
      margin: '50px auto', 
      padding: '24px', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      borderRadius: '12px',
      backgroundColor: '#ffffff',
      color: '#333333'
    }}>
      <h1 style={{ textAlign: 'center', fontSize: '24px', marginBottom: '20px' }}>
        💰 我的記帳 App
      </h1>
      
      {/* 新增項目表單 */}
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="項目名稱 (如: 晚餐)" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          style={{ padding: '10px', flex: 1, borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <input 
          type="number" 
          placeholder="金額" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          style={{ padding: '10px', width: '80px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <button 
          type="submit" 
          style={{ 
            padding: '10px 16px', 
            cursor: 'pointer', 
            backgroundColor: '#007bff', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '6px',
            fontWeight: 'bold'
          }}
        >
          新增
        </button>
      </form>

      {/* 總金額顯示區 (台幣格式) */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '12px 16px', 
        borderRadius: '8px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <span style={{ fontWeight: 'bold' }}>總支出：</span>
        {/* 確保 span 裡面放的是 {totalAmount} */}
        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc3545' }}>
          新台幣 {totalAmount} 元
        </span>
      </div>

      <h2 style={{ fontSize: '18px', borderBottom: '2px solid #eee', paddingBottom: '8px' }}>
        消費明細
      </h2>
      
      {/* 消費紀錄列表 */}
      <ul style={{ listStyle: 'none', padding: 0, marginTop: '12px' }}>
        {items.length === 0 ? (
          <li style={{ color: '#888', textAlign: 'center', marginTop: '20px' }}>目前尚無消費紀錄</li>
        ) : (
          items.map(item => (
            <li key={item.id} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '10px 0', 
              borderBottom: '1px solid #f0f0f0' 
            }}>
              <span>{item.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <strong>NT$ {item.amount}</strong>
                <button 
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#dc3545',
                    border: '1px solid #dc3545',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    cursor: 'pointer',
                    fontSize: '12px'
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
  )
}

export default App