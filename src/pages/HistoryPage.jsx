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

// 輔助函式：動態匯率換算
const convertAmount = (amount, fromCurrency, toCurrency, rates) => {
  const numericAmount = Number(amount) || 0;
  if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) return numericAmount;
  if (!rates || !rates[fromCurrency] || !rates[toCurrency]) return numericAmount;

  const amountInUSD = numericAmount / rates[fromCurrency].rate;
  return amountInUSD * rates[toCurrency].rate;
};

function HistoryPage({ items, isDarkMode, baseCurrency = 'TWD', rates = {}, currentMonth, onSelectMonth }) {
  const navigate = useNavigate();

  // 1. 跨月數據彙整（依 YYYY-MM 分組）
  const monthlySummaries = useMemo(() => {
    const map = {};

    items.forEach((item) => {
      const monthKey = item.date ? item.date.slice(0, 7) : '其他';
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
  }, [items, baseCurrency, rates]);

  // 2. 柱狀圖圖表資料（由舊到新，取近 6 個月）
  const chartData = useMemo(() => {
    return [...monthlySummaries]
      .filter(s => s.month !== '其他')
      .reverse()
      .slice(-6); // 只取最近 6 個月
  }, [monthlySummaries]);

  // 3. 本月 vs 上月 (MoM) 比較邏輯
  const momComparison = useMemo(() => {
    if (monthlySummaries.length < 2) return null;

    const currentData = monthlySummaries.find(s => s.month === currentMonth) || monthlySummaries[0];
    
    // 計算上一月份的 Key
    const [yearStr, monthStr] = (currentData?.month || currentMonth).split('-');
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
      expenseDiff,
      expenseChangePercent,
      isIncreased: expenseDiff > 0
    };
  }, [monthlySummaries, currentMonth]);

  const handleCardClick = (monthStr) => {
    if (monthStr !== '其他' && onSelectMonth) {
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
    <div style={{ flex: 1, width: '100%' }}>
      <h2 style={{ 
        fontSize: '22px', 
        fontWeight: '800', 
        marginBottom: '20px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        color: isDarkMode ? '#38bdf8' : '#1e3a8a'
      }}>
        📅 跨月趨勢與歷史月報
      </h2>

      {monthlySummaries.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', color: '#94a3b8', padding: '40px 20px' }}>
          目前尚無任何記帳歷史紀錄！
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
                💡 跨月消費對比警示 ({momComparison.currentMonth} vs {momComparison.prevMonth})
              </div>
              <div style={{ fontSize: '14px', lineHeight: '1.6', color: isDarkMode ? '#e2e8f0' : '#334155' }}>
                本月支出相較於上個月 
                <strong style={{ color: momComparison.isIncreased ? '#ef4444' : '#10b981', margin: '0 4px' }}>
                  {momComparison.isIncreased ? '增加' : '減少'} {Math.abs(momComparison.expenseChangePercent)}%
                </strong>
                （{momComparison.isIncreased ? '+' : '-'}{baseCurrency} {Math.abs(momComparison.expenseDiff).toLocaleString()}）。
                {momComparison.isIncreased ? ' ⚠️ 建議留意支出控制！' : ' 🎉 表現很好，繼續保持！'}
              </div>
            </div>
          )}

          {/* 🌟 亮點 2：近 6 個月收支對比柱狀圖 */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', color: isDarkMode ? '#f8fafc' : '#1e293b' }}>
              📊 近 6 個月跨月收支趨勢圖
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
                      borderColor: isDarkMode ? '#334155' : '#cbd5e1' 
                    }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="income" name="總收入" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="總支出" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 🌟 亮點 3：歷年月份彙整卡片清單 */}
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '14px', color: isDarkMode ? '#38bdf8' : '#1e3a8a' }}>
            📆 歷月詳細財務彙整
          </h3>
          {monthlySummaries.map((summary) => (
            <div 
              key={summary.month} 
              style={{ ...cardStyle, cursor: summary.month !== '其他' ? 'pointer' : 'default' }}
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
                  共 {summary.count} 筆紀錄 (點擊跳轉)
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', fontWeight: '700' }}>總收入</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#10b981' }}>
                    +{baseCurrency} {summary.income.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', fontWeight: '700' }}>總支出</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#f43f5e' }}>
                    -{baseCurrency} {summary.expense.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', fontWeight: '700' }}>本月結算</div>
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