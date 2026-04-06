import { useEffect, useRef, useCallback } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { SITE_LOGO_SRC } from '../constants.js';

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const sideMenuRef = useRef(null);
  const menuToggleRef = useRef(null);

  useEffect(() => {
    window.__BI_ROUTER_PUSH__ = (path) => navigate(path);
    return () => {
      delete window.__BI_ROUTER_PUSH__;
    };
  }, [navigate]);

  const closeMenu = useCallback(() => {
    const sideMenu = sideMenuRef.current;
    const menuToggle = menuToggleRef.current;
    if (!sideMenu) return;
    sideMenu.classList.remove('is-open');
    sideMenu.setAttribute('aria-hidden', 'true');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }, []);

  const openMenu = useCallback(() => {
    const sideMenu = sideMenuRef.current;
    const menuToggle = menuToggleRef.current;
    if (!sideMenu) return;
    sideMenu.classList.add('is-open');
    sideMenu.setAttribute('aria-hidden', 'false');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }, []);

  const toggleMenu = useCallback(() => {
    const sideMenu = sideMenuRef.current;
    if (sideMenu && sideMenu.classList.contains('is-open')) closeMenu();
    else openMenu();
  }, [closeMenu, openMenu]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && sideMenuRef.current && sideMenuRef.current.classList.contains('is-open')) {
        closeMenu();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeMenu]);

  useEffect(() => {
    closeMenu();
  }, [location.pathname, closeMenu]);

  const path = location.pathname;
  const homeActive = path === '/' ? 'active' : '';
  const iatfActive = path === '/iatf' ? 'active' : '';
  const moduleShell = /-module$/.test(path);

  return (
    <>
      <header className={`header ${moduleShell ? 'supply-module-hide-header' : ''}`}>
        <button
          ref={menuToggleRef}
          type="button"
          className="menu-toggle"
          id="menuToggle"
          aria-label="Open menu"
          aria-expanded="false"
          onClick={toggleMenu}
        >
          <span />
          <span />
          <span />
        </button>
        <div className="logo">
          <img src={SITE_LOGO_SRC} alt="Brakes India Logo" className="site-logo" />
        </div>
        <Link to="/admin/login" className="profile-icon profile-link" aria-label="Admin Login">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
          </svg>
        </Link>
      </header>

      <nav ref={sideMenuRef} className="side-menu" id="sideMenu" aria-hidden="true">
        <div className="menu-overlay" id="menuOverlay" role="presentation" onClick={closeMenu} />
        <div className="menu-panel">
          <ul className="menu-list">
            <li>
              <Link to="/" className={`menu-link ${homeActive}`} onClick={closeMenu}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/iatf" className={`menu-link ${iatfActive}`} onClick={closeMenu}>
                IATF
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <Outlet />
    </>
  );
}
