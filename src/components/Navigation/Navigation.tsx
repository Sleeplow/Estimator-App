import { NavLink } from 'react-router-dom';
import styles from './Navigation.module.css';

export function Navigation() {
  return (
    <>
      {/* Top bar */}
      <nav className={styles.nav} aria-label="Navigation principale">
        <div className={styles.brand}>
          <svg className={styles.logo} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="13" width="4" height="8" rx="1" fill="currentColor" opacity="0.6" />
            <rect x="10" y="8" width="4" height="13" rx="1" fill="currentColor" opacity="0.8" />
            <rect x="17" y="3" width="4" height="18" rx="1" fill="currentColor" />
          </svg>
          <span className={styles.brandName}>PBI Estimateur</span>
        </div>
        {/* Desktop links only */}
        <div className={styles.desktopLinks}>
          <NavLink to="/" end className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
            <svg className={styles.linkIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="13" width="4" height="8" rx="1" fill="currentColor" opacity="0.5" />
              <rect x="10" y="8" width="4" height="13" rx="1" fill="currentColor" opacity="0.75" />
              <rect x="17" y="3" width="4" height="18" rx="1" fill="currentColor" />
            </svg>
            Estimation
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
            <svg className={styles.linkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 15" />
            </svg>
            Historique
          </NavLink>
          <NavLink to="/config" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
            <svg className={styles.linkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Configuration
          </NavLink>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav className={styles.bottomNav} aria-label="Navigation mobile">
        <NavLink to="/" end className={({ isActive }) => `${styles.tabItem} ${isActive ? styles.tabActive : ''}`}>
          <svg className={styles.tabIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="13" width="4" height="8" rx="1" fill="currentColor" opacity="0.5" />
            <rect x="10" y="8" width="4" height="13" rx="1" fill="currentColor" opacity="0.75" />
            <rect x="17" y="3" width="4" height="18" rx="1" fill="currentColor" />
          </svg>
          <span className={styles.tabLabel}>Estimation</span>
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `${styles.tabItem} ${isActive ? styles.tabActive : ''}`}>
          <svg className={styles.tabIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15 15" />
          </svg>
          <span className={styles.tabLabel}>Historique</span>
        </NavLink>
        <NavLink to="/config" className={({ isActive }) => `${styles.tabItem} ${isActive ? styles.tabActive : ''}`}>
          <svg className={styles.tabIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span className={styles.tabLabel}>Config</span>
        </NavLink>
      </nav>
    </>
  );
}
