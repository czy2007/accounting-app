import React from 'react';
import ExpenseList from '../components/ExpenseList';

function HomePage(props) {
  // 將 rates 和 baseCurrency 顯式解構，並透傳給 ExpenseList
  const { rates, baseCurrency, ...restProps } = props;

  return (
    <div className="left-section" style={{ flex: '1 1 500px', minWidth: '0' }}>
      <ExpenseList 
        {...restProps} 
        baseCurrency={baseCurrency} 
        rates={rates} 
      />
    </div>
  );
}

export default HomePage;