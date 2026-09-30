import React, { useMemo } from 'react';
import ExpenseList from '../components/ExpenseList';
import { useAppContext } from '../context/AppContext'; // 請確保路徑正確

// 預設多語系字典 (HomePage 專用)
const DEFAULT_TRANSLATIONS = {
  'zh-TW': {
    pageTitle: '🏠 記帳明細列表',
    monthlyOverview: '本月收支總覽'
  },
  'zh-CN': {
    pageTitle: '🏠 记账明细列表',
    monthlyOverview: '本月收支总览'
  },
  'ja': {
    pageTitle: '🏠 家計簿明細リスト',
    monthlyOverview: '今月の収支概要'
  },
  'ko': {
    pageTitle: '🏠 가계부 내역 목록',
    monthlyOverview: '이번 달 수입/지출 개요'
  },
  'en': {
    pageTitle: '🏠 Transactions List',
    monthlyOverview: 'Monthly Overview'
  }
};

function HomePage(props) {
  // 從 Context 取得全域狀態
  const context = useAppContext ? useAppContext() : {};

  // 優先使用 props，若未提供則 Fallback 至 Context
  const items = props.items || context.items || [];
  const isDarkMode = props.isDarkMode ?? context.isDarkMode ?? false;
  const baseCurrency = props.baseCurrency || context.baseCurrency || 'TWD';
  const rates = props.rates || context.rates || {};
  const currentMonth = props.currentMonth || context.currentMonth || new Date().toISOString().slice(0, 7);
  const currentLang = context?.lang || context?.language || 'zh-TW';

  // 語系字典整合
  const t = useMemo(() => {
    const defaultDict = DEFAULT_TRANSLATIONS[currentLang] || DEFAULT_TRANSLATIONS['zh-TW'];
    const customDict = context?.t || {};
    return { ...defaultDict, ...customDict };
  }, [currentLang, context?.t]);

  // 解構透傳給 ExpenseList 的其他屬性
  const { 
    rates: _r, 
    baseCurrency: _b, 
    items: _i, 
    isDarkMode: _d, 
    budget: _bg, 
    ...restProps 
  } = props;

  return (
    <div 
      className="homepage-container" 
      style={{ 
        flex: '1 1 500px', 
        minWidth: '0',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* 頂部頁面標題 */}
      <h2 style={{ 
        fontSize: '22px', 
        fontWeight: '800', 
        marginBottom: '20px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        color: isDarkMode ? '#38bdf8' : '#1e3a8a'
      }}>
        {t.pageTitle}
      </h2>

      {/* 🌟 帳目明細清單（已移除上方的 TotalCard 財務圖表分析區塊） */}
      <ExpenseList 
        items={items}
        isDarkMode={isDarkMode}
        baseCurrency={baseCurrency} 
        rates={rates}
        currentMonth={currentMonth}
        {...restProps} 
      />
    </div>
  );
}

export default HomePage;