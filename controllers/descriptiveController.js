const { db } = require('../config/database');

exports.getSummary = (req, res) => {
  try {
    const totals = db.prepare(`
      SELECT 
        COUNT(*) as total_shipments,
        ROUND(SUM(freight_cost_usd), 2) as total_freight_cost,
        ROUND(AVG(freight_cost_usd), 2) as avg_cost_per_shipment,
        ROUND(SUM(total_weight_kg), 1) as total_weight_shipped,
        ROUND(AVG(transit_days), 1) as avg_transit_days,
        SUM(units_shipped) as total_units_shipped,
        ROUND(AVG(delay_flag) * 100, 1) as delay_rate_pct
      FROM shipment_transactions
    `).get();

    const carrierBreakdown = db.prepare(`
      SELECT 
        carrier_name,
        COUNT(*) as shipment_count,
        ROUND(SUM(freight_cost_usd), 2) as total_cost,
        ROUND(AVG(freight_cost_usd), 2) as avg_cost,
        ROUND(AVG(delay_flag) * 100, 1) as delay_pct,
        ROUND(AVG(transit_days), 1) as avg_days
      FROM shipment_transactions
      GROUP BY carrier_name
      ORDER BY total_cost DESC
    `).all();

    const monthlyTrends = db.prepare(`
      SELECT 
        SUBSTR(shipment_date, 1, 7) as month_label,
        COUNT(*) as shipments,
        ROUND(SUM(freight_cost_usd), 2) as monthly_cost,
        SUM(units_shipped) as total_units,
        ROUND(AVG(freight_cost_usd / total_weight_kg), 3) as cost_per_kg
      FROM shipment_transactions
      GROUP BY SUBSTR(shipment_date, 1, 7)
      ORDER BY month_label ASC
    `).all();

    const topDestinations = db.prepare(`
      SELECT 
        h.hub_name,
        h.city,
        h.priority_level,
        COUNT(s.shipment_id) as shipment_count,
        ROUND(SUM(s.freight_cost_usd), 2) as total_freight_cost,
        SUM(s.units_shipped) as units_received
      FROM customer_hubs h
      LEFT JOIN shipment_transactions s ON h.hub_id = s.destination_hub_id
      GROUP BY h.hub_id
      ORDER BY shipment_count DESC
      LIMIT 8
    `).all();

    res.json({
      success: true,
      totals,
      carrierBreakdown,
      monthlyTrends,
      topDestinations
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
