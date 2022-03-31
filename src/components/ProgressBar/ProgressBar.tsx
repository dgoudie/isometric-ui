import React from 'react';
import styles from './ProgressBar.module.scss';

interface Props {
  percentage: number;
}

export default function ProgressBar({ percentage }: Props) {
  return (
    <div className={styles.bar}>
      <div
        className={styles.fill}
        style={{ width: `${percentage * 100}%` }}
      ></div>
    </div>
  );
}
