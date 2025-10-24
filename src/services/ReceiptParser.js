class ReceiptParser {
  static parseAmpUp(receiptText) {
    const lines = receiptText.split('\n').map(line => line.trim()).filter(line => line);
    
    const data = {
      provider: 'AmpUp',
      evse_id: '',
      location_name: '',
      location_address: '',
      transaction_start: '',
      transaction_end: '',
      duration_minutes: 0,
      total_energy_kwh: 0,
      maximum_power_kw: 0,
      total_cost: 0,
      energy_cost: 0,
      time_cost: 0,
      session_id: ''
    };
    
    for (const line of lines) {
      if (line.startsWith('EVSE ID:')) {
        data.evse_id = line.replace('EVSE ID:', '').trim();
      } else if (line.startsWith('Location Name:')) {
        data.location_name = line.replace('Location Name:', '').trim();
      } else if (line.startsWith('Location Address:')) {
        data.location_address = line.replace('Location Address:', '').trim();
      } else if (line.startsWith('Transaction Start:')) {
        const dateStr = line.replace('Transaction Start:', '').trim();
        data.transaction_start = this.parseDate(dateStr);
      } else if (line.startsWith('Transaction End:')) {
        const dateStr = line.replace('Transaction End:', '').trim();
        data.transaction_end = this.parseDate(dateStr);
      } else if (line.startsWith('Transaction Duration:')) {
        const duration = line.replace('Transaction Duration:', '').trim();
        data.duration_minutes = this.parseDuration(duration);
      } else if (line.startsWith('Total Energy:')) {
        const energy = line.replace('Total Energy:', '').trim();
        data.total_energy_kwh = parseFloat(energy.replace(' kWh', ''));
      } else if (line.startsWith('Maximum Power:')) {
        const power = line.replace('Maximum Power:', '').trim();
        data.maximum_power_kw = parseFloat(power.replace(' kW (AC)', ''));
      } else if (line.startsWith('Total Price:')) {
        const price = line.replace('Total Price:', '').trim();
        data.total_cost = parseFloat(price.replace('$', ''));
      } else if (line.startsWith('Session ID:')) {
        data.session_id = line.replace('Session ID:', '').trim();
      }
    }
    
    // Extract energy and time costs from the detailed breakdown
    const energyMatch = receiptText.match(/Energy: \$(\d+\.\d+)/);
    if (energyMatch) {
      data.energy_cost = parseFloat(energyMatch[1]);
    }
    
    const timeMatch = receiptText.match(/Time \(Charging\): \$(\d+\.\d+)/);
    if (timeMatch) {
      data.time_cost = parseFloat(timeMatch[1]);
    }
    
    return data;
  }

  static parseDate(dateStr) {
    try {
      return new Date(dateStr).toISOString();
    } catch (error) {
      console.error('Error parsing date:', dateStr, error);
      return null;
    }
  }

  static parseDuration(durationStr) {
    try {
      const match = durationStr.match(/(\d+) hr (\d+) min (\d+) sec/);
      if (match) {
        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const seconds = parseInt(match[3]);
        return hours * 60 + minutes + seconds / 60;
      }
      return 0;
    } catch (error) {
      console.error('Error parsing duration:', durationStr, error);
      return 0;
    }
  }

  // Future parsers for other providers can be added here
  static parseElectrifyAmerica(receiptText) {
    // TODO: Implement parser for Electrify America receipts
    throw new Error('Electrify America parser not yet implemented');
  }

  static parseChargePoint(receiptText) {
    // TODO: Implement parser for ChargePoint receipts
    throw new Error('ChargePoint parser not yet implemented');
  }

  static parseEVgo(receiptText) {
    // TODO: Implement parser for EVgo receipts
    throw new Error('EVgo parser not yet implemented');
  }

  // Auto-detect provider and parse accordingly
  static autoParseReceipt(receiptText) {
    const lowerText = receiptText.toLowerCase();
    
    if (lowerText.includes('ampup') || lowerText.includes('evse id:')) {
      return this.parseAmpUp(receiptText);
    } else if (lowerText.includes('electrify america')) {
      return this.parseElectrifyAmerica(receiptText);
    } else if (lowerText.includes('chargepoint')) {
      return this.parseChargePoint(receiptText);
    } else if (lowerText.includes('evgo')) {
      return this.parseEVgo(receiptText);
    } else {
      throw new Error('Unknown receipt format. Please specify the charging provider.');
    }
  }
}

export default ReceiptParser;