import React, { useState, useMemo } from 'react';

function WalletsPage({
  goals = [],
  items = [],
  isDarkMode = false,
  baseCurrency = 'TWD',
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  onDepositGoal
}) {
  // Modal 狀態：新增與編輯目標
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('0');
  const [goalCurrency, setGoalCurrency] = useState(baseCurrency);
  const [goalDate, setGoalDate] = useState('');
  const [goalIcon, setGoalIcon] = useState('🎯');

  // Modal 狀態：存入資金
  const [depositGoalId, setDepositGoalId] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositCurrency, setDepositCurrency] = useState(baseCurrency);

  // 計算全站總統計：總收入、總支出、結餘 (收入 - 支出)
  const totalStats = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    items.forEach(item => {
      const amt = Number(item.amount) || 0;
      if (item.type === 'income') {
        totalIncome += amt;
      } else if (item.type === 'expense') {
        totalExpense += amt;
      }
    });

    const netBalance = totalIncome - totalExpense;

    return { totalIncome, totalExpense, netBalance };
  }, [items]);

  // 開啟「新增」目標 Modal
  const handleOpenAddModal = () => {
    setEditingGoalId(null);
    setGoalName('');
    setGoalTarget('');
    setGoalCurrent('0');
    setGoalCurrency(baseCurrency);
    setGoalDate('');
    setGoalIcon('🎯');
    setIsGoalModalOpen(true);
  };

  // 開啟「編輯」目標 Modal
  const handleOpenEditModal = (goal) => {
    setEditingGoalId(goal.id);
    setGoalName(goal.name || '');
    setGoalTarget(goal.originalTargetAmount || goal.targetAmount || '');
    setGoalCurrent(goal.originalCurrentAmount || goal.currentAmount || '0');
    setGoalCurrency(goal.currency || baseCurrency);
    setGoalDate(goal.targetDate === '無期限' ? '' : (goal.targetDate || ''));
    setGoalIcon(goal.icon || '');
    setIsGoalModalOpen(true);
  };

  // 開啟「存入資金」Modal
  const handleOpenDepositModal = (goal) => {
    setDepositGoalId(goal.id);
    setDepositAmount('');
    setDepositCurrency(goal.currency || baseCurrency);
  };

  const handleGoalSubmit = (e) => {
    e.preventDefault();
    if (!goalName.trim() || !goalTarget) {
      alert('請填寫完整目標名稱與金額！');
      return;
    }

    const numTarget = Number(goalTarget);
    const numCurrent = Number(goalCurrent) || 0;

    const goalPayload = {
      name: goalName.trim(),
      targetAmount: numTarget,
      originalTargetAmount: numTarget,
      currentAmount: numCurrent,
      originalCurrentAmount: numCurrent,
      currency: goalCurrency,
      targetDate: goalDate || '無期限',
      icon: goalIcon
    };

    if (editingGoalId) {
      if (onEditGoal) {
        onEditGoal({
          ...goalPayload,
          id: editingGoalId,
        });
      }
    } else {
      if (onAddGoal) {
        onAddGoal(goalPayload);
      }
    }

    setIsGoalModalOpen(false);
  };

  const handleDepositSubmit = (e) => {
    e.preventDefault();
    if (!depositCurrency) {
      alert('請選擇存入資金的幣別！');
      return;
    }
    if (onDepositGoal) {
      onDepositGoal(depositGoalId, depositAmount, depositCurrency);
    }
    setDepositGoalId(null);
    setDepositAmount('');
  };

  const cardBg = isDarkMode ? '#1e293b' : '#ffffff';
  const textColor = isDarkMode ? '#f8fafc' : '#0f172a';
  const subTextColor = isDarkMode ? '#94a3b8' : '#64748b';
  const borderStyle = isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0';

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 📊 錢包總資產結算看板 */}
      <div style={{
        backgroundColor: cardBg,
        padding: '24px',
        borderRadius: '20px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
        border: borderStyle,
        backgroundImage: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(16, 185, 129, 0.08))'
      }}>
        <div style={{ fontSize: '22px', fontWeight: '800', color: textColor, marginBottom: '12px' }}>
           錢包
        </div>
        
        {/* 淨結餘 */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', color: subTextColor }}>目前淨結餘 (總收入 - 總支出)</div>
          <div style={{ 
            fontSize: '38px', 
            fontWeight: '900', 
            color: totalStats.netBalance < 0 ? '#ef4444' : '#10b981',
            marginTop: '4px' 
          }}>
            ${totalStats.netBalance.toLocaleString()} <span style={{ fontSize: '18px' }}>{baseCurrency}</span>
          </div>
        </div>

        {/* 總收入 & 總支出 雙欄卡片 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{
            backgroundColor: isDarkMode ? '#0f172a' : '#f0fdf4',
            padding: '14px 16px',
            borderRadius: '14px',
            border: isDarkMode ? '1px solid #166534' : '1px solid #bbf7d0'
          }}>
            <div style={{ fontSize: '12px', color: isDarkMode ? '#86efac' : '#15803d', fontWeight: '700' }}>📈 累計總收入</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#10b981', marginTop: '4px' }}>
              +${totalStats.totalIncome.toLocaleString()}
            </div>
          </div>

          <div style={{
            backgroundColor: isDarkMode ? '#0f172a' : '#fef2f2',
            padding: '14px 16px',
            borderRadius: '14px',
            border: isDarkMode ? '1px solid #991b1b' : '1px solid #fecaca'
          }}>
            <div style={{ fontSize: '12px', color: isDarkMode ? '#fca5a5' : '#b91c1c', fontWeight: '700' }}>📉 累計總支出</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#ef4444', marginTop: '4px' }}>
              -${totalStats.totalExpense.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 夢想存錢目標 */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', margin: 0, color: textColor }}>🎯 夢想存錢目標</h2>
          <button
            onClick={handleOpenAddModal}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: '#10b981',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ＋ 新增目標
          </button>
        </div>

        {goals.length === 0 ? (
          <div style={{ backgroundColor: cardBg, padding: '24px', borderRadius: '16px', textAlign: 'center', color: subTextColor, border: borderStyle }}>
            目前還沒有設定任何存錢目標，點擊右上角「＋ 新增目標」建立一個吧！
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {goals.map(goal => {
              const currentAmt = Number(goal.currentAmount || 0);
              const targetAmt = Number(goal.targetAmount || 1);
              const percent = Math.min(Math.round((currentAmt / targetAmt) * 100), 100);
              const displayCurrency = goal.currency || baseCurrency;

              return (
                <div 
                  key={goal.id}
                  style={{
                    backgroundColor: cardBg,
                    padding: '20px',
                    borderRadius: '16px',
                    border: borderStyle,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: textColor }}>
                      {goal.icon ? `${goal.icon} ` : ''}{goal.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#3b82f6' }}>{percent}%</span>
                      
                      <button
                        onClick={() => handleOpenEditModal(goal)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px' }}
                        title="編輯目標"
                      >
                        ✏️
                      </button>

                      {onDeleteGoal && (
                        <button
                          onClick={() => onDeleteGoal(goal.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: subTextColor, fontSize: '15px' }}
                          title="刪除目標"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 進度條 */}
                  <div style={{ width: '100%', height: '10px', backgroundColor: isDarkMode ? '#334155' : '#e2e8f0', borderRadius: '5px', overflow: 'hidden', marginBottom: '12px' }}>
                    <div style={{ width: `${percent}%`, height: '100%', backgroundColor: percent >= 100 ? '#10b981' : '#3b82f6', transition: 'width 0.4s ease' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '14px', color: subTextColor }}>
                      已存：<strong style={{ color: textColor }}>${currentAmt.toLocaleString()} {displayCurrency}</strong> / 目標：${targetAmt.toLocaleString()} {displayCurrency}
                    </div>
                    <button
                      onClick={() => handleOpenDepositModal(goal)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: isDarkMode ? '#334155' : '#f1f5f9',
                        color: textColor,
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      💰 存入資金
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: 新增 / 編輯目標 */}
      {isGoalModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <form onSubmit={handleGoalSubmit} style={{ backgroundColor: cardBg, padding: '24px', borderRadius: '16px', width: '320px', border: borderStyle }}>
            <h3 style={{ marginTop: 0, color: textColor }}>
              {editingGoalId ? '✏️ 編輯存錢目標' : '＋ 新增存錢目標'}
            </h3>
            
            {/* 圖示選擇器 */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: subTextColor, marginBottom: '4px' }}>目標圖示</label>
              <select value={goalIcon} onChange={e => setGoalIcon(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px' }}>
                <option value="🎯">🎯 一般目標</option>
                <option value="✈️">✈️ 旅遊基金</option>
                <option value="🚗">🚗 購車基金</option>
                <option value="🏠">🏠 購屋預備金</option>
                <option value="💻">💻 3C設備</option>
                <option value="">🚫 無圖示 (不顯示圖示)</option>
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: subTextColor, marginBottom: '4px' }}>目標名稱</label>
              <input type="text" value={goalName} onChange={e => setGoalName(e.target.value)} placeholder="例：買筆電" style={{ width: '100%', padding: '8px', borderRadius: '8px', boxSizing: 'border-box' }} required />
            </div>

            {/* 🌟 目標幣別（必填 required） */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: subTextColor, marginBottom: '4px' }}>目標幣別 <span style={{ color: '#ef4444' }}>*</span></label>
              <select value={goalCurrency} onChange={e => setGoalCurrency(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px' }} required>
                <option value="TWD">🇹🇼 TWD (新台幣)</option>
                <option value="USD">🇺🇸 USD (美元)</option>
                <option value="JPY">🇯🇵 JPY (日圓)</option>
                <option value="EUR">🇪🇺 EUR (歐元)</option>
                <option value="GBP">🇬🇧 GBP (英鎊)</option>
                <option value="HKD">🇭🇰 HKD (港幣)</option>
                <option value="KRW">🇰🇷 KRW (韓元)</option>
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: subTextColor, marginBottom: '4px' }}>目標金額 ({goalCurrency})</label>
              <input type="number" value={goalTarget} onChange={e => setGoalTarget(e.target.value)} placeholder="50000" style={{ width: '100%', padding: '8px', borderRadius: '8px', boxSizing: 'border-box' }} required />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: subTextColor, marginBottom: '4px' }}>已存金額 ({goalCurrency})</label>
              <input type="number" value={goalCurrent} onChange={e => setGoalCurrent(e.target.value)} placeholder="0" style={{ width: '100%', padding: '8px', borderRadius: '8px', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: subTextColor, marginBottom: '4px' }}>預計完成日期</label>
              <input type="date" value={goalDate} onChange={e => setGoalDate(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setIsGoalModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>取消</button>
              <button type="submit" style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#10b981', color: '#fff', cursor: 'pointer' }}>
                {editingGoalId ? '儲存變更' : '建立目標'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: 存入資金 (支援動態選擇存入幣別) */}
      {depositGoalId && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <form onSubmit={handleDepositSubmit} style={{ backgroundColor: cardBg, padding: '24px', borderRadius: '16px', width: '320px', border: borderStyle }}>
            <h3 style={{ marginTop: 0, color: textColor }}>💰 存入資金至目標</h3>
            
            {/* 🌟 存入資金幣別（必填 required） */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: subTextColor, marginBottom: '4px' }}>存入資金幣別 <span style={{ color: '#ef4444' }}>*</span></label>
              <select value={depositCurrency} onChange={e => setDepositCurrency(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px' }} required>
                <option value="TWD">🇹🇼 TWD (新台幣)</option>
                <option value="USD">🇺🇸 USD (美元)</option>
                <option value="JPY">🇯🇵 JPY (日圓)</option>
                <option value="EUR">🇪🇺 EUR (歐元)</option>
                <option value="GBP">🇬🇧 GBP (英鎊)</option>
                <option value="HKD">🇭🇰 HKD (港幣)</option>
                <option value="KRW">🇰🇷 KRW (韓元)</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: subTextColor, marginBottom: '4px' }}>存入金額 ({depositCurrency})</label>
              <input type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} placeholder="例：3000" style={{ width: '100%', padding: '8px', borderRadius: '8px', boxSizing: 'border-box' }} required />
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setDepositGoalId(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>取消</button>
              <button type="submit" style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#3b82f6', color: '#fff', cursor: 'pointer' }}>存入</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

export default WalletsPage;