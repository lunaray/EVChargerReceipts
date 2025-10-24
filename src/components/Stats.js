import React from 'react';
import './Stats.css';

const Stats = ({ stats, efficiencyMetrics }) => {
  return (
    <div className="stats-container">
      <h2>📊 Dashboard</h2>
      
      {/* Basic Stats */}
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

      {/* Efficiency Metrics */}
      {efficiencyMetrics && efficiencyMetrics.total_miles > 0 && (
        <>
          <h3>🚗 Efficiency Metrics</h3>
          <div className="efficiency-grid">
            <div className="efficiency-item">
              <div className="efficiency-value">{efficiencyMetrics.total_miles.toLocaleString()}</div>
              <div className="efficiency-label">Miles Driven</div>
              <div className="efficiency-sub">
                {efficiencyMetrics.start_mileage?.toLocaleString()} → {efficiencyMetrics.end_mileage?.toLocaleString()}
              </div>
            </div>
            <div className="efficiency-item highlight">
              <div className="efficiency-value">${efficiencyMetrics.cost_per_mile?.toFixed(4)}</div>
              <div className="efficiency-label">Cost per Mile</div>
              <div className="efficiency-sub">Your electricity cost</div>
            </div>
            <div className="efficiency-item">
              <div className="efficiency-value">{efficiencyMetrics.kwh_per_100_miles?.toFixed(1)}</div>
              <div className="efficiency-label">kWh per 100 miles</div>
              <div className="efficiency-sub">
                Target: 25-30 kWh 
                {efficiencyMetrics.kwh_per_100_miles <= 30 ? ' ✅' : 
                 efficiencyMetrics.kwh_per_100_miles <= 35 ? ' ⚠️' : ' ❌'}
              </div>
            </div>
            <div className="efficiency-item">
              <div className="efficiency-value">{efficiencyMetrics.miles_per_100_kwh?.toFixed(1)}</div>
              <div className="efficiency-label">Miles per 100 kWh</div>
              <div className="efficiency-sub">Higher is better</div>
            </div>
          </div>
          
          {/* Comparison to gas costs */}
          <div className="gas-comparison">
            <h4>💰 vs Gas Car Comparison</h4>
            <div className="comparison-items">
              <div className="comparison-item">
                <span>Your EV Cost:</span>
                <strong>${efficiencyMetrics.cost_per_mile?.toFixed(4)}/mile</strong>
              </div>
              <div className="comparison-item">
                <span>Gas Car (~30 MPG @ $3.50/gal):</span>
                <strong>$0.1167/mile</strong>
              </div>
              <div className="comparison-item savings">
                <span>Monthly Savings (1000 mi):</span>
                <strong>
                  ${((0.1167 - (efficiencyMetrics.cost_per_mile || 0)) * 1000).toFixed(2)}
                </strong>
              </div>
            </div>
          </div>
        </>
      )}
      
      {efficiencyMetrics && efficiencyMetrics.total_miles === 0 && (
        <div className="no-mileage">
          <p>📏 Add mileage records to see efficiency metrics!</p>
        </div>
      )}
    </div>
  );
};

export default Stats;