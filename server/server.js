const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Database setup
const dbPath = path.join(__dirname, 'ev_charging.db');
const db = new sqlite3.Database(dbPath);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] // Replace with your actual domain
    : ['http://localhost:3000'], // React dev server
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Initialize database
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS charging_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider TEXT NOT NULL,
      evse_id TEXT,
      location_name TEXT,
      location_address TEXT,
      transaction_start DATETIME,
      transaction_end DATETIME,
      duration_minutes REAL,
      total_energy_kwh REAL,
      maximum_power_kw REAL,
      total_cost REAL,
      energy_cost REAL,
      time_cost REAL,
      session_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create mileage_records table
  db.run(`
    CREATE TABLE IF NOT EXISTS mileage_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      odometer_reading INTEGER NOT NULL,
      recorded_date DATE NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create index on recorded_date for faster queries
  db.run(`CREATE INDEX IF NOT EXISTS idx_mileage_date ON mileage_records(recorded_date)`);
});

// === CHARGING SESSIONS API ===

// Get all sessions
app.get('/api/sessions', (req, res) => {
  const sql = `
    SELECT * FROM charging_sessions 
    ORDER BY transaction_start DESC
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching sessions:', err);
      return res.status(500).json({ error: 'Failed to fetch sessions' });
    }
    res.json(rows);
  });
});

// Get session by provider and session ID
app.get('/api/sessions/:provider/:sessionId', (req, res) => {
  const { provider, sessionId } = req.params;
  
  const sql = `
    SELECT * FROM charging_sessions 
    WHERE provider = ? AND session_id = ?
    LIMIT 1
  `;
  
  db.get(sql, [provider, sessionId], (err, row) => {
    if (err) {
      console.error('Error fetching session:', err);
      return res.status(500).json({ error: 'Failed to fetch session' });
    }
    res.json(row || null);
  });
});

// Create new session
app.post('/api/sessions', (req, res) => {
  const {
    provider, evse_id, location_name, location_address,
    transaction_start, transaction_end, duration_minutes,
    total_energy_kwh, maximum_power_kw, total_cost,
    energy_cost, time_cost, session_id
  } = req.body;

  // Validate required fields
  if (!provider || !session_id || total_cost === undefined) {
    return res.status(400).json({ 
      error: 'Missing required fields: provider, session_id, and total_cost are required' 
    });
  }

  const sql = `
    INSERT INTO charging_sessions (
      provider, evse_id, location_name, location_address,
      transaction_start, transaction_end, duration_minutes,
      total_energy_kwh, maximum_power_kw, total_cost,
      energy_cost, time_cost, session_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    provider, evse_id, location_name, location_address,
    transaction_start, transaction_end, duration_minutes,
    total_energy_kwh, maximum_power_kw, total_cost,
    energy_cost, time_cost, session_id
  ];

  db.run(sql, params, function(err) {
    if (err) {
      console.error('Error creating session:', err);
      return res.status(500).json({ error: 'Failed to create session' });
    }
    res.status(201).json({ 
      id: this.lastID,
      message: 'Session created successfully' 
    });
  });
});

// Delete session
app.delete('/api/sessions/:id', (req, res) => {
  const { id } = req.params;
  
  const sql = 'DELETE FROM charging_sessions WHERE id = ?';
  
  db.run(sql, [id], function(err) {
    if (err) {
      console.error('Error deleting session:', err);
      return res.status(500).json({ error: 'Failed to delete session' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json({ message: 'Session deleted successfully' });
  });
});

// === MILEAGE RECORDS API ===

// Get all mileage records
app.get('/api/mileage', (req, res) => {
  const sql = `
    SELECT * FROM mileage_records 
    ORDER BY recorded_date DESC
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching mileage records:', err);
      return res.status(500).json({ error: 'Failed to fetch mileage records' });
    }
    res.json(rows);
  });
});

// Get latest mileage record
app.get('/api/mileage/latest', (req, res) => {
  const sql = `
    SELECT * FROM mileage_records 
    ORDER BY recorded_date DESC, created_at DESC
    LIMIT 1
  `;
  
  db.get(sql, [], (err, row) => {
    if (err) {
      console.error('Error fetching latest mileage:', err);
      return res.status(500).json({ error: 'Failed to fetch latest mileage' });
    }
    res.json(row || null);
  });
});

// Add new mileage record
app.post('/api/mileage', (req, res) => {
  const { odometer_reading, recorded_date, notes } = req.body;

  // Validate required fields
  if (!odometer_reading || !recorded_date) {
    return res.status(400).json({ 
      error: 'Missing required fields: odometer_reading and recorded_date are required' 
    });
  }

  // Validate odometer_reading is a positive integer
  if (!Number.isInteger(odometer_reading) || odometer_reading < 0) {
    return res.status(400).json({ 
      error: 'odometer_reading must be a positive integer' 
    });
  }

  const sql = `
    INSERT INTO mileage_records (odometer_reading, recorded_date, notes)
    VALUES (?, ?, ?)
  `;

  db.run(sql, [odometer_reading, recorded_date, notes || null], function(err) {
    if (err) {
      console.error('Error creating mileage record:', err);
      return res.status(500).json({ error: 'Failed to create mileage record' });
    }
    res.status(201).json({ 
      id: this.lastID,
      message: 'Mileage record created successfully' 
    });
  });
});

// Update mileage record
app.put('/api/mileage/:id', (req, res) => {
  const { id } = req.params;
  const { odometer_reading, recorded_date, notes } = req.body;

  const sql = `
    UPDATE mileage_records SET
      odometer_reading = ?, recorded_date = ?, notes = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(sql, [odometer_reading, recorded_date, notes || null, id], function(err) {
    if (err) {
      console.error('Error updating mileage record:', err);
      return res.status(500).json({ error: 'Failed to update mileage record' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Mileage record not found' });
    }
    res.json({ message: 'Mileage record updated successfully' });
  });
});

// Delete mileage record
app.delete('/api/mileage/:id', (req, res) => {
  const { id } = req.params;
  
  const sql = 'DELETE FROM mileage_records WHERE id = ?';
  
  db.run(sql, [id], function(err) {
    if (err) {
      console.error('Error deleting mileage record:', err);
      return res.status(500).json({ error: 'Failed to delete mileage record' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Mileage record not found' });
    }
    res.json({ message: 'Mileage record deleted successfully' });
  });
});

// === METRICS API ===

// Get efficiency metrics
app.get('/api/metrics/efficiency', (req, res) => {
  const sql = `
    WITH mileage_range AS (
      SELECT 
        MIN(odometer_reading) as start_mileage,
        MAX(odometer_reading) as end_mileage,
        MAX(odometer_reading) - MIN(odometer_reading) as total_miles
      FROM mileage_records
    ),
    charging_totals AS (
      SELECT 
        SUM(total_cost) as total_cost,
        SUM(total_energy_kwh) as total_energy_kwh,
        COUNT(*) as total_sessions
      FROM charging_sessions
    )
    SELECT 
      mr.*,
      ct.*,
      CASE 
        WHEN mr.total_miles > 0 THEN ROUND(ct.total_cost / mr.total_miles, 4)
        ELSE 0 
      END as cost_per_mile,
      CASE 
        WHEN mr.total_miles > 0 THEN ROUND(ct.total_energy_kwh / mr.total_miles * 100, 2)
        ELSE 0 
      END as kwh_per_100_miles,
      CASE 
        WHEN ct.total_energy_kwh > 0 THEN ROUND(mr.total_miles / ct.total_energy_kwh * 100, 2)
        ELSE 0 
      END as miles_per_100_kwh
    FROM mileage_range mr, charging_totals ct
  `;
  
  db.get(sql, [], (err, row) => {
    if (err) {
      console.error('Error calculating efficiency metrics:', err);
      return res.status(500).json({ error: 'Failed to calculate efficiency metrics' });
    }
    res.json(row || {
      start_mileage: 0,
      end_mileage: 0,
      total_miles: 0,
      total_cost: 0,
      total_energy_kwh: 0,
      total_sessions: 0,
      cost_per_mile: 0,
      kwh_per_100_miles: 0,
      miles_per_100_kwh: 0
    });
  });
});

// === DATA EXPORT/IMPORT API ===

// Export all data
app.get('/api/export', (req, res) => {
  const sessionsSql = 'SELECT * FROM charging_sessions ORDER BY created_at ASC';
  const mileageSql = 'SELECT * FROM mileage_records ORDER BY recorded_date ASC';
  
  // Get both sessions and mileage records
  db.all(sessionsSql, [], (err, sessions) => {
    if (err) {
      console.error('Error exporting sessions:', err);
      return res.status(500).json({ error: 'Failed to export sessions' });
    }
    
    db.all(mileageSql, [], (err, mileageRecords) => {
      if (err) {
        console.error('Error exporting mileage records:', err);
        return res.status(500).json({ error: 'Failed to export mileage records' });
      }
      
      const exportData = {
        exportDate: new Date().toISOString(),
        sessions: sessions,
        mileageRecords: mileageRecords
      };
      
      res.json(exportData);
    });
  });
});

// Import data
app.post('/api/import', (req, res) => {
  const { sessions, mileageRecords } = req.body;
  
  if (!Array.isArray(sessions)) {
    return res.status(400).json({ error: 'Sessions must be an array' });
  }

  // Clear existing data and import new data
  db.serialize(() => {
    // Clear existing data
    db.run('DELETE FROM charging_sessions');
    db.run('DELETE FROM mileage_records');

    let sessionErrors = 0;
    let mileageErrors = 0;
    let sessionCompleted = 0;
    let mileageCompleted = 0;

    // Import sessions
    if (sessions.length > 0) {
      const sessionSql = `
        INSERT INTO charging_sessions (
          provider, evse_id, location_name, location_address,
          transaction_start, transaction_end, duration_minutes,
          total_energy_kwh, maximum_power_kw, total_cost,
          energy_cost, time_cost, session_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      sessions.forEach((session) => {
        const params = [
          session.provider, session.evse_id, session.location_name, session.location_address,
          session.transaction_start, session.transaction_end, session.duration_minutes,
          session.total_energy_kwh, session.maximum_power_kw, session.total_cost,
          session.energy_cost, session.time_cost, session.session_id
        ];

        db.run(sessionSql, params, function(err) {
          if (err) {
            console.error('Error importing session:', err);
            sessionErrors++;
          }
          sessionCompleted++;
          checkImportComplete();
        });
      });
    }

    // Import mileage records
    if (mileageRecords && mileageRecords.length > 0) {
      const mileageSql = `
        INSERT INTO mileage_records (odometer_reading, recorded_date, notes)
        VALUES (?, ?, ?)
      `;

      mileageRecords.forEach((record) => {
        db.run(mileageSql, [record.odometer_reading, record.recorded_date, record.notes || null], function(err) {
          if (err) {
            console.error('Error importing mileage record:', err);
            mileageErrors++;
          }
          mileageCompleted++;
          checkImportComplete();
        });
      });
    }

    function checkImportComplete() {
      const expectedSessions = sessions.length;
      const expectedMileage = (mileageRecords && mileageRecords.length) || 0;
      
      if (sessionCompleted === expectedSessions && mileageCompleted === expectedMileage) {
        const totalErrors = sessionErrors + mileageErrors;
        if (totalErrors > 0) {
          res.status(207).json({ 
            message: `Import completed with errors`, 
            importedSessions: sessionCompleted - sessionErrors,
            importedMileage: mileageCompleted - mileageErrors,
            errors: totalErrors 
          });
        } else {
          res.json({ 
            message: 'Data imported successfully', 
            importedSessions: sessionCompleted,
            importedMileage: mileageCompleted
          });
        }
      }
    }

    // Handle case where there's nothing to import
    if (sessions.length === 0 && (!mileageRecords || mileageRecords.length === 0)) {
      res.json({ message: 'Data imported successfully', importedSessions: 0, importedMileage: 0 });
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'Connected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 EV Charging Tracker server running on port ${PORT}`);
  console.log(`📊 Database: ${dbPath}`);
  console.log(`🌐 API: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('📊 Database connection closed.');
    }
    process.exit(0);
  });
});