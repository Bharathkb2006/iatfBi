(function () {
  'use strict';

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var charts = {};

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

  function getProductionData() {
    var defaults = getDefaultProductionData();
    try {
      var stored = JSON.parse(localStorage.getItem('biProductionModuleData'));
      if (!stored || !Array.isArray(stored.graphs)) return defaults;
      var merged = { graphs: [] };
      var byId = {};
      stored.graphs.forEach(function (g) {
        if (g && g.id) byId[g.id] = g;
      });
      defaults.graphs.forEach(function (def) {
        var existing = byId[def.id];
        if (existing) {
          if (def.target !== undefined) {
            merged.graphs.push({
              id: def.id,
              title: typeof existing.title === 'string' ? existing.title : def.title,
              yAxisLabel: typeof existing.yAxisLabel === 'string' ? existing.yAxisLabel : def.yAxisLabel,
              yAxisMin: typeof existing.yAxisMin === 'number' ? existing.yAxisMin : def.yAxisMin,
              yAxisMax: typeof existing.yAxisMax === 'number' ? existing.yAxisMax : def.yAxisMax,
              target: to12(existing.target, def.target),
              actual: to12(existing.actual, def.actual)
            });
          } else {
            var bv = Number(existing.barValue);
            merged.graphs.push({
              id: def.id,
              title: typeof existing.title === 'string' ? existing.title : def.title,
              yAxisLabel: typeof existing.yAxisLabel === 'string' ? existing.yAxisLabel : def.yAxisLabel,
              yAxisMin: typeof existing.yAxisMin === 'number' ? existing.yAxisMin : def.yAxisMin,
              yAxisMax: typeof existing.yAxisMax === 'number' ? existing.yAxisMax : def.yAxisMax,
              barYearLabel: typeof existing.barYearLabel === 'string' ? existing.barYearLabel : (def.barYearLabel || '2024-25'),
              barValue: Number.isFinite(bv) ? bv : (def.barValue != null ? def.barValue : 0),
              lineLabel: typeof existing.lineLabel === 'string' ? existing.lineLabel : (def.lineLabel || 'Actual'),
              line: to12(existing.line, def.line)
            });
          }
        } else {
          merged.graphs.push(def);
        }
      });
      return merged;
    } catch (err) {
      return defaults;
    }
  }

  function getDefaultProductionData() {
    return {
      graphs: [
        { id: 'prod1', title: 'Production Graph 1 (2025-26)', yAxisLabel: 'Value', yAxisMin: 0, yAxisMax: 50, target: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10], actual: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
        { id: 'prod2', title: 'Production Graph 2 (2025-26)', yAxisLabel: 'Value', yAxisMin: 0, yAxisMax: 50, target: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10], actual: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
        { id: 'prod3', title: 'Production Graph 3 (2025-26)', yAxisLabel: 'Value', yAxisMin: 0, yAxisMax: 50, target: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10], actual: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
        { id: 'prod4', title: 'Production Bar + Line 1 (2025-26)', yAxisLabel: 'Kaizens', yAxisMin: 0, yAxisMax: 50, barYearLabel: '2024-25', barValue: 43, lineLabel: 'Actual 25-26', line: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
        { id: 'prod5', title: 'Production Bar + Line 2 (2025-26)', yAxisLabel: 'Kaizens', yAxisMin: 0, yAxisMax: 50, barYearLabel: '2024-25', barValue: 43, lineLabel: 'Actual 25-26', line: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
      ]
    };
  }

  function initCarousel() {
    var currentSlide = 1;
    var slides = document.querySelectorAll('.production-carousel .carousel-slide');
    var indicators = document.querySelectorAll('.carousel-indicators .indicator');
    var totalSlides = slides.length || 1;

    function showSlide(slideNum) {
      slides.forEach(function (s) { s.classList.remove('active'); });
      indicators.forEach(function (i) { i.classList.remove('active'); });
      var activeSlide = document.querySelector('.production-carousel [data-slide="' + slideNum + '"]');
      if (activeSlide) activeSlide.classList.add('active');
      var activeInd = document.querySelector('.carousel-indicators .indicator[data-slide="' + slideNum + '"]');
      if (activeInd) activeInd.classList.add('active');
      currentSlide = slideNum;
    }

    indicators.forEach(function (ind) {
      ind.addEventListener('click', function () { showSlide(parseInt(this.getAttribute('data-slide'), 10)); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') showSlide(currentSlide === 1 ? totalSlides : currentSlide - 1);
      else if (e.key === 'ArrowRight') showSlide(currentSlide === totalSlides ? 1 : currentSlide + 1);
    });
    var carousel = document.querySelector('.production-carousel');
    if (carousel) {
      carousel.addEventListener('click', function (e) {
        if (e.target !== carousel && e.currentTarget !== carousel) return;
        var rect = carousel.getBoundingClientRect();
        var clickX = e.clientX - rect.left;
        if (clickX < rect.width / 2) showSlide(currentSlide === 1 ? totalSlides : currentSlide - 1);
        else showSlide(currentSlide === totalSlides ? 1 : currentSlide + 1);
      });
    }
    showSlide(1);
  }

  function initBackButton() {
    var btn = document.getElementById('productionBackBtn');
    if (btn) btn.addEventListener('click', function () { window.location.href = 'iatf.html'; });
  }

  function commonOptions(yLabel, yMin, yMax) {
    if (yMax <= yMin) yMax = yMin + 1;
    var yLabelText = typeof yLabel === 'string' ? yLabel.trim() : '';
    return {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 20, bottom: 10, left: 5, right: 5 } },
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: 'rgba(0,0,0,0.85)', padding: 10, titleFont: { size: 12, weight: 'bold' }, bodyFont: { size: 11 }, cornerRadius: 6, displayColors: true },
        datalabels: {
          display: true,
          align: 'top',
          anchor: 'end',
          offset: 0,
          color: function (ctx) { return ctx.dataset.borderColor || ctx.dataset.backgroundColor || '#333'; },
          font: { size: 12, weight: 'bold', family: "'Inter', sans-serif" },
          formatter: function (v) {
            if (v === null || v === undefined) return '';
            var n = Number(v);
            return Number.isFinite(n) ? n.toFixed(1) : '';
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          min: yMin,
          max: yMax,
          ticks: { font: { size: 10, family: "'Inter', sans-serif" }, color: '#666', callback: function (v) { return Number.isFinite(v) ? v.toFixed(1) : ''; } },
          grid: { color: 'rgba(0,0,0,0.06)', drawBorder: false, lineWidth: 1 },
          title: { display: Boolean(yLabelText), text: yLabelText, font: { size: 11, weight: 'bold', family: "'Inter', sans-serif" }, padding: 8 }
        },
        x: {
          ticks: { font: { size: 10, family: "'Inter', sans-serif" }, color: '#666', maxRotation: 45, autoSkip: false },
          grid: { display: false, drawBorder: false }
        }
      }
    };
  }

  function createLineChart(ctx, d) {
    var yMin = Number(d.yAxisMin);
    var yMax = Number(d.yAxisMax);
    if (!Number.isFinite(yMin)) yMin = 0;
    if (!Number.isFinite(yMax)) yMax = 50;
    var opts = commonOptions(d.yAxisLabel, yMin, yMax);
    if (charts[ctx.id]) { charts[ctx.id].destroy(); charts[ctx.id] = null; }
    charts[ctx.id] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: MONTHS,
        datasets: [
          { label: 'Target', data: d.target, borderColor: '#FFA500', backgroundColor: 'rgba(255, 165, 0, 0.05)', borderWidth: 2, pointRadius: 3, pointBackgroundColor: '#FFA500', pointBorderColor: '#FFA500', pointBorderWidth: 2, tension: 0, fill: false, clip: false },
          { label: 'Actual', data: d.actual, borderColor: '#165da8', backgroundColor: 'rgba(22, 93, 168, 0.05)', borderWidth: 2, pointRadius: 3, pointBackgroundColor: '#165da8', pointBorderColor: '#165da8', pointBorderWidth: 2, tension: 0, fill: false, clip: false }
        ]
      },
      options: opts
    });
  }

  function createBarLineChart(ctx, d) {
    var yMin = Number(d.yAxisMin);
    var yMax = Number(d.yAxisMax);
    if (!Number.isFinite(yMin)) yMin = 0;
    if (!Number.isFinite(yMax)) yMax = 50;
    var barVal = Number(d.barValue);
    if (!Number.isFinite(barVal)) barVal = 0;
    var yearLabel = typeof d.barYearLabel === 'string' ? d.barYearLabel.trim() : '2024-25';
    var lineData = to12(d.line, []);
    var labels = [yearLabel].concat(MONTHS);
    var barData = [barVal].concat(Array(12).fill(null));
    var lineSeriesData = [null].concat(lineData);
    var opts = commonOptions(d.yAxisLabel, yMin, yMax);
    if (charts[ctx.id]) { charts[ctx.id].destroy(); charts[ctx.id] = null; }
    charts[ctx.id] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          { label: yearLabel, data: barData, backgroundColor: '#FFA500', borderColor: '#FFA500', borderWidth: 1, order: 2, yAxisID: 'y' },
          { type: 'line', label: d.lineLabel || 'Actual', data: lineSeriesData, borderColor: '#165da8', backgroundColor: 'rgba(22, 93, 168, 0.05)', borderWidth: 2, pointRadius: 3, pointBackgroundColor: '#165da8', pointBorderColor: '#165da8', tension: 0, fill: false, order: 1, yAxisID: 'y' }
        ]
      },
      options: opts
    });
  }

  function initCharts() {
    var data = getProductionData();
    var g1 = data.graphs[0], g2 = data.graphs[1], g3 = data.graphs[2], g4 = data.graphs[3], g5 = data.graphs[4];

    setText('prodGraph1Title', g1.title);
    setText('prodGraph2Title', g2.title);
    setText('prodGraph3Title', g3.title);
    setText('prodGraph4Title', g4.title);
    setText('prodGraph5Title', g5.title);
    setText('prodGraph4BarLabel', g4.barYearLabel || '2024-25');
    setText('prodGraph4LineLabel', g4.lineLabel || 'Actual');
    setText('prodGraph5BarLabel', g5.barYearLabel || '2024-25');
    setText('prodGraph5LineLabel', g5.lineLabel || 'Actual');

    var c1 = document.getElementById('prodChart1');
    var c2 = document.getElementById('prodChart2');
    var c3 = document.getElementById('prodChart3');
    var c4 = document.getElementById('prodChart4');
    var c5 = document.getElementById('prodChart5');
    if (c1) createLineChart(c1, g1);
    if (c2) createLineChart(c2, g2);
    if (c3) createLineChart(c3, g3);
    if (c4) createBarLineChart(c4, g4);
    if (c5) createBarLineChart(c5, g5);
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text || '';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initCarousel();
      initBackButton();
      initCharts();
    });
  } else {
    initCarousel();
    initBackButton();
    initCharts();
  }

  window.updateProductionModule = function () { initCharts(); };
})();
