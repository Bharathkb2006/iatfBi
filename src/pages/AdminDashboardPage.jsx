import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Full admin UI still runs from public/admin-dashboard.html + admin-embed.js
 * so all existing dashboard behaviour is preserved. Logout uses top window to exit the SPA shell.
 */
export default function AdminDashboardPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('biAdminLoggedIn') !== 'true') {
      navigate('/admin/login', { replace: true });
    }
  }, [navigate]);

  if (localStorage.getItem('biAdminLoggedIn') !== 'true') {
    return null;
  }

  return (
    <iframe
      title="Admin dashboard"
      src="/admin-dashboard.html"
      style={{
        display: 'block',
        width: '100%',
        minHeight: '100vh',
        border: 'none',
      }}
    />
  );
}
