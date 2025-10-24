class DatabaseService {
  constructor() {
    this.baseURL = process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.com/api' // Replace with your actual domain
      : 'http://localhost:3001/api';
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Test connection to backend
      const response = await fetch(`${this.baseURL}/health`);
      if (!response.ok) {
        throw new Error(`Server health check failed: ${response.status}`);
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to connect to backend:', error);
      throw new Error('Unable to connect to the database server. Please make sure the backend is running.');
    }
  }

  // === CHARGING SESSIONS ===

  async getAllSessions() {
    if (!this.initialized) await this.initialize();
    
    try {
      const response = await fetch(`${this.baseURL}/sessions`);
      if (!response.ok) {
        throw new Error(`Failed to fetch sessions: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  }

  async getSessionByProviderAndId(provider, sessionId) {
    if (!this.initialized) await this.initialize();
    
    try {
      const response = await fetch(`${this.baseURL}/sessions/${encodeURIComponent(provider)}/${encodeURIComponent(sessionId)}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch session: ${response.status}`);
      }
      const session = await response.json();
      return session || null;
    } catch (error) {
      console.error('Error fetching session:', error);
      throw error;
    }
  }

  async insertSession(sessionData) {
    if (!this.initialized) await this.initialize();
    
    try {
      const response = await fetch(`${this.baseURL}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create session: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  async deleteSession(sessionId) {
    if (!this.initialized) await this.initialize();
    
    try {
      const response = await fetch(`${this.baseURL}/sessions/${sessionId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete session: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }

  // === MILEAGE RECORDS ===

  async getAllMileageRecords() {
    if (!this.initialized) await this.initialize();
    
    try {
      const response = await fetch(`${this.baseURL}/mileage`);
      if (!response.ok) {
        throw new Error(`Failed to fetch mileage records: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching mileage records:', error);
      throw error;
    }
  }

  async getLatestMileage() {
    if (!this.initialized) await this.initialize();
    
    try {
      const response = await fetch(`${this.baseURL}/mileage/latest`);
      if (!response.ok) {
        throw new Error(`Failed to fetch latest mileage: ${response.status}`);
      }
      const mileage = await response.json();
      return mileage || null;
    } catch (error) {
      console.error('Error fetching latest mileage:', error);
      throw error;
    }
  }

  async addMileageRecord(mileageData) {
    if (!this.initialized) await this.initialize();
    
    try {
      const response = await fetch(`${this.baseURL}/mileage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mileageData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to add mileage record: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding mileage record:', error);
      throw error;
    }
  }

  async updateMileageRecord(mileageId, mileageData) {
    if (!this.initialized) await this.initialize();
    
    try {
      const response = await fetch(`${this.baseURL}/mileage/${mileageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mileageData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update mileage record: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating mileage record:', error);
      throw error;
    }
  }

  async deleteMileageRecord(mileageId) {
    if (!this.initialized) await this.initialize();
    
    try {
      const response = await fetch(`${this.baseURL}/mileage/${mileageId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete mileage record: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting mileage record:', error);
      throw error;
    }
  }

  // === EFFICIENCY METRICS ===

  async getEfficiencyMetrics() {
    if (!this.initialized) await this.initialize();
    
    try {
      const response = await fetch(`${this.baseURL}/metrics/efficiency`);
      if (!response.ok) {
        throw new Error(`Failed to fetch efficiency metrics: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching efficiency metrics:', error);
      throw error;
    }
  }

  // === DATA EXPORT/IMPORT ===

  async exportData() {
    if (!this.initialized) await this.initialize();
    
    try {
      const response = await fetch(`${this.baseURL}/export`);
      if (!response.ok) {
        throw new Error(`Failed to export data: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  async importData(data) {
    if (!this.initialized) await this.initialize();
    
    try {
      const response = await fetch(`${this.baseURL}/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to import data: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  // === UTILITY METHODS ===

  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
const databaseService = new DatabaseService();
export default databaseService;