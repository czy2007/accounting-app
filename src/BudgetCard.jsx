import React, { memo } from 'react';

const BudgetCard = memo(function BudgetCard({ 
  budget, 
  setBudget, 
  monthExpense, 
  budgetStatus, 
  lang = 'zh-TW', 
  isDarkMode = false, 
  t = {} 
}) {
  
  const handleEditBudget = () => {
    // 多語系彈窗提示訊息
    const promptMsg = lang === 'zh-TW'
      ? '請輸入本月預算金額：'
      : lang === 'zh-CN'
      ? '请输入本月预算金额：'
      : lang === 'ja'
      ? '今月の予算金額を入力してください：'
      : lang === 'ko'
      ? '이번 달 예산 금액을 입력하세요:'
      : 'Please enter this month\'s budget amount:';

    const alertMsg = lang === 'zh-TW'
      ? '請輸入有效的預算數字！'
      : lang === 'zh-CN'
      ? '请输入有效的预算数字！'
      : lang === 'ja'
      ? '有効な予算数値を入力してください！'
      : lang === 'ko'
      ? '유효한 예산 숫자를 입력해주세요!'
      : 'Please enter a valid budget number!';

    const input = window.prompt(promptMsg, budget);
    if (input !== null) {
      const num = Number(input);
      if (!isNaN(num) && num >= 0) {
        setBudget(num);
      } else {
        window.alert(alertMsg);
      }
    }
  };

  // 多語系按鈕與標題文字 Fallback
  const titleText = t?.budgetControl || (
    lang === 'zh-TW' ? '🎯 本月預算控制' :
    lang === 'zh-CN' ? '🎯 本月预算控制' :
    lang === 'ja' ? '🎯 今月の予算管理' :
    lang === 'ko' ? '🎯 이달의 예산 관리' : '🎯 Monthly Budget Control'
  );

  const btnText = t?.setBudget || (
    lang === 'zh-TW' ? '設定預算' :
    lang === 'zh-CN' ? '设置预算' :
    lang === 'ja' ? '予算設定' :
    lang === 'ko' ? '예산 설정' : 'Set Budget'
  );

  const spentText = t?.spent || (
    lang === 'zh-TW' ? '已花費：' :
    lang === 'zh-CN' ? '已花费：' :
    lang === 'ja' ? '支出：' :
    lang === 'ko' ? '지출: ' : 'Spent: '
  );

  const overBudgetMsg = (overAmount) => {
    if (lang === 'zh-TW') return `🚨 注意：您已超出本月預算 $${overAmount.toLocaleString()} 元！`;
    if (lang === 'zh-CN') return `🚨 注意：您已超出本月预算 $${overAmount.toLocaleString()} 元！`;
    if (lang === 'ja') return `🚨 注意：今月の予算を ${overAmount.toLocaleString()} 円オーバーしています！`;
    if (lang === 'ko') return `🚨 주의: 이번 달 예산을 $${overAmount.toLocaleString()} 초과했습니다!`;
    return `🚨 Warning: You have exceeded this month's budget by $${overAmount.toLocaleString()}!`;
  };

  return (
    <div style={{
      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
      padding: '16px',
      borderRadius: '16px',
      border: budgetStatus.isOver 
        ? '2.5px solid #ef4444' 
        : isDarkMode ? '2px solid #334155' : '2px solid #1e3a8a',
      marginBottom: '16px',
      boxSizing: 'border-box',
      transition: 'background-color 0.3s ease, border-color 0.3s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: '15px', 
          fontWeight: '800', 
          color: isDarkMode ? '#93c5fd' : '#1e3a8a' 
        }}>
          {titleText}
        </h3>
        <button
          onClick={handleEditBudget}
          style={{
            border: 'none',
            background: isDarkMode ? '#334155' : '#e0e7ff',
            color: isDarkMode ? '#93c5fd' : '#1e3a8a',
            borderRadius: '6px',
            padding: '4px 8px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}
        >
          {btnText}
        </button>
      </div>

      {/* 金額文字顯示 */}
      <div style={{ 
        fontSize: '13px', 
        color: isDarkMode ? '#94a3b8' : '#475569', 
        marginBottom: '8px', 
        fontWeight: '600' 
      }}>
        {spentText}
        <span style={{ color: budgetStatus.color, fontWeight: '800' }}>
          ${monthExpense.toLocaleString()}
        </span> 
        {' / '}${budget.toLocaleString()}
        <span style={{ float: 'right', fontWeight: '700', color: budgetStatus.color }}>
          {budgetStatus.rawPercent}%
        </span>
      </div>

      {/* 警示條（進度條） */}
      <div style={{
        width: '100%',
        height: '10px',
        backgroundColor: isDarkMode ? '#334155' : '#e2e8f0',
        borderRadius: '5px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${budgetStatus.percent}%`,
          height: '100%',
          backgroundColor: budgetStatus.color,
          transition: 'width 0.3s ease-in-out, background-color 0.3s ease'
        }} />
      </div>

      {/* 超支警示標語 */}
      {budgetStatus.isOver && (
        <div style={{
          marginTop: '10px',
          color: '#ef4444',
          fontSize: '12px',
          fontWeight: '800',
          backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
          padding: '6px 10px',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }}>
          {overBudgetMsg(monthExpense - budget)}
        </div>
      )}
    </div>
  );
});

export default BudgetCard;