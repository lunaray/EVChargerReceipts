import React from 'react';
import './SessionCard.css';

const SessionCard = ({ session, onDelete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'AmpUp':
        return '⚡';
      case 'Electrify America':
        return '🏃‍♂️';
      case 'ChargePoint':
        return '🔌';
      case 'EVgo':
        return '🚗';
      default:
        return '🔋';
    }
  };

  const calculateEfficiency = () => {
    if (session.total_energy_kwh && session.total_cost) {
      return (session.total_cost / session.total_energy_kwh).toFixed(3);
    }
    return 'N/A';
  };

  return (
    <div className="session-card fade-in">
      <div className="session-header">
        <div className="session-date">
          <span className="provider-icon">{getProviderIcon(session.provider)}</span>
          {formatDate(session.transaction_start)}
        </div>
        <div className="session-actions">
          <div className="session-cost">
            ${(session.total_cost || 0).toFixed(2)}
          </div>
          <button 
            className="delete-button"
            onClick={() => onDelete(session.id)}
            title="Delete session"
          >
            🗑️
          </button>
        </div>
      </div>
      
      <div className="session-details">
        <div className="detail-item">
          <span className="detail-label">Provider:</span>
          <span className="detail-value">{session.provider}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Energy:</span>
          <span className="detail-value">{session.total_energy_kwh?.toFixed(2)} kWh</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Duration:</span>
          <span className="detail-value">{formatDuration(session.duration_minutes)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Max Power:</span>
          <span className="detail-value">{session.maximum_power_kw?.toFixed(1)} kW</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Cost/kWh:</span>
          <span className="detail-value">${calculateEfficiency()}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Session ID:</span>
          <span className="detail-value session-id">{session.session_id}</span>
        </div>
      </div>

      {session.location_name && (
        <div className="location-info">
          <div className="location-name">
            📍 {session.location_name}
          </div>
          {session.location_address && (
            <div className="location-address">
              {session.location_address}
            </div>
          )}
        </div>
      )}

      {(session.energy_cost > 0 || session.time_cost > 0) && (
        <div className="cost-breakdown">
          <div className="cost-item">
            <span>Energy Cost:</span>
            <span>${(session.energy_cost || 0).toFixed(2)}</span>
          </div>
          <div className="cost-item">
            <span>Time Cost:</span>
            <span>${(session.time_cost || 0).toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionCard;