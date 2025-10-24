import React from 'react';
import './Stats.css';

const Stats = ({ stats }) => {
  return (
    <div className="stats">
      <div className="stat-card">
        <div className="stat-value">{stats.totalSessions}</div>
        <div className="stat-label">Total Sessions</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">${stats.totalCost.toFixed(2)}</div>
        <div className="stat-label">Total Cost</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{stats.totalEnergy.toFixed(1)} kWh</div>
        <div className="stat-label">Total Energy</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">${stats.avgCostPerKwh.toFixed(3)}</div>
        <div className="stat-label">Avg $/kWh</div>
      </div>
    </div>
  );
};

export default Stats;