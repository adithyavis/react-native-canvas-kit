import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import useBaseUrl from '@docusaurus/useBaseUrl';

import HomepageFeatures from '../components/HomepageFeatures';

import styles from './index.module.css';

function HomepageHero() {
  const { siteConfig } = useDocusaurusContext();
  const skiaIcon = useBaseUrl('/img/react-native-skia.png');
  return (
    <header className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <span className={styles.badge}>
            <img
              className={styles.badgeIcon}
              src={skiaIcon}
              alt="React Native Skia"
            />
            Powered by React Native Skia
          </span>
          <Heading as="h1" className={styles.heroTitle}>
            {siteConfig.title}
          </Heading>
          <p className={styles.heroTagline}>
            A declarative 2D scene-graph canvas for React Native.
          </p>
          <div className={styles.heroButtons}>
            <Link
              className="button button--primary button--lg"
              to="/getting-started/installation"
            >
              Get Started
            </Link>
            <Link className="button button--secondary button--lg" to="/intro">
              Read the Docs
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home(): React.JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="A Skia-powered 2D scene-graph canvas for React Native"
    >
      <HomepageHero />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
