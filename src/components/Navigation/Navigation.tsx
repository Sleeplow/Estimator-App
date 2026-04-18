import { NavLink } from 'react-router-dom';
import styles from './Navigation.module.css';

export function Navigation() {
  return (
    <nav className={styles.nav}>
      <div className={styles.brand}>
        <svg className={styles.logo} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="13" width="4" height="8" rx="1" fill="currentColor" opacity="0.6" />
          <rect x="10" y="8" width="4" height="13" rx="1" fill="currentColor" opacity="0.8" />
          <rect x="17" y="3" width="4" height="18" rx="1" fill="currentColor" />
        </svg>
        <span className={styles.brandName}>PBI Estimateur</span>
      </div>
      <div className={styles.links}>
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `${styles.link} ${isActive ? styles.active : ''}`
          }
        >
          Estimation
        </NavLink>
        <NavLink
          to="/config"
          className={({ isActive }) =>
            `${styles.link} ${isActive ? styles.active : ''}`
          }
        >
          Configuration
        </NavLink>
      </div>
    </nav>
  );
}
