// Chart.js Manager - Theme-Aware (Light & Dark Mode)
const ChartManager = {
  instances: {},
  cachedData: {},

  isDark() {
    return document.documentElement.classList.contains('dark');
  },

  getColors() {
    const dark = this.isDark();
    return {
      textColor: dark ? '#94a3b8' : '#64748b',
      gridColor: dark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9',
      borderColor: dark ? '#1e293b' : '#ffffff',
      tooltipBg: dark ? '#1e293b' : '#0f172a',
      tooltipText: dark ? '#f8fafc' : '#ffffff'
    };
  },

  renderDestinationCosts(canvasId, destinations) {
    if (destinations) this.cachedData.destinations = destinations;
    const data = destinations || this.cachedData.destinations;
    if (!data) return;

    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) return;
    if (this.instances[canvasId]) this.instances[canvasId].destroy();

    const colors = this.getColors();
    const labels = data.map(d => d.city || d.hub_name.split('(')[0].trim());
    const costs = data.map(d => d.total_freight_cost || 0);

    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Freight Spend ($ USD)',
          data: costs,
          backgroundColor: '#0284c7',
          hoverBackgroundColor: '#0369a1',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: colors.tooltipBg,
            titleColor: colors.tooltipText,
            bodyColor: colors.tooltipText,
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: ctx => ` Spend: $${Number(ctx.raw).toLocaleString()}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: colors.textColor, font: { size: 11, weight: '500' } }
          },
          y: {
            beginAtZero: true,
            grid: { color: colors.gridColor },
            ticks: {
              color: colors.textColor,
              font: { size: 11 },
              callback: v => '$' + v.toLocaleString()
            }
          }
        }
      }
    });
  },

  renderCarrierShare(canvasId, carriers) {
    if (carriers) this.cachedData.carriers = carriers;
    const data = carriers || this.cachedData.carriers;
    if (!data) return;

    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) return;
    if (this.instances[canvasId]) this.instances[canvasId].destroy();

    const colors = this.getColors();
    const labels = data.map(c => c.carrier_name);
    const amounts = data.map(c => c.total_cost);

    this.instances[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: amounts,
          backgroundColor: ['#0284c7', '#0ea5e9', '#6366f1', '#f59e0b', '#10b981'],
          borderWidth: 2,
          borderColor: colors.borderColor,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 14,
              color: colors.textColor,
              font: { size: 11, weight: '600' }
            }
          },
          tooltip: {
            backgroundColor: colors.tooltipBg,
            titleColor: colors.tooltipText,
            bodyColor: colors.tooltipText,
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: ctx => ` ${ctx.label}: $${Number(ctx.raw).toLocaleString()}`
            }
          }
        }
      }
    });
  },

  renderMonthlyTrend(canvasId, trends) {
    if (trends) this.cachedData.trends = trends;
    const data = trends || this.cachedData.trends;
    if (!data) return;

    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) return;
    if (this.instances[canvasId]) this.instances[canvasId].destroy();

    const colors = this.getColors();
    const labels = data.map(t => t.month_label);
    const costs = data.map(t => t.monthly_cost);

    this.instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Monthly Shipping Cost ($)',
          data: costs,
          borderColor: '#0284c7',
          backgroundColor: this.isDark() ? 'rgba(2, 132, 199, 0.15)' : 'rgba(2, 132, 199, 0.08)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointRadius: 4.5,
          pointBackgroundColor: '#0284c7',
          pointBorderColor: colors.borderColor,
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: colors.tooltipBg,
            titleColor: colors.tooltipText,
            bodyColor: colors.tooltipText,
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: ctx => ` Total: $${Number(ctx.raw).toLocaleString()}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: colors.textColor, font: { size: 11 } }
          },
          y: {
            grid: { color: colors.gridColor },
            ticks: {
              color: colors.textColor,
              font: { size: 11 },
              callback: v => '$' + v.toLocaleString()
            }
          }
        }
      }
    });
  },

  renderCarrierDelays(canvasId, carriers) {
    if (carriers) this.cachedData.carriers = carriers;
    const data = carriers || this.cachedData.carriers;
    if (!data) return;

    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) return;
    if (this.instances[canvasId]) this.instances[canvasId].destroy();

    const colors = this.getColors();
    const labels = data.map(c => c.carrier_name.split(' ')[0]);
    const delayRates = data.map(c => c.delay_pct);
    const avgDays = data.map(c => c.avg_days);

    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Delay Rate (%)',
            data: delayRates,
            backgroundColor: '#f43f5e',
            borderRadius: 4
          },
          {
            label: 'Avg Transit (Days)',
            data: avgDays,
            backgroundColor: '#f59e0b',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { boxWidth: 12, color: colors.textColor, font: { size: 11, weight: '600' } }
          },
          tooltip: {
            backgroundColor: colors.tooltipBg,
            titleColor: colors.tooltipText,
            bodyColor: colors.tooltipText,
            padding: 10,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: colors.textColor }
          },
          y: {
            beginAtZero: true,
            grid: { color: colors.gridColor },
            ticks: { color: colors.textColor }
          }
        }
      }
    });
  },

  refreshTheme() {
    if (this.cachedData.destinations) {
      this.renderDestinationCosts('chartDestinationCosts');
    }
    if (this.cachedData.carriers) {
      this.renderCarrierShare('chartCarrierShare');
      this.renderCarrierDelays('chartCarrierDelays');
    }
    if (this.cachedData.trends) {
      this.renderMonthlyTrend('chartMonthlyTrend');
    }
  },

  resizeAll() {
    Object.values(this.instances).forEach(chart => chart.resize());
  }
};
