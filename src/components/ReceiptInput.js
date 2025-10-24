import React, { useState } from 'react';
import './ReceiptInput.css';

const ReceiptInput = ({ onParseReceipt, message, onClearMessage }) => {
  const [receiptText, setReceiptText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onParseReceipt(receiptText);
    setReceiptText('');
  };

  const handleInputChange = (e) => {
    setReceiptText(e.target.value);
    if (message.text) {
      onClearMessage();
    }
  };

  return (
    <div className="input-section">
      <h2>Add New Session</h2>
      <p className="input-description">
        Paste your AmpUp charging receipt below:
      </p>
      
      <form onSubmit={handleSubmit}>
        <textarea
          className="receipt-input"
          value={receiptText}
          onChange={handleInputChange}
          placeholder="Paste your AmpUp receipt here..."
          rows={12}
        />
        
        <button 
          type="submit"
          className="button"
          disabled={!receiptText.trim()}
        >
          Parse & Add Session
        </button>
      </form>
      
      {message.text && (
        <div className={`message ${message.type === 'error' ? 'error-message' : 'success-message'}`}>
          {message.text}
        </div>
      )}
      
      <div className="help-text">
        <h4>Supported Formats:</h4>
        <ul>
          <li>✅ AmpUp receipts</li>
          <li>🚧 Electrify America (coming soon)</li>
          <li>🚧 ChargePoint (coming soon)</li>
          <li>🚧 EVgo (coming soon)</li>
        </ul>
      </div>
    </div>
  );
};

export default ReceiptInput;