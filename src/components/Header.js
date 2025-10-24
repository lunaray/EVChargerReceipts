import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <div className="header">
      <h1>⚡ EV Charging Tracker</h1>
      <p>Track your electric vehicle charging sessions and costs</p>
      <div className="vehicle-info">
        <strong>Vehicle:</strong> Polestar 2 2022 Long Range Dual Motor
      </div>
    </div>
  );
};

export default Header;