import * as React from 'react';
import styles from './Loading.module.css';

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({ size = 'md', fullScreen = false, text }) => {
  const spinner = (
    <div className={styles.wrapper}>
      <div className={`${styles.spinner} ${styles[`spinner--${size}`]}`} aria-label="Loading">
        <div className={styles.circle} />
        <div className={styles.circle} />
        <div className={styles.circle} />
      </div>
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={styles.fullScreen}>
        {spinner}
      </div>
    );
  }

  return spinner;
};

