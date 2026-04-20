import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AuthButton.module.css';

export function AuthButton() {
  const { user, isAuthLoading, syncStatus, signInWithGoogle, signOut } = useAuth();
  const [isPending, setIsPending] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [menuOpen]);

  async function handleSignIn() {
    setIsPending(true);
    setPopupBlocked(false);
    try {
      await signInWithGoogle();
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/popup-blocked') setPopupBlocked(true);
    } finally {
      setIsPending(false);
    }
  }

  async function handleSignOut() {
    setIsPending(true);
    setMenuOpen(false);
    try {
      await signOut();
    } finally {
      setIsPending(false);
    }
  }

  if (isAuthLoading) {
    return <div className={styles.placeholder} aria-hidden="true" />;
  }

  if (!user) {
    return (
      <>
        {popupBlocked && (
          <span className={styles.popupWarning} role="alert">
            Autorisez les popups
          </span>
        )}
        <button
          className={styles.signInBtn}
          onClick={handleSignIn}
          disabled={isPending}
          aria-label="Se connecter avec Google"
        >
          <svg className={styles.googleIcon} viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span>{isPending ? 'Connexion…' : 'Se connecter'}</span>
        </button>
      </>
    );
  }

  return (
    <div className={styles.userSection} ref={containerRef}>
      <span
        className={styles.syncDot}
        data-status={syncStatus}
        title={
          syncStatus === 'synced' ? 'Synchronisé'
          : syncStatus === 'syncing' ? 'Synchronisation…'
          : syncStatus === 'error' ? 'Erreur de sync'
          : 'Hors ligne'
        }
        aria-hidden="true"
      />
      <button
        className={styles.avatarBtn}
        onClick={() => setMenuOpen(o => !o)}
        aria-label="Menu du compte"
        aria-expanded={menuOpen}
        aria-haspopup="true"
      >
        <img
          className={styles.avatar}
          src={user.photoURL ?? ''}
          alt={user.displayName ?? 'Avatar'}
          referrerPolicy="no-referrer"
        />
      </button>

      <div className={`${styles.dropdown} ${menuOpen ? styles.dropdownOpen : ''}`} role="menu">
        <div className={styles.dropdownHeader}>
          <img
            className={styles.dropdownAvatar}
            src={user.photoURL ?? ''}
            alt=""
            referrerPolicy="no-referrer"
            aria-hidden="true"
          />
          <div className={styles.dropdownInfo}>
            <span className={styles.dropdownName}>{user.displayName ?? 'Utilisateur'}</span>
            <span className={styles.dropdownEmail}>{user.email}</span>
          </div>
        </div>
        <div className={styles.dropdownDivider} />
        <button
          className={styles.signOutBtn}
          onClick={handleSignOut}
          disabled={isPending}
          role="menuitem"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
