import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid
} from 'recharts';
import { useAppContext } from '../context/AppContext'; // 請確保相對路徑正確

// 預設多語系字典 (歷史頁面專用)
const DEFAULT_TRANSLATIONS = {
  'zh-TW': {
    title: '📅 跨月趨勢與歷史月報',
    noHistory: '目前尚無任何記帳歷史紀錄！',
    momAlertTitle: '💡 跨月消費對比警示 ({current} vs {prev})',
    momIncreased: '本月支出相較於上個月 增加 {percent}%（+{currency} {amount}）。⚠️ 建議留意支出控制！',
    momDecreased: '本月支出相較於上個月 減少 {percent}%（-{currency} {amount}）。🎉 表現很好，繼續保持！',
    chartTitle: '📊 近 6 個月跨月收支趨勢圖',
    listTitle: '📆 歷月詳細財務彙整',
    totalIncome: '總收入',
    totalExpense: '總支出',
    monthNet: '本月結算',
    recordsCount: '共 {count} 筆紀錄 (點擊跳轉)',
    otherMonth: '其他'
  },
  'zh-CN': {
    title: '📅 跨月趋势与历史月报',
    noHistory: '目前尚无任何记账历史记录！',
    momAlertTitle: '💡 跨月消费对比警示 ({current} vs {prev})',
    momIncreased: '本月支出相较于上个月 增加 {percent}%（+{currency} {amount}）。⚠️ 建议留意支出控制！',
    momDecreased: '本月支出相较于上个月 减少 {percent}%（-{currency} {amount}）。🎉 表现很好，继续保持！',
    chartTitle: '📊 近 6 个月跨月收支趋势图',
    listTitle: '📆 历月详细财务汇总',
    totalIncome: '总收入',
    totalExpense: '总支出',
    monthNet: '本月结算',
    recordsCount: '共 {count} 条记录 (点击跳转)',
    otherMonth: '其他'
  },
  'ja': {
    title: '📅 月別推移・過去のレポート',
    noHistory: '過去の家計簿記録がありません！',
    momAlertTitle: '💡 前月比の支出比較 ({current} vs {prev})',
    momIncreased: '今月の支出は前月比で {percent}% 増加しました（+{currency} {amount}）。⚠️ 支出の管理に気をつけましょう！',
    momDecreased: '今月の支出は前月比で {percent}% 減少しました（-{currency} {amount}）。🎉 素晴らしい改善です！この調子で続けましょう！',
    chartTitle: '📊 過去6ヶ月の収支推移グラフ',
    listTitle: '📆 月別財務サマリー',
    totalIncome: '総収入',
    totalExpense: '総支出',
    monthNet: '今月収支',
    recordsCount: '全 {count} 件 (クリックして移動)',
    otherMonth: 'その他'
  },
  'ko': {
    title: '📅 월별 추이 및 월간 보고서',
    noHistory: '저장된 가계부 내역이 없습니다!',
    momAlertTitle: '💡 지난달 대비 지출 비교 ({current} vs {prev})',
    momIncreased: '이번 달 지출이 지난달보다 {percent}% 증가했습니다 (+{currency} {amount}). ⚠️ 지출 관리에 유의하세요!',
    momDecreased: '이번 달 지출이 지난달보다 {percent}% 감소했습니다 (-{currency} {amount}). 🎉 아주 훌륭합니다. 계속 유지해보세요!',
    chartTitle: '📊 최근 6개월 수입/지출 추이',
    listTitle: '📆 월별 상세 재정 요약',
    totalIncome: '총수입',
    totalExpense: '총지출',
    monthNet: '월 순수입',
    recordsCount: '총 {count}건 (클릭하여 이동)',
    otherMonth: '기타'
  },
  'en': {
    title: '📅 Monthly Trends & History',
    noHistory: 'No financial records available!',
    momAlertTitle: '💡 MoM Expense Comparison ({current} vs {prev})',
    momIncreased: 'Expenses increased by {percent}% (+{currency} {amount}) compared to last month. ⚠️ Watch your budget!',
    momDecreased: 'Expenses decreased by {percent}% (-{currency} {amount}) compared to last month. 🎉 Great job!',
    chartTitle: '📊 6-Month Income vs Expense Trend',
    listTitle: '📆 Monthly Summaries',
    totalIncome: 'Income',
    totalExpense: 'Expense',
    monthNet: 'Net Balance',
    recordsCount: '{count} records (Click to view)',
    otherMonth: 'Other'
  }
};

// 輔助函式：動態匯率換算
const convertAmount = (amount, fromCurrency, toCurrency, rates) => {
  const numericAmount = Number(amount) || 0;
  if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) return numericAmount;
  if (!rates || !rates[fromCurrency] || !rates[toCurrency]) return numericAmount;

  const amountInUSD = numericAmount / rates[fromCurrency].rate;
  return amountInUSD * rates[toCurrency].rate;
};

function HistoryPage({ 
  items = [], 
  isDarkMode: propsDarkMode, 
  baseCurrency: propsBaseCurrency, 
  rates: propsRates, 
  currentMonth, 
  onSelectMonth 
}) {
  const navigate = useNavigate();

  // 從 Context 取得狀態 (優先使用 Context，若未提供則 Fallback 至 Props)
  const context = useAppContext ? useAppContext() : {};
  const currentLang = context?.lang || context?.language || 'zh-TW';
  const isDarkMode = context?.isDarkMode ?? propsDarkMode ?? false;
  const baseCurrency = context?.baseCurrency || propsBaseCurrency || 'TWD';
  const rates = context?.rates || propsRates || {};

  // 語系字典整合
  const t = useMemo(() => {
    const defaultDict = DEFAULT_TRANSLATIONS[currentLang] || DEFAULT_TRANSLATIONS['zh-TW'];
    const customDict = context?.t || {};
    return { ...defaultDict, ...customDict };
  }, [currentLang, context?.t]);

  // 1. 跨月數據彙整（依 YYYY-MM 分組）
  const monthlySummaries = useMemo(() => {
    const map = {};

    items.forEach((item) => {
      const monthKey = item.date ? item.date.slice(0, 7) : t.otherMonth;
      const itemOrigCurrency = item.originalCurrency || item.currency || 'TWD';
      const itemOrigAmount = Number(item.originalAmount || item.amount) || 0;

      const amountInBase = convertAmount(itemOrigAmount, itemOrigCurrency, baseCurrency, rates);

      if (!map[monthKey]) {
        map[monthKey] = {
          month: monthKey,
          income: 0,
          expense: 0,
          count: 0
        };
      }

      if (item.type === 'income') {
        map[monthKey].income += amountInBase;
      } else {
        map[monthKey].expense += amountInBase;
      }
      map[monthKey].count += 1;
    });

    return Object.values(map)
      .map((summary) => ({
        ...summary,
        income: Math.round(summary.income),
        expense: Math.round(summary.expense),
        net: Math.round(summary.income - summary.expense)
      }))
      .sort((a, b) => b.month.localeCompare(a.month)); // 由新到舊
  }, [items, baseCurrency, rates, t.otherMonth]);

  // 2. 柱狀圖圖表資料（由舊到新，取近 6 個月）
  const chartData = useMemo(() => {
    return [...monthlySummaries]
      .filter(s => s.month !== t.otherMonth)
      .reverse()
      .slice(-6);
  }, [monthlySummaries, t.otherMonth]);

  // 3. 本月 vs 上月 (MoM) 比較邏輯
  const momComparison = useMemo(() => {
    if (monthlySummaries.length < 2) return null;

    const currentData = monthlySummaries.find(s => s.month === currentMonth) || monthlySummaries[0];
    
    const [yearStr, monthStr] = (currentData?.month || currentMonth || '').split('-');
    if (!yearStr || !monthStr) return null;

    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10) - 1;
    if (month < 1) {
      month = 12;
      year -= 1;
    }
    const prevMonthKey = `${year}-${String(month).padStart(2, '0')}`;
    const prevData = monthlySummaries.find(s => s.month === prevMonthKey);

    if (!prevData || prevData.expense === 0) return null;

    const expenseDiff = currentData.expense - prevData.expense;
    const expenseChangePercent = ((expenseDiff / prevData.expense) * 100).toFixed(1);

    return {
      currentMonth: currentData.month,
      prevMonth: prevData.month,
      expenseDiff: Math.abs(expenseDiff),
      expenseChangePercent: Math.abs(expenseChangePercent),
      isIncreased: expenseDiff > 0
    };
  }, [monthlySummaries, currentMonth]);

  const handleCardClick = (monthStr) => {
    if (monthStr !== t.otherMonth && onSelectMonth) {
      onSelectMonth(monthStr);
      navigate('/');
    }
  };

  const cardStyle = {
    backgroundColor: isDarkMode ? '#1e2632' : '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: isDarkMode ? '0 4px 10px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(30, 58, 138, 0.06)',
    border: isDarkMode ? '1.5px solid #3a4859' : '2px solid #1e3a8a',
    transition: 'all 0.2s ease'
  };

  return (
    <div style={{ flex: 1, width: '100%', boxSizing: 'border-box' }}>
      <h2 style={{ 
        fontSize: '22px', 
        fontWeight: '800', 
        marginBottom: '20px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        color: isDarkMode ? '#38bdf8' : '#1e3a8a'
      }}>
        {t.title}
      </h2>

      {monthlySummaries.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', color: '#94a3b8', padding: '40px 20px' }}>
          {t.noHistory}
        </div>
      ) : (
        <>
          {/* 🌟 亮點 1：本月 vs 上月對比警示卡片 */}
          {momComparison && (
            <div style={{
              ...cardStyle,
              backgroundColor: momComparison.isIncreased 
                ? (isDarkMode ? '#451a1a' : '#fef2f2') 
                : (isDarkMode ? '#064e3b' : '#f0fdf4'),
              borderColor: momComparison.isIncreased ? '#f87171' : '#34d399'
            }}>
              <div style={{ fontWeight: '800', fontSize: '16px', marginBottom: '6px', color: isDarkMode ? '#f8fafc' : '#1e293b' }}>
                {t.momAlertTitle.replace('{current}', momComparison.currentMonth).replace('{prev}', momComparison.prevMonth)}
              </div>
              <div style={{ fontSize: '14px', lineHeight: '1.6', color: isDarkMode ? '#e2e8f0' : '#334155' }}>
                {momComparison.isIncreased
                  ? t.momIncreased
                      .replace('{percent}', momComparison.expenseChangePercent)
                      .replace('{currency}', baseCurrency)
                      .replace('{amount}', momComparison.expenseDiff.toLocaleString())
                  : t.momDecreased
                      .replace('{percent}', momComparison.expenseChangePercent)
                      .replace('{currency}', baseCurrency)
                      .replace('{amount}', momComparison.expenseDiff.toLocaleString())
                }
              </div>
            </div>
          )}

          {/* 🌟 亮點 2：近 6 個月收支對比柱狀圖 */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', color: isDarkMode ? '#f8fafc' : '#1e293b' }}>
              {t.chartTitle}
            </h3>
            <div style={{ width: '100%', height: '260px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                  <XAxis dataKey="month" stroke={isDarkMode ? '#94a3b8' : '#64748b'} fontSize={12} />
                  <YAxis stroke={isDarkMode ? '#94a3b8' : '#64748b'} fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', 
                      borderRadius: '8px', 
                      borderColor: isDarkMode ? '#334155' : '#cbd5e1',
                      color: isDarkMode ? '#f8fafc' : '#0f172a'
                    }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="income" name={t.totalIncome} fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name={t.totalExpense} fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 🌟 亮點 3：歷年月份彙整卡片清單 */}
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '14px', color: isDarkMode ? '#38bdf8' : '#1e3a8a' }}>
            {t.listTitle}
          </h3>
          {monthlySummaries.map((summary) => (
            <div 
              key={summary.month} 
              style={{ ...cardStyle, cursor: summary.month !== t.otherMonth ? 'pointer' : 'default' }}
              onClick={() => handleCardClick(summary.month)}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                borderBottom: isDarkMode ? '1.5px dashed #3a4859' : '1.5px dashed #cbd5e1',
                paddingBottom: '10px',
                marginBottom: '12px'
              }}>
                <span style={{ fontSize: '18px', fontWeight: '800', color: isDarkMode ? '#f8fafc' : '#1e293b' }}>
                  📆 {summary.month}
                </span>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', backgroundColor: isDarkMode ? '#2c3846' : '#f1f5f9', padding: '4px 10px', borderRadius: '10px' }}>
                  {t.recordsCount.replace('{count}', summary.count)}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', fontWeight: '700' }}>{t.totalIncome}</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#10b981' }}>
                    +{baseCurrency} {summary.income.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', fontWeight: '700' }}>{t.totalExpense}</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#f43f5e' }}>
                    -{baseCurrency} {summary.expense.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', fontWeight: '700' }}>{t.monthNet}</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: summary.net >= 0 ? '#10b981' : '#f43f5e' }}>
                    {summary.net >= 0 ? '+' : ''}{baseCurrency} {summary.net.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default HistoryPage;