import React, { memo } from 'react';

const BudgetCard = memo(function BudgetCard({ budget, setBudget, monthExpense, budgetStatus }) {
  const handleEditBudget = () => {
    const input = prompt('請輸入本月預算金額：', budget);
    if (input !== null) {
      const num = Number(input);
      if (!isNaN(num) && num >= 0) {
        setBudget(num);
      } else {
        alert('請輸入有效的預算數字！');
      }
    }
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      padding: '16px',
      borderRadius: '16px',
      border: budgetStatus.isOver ? '2.5px solid #ef4444' : '2px solid #1e3a8a',
      marginBottom: '16px',
      boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#1e3a8a' }}>
          🎯 本月預算控制
        </h3>
        <button
          onClick={handleEditBudget}
          style={{
            border: 'none',
            background: '#e0e7ff',
            color: '#1e3a8a',
            borderRadius: '6px',
            padding: '4px 8px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          設定預算
        </button>
      </div>

      {/* 金額文字顯示 */}
      <div style={{ fontSize: '13px', color: '#475569', marginBottom: '8px', fontWeight: '600' }}>
        已花費：<span style={{ color: budgetStatus.color, fontWeight: '800' }}>${monthExpense.toLocaleString()}</span> / ${budget.toLocaleString()}
        <span style={{ float: 'right', fontWeight: '700', color: budgetStatus.color }}>
          {budgetStatus.rawPercent}%
        </span>
      </div>

      {/* 警示條（進度條） */}
      <div style={{
        width: '100%',
        height: '10px',
        backgroundColor: '#e2e8f0',
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
          backgroundColor: '#fef2f2',
          padding: '6px 10px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          🚨 注意：您已超出本月預算 ${(monthExpense - budget).toLocaleString()} 元！
        </div>
      )}
    </div>
  );
});

export default BudgetCard;