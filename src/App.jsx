import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import TotalCard from './components/TotalCard';

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

  // 資料狀態
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
      console.error("Failed to parse localStorage:", e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('accounting_items', JSON.stringify(items));
  }, [items]);

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

  // 開關與清理表單
  const handleOpenAddModal = () => {
    setEditingId(null);
    setName('');
    setAmount('');
    setDate(getTodayDate());
    setType('expense');
    setCategory('🍔 餐飲');
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setName(item.name || '');
    setAmount(item.amount);
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
    if (!amount) {
      alert('請填寫金額！');
      return;
    }
    if (Number(amount) <= 0) {
      alert('金額必須大於 0 元！');
      return;
    }

    if (editingId) {
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === editingId
            ? { ...item, name: name.trim(), amount: Number(amount), category, type, date }
            : item
        )
      );
    } else {
      setItems(prevItems => [
        ...prevItems,
        { id: Date.now(), name: name.trim(), amount: Number(amount), category, type, date }
      ]);
    }

    handleCloseModal();
  };

  const handleDelete = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  // 計算與過濾邏輯
  const currentMonthItems = items.filter(item => (item.date ? item.date.slice(0, 7) : '未分類') === currentMonth);

  const filteredItems = currentMonthItems.filter(item => {
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    const matchesCategory = filterCategory === 'ALL' || item.category === filterCategory;

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || 
      (item.date && item.date.includes(q)) || 
      (item.name && item.name.toLowerCase().includes(q)) || 
      (item.category && item.category.toLowerCase().includes(q));

    return matchesTab && matchesCategory && matchesSearch;
  });

  const monthStats = currentMonthItems.reduce(
    (acc, item) => {
      const val = Number(item.amount) || 0;
      if (item.type === 'income') acc.income += val;
      else acc.expense += val;
      acc.net = acc.income - acc.expense;
      return acc;
    },
    { income: 0, expense: 0, net: 0 }
  );

  const getChartData = (targetType) => {
    const categoryTotals = currentMonthItems
      .filter(item => item.type === targetType)
      .reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + Number(item.amount);
        return acc;
      }, {});

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  };

  const expenseChartData = getChartData('expense');
  const incomeChartData = getChartData('income');

  const groupedDataByDate = filteredItems.reduce((acc, item) => {
    const dateKey = item.date || '未分類日期';
    if (!acc[dateKey]) acc[dateKey] = { dateTotal: 0, items: [] };
    const val = item.type === 'income' ? item.amount : -item.amount;
    acc[dateKey].dateTotal += val;
    acc[dateKey].items.push(item);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedDataByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#eef5ff',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpath fill='none' stroke='%231e3a8a' stroke-opacity='0.3' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' d='M20 5l2.4 5.2 5.6.8-4 4 1 5.6-5-2.8-5 2.8 1-5.6-4-4 5.6-.8zm40 40l2.4 5.2 5.6.8-4 4 1 5.6-5-2.8-5 2.8 1-5.6-4-4 5.6-.8zM60 5l1.5 3.2 3.5.5-2.5 2.5.6 3.5-3.1-1.7-3.1 1.7.6-3.5-2.5-2.5 3.5-.5zm-40 40l1.5 3.2 3.5.5-2.5 2.5.6 3.5-3.1-1.7-3.1 1.7.6-3.5-2.5-2.5 3.5-.5z'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'repeat',
      padding: '30px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxSizing: 'border-box'
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* 頂部 Header */}
        <Header 
          currentMonth={currentMonth} 
          onMonthChange={handleMonthChange} 
        />

        {/* 內容區域 */}
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
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
            onOpenAddModal={handleOpenAddModal}
          />

          {/* 右側統計卡片與圖表 */}
          <TotalCard 
            monthStats={monthStats}
            expenseChartData={expenseChartData}
            incomeChartData={incomeChartData}
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
      />
    </div>
  );
}

export default App;