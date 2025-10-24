import initSqlJs from 'sql.js';

class DatabaseService {
  constructor() {
    this.SQL = null;
    this.db = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize SQL.js
      this.SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
      });

      // Try to load existing database from localStorage
      const saved = localStorage.getItem('evChargingDB');
      if (saved) {
        const data = new Uint8Array(JSON.parse(saved));
        this.db = new this.SQL.Database(data);
      } else {
        this.db = new this.SQL.Database();
        this.createTables();
      }

      this.initialized = true;
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  createTables() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS charging_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        provider TEXT NOT NULL,
        evse_id TEXT,
        location_name TEXT,
        location_address TEXT,
        transaction_start DATETIME,
        transaction_end DATETIME,
        duration_minutes INTEGER,
        total_energy_kwh REAL,
        maximum_power_kw REAL,
        total_cost REAL,
        energy_cost REAL,
        time_cost REAL,
        session_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  saveDatabase() {
    if (this.db) {
      const data = this.db.export();
      localStorage.setItem('evChargingDB', JSON.stringify(Array.from(data)));
    }
  }

  async getAllSessions() {
    if (!this.initialized) await this.initialize();

    const result = this.db.exec(`
      SELECT * FROM charging_sessions 
      ORDER BY transaction_start DESC
    `);

    if (result.length > 0) {
      return result[0].values.map(row => {
        const columns = result[0].columns;
        const session = {};
        columns.forEach((col, index) => {
          session[col] = row[index];
        });
        return session;
      });
    }

    return [];
  }

  async getSessionByProviderAndId(provider, sessionId) {
    if (!this.initialized) await this.initialize();

    const result = this.db.exec(`
      SELECT * FROM charging_sessions 
      WHERE session_id = ? AND provider = ?
    `, [sessionId, provider]);

    if (result.length > 0 && result[0].values.length > 0) {
      const columns = result[0].columns;
      const session = {};
      columns.forEach((col, index) => {
        session[col] = result[0].values[0][index];
      });
      return session;
    }

    return null;
  }

  async insertSession(sessionData) {
    if (!this.initialized) await this.initialize();

    this.db.run(`
      INSERT INTO charging_sessions (
        provider, evse_id, location_name, location_address,
        transaction_start, transaction_end, duration_minutes,
        total_energy_kwh, maximum_power_kw, total_cost,
        energy_cost, time_cost, session_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      sessionData.provider, sessionData.evse_id, sessionData.location_name,
      sessionData.location_address, sessionData.transaction_start,
      sessionData.transaction_end, sessionData.duration_minutes,
      sessionData.total_energy_kwh, sessionData.maximum_power_kw,
      sessionData.total_cost, sessionData.energy_cost,
      sessionData.time_cost, sessionData.session_id
    ]);

    this.saveDatabase();
  }

  async deleteSession(sessionId) {
    if (!this.initialized) await this.initialize();

    this.db.run('DELETE FROM charging_sessions WHERE id = ?', [sessionId]);
    this.saveDatabase();
  }

  async exportData() {
    const sessions = await this.getAllSessions();
    return {
      exportDate: new Date().toISOString(),
      sessions: sessions
    };
  }

  async importData(data) {
    if (!this.initialized) await this.initialize();

    // Clear existing data
    this.db.run('DELETE FROM charging_sessions');

    // Import sessions
    for (const session of data.sessions) {
      await this.insertSession(session);
    }
  }
}

// Export singleton instance
export default new DatabaseService();