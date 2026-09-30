// src/pages/WalletsPage.jsx
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';

function WalletsPage(props) {
  // 🌐 從 Context 中取出全域狀態與多語系字典
  const context = useAppContext ? useAppContext() : {};

  const goals = props.goals || context.goals || [];
  const items = props.items || context.items || [];
  const isDarkMode = props.isDarkMode ?? context.isDarkMode ?? false;
  const baseCurrency = props.baseCurrency || context.baseCurrency || 'TWD';
  const lang = props.lang || context.lang || 'zh-TW';
  const rates = props.rates || context.rates || {};
  const t = props.t || context.t || {};

  const onAddGoal = props.onAddGoal || context.onAddGoal;
  const onEditGoal = props.onEditGoal || context.onEditGoal;
  const onDeleteGoal = props.onDeleteGoal || context.onDeleteGoal;
  const onDepositGoal = props.onDepositGoal || context.onDepositGoal;

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

  // 多語系警示與提示訊息處理
  const getAlertText = (key, extraData = {}) => {
    const messages = {
      fillRequired: {
        'ja': '目標名と目標金額を事前に入力してください！',
        'ko': '목표 이름과 목표 금액을 모두 입력해 주세요!',
        'en': 'Please fill in both the goal name and target amount!',
        'zh-CN': '请填写完整的目标名称与目标金额！',
        'zh-TW': '請填寫完整的目標名稱與目標金額！'
      },
      validTarget: {
        'ja': '目標金額は0より大きい有効な数字である必要があります！',
        'ko': '목표 금액은 0보다 큰 유효한 숫자여야 합니다!',
        'en': 'Target amount must be a valid number greater than 0!',
        'zh-CN': '目标金额必须是大於 0 的有效数字！',
        'zh-TW': '目標金額必須是大於 0 的有效數字！'
      },
      maxTarget: {
        'ja': '目標金額が妥当な範囲を超えています（上限：1億）！',
        'ko': '목표 금액이 합리적인 범위를 초과했습니다 (최대 1억)!',
        'en': 'Target amount exceeds the reasonable limit (Max 100M)!',
        'zh-CN': '目标金额超出合理范围（最大一亿）！',
        'zh-TW': '目標金額超出合理範圍（最大一億）！'
      },
      validCurrent: {
        'ja': '貯蓄額に負の数や無効な数字を入力することはできません！',
        'ko': '이미 저축한 금액은 음수이거나 유효하지 않은 숫자일 수 없습니다!',
        'en': 'Saved amount cannot be negative or invalid!',
        'zh-CN': '已存金额不能为负数或无效数字！',
        'zh-TW': '已存金額不能為負數或無效數字！'
      },
      datePast: {
        'ja': '完了予定日を今日より前の日付にすることはできません！',
        'ko': '완료 예상 일자는 오늘보다 이전일 수 없습니다!',
        'en': 'Target date cannot be earlier than today!',
        'zh-CN': '预计完成日期不能早于今天！',
        'zh-TW': '預計完成日期不能早於今天！'
      },
      overTargetConfirm: {
        'ja': `⚠️ 設定した「貯蓄額」($${extraData.numCurrent?.toLocaleString()}) が「目標金額」($${extraData.numTarget?.toLocaleString()}) を超えています。続行しますか？`,
        'ko': `⚠️ 설정한 '저축 금액'($${extraData.numCurrent?.toLocaleString()})이 '목표 금액'($${extraData.numTarget?.toLocaleString()})을 초과했습니다. 계속하시겠습니까?`,
        'en': `⚠️ Your "Saved Amount" ($${extraData.numCurrent?.toLocaleString()}) exceeds the "Target Amount" ($${extraData.numTarget?.toLocaleString()}). Do you wish to continue?`,
        'zh-CN': `⚠️ 您设定的“已存金额”($${extraData.numCurrent?.toLocaleString()}) 已超过“目标金额”($${extraData.numTarget?.toLocaleString()})，确定要继续保存吗？`,
        'zh-TW': `⚠️ 您設定的「已存金額」($${extraData.numCurrent?.toLocaleString()}) 已超過「目標金額」($${extraData.numTarget?.toLocaleString()})，確定要繼續儲存嗎？`
      },
      targetLessThanAccumulated: {
        'ja': `⚠️ 目標金額 ($${extraData.numTarget}) は、現在までに積み立てられた金額 ($${extraData.currentAccumulated}) より小さくすることはできません！`,
        'ko': `⚠️ 목표 금액($${extraData.numTarget})은 현재까지 누적된 저축 금액($${extraData.currentAccumulated})보다 적을 수 없습니다!`,
        'en': `⚠️ Target amount ($${extraData.numTarget}) cannot be less than the currently accumulated saved amount ($${extraData.currentAccumulated})!`,
        'zh-CN': `⚠️ 目标金额 ($${extraData.numTarget}) 不能小于目前已经累计存入的金额 ($${extraData.currentAccumulated})！`,
        'zh-TW': `⚠️ 目標金額 ($${extraData.numTarget}) 不能小於目前已經累積存入的金額 ($${extraData.currentAccumulated})！`
      },
      selectCurrency: {
        'ja': '入金する通貨を選択してください！',
        'ko': '입금할 통화를 선택해 주세요!',
        'en': 'Please select a deposit currency!',
        'zh-CN': '请选择存入资金的币别！',
        'zh-TW': '請選擇存入資金的幣別！'
      },
      validDeposit: {
        'ja': '入金金額は0より大きい有効な数字である必要があります！',
        'ko': '입금 금액은 0보다 큰 유효한 숫자여야 합니다!',
        'en': 'Deposit amount must be a valid number greater than 0!',
        'zh-CN': '存入金额必须是大於 0 的有效数字！',
        'zh-TW': '存入金額必須是大於 0 的有效數字！'
      },
      maxDeposit: {
        'ja': '1回の入金金額が合理的な上限を超えています！',
        'ko': '1회 입금 금액이 합리적인 한도를 초과했습니다!',
        'en': 'Single deposit amount exceeds reasonable limit!',
        'zh-CN': '单次存入金额超出合理上限！',
        'zh-TW': '單次存入金額超出合理上限！'
      }
    };

    return messages[key]?.[lang] || messages[key]?.[t.langKey] || messages[key]?.['zh-TW'] || '';
  };

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

  // 表單提交與邊界防呆
  const handleGoalSubmit = (e) => {
    e.preventDefault();

    const trimmedName = goalName.trim();
    if (!trimmedName || !goalTarget) {
      alert('⚠️ ' + (t.alertFillRequired || getAlertText('fillRequired')));
      return;
    }

    const numTarget = Number(goalTarget);
    const numCurrent = Number(goalCurrent) || 0;

    // 🛡️ 防呆 1：數字有效性與上限檢查
    if (isNaN(numTarget) || numTarget <= 0) {
      alert('⚠️ ' + (t.alertValidTarget || getAlertText('validTarget')));
      return;
    }

    if (numTarget > 1000000000) {
      alert('⚠️ ' + (t.alertMaxTarget || getAlertText('maxTarget')));
      return;
    }

    if (isNaN(numCurrent) || numCurrent < 0) {
      alert('⚠️ ' + (t.alertValidCurrent || getAlertText('validCurrent')));
      return;
    }

    // 🛡️ 防呆 2：日期防呆（建立新目標時不能選過去日期）
    if (goalDate && !editingGoalId) {
      const selectedDate = new Date(goalDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        alert('⚠️ ' + (t.alertDatePast || getAlertText('datePast')));
        return;
      }
    }

    // 🛡️ 防呆 3：已存金額高於目標金額時的二次提醒
    if (numCurrent > numTarget) {
      const confirmOver = window.confirm(getAlertText('overTargetConfirm', { numCurrent, numTarget }));
      if (!confirmOver) return;
    }

    // 🛡️ 防呆 4：編輯目標時，目標金額低於累積金額檢查
    if (editingGoalId) {
      const existingGoal = goals.find(g => g.id === editingGoalId);
      if (existingGoal) {
        const currentAccumulated = Number(existingGoal.currentAmount || 0);
        if (numTarget < currentAccumulated) {
          alert(getAlertText('targetLessThanAccumulated', { numTarget, currentAccumulated }));
          return;
        }
      }
    }

    const goalPayload = {
      name: trimmedName,
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

  // 存入資金邊界防呆
  const handleDepositSubmit = (e) => {
    e.preventDefault();

    if (!depositCurrency) {
      alert('⚠️️ ' + (t.alertSelectCurrency || getAlertText('selectCurrency')));
      return;
    }

    const numDeposit = Number(depositAmount);

    // 🛡️ 防呆：存入金額有效性與上限檢查
    if (isNaN(numDeposit) || numDeposit <= 0) {
      alert('⚠️ ' + (t.alertValidDeposit || getAlertText('validDeposit')));
      return;
    }

    if (numDeposit > 100000000) {
      alert('⚠️️ ' + (t.alertMaxDeposit || getAlertText('maxDeposit')));
      return;
    }

    if (onDepositGoal) {
      onDepositGoal(depositGoalId, numDeposit, depositCurrency);
    }

    setDepositGoalId(null);
    setDepositAmount('');
  };

  // 主題控制樣式
  const cardBg = isDarkMode ? '#1e293b' : '#ffffff';
  const textColor = isDarkMode ? '#f8fafc' : '#0f172a';
  const subTextColor = isDarkMode ? '#94a3b8' : '#64748b';
  const borderStyle = isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0';

  // 表單輸入框樣式
  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '8px',
    border: isDarkMode ? '1px solid #475569' : '1px solid #cbd5e1',
    backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
    color: textColor,
    boxSizing: 'border-box',
    outline: 'none'
  };

  // 可選幣別列表（若 context 有 rates 則整合，否則提供預設清單）
  const currencyOptions = Object.keys(rates).length > 0 
    ? Object.keys(rates) 
    : ['TWD', 'USD', 'JPY', 'EUR', 'GBP', 'HKD', 'KRW'];

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
          👛 {t.walletTitle || '錢包'}
        </div>
        
        {/* 淨結餘 */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', color: subTextColor }}>
            {t.netBalanceDesc || '目前淨結餘 (總收入 - 總支出)'}
          </div>
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
            <div style={{ fontSize: '12px', color: isDarkMode ? '#86efac' : '#15803d', fontWeight: '700' }}>
              📈 {t.totalIncome || '累計總收入'}
            </div>
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
            <div style={{ fontSize: '12px', color: isDarkMode ? '#fca5a5' : '#b91c1c', fontWeight: '700' }}>
              📉 {t.totalExpense || '累計總支出'}
            </div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#ef4444', marginTop: '4px' }}>
              -${totalStats.totalExpense.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 夢想存錢目標 */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', margin: 0, color: textColor }}>
            🎯 {t.dreamsTitle || '夢想存錢目標'}
          </h2>
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
            ＋ {t.addGoal || '新增目標'}
          </button>
        </div>

        {/* 空白狀態引導圖文 */}
        {goals.length === 0 ? (
          <div style={{ 
            backgroundColor: cardBg, 
            padding: '40px 20px', 
            borderRadius: '16px', 
            textAlign: 'center', 
            border: borderStyle,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '4px' }}>🎯</div>
            <h3 style={{ margin: 0, color: textColor, fontSize: '18px' }}>
              {t.noGoalsTitle || '尚無任何存錢目標'}
            </h3>
            <p style={{ margin: 0, color: subTextColor, fontSize: '14px' }}>
              {t.noGoalsDesc || '點擊右上角「＋ 新增目標」建立第一個理財夢想吧！'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {goals.map(goal => {
              const currentAmt = Number(goal.currentAmount || 0);
              const targetAmt = Number(goal.targetAmount || 1);
              const rawPercent = Math.round((currentAmt / targetAmt) * 100);
              const percent = Math.min(rawPercent, 100);
              const isCompleted = currentAmt >= targetAmt; // 判斷是否已達成目標
              const displayCurrency = goal.currency || baseCurrency;

              return (
                <div 
                  key={goal.id}
                  style={{
                    backgroundColor: isCompleted ? (isDarkMode ? '#064e3b' : '#f0fdf4') : cardBg,
                    padding: '20px',
                    borderRadius: '16px',
                    border: isCompleted ? '2px solid #10b981' : borderStyle,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {/* 🌟 標題卡片頂欄 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    
                    {/* 左側：目標名稱 + 已達成標籤 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        fontSize: '18px', 
                        fontWeight: 'bold', 
                        color: textColor,
                        maxWidth: '180px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }} title={goal.name}>
                        {goal.icon ? `${goal.icon} ` : ''}{goal.name}
                      </div>

                      {isCompleted && (
                        <span style={{
                          backgroundColor: '#10b981',
                          color: '#ffffff',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: '800',
                          boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
                          whiteSpace: 'nowrap'
                        }}>
                          🎉 {t.achieved || '已達成目標！'}
                        </span>
                      )}
                    </div>

                    {/* 右側：百分比與編輯/刪除按鈕 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 'bold', color: isCompleted ? '#10b981' : '#3b82f6' }}>
                        {rawPercent}%
                      </span>
                      
                      <button
                        onClick={() => handleOpenEditModal(goal)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px' }}
                        title={t.edit || '編輯'}
                      >
                        ✏️
                      </button>

                      {onDeleteGoal && (
                        <button
                          onClick={() => onDeleteGoal(goal.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: subTextColor, fontSize: '15px' }}
                          title={t.delete || '刪除'}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 進度條 */}
                  <div style={{ width: '100%', height: '10px', backgroundColor: isDarkMode ? '#334155' : '#e2e8f0', borderRadius: '5px', overflow: 'hidden', marginBottom: '12px' }}>
                    <div style={{ width: `${percent}%`, height: '100%', backgroundColor: isCompleted ? '#10b981' : '#3b82f6', transition: 'width 0.4s ease' }} />
                  </div>

                  {/* 底部已存金額與存入按鈕 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '14px', color: subTextColor }}>
                      {t.savedLabel || '已存'}：<strong style={{ color: textColor }}>${currentAmt.toLocaleString()} {displayCurrency}</strong> / {t.targetLabel || '目標'}：${targetAmt.toLocaleString()} {displayCurrency}
                    </div>
                    <button
                      onClick={() => handleOpenDepositModal(goal)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: isCompleted ? '#10b981' : (isDarkMode ? '#334155' : '#f1f5f9'),
                        color: isCompleted ? '#ffffff' : textColor,
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease'
                      }}
                    >
                      💰 {isCompleted ? (t.continueDeposit || '繼續存入') : (t.deposit || '存入資金')}
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
              {editingGoalId ? `✏️ ${t.editGoalTitle || '編輯存錢目標'}` : `＋ ${t.addGoalTitle || '新增存錢目標'}`}
            </h3>
            
            {/* 圖示選擇器 */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: subTextColor, marginBottom: '4px' }}>
                {t.iconLabel || '目標圖示'}
              </label>
              <select value={goalIcon} onChange={e => setGoalIcon(e.target.value)} style={inputStyle}>
                <option value="🎯">🎯 {t.iconTarget || '一般目標'}</option>
                <option value="✈️">✈️ {t.iconTravel || '旅遊基金'}</option>
                <option value="🚗">🚗 {t.iconCar || '購車基金'}</option>
                <option value="🏠">🏠 {t.iconHouse || '購屋預備金'}</option>
                <option value="💻">💻 {t.iconGadget || '3C設備'}</option>
                <option value="">🚫 {t.iconNone || '無圖示 (不顯示圖示)'}</option>
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: subTextColor, marginBottom: '4px' }}>
                {t.goalNameLabel || '目標名稱'} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input type="text" maxLength={30} value={goalName} onChange={e => setGoalName(e.target.value)} placeholder={t.goalNamePlaceholder || '例：買筆電'} style={inputStyle} required />
            </div>

            {/* 目標幣別 */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: subTextColor, marginBottom: '4px' }}>
                {t.goalCurrencyLabel || '目標幣別'} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select value={goalCurrency} onChange={e => setGoalCurrency(e.target.value)} style={inputStyle} required>
                {currencyOptions.map(code => (
                  <option key={code} value={code}>
                    {rates[code]?.flag || ''} {code} {rates[code]?.label ? `(${rates[code].label})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: subTextColor, marginBottom: '4px' }}>
                {t.targetAmountLabel || '目標金額'} ({goalCurrency}) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input type="number" min="1" max="1000000000" value={goalTarget} onChange={e => setGoalTarget(e.target.value)} placeholder="50000" style={inputStyle} required />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: subTextColor, marginBottom: '4px' }}>
                {t.currentAmountLabel || '已存金額'} ({goalCurrency})
              </label>
              <input type="number" min="0" value={goalCurrent} onChange={e => setGoalCurrent(e.target.value)} placeholder="0" style={inputStyle} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: subTextColor, marginBottom: '4px' }}>
                {t.targetDateLabel || '預計完成日期'}
              </label>
              <input type="date" value={goalDate} onChange={e => setGoalDate(e.target.value)} style={inputStyle} />
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setIsGoalModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: isDarkMode ? '#334155' : '#e2e8f0', color: textColor, cursor: 'pointer' }}>
                {t.cancel || '取消'}
              </button>
              <button type="submit" style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#10b981', color: '#fff', cursor: 'pointer' }}>
                {editingGoalId ? (t.saveChanges || '儲存變更') : (t.createGoal || '建立目標')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: 存入資金 */}
      {depositGoalId && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <form onSubmit={handleDepositSubmit} style={{ backgroundColor: cardBg, padding: '24px', borderRadius: '16px', width: '320px', border: borderStyle }}>
            <h3 style={{ marginTop: 0, color: textColor }}>
              💰 {t.depositModalTitle || '存入資金至目標'}
            </h3>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: subTextColor, marginBottom: '4px' }}>
                {t.depositCurrencyLabel || '存入資金幣別'} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select value={depositCurrency} onChange={e => setDepositCurrency(e.target.value)} style={inputStyle} required>
                {currencyOptions.map(code => (
                  <option key={code} value={code}>
                    {rates[code]?.flag || ''} {code} {rates[code]?.label ? `(${rates[code].label})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: subTextColor, marginBottom: '4px' }}>
                {t.depositAmountLabel || '存入金額'} ({depositCurrency}) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input type="number" min="1" max="100000000" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} placeholder="例：3000" style={inputStyle} required />
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setDepositGoalId(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: isDarkMode ? '#334155' : '#e2e8f0', color: textColor, cursor: 'pointer' }}>
                {t.cancel || '取消'}
              </button>
              <button type="submit" style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#3b82f6', color: '#fff', cursor: 'pointer' }}>
                {t.deposit || '存入'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

export default WalletsPage;