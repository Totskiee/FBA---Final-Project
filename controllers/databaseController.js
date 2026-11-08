const { db } = require('../config/database');
const { verifyPin, createPinToken } = require('../services/pinService');

const ALLOWED_TABLES = ['warehouses', 'customer_hubs', 'motor_products', 'carriers_routes', 'shipment_transactions'];

const PRIMARY_KEYS = {
  warehouses: 'warehouse_id',
  customer_hubs: 'hub_id',
  motor_products: 'product_id',
  carriers_routes: 'route_id',
  shipment_transactions: 'shipment_id'
};

exports.getTablesList = (req, res) => {
  try {
    const list = ALLOWED_TABLES.map(table => ({
      name: table,
      primaryKey: PRIMARY_KEYS[table],
      count: db.prepare(`SELECT COUNT(*) as c FROM ${table}`).get().c
    }));
    res.json({ success: true, tables: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getTableData = (req, res) => {
  const { tableName } = req.params;
  if (!ALLOWED_TABLES.includes(tableName)) {
    return res.status(400).json({ success: false, error: 'Invalid table requested' });
  }

  try {
    const limit = parseInt(req.query.limit) || 500;
    const pk = PRIMARY_KEYS[tableName];
    const rows = db.prepare(`SELECT * FROM ${tableName} ORDER BY ${pk} ASC LIMIT ?`).all(limit);
    res.json({ success: true, table: tableName, primaryKey: pk, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.insertRecord = (req, res) => {
  const { tableName } = req.params;
  if (!ALLOWED_TABLES.includes(tableName)) {
    return res.status(400).json({ success: false, error: 'Invalid table requested' });
  }

  const pk = PRIMARY_KEYS[tableName];
  try {
    const payload = { ...req.body };

    // Calculate next consecutive ID based on current MAX ID in the table
    if (!payload[pk]) {
      const maxRow = db.prepare(`SELECT COALESCE(MAX(${pk}), 0) as maxId FROM ${tableName}`).get();
      const nextId = (maxRow ? maxRow.maxId : 0) + 1;
      payload[pk] = nextId;
    }

    const keys = Object.keys(payload);
    const values = Object.values(payload);
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})`;

    db.prepare(sql).run(...values);

    // Keep sqlite_sequence synchronized with current MAX ID
    const maxRow = db.prepare(`SELECT COALESCE(MAX(${pk}), 0) as maxId FROM ${tableName}`).get();
    db.prepare(`UPDATE sqlite_sequence SET seq = ? WHERE name = ?`).run(maxRow.maxId, tableName);

    res.json({ success: true, message: `Successfully inserted record #${payload[pk]} into ${tableName}`, id: payload[pk] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateRecord = (req, res) => {
  const { tableName, id } = req.params;
  if (!ALLOWED_TABLES.includes(tableName)) {
    return res.status(400).json({ success: false, error: 'Invalid table requested' });
  }

  const pk = PRIMARY_KEYS[tableName];
  try {
    const keys = Object.keys(req.body).filter(k => k !== pk);
    const values = keys.map(k => req.body[k]);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const sql = `UPDATE ${tableName} SET ${setClause} WHERE ${pk} = ?`;

    db.prepare(sql).run(...values, id);
    res.json({ success: true, message: `Record ${id} updated in ${tableName}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteRecord = (req, res) => {
  const { tableName, id } = req.params;
  if (!ALLOWED_TABLES.includes(tableName)) {
    return res.status(400).json({ success: false, error: 'Invalid table requested' });
  }

  const pk = PRIMARY_KEYS[tableName];
  try {
    const sql = `DELETE FROM ${tableName} WHERE ${pk} = ?`;
    db.prepare(sql).run(id);

    // Synchronize sqlite_sequence to the new MAX ID so future inserts continue consecutively without gaps
    const maxRow = db.prepare(`SELECT COALESCE(MAX(${pk}), 0) as maxId FROM ${tableName}`).get();
    const currentMax = maxRow ? maxRow.maxId : 0;
    db.prepare(`UPDATE sqlite_sequence SET seq = ? WHERE name = ?`).run(currentMax, tableName);

    res.json({ success: true, message: `Record ${id} deleted from ${tableName}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.verifyPin = (req, res) => {
  const { pin } = req.body || {};
  if (!verifyPin(pin)) {
    return res.status(401).json({
      success: false,
      error: 'Invalid security PIN / passkey. Database remains locked.'
    });
  }

  const token = createPinToken();
  res.json({
    success: true,
    message: 'Passkey verified successfully. Access granted to database entities.',
    token
  });
};
