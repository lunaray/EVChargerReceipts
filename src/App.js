import React, { useState, useEffect, useCallback } from 'react';
import DatabaseService from './services/DatabaseService';
import ReceiptParser from './services/ReceiptParser';
import Header from './components/Header';
import Stats from './components/Stats';
import ReceiptInput from './components/ReceiptInput';
import SessionsList from './components/SessionsList';
import MileageTracker from './components/MileageTracker';
import './App.css';

function App() {
  const [sessions, setSessions] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalCost: 0,
    totalEnergy: 0,
    avgCostPerKwh: 0
  });
  const [efficiencyMetrics, setEfficiencyMetrics] = useState(null);

  const loadSessions = useCallback(async () => {
    try {
      const sessionData = await DatabaseService.getAllSessions();
      setSessions(sessionData);
      
      // Calculate basic stats
      const totalCost = sessionData.reduce((sum, s) => sum + (s.total_cost || 0), 0);
      const totalEnergy = sessionData.reduce((sum, s) => sum + (s.total_energy_kwh || 0), 0);
      
      setStats({
        totalSessions: sessionData.length,
        totalCost: totalCost,
        totalEnergy: totalEnergy,
        avgCostPerKwh: totalEnergy > 0 ? totalCost / totalEnergy : 0
      });
    } catch (error) {
      console.error('Error loading sessions:', error);
      setMessage({ type: 'error', text: 'Error loading sessions from database.' });
    }
  }, []);

  const loadEfficiencyMetrics = useCallback(async () => {
    try {
      const metrics = await DatabaseService.getEfficiencyMetrics();
      setEfficiencyMetrics(metrics);
    } catch (error) {
      console.error('Error loading efficiency metrics:', error);
      // Don't show error for metrics as it's not critical
    }
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([
      loadSessions(),
      loadEfficiencyMetrics()
    ]);
  }, [loadSessions, loadEfficiencyMetrics]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await DatabaseService.initialize();
        await refreshData();
      } catch (error) {
        console.error('Error initializing app:', error);
        setMessage({ type: 'error', text: 'Error initializing database.' });
      }
    };
    
    initializeApp();
  }, [refreshData]);

  const handleParseReceipt = async (receiptText) => {
    if (!receiptText.trim()) {
      setMessage({ type: 'error', text: 'Please paste a receipt to parse.' });
      return;
    }

    try {
      const sessionData = ReceiptParser.parseAmpUp(receiptText);
      
      // Validate required fields
      if (!sessionData.session_id || !sessionData.total_cost) {
        setMessage({ type: 'error', text: 'Invalid receipt format. Please check the receipt data.' });
        return;
      }

      // Check if session already exists
      const existingSession = await DatabaseService.getSessionByProviderAndId(
        sessionData.provider, 
        sessionData.session_id
      );
      
      if (existingSession) {
        setMessage({ type: 'error', text: 'This charging session has already been recorded.' });
        return;
      }

      // Insert new session
      await DatabaseService.insertSession(sessionData);
      await refreshData();
      
      setMessage({ type: 'success', text: 'Charging session added successfully!' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      
    } catch (error) {
      console.error('Error parsing receipt:', error);
      setMessage({ type: 'error', text: 'Error parsing receipt. Please check the format.' });
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this charging session?')) {
      try {
        await DatabaseService.deleteSession(sessionId);
        await refreshData();
        setMessage({ type: 'success', text: 'Session deleted successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        console.error('Error deleting session:', error);
        setMessage({ type: 'error', text: 'Error deleting session.' });
      }
    }
  };

  const handleMileageUpdate = async () => {
    // Refresh metrics when mileage is updated
    await loadEfficiencyMetrics();
  };

  const clearMessage = () => {
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="container">
      <Header />
      <Stats stats={stats} efficiencyMetrics={efficiencyMetrics} />
      
      <div className="main-content">
        <div className="left-column">
          <MileageTracker onMileageUpdate={handleMileageUpdate} />
          <ReceiptInput 
            onParseReceipt={handleParseReceipt}
            message={message}
            onClearMessage={clearMessage}
          />
        </div>
        <div className="right-column">
          <SessionsList 
            sessions={sessions}
            onDeleteSession={handleDeleteSession}
          />
        </div>
      </div>
    </div>
  );
}

export default App;