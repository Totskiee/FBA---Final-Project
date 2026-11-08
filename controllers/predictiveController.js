const { db } = require('../config/database');
const regressionService = require('../services/regressionService');

exports.getOptions = (req, res) => {
  try {
    const warehouses = db.prepare('SELECT warehouse_id, warehouse_name, city, state, handling_fee_per_unit FROM warehouses ORDER BY warehouse_id ASC LIMIT 50').all();
    const hubs = db.prepare('SELECT hub_id, hub_name, city, state FROM customer_hubs ORDER BY hub_id ASC LIMIT 50').all();
    const products = db.prepare('SELECT product_id, model_name, motor_type, weight_kg, power_rating_kw FROM motor_products ORDER BY product_id ASC LIMIT 50').all();
    const carriers = db.prepare('SELECT DISTINCT carrier_name FROM carriers_routes ORDER BY carrier_name ASC').all();

    res.json({
      success: true,
      warehouses,
      hubs,
      products,
      carriers: carriers.map(c => c.carrier_name)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.estimateCost = (req, res) => {
  try {
    const { origin_warehouse_id, destination_hub_id, product_id, units, carrier_name } = req.body;

    const result = regressionService.predictFreightCost({
      warehouseId: origin_warehouse_id,
      hubId: destination_hub_id,
      productId: product_id,
      units,
      carrierName: carrier_name
    });

    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
