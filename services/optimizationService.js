function solveTransportationProblem() {
  const origins = [
    { id: 1, name: 'Chicago Northern Facility', city: 'Chicago', supply: 650 },
    { id: 2, name: 'Dallas Southern Facility', city: 'Dallas', supply: 800 },
    { id: 3, name: 'Philadelphia Eastern Facility', city: 'Philadelphia', supply: 550 }
  ];

  const destinations = [
    { id: 1, name: 'Atlanta Assembly Hub', city: 'Atlanta', demand: 380 },
    { id: 2, name: 'Detroit Automotive Plant', city: 'Detroit', demand: 450 },
    { id: 3, name: 'Houston Energy Facility', city: 'Houston', demand: 420 },
    { id: 4, name: 'Denver Distribution Center', city: 'Denver', demand: 350 },
    { id: 5, name: 'Phoenix Manufacturing Park', city: 'Phoenix', demand: 400 }
  ];

  // Unit Shipping Cost ($/motor)
  const unitCosts = [
    [34, 18, 52, 48, 62], // Chicago
    [42, 55, 16, 38, 44], // Dallas
    [36, 32, 58, 68, 76]  // Philadelphia
  ];

  // Historical Unoptimized Allocation
  const baselineAllocation = [
    [120, 150, 100, 140, 140],
    [160, 100, 220, 160, 160],
    [100, 200, 100,  50, 100]
  ];

  let baselineTotalCost = 0;
  for (let i = 0; i < origins.length; i++) {
    for (let j = 0; j < destinations.length; j++) {
      baselineTotalCost += baselineAllocation[i][j] * unitCosts[i][j];
    }
  }

  // Cost Minimization Solver
  const supplyRemaining = origins.map(o => o.supply);
  const demandRemaining = destinations.map(d => d.demand);

  const optimalAllocation = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0]
  ];

  const costPairs = [];
  for (let i = 0; i < origins.length; i++) {
    for (let j = 0; j < destinations.length; j++) {
      costPairs.push({ i, j, cost: unitCosts[i][j] });
    }
  }
  costPairs.sort((a, b) => a.cost - b.cost);

  for (const cell of costPairs) {
    const { i, j } = cell;
    if (supplyRemaining[i] > 0 && demandRemaining[j] > 0) {
      const allocate = Math.min(supplyRemaining[i], demandRemaining[j]);
      optimalAllocation[i][j] = allocate;
      supplyRemaining[i] -= allocate;
      demandRemaining[j] -= allocate;
    }
  }

  let optimalTotalCost = 0;
  for (let i = 0; i < origins.length; i++) {
    for (let j = 0; j < destinations.length; j++) {
      optimalTotalCost += optimalAllocation[i][j] * unitCosts[i][j];
    }
  }

  const dollarSavings = baselineTotalCost - optimalTotalCost;
  const pctSavings = parseFloat(((dollarSavings / baselineTotalCost) * 100).toFixed(2));

  const scheduledRoutes = [];
  for (let i = 0; i < origins.length; i++) {
    for (let j = 0; j < destinations.length; j++) {
      const units = optimalAllocation[i][j];
      if (units > 0) {
        scheduledRoutes.push({
          origin: origins[i].name,
          destination: destinations[j].name,
          units_shipped: units,
          unit_cost: unitCosts[i][j],
          total_route_cost: units * unitCosts[i][j]
        });
      }
    }
  }

  return {
    origins,
    destinations,
    unitCosts,
    baselineTotalCost,
    optimalTotalCost,
    dollarSavings,
    pctSavings,
    optimalAllocation,
    scheduledRoutes,
    mathematical_formulation: {
      objective: 'Minimize Z = sum_{i} sum_{j} (c_ij * x_ij)',
      constraints: [
        'Supply Constraint: Chicago <= 650, Dallas <= 800, Philadelphia <= 550',
        'Demand Constraint: Atlanta >= 380, Detroit >= 450, Houston >= 420, Denver >= 350, Phoenix >= 400',
        'Non-negativity: x_ij >= 0 for all routes'
      ]
    }
  };
}

module.exports = {
  solveTransportationProblem
};
