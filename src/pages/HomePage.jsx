import React from 'react';
import ExpenseList from '../components/ExpenseList';

function HomePage(props) {
  return (
    <div className="left-section" style={{ flex: '1 1 500px', minWidth: '0' }}>
      <ExpenseList {...props} />
    </div>
  );
}

export default HomePage;