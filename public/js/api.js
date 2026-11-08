// API Client Service
const API = {
  async getDescriptiveSummary() {
    const res = await fetch('/api/descriptive/summary');
    return res.json();
  },

  async getPredictiveEstimate(payload) {
    const res = await fetch('/api/predictive/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async getPrescriptiveOptimization() {
    const res = await fetch('/api/prescriptive/optimize');
    return res.json();
  },

  async getTableList() {
    const res = await fetch('/api/db/tables');
    return res.json();
  },

  async getTableRows(tableName, limit = 100) {
    const res = await fetch(`/api/db/${tableName}?limit=${limit}`);
    return res.json();
  },

  async insertTableRow(tableName, payload) {
    const res = await fetch(`/api/db/${tableName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async updateTableRow(tableName, id, payload) {
    const res = await fetch(`/api/db/${tableName}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async deleteTableRow(tableName, id) {
    const res = await fetch(`/api/db/${tableName}/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  }
};
