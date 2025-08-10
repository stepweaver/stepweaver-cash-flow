'use client';

import LoginForm from './LoginForm';
import styles from '@/styles/terminal-ui.module.css';

export default function AuthModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <LoginForm onClose={onClose} />
      </div>
    </div>
  );
}
