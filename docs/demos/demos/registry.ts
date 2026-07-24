import type { ComponentType } from 'react';
import { gettingStartedDemos } from './groups/gettingStarted';
import { coreConceptsDemos } from './groups/coreConcepts';
import { shapesDemos } from './groups/shapes';
import { shapesExtraDemos } from './groups/shapesExtra';
import { stylingDemos } from './groups/styling';
import { interactivityDemos } from './groups/interactivity';
import { brushesPortalDemos } from './groups/brushesPortal';
import { exportDemos } from './groups/export';

export const DEMOS: Record<string, ComponentType> = {
  ...gettingStartedDemos,
  ...coreConceptsDemos,
  ...shapesDemos,
  ...shapesExtraDemos,
  ...stylingDemos,
  ...interactivityDemos,
  ...brushesPortalDemos,
  ...exportDemos,
};
