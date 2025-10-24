import React from 'react';
import SessionCard from './SessionCard';
import './SessionsList.css';

const SessionsList = ({ sessions, onDeleteSession }) => {
  return (
    <div className="sessions-section">
      <h2>Charging Sessions ({sessions.length})</h2>
      
      {sessions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔌</div>
          <h3>No charging sessions yet</h3>
          <p>Add your first session by pasting a receipt!</p>
        </div>
      ) : (
        <div className="sessions-list">
          {sessions.map((session) => (
            <SessionCard 
              key={session.id} 
              session={session}
              onDelete={onDeleteSession}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionsList;