import React, { useState, useEffect } from 'react';
import './MileageTracker.css';

const MileageTracker = ({ onMileageUpdate }) => {
  const [mileageRecords, setMileageRecords] = useState([]);
  const [latestMileage, setLatestMileage] = useState(null);
  const [newMileage, setNewMileage] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadMileageData();
  }, []);

  const loadMileageData = async () => {
    try {
      const DatabaseService = (await import('../services/DatabaseService')).default;
      const [records, latest] = await Promise.all([
        DatabaseService.getAllMileageRecords(),
        DatabaseService.getLatestMileage()
      ]);
      setMileageRecords(records);
      setLatestMileage(latest);
    } catch (error) {
      console.error('Error loading mileage data:', error);
      setMessage({ type: 'error', text: 'Failed to load mileage data.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newMileage || !newDate) {
      setMessage({ type: 'error', text: 'Please fill in odometer reading and date.' });
      return;
    }

    const odometerReading = parseInt(newMileage);
    if (isNaN(odometerReading) || odometerReading < 0) {
      setMessage({ type: 'error', text: 'Please enter a valid odometer reading.' });
      return;
    }

    // Check if the new reading is less than the latest reading
    if (latestMileage && odometerReading < latestMileage.odometer_reading) {
      setMessage({ 
        type: 'error', 
        text: `Odometer reading cannot be less than the latest reading (${latestMileage.odometer_reading.toLocaleString()}).` 
      });
      return;
    }

    try {
      const DatabaseService = (await import('../services/DatabaseService')).default;
      await DatabaseService.addMileageRecord({
        odometer_reading: odometerReading,
        recorded_date: newDate,
        notes: notes.trim() || null
      });

      // Reset form
      setNewMileage('');
      setNewDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setShowForm(false);
      
      // Reload data
      await loadMileageData();
      
      // Notify parent component
      if (onMileageUpdate) {
        onMileageUpdate();
      }

      setMessage({ type: 'success', text: 'Mileage record added successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error adding mileage:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to add mileage record.' });
    }
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this mileage record?')) {
      return;
    }

    try {
      const DatabaseService = (await import('../services/DatabaseService')).default;
      await DatabaseService.deleteMileageRecord(recordId);
      await loadMileageData();
      
      if (onMileageUpdate) {
        onMileageUpdate();
      }

      setMessage({ type: 'success', text: 'Mileage record deleted successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error deleting mileage:', error);
      setMessage({ type: 'error', text: 'Failed to delete mileage record.' });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="mileage-tracker">
      <div className="mileage-header">
        <h3>📏 Mileage Tracker</h3>
        <button 
          className="add-mileage-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Add Mileage'}
        </button>
      </div>

      {/* Current Mileage Display */}
      {latestMileage && (
        <div className="current-mileage">
          <div className="current-reading">
            <span className="current-value">{latestMileage.odometer_reading.toLocaleString()}</span>
            <span className="current-label">Current Odometer</span>
          </div>
          <div className="current-date">
            <span>Last updated: {formatDate(latestMileage.recorded_date)}</span>
          </div>
        </div>
      )}

      {!latestMileage && (
        <div className="no-mileage-data">
          <p>📍 No mileage records yet. Add your first odometer reading!</p>
        </div>
      )}

      {/* Add Mileage Form */}
      {showForm && (
        <div className="mileage-form">
          <h4>Add New Mileage Reading</h4>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="odometer">Odometer Reading</label>
                <input
                  type="number"
                  id="odometer"
                  value={newMileage}
                  onChange={(e) => setNewMileage(e.target.value)}
                  placeholder="e.g., 16323"
                  min="0"
                  step="1"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="notes">Notes (optional)</label>
              <input
                type="text"
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Weekly update, road trip, etc."
              />
            </div>
            <button type="submit" className="submit-btn">
              Add Mileage Record
            </button>
          </form>
        </div>
      )}

      {/* Message Display */}
      {message.text && (
        <div className={`message ${message.type === 'error' ? 'error-message' : 'success-message'}`}>
          {message.text}
        </div>
      )}

      {/* Mileage History */}
      {mileageRecords.length > 0 && (
        <div className="mileage-history">
          <h4>Recent Mileage Records</h4>
          <div className="mileage-list">
            {mileageRecords.slice(0, 5).map((record) => (
              <div key={record.id} className="mileage-record">
                <div className="record-info">
                  <div className="record-reading">
                    {record.odometer_reading.toLocaleString()} miles
                  </div>
                  <div className="record-date">
                    {formatDate(record.recorded_date)}
                  </div>
                  {record.notes && (
                    <div className="record-notes">
                      {record.notes}
                    </div>
                  )}
                </div>
                <button 
                  className="delete-record-btn"
                  onClick={() => handleDelete(record.id)}
                  title="Delete record"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
          {mileageRecords.length > 5 && (
            <div className="show-more">
              <span>+ {mileageRecords.length - 5} more records</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MileageTracker;