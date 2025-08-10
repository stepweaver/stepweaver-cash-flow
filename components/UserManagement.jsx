'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  getAuth,
} from 'firebase/auth';
import styles from '@/styles/terminal-ui.module.css';

export default function UserManagement() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Only show this component for the main admin user
  // You can customize this logic based on your needs
  if (!user || user.email !== 'stephen@stepweaver.dev') {
    return null;
  }

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }

      setMessage(`User ${email} created successfully!`);
      setEmail('');
      setPassword('');
      setDisplayName('');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminTerminalWindow}>
        <div className={styles.terminalHeader}>
          <span className={styles.terminalTitle}>USER_MANAGEMENT.EXE</span>
        </div>

        <div className={styles.terminalContent}>
          <div className={styles.adminSection}>
            <h3 className={styles.sectionTitle}>CREATE NEW USER</h3>
            <p className={styles.sectionDescription}>
              Add authorized users to the system. Only administrators can access
              this feature.
            </p>
          </div>

          <form onSubmit={handleCreateUser} className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor='displayName' className={styles.label}>
                  DISPLAY_NAME:
                </label>
                <input
                  type='text'
                  id='displayName'
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={styles.input}
                  required
                  disabled={loading}
                  placeholder='e.g., Wife Name'
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor='email' className={styles.label}>
                  EMAIL_ADDRESS:
                </label>
                <input
                  type='email'
                  id='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                  required
                  disabled={loading}
                  placeholder='wife@example.com'
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor='password' className={styles.label}>
                TEMPORARY_PASSWORD:
              </label>
              <input
                type='password'
                id='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                required
                disabled={loading}
                minLength={6}
                placeholder='Minimum 6 characters'
              />
              <small className={styles.helpText}>
                User should change this password after first login
              </small>
            </div>

            {message && (
              <div className={styles.successMessage}>SUCCESS: {message}</div>
            )}

            {error && <div className={styles.errorMessage}>ERROR: {error}</div>}

            <div className={styles.buttonGroup}>
              <button
                type='submit'
                className={`${styles.button} ${styles.primaryButton}`}
                disabled={loading}
              >
                {loading ? 'CREATING_USER...' : 'CREATE_USER'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
