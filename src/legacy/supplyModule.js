import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { goIatf } from '../utils/spaNavigate.js';

Chart.register(ChartDataLabels);

/* Supply Module - Carousel and Charts */
// Configuration for months (Jan -> Dec)
var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Chart instances
var charts = {};
var supplyTeardownFns = [];

  // Get data from localStorage
  function getSupplyData() {
    var defaults = getDefaultSupplyData();
    try {
      var stored = JSON.parse(localStorage.getItem('biSupplyModuleData'));
      if (!stored || !Array.isArray(stored.graphs)) {
        return defaults;
      }

      // Normalize to always have 7 graphs; merge stored with defaults by id
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
          merged.graphs.push({
            id: def.id,
            title: typeof existing.title === 'string' ? existing.title : def.title,
            yAxisLabel: typeof existing.yAxisLabel === 'string' ? existing.yAxisLabel : def.yAxisLabel,
            yAxisUnit: typeof existing.yAxisUnit === 'string' ? existing.yAxisUnit : def.yAxisUnit,
            yAxisMin: typeof existing.yAxisMin === 'number' ? existing.yAxisMin : def.yAxisMin,
            yAxisMax: typeof existing.yAxisMax === 'number' ? existing.yAxisMax : def.yAxisMax,
            target: to12NumberArray(existing.target, def.target),
            actual: to12NumberArray(existing.actual, def.actual)
          });
        } else {
          merged.graphs.push(def);
        }
      });

      return merged;
    } catch (err) {
      return defaults;
    }
  }

  // Default supply data structure
  function getDefaultSupplyData() {
    return {
      graphs: [
        {
          id: 'graph1',
          title: 'Child Parts Line Stoppage (2025-26)',
          yAxisLabel: 'No. of Occasions',
          yAxisUnit: '',
          yAxisMin: 0,
          yAxisMax: 50,
          target: [0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8],
          actual: [0.2, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
        },
        {
          id: 'graph2',
          title: 'Customer Line Stoppage (2025-26)',
          yAxisLabel: 'No. of Occasions',
          yAxisUnit: '',
          yAxisMin: 0,
          yAxisMax: 50,
          target: [0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8],
          actual: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
        },
        {
          id: 'graph3',
          title: 'Premium Freight (2025-26)',
          yAxisLabel: 'No. of Occasions',
          yAxisUnit: '',
          yAxisMin: 0,
          yAxisMax: 50,
          target: [10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0],
          actual: [0.0, 0.0, 0.2, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
        },
        {
          id: 'graph4',
          title: 'Inventory Trend IDM Parts (2025-26)',
          yAxisLabel: 'No. of Occasions',
          yAxisUnit: '',
          yAxisMin: 0,
          yAxisMax: 50,
          target: [150, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150],
          actual: [133, 134, 134, 130, 130, 130, 130, 130, 113, 113, 113, 113]
        },
        {
          id: 'graph5',
          title: 'Supply Graph 5 (2025-26)',
          yAxisLabel: 'No. of Occasions',
          yAxisUnit: '',
          yAxisMin: 0,
          yAxisMax: 50,
          target: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
          actual: [80, 85, 88, 90, 92, 95, 98, 100, 102, 105, 108, 110]
        },
        {
          id: 'graph6',
          title: 'Supply Graph 6 (2025-26)',
          yAxisLabel: 'No. of Occasions',
          yAxisUnit: '',
          yAxisMin: 0,
          yAxisMax: 50,
          target: [200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200],
          actual: [150, 160, 170, 180, 185, 190, 195, 200, 210, 220, 230, 240]
        },
        {
          id: 'graph7',
          title: 'Supply Graph 7 (2025-26)',
          yAxisLabel: 'No. of Occasions',
          yAxisUnit: '',
          yAxisMin: 0,
          yAxisMax: 50,
          target: [90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90],
          actual: [75, 78, 80, 82, 85, 87, 88, 90, 92, 93, 94, 95]
        }
      ]
    };
  }

function initCarousel() {
  var currentSlide = 1;
  var slides = document.querySelectorAll('.supply-module-main .carousel-slide');
  var indicatorsRoot = document.querySelector('.supply-module-main .carousel-indicators');
  var totalSlides = slides.length || 1;

  function showSlide(slideNum) {
    slides.forEach(function (slide) {
      slide.classList.remove('active');
    });
    document.querySelectorAll('.supply-module-main .carousel-indicators .indicator').forEach(function (indicator) {
      indicator.classList.remove('active');
    });

    var activeSlide = document.querySelector('.supply-module-main [data-slide="' + slideNum + '"]');
    if (activeSlide) activeSlide.classList.add('active');

    var activeIndicator = document.querySelector('.supply-module-main .carousel-indicators .indicator[data-slide="' + slideNum + '"]');
    if (activeIndicator) activeIndicator.classList.add('active');

    currentSlide = slideNum;
  }

  function onIndicatorRootClick(e) {
    var t = e.target.closest('.indicator');
    if (!t || !indicatorsRoot || !indicatorsRoot.contains(t)) return;
    var slideNum = parseInt(t.getAttribute('data-slide'), 10);
    showSlide(slideNum);
  }

  if (indicatorsRoot) {
    indicatorsRoot.addEventListener('click', onIndicatorRootClick);
    supplyTeardownFns.push(function () {
      indicatorsRoot.removeEventListener('click', onIndicatorRootClick);
    });
  }

  var onSupplyKeydown = function (e) {
    if (e.key === 'ArrowLeft') {
      showSlide(currentSlide === 1 ? totalSlides : (currentSlide - 1));
    } else if (e.key === 'ArrowRight') {
      showSlide(currentSlide === totalSlides ? 1 : (currentSlide + 1));
    }
  };
  document.addEventListener('keydown', onSupplyKeydown);
  supplyTeardownFns.push(function () {
    document.removeEventListener('keydown', onSupplyKeydown);
  });

  var carousel = document.querySelector('.supply-module-main .supply-carousel');
  var onCarouselClick = function (e) {
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
    carousel.addEventListener('click', onCarouselClick);
    supplyTeardownFns.push(function () {
      carousel.removeEventListener('click', onCarouselClick);
    });
  }

  showSlide(1);
}

function initBackButton() {
  var backBtn = document.getElementById('supplyBackBtn');
  if (!backBtn) return;
  var onBack = function () {
    goIatf();
  };
  backBtn.addEventListener('click', onBack);
  supplyTeardownFns.push(function () {
    backBtn.removeEventListener('click', onBack);
  });
}

// Create or update a chart
function createChart(canvasId, graphData) {
    var ctx = document.getElementById(canvasId);
    if (!ctx) return;

    // Destroy existing chart if present
    if (charts[canvasId]) {
      charts[canvasId].destroy();
    }

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

    var chartConfig = {
      type: 'line',
      data: {
        labels: MONTHS,
        datasets: [
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
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 20,
            bottom: 10,
            left: 5,
            right: 5
          }
        },
        plugins: {
          legend: {
            display: false
          },
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
            font: {
              size: 12,
              weight: 'bold',
              family: "'Inter', sans-serif"
            },
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
            grid: {
              display: false,
              drawBorder: false
            }
          }
        }
      }
    };

  charts[canvasId] = new Chart(ctx, chartConfig);
}

// Initialize all charts
function initCharts() {
  var supplyData = getSupplyData();

  supplyData.graphs.forEach(function (graphData) {
    var titleEl = document.getElementById(graphData.id + 'Title');
    if (titleEl) {
      titleEl.textContent = graphData.title;
    }

    var canvasId = 'chart' + String(graphData.id).replace('graph', '');
    createChart(canvasId, graphData);
  });
}

export function teardownSupplyModule() {
  supplyTeardownFns.forEach(function (fn) {
    try {
      fn();
    } catch (e) { /* ignore */ }
  });
  supplyTeardownFns = [];
  Object.keys(charts).forEach(function (k) {
    if (charts[k]) {
      charts[k].destroy();
      charts[k] = null;
    }
  });
  delete window.updateSupplyModule;
}

export function initSupplyModule() {
  teardownSupplyModule();
  initCarousel();
  initBackButton();
  initCharts();
  window.updateSupplyModule = function () {
    initCharts();
  };
}
