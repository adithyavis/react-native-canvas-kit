import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { SlideLayout } from '../components/SlideLayout';
import { LyricsCaption } from '../components/LyricsCaption';
import {
  CX,
  CY,
  RectShape,
  Star,
  Transformer,
  Finger,
  Guides,
  GridDots,
  ScreenBase,
} from '../components/canvasPrimitives';
import { theme } from '../theme';

const LINES = [
  'Add a rectangle.',
  'Or a circle.',
  'Or any shape.',
  'Drag it.',
  'Rotate it.',
  'Scale it.',
  'Snap to guides.',
];

const CanvasScreen: React.FC<{ stepLen: number }> = ({ stepLen }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const index = Math.min(LINES.length - 1, Math.floor(frame / stepLen));
  const t = (frame - index * stepLen) / fps;

  const rectAppear = spring({ frame, fps, config: { damping: 12, mass: 0.7 } });
  const circleAppear = spring({
    frame: frame - stepLen,
    fps,
    config: { damping: 12, mass: 0.7 },
  });
  const starAppear = spring({
    frame: frame - stepLen * 2,
    fps,
    config: { damping: 12, mass: 0.7 },
  });
  const othersFade = spring({
    frame: frame - stepLen * 3,
    fps,
    config: { damping: 16 },
  });
  const circleScale = Math.max(0, circleAppear * (1 - othersFade));
  const starScale = Math.max(0, starAppear * (1 - othersFade));

  let rectTransform = '';
  let showTransformer = false;
  let finger: React.ReactNode = null;
  let showGrid = false;
  let guideActive = 0;

  if (index === 3) {
    const dx = Math.sin(t * 2) * 20;
    rectTransform = `translate(${dx} 0)`;
    finger = <Finger x={CX + dx} y={CY + 12} />;
  } else if (index === 4) {
    const ang = Math.sin(t * 2) * 30;
    rectTransform = `rotate(${ang} ${CX} ${CY})`;
    showTransformer = true;
  } else if (index === 5) {
    const sc = 0.78 + (0.5 + 0.5 * Math.sin(t * 2.2)) * 0.42;
    rectTransform = `translate(${CX} ${CY}) scale(${sc}) translate(${-CX} ${-CY})`;
    showTransformer = true;
  } else if (index === 6) {
    const dx = 14 * Math.cos(t * 1.3);
    const dy = 10 * Math.sin(t * 1.0);
    rectTransform = `translate(${dx} ${dy})`;
    showTransformer = true;
    showGrid = true;
    const near = Math.max(Math.abs(dx), Math.abs(dy));
    guideActive = interpolate(near, [0, 3, 7], [1, 0.3, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  }

  return (
    <AbsoluteFill style={{ background: '#fff' }}>
      <ScreenBase>
        {showGrid ? <GridDots opacity={0.55} /> : null}
        {index === 6 ? <Guides active={guideActive} /> : null}
        <g transform={`translate(70 150) scale(${circleScale}) translate(-70 -150)`}>
          <circle cx={70} cy={150} r={13} fill={theme.pink} />
        </g>
        <g transform={`translate(30 152) scale(${starScale}) translate(-30 -152)`}>
          <Star cx={30} cy={152} outer={16} inner={7} fill={theme.purple} />
        </g>
        <g transform={`translate(${CX} ${CY}) scale(${rectAppear}) translate(${-CX} ${-CY})`}>
          <g transform={rectTransform}>
            <RectShape accent={theme.purple} />
            {showTransformer ? <Transformer /> : null}
          </g>
        </g>
        {finger}
      </ScreenBase>
    </AbsoluteFill>
  );
};

export const CanvasSlide: React.FC<{ duration: number }> = ({ duration }) => {
  const stepLen = duration / LINES.length;
  return (
    <SlideLayout caption={<LyricsCaption lines={LINES} stepLen={stepLen} />}>
      <CanvasScreen stepLen={stepLen} />
    </SlideLayout>
  );
};
