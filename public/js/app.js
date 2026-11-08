// Main Application Logic
let currentTable = 'warehouses';
let currentPrimaryKey = 'warehouse_id';
let tableCache = [];
let editingRecordId = null;

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initDescriptiveDashboard();
  initPredictiveForm();
  initPrescriptiveDashboard();
  initDatabaseLockState();
  if (API.isDbUnlocked()) {
    loadTable('warehouses');
  }
});

// -------------------------------------------------------------
// DARK & LIGHT MODE TOGGLE
// -------------------------------------------------------------
function initTheme() {
  const savedTheme = localStorage.getItem('titan_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
    updateThemeToggleUI(true);
  } else {
    document.documentElement.classList.remove('dark');
    updateThemeToggleUI(false);
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('titan_theme', isDark ? 'dark' : 'light');
  updateThemeToggleUI(isDark);
  ChartManager.refreshTheme();
  renderTable(tableCache);
}

function updateThemeToggleUI(isDark) {
  const icon = document.getElementById('theme-toggle-icon');
  const label = document.getElementById('theme-toggle-label');
  if (icon && label) {
    if (isDark) {
      icon.className = 'fa-solid fa-sun text-amber-300';
      label.innerText = 'Light';
    } else {
      icon.className = 'fa-solid fa-moon text-sky-200';
      label.innerText = 'Dark';
    }
  }
}

// -------------------------------------------------------------
// TAB SWITCHING
// -------------------------------------------------------------
function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.nav-tab').forEach(el => {
    el.classList.remove('tab-active');
    el.classList.add('text-slate-400');
  });

  const targetTab = document.getElementById(`tab-${tabName}`);
  const targetBtn = document.getElementById(`tab-btn-${tabName}`);
  if (targetTab) targetTab.classList.remove('hidden');
  if (targetBtn) {
    targetBtn.classList.add('tab-active');
    targetBtn.classList.remove('text-slate-400');
  }

  if (tabName === 'descriptive') {
    ChartManager.resizeAll();
  }

  if (tabName === 'database') {
    initDatabaseLockState();
    if (API.isDbUnlocked()) {
      loadTable(currentTable || 'warehouses');
    } else {
      setTimeout(() => {
        const pinInput = document.getElementById('db-pin-input');
        if (pinInput) pinInput.focus();
      }, 100);
    }
  }
}

// -------------------------------------------------------------
// 1. DESCRIPTIVE DASHBOARD
// -------------------------------------------------------------
async function initDescriptiveDashboard() {
  try {
    const data = await API.getDescriptiveSummary();
    if (!data.success) return;

    const { totals, carrierBreakdown, monthlyTrends, topDestinations } = data;

    document.getElementById('kpi-total-cost').innerText = `$${Number(totals.total_freight_cost).toLocaleString()}`;
    document.getElementById('kpi-total-shipments').innerText = totals.total_shipments;
    document.getElementById('kpi-total-units').innerText = Number(totals.total_units_shipped).toLocaleString();
    document.getElementById('kpi-avg-cost').innerText = `$${Number(totals.avg_cost_per_shipment).toLocaleString()}`;
    document.getElementById('kpi-avg-transit').innerText = `${totals.avg_transit_days} Days`;
    document.getElementById('kpi-delay-rate').innerText = `${totals.delay_rate_pct}%`;

    ChartManager.renderDestinationCosts('chartDestinationCosts', topDestinations);
    ChartManager.renderCarrierShare('chartCarrierShare', carrierBreakdown);
    ChartManager.renderMonthlyTrend('chartMonthlyTrend', monthlyTrends);
    ChartManager.renderCarrierDelays('chartCarrierDelays', carrierBreakdown);
  } catch (err) {
    console.error('Error loading descriptive summary:', err);
  }
}

// -------------------------------------------------------------
// 2. PREDICTIVE ANALYTICS
// -------------------------------------------------------------
async function initPredictiveForm() {
  try {
    const options = await API.getPredictiveOptions();
    if (!options || !options.success) return;

    const whSelect = document.getElementById('pred-warehouse');
    whSelect.innerHTML = options.warehouses.map(w => `<option value="${w.warehouse_id}">${w.warehouse_name} (${w.city}, ${w.state})</option>`).join('');

    const hubSelect = document.getElementById('pred-hub');
    hubSelect.innerHTML = options.hubs.map(h => `<option value="${h.hub_id}">${h.hub_name} (${h.city})</option>`).join('');

    const prodSelect = document.getElementById('pred-product');
    prodSelect.innerHTML = options.products.map(p => `<option value="${p.product_id}">${p.model_name} [${p.weight_kg} kg]</option>`).join('');

    calculatePrediction();
  } catch (err) {
    console.error('Error initializing predictive form:', err);
  }
}

async function calculatePrediction() {
  try {
    const payload = {
      origin_warehouse_id: document.getElementById('pred-warehouse').value,
      destination_hub_id: document.getElementById('pred-hub').value,
      product_id: document.getElementById('pred-product').value,
      units: document.getElementById('pred-units').value,
      carrier_name: document.getElementById('pred-carrier').value
    };

    const data = await API.getPredictiveEstimate(payload);
    if (!data.success) return alert(data.error);

    const { inputs, prediction } = data;

    document.getElementById('pred-headline').innerText = `${inputs.units} Units of ${inputs.product} via ${inputs.carrier}`;
    document.getElementById('pred-total-cost').innerText = `$${Number(prediction.predicted_freight_cost).toLocaleString()}`;
    document.getElementById('pred-unit-cost').innerText = `$${prediction.cost_per_motor}`;
    document.getElementById('pred-transit-days').innerText = `${prediction.estimated_transit_days} Days`;
    document.getElementById('pred-delay-risk').innerText = `${prediction.delay_risk_pct}%`;

    document.getElementById('pred-weight').innerText = `${Number(prediction.total_weight_kg).toLocaleString()} kg`;
    document.getElementById('pred-distance').innerText = `${Number(prediction.estimated_distance_km).toLocaleString()} km`;
    document.getElementById('pred-handling').innerText = `$${Number(prediction.handling_fee_usd).toLocaleString()}`;
    document.getElementById('pred-cost-kg').innerText = `$${prediction.cost_per_kg} / kg`;
  } catch (err) {
    console.error('Error running prediction:', err);
  }
}

// -------------------------------------------------------------
// 3. PRESCRIPTIVE DASHBOARD
// -------------------------------------------------------------
async function initPrescriptiveDashboard() {
  try {
    const data = await API.getPrescriptiveOptimization();
    if (!data.success) return;

    document.getElementById('presc-baseline-cost').innerText = `$${Number(data.baselineTotalCost).toLocaleString()}`;
    document.getElementById('presc-optimal-cost').innerText = `$${Number(data.optimalTotalCost).toLocaleString()}`;
    document.getElementById('presc-savings').innerText = `$${Number(data.dollarSavings).toLocaleString()} (${data.pctSavings}%)`;

    // Populate Matrix Table
    const tbody = document.getElementById('matrix-tbody');
    const thead = document.getElementById('matrix-thead');
    tbody.innerHTML = '';

    const { origins, destinations, optimalAllocation, unitCosts } = data;

    if (thead) {
      thead.innerHTML = `<tr class="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
        <th class="p-3 text-left">Origin Warehouse</th>
        ${destinations.map(d => `<th class="p-3">${d.name}<br><span class="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Demand: ${d.demand}</span></th>`).join('')}
        <th class="p-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">Total Supply</th>
      </tr>`;
    }

    origins.forEach((orig, i) => {
      let rowHtml = `<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
        <td class="p-3 text-left font-bold text-slate-800 dark:text-slate-200">${orig.name}</td>`;
      destinations.forEach((dest, j) => {
        const units = optimalAllocation[i][j];
        const cost = unitCosts[i][j];
        const highlight = units > 0 
          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 shadow-sm' 
          : 'text-slate-400 dark:text-slate-600';
        rowHtml += `<td class="p-3">
          <div class="rounded-lg p-1.5 ${highlight}">
            <div>${units > 0 ? units + ' units' : '0'}</div>
            <div class="text-[10px] text-slate-500 dark:text-slate-400 font-normal">[$${cost}/unit]</div>
          </div>
        </td>`;
      });
      rowHtml += `<td class="p-3 bg-slate-100 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200">${orig.supply}</td></tr>`;
      tbody.innerHTML += rowHtml;
    });

    // Populate Directives Table
    const routesTbody = document.getElementById('prescriptive-routes-tbody');
    routesTbody.innerHTML = '';
    data.scheduledRoutes.forEach(r => {
      routesTbody.innerHTML += `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition border-b border-slate-100 dark:border-slate-800">
          <td class="p-3 font-semibold text-slate-800 dark:text-slate-200">${r.origin}</td>
          <td class="p-3 font-semibold text-sky-600 dark:text-sky-400">${r.destination}</td>
          <td class="p-3 font-bold text-slate-900 dark:text-white">${r.units_shipped} motors</td>
          <td class="p-3 text-slate-600 dark:text-slate-400">$${r.unit_cost}.00 / unit</td>
          <td class="p-3 font-bold text-slate-900 dark:text-white">$${Number(r.total_route_cost).toLocaleString()}.00</td>
          <td class="p-3"><span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">OPTIMAL</span></td>
        </tr>
      `;
    });
  } catch (err) {
    console.error('Error loading prescriptive optimization:', err);
  }
}

// -------------------------------------------------------------
// 4. DATABASE CRUD MANAGEMENT
// -------------------------------------------------------------
async function loadTable(tableName) {
  if (!API.isDbUnlocked()) {
    initDatabaseLockState();
    return;
  }

  currentTable = tableName;

  document.querySelectorAll('.table-btn').forEach(btn => {
    if (btn.getAttribute('data-table') === tableName) {
      btn.className = 'table-btn px-3.5 py-1.5 text-xs font-bold rounded-lg bg-sky-600 text-white shadow-sm';
    } else {
      btn.className = 'table-btn px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition';
    }
  });

  try {
    const result = await API.getTableRows(tableName, 500);
    if (result.locked) {
      lockDatabase();
      return;
    }
    if (!result.success) return;

    currentPrimaryKey = result.primaryKey || Object.keys(result.data[0])[0];
    tableCache = result.data;
    renderTable(tableCache);
  } catch (err) {
    console.error('Error loading table data:', err);
  }
}

function renderTable(rows) {
  const thead = document.getElementById('crud-thead');
  const tbody = document.getElementById('crud-tbody');
  const badge = document.getElementById('record-count-badge');

  badge.innerText = `Showing ${rows.length} records`;

  if (!rows || rows.length === 0) {
    thead.innerHTML = '';
    tbody.innerHTML = '<tr><td colspan="10" class="p-6 text-center text-slate-400 dark:text-slate-500">No records found.</td></tr>';
    return;
  }

  const columns = Object.keys(rows[0]);
  
  // Header with Actions column
  thead.innerHTML = `<tr class="bg-slate-50 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
    <th class="p-3 text-center w-24 border-r border-slate-200 dark:border-slate-700">Actions</th>
    ${columns.map(c => `<th class="p-3 border-r border-slate-200 dark:border-slate-700">${c.replace(/_/g, ' ')}</th>`).join('')}
  </tr>`;

  // Rows with Edit and Delete buttons
  tbody.innerHTML = rows.map(r => {
    const idVal = r[currentPrimaryKey];
    return `<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition border-b border-slate-100 dark:border-slate-800">
      <td class="p-2.5 text-center whitespace-nowrap space-x-1.5 border-r border-slate-100 dark:border-slate-800">
        <button onclick="openEditModal(${idVal})" class="px-2 py-1 text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 rounded hover:bg-amber-100 dark:hover:bg-amber-900/40 transition" title="Edit this record">
          <i class="fa-solid fa-pen-to-square"></i> Edit
        </button>
        <button onclick="deleteRecordPrompt(${idVal})" class="px-2 py-1 text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 rounded hover:bg-rose-100 dark:hover:bg-rose-900/40 transition" title="Delete this record">
          <i class="fa-solid fa-trash-can"></i> Del
        </button>
      </td>
      ${columns.map(c => `<td class="p-3 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-50 dark:border-slate-800/40">${r[c] !== null ? r[c] : ''}</td>`).join('')}
    </tr>`;
  }).join('');
}

function filterTableData() {
  const query = document.getElementById('db-search').value.toLowerCase();
  if (!query) {
    renderTable(tableCache);
    return;
  }

  const filtered = tableCache.filter(row => {
    return Object.values(row).some(val => String(val).toLowerCase().includes(query));
  });

  renderTable(filtered);
}

// -------------------------------------------------------------
// ADD RECORD MODAL
// -------------------------------------------------------------
function openAddModal() {
  if (!tableCache || tableCache.length === 0) return;
  const modal = document.getElementById('add-modal');
  const fieldsContainer = document.getElementById('modal-form-fields');
  document.getElementById('modal-title').innerText = `Add New Record: ${currentTable}`;

  const columns = Object.keys(tableCache[0]).filter(c => c !== currentPrimaryKey);

  fieldsContainer.innerHTML = columns.map(col => `
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">${col.replace(/_/g, ' ')}</label>
      <input type="text" name="${col}" required class="w-full text-xs p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-850 focus:outline-none">
    </div>
  `).join('');

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeAddModal() {
  const modal = document.getElementById('add-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

async function submitAddRecord() {
  const form = document.getElementById('add-record-form');
  const formData = new FormData(form);
  const payload = {};
  formData.forEach((val, key) => {
    payload[key] = isNaN(val) || val === '' ? val : Number(val);
  });

  try {
    const result = await API.insertTableRow(currentTable, payload);
    if (result.success) {
      alert(`Record added successfully to ${currentTable}!`);
      closeAddModal();
      loadTable(currentTable);
    } else {
      alert('Error: ' + result.error);
    }
  } catch (err) {
    alert('Failed to insert record: ' + err.message);
  }
}

// -------------------------------------------------------------
// EDIT RECORD MODAL
// -------------------------------------------------------------
function openEditModal(recordId) {
  const record = tableCache.find(r => r[currentPrimaryKey] == recordId);
  if (!record) return alert('Record not found.');

  editingRecordId = recordId;
  const modal = document.getElementById('edit-modal');
  const fieldsContainer = document.getElementById('edit-modal-fields');
  document.getElementById('edit-modal-title').innerText = `Edit ${currentTable} (#${recordId})`;

  const columns = Object.keys(record).filter(c => c !== currentPrimaryKey);

  fieldsContainer.innerHTML = columns.map(col => `
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">${col.replace(/_/g, ' ')}</label>
      <input type="text" name="${col}" value="${record[col] !== null ? record[col] : ''}" required class="w-full text-xs p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-850 focus:outline-none">
    </div>
  `).join('');

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeEditModal() {
  const modal = document.getElementById('edit-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  editingRecordId = null;
}

async function submitEditRecord() {
  if (!editingRecordId) return;
  const form = document.getElementById('edit-record-form');
  const formData = new FormData(form);
  const payload = {};
  formData.forEach((val, key) => {
    payload[key] = isNaN(val) || val === '' ? val : Number(val);
  });

  try {
    const result = await API.updateTableRow(currentTable, editingRecordId, payload);
    if (result.success) {
      alert(`Record #${editingRecordId} updated successfully in ${currentTable}!`);
      closeEditModal();
      loadTable(currentTable);
    } else {
      alert('Error: ' + result.error);
    }
  } catch (err) {
    alert('Failed to update record: ' + err.message);
  }
}

// -------------------------------------------------------------
// DELETE RECORD
// -------------------------------------------------------------
async function deleteRecordPrompt(recordId) {
  if (!confirm(`Are you sure you want to DELETE record #${recordId} from "${currentTable}"?\nThis cannot be undone.`)) {
    return;
  }

  try {
    const result = await API.deleteTableRow(currentTable, recordId);
    if (result.success) {
      alert(`Record #${recordId} successfully deleted.`);
      loadTable(currentTable);
    } else {
      alert('Error: ' + result.error);
    }
  } catch (err) {
    alert('Failed to delete record: ' + err.message);
  }
}

// -------------------------------------------------------------
// DATABASE PASSKEY / PIN SECURITY CONTROLS
// -------------------------------------------------------------
function initDatabaseLockState() {
  const lockScreen = document.getElementById('db-lock-screen');
  const unlockedScreen = document.getElementById('db-unlocked-screen');
  if (!lockScreen || !unlockedScreen) return;

  if (API.isDbUnlocked()) {
    lockScreen.classList.add('hidden');
    unlockedScreen.classList.remove('hidden');
  } else {
    lockScreen.classList.remove('hidden');
    unlockedScreen.classList.add('hidden');
  }
}

function togglePinVisibility() {
  const pinInput = document.getElementById('db-pin-input');
  const icon = document.getElementById('db-pin-toggle-icon');
  if (!pinInput) return;
  if (pinInput.type === 'password') {
    pinInput.type = 'text';
    if (icon) icon.className = 'fa-solid fa-eye-slash text-xs';
  } else {
    pinInput.type = 'password';
    if (icon) icon.className = 'fa-solid fa-eye text-xs';
  }
}

async function submitDbPin() {
  const pinInput = document.getElementById('db-pin-input');
  const errDiv = document.getElementById('db-pin-error');
  const errMsg = document.getElementById('db-pin-error-msg');
  const btn = document.getElementById('db-pin-submit-btn');
  const btnText = document.getElementById('db-pin-btn-text');

  if (!pinInput || !pinInput.value.trim()) return;

  if (errDiv) errDiv.classList.add('hidden');
  if (btn) btn.disabled = true;
  if (btnText) btnText.innerText = 'Verifying Passkey...';

  try {
    const res = await API.verifyDbPin(pinInput.value.trim());
    if (res.success) {
      pinInput.value = '';
      initDatabaseLockState();
      loadTable(currentTable || 'warehouses');
    } else {
      if (errDiv) {
        if (errMsg) errMsg.innerText = res.error || 'Invalid security PIN / passkey.';
        errDiv.classList.remove('hidden');
      }
    }
  } catch (err) {
    if (errDiv) {
      if (errMsg) errMsg.innerText = 'Verification failed: ' + err.message;
      errDiv.classList.remove('hidden');
    }
  } finally {
    if (btn) btn.disabled = false;
    if (btnText) btnText.innerText = 'Unlock Database Tab';
  }
}

function lockDatabase() {
  API.clearDbToken();
  initDatabaseLockState();
  const pinInput = document.getElementById('db-pin-input');
  if (pinInput) pinInput.value = '';
}
