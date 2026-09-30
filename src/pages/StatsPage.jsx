import React from 'react';
import TotalCard from '../components/TotalCard';
import { useAppContext } from '../context/AppContext'; // 請確保路徑正確

function StatsPage(props) {
  // 從 Context 取得全域狀態
  const context = useAppContext ? useAppContext() : {};

  // 優先使用傳入的 props，若未提供則 Fallback 至 Context
  const items = props.items || context.items || [];
  const isDarkMode = props.isDarkMode ?? context.isDarkMode ?? false;
  const baseCurrency = props.baseCurrency || context.baseCurrency || 'TWD';
  const rates = props.rates || context.rates || {};
  const budget = props.budget ?? context.budget ?? 0;
  const currentMonth = props.currentMonth || context.currentMonth || new Date().toISOString().slice(0, 7);

  // 解構出其餘透傳屬性，避免重複傳遞已特別處理的 props
  const {
    items: _i,
    isDarkMode: _d,
    baseCurrency: _b,
    rates: _r,
    budget: _bg,
    currentMonth: _cm,
    ...restProps
  } = props;

  return (
    <div className="right-section" style={{ flex: '1 1 360px', minWidth: '0' }}>
      <TotalCard 
        items={items}
        isDarkMode={isDarkMode}
        baseCurrency={baseCurrency}
        rates={rates}
        budget={budget}
        currentMonth={currentMonth}
        {...restProps}
      />
    </div>
  );
}

export default StatsPage;