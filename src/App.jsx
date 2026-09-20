import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import TotalCard from './components/TotalCard';
// 🎯 1. 補上匯率工具函式引入
import { fetchExchangeRates, DEFAULT_RATES } from './components/currencyUtils';
import './App.css';

function App() {
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getCurrentYearMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  // 🎯 Day 18：暗黑模式狀態 (LocalStorage 持久化)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('accounting_theme');
      return savedTheme ? JSON.parse(savedTheme) : false;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem('accounting_theme', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // 🎯 2. 幣別與匯率狀態管理
  const [currency, setCurrency] = useState('TWD');
  const [rates, setRates] = useState(DEFAULT_RATES);

  // 自動抓取最新匯率 API
  useEffect(() => {
    async function loadRates() {
      const fetchedRates = await fetchExchangeRates();
      setRates(fetchedRates);
    }
    loadRates();
  }, []);

  // 1. 記帳資料狀態 (LocalStorage 持久化)
  const [items, setItems] = useState(() => {
    try {
      const savedItems = localStorage.getItem('accounting_items');
      if (!savedItems) return [];
      const parsedItems = JSON.parse(savedItems);
      if (!Array.isArray(parsedItems)) return [];
      return parsedItems.map(item => ({
        ...item,
        date: item.date || getTodayDate()
      }));
    } catch (e) {
      console.error("Failed to parse localStorage accounting_items:", e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('accounting_items', JSON.stringify(items));
  }, [items]);

  // 每月預算狀態 (LocalStorage 持久化)
  const [budget, setBudget] = useState(() => {
    try {
      const savedBudget = localStorage.getItem('monthly_budget');
      return savedBudget ? Number(savedBudget) : 20000;
    } catch (e) {
      return 20000;
    }
  });

  useEffect(() => {
    localStorage.setItem('monthly_budget', budget.toString());
  }, [budget]);

  // 表單狀態
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('🍔 餐飲');
  const [type, setType] = useState('expense');
  const [date, setDate] = useState(getTodayDate());
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 搜尋與篩選狀態
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMonth, setCurrentMonth] = useState(getCurrentYearMonth());
  const [activeTab, setActiveTab] = useState('all');
  const [filterCategory, setFilterCategory] = useState('ALL');

  // 切換月份
  const handleMonthChange = (delta) => {
    const [yearStr, monthStr] = currentMonth.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10) + delta;

    if (month < 1) {
      month = 12;
      year -= 1;
    } else if (month > 12) {
      month = 1;
      year += 1;
    }

    setCurrentMonth(`${year}-${String(month).padStart(2, '0')}`);
  };

  // 🎯 開關與清理表單 (重置幣別為 TWD)
  const handleOpenAddModal = () => {
    setEditingId(null);
    setName('');
    setAmount('');
    setCurrency('TWD');
    setDate(getTodayDate());
    setType('expense');
    setCategory('🍔 餐飲');
    setIsModalOpen(true);
  };

  // 🎯 點擊編輯時，載入項目的原始外幣與金額
  const handleEdit = (item) => {
    setEditingId(item.id);
    setName(item.name || '');
    setAmount(item.originalAmount || item.amount);
    setCurrency(item.originalCurrency || 'TWD');
    setCategory(item.category);
    setType(item.type);
    setDate(item.date || getTodayDate());
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  // 🎯 3. 外幣換算為台幣的計算邏輯
  const handleAdd = (e) => {
    if (e) e.preventDefault();
    const numAmount = Number(amount);

    if (!numAmount) {
      alert('請填寫金額！');
      return;
    }
    if (numAmount <= 0) {
      alert('金額必須大於 0 元！');
      return;
    }

    // 計算折合台幣 (TWD) 金額
    const currentRate = rates[currency]?.rate || 1;
    const amountInTWD = currency === 'TWD' ? numAmount : Math.round(numAmount / currentRate);

    if (editingId) {
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === editingId
            ? { 
                ...item, 
                name: name.trim(), 
                originalAmount: numAmount,
                originalCurrency: currency,
                amount: amountInTWD, 
                category, 
                type, 
                date 
              }
            : item
        )
      );
    } else {
      setItems(prevItems => [
        { 
          id: Date.now(), 
          name: name.trim(), 
          originalAmount: numAmount,
          originalCurrency: currency,
          amount: amountInTWD, 
          category, 
          type, 
          date 
        },
        ...prevItems
      ]);
    }

    handleCloseModal();
  };

  const handleDelete = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  // ----------------------------------------------------
  // ⚡ 效能優化區域 (useMemo)
  // ----------------------------------------------------

  // 1. 篩選當月原始資料
  const currentMonthItems = useMemo(() => {
    return items.filter(item => (item.date ? item.date.slice(0, 7) : '未分類') === currentMonth);
  }, [items, currentMonth]);

  // 2. 根據 Tab、分類選單與搜尋關鍵字過濾資料
  const filteredItems = useMemo(() => {
    return currentMonthItems.filter(item => {
      const matchesTab = activeTab === 'all' || item.type === activeTab;
      const matchesCategory = filterCategory === 'ALL' || item.category === filterCategory;

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || 
        (item.date && item.date.includes(q)) || 
        (item.name && item.name.toLowerCase().includes(q)) || 
        (item.category && item.category.toLowerCase().includes(q));

      return matchesTab && matchesCategory && matchesSearch;
    });
  }, [currentMonthItems, activeTab, filterCategory, searchQuery]);

  // 3. 當月財務總計
  const monthStats = useMemo(() => {
    return currentMonthItems.reduce(
      (acc, item) => {
        const val = Number(item.amount) || 0;
        if (item.type === 'income') acc.income += val;
        else acc.expense += val;
        acc.net = acc.income - acc.expense;
        return acc;
      },
      { income: 0, expense: 0, net: 0 }
    );
  }, [currentMonthItems]);

  // 4. 預算警示門檻 (>=90% 紅色 / 70%~89.9% 黃色 / <70% 綠色)
  const budgetStatus = useMemo(() => {
    const expense = monthStats.expense;
    if (!budget || budget <= 0) {
      return { percent: 0, rawPercent: '0.0', isOver: false, color: '#3b82f6' };
    }

    const rawPercentNumber = (expense / budget) * 100;
    const percent = Math.min(rawPercentNumber, 100);
    const isOver = expense > budget;

    let color = '#10b981'; // <70% 綠色

    if (rawPercentNumber >= 90) {
      color = '#ef4444'; // >=90% 紅色
    } else if (rawPercentNumber >= 70) {
      color = '#f59e0b'; // 70%~89.9% 黃色
    }

    return {
      percent,
      rawPercent: rawPercentNumber.toFixed(1),
      isOver,
      color,
    };
  }, [monthStats.expense, budget]);

  // 5. 圓餅圖資料轉換（支出與收入）
  const expenseChartData = useMemo(() => {
    const categoryTotals = currentMonthItems
      .filter(item => item.type === 'expense')
      .reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + Number(item.amount);
        return acc;
      }, {});

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [currentMonthItems]);

  const incomeChartData = useMemo(() => {
    const categoryTotals = currentMonthItems
      .filter(item => item.type === 'income')
      .reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + Number(item.amount);
        return acc;
      }, {});

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [currentMonthItems]);

  // 6. 當月每日消費趨勢資料 (長條圖用)
  const dailyTrendData = useMemo(() => {
    if (!currentMonth) return [];

    const [yearStr, monthStr] = currentMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    const daysInMonth = new Date(year, month, 0).getDate();

    const dailyTotals = {};
    for (let day = 1; day <= daysInMonth; day++) {
      const dayKey = String(day).padStart(2, '0');
      dailyTotals[dayKey] = 0;
    }

    currentMonthItems.forEach((item) => {
      if (item.type === 'expense' && item.date) {
        const itemDay = item.date.slice(8, 10);
        if (dailyTotals[itemDay] !== undefined) {
          dailyTotals[itemDay] += Number(item.amount) || 0;
        }
      }
    });

    return Object.entries(dailyTotals).map(([day, amount]) => ({
      day: `${parseInt(day, 10)}日`,
      amount,
    }));
  }, [currentMonthItems, currentMonth]);

  // 7. 按日期分組資料
  const groupedDataByDate = useMemo(() => {
    return filteredItems.reduce((acc, item) => {
      const dateKey = item.date || '未分類日期';
      if (!acc[dateKey]) acc[dateKey] = { dateTotal: 0, items: [] };
      const val = item.type === 'income' ? item.amount : -item.amount;
      acc[dateKey].dateTotal += val;
      acc[dateKey].items.push(item);
      return acc;
    }, {});
  }, [filteredItems]);

  // 8. 日期排序陣列
  const sortedDates = useMemo(() => {
    return Object.keys(groupedDataByDate).sort((a, b) => b.localeCompare(a));
  }, [groupedDataByDate]);

  // 批次刪除函式
  const handleBatchDelete = (selectedIds) => {
    if (window.confirm(`確定要刪除選取的 ${selectedIds.length} 筆紀錄嗎？`)) {
      setItems(prev => prev.filter(t => !selectedIds.includes(t.id)));
    }
  };

  // 一鍵清空所有紀錄函式
  const handleClearAll = () => {
    if (window.confirm('⚠️ 警告：確定要清空「所有」記帳紀錄嗎？此動作無法復原！')) {
      setItems([]);
      localStorage.removeItem('accounting_items');
    }
  };

  // 匯出 CSV 檔案函式 (包含外幣資訊)
  const handleExportCSV = () => {
    if (items.length === 0) {
      alert('目前沒有任何記帳紀錄可供匯出！');
      return;
    }

    const headers = ['日期', '類型', '分類', '名稱/備註', '幣別', '外幣金額', '折合台幣(TWD)'];

    const rows = items.map(item => [
      item.date || '',
      item.type === 'income' ? '收入' : '支出',
      item.category || '',
      `"${(item.name || '').replace(/"/g, '""')}"`,
      item.originalCurrency || 'TWD',
      item.originalAmount || item.amount || 0,
      item.amount || 0
    ]);

    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.setAttribute('download', `記帳本備份_${getCurrentYearMonth()}.csv`);
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: isDarkMode ? '#0f172a' : '#eef5ff',
      backgroundImage: isDarkMode 
        ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='110' height='110' viewBox='0 0 80 80'%3E%3Cpath fill='none' stroke='%23334155' stroke-opacity='0.55' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' d='M20 5l2.4 5.2 5.6.8-4 4 1 5.6-5-2.8-5 2.8 1-5.6-4-4 5.6-.8zm40 40l2.4 5.2 5.6.8-4 4 1 5.6-5-2.8-5 2.8 1-5.6-4-4 5.6-.8zM60 5l1.5 3.2 3.5.5-2.5 2.5.6 3.5-3.1-1.7-3.1 1.7.6-3.5-2.5-2.5 3.5-.5zm-40 40l1.5 3.2 3.5.5-2.5 2.5.6 3.5-3.1-1.7-3.1 1.7.6-3.5-2.5-2.5 3.5-.5z'/%3E%3C/svg%3E")`
        : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='110' height='110' viewBox='0 0 80 80'%3E%3Cpath fill='none' stroke='%231e3a8a' stroke-opacity='0.3' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' d='M20 5l2.4 5.2 5.6.8-4 4 1 5.6-5-2.8-5 2.8 1-5.6-4-4 5.6-.8zm40 40l2.4 5.2 5.6.8-4 4 1 5.6-5-2.8-5 2.8 1-5.6-4-4 5.6-.8zM60 5l1.5 3.2 3.5.5-2.5 2.5.6 3.5-3.1-1.7-3.1 1.7.6-3.5-2.5-2.5 3.5-.5zm-40 40l1.5 3.2 3.5.5-2.5 2.5.6 3.5-3.1-1.7-3.1 1.7.6-3.5-2.5-2.5 3.5-.5z'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'repeat',
      color: isDarkMode ? '#f8fafc' : '#0f172a',
      padding: '30px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxSizing: 'border-box',
      transition: 'background-color 0.3s ease, color 0.3s ease'
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* 頂部 Header */}
        <Header 
          currentMonth={currentMonth} 
          onMonthChange={handleMonthChange} 
          onExportCSV={handleExportCSV}
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleDarkMode}
        />

        {/* 內容區域：加上 className="main-layout" 以便套用 RWD 媒體查詢 */}
        <div className="main-layout" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* 左側記帳清單 */}
          <ExpenseList 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            sortedDates={sortedDates}
            groupedDataByDate={groupedDataByDate}
            currentMonth={currentMonth}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onBatchDelete={handleBatchDelete}
            onClearAll={handleClearAll}
            onOpenAddModal={handleOpenAddModal}
            isDarkMode={isDarkMode}
          />

          {/* 右側統計卡片與圖表 */}
          <TotalCard 
            monthStats={monthStats}
            budget={budget}
            setBudget={setBudget}
            budgetStatus={budgetStatus}
            expenseChartData={expenseChartData}
            incomeChartData={incomeChartData}
            dailyTrendData={dailyTrendData}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>

      {/* 新增/編輯 Modal 表單 */}
      <ExpenseForm 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAdd}
        editingId={editingId}
        type={type}
        setType={setType}
        date={date}
        setDate={setDate}
        category={category}
        setCategory={setCategory}
        amount={amount}
        setAmount={setAmount}
        name={name}
        setName={setName}
        currency={currency}
        setCurrency={setCurrency}  
        rates={rates}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

export default App;