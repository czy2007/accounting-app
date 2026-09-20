import React from 'react';
import TotalCard from '../components/TotalCard';

function StatsPage(props) {
  return (
    <div className="right-section" style={{ flex: '1 1 360px', minWidth: '0' }}>
      <TotalCard {...props} />
    </div>
  );
}

export default StatsPage;