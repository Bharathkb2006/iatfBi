import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { goIatf } from '../utils/spaNavigate.js';

Chart.register(ChartDataLabels);

/* Technical Module */
var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var charts = {};
var technicalTeardownFns = [];
  
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
  
    function getDefaultTechnicalData() {
      return {
        graphs: [
          {
            id: 'tech1',
            title: 'Technical Graph 1 (2025-26)',
            yAxisLabel: 'Value',
            yAxisMin: 0,
            yAxisMax: 50,
            barYearLabel: '2024-25',
            barValue: 10,
            lineLabel: 'Actual 25-26',
            line: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          },
          {
            id: 'tech2',
            title: 'Technical Graph 2 (2025-26)',
            yAxisLabel: 'Value',
            yAxisMin: 0,
            yAxisMax: 50,
            barYearLabel: '2024-25',
            barValue: 10,
            lineLabel: 'Actual 25-26',
            line: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          },
          {
            id: 'tech3',
            title: 'Technical Graph 3 (2025-26)',
            yAxisLabel: 'Value',
            yAxisMin: 0,
            yAxisMax: 50,
            barYearLabel: '2024-25',
            barValue: 10,
            lineLabel: 'Actual 25-26',
            line: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          },
          {
            id: 'tech4',
            title: 'Main Assy Capacity Utilisation 2025-26',
            yAxisLabel: 'Production / Utilisation',
            yAxisMin: 0,
            yAxisMax: 16,
            barLabel: 'Actual',
            line1Label: 'Line Capacity',
            line2Label: 'Series',
            line3Label: 'Utilization %',
            bar:   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            line1: [16,16,16,16,16,16,16,16,16,16,16,16],
            line2: [8.85,8.85,8.85,8.85,8.85,8.85,8.85,8.85,8.85,8.85,8.85,8.85],
            line3: [76,66,58,66,36,57,73,76,76,76,76,76]
          }
        ]
      };
    }
  
    function getTechnicalData() {
      var defaults = getDefaultTechnicalData();
      try {
        var stored = JSON.parse(localStorage.getItem('biTechnicalModuleData'));
        if (!stored || !Array.isArray(stored.graphs)) return defaults;
  
        var byId = {};
        stored.graphs.forEach(function (g) {
          if (g && g.id) byId[g.id] = g;
        });
  
        var merged = { graphs: [] };
  
        defaults.graphs.forEach(function (def) {
          var existing = byId[def.id];
          if (!existing) {
            merged.graphs.push(def);
            return;
          }
  
          if (def.barYearLabel) { // graphs 1–3
            var bv = Number(existing.barValue);
            merged.graphs.push({
              id: def.id,
              title: typeof existing.title === 'string' ? existing.title : def.title,
              yAxisLabel: typeof existing.yAxisLabel === 'string' ? existing.yAxisLabel : def.yAxisLabel,
              yAxisMin: typeof existing.yAxisMin === 'number' ? existing.yAxisMin : def.yAxisMin,
              yAxisMax: typeof existing.yAxisMax === 'number' ? existing.yAxisMax : def.yAxisMax,
              barYearLabel: typeof existing.barYearLabel === 'string' ? existing.barYearLabel : def.barYearLabel,
              barValue: Number.isFinite(bv) ? bv : def.barValue,
              lineLabel: typeof existing.lineLabel === 'string' ? existing.lineLabel : def.lineLabel,
              line: to12(existing.line, def.line)
            });
          } else { // graph 4
            merged.graphs.push({
              id: def.id,
              title: typeof existing.title === 'string' ? existing.title : def.title,
              yAxisLabel: typeof existing.yAxisLabel === 'string' ? existing.yAxisLabel : def.yAxisLabel,
              yAxisMin: typeof existing.yAxisMin === 'number' ? existing.yAxisMin : def.yAxisMin,
              yAxisMax: typeof existing.yAxisMax === 'number' ? existing.yAxisMax : def.yAxisMax,
              barLabel: typeof existing.barLabel === 'string' ? existing.barLabel : def.barLabel,
              line1Label: typeof existing.line1Label === 'string' ? existing.line1Label : def.line1Label,
              line2Label: typeof existing.line2Label === 'string' ? existing.line2Label : def.line2Label,
              line3Label: typeof existing.line3Label === 'string' ? existing.line3Label : def.line3Label,
              bar:   to12(existing.bar,   def.bar),
              line1: to12(existing.line1, def.line1),
              line2: to12(existing.line2, def.line2),
              line3: to12(existing.line3, def.line3)
            });
          }
        });
  
        return merged;
      } catch (e) {
        return defaults;
      }
    }
  
    function initBackButton() {
      var btn = document.getElementById('technicalBackBtn');
      if (!btn) return;
      var onBack = function () { goIatf(); };
      btn.addEventListener('click', onBack);
      technicalTeardownFns.push(function () { btn.removeEventListener('click', onBack); });
    }
  
    function commonOptions(yLabel, yMin, yMax) {
      if (!Number.isFinite(yMin)) yMin = 0;
      if (!Number.isFinite(yMax) || yMax <= yMin) yMax = yMin + 1;
      var labelText = typeof yLabel === 'string' ? yLabel.trim() : '';
  
      return {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 20, bottom: 10, left: 5, right: 5 } },
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
            color: function (ctx) {
              return ctx.dataset.borderColor || ctx.dataset.backgroundColor || '#333';
            },
            font: { size: 11, weight: 'bold', family: "'Inter', sans-serif" },
            formatter: function (v, ctx) {
              if (v === null || v === undefined) return '';
              var n = Number(v);
              if (!Number.isFinite(n)) return '';
              // Use percent style for right-axis (utilization) datasets
              if (ctx && ctx.dataset && ctx.dataset.yAxisID === 'y1') {
                return n.toFixed(0) + '%';
              }
              return n.toFixed(1);
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            min: yMin,
            max: yMax,
            ticks: {
              font: { size: 10, family: "'Inter', sans-serif" },
              color: '#666',
              callback: function (v) { return Number.isFinite(v) ? v.toFixed(1) : ''; }
            },
            grid: { color: 'rgba(0,0,0,0.06)', drawBorder: false, lineWidth: 1 },
            title: {
              display: Boolean(labelText),
              text: labelText,
              font: { size: 11, weight: 'bold', family: "'Inter', sans-serif" },
              padding: 8
            }
          },
          x: {
            ticks: {
              font: { size: 10, family: "'Inter', sans-serif" },
              color: '#666',
              maxRotation: 45,
              autoSkip: false
            },
            grid: { display: false, drawBorder: false }
          }
        }
      };
    }
  
    function createBarLineChart(ctx, d) {
      if (charts[ctx.id]) { charts[ctx.id].destroy(); charts[ctx.id] = null; }
  
      var yMin = Number(d.yAxisMin);
      var yMax = Number(d.yAxisMax);
      var barVal = Number(d.barValue);
      if (!Number.isFinite(barVal)) barVal = 0;
      var yearLabel = typeof d.barYearLabel === 'string' ? d.barYearLabel.trim() : '2024-25';
      var lineData = to12(d.line, []);
  
      var labels = [yearLabel].concat(MONTHS);
      var barData = [barVal].concat(Array(12).fill(null));
      var lineSeriesData = [null].concat(lineData);
  
      var opts = commonOptions(d.yAxisLabel, yMin, yMax);
  
      charts[ctx.id] = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: yearLabel,
              data: barData,
              backgroundColor: '#FFA500',
              borderColor: '#FFA500',
              borderWidth: 1,
              order: 2,
              yAxisID: 'y'
            },
            {
              type: 'line',
              label: d.lineLabel || 'Actual',
              data: lineSeriesData,
              borderColor: '#165da8',
              backgroundColor: 'rgba(22, 93, 168, 0.05)',
              borderWidth: 2,
              pointRadius: 3,
              pointBackgroundColor: '#165da8',
              pointBorderColor: '#165da8',
              tension: 0,
              fill: false,
              order: 1,
              yAxisID: 'y'
            }
          ]
        },
        options: opts
      });
    }
  
    function createCapacityChart(ctx, d) {
      if (charts[ctx.id]) { charts[ctx.id].destroy(); charts[ctx.id] = null; }

      var yMin = Number(d.yAxisMin);
      var yMax = Number(d.yAxisMax);

      var barData  = to12(d.bar,  []);
      var line1    = to12(d.line1, []);
      var line2    = to12(d.line2, []);
      var line3    = to12(d.line3, []);

      var opts = commonOptions(d.yAxisLabel, yMin, yMax);

      // Left Y-axis: production numbers
      opts.scales.y.position = 'left';

      // Right Y-axis: utilisation percentage
      var utilLabelText = (d.line3Label || 'Utilization %').trim();
      opts.scales.y1 = {
        type: 'linear',
        position: 'right',
        min: 0,
        max: 100,
        ticks: {
          font: { size: 10, family: "'Inter', sans-serif" },
          color: '#666',
          callback: function (v) {
            return Number.isFinite(v) ? v.toFixed(0) + '%' : '';
          }
        },
        grid: {
          drawOnChartArea: false,
          drawBorder: false
        },
        title: {
          display: Boolean(utilLabelText),
          text: utilLabelText,
          font: { size: 11, weight: 'bold', family: "'Inter', sans-serif" },
          padding: 8
        }
      };

      charts[ctx.id] = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: MONTHS,
          datasets: [
            {
              type: 'bar',
              label: d.barLabel || 'Actual',
              data: barData,
              backgroundColor: 'rgba(22,93,168,0.22)', // semi-transparent so lines stay visible
              borderColor: '#165da8',
              borderWidth: 1,
              yAxisID: 'y',
              order: 0,
              z: 0,
              datalabels: {
                display: false
              }
            },
            {
              type: 'line',
              label: d.line1Label || 'Line Capacity',
              data: line1,
              borderColor: '#165da8',
              backgroundColor: 'rgba(22,93,168,0.05)',
              borderWidth: 2,
              pointRadius: 3,
              pointBackgroundColor: '#165da8',
              tension: 0,
              fill: false,
              yAxisID: 'y',
              order: 2,
              z: 10
            },
            {
              type: 'line',
              label: d.line2Label || 'Series',
              data: line2,
              borderColor: '#FFA500',
              backgroundColor: 'rgba(255,165,0,0.12)',
              borderWidth: 2,
              pointRadius: 3,
              pointBackgroundColor: '#FFA500',
              tension: 0,
              fill: false,
              yAxisID: 'y',
              order: 2,
              z: 10
            },
            {
              type: 'line',
              label: d.line3Label || 'Utilization %',
              data: line3,
              borderColor: '#27ae60',
              backgroundColor: 'rgba(39,174,96,0.05)',
              borderWidth: 2,
              pointRadius: 3,
              pointBackgroundColor: '#27ae60',
              tension: 0,
              fill: false,
              yAxisID: 'y1',
              order: 3,
              z: 20
            }
          ]
        },
        options: opts
      });
    }
  
    function setText(id, text) {
      var el = document.getElementById(id);
      if (el) el.textContent = text || '';
    }
  
    function initCharts() {
      var data = getTechnicalData();
      var g1 = data.graphs[0];
      var g2 = data.graphs[1];
      var g3 = data.graphs[2];
      var g4 = data.graphs[3];
  
      setText('techGraph1Title', g1.title);
      setText('techGraph2Title', g2.title);
      setText('techGraph3Title', g3.title);
      setText('techGraph4Title', g4.title);
  
      setText('techGraph1BarLabel', g1.barYearLabel || '2024-25');
      setText('techGraph1LineLabel', g1.lineLabel || 'Actual');
      setText('techGraph2BarLabel', g2.barYearLabel || '2024-25');
      setText('techGraph2LineLabel', g2.lineLabel || 'Actual');
      setText('techGraph3BarLabel', g3.barYearLabel || '2024-25');
      setText('techGraph3LineLabel', g3.lineLabel || 'Actual');
  
      setText('techGraph4BarLabel',  g4.barLabel  || 'Actual');
      setText('techGraph4Line1Label', g4.line1Label || 'Line Capacity');
      setText('techGraph4Line2Label', g4.line2Label || 'Series');
      setText('techGraph4Line3Label', g4.line3Label || 'Utilization %');
  
      var c1 = document.getElementById('techChart1');
      var c2 = document.getElementById('techChart2');
      var c3 = document.getElementById('techChart3');
      var c4 = document.getElementById('techChart4');
  
      if (c1) createBarLineChart(c1, g1);
      if (c2) createBarLineChart(c2, g2);
      if (c3) createBarLineChart(c3, g3);
      if (c4) createCapacityChart(c4, g4);
    }
  
export function teardownTechnicalModule() {
  technicalTeardownFns.forEach(function (fn) {
    try { fn(); } catch (e) { /* ignore */ }
  });
  technicalTeardownFns = [];
  ['techChart1', 'techChart2', 'techChart3', 'techChart4'].forEach(function (k) {
    if (charts[k]) {
      charts[k].destroy();
      charts[k] = null;
    }
  });
  delete window.updateTechnicalModule;
}

export function initTechnicalModule() {
  teardownTechnicalModule();
  initBackButton();
  initCharts();
  window.updateTechnicalModule = function () {
    initCharts();
  };
}
