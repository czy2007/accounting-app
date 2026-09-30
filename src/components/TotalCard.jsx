// src/components/TotalCard.jsx
import React, { useRef, useEffect, useMemo, memo, useState } from 'react';
import { useAppContext } from "../context/AppContext";

// 預設顏色庫
const CHART_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
];

// 預設多語系字典
const DEFAULT_TRANSLATIONS = {
  'zh-TW': {
    title: '📊 財務圖表分析',
    monthIncome: '月收入',
    monthExpense: '月支出',
    monthNet: '月結餘',
    budgetTitle: '🎯 本月預算控制',
    btnSave: '儲存',
    btnCancel: '取消',
    btnSetBudget: '設定預算',
    spent: '已花費：',
    alertInvalidBudget: '請輸入有效的預算數字！',
    overBudgetAlert: '🚨 注意：您已超出本月預算 ${overAmount} 元！',
    dailyTrendTitle: '📈 每日消費趨勢',
    noDailyTrend: '本月尚無每日消費趨勢',
    selectedDay: '選取日',
    expensePieTitle: '💸 支出類別佔比',
    incomePieTitle: '💵 收入類別佔比',
    noExpenseRecords: '本月尚無支出紀錄',
    noIncomeRecords: '本月尚無收入紀錄',
    categories: {
      '🍔 餐飲': '🍔 餐飲',
      '🚗 交通': '🚗 交通',
      '🎬 娛樂': '🎬 娛樂',
      '🛒 購物': '🛒 購物',
      '👔 服飾': '👔 服飾',
      '🎁 禮物': '🎁 禮物',
      '💡 雜項': '💡 雜項',
      '💰 薪水': '💰 薪水',
      '📈 投資': '📈 投資',
      '🧧 紅包': '🧧 紅包',
      '💼 副業': '💼 副業',
      '💡 其他收入': '💡 其他收入'
    }
  },
  'zh-CN': {
    title: '📊 财务图表分析',
    monthIncome: '月收入',
    monthExpense: '月支出',
    monthNet: '月结余',
    budgetTitle: '🎯 本月预算控制',
    btnSave: '保存',
    btnCancel: '取消',
    btnSetBudget: '设置预算',
    spent: '已花费：',
    alertInvalidBudget: '请输入有效的预算数字！',
    overBudgetAlert: '🚨 注意：您已超出本月预算 ${overAmount} 元！',
    dailyTrendTitle: '📈 每日消费趋势',
    noDailyTrend: '本月尚无每日消费趋势',
    selectedDay: '选取日',
    expensePieTitle: '💸 支出类别占比',
    incomePieTitle: '💵 收入类别占比',
    noExpenseRecords: '本月尚无支出记录',
    noIncomeRecords: '本月尚无收入记录',
    categories: {
      '🍔 餐飲': '🍔 餐饮',
      '🚗 交通': '🚗 交通',
      '🎬 娛樂': '🎬 娱乐',
      '🛒 購物': '🛒 购物',
      '👔 服飾': '👔 服饰',
      '🎁 禮物': '🎁 礼物',
      '💡 雜項': '💡 杂项',
      '💰 薪水': '💰 工资',
      '📈 投資': '📈 投资',
      '🧧 紅包': '🧧 红包',
      '💼 副業': '💼 副业',
      '💡 其他收入': '💡 其他收入'
    }
  },
  'ja': {
    title: '📊 財務グラフ分析',
    monthIncome: '今月の収入',
    monthExpense: '今月の支出',
    monthNet: '今月の収支',
    budgetTitle: '🎯 今月の予算管理',
    btnSave: '保存',
    btnCancel: 'キャンセル',
    btnSetBudget: '予算を設定',
    spent: '支出済み：',
    alertInvalidBudget: '有効な予算額を入力してください！',
    overBudgetAlert: '🚨 警告：今月の予算を ${overAmount} 円オーバーしています！',
    dailyTrendTitle: '📈 日別支出推移',
    noDailyTrend: '今月の日別支出データはありません',
    selectedDay: '選択日',
    expensePieTitle: '💸 支出カテゴリー割合',
    incomePieTitle: '💵 収入カテゴリー割合',
    noExpenseRecords: '今月の支出記録はありません',
    noIncomeRecords: '今月の収入記録はありません',
    categories: {
      '🍔 餐飲': '🍔 食費',
      '🚗 交通': '🚗 交通費',
      '🎬 娛樂': '🎬 娯楽・趣味',
      '🛒 購物': '🛒 日用品・買い物',
      '👔 服飾': '👔 衣類・美容',
      '🎁 禮物': '🎁 プレゼント',
      '💡 雜項': '💡 雑費',
      '💰 薪水': '💰 給与',
      '📈 投資': '📈 投資・資産運用',
      '🧧 紅包': '🧧 臨時収入',
      '💼 副業': '💼 副業',
      '💡 其他收入': '💡 その他収入'
    }
  },
  'ko': {
    title: '📊 재정 차트 분석',
    monthIncome: '월 수입',
    monthExpense: '월 지출',
    monthNet: '월 순수입',
    budgetTitle: '🎯 이달의 예산 관리',
    btnSave: '저장',
    btnCancel: '취소',
    btnSetBudget: '예산 설정',
    spent: '지출 금액: ',
    alertInvalidBudget: '올바른 예산 금액을 입력하세요!',
    overBudgetAlert: '🚨 주의: 이번 달 예산을 ${overAmount}원 초과했습니다!',
    dailyTrendTitle: '📈 일별 지출 추이',
    noDailyTrend: '이번 달 일별 지출 내역이 없습니다',
    selectedDay: '선택일',
    expensePieTitle: '💸 지출 카테고리 비중',
    incomePieTitle: '💵 수입 카테고리 비중',
    noExpenseRecords: '이번 달 지출 내역이 없습니다',
    noIncomeRecords: '이번 달 수입 내역이 없습니다',
    categories: {
      '🍔 餐飲': '🍔 식비',
      '🚗 交通': '🚗 교통비',
      '🎬 娛樂': '🎬 문화/여가',
      '🛒 購物': '🛒 쇼핑',
      '👔 服飾': '👔 의류/미용',
      '🎁 禮物': '🎁 선물',
      '💡 雜項': '💡 기타 지출',
      '💰 薪水': '💰 급여',
      '📈 投資': '📈 투자/재테크',
      '🧧 紅包': '🧧 용돈/상여',
      '💼 副業': '💼 부업',
      '💡 其他收入': '💡 기타 수입'
    }
  },
  'en': {
    title: '📊 Financial Analytics',
    monthIncome: 'Income',
    monthExpense: 'Expense',
    monthNet: 'Net Balance',
    budgetTitle: '🎯 Monthly Budget',
    btnSave: 'Save',
    btnCancel: 'Cancel',
    btnSetBudget: 'Set Budget',
    spent: 'Spent: ',
    alertInvalidBudget: 'Please enter a valid budget amount!',
    overBudgetAlert: '🚨 Alert: You have exceeded your budget by ${overAmount}!',
    dailyTrendTitle: '📈 Daily Expense Trend',
    noDailyTrend: 'No expense trend for this month',
    selectedDay: 'Selected',
    expensePieTitle: '💸 Expenses by Category',
    incomePieTitle: '💵 Income by Category',
    noExpenseRecords: 'No expense records this month',
    noIncomeRecords: 'No income records this month',
    categories: {
      '🍔 餐飲': '🍔 Food',
      '🚗 交通': '🚗 Transport',
      '🎬 娛樂': '🎬 Entertainment',
      '🛒 購物': '🛒 Shopping',
      '👔 服飾': '👔 Clothing',
      '🎁 禮物': '🎁 Gift',
      '💡 雜項': '💡 Misc',
      '💰 薪水': '💰 Salary',
      '📈 投資': '📈 Investment',
      '🧧 紅包': '🧧 Red Packet',
      '💼 副業': '💼 Side Hustle',
      '💡 其他收入': '💡 Other Income'
    }
  }
};

// 🎯 預算控制卡片元件
const BudgetCard = memo(function BudgetCard({ budget, setBudget, monthExpense, budgetStatus, isDarkMode, t }) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputVal, setInputVal] = useState(budget);

  useEffect(() => {
    setInputVal(budget);
  }, [budget]);

  const handleSave = () => {
    const num = Number(inputVal);
    if (!isNaN(num) && num >= 0) {
      setBudget(num);
      setIsEditing(false);
    } else {
      alert(t.alertInvalidBudget);
    }
  };

  const overAmount = (monthExpense - budget).toLocaleString();

  return (
    <div style={{
      backgroundColor: isDarkMode ? '#1e2632' : '#f8fafc',
      padding: '16px',
      borderRadius: '16px',
      border: budgetStatus.isOver 
        ? '2px solid #ef4444' 
        : (isDarkMode ? '1.5px solid #3a4859' : '1px solid #e2e8f0'),
      marginBottom: '16px',
      boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: isDarkMode ? '#38bdf8' : '#1e3a8a' }}>
          {t.budgetTitle}
        </h3>
        
        {isEditing ? (
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={handleSave}
              style={{
                border: 'none', background: '#10b981', color: '#ffffff',
                borderRadius: '6px', padding: '2px 8px', fontSize: '12px',
                fontWeight: '700', cursor: 'pointer'
              }}
            >
              {t.btnSave}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              style={{
                border: 'none',
                background: isDarkMode ? '#334155' : '#cbd5e1',
                color: isDarkMode ? '#f8fafc' : '#334155',
                borderRadius: '6px', padding: '2px 8px', fontSize: '12px',
                fontWeight: '700', cursor: 'pointer'
              }}
            >
              {t.btnCancel}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              border: 'none',
              background: isDarkMode ? '#2c3846' : '#e0e7ff',
              color: isDarkMode ? '#38bdf8' : '#1e3a8a',
              borderRadius: '6px', padding: '4px 8px', fontSize: '12px',
              fontWeight: '700', cursor: 'pointer'
            }}
          >
            {t.btnSetBudget}
          </button>
        )}
      </div>

      {/* 金額文字顯示 */}
      <div style={{ fontSize: '13px', color: isDarkMode ? '#cbd5e1' : '#475569', marginBottom: '8px', fontWeight: '600' }}>
        {t.spent}<span style={{ color: budgetStatus.color, fontWeight: '800' }}>${monthExpense.toLocaleString()}</span> / 
        {isEditing ? (
          <input
            type="number"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            style={{
              width: '80px', marginLeft: '4px', padding: '2px 4px',
              borderRadius: '4px', border: '1px solid #3b82f6',
              backgroundColor: isDarkMode ? '#2c3846' : '#ffffff',
              color: isDarkMode ? '#ffffff' : '#000000',
              fontSize: '13px', fontWeight: '700'
            }}
            autoFocus
          />
        ) : (
          ` $${budget.toLocaleString()}`
        )}
        <span style={{ float: 'right', fontWeight: '700', color: budgetStatus.color }}>
          {budgetStatus.rawPercent}%
        </span>
      </div>

      {/* 警示條 */}
      <div style={{
        width: '100%', height: '10px',
        backgroundColor: isDarkMode ? '#2c3846' : '#e2e8f0',
        borderRadius: '5px', overflow: 'hidden'
      }}>
        <div style={{
          width: `${Math.min(budgetStatus.percent, 100)}%`,
          height: '100%', backgroundColor: budgetStatus.color,
          transition: 'width 0.3s ease-in-out, background-color 0.3s ease'
        }} />
      </div>

      {/* 超支警示標語 */}
      {budgetStatus.isOver && (
        <div style={{
          marginTop: '10px', color: '#ef4444', fontSize: '12px', fontWeight: '800',
          backgroundColor: isDarkMode ? '#450a0a' : '#fef2f2',
          padding: '6px 10px', borderRadius: '8px', textAlign: 'center'
        }}>
          {t.overBudgetAlert.replace('${overAmount}', overAmount)}
        </div>
      )}
    </div>
  );
});

// 📊 每日消費趨勢長條圖
const DailyBarChart = memo(function DailyBarChart({ data, isDarkMode, t }) {
  const canvasRef = useRef(null);
  const [hoverInfo, setHoverInfo] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const hasData = data && data.some(item => item.amount > 0);

    if (!hasData) {
      ctx.fillStyle = isDarkMode ? '#94a3b8' : '#64748b';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(t.noDailyTrend, width / 2, height / 2);
      return;
    }

    const maxAmount = Math.max(...data.map(d => d.amount), 1);
    const paddingBottom = 16;
    const paddingTop = 12;
    const chartHeight = height - paddingBottom - paddingTop;
    const barWidth = width / data.length;

    data.forEach((item, index) => {
      const barHeight = (item.amount / maxAmount) * chartHeight;
      const x = index * barWidth;
      const y = height - paddingBottom - barHeight;

      ctx.fillStyle = item.amount > 0 ? (item.amount === maxAmount ? '#ef4444' : '#3b82f6') : (isDarkMode ? '#2c3846' : '#f1f5f9');
      ctx.fillRect(x + 1, y, Math.max(barWidth - 2, 1), Math.max(barHeight, 2));
    });
  }, [data, isDarkMode, t]);

  const handleMouseMove = (e) => {
    if (!data || data.length === 0) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const barWidth = rect.width / data.length;
    const index = Math.floor(x / barWidth);

    if (index >= 0 && index < data.length) {
      setHoverInfo(data[index]);
    }
  };

  return (
    <div style={{
      backgroundColor: isDarkMode ? '#1e2632' : '#f8fafc',
      padding: '16px', borderRadius: '16px',
      border: isDarkMode ? '1.5px solid #3a4859' : '1px solid #e2e8f0',
      textAlign: 'center', marginBottom: '16px', position: 'relative'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: isDarkMode ? '#38bdf8' : '#1e3a8a' }}>
          {t.dailyTrendTitle}
        </h3>
        {hoverInfo && (
          <span style={{ fontSize: '11px', fontWeight: '700', color: isDarkMode ? '#38bdf8' : '#1e3a8a' }}>
            {hoverInfo.date || t.selectedDay}: ${hoverInfo.amount.toLocaleString()}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <canvas 
          ref={canvasRef} 
          width={280} 
          height={100} 
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverInfo(null)}
          style={{ cursor: 'pointer' }}
        />
      </div>
    </div>
  );
});

// 🍕 甜甜圈圖/圓餅圖元件
const PieChart = memo(function PieChart({ title, data, totalAmount, emptyMessage, isDarkMode, t }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const outerRadius = Math.min(width, height) / 2 - 6;
    const innerRadius = outerRadius * 0.55;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    if (!data || data.length === 0 || totalAmount === 0) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
      ctx.fillStyle = isDarkMode ? '#2c3846' : '#f8fafc';
      ctx.fill();
      ctx.strokeStyle = isDarkMode ? '#3a4859' : '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      return;
    }

    let startAngle = -0.5 * Math.PI;
    data.forEach((item, index) => {
      const sliceAngle = (item.amount / totalAmount) * 2 * Math.PI;
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, startAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      
      ctx.fillStyle = CHART_COLORS[index % CHART_COLORS.length];
      ctx.fill();
      ctx.strokeStyle = isDarkMode ? '#1e2632' : '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      startAngle += sliceAngle;
    });

    ctx.fillStyle = isDarkMode ? '#f8fafc' : '#0f172a';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`$${totalAmount.toLocaleString()}`, centerX, centerY);

  }, [data, totalAmount, isDarkMode]);

  const legendList = useMemo(() => {
    if (!data || data.length === 0) return null;
    return data.map((item, index) => {
      const percentage = totalAmount > 0 ? ((item.amount / totalAmount) * 100).toFixed(1) : '0.0';
      const categoryLabel = t.categories?.[item.category] || item.category;

      return (
        <div key={item.category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: CHART_COLORS[index % CHART_COLORS.length], flexShrink: 0 }} />
            <span style={{ 
              color: isDarkMode ? '#f8fafc' : '#1e3a8a', 
              fontWeight: '600',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {categoryLabel}
            </span>
          </div>
          <span style={{ color: isDarkMode ? '#cbd5e1' : '#475569', fontWeight: '700', marginLeft: '8px', flexShrink: 0 }}>
            {percentage}% (${item.amount.toLocaleString()})
          </span>
        </div>
      );
    });
  }, [data, totalAmount, isDarkMode, t]);

  return (
    <div style={{
      backgroundColor: isDarkMode ? '#1e2632' : '#f8fafc',
      padding: '16px', borderRadius: '16px',
      border: isDarkMode ? '1.5px solid #3a4859' : '1px solid #e2e8f0',
      textAlign: 'center', marginBottom: '16px'
    }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '800', color: isDarkMode ? '#38bdf8' : '#1e3a8a' }}>
        {title}
      </h3>

      {!data || data.length === 0 ? (
        <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '13px' }}>
          {emptyMessage}
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <canvas ref={canvasRef} width={140} height={140} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left', maxHeight: '120px', overflowY: 'auto', paddingRight: '4px' }}>
            {legendList}
          </div>
        </>
      )}
    </div>
  );
});

// 主元件：財務分析卡片
// 主元件：財務分析卡片
function TotalCard({ 
  monthStats = { income: 0, expense: 0, net: 0 }, 
  budget = 0, 
  setBudget = () => {}, 
  budgetStatus = { isOver: false, color: '#3b82f6', percent: 0, rawPercent: 0 }, 
  expenseChartData = [], 
  incomeChartData = [], 
  dailyTrendData = [], 
  isDarkMode = false 
}) {
  // 從 Context 取得當前語言設定或字典
  const appContext = useAppContext ? useAppContext() : {};
  const currentLang = appContext?.language || 'zh-TW';
  const customTranslations = appContext?.translations || {};
  // 多語系字典整合與 Fallback 處理
  const t = useMemo(() => {
    const defaultDict = DEFAULT_TRANSLATIONS[currentLang] || DEFAULT_TRANSLATIONS['zh-TW'];
    const customDict = customTranslations[currentLang] || {};
    return {
      ...defaultDict,
      ...customDict,
      categories: {
        ...defaultDict.categories,
        ...(customDict.categories || {})
      }
    };
  }, [currentLang, customTranslations]);

  return (
    <div style={{
      flex: '1 1 350px',
      backgroundColor: isDarkMode ? '#2c3846' : '#ffffff',
      color: isDarkMode ? '#f8fafc' : '#0f172a',
      padding: '24px', borderRadius: '24px',
      boxShadow: isDarkMode ? '0 10px 25px rgba(0,0,0,0.2)' : '0 10px 25px -5px rgba(30, 58, 138, 0.08)',
      border: isDarkMode ? '1.5px solid #3a4859' : '2.5px solid #1e3a8a',
      boxSizing: 'border-box', transition: 'all 0.3s ease'
    }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', color: isDarkMode ? '#38bdf8' : '#1e3a8a', marginTop: 0, marginBottom: '16px' }}>
        {t.title}
      </h2>

      {/* 月度統計概覽 */}
      <div style={{ 
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center',
        backgroundColor: isDarkMode ? '#1e2632' : '#f8fafc', 
        padding: '12px', borderRadius: '16px', marginBottom: '16px', 
        border: isDarkMode ? '1.5px solid #3a4859' : '1px solid #e2e8f0'
      }}>
        <div>
          <div style={{ fontSize: '11px', color: isDarkMode ? '#cbd5e1' : '#64748b', fontWeight: '700' }}>{t.monthIncome}</div>
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#10b981' }}>+${monthStats.income.toLocaleString()}</div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: isDarkMode ? '#cbd5e1' : '#64748b', fontWeight: '700' }}>{t.monthExpense}</div>
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#ef4444' }}>-${monthStats.expense.toLocaleString()}</div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: isDarkMode ? '#cbd5e1' : '#64748b', fontWeight: '700' }}>{t.monthNet}</div>
          <div style={{ fontSize: '13px', fontWeight: '800', color: monthStats.net >= 0 ? (isDarkMode ? '#38bdf8' : '#1e3a8a') : '#e11d48' }}>${monthStats.net.toLocaleString()}</div>
        </div>
      </div>

      {/* 🎯 預算控制卡片 */}
      <BudgetCard 
        budget={budget}
        setBudget={setBudget}
        monthExpense={monthStats.expense}
        budgetStatus={budgetStatus}
        isDarkMode={isDarkMode}
        t={t}
      />

      {/* 📈 長條圖：每日消費趨勢 */}
      <DailyBarChart data={dailyTrendData} isDarkMode={isDarkMode} t={t} />

      {/* 🍕 圓餅圖：支出類別 */}
      <PieChart 
        title={t.expensePieTitle} 
        data={expenseChartData} 
        totalAmount={monthStats.expense}
        emptyMessage={t.noExpenseRecords}
        isDarkMode={isDarkMode}
        t={t}
      />

      {/* 💵 圓餅圖：收入類別 */}
      <PieChart 
        title={t.incomePieTitle} 
        data={incomeChartData} 
        totalAmount={monthStats.income}
        emptyMessage={t.noIncomeRecords}
        isDarkMode={isDarkMode}
        t={t}
      />
    </div>
  );
}

export default memo(TotalCard);