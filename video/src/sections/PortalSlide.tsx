import React from 'react';
import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { SlideLayout } from '../components/SlideLayout';
import { SteppedCaption } from '../components/SteppedCaption';
import { RectShape, ScreenBase } from '../components/canvasPrimitives';
import { theme } from '../theme';

const PortalScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const appear = spring({ frame, fps, config: { damping: 14 } });
  const dx = Math.sin(t * 1.1) * 34;
  const dy = Math.cos(t * 0.9) * 18;
  const lift = 0.5 + 0.5 * Math.sin(t * 1.1);
  const caret = Math.floor(t * 1.6) % 2 === 0 ? 1 : 0.15;

  return (
    <AbsoluteFill style={{ background: '#fff' }}>
      <ScreenBase>
        <RectShape accent={theme.purple} x={52} y={64} w={30} h={24} />
        <circle cx={34} cy={156} r={15} fill={theme.pink} />
      </ScreenBase>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            transform: `translate(${dx}px, ${dy}px) scale(${appear})`,
            background: '#1b0030',
            color: '#fff',
            padding: '14px 20px',
            borderRadius: 14,
            fontFamily: theme.sans,
            fontWeight: 700,
            fontSize: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: `0 ${8 + lift * 20}px ${22 + lift * 34}px rgba(20,12,40,${0.22 + lift * 0.2})`,
          }}
        >
          <span>Drag me</span>
          <span
            style={{
              width: 2,
              height: 20,
              background: '#fff',
              opacity: caret,
              display: 'inline-block',
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const PortalSlide: React.FC<{ duration: number }> = () => {
  return (
    <SlideLayout
      caption={
        <SteppedCaption
          steps={['Real views, as nodes.']}
          stepLen={1}
          sub="Drag a live React Native view like any shape."
        />
      }
    >
      <PortalScreen />
    </SlideLayout>
  );
};
