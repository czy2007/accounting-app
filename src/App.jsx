import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Navbar from './components/Navbar';
import ExpenseForm from './components/ExpenseForm';
import Toast from './components/Toast';
import LoadingSpinner from './components/LoadingSpinner';
import { useAppContext } from './context/AppContext'; // 🌟 引入全域 Context
import './App.css';

// 引入頁面組件
import HomePage from './pages/HomePage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';
import HistoryPage from './pages/HistoryPage';
import WalletsPage from './pages/WalletsPage';

function App() {
  // 🌟 從 AppContext 取得已託管的全域狀態與操作函式
  const {
    lang,
    t,
    toast,
    showToast,
    handleCloseToast,
    isDarkMode,
    handleToggleDarkMode,
    baseCurrency,
    setBaseCurrency,
    rates,
    isRatesLoading
  } = useAppContext();

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

  // 🌟 切換主要貨幣時，同步換算記帳紀錄 (items) 與 存錢目標 (goals)
  const handleBaseCurrencyChange = (newBaseCurrency) => {
    if (newBaseCurrency === baseCurrency) return;

    if (window.confirm(`確定要將系統主要貨幣變更為 ${newBaseCurrency} 嗎？所有過往紀錄與存錢目標金額將會自動依當前匯率重新計算。`)) {
      setBaseCurrency(newBaseCurrency);
      
      // 1. 換算記帳紀錄金額
      setItems(prevItems => prevItems.map(item => {
        const origCurrency = item.originalCurrency || baseCurrency;
        const origAmount = item.originalAmount || item.amount;

        if (origCurrency === newBaseCurrency) {
          return { ...item, amount: origAmount };
        }

        const origRate = rates[origCurrency]?.rate || 1;
        const newBaseRate = rates[newBaseCurrency]?.rate || 1;

        const amountInTWD = origCurrency === 'TWD' ? origAmount : origAmount / origRate;
        const amountInNewBase = newBaseCurrency === 'TWD' ? amountInTWD : Math.round(amountInTWD * newBaseRate);

        return {
          ...item,
          amount: amountInNewBase
        };
      }));

      // 2. 換算存錢目標金額（targetAmount 與 currentAmount）
      setGoals(prevGoals => prevGoals.map(goal => {
        const origCurrency = goal.currency || baseCurrency;
        const origTarget = goal.originalTargetAmount || goal.targetAmount;
        const origCurrent = goal.originalCurrentAmount || goal.currentAmount || 0;

        if (origCurrency === newBaseCurrency) {
          return {
            ...goal,
            targetAmount: origTarget,
            currentAmount: origCurrent
          };
        }

        const origRate = rates[origCurrency]?.rate || 1;
        const newBaseRate = rates[newBaseCurrency]?.rate || 1;

        const targetInTWD = origCurrency === 'TWD' ? origTarget : origTarget / origRate;
        const newTarget = newBaseCurrency === 'TWD' ? targetInTWD : Math.round(targetInTWD * newBaseRate);

        const currentInTWD = origCurrency === 'TWD' ? origCurrent : origCurrent / origRate;
        const newCurrent = newBaseCurrency === 'TWD' ? currentInTWD : Math.round(currentInTWD * newBaseRate);

        return {
          ...goal,
          targetAmount: newTarget,
          currentAmount: newCurrent
        };
      }));

      showToast(`${t.currencyChanged} ${newBaseCurrency}`, 'info');
    }
  };

  // 🎯 存錢目標狀態管理
  const [goals, setGoals] = useState(() => {
    try {
      const saved = localStorage.getItem('accounting_goals');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('accounting_goals', JSON.stringify(goals));
  }, [goals]);

  // 記帳資料狀態
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

  // 每月預算狀態
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
  const [currency, setCurrency] = useState(baseCurrency);
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

  const handleOpenAddModal = () => {
    setEditingId(null);
    setName('');
    setAmount('');
    setCurrency(baseCurrency);
    setDate(getTodayDate());
    setType('expense');
    setCategory('🍔 餐飲');
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setName(item.name || '');
    setAmount(item.originalAmount || item.amount);
    setCurrency(item.originalCurrency || baseCurrency);
    setCategory(item.category);
    setType(item.type);
    setDate(item.date || getTodayDate());
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleAdd = (e) => {
    if (e) e.preventDefault();
    const numAmount = Number(amount);

    if (!numAmount) {
      showToast(lang === 'zh-TW' ? '請填寫金額！' : 'Please enter an amount!', 'warning');
      return;
    }
    if (numAmount <= 0) {
      showToast(lang === 'zh-TW' ? '金額必須大於 0 元！' : 'Amount must be greater than 0!', 'warning');
      return;
    }

    let calculatedAmount = numAmount;

    if (currency !== baseCurrency) {
      const origRate = rates[currency]?.rate || 1;
      const baseRate = rates[baseCurrency]?.rate || 1;

      const amountInTWD = currency === 'TWD' ? numAmount : numAmount / origRate;
      calculatedAmount = baseCurrency === 'TWD' ? amountInTWD : Math.round(amountInTWD * baseRate);
    }

    if (editingId) {
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === editingId
            ? { 
                ...item, 
                name: name.trim(), 
                originalAmount: numAmount,
                originalCurrency: currency,
                amount: calculatedAmount, 
                category, 
                type, 
                date
              }
            : item
        )
      );
      showToast(t.itemUpdated, 'success');
    } else {
      setItems(prevItems => [
        { 
          id: Date.now(), 
          name: name.trim(), 
          originalAmount: numAmount,
          originalCurrency: currency,
          amount: calculatedAmount, 
          category, 
          type, 
          date
        },
        ...prevItems
      ]);
      showToast(t.itemAdded, 'success');
    }

    handleCloseModal();
  };

  // 🌟 刪除單筆明細：同步扣除存錢目標金額並跳出 Toast 提醒
  const handleDelete = (id) => {
    const itemToDelete = items.find(item => item.id === id);
    if (!itemToDelete) return;

    let isGoalExpense = false;
    let targetGoalName = '';

    if (itemToDelete.goalId) {
      isGoalExpense = true;
      setGoals(prevGoals => prevGoals.map(g => {
        if (g.id === itemToDelete.goalId) {
          targetGoalName = g.name;
          const deductAmount = itemToDelete.goalAddAmount || itemToDelete.amount || 0;
          const newCurrent = Math.max(0, Number(g.currentAmount || 0) - deductAmount);
          return {
            ...g,
            currentAmount: newCurrent,
            originalCurrentAmount: newCurrent
          };
        }
        return g;
      }));
    }

    setItems(prev => prev.filter(item => item.id !== id));

    // 🔔 根據是否為目標存入明細顯示警示通知
    if (isGoalExpense) {
      showToast(
        lang === 'zh-TW' 
          ? `已刪除此筆紀錄，目標「${targetGoalName || '存錢目標'}」已同步扣除對應金額！` 
          : 'Record deleted. Savings goal balance updated!', 
        'warning'
      );
    } else {
      showToast(t.itemDeleted, 'info');
    }
  };

  // 🌟 批量刪除：若包含目標存入明細，同樣給予提示與同步扣除
  const handleBatchDelete = (selectedIds) => {
    if (window.confirm(`確定要刪除選取的 ${selectedIds.length} 筆紀錄嗎？`)) {
      const itemsToDelete = items.filter(item => selectedIds.includes(item.id));
      let affectedGoalsCount = 0;

      itemsToDelete.forEach(item => {
        if (item.goalId) {
          affectedGoalsCount++;
          setGoals(prevGoals => prevGoals.map(g => {
            if (g.id === item.goalId) {
              const deductAmount = item.goalAddAmount || item.amount || 0;
              const newCurrent = Math.max(0, Number(g.currentAmount || 0) - deductAmount);
              return {
                ...g,
                currentAmount: newCurrent,
                originalCurrentAmount: newCurrent
              };
            }
            return g;
          }));
        }
      });

      setItems(prev => prev.filter(t => !selectedIds.includes(t.id)));

      if (affectedGoalsCount > 0) {
        showToast(
          lang === 'zh-TW' 
            ? `已刪除 ${selectedIds.length} 筆紀錄（含 ${affectedGoalsCount} 筆存錢紀錄，目標進度已同步更新）` 
            : `Deleted ${selectedIds.length} items and updated savings goals!`, 
          'warning'
        );
      } else {
        showToast(`已成功刪除 ${selectedIds.length} 筆紀錄`, 'info');
      }
    }
  };

  // 🎯 存錢目標控制：新增目標
  const handleAddGoal = (newGoal) => {
    const goalId = `g_${Date.now()}`;
    const goalData = {
      ...newGoal,
      id: goalId,
      currency: newGoal.currency || baseCurrency,
      originalTargetAmount: Number(newGoal.targetAmount),
      originalCurrentAmount: Number(newGoal.currentAmount || 0)
    };

    setGoals(prev => [...prev, goalData]);

    const initAmt = Number(newGoal.currentAmount || 0);
    if (initAmt > 0) {
      const initExpense = {
        id: Date.now(),
        name: `存入目標：${newGoal.name}`,
        originalAmount: initAmt,
        originalCurrency: goalData.currency,
        amount: initAmt,
        goalId: goalId,
        goalAddAmount: initAmt,
        category: '💡 雜項',
        type: 'expense',
        date: getTodayDate()
      };
      setItems(prev => [initExpense, ...prev]);
    }

    showToast(lang === 'zh-TW' ? '已建立存錢目標！' : 'Savings goal created!', 'success');
  };

  const handleEditGoal = (updatedGoal) => {
    setGoals(prev => prev.map(g => g.id === updatedGoal.id ? {
      ...updatedGoal,
      currency: updatedGoal.currency || baseCurrency,
      originalTargetAmount: Number(updatedGoal.targetAmount),
      originalCurrentAmount: Number(updatedGoal.currentAmount || 0)
    } : g));
    showToast(lang === 'zh-TW' ? '目標變更已儲存' : 'Goal updated', 'success');
  };

  // 🌟 刪除目標：雙重比對 goalId 與 名稱，確保新舊明細均自動清理並歸還資金
  const handleDeleteGoal = (id) => {
    const targetGoal = goals.find(g => g.id === id);
    if (!targetGoal) return;

    const confirmMsg = lang === 'zh-TW'
      ? `確定要刪除存錢目標「${targetGoal.name}」嗎？\n\n⚠️ 注意：當初存入此目標的所有支出紀錄將會自動刪除，並將資金歸還（加回）至你的結餘中！`
      : `Are you sure you want to delete "${targetGoal.name}"?\n\nAll deposit records for this goal will be removed and returned to your balance!`;

    if (window.confirm(confirmMsg)) {
      // 1. 刪除目標
      setGoals(prev => prev.filter(g => g.id !== id));

      // 2. 雙重過濾：比對 goalId 或明細名稱「存入目標：目標名稱」
      const targetName = targetGoal.name;
      setItems(prevItems => prevItems.filter(item => {
        const isMatchById = item.goalId && item.goalId === id;
        const isMatchByName = item.name && (
          item.name === `存入目標：${targetName}` || 
          item.name === `存入目標: ${targetName}`
        );
        
        return !(isMatchById || isMatchByName);
      }));

      showToast(lang === 'zh-TW' ? '已刪除存錢目標，對應資金已自動歸還！' : 'Goal deleted and funds restored!', 'info');
    }
  };

  // 🌟 存入資金（綁定 goalId 與精準匯率金額）
  const handleDepositGoal = (goalId, depositAmount, depositCurrency = baseCurrency) => {
    const numAmt = Number(depositAmount);
    if (!numAmt || numAmt <= 0) {
      showToast(lang === 'zh-TW' ? '請輸入正確的存入金額！' : 'Please enter a valid deposit amount!', 'warning');
      return;
    }

    const targetGoal = goals.find(g => g.id === goalId);
    if (!targetGoal) return;

    const goalCurrency = targetGoal.currency || 'TWD';

    const convertToTWD = (amount, curr) => {
      if (curr === 'TWD') return amount;
      const rateOfCurr = rates[curr]?.rate || 1;
      const rateOfTWD = rates['TWD']?.rate || 1;

      if (baseCurrency === 'TWD') {
        return amount / rateOfCurr;
      } else if (baseCurrency === curr) {
        return amount * rateOfTWD;
      } else {
        const amountInBase = amount / rateOfCurr;
        return amountInBase * rateOfTWD;
      }
    };

    const convertFromTWD = (amountInTWD, targetCurr) => {
      if (targetCurr === 'TWD') return amountInTWD;
      const rateOfTarget = rates[targetCurr]?.rate || 1;
      const rateOfTWD = rates['TWD']?.rate || 1;

      if (baseCurrency === 'TWD') {
        return amountInTWD * rateOfTarget;
      } else if (baseCurrency === targetCurr) {
        return amountInTWD / rateOfTWD;
      } else {
        const amountInBase = amountInTWD / rateOfTWD;
        return amountInBase * rateOfTarget;
      }
    };

    // 1. 計算折算至目標幣別的金額
    let goalAddAmount = numAmt;
    if (depositCurrency !== goalCurrency) {
      const amountInTWD = convertToTWD(numAmt, depositCurrency);
      goalAddAmount = Math.round(convertFromTWD(amountInTWD, goalCurrency));
    }

    // 2. 計算折算至全站主要幣別的金額
    let expenseBaseAmount = numAmt;
    if (depositCurrency !== baseCurrency) {
      const amountInTWD = convertToTWD(numAmt, depositCurrency);
      expenseBaseAmount = convertFromTWD(amountInTWD, baseCurrency);
      expenseBaseAmount = (baseCurrency === 'JPY' || baseCurrency === 'KRW' || baseCurrency === 'TWD')
        ? Math.round(expenseBaseAmount)
        : Number(expenseBaseAmount.toFixed(2));
    }

    // 3. 新增明細紀錄（包含 goalId 與 goalAddAmount 以便雙向聯動）
    const newExpense = {
      id: Date.now(),
      name: `存入目標：${targetGoal.name}`,
      originalAmount: numAmt,
      originalCurrency: depositCurrency,
      amount: expenseBaseAmount,
      goalId: goalId,
      goalAddAmount: goalAddAmount,
      category: '💡 雜項',
      type: 'expense',
      date: getTodayDate()
    };
    setItems(prev => [newExpense, ...prev]);

    // 4. 更新存錢目標進度
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const updatedCurrent = Number(g.currentAmount || 0) + goalAddAmount;
        return { 
          ...g, 
          currentAmount: updatedCurrent,
          originalCurrentAmount: updatedCurrent
        };
      }
      return g;
    }));

    showToast(`成功存入 ${depositCurrency} $${numAmt.toLocaleString()}（折合約 ${goalCurrency} $${goalAddAmount.toLocaleString()}）！`, 'success');
  };

  const currentMonthItems = useMemo(() => {
    return items.filter(item => (item.date ? item.date.slice(0, 7) : '未分類') === currentMonth);
  }, [items, currentMonth]);

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

  const budgetStatus = useMemo(() => {
    const expense = monthStats.expense;
    if (!budget || budget <= 0) {
      return { percent: 0, rawPercent: '0.0', isOver: false, color: '#3b82f6' };
    }

    const rawPercentNumber = (expense / budget) * 100;
    const percent = Math.min(rawPercentNumber, 100);
    const isOver = expense > budget;

    let color = '#10b981';

    if (rawPercentNumber >= 90) {
      color = '#ef4444';
    } else if (rawPercentNumber >= 70) {
      color = '#f59e0b';
    }

    return {
      percent,
      rawPercent: rawPercentNumber.toFixed(1),
      isOver,
      color,
    };
  }, [monthStats.expense, budget]);

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

  const sortedDates = useMemo(() => {
    return Object.keys(groupedDataByDate).sort((a, b) => b.localeCompare(a));
  }, [groupedDataByDate]);

  const handleClearAll = () => {
    if (window.confirm('⚠️ 警告：確定要清空「所有」記帳紀錄嗎？此動作無法復原！')) {
      setItems([]);
      localStorage.removeItem('accounting_items');
      showToast('所有記帳紀錄已清空', 'error');
    }
  };

  const handleExportCSV = () => {
    if (items.length === 0) {
      showToast(lang === 'zh-TW' ? '目前沒有任何記帳紀錄可供匯出！' : 'No records to export!', 'warning');
      return;
    }

    const headers = ['日期', '類型', '分類', '名稱/備註', '幣別', '外幣金額', `折合主要幣別(${baseCurrency})`];

    const rows = items.map(item => {
      return [
        item.date || '',
        item.type === 'income' ? '收入' : '支出',
        item.category || '',
        `"${(item.name || '').replace(/"/g, '""')}"`,
        item.originalCurrency || baseCurrency,
        item.originalAmount || item.amount || 0,
        item.amount || 0
      ];
    });

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

    showToast(t.csvExported, 'success');
  };

  const starBgLight = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cpath fill='none' stroke='%2393c5fd' stroke-opacity='0.6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M40 10l4.8 10.4 11.2 1.6-8 8 1.9 11.2-10-5.6-10 5.6 1.9-11.2-8-8 11.2-1.6zm80 80l4.8 10.4 11.2 1.6-8 8 1.9 11.2-10-5.6-10 5.6 1.9-11.2-8-8 11.2-1.6zM120 10l3 6.4 7 1-5 5 1.2 7-6.2-3.4-6.2 3.4 1.2-7-5-5 7-1zm-80 80l3 6.4 7 1-5 5 1.2 7-6.2-3.4-6.2 3.4 1.2-7-5-5 7-1z'/%3E%3C/svg%3E")`;
  const starBgDark = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cpath fill='none' stroke='%23334155' stroke-opacity='0.7' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M40 10l4.8 10.4 11.2 1.6-8 8 1.9 11.2-10-5.6-10 5.6 1.9-11.2-8-8 11.2-1.6zm80 80l4.8 10.4 11.2 1.6-8 8 1.9 11.2-10-5.6-10 5.6 1.9-11.2-8-8 11.2-1.6zM120 10l3 6.4 7 1-5 5 1.2 7-6.2-3.4-6.2 3.4 1.2-7-5-5 7-1zm-80 80l3 6.4 7 1-5 5 1.2 7-6.2-3.4-6.2 3.4 1.2-7-5-5 7-1z'/%3E%3C/svg%3E")`;

  return (
    <div className="app-container" style={{
      minHeight: '100vh',
      backgroundColor: isDarkMode ? '#0f172a' : '#eef5ff',
      backgroundImage: isDarkMode ? starBgDark : starBgLight,
      backgroundRepeat: 'repeat',
      color: isDarkMode ? '#f8fafc' : '#0f172a',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxSizing: 'border-box',
      transition: 'background-color 0.3s ease, color 0.3s ease'
    }}>
      <style>{`
        .app-container {
          padding: 20px 20px 70px 20px;
        }
        @media (min-width: 768px) {
          .app-container {
            padding: 30px 20px 30px 20px;
          }
        }
      `}</style>

      {/* 🔔 全域 Toast 提示訊息 */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={handleCloseToast}
          isDarkMode={isDarkMode}
        />
      )}

      {/* 🌀 全域 Loading 載入遮罩 */}
      {isRatesLoading && (
        <LoadingSpinner
          isDarkMode={isDarkMode}
          text={lang === 'zh-TW' ? '正在獲取最新即時匯率...' : 'Fetching latest rates...'}
        />
      )}

      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <Header 
          currentMonth={currentMonth} 
          onMonthChange={handleMonthChange} 
          onExportCSV={handleExportCSV}
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleDarkMode}
          t={t}
        />

        <Navbar isDarkMode={isDarkMode} t={t} />

        <div className="main-layout" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <Routes>
            <Route 
              path="/" 
              element={
                <HomePage
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
                  baseCurrency={baseCurrency}
                  t={t}
                />
              } 
            />

            <Route 
              path="/stats" 
              element={
                <StatsPage 
                  monthStats={monthStats}
                  budget={budget}
                  setBudget={setBudget}
                  budgetStatus={budgetStatus}
                  expenseChartData={expenseChartData}
                  incomeChartData={incomeChartData}
                  dailyTrendData={dailyTrendData}
                  isDarkMode={isDarkMode}
                  baseCurrency={baseCurrency}
                  t={t}
                />
              } 
            />

            <Route 
              path="/wallets" 
              element={
                <WalletsPage 
                  goals={goals}
                  items={items}
                  isDarkMode={isDarkMode}
                  baseCurrency={baseCurrency}
                  onAddGoal={handleAddGoal}
                  onEditGoal={handleEditGoal}
                  onDeleteGoal={handleDeleteGoal}
                  onDepositGoal={handleDepositGoal}
                  t={t}
                />
              } 
            />

            <Route 
              path="/history" 
              element={
                <HistoryPage 
                  items={items}
                  isDarkMode={isDarkMode}
                  baseCurrency={baseCurrency}
                  rates={rates}
                  currentMonth={currentMonth}
                  onSelectMonth={(m) => setCurrentMonth(m)}
                  t={t}
                />
              } 
            />

            <Route 
              path="/settings" 
              element={<SettingsPage />} 
            />
          </Routes>
        </div>
      </div>

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
        baseCurrency={baseCurrency}
        t={t}
      />
    </div>
  );
}

export default App;