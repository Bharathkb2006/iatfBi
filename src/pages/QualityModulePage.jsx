import { useEffect } from 'react';
import { initQualityModule, teardownQualityModule } from '../legacy/qualityModule.js';

export default function QualityModulePage() {
  useEffect(() => {
    initQualityModule();
    return () => teardownQualityModule();
  }, []);

  return (
    <main className="main-content supply-module-main">
      <div className="supply-module-container">
        <button type="button" className="supply-back-btn" id="qualityBackBtn" title="Back to IATF">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="supply-carousel quality-carousel">
          <div className="carousel-slide active" data-slide="1">
            <div className="charts-grid-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="chart-card">
                  <h3 className="chart-title" id={`graph${n}Title`}>
                    Quality Graph {n}
                  </h3>
                  <canvas id={`chart${n}`} />
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
              ))}
            </div>
          </div>

          <div className="carousel-slide" data-slide="2">
            <div className="charts-grid-4">
              {[5, 6, 7, 8].map((n) => (
                <div key={n} className="chart-card">
                  <h3 className="chart-title" id={`graph${n}Title`}>
                    Quality Graph {n}
                  </h3>
                  <canvas id={`chart${n}`} />
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
              ))}
            </div>
          </div>

          <div className="carousel-slide" data-slide="3">
            <div className="charts-grid-3">
              {[9, 10, 11].map((n) => (
                <div key={n} className="chart-card chart-card-single">
                  <h3 className="chart-title" id={`graph${n}Title`}>
                    Quality Single Line Chart {n - 8}
                  </h3>
                  <canvas id={`chart${n}`} />
                  <div className="chart-legend chart-legend-single">
                    <span className="legend-item">
                      <span className="legend-color actual" />
                      <span id={`graph${n}LegendLabel`}>Value</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="carousel-nav">
          <div className="carousel-indicators">
            <button type="button" className="indicator active" data-slide="1" aria-label="Slide 1" />
            <button type="button" className="indicator" data-slide="2" aria-label="Slide 2" />
            <button type="button" className="indicator" data-slide="3" aria-label="Slide 3" />
          </div>
        </div>
      </div>
    </main>
  );
}
