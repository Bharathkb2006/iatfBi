import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { goIatf } from '../utils/spaNavigate.js';

Chart.register(ChartDataLabels);

/* Quality Module */
var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

var charts = {};
var qualityTeardownFns = [];

  // Get data from localStorage
  function getQualityData() {
    var defaults = getDefaultQualityData();
    try {
      var stored = JSON.parse(localStorage.getItem('biQualityModuleData'));
      if (!stored || !Array.isArray(stored.graphs)) {
        return defaults;
      }

      // Normalize to always have 11 graphs; merge stored with defaults by id
      var merged = { graphs: [] };
      var byId = {};
      stored.graphs.forEach(function (g) {
        if (g && g.id) byId[g.id] = g;
      });

      function to12NumberArray(arr, fallbackArr) {
        var base = Array.isArray(arr) ? arr.slice(0, 12) : [];
        var out = [];
        for (var i = 0; i < 12; i++) {
          var raw = typeof base[i] === 'undefined' ? null : base[i];
          var n = Number(raw);
          if (!Number.isFinite(n)) {
            var fb = Array.isArray(fallbackArr) ? Number(fallbackArr[i]) : 0;
            out.push(Number.isFinite(fb) ? fb : 0);
          } else {
            out.push(n);
          }
        }
        return out;
      }

      defaults.graphs.forEach(function (def) {
        var existing = byId[def.id];
        if (existing) {
          var singleLine = def.singleLine === true;
          var item = {
            id: def.id,
            title: typeof existing.title === 'string' ? existing.title : def.title,
            yAxisLabel: typeof existing.yAxisLabel === 'string' ? existing.yAxisLabel : def.yAxisLabel,
            yAxisUnit: typeof existing.yAxisUnit === 'string' ? existing.yAxisUnit : def.yAxisUnit,
            yAxisMin: typeof existing.yAxisMin === 'number' ? existing.yAxisMin : def.yAxisMin,
            yAxisMax: typeof existing.yAxisMax === 'number' ? existing.yAxisMax : def.yAxisMax,
            singleLine: singleLine
          };
          if (singleLine) {
            item.lineLabel = typeof existing.lineLabel === 'string' ? existing.lineLabel : (def.lineLabel || 'Value');
            item.value = to12NumberArray(existing.value, def.value);
          } else {
            item.target = to12NumberArray(existing.target, def.target);
            item.actual = to12NumberArray(existing.actual, def.actual);
          }
          merged.graphs.push(item);
        } else {
          merged.graphs.push(def);
        }
      });

      return merged;
    } catch (err) {
      return defaults;
    }
  }

  // Default quality data structure (4 + 4 + 3 single-line graphs on slide 3)
  function getDefaultQualityData() {
    var twoLineDefaults = [
      { id: 'graph1', title: 'Quality Graph 1 (2025-26)', yAxisLabel: 'No. of Occasions', yAxisUnit: '', yAxisMin: 0, yAxisMax: 50, target: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10], actual: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { id: 'graph2', title: 'Quality Graph 2 (2025-26)', yAxisLabel: 'No. of Occasions', yAxisUnit: '', yAxisMin: 0, yAxisMax: 50, target: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10], actual: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { id: 'graph3', title: 'Quality Graph 3 (2025-26)', yAxisLabel: 'No. of Occasions', yAxisUnit: '', yAxisMin: 0, yAxisMax: 50, target: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10], actual: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { id: 'graph4', title: 'Quality Graph 4 (2025-26)', yAxisLabel: 'No. of Occasions', yAxisUnit: '', yAxisMin: 0, yAxisMax: 50, target: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10], actual: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { id: 'graph5', title: 'Quality Graph 5 (2025-26)', yAxisLabel: 'No. of Occasions', yAxisUnit: '', yAxisMin: 0, yAxisMax: 50, target: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10], actual: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { id: 'graph6', title: 'Quality Graph 6 (2025-26)', yAxisLabel: 'No. of Occasions', yAxisUnit: '', yAxisMin: 0, yAxisMax: 50, target: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10], actual: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { id: 'graph7', title: 'Quality Graph 7 (2025-26)', yAxisLabel: 'No. of Occasions', yAxisUnit: '', yAxisMin: 0, yAxisMax: 50, target: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10], actual: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { id: 'graph8', title: 'Quality Graph 8 (2025-26)', yAxisLabel: 'No. of Occasions', yAxisUnit: '', yAxisMin: 0, yAxisMax: 50, target: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10], actual: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
    ];
    var singleLineDefaults = [
      { id: 'graph9', title: 'Quality Single Line Chart 1 (2025-26)', yAxisLabel: 'Value', yAxisUnit: '', yAxisMin: 0, yAxisMax: 100, singleLine: true, lineLabel: 'Value', value: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { id: 'graph10', title: 'Quality Single Line Chart 2 (2025-26)', yAxisLabel: 'Value', yAxisUnit: '', yAxisMin: 0, yAxisMax: 100, singleLine: true, lineLabel: 'Value', value: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { id: 'graph11', title: 'Quality Single Line Chart 3 (2025-26)', yAxisLabel: 'Value', yAxisUnit: '', yAxisMin: 0, yAxisMax: 100, singleLine: true, lineLabel: 'Value', value: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
    ];
    return { graphs: twoLineDefaults.concat(singleLineDefaults) };
  }

  function initCarousel() {
    var currentSlide = 1;
    var slides = document.querySelectorAll('.supply-module-main .quality-carousel .carousel-slide');
    var indicatorsRoot = document.querySelector('.supply-module-main .quality-carousel + .carousel-nav .carousel-indicators');
    if (!indicatorsRoot) {
      indicatorsRoot = document.querySelector('.supply-module-main .carousel-indicators');
    }
    var totalSlides = slides.length || 1;

    function showSlide(slideNum) {
      slides.forEach(function (slide) { slide.classList.remove('active'); });
      if (indicatorsRoot) {
        indicatorsRoot.querySelectorAll('.indicator').forEach(function (indicator) {
          indicator.classList.remove('active');
        });
      }

      var activeSlide = document.querySelector('.supply-module-main .quality-carousel [data-slide="' + slideNum + '"]');
      if (activeSlide) activeSlide.classList.add('active');

      var activeIndicator = indicatorsRoot && indicatorsRoot.querySelector('.indicator[data-slide="' + slideNum + '"]');
      if (activeIndicator) activeIndicator.classList.add('active');

      currentSlide = slideNum;
    }

    function onIndRootClick(e) {
      var t = e.target.closest('.indicator');
      if (!t || !indicatorsRoot || !indicatorsRoot.contains(t)) return;
      showSlide(parseInt(t.getAttribute('data-slide'), 10));
    }
    if (indicatorsRoot) {
      indicatorsRoot.addEventListener('click', onIndRootClick);
      qualityTeardownFns.push(function () {
        indicatorsRoot.removeEventListener('click', onIndRootClick);
      });
    }

    var onKey = function (e) {
      if (e.key === 'ArrowLeft') {
        showSlide(currentSlide === 1 ? totalSlides : (currentSlide - 1));
      } else if (e.key === 'ArrowRight') {
        showSlide(currentSlide === totalSlides ? 1 : (currentSlide + 1));
      }
    };
    document.addEventListener('keydown', onKey);
    qualityTeardownFns.push(function () { document.removeEventListener('keydown', onKey); });

    var carousel = document.querySelector('.supply-module-main .quality-carousel');
    var onCar = function (e) {
      if (e.target === carousel || e.currentTarget === carousel) {
        var rect = carousel.getBoundingClientRect();
        var clickX = e.clientX - rect.left;
        var centerX = rect.width / 2;
        if (clickX < centerX) {
          showSlide(currentSlide === 1 ? totalSlides : (currentSlide - 1));
        } else {
          showSlide(currentSlide === totalSlides ? 1 : (currentSlide + 1));
        }
      }
    };
    if (carousel) {
      carousel.addEventListener('click', onCar);
      qualityTeardownFns.push(function () { carousel.removeEventListener('click', onCar); });
    }

    showSlide(1);
  }

  function initBackButton() {
    var backBtn = document.getElementById('qualityBackBtn');
    if (!backBtn) return;
    var onBack = function () { goIatf(); };
    backBtn.addEventListener('click', onBack);
    qualityTeardownFns.push(function () { backBtn.removeEventListener('click', onBack); });
  }

  // Build common chart options (same style as supply module)
  function getCommonOptions(graphData) {
    var yMinRaw = typeof graphData.yAxisMin === 'number' ? graphData.yAxisMin : 0;
    var yMaxRaw = typeof graphData.yAxisMax === 'number' ? graphData.yAxisMax : 50;
    var yMin = Number.isFinite(yMinRaw) ? yMinRaw : 0;
    var yMax = Number.isFinite(yMaxRaw) ? yMaxRaw : 50;
    if (yMax === yMin) yMax = yMin + 1;
    if (yMax < yMin) {
      var tmp = yMin;
      yMin = yMax;
      yMax = tmp;
    }
    var yLabel = typeof graphData.yAxisLabel === 'string' ? graphData.yAxisLabel.trim() : '';

    return {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: { top: 20, bottom: 10, left: 5, right: 5 }
      },
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
          backgroundColor: 'transparent',
          borderRadius: 3,
          color: function (context) {
            var dataset = context.dataset;
            return dataset.borderColor || '#000';
          },
          font: { size: 12, weight: 'bold', family: "'Inter', sans-serif" },
          formatter: function (value) {
            if (value === null || value === undefined) return '';
            var n = Number(value);
            if (!Number.isFinite(n)) return '';
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
            stepSize: Math.max(1, Math.round((yMax - yMin) / 4)),
            callback: function (value) {
              var n = Number(value);
              if (!Number.isFinite(n)) return '';
              return n.toFixed(1);
            }
          },
          grid: {
            color: 'rgba(0,0,0,0.06)',
            drawBorder: false,
            lineWidth: 1
          },
          title: {
            display: Boolean(yLabel),
            text: yLabel,
            font: { size: 11, weight: 'bold', family: "'Inter', sans-serif" },
            padding: 8
          }
        },
        x: {
          ticks: {
            font: { size: 10, family: "'Inter', sans-serif" },
            color: '#666',
            maxRotation: 0,
            autoSkip: false
          },
          grid: { display: false, drawBorder: false }
        }
      }
    };
  }

  // Create or update a chart (two-line or single-line)
  function createChart(canvasId, graphData) {
    var ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (charts[canvasId]) {
      charts[canvasId].destroy();
    }

    var datasets;
    if (graphData.singleLine === true) {
      var valueData = Array.isArray(graphData.value) ? graphData.value.slice(0, 12) : [];
      while (valueData.length < 12) valueData.push(0);
      datasets = [
        {
          label: typeof graphData.lineLabel === 'string' ? graphData.lineLabel : 'Value',
          data: valueData,
          borderColor: '#165da8',
          backgroundColor: 'rgba(22, 93, 168, 0.05)',
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: '#165da8',
          pointBorderColor: '#165da8',
          pointBorderWidth: 2,
          tension: 0,
          fill: false,
          clip: false
        }
      ];
    } else {
      datasets = [
        {
          label: 'Target',
          data: graphData.target,
          borderColor: '#FFA500',
          backgroundColor: 'rgba(255, 165, 0, 0.05)',
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: '#FFA500',
          pointBorderColor: '#FFA500',
          pointBorderWidth: 2,
          tension: 0,
          fill: false,
          clip: false
        },
        {
          label: 'Actual',
          data: graphData.actual,
          borderColor: '#165da8',
          backgroundColor: 'rgba(22, 93, 168, 0.05)',
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: '#165da8',
          pointBorderColor: '#165da8',
          pointBorderWidth: 2,
          tension: 0,
          fill: false,
          clip: false
        }
      ];
    }

    var chartConfig = {
      type: 'line',
      data: { labels: MONTHS, datasets: datasets },
      options: getCommonOptions(graphData)
    };

    charts[canvasId] = new Chart(ctx, chartConfig);
  }

  // Initialize all charts
  function initCharts() {
    var qualityData = getQualityData();

    qualityData.graphs.forEach(function (graphData) {
      var titleEl = document.getElementById(graphData.id + 'Title');
      if (titleEl) {
        titleEl.textContent = graphData.title;
      }

      if (graphData.singleLine === true) {
        var legendLabel = document.getElementById(graphData.id + 'LegendLabel');
        if (legendLabel) {
          legendLabel.textContent = graphData.lineLabel || 'Value';
        }
      }

      var canvasId = 'chart' + String(graphData.id).replace('graph', '');
      createChart(canvasId, graphData);
    });
  }

export function teardownQualityModule() {
  qualityTeardownFns.forEach(function (fn) {
    try { fn(); } catch (e) { /* ignore */ }
  });
  qualityTeardownFns = [];
  Object.keys(charts).forEach(function (k) {
    if (charts[k]) {
      charts[k].destroy();
      charts[k] = null;
    }
  });
  delete window.updateQualityModule;
}

export function initQualityModule() {
  teardownQualityModule();
  initCarousel();
  initBackButton();
  initCharts();
  window.updateQualityModule = function () {
    initCharts();
  };
}
