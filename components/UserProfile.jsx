'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import styles from '@/styles/terminal-ui.module.css';

export default function UserProfile() {
  const { user, signOutCurrentUser } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      await signOutCurrentUser();
      setShowMenu(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className={styles.userProfile}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={styles.userButton}
        aria-label='User menu'
      >
        <span className={styles.userName}>
          {user.displayName || user.email}
        </span>
      </button>

      {showMenu && (
        <div className={styles.userMenu}>
          <div className={styles.userInfo}>
            <div className={styles.userDetail}>
              <span className={styles.userLabel}>EMAIL:</span>
              <span className={styles.userValue}>{user.email}</span>
            </div>
            {user.displayName && (
              <div className={styles.userDetail}>
                <span className={styles.userLabel}>NAME:</span>
                <span className={styles.userValue}>{user.displayName}</span>
              </div>
            )}
            <div className={styles.userDetail}>
              <span className={styles.userLabel}>UID:</span>
              <span className={styles.userValue}>{user.uid}</span>
            </div>
          </div>

          <div className={styles.menuActions}>
            <button
              onClick={handleSignOut}
              className={`${styles.button} ${styles.dangerButton}`}
            >
              LOGOUT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
