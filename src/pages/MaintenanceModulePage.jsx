import { useEffect } from 'react';
import { initMaintenanceModule, teardownMaintenanceModule } from '../legacy/maintenanceModule.js';

export default function MaintenanceModulePage() {
  useEffect(() => {
    initMaintenanceModule();
    return () => teardownMaintenanceModule();
  }, []);

  return (
    <main className="main-content supply-module-main">
      <div className="supply-module-container">
        <button type="button" className="supply-back-btn" id="maintenanceBackBtn" title="Back to IATF">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="supply-carousel maintenance-carousel">
          <div className="carousel-slide active" data-slide="1">
            <div className="charts-grid-3">
              <div className="chart-card">
                <h3 className="chart-title" id="maintGraph1Title">
                  Overall Equipment Breakdown
                </h3>
                <canvas id="maintChart1" />
                <div className="chart-legend">
                  <span className="legend-item">
                    <span className="legend-color maint-bar1" />
                    <span id="maintGraph1Bar1Label">Breakdown Hrs</span>
                  </span>
                  <span className="legend-item">
                    <span className="legend-color maint-bar2" />
                    <span id="maintGraph1Bar2Label">No of Occ</span>
                  </span>
                  <span className="legend-item">
                    <span className="legend-color maint-line1" />
                    <span id="maintGraph1Line1Label">Breakdown Hrs (Monthly)</span>
                  </span>
                  <span className="legend-item">
                    <span className="legend-color maint-line2" />
                    <span id="maintGraph1Line2Label">No of Occ (Monthly)</span>
                  </span>
                </div>
              </div>

              <div className="chart-card">
                <h3 className="chart-title" id="maintGraph2Title">
                  Equipment Breakdown by Line (Hrs)
                </h3>
                <canvas id="maintChart2" />
                <div className="chart-legend">
                  <span className="legend-item">
                    <span className="legend-color maint-stack1" />
                    <span id="maintGraph2Series1Label">EHCU Assembly Line</span>
                  </span>
                  <span className="legend-item">
                    <span className="legend-color maint-stack2" />
                    <span id="maintGraph2Series2Label">Cartridge Assembly Line</span>
                  </span>
                </div>
              </div>

              <div className="chart-card">
                <h3 className="chart-title" id="maintGraph3Title">
                  Equipment Breakdown Occurrence
                </h3>
                <canvas id="maintChart3" />
                <div className="chart-legend">
                  <span className="legend-item">
                    <span className="legend-color maint-stack1" />
                    <span id="maintGraph3Series1Label">EHCU Assembly Line</span>
                  </span>
                  <span className="legend-item">
                    <span className="legend-color maint-stack2" />
                    <span id="maintGraph3Series2Label">Others</span>
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
