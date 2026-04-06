import { useEffect } from 'react';
import { initTechnicalModule, teardownTechnicalModule } from '../legacy/technicalModule.js';

export default function TechnicalModulePage() {
  useEffect(() => {
    initTechnicalModule();
    return () => teardownTechnicalModule();
  }, []);

  return (
    <main className="main-content supply-module-main">
      <div className="supply-module-container">
        <button type="button" className="supply-back-btn" id="technicalBackBtn" title="Back to IATF">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="supply-carousel technical-carousel">
          <div className="carousel-slide active" data-slide="1">
            <div className="charts-grid-4">
              <div className="chart-card">
                <h3 className="chart-title" id="techGraph1Title">
                  Technical Graph 1
                </h3>
                <canvas id="techChart1" />
                <div className="chart-legend">
                  <span className="legend-item">
                    <span className="legend-color target" />
                    <span id="techGraph1BarLabel">2024-25</span>
                  </span>
                  <span className="legend-item">
                    <span className="legend-color actual" />
                    <span id="techGraph1LineLabel">Actual</span>
                  </span>
                </div>
              </div>

              <div className="chart-card">
                <h3 className="chart-title" id="techGraph2Title">
                  Technical Graph 2
                </h3>
                <canvas id="techChart2" />
                <div className="chart-legend">
                  <span className="legend-item">
                    <span className="legend-color target" />
                    <span id="techGraph2BarLabel">2024-25</span>
                  </span>
                  <span className="legend-item">
                    <span className="legend-color actual" />
                    <span id="techGraph2LineLabel">Actual</span>
                  </span>
                </div>
              </div>

              <div className="chart-card">
                <h3 className="chart-title" id="techGraph3Title">
                  Technical Graph 3
                </h3>
                <canvas id="techChart3" />
                <div className="chart-legend">
                  <span className="legend-item">
                    <span className="legend-color target" />
                    <span id="techGraph3BarLabel">2024-25</span>
                  </span>
                  <span className="legend-item">
                    <span className="legend-color actual" />
                    <span id="techGraph3LineLabel">Actual</span>
                  </span>
                </div>
              </div>

              <div className="chart-card">
                <h3 className="chart-title" id="techGraph4Title">
                  Main Assy Capacity Utilisation 2025-26
                </h3>
                <canvas id="techChart4" />
                <div className="chart-legend">
                  <span className="legend-item">
                    <span className="legend-color actual" />
                    <span id="techGraph4BarLabel">Actual</span>
                  </span>
                  <span className="legend-item">
                    <span className="legend-color maint-bar1" />
                    <span id="techGraph4Line1Label">Line Capacity</span>
                  </span>
                  <span className="legend-item">
                    <span className="legend-color maint-bar2" />
                    <span id="techGraph4Line2Label">Series</span>
                  </span>
                  <span className="legend-item">
                    <span className="legend-color maint-stack2" />
                    <span id="techGraph4Line3Label">Utilization %</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
