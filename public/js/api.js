// Centralized API Client Service
const API = {
  getDbToken() {
    return sessionStorage.getItem('titan_db_pin_token') || '';
  },

  setDbToken(token) {
    sessionStorage.setItem('titan_db_pin_token', token);
  },

  clearDbToken() {
    sessionStorage.removeItem('titan_db_pin_token');
  },

  isDbUnlocked() {
    return Boolean(sessionStorage.getItem('titan_db_pin_token'));
  },

  async _fetch(url, options = {}) {
    const headers = options.headers || {};
    
    // Attach database PIN token for /api/db requests
    if (url.startsWith('/api/db') && !url.includes('/verify-pin')) {
      const token = this.getDbToken();
      if (token) {
        headers['x-db-pin-token'] = token;
      }
    }

    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => ({}));

    if (res.status === 401 && url.startsWith('/api/db')) {
      return { success: false, locked: true, error: data.error || 'Database locked. PIN required.' };
    }

    return data;
  },

  // -----------------------------------------------------------
  // AUTH / PIN VERIFICATION
  // -----------------------------------------------------------
  async verifyDbPin(pin) {
    const res = await fetch('/api/db/verify-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });
    const data = await res.json();
    if (res.ok && data.success && data.token) {
      this.setDbToken(data.token);
    }
    return data;
  },

  // -----------------------------------------------------------
  // ANALYTICS APIS (PUBLIC)
  // -----------------------------------------------------------
  async getDescriptiveSummary() {
    return this._fetch('/api/descriptive/summary');
  },

  async getPredictiveEstimate(payload) {
    return this._fetch('/api/predictive/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  async getPrescriptiveOptimization() {
    return this._fetch('/api/prescriptive/optimize');
  },

  // -----------------------------------------------------------
  // DATABASE APIS (PIN PROTECTED)
  // -----------------------------------------------------------
  async getTableList() {
    return this._fetch('/api/db/tables');
  },

  async getTableRows(tableName, limit = 100) {
    return this._fetch(`/api/db/${tableName}?limit=${limit}`);
  },

  async insertTableRow(tableName, payload) {
    return this._fetch(`/api/db/${tableName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  async updateTableRow(tableName, id, payload) {
    return this._fetch(`/api/db/${tableName}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  async deleteTableRow(tableName, id) {
    return this._fetch(`/api/db/${tableName}/${id}`, {
      method: 'DELETE'
    });
  }
};
