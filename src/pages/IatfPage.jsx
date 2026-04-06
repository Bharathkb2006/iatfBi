import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function IatfPage() {
  const [bannerTitle, setBannerTitle] = useState('IATF 16949');

  useEffect(() => {
    const saved = localStorage.getItem('biIatfBannerTitle');
    if (saved) setBannerTitle(saved);

    const onStorageUpdate = (event) => {
      if (!event || !event.detail || event.detail.key !== 'biIatfBannerTitle') return;
      const next = localStorage.getItem('biIatfBannerTitle');
      if (next) setBannerTitle(next);
    };

    window.addEventListener('bi-storage-updated', onStorageUpdate);
    return () => {
      window.removeEventListener('bi-storage-updated', onStorageUpdate);
    };
  }, []);

  return (
    <main className="main-content">
      <div className="page-inner">
        <div className="iatf-banner">
          <div className="logo">SCS</div>
          <h2 id="iatfBannerDisplay">{bannerTitle}</h2>
          <div className="logo">SCS</div>
        </div>

        <div className="options-grid">
          <Link to="/supply-module" className="option-card">
            <div className="option-icon">📦</div>
            <div className="option-title">Supply Module</div>
          </Link>

          <Link to="/maintenance-module" className="option-card">
            <div className="option-icon">🔧</div>
            <div className="option-title">Maintenance Module</div>
          </Link>

          <Link to="/production-module" className="option-card">
            <div className="option-icon">⚙️</div>
            <div className="option-title">Production Module</div>
          </Link>

          <Link to="/quality-module" className="option-card">
            <div className="option-icon">✓</div>
            <div className="option-title">Quality Module</div>
          </Link>

          <Link to="/technical-module" className="option-card">
            <div className="option-icon">💻</div>
            <div className="option-title">Technical Module</div>
          </Link>
        </div>
      </div>
    </main>
  );
}
