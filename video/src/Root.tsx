import React from 'react';
import { Composition } from 'remotion';
import { MarketingVideo } from './MarketingVideo';
import type { Timing } from './MarketingVideo';

const landscapeTiming: Timing = {
  intro: 70,
  canvas: 360,
  brush: 190,
  portal: 150,
  portfolio: 190,
  cta: 150,
};

const squareTiming: Timing = {
  intro: 60,
  canvas: 300,
  brush: 160,
  portal: 120,
  portfolio: 160,
  cta: 120,
};

const totalFrames = (t: Timing) =>
  t.intro + t.canvas + t.brush + t.portal + t.portfolio + t.cta;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Landscape"
        component={MarketingVideo}
        durationInFrames={totalFrames(landscapeTiming)}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ timing: landscapeTiming }}
      />
      <Composition
        id="Square"
        component={MarketingVideo}
        durationInFrames={totalFrames(squareTiming)}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{ timing: squareTiming }}
      />
    </>
  );
};
