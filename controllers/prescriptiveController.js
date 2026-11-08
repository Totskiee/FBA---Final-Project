const optimizationService = require('../services/optimizationService');

exports.optimizeRoutes = (req, res) => {
  try {
    const result = optimizationService.solveTransportationProblem();
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
