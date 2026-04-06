import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.classList.add('admin-page-body');
    return () => document.body.classList.remove('admin-page-body');
  }, []);

  function onSubmit(e) {
    e.preventDefault();
    const u = username.trim();
    const p = password.trim();
    if (u === 'admin' && p === 'admin123') {
      localStorage.setItem('biAdminLoggedIn', 'true');
      navigate('/admin/dashboard', { replace: true });
    } else {
      setError('Invalid credentials.');
    }
  }

  return (
    <main className="admin-login">
      <div className="admin-card">
        <h1>Admin Login</h1>
        <p className="admin-subtitle">Use your admin credentials to update site content.</p>
        <form id="adminLoginForm" className="admin-form" onSubmit={onSubmit}>
          <label className="admin-field" htmlFor="adminUsername">
            <span>Username</span>
            <input
              id="adminUsername"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label className="admin-field" htmlFor="adminPassword">
            <span>Password</span>
            <input
              id="adminPassword"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button type="submit" className="admin-primary-btn">
            Login
          </button>
          <p className="admin-error" aria-live="polite">
            {error}
          </p>
        </form>
        <Link to="/" className="admin-link">
          Back to Home
        </Link>
      </div>
    </main>
  );
}
