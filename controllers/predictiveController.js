const regressionService = require('../services/regressionService');

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
