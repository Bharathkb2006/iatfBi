import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import IatfPage from './pages/IatfPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import SupplyModulePage from './pages/SupplyModulePage.jsx';
import MaintenanceModulePage from './pages/MaintenanceModulePage.jsx';
import ProductionModulePage from './pages/ProductionModulePage.jsx';
import QualityModulePage from './pages/QualityModulePage.jsx';
import TechnicalModulePage from './pages/TechnicalModulePage.jsx';
import { firebaseReady } from './firebase/config.js';
import { startRealtimeStorageProxy } from './firebase/realtimeStorageProxy.js';

export default function App() {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('[Firebase] ready:', firebaseReady);
    const stopSync = startRealtimeStorageProxy();
    return () => stopSync();
  }, []);

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/iatf" element={<IatfPage />} />
        <Route path="/supply-module" element={<SupplyModulePage />} />
        <Route path="/maintenance-module" element={<MaintenanceModulePage />} />
        <Route path="/production-module" element={<ProductionModulePage />} />
        <Route path="/quality-module" element={<QualityModulePage />} />
        <Route path="/technical-module" element={<TechnicalModulePage />} />
      </Route>
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      <Route path="/index.html" element={<Navigate to="/" replace />} />
      <Route path="/iatf.html" element={<Navigate to="/iatf" replace />} />
      <Route path="/admin-login.html" element={<Navigate to="/admin/login" replace />} />
      <Route path="/admin-dashboard.html" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/supply-module.html" element={<Navigate to="/supply-module" replace />} />
      <Route path="/maintenance-module.html" element={<Navigate to="/maintenance-module" replace />} />
      <Route path="/production-module.html" element={<Navigate to="/production-module" replace />} />
      <Route path="/quality-module.html" element={<Navigate to="/quality-module" replace />} />
      <Route path="/technical-module.html" element={<Navigate to="/technical-module" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
