import { useEffect } from 'react';
import { initProductionModule, teardownProductionModule } from '../legacy/productionModule.js';

export default function ProductionModulePage() {
  useEffect(() => {
    initProductionModule();
    return () => teardownProductionModule();
  }, []);

  return (
    <main className="main-content supply-module-main">
      <div className="supply-module-container">
        <button type="button" className="supply-back-btn" id="productionBackBtn" title="Back to IATF">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="supply-carousel production-carousel">
          <div className="carousel-slide active" data-slide="1">
            <div className="charts-grid-3">
              <div className="chart-card">
                <h3 className="chart-title" id="prodGraph1Title">
                  Production Graph 1
                </h3>
                <canvas id="prodChart1" />
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
                <h3 className="chart-title" id="prodGraph2Title">
                  Production Graph 2
                </h3>
                <canvas id="prodChart2" />
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
                <h3 className="chart-title" id="prodGraph3Title">
                  Production Graph 3
                </h3>
                <canvas id="prodChart3" />
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
            <div className="charts-grid-2">
              <div className="chart-card">
                <h3 className="chart-title" id="prodGraph4Title">
                  Production Bar + Line 1
                </h3>
                <canvas id="prodChart4" />
                <div className="chart-legend">
                  <span className="legend-item">
                    <span className="legend-color target" />
                    <span id="prodGraph4BarLabel">2024-25</span>
                  </span>
                  <span className="legend-item">
                    <span className="legend-color actual" />
                    <span id="prodGraph4LineLabel">Actual</span>
                  </span>
                </div>
              </div>
              <div className="chart-card">
                <h3 className="chart-title" id="prodGraph5Title">
                  Production Bar + Line 2
                </h3>
                <canvas id="prodChart5" />
                <div className="chart-legend">
                  <span className="legend-item">
                    <span className="legend-color target" />
                    <span id="prodGraph5BarLabel">2024-25</span>
                  </span>
                  <span className="legend-item">
                    <span className="legend-color actual" />
                    <span id="prodGraph5LineLabel">Actual</span>
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
