import React from 'react';
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Series,
  staticFile,
  useVideoConfig,
} from 'remotion';
import { theme } from './theme';
import { Header } from './components/Header';
import { CanvasSlide } from './sections/CanvasSlide';
import { BrushSlide } from './sections/BrushSlide';
import { PortalSlide } from './sections/PortalSlide';
import { PortfolioSlide } from './sections/PortfolioSlide';
import { CTA } from './sections/CTA';

export type Timing = {
  intro: number;
  canvas: number;
  brush: number;
  portal: number;
  portfolio: number;
  cta: number;
};

export const MarketingVideo: React.FC<{ timing: Timing }> = ({ timing }) => {
  const t = timing;
  const { durationInFrames } = useVideoConfig();
  const ctaStart = durationInFrames - t.cta;

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg }}>
      <Audio
        src={staticFile('music.mp3')}
        volume={(f) =>
          interpolate(
            f,
            [0, 14, durationInFrames - 26, durationInFrames - 1],
            [0, 0.8, 0.8, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          )
        }
      />
      <Series>
        {t.intro > 0 ? (
          <Series.Sequence durationInFrames={t.intro}>
            <AbsoluteFill style={{ background: theme.bg }} />
          </Series.Sequence>
        ) : null}
        <Series.Sequence durationInFrames={t.canvas}>
          <CanvasSlide duration={t.canvas} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={t.brush}>
          <BrushSlide duration={t.brush} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={t.portal}>
          <PortalSlide duration={t.portal} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={t.portfolio}>
          <PortfolioSlide duration={t.portfolio} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={t.cta}>
          <CTA />
        </Series.Sequence>
      </Series>
      <Header introEnd={t.intro} hideFrom={ctaStart} />
    </AbsoluteFill>
  );
};
