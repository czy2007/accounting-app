import React, { useRef, useEffect, useMemo, memo } from 'react';

// 🎯 Day 15 新增：預算控制卡片元件
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

// 📊 每日消費趨勢長條圖 (Canvas繪製)
const DailyBarChart = memo(function DailyBarChart({ data }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const hasData = data && data.some(item => item.amount > 0);

    if (!hasData) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('本月尚無每日消費趨勢', width / 2, height / 2);
      return;
    }

    const maxAmount = Math.max(...data.map(d => d.amount), 1);
    const paddingBottom = 20;
    const paddingTop = 10;
    const chartHeight = height - paddingBottom - paddingTop;
    const barWidth = width / data.length;

    data.forEach((item, index) => {
      const barHeight = (item.amount / maxAmount) * chartHeight;
      const x = index * barWidth;
      const y = height - paddingBottom - barHeight;

      ctx.fillStyle = item.amount > 0 ? '#3b82f6' : '#f1f5f9';
      ctx.fillRect(x + 1, y, Math.max(barWidth - 2, 1), barHeight || 2);
    });
  }, [data]);

  return (
    <div style={{
      backgroundColor: '#ffffff',
      padding: '16px',
      borderRadius: '16px',
      border: '2px solid #1e3a8a',
      textAlign: 'center',
      marginBottom: '16px'
    }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '800', color: '#1e3a8a' }}>
        📈 每日消費趨勢
      </h3>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <canvas ref={canvasRef} width={280} height={100} />
      </div>
    </div>
  );
});

// 🍕 繪製圓餅圖元件
const PieChart = memo(function PieChart({ title, data, totalAmount, emptyMessage }) {
  const canvasRef = useRef(null);

  const colors = useMemo(() => [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
  ], []);

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

    if (!data || data.length === 0 || totalAmount === 0) {
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
  }, [data, totalAmount, colors]);

  const legendList = useMemo(() => {
    if (!data || data.length === 0) return null;
    return data.map((item, index) => {
      const percentage = totalAmount > 0 ? ((item.amount / totalAmount) * 100).toFixed(1) : '0.0';
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
    });
  }, [data, totalAmount, colors]);

  return (
    <div style={{
      backgroundColor: '#ffffff',
      padding: '16px',
      borderRadius: '16px',
      border: '2px solid #1e3a8a',
      textAlign: 'center',
      marginBottom: '16px'
    }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '800', color: '#1e3a8a' }}>
        {title}
      </h3>

      {!data || data.length === 0 ? (
        <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '13px' }}>
          {emptyMessage}
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <canvas ref={canvasRef} width={140} height={140} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left', maxHeight: '120px', overflowY: 'auto' }}>
            {legendList}
          </div>
        </>
      )}
    </div>
  );
});

// 主元件：接收 budget, setBudget, budgetStatus
function TotalCard({ monthStats, budget, setBudget, budgetStatus, expenseChartData, incomeChartData, dailyTrendData }) {
  return (
    <div style={{
      flex: '1 1 350px',
      backgroundColor: '#ffffff',
      padding: '24px',
      borderRadius: '24px',
      boxShadow: '0 10px 25px -5px rgba(30, 58, 138, 0.08)',
      border: '2.5px solid #1e3a8a',
      boxSizing: 'border-box'
    }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e3a8a', marginTop: 0, marginBottom: '16px' }}>
        📊 財務圖表分析
      </h2>

      {/* 月度統計概覽 */}
      <div style={{ 
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center',
        backgroundColor: '#ffffff', padding: '12px', borderRadius: '16px', marginBottom: '16px', border: '2px solid #1e3a8a'
      }}>
        <div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>月收入</div>
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#10b981' }}>+${monthStats.income.toLocaleString()}</div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>月支出</div>
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#ef4444' }}>-${monthStats.expense.toLocaleString()}</div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>月結餘</div>
          <div style={{ fontSize: '13px', fontWeight: '800', color: monthStats.net >= 0 ? '#1e3a8a' : '#e11d48' }}>${monthStats.net.toLocaleString()}</div>
        </div>
      </div>

      {/* 🎯 Day 15 全新位置：預算控制與警示條 */}
      <BudgetCard 
        budget={budget}
        setBudget={setBudget}
        monthExpense={monthStats.expense}
        budgetStatus={budgetStatus}
      />

      {/* 📈 長條圖：每日消費趨勢 */}
      <DailyBarChart data={dailyTrendData} />

      {/* 🍕 圓餅圖：支出類別 */}
      <PieChart 
        title="💸 支出類別佔比" 
        data={expenseChartData} 
        totalAmount={monthStats.expense}
        emptyMessage="本月尚無支出紀錄"
      />

      {/* 💵 圓餅圖：收入類別 */}
      <PieChart 
        title="💵 收入類別佔比" 
        data={incomeChartData} 
        totalAmount={monthStats.income}
        emptyMessage="本月尚無收入紀錄"
      />
    </div>
  );
}

export default memo(TotalCard);