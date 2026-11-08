const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'titanmotor_logistics.db');

// Recreate fresh database file if needed
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

const db = new DatabaseSync(dbPath);

console.log('--- Initializing TitanMotor Database (Clean Architecture) ---');

// 1. Create Tables
db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS warehouses (
    warehouse_id INTEGER PRIMARY KEY AUTOINCREMENT,
    warehouse_code TEXT NOT NULL UNIQUE,
    warehouse_name TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    max_capacity_units INTEGER NOT NULL,
    current_inventory INTEGER NOT NULL,
    handling_fee_per_unit REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS customer_hubs (
    hub_id INTEGER PRIMARY KEY AUTOINCREMENT,
    hub_code TEXT NOT NULL UNIQUE,
    hub_name TEXT NOT NULL,
    client_company TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    monthly_demand_units INTEGER NOT NULL,
    priority_level TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS motor_products (
    product_id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_code TEXT NOT NULL UNIQUE,
    model_name TEXT NOT NULL,
    motor_type TEXT NOT NULL,
    power_rating_kw REAL NOT NULL,
    weight_kg REAL NOT NULL,
    unit_value_usd REAL NOT NULL,
    fragility_tier TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS carriers_routes (
    route_id INTEGER PRIMARY KEY AUTOINCREMENT,
    route_code TEXT NOT NULL UNIQUE,
    carrier_name TEXT NOT NULL,
    origin_city TEXT NOT NULL,
    dest_city TEXT NOT NULL,
    distance_km REAL NOT NULL,
    base_rate_per_km REAL NOT NULL,
    fuel_surcharge_pct REAL NOT NULL,
    reliability_score REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS shipment_transactions (
    shipment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    tracking_number TEXT NOT NULL UNIQUE,
    shipment_date TEXT NOT NULL,
    origin_warehouse_id INTEGER NOT NULL,
    destination_hub_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    units_shipped INTEGER NOT NULL,
    total_weight_kg REAL NOT NULL,
    carrier_name TEXT NOT NULL,
    distance_km REAL NOT NULL,
    transit_days INTEGER NOT NULL,
    freight_cost_usd REAL NOT NULL,
    delay_flag INTEGER NOT NULL,
    FOREIGN KEY (origin_warehouse_id) REFERENCES warehouses(warehouse_id),
    FOREIGN KEY (destination_hub_id) REFERENCES customer_hubs(hub_id),
    FOREIGN KEY (product_id) REFERENCES motor_products(product_id)
  );
`);

console.log('Tables created successfully.');

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, decimals = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

const usCities = [
  { city: 'Chicago', state: 'IL' }, { city: 'Dallas', state: 'TX' }, { city: 'Philadelphia', state: 'PA' },
  { city: 'Atlanta', state: 'GA' }, { city: 'Detroit', state: 'MI' }, { city: 'Houston', state: 'TX' },
  { city: 'Denver', state: 'CO' }, { city: 'Phoenix', state: 'AZ' }, { city: 'Seattle', state: 'WA' },
  { city: 'Cleveland', state: 'OH' }, { city: 'Indianapolis', state: 'IN' }, { city: 'Kansas City', state: 'MO' },
  { city: 'Charlotte', state: 'NC' }, { city: 'Memphis', state: 'TN' }, { city: 'Columbus', state: 'OH' },
  { city: 'Milwaukee', state: 'WI' }, { city: 'Nashville', state: 'TN' }, { city: 'Louisville', state: 'KY' },
  { city: 'Cincinnati', state: 'OH' }, { city: 'Pittsburgh', state: 'PA' }, { city: 'Minneapolis', state: 'MN' },
  { city: 'St. Louis', state: 'MO' }, { city: 'Tampa', state: 'FL' }, { city: 'Baltimore', state: 'MD' },
  { city: 'Salt Lake City', state: 'UT' }
];

// Seed 50 Warehouses
const insertWarehouse = db.prepare(`
  INSERT INTO warehouses (warehouse_code, warehouse_name, city, state, max_capacity_units, current_inventory, handling_fee_per_unit)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);
for (let i = 1; i <= 50; i++) {
  const loc = usCities[(i - 1) % usCities.length];
  const code = `WH-${String(i).padStart(3, '0')}`;
  const name = `${loc.city} Facility ${Math.ceil(i / usCities.length)}`;
  const maxCap = randInt(1500, 6000);
  const currentInv = Math.floor(maxCap * randFloat(0.55, 0.92));
  const fee = randFloat(12.50, 28.00);
  insertWarehouse.run(code, name, loc.city, loc.state, maxCap, currentInv, fee);
}

// Seed 50 Customer Hubs
const clientCompanies = [
  'General Industrial Motors', 'Vanguard EV Assembly', 'Apex Heavy Machinery',
  'Titan Manufacturing Ltd', 'Pinnacle Aerospace Systems', 'Summit Dynamics',
  'Orion Automotive Works', 'Boreas Wind & Turbine Co', 'Nova Energy Plants',
  'Frontier Robotics Group', 'Allied Turbine & Pump', 'Crestline Heavy Transport'
];
const priorities = ['High', 'Critical', 'Standard', 'Flexible'];

const insertHub = db.prepare(`
  INSERT INTO customer_hubs (hub_code, hub_name, client_company, city, state, monthly_demand_units, priority_level)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);
for (let i = 1; i <= 50; i++) {
  const loc = usCities[(i * 3) % usCities.length];
  const code = `HUB-${String(i).padStart(3, '0')}`;
  const client = clientCompanies[(i - 1) % clientCompanies.length];
  const name = `${client} (${loc.city} Hub)`;
  const demand = randInt(200, 1400);
  const priority = sample(priorities);
  insertHub.run(code, name, client, loc.city, loc.state, demand, priority);
}

// Seed 50 Motor Products
const motorTypes = [
  '3-Phase Induction Motor',
  'Brushless DC (BLDC) Motor',
  'High-Torque Servo Motor',
  'Explosion-Proof Motor',
  'Submersible Pump Drive',
  'Synchronous Reluctance Motor',
  'Permanent Magnet AC Motor'
];
const fragilityTiers = ['Standard Industrial', 'Sensitive Electronics', 'Heavy Ruggedized'];

const insertProduct = db.prepare(`
  INSERT INTO motor_products (model_code, model_name, motor_type, power_rating_kw, weight_kg, unit_value_usd, fragility_tier)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);
for (let i = 1; i <= 50; i++) {
  const mType = sample(motorTypes);
  const code = `TM-${mType.substring(0, 3).toUpperCase()}-${String(i).padStart(3, '0')}`;
  const kw = randFloat(5.5, 315.0, 1);
  const weight = randFloat(35.0, kw * 3.8 + 40, 1);
  const unitVal = randFloat(kw * 18 + 450, kw * 35 + 1200, 2);
  const name = `Titan ${mType} ${kw}kW`;
  const fragility = sample(fragilityTiers);
  insertProduct.run(code, name, mType, kw, weight, unitVal, fragility);
}

// Seed 50 Carrier Routes
const carriers = ['SwiftFreight Express', 'ApexHaul Trucking', 'Titan Logistics Fleet', 'NationalRail Cargo', 'TransCoast Freight'];
const insertRoute = db.prepare(`
  INSERT INTO carriers_routes (route_code, carrier_name, origin_city, dest_city, distance_km, base_rate_per_km, fuel_surcharge_pct, reliability_score)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
for (let i = 1; i <= 50; i++) {
  const origin = usCities[randInt(0, usCities.length - 1)].city;
  let dest = usCities[randInt(0, usCities.length - 1)].city;
  while (dest === origin) dest = usCities[randInt(0, usCities.length - 1)].city;
  const code = `RT-${String(i).padStart(3, '0')}`;
  const carrier = sample(carriers);
  const dist = randFloat(220, 2800, 1);
  const baseRate = randFloat(1.45, 3.20);
  const fuel = randFloat(8.5, 18.0);
  const reliability = randFloat(82.0, 99.2, 1);
  insertRoute.run(code, carrier, origin, dest, dist, baseRate, fuel, reliability);
}

// Seed 120 Shipment Transactions
const insertShipment = db.prepare(`
  INSERT INTO shipment_transactions (
    tracking_number, shipment_date, origin_warehouse_id, destination_hub_id,
    product_id, units_shipped, total_weight_kg, carrier_name, distance_km,
    transit_days, freight_cost_usd, delay_flag
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const startDate = new Date('2026-05-01');
for (let i = 1; i <= 120; i++) {
  const tracking = `TRK-${20260000 + i}`;
  const dateObj = new Date(startDate.getTime() + randInt(0, 180) * 24 * 60 * 60 * 1000);
  const dateStr = dateObj.toISOString().split('T')[0];

  const whId = randInt(1, 50);
  const hubId = randInt(1, 50);
  const prodId = randInt(1, 50);
  const units = randInt(10, 85);

  const prodRow = db.prepare('SELECT weight_kg FROM motor_products WHERE product_id = ?').get(prodId);
  const totalWeight = parseFloat((units * prodRow.weight_kg).toFixed(1));

  const carrier = sample(carriers);
  const distance = randFloat(250, 2600, 1);

  let transitDays = Math.max(1, Math.round(distance / randInt(450, 700)) + randInt(0, 1));
  const delayProb = carrier === 'ApexHaul Trucking' ? 0.22 : 0.08;
  const isDelayed = Math.random() < delayProb ? 1 : 0;
  if (isDelayed) transitDays += randInt(1, 4);

  const weightFactor = totalWeight * 0.075;
  const distanceFactor = distance * 1.12;
  const carrierPremium = carrier === 'Titan Logistics Fleet' ? 0.90 : (carrier === 'SwiftFreight Express' ? 1.15 : 1.0);
  const baseCost = (180 + weightFactor + distanceFactor) * carrierPremium;
  const freightCost = parseFloat((baseCost * randFloat(0.95, 1.05)).toFixed(2));

  insertShipment.run(
    tracking, dateStr, whId, hubId, prodId, units, totalWeight,
    carrier, distance, transitDays, freightCost, isDelayed
  );
}

const counts = {
  warehouses: db.prepare('SELECT COUNT(*) AS c FROM warehouses').get().c,
  customer_hubs: db.prepare('SELECT COUNT(*) AS c FROM customer_hubs').get().c,
  motor_products: db.prepare('SELECT COUNT(*) AS c FROM motor_products').get().c,
  carriers_routes: db.prepare('SELECT COUNT(*) AS c FROM carriers_routes').get().c,
  shipment_transactions: db.prepare('SELECT COUNT(*) AS c FROM shipment_transactions').get().c,
};

console.log('--- Database Seeding Complete ---');
console.table(counts);
db.close();

module.exports = { counts };
