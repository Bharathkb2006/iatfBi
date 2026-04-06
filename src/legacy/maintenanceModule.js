import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { goIatf } from '../utils/spaNavigate.js';

Chart.register(ChartDataLabels);

/* Maintenance Module */
var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var BAR_LABEL = 'Year Avg';
var charts = {};
var maintTeardownFns = [];

  function getMaintenanceData() {
    var defaults = getDefaultMaintenanceData();
    try {
      var stored = JSON.parse(localStorage.getItem('biMaintenanceModuleData'));
      if (!stored || !stored.graphs) return defaults;
      var merged = { graphs: [] };
      var byId = {};
      if (Array.isArray(stored.graphs)) {
        stored.graphs.forEach(function (g) {
          if (g && g.id) byId[g.id] = g;
        });
      }
      defaults.graphs.forEach(function (def) {
        var existing = byId[def.id];
        if (existing) {
          merged.graphs.push(mergeGraph(def, existing));
        } else {
          merged.graphs.push(def);
        }
      });
      return merged;
    } catch (err) {
      return defaults;
    }
  }

  function to12(arr, fallback) {
    var base = Array.isArray(arr) ? arr.slice(0, 12) : [];
    var fb = Array.isArray(fallback) ? fallback : [];
    var out = [];
    for (var i = 0; i < 12; i++) {
      var n = Number(base[i]);
      out.push(Number.isFinite(n) ? n : (Number(fb[i]) || 0));
    }
    return out;
  }

  function mergeGraph(def, existing) {
    var g = {
      id: def.id,
      title: typeof existing.title === 'string' ? existing.title : def.title,
      yAxisLabel: typeof existing.yAxisLabel === 'string' ? existing.yAxisLabel : def.yAxisLabel,
      yAxisMin: typeof existing.yAxisMin === 'number' ? existing.yAxisMin : def.yAxisMin,
      yAxisMax: typeof existing.yAxisMax === 'number' ? existing.yAxisMax : def.yAxisMax
    };
    if (def.bar1Value !== undefined) {
      g.bar1Label = typeof existing.bar1Label === 'string' ? existing.bar1Label : def.bar1Label;
      g.bar2Label = typeof existing.bar2Label === 'string' ? existing.bar2Label : def.bar2Label;
      g.bar1Value = Number(existing.bar1Value);
      g.bar2Value = Number(existing.bar2Value);
      if (!Number.isFinite(g.bar1Value)) g.bar1Value = def.bar1Value;
      if (!Number.isFinite(g.bar2Value)) g.bar2Value = def.bar2Value;
      g.line1Label = typeof existing.line1Label === 'string' ? existing.line1Label : def.line1Label;
      g.line2Label = typeof existing.line2Label === 'string' ? existing.line2Label : def.line2Label;
      g.line1 = to12(existing.line1, def.line1);
      g.line2 = to12(existing.line2, def.line2);
    } else {
      g.series1Label = typeof existing.series1Label === 'string' ? existing.series1Label : def.series1Label;
      g.series2Label = typeof existing.series2Label === 'string' ? existing.series2Label : def.series2Label;
      g.series1 = to12(existing.series1, def.series1);
      g.series2 = to12(existing.series2, def.series2);
    }
    return g;
  }

  function getDefaultMaintenanceData() {
    return {
      graphs: [
        {
          id: 'maint1',
          title: 'Overall Equipment Breakdown',
          yAxisLabel: 'Breakdown Hours',
          yAxisMin: 0,
          yAxisMax: 70,
          bar1Label: 'Breakdown in Hrs',
          bar2Label: 'No of Occurrence',
          bar1Value: 11,
          bar2Value: 6,
          line1Label: 'Breakdown in Hrs (Monthly)',
          line2Label: 'No of Occ (Monthly)',
          line1: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          line2: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        {
          id: 'maint2',
          title: 'Equipment Breakdown by Line (Hrs)',
          yAxisLabel: 'Breakdown Hours',
          yAxisMin: 0,
          yAxisMax: 18,
          series1Label: 'EHCU Assembly Line',
          series2Label: 'Cartridge Assembly Line',
          series1: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          series2: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        {
          id: 'maint3',
          title: 'Equipment Breakdown Occurrence',
          yAxisLabel: 'Breakdown occurrence (nos)',
          yAxisMin: 0,
          yAxisMax: 18,
          series1Label: 'EHCU Assembly Line',
          series2Label: 'Others',
          series1: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          series2: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }
      ]
    };
  }

  function initBackButton() {
    var btn = document.getElementById('maintenanceBackBtn');
    if (!btn) return;
    var onBack = function () {
      goIatf();
    };
    btn.addEventListener('click', onBack);
    maintTeardownFns.push(function () {
      btn.removeEventListener('click', onBack);
    });
  }

  function createGraph1(ctx, d) {
    var labels = [BAR_LABEL].concat(MONTHS);
    var bar1Val = Number(d.bar1Value);
    var bar2Val = Number(d.bar2Value);
    if (!Number.isFinite(bar1Val)) bar1Val = 0;
    if (!Number.isFinite(bar2Val)) bar2Val = 0;
    var line1 = d.line1 || [];
    var line2 = d.line2 || [];
    var yMin = Number(d.yAxisMin);
    var yMax = Number(d.yAxisMax);
    if (!Number.isFinite(yMin)) yMin = 0;
    if (!Number.isFinite(yMax)) yMax = 70;
    if (yMax <= yMin) yMax = yMin + 1;

    var bar1Data = [bar1Val].concat(Array(12).fill(null));
    var bar2Data = [bar2Val].concat(Array(12).fill(null));
    var line1Data = [null].concat(to12(line1, []));
    var line2Data = [null].concat(to12(line2, []));

    var cfg = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: d.bar1Label || 'Bar 1',
            data: bar1Data,
            backgroundColor: '#165da8',
            borderColor: '#165da8',
            borderWidth: 1,
            order: 2,
            yAxisID: 'y'
          },
          {
            label: d.bar2Label || 'Bar 2',
            data: bar2Data,
            backgroundColor: '#c0392b',
            borderColor: '#c0392b',
            borderWidth: 1,
            order: 2,
            yAxisID: 'y'
          },
          {
            type: 'line',
            label: d.line1Label || 'Line 1',
            data: line1Data,
            borderColor: '#165da8',
            backgroundColor: 'rgba(22, 93, 168, 0.05)',
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: '#165da8',
            tension: 0,
            fill: false,
            order: 1,
            yAxisID: 'y'
          },
          {
            type: 'line',
            label: d.line2Label || 'Line 2',
            data: line2Data,
            borderColor: '#c0392b',
            backgroundColor: 'rgba(192, 57, 43, 0.05)',
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: '#c0392b',
            tension: 0,
            fill: false,
            order: 1,
            yAxisID: 'y'
          }
        ]
      },
      options: commonOptions(d.yAxisLabel, yMin, yMax)
    };
    cfg.options.plugins.datalabels.formatter = function (value) {
      if (value === null || value === undefined) return '';
      var n = Number(value);
      return Number.isFinite(n) ? n.toFixed(1) : '';
    };
    return new Chart(ctx, cfg);
  }

  function createStackedBar(ctx, d) {
    var yMin = Number(d.yAxisMin);
    var yMax = Number(d.yAxisMax);
    if (!Number.isFinite(yMin)) yMin = 0;
    if (!Number.isFinite(yMax)) yMax = 18;
    if (yMax <= yMin) yMax = yMin + 1;
    var s1 = to12(d.series1, []);
    var s2 = to12(d.series2, []);

    var opts = commonOptions(d.yAxisLabel, yMin, yMax);
    opts.scales.x.stacked = true;
    opts.scales.y.stacked = true;
    opts.plugins.datalabels = {
      display: function (ctx) {
        var v = ctx.dataset.data[ctx.dataIndex];
        return v !== null && v !== undefined && (Number(v) !== 0 || ctx.datasetIndex === 1);
      },
      anchor: function (ctx) { return ctx.datasetIndex === 1 ? 'end' : 'center'; },
      align: function (ctx) { return ctx.datasetIndex === 1 ? 'top' : 'center'; },
      offset: 2,
      color: '#333',
      font: { size: 11, weight: 'bold', family: "'Inter', sans-serif" },
      formatter: function (value, ctx) {
        if (ctx.datasetIndex === 1) {
          var idx = ctx.dataIndex;
          var total = (Number(ctx.chart.data.datasets[0].data[idx]) || 0) + (Number(ctx.chart.data.datasets[1].data[idx]) || 0);
          return Number.isFinite(total) ? total.toFixed(1) : '';
        }
        var n = Number(value);
        return Number.isFinite(n) ? String(n) : '';
      }
    };

    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: MONTHS,
        datasets: [
          {
            label: d.series1Label || 'Series 1',
            data: s1,
            backgroundColor: '#165da8',
            borderColor: '#165da8',
            borderWidth: 1,
            stack: 'stack0'
          },
          {
            label: d.series2Label || 'Series 2',
            data: s2,
            backgroundColor: '#27ae60',
            borderColor: '#27ae60',
            borderWidth: 1,
            stack: 'stack0'
          }
        ]
      },
      options: opts
    });
  }

  function commonOptions(yLabel, yMin, yMax) {
    var yLabelText = typeof yLabel === 'string' ? yLabel.trim() : '';
    return {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 24, bottom: 10, left: 5, right: 5 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.85)',
          padding: 10,
          titleFont: { size: 12, weight: 'bold' },
          bodyFont: { size: 11 },
          cornerRadius: 6,
          displayColors: true
        },
        datalabels: {
          display: true,
          align: 'top',
          anchor: 'end',
          offset: 0,
          color: '#333',
          font: { size: 11, weight: 'bold', family: "'Inter', sans-serif" }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          min: yMin,
          max: yMax,
          stacked: false,
          ticks: {
            font: { size: 10, family: "'Inter', sans-serif" },
            color: '#666',
            stepSize: Math.max(0.5, (yMax - yMin) / 5),
            callback: function (v) { return Number.isFinite(v) ? v.toFixed(1) : ''; }
          },
          grid: { color: 'rgba(0,0,0,0.06)', drawBorder: false, lineWidth: 1 },
          title: {
            display: Boolean(yLabelText),
            text: yLabelText,
            font: { size: 11, weight: 'bold', family: "'Inter', sans-serif" },
            padding: 8
          }
        },
        x: {
          stacked: false,
          ticks: { font: { size: 10, family: "'Inter', sans-serif" }, color: '#666', maxRotation: 45, autoSkip: false },
          grid: { display: false, drawBorder: false }
        }
      }
    };
  }

  function initCharts() {
    var data = getMaintenanceData();
    if (charts.maintChart1) { charts.maintChart1.destroy(); charts.maintChart1 = null; }
    if (charts.maintChart2) { charts.maintChart2.destroy(); charts.maintChart2 = null; }
    if (charts.maintChart3) { charts.maintChart3.destroy(); charts.maintChart3 = null; }

    var g1 = data.graphs[0];
    setText('maintGraph1Title', g1.title);
    setText('maintGraph1Bar1Label', g1.bar1Label);
    setText('maintGraph1Bar2Label', g1.bar2Label);
    setText('maintGraph1Line1Label', g1.line1Label);
    setText('maintGraph1Line2Label', g1.line2Label);
    var c1 = document.getElementById('maintChart1');
    if (c1) charts.maintChart1 = createGraph1(c1, g1);

    var g2 = data.graphs[1];
    setText('maintGraph2Title', g2.title);
    setText('maintGraph2Series1Label', g2.series1Label);
    setText('maintGraph2Series2Label', g2.series2Label);
    var c2 = document.getElementById('maintChart2');
    if (c2) charts.maintChart2 = createStackedBar(c2, g2);

    var g3 = data.graphs[2];
    setText('maintGraph3Title', g3.title);
    setText('maintGraph3Series1Label', g3.series1Label);
    setText('maintGraph3Series2Label', g3.series2Label);
    var c3 = document.getElementById('maintChart3');
    if (c3) charts.maintChart3 = createStackedBar(c3, g3);
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text || '';
  }

export function teardownMaintenanceModule() {
  maintTeardownFns.forEach(function (fn) {
    try {
      fn();
    } catch (e) { /* ignore */ }
  });
  maintTeardownFns = [];
  ['maintChart1', 'maintChart2', 'maintChart3'].forEach(function (k) {
    if (charts[k]) {
      charts[k].destroy();
      charts[k] = null;
    }
  });
  delete window.updateMaintenanceModule;
}

export function initMaintenanceModule() {
  teardownMaintenanceModule();
  initBackButton();
  initCharts();
  window.updateMaintenanceModule = function () {
    initCharts();
  };
}
