import React, { useRef, useEffect, useMemo, memo } from 'react';

// 繪製圓餅圖元件
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

  // 快取渲染明細清單，避免重複計算百分比字串
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

function TotalCard({ monthStats, expenseChartData, incomeChartData }) {
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

      <div style={{ 
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center',
        backgroundColor: '#ffffff', padding: '12px', borderRadius: '16px', marginBottom: '20px', border: '2px solid #1e3a8a'
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
  );
}

// 使用 React.memo 包裹 TotalCard，當 Props (Props 引用指標) 未改變時不觸發重繪
export default memo(TotalCard);