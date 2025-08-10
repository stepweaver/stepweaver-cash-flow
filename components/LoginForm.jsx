'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import styles from '@/styles/terminal-ui.module.css';

export default function LoginForm({ onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signInUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInUser(email, password);
      onClose?.();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.terminalWindow}>
      <div className={styles.terminalHeader}>
        <span className={styles.terminalTitle}>LOGIN.EXE</span>
        <button
          onClick={onClose}
          className={styles.closeButton}
          aria-label='Close'
        >
          ×
        </button>
      </div>

      <div className={styles.terminalContent}>
        <form onSubmit={handleSubmit} className={styles.form}>
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
              placeholder='Enter your email'
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor='password' className={styles.label}>
              PASSWORD:
            </label>
            <input
              type='password'
              id='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder='Enter your password'
              required
              disabled={loading}
            />
          </div>

          {error && <div className={styles.errorMessage}>ERROR: {error}</div>}

          <div className={styles.buttonGroup}>
            <button
              type='submit'
              className={`${styles.button} ${styles.primaryButton}`}
              disabled={loading}
            >
              {loading ? 'AUTHENTICATING...' : 'LOGIN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
