import React, { useState } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

interface DemoProps {
  name: string;
  height?: number;
  title?: string;
}

export default function Demo({ name, height = 460, title }: DemoProps) {
  const src = useBaseUrl(`/demos/?demo=${name}`);
  const [reloadKey, setReloadKey] = useState(0);
  return (
    <div className={styles.frame} style={{ height }}>
      <div className={styles.bar}>
        <span className={styles.dot} />
        <span className={styles.label}>{title ?? `${name} demo`}</span>
        <button
          type="button"
          className={styles.reset}
          onClick={() => setReloadKey((k) => k + 1)}
        >
          Reset
        </button>
      </div>
      <iframe
        key={reloadKey}
        src={src}
        className={styles.iframe}
        title={title ?? `${name} demo`}
        loading="lazy"
      />
    </div>
  );
}
