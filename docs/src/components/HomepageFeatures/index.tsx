import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';

import styles from './styles.module.css';

type Feature = {
  title: string;
  icon: string;
  description: React.JSX.Element;
};

const FEATURES: Feature[] = [
  {
    title: 'Declarative scene graph',
    icon: '🌳',
    description: (
      <>
        Compose your canvas as a tree of React components — <code>Stage</code> →{' '}
        <code>Layer</code> → <code>Group</code> → <code>Shape</code>.
      </>
    ),
  },
  {
    title: 'First class gesture handling',
    icon: '👆',
    description: (
      <>
        Tap and press events with hierarchy-aware hit testing and ancestor
        bubbling
      </>
    ),
  },
  {
    title: 'UI thread driven',
    icon: '🔄',
    description: (
      <>
        Pinch-to-scale, drag and rotate run on the UI thread via Reanimated
        worklets, so they stay smooth even when the JS thread is busy.
      </>
    ),
  },
  {
    title: 'Support for brushes',
    icon: '🖌️',
    description: (
      <>
        Ready-made brushes like pen, pencil, marker, highlighter, tape, and
        eraser.
      </>
    ),
  },
];

function FeatureCard({ title, icon, description }: Feature) {
  return (
    <div className={clsx('col col--6', styles.featureCol)}>
      <div className={styles.card}>
        <div className={styles.cardIcon} aria-hidden="true">
          {icon}
        </div>
        <Heading as="h3" className={styles.cardTitle}>
          {title}
        </Heading>
        <p className={styles.cardText}>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): React.JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.sectionHead}>
          <p className={styles.sectionSubtitle}>
            Comes with pre-built shapes, support for gestures and interactivity,
            transformers, and freehand brushes, so that you don't have to
            compose a canvas experience from scratch.
          </p>
        </div>
        <div className="row">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
        <div className={styles.ctaRow}>
          <Link
            className="button button--primary button--lg"
            to="/getting-started/quick-start"
          >
            Build your first canvas →
          </Link>
        </div>
      </div>
    </section>
  );
}
