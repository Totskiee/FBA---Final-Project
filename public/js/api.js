// API Client Service
const API = {
  async _fetch(url, options = {}) {
    const res = await fetch(url, options);
    if (res.status === 401) {
      // Session expired or unauthorized, redirect to login
      window.location.href = '/login';
      return { success: false, error: 'Unauthorized: Admin session required' };
    }
    return res.json();
  },

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
