import { useEffect } from 'react';
import { initSupplyModule, teardownSupplyModule } from '../legacy/supplyModule.js';

export default function SupplyModulePage() {
  useEffect(() => {
    initSupplyModule();
    return () => teardownSupplyModule();
  }, []);

  return (
    <main className="main-content supply-module-main">
      <div className="supply-module-container">
        <button type="button" className="supply-back-btn" id="supplyBackBtn" title="Back to IATF">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="supply-carousel">
          <div className="carousel-slide active" data-slide="1">
            <div className="charts-grid-4">
              <div className="chart-card">
                <h3 className="chart-title" id="graph1Title">
                  Child Parts Line Stoppage
                </h3>
                <canvas id="chart1" />
                <div className="chart-legend">
                  <span className="legend-item">
                    <span className="legend-color target" />
                    Target
                  </span>
                  <span className="legend-item">
                    <span className="legend-color actual" />
                    Actual
                  </span>
                </div>
              </div>

              <div className="chart-card">
                <h3 className="chart-title" id="graph2Title">
                  Customer Line Stoppage
                </h3>
                <canvas id="chart2" />
                <div className="chart-legend">
                  <span className="legend-item">
                    <span className="legend-color target" />
                    Target
                  </span>
                  <span className="legend-item">
                    <span className="legend-color actual" />
                    Actual
                  </span>
                </div>
              </div>

              <div className="chart-card">
                <h3 className="chart-title" id="graph3Title">
                  Premium Freight
                </h3>
                <canvas id="chart3" />
                <div className="chart-legend">
                  <span className="legend-item">
                    <span className="legend-color target" />
                    Target
                  </span>
                  <span className="legend-item">
                    <span className="legend-color actual" />
                    Actual
                  </span>
                </div>
              </div>

              <div className="chart-card">
                <h3 className="chart-title" id="graph4Title">
                  Inventory Trend IDM Parts
                </h3>
                <canvas id="chart4" />
                <div className="chart-legend">
                  <span className="legend-item">
                    <span className="legend-color target" />
                    Target
                  </span>
                  <span className="legend-item">
                    <span className="legend-color actual" />
                    Actual
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="carousel-slide" data-slide="2">
            <div className="charts-grid-3">
              <div className="chart-card">
                <h3 className="chart-title" id="graph5Title">
                  Supply Graph 5
                </h3>
                <canvas id="chart5" />
                <div className="chart-legend">
                  <span className="legend-item">
                    <span className="legend-color target" />
                    Target
                  </span>
                  <span className="legend-item">
                    <span className="legend-color actual" />
                    Actual
                  </span>
                </div>
              </div>

              <div className="chart-card">
                <h3 className="chart-title" id="graph6Title">
                  Supply Graph 6
                </h3>
                <canvas id="chart6" />
                <div className="chart-legend">
                  <span className="legend-item">
                    <span className="legend-color target" />
                    Target
                  </span>
                  <span className="legend-item">
                    <span className="legend-color actual" />
                    Actual
                  </span>
                </div>
              </div>

              <div className="chart-card">
                <h3 className="chart-title" id="graph7Title">
                  Supply Graph 7
                </h3>
                <canvas id="chart7" />
                <div className="chart-legend">
                  <span className="legend-item">
                    <span className="legend-color target" />
                    Target
                  </span>
                  <span className="legend-item">
                    <span className="legend-color actual" />
                    Actual
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="carousel-nav">
          <div className="carousel-indicators">
            <button type="button" className="indicator active" data-slide="1" aria-label="Slide 1" />
            <button type="button" className="indicator" data-slide="2" aria-label="Slide 2" />
          </div>
        </div>
      </div>
    </main>
  );
}
