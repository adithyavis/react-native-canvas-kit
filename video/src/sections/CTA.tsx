import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { theme } from '../theme';

export const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const isSquare = width < 1400;

  const enter = spring({ frame, fps, config: { damping: 200 } });
  const install = spring({ frame: frame - 12, fps, config: { damping: 200 } });
  const link = spring({ frame: frame - 22, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill
      style={{
        background: theme.bg,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 40,
        fontFamily: theme.sans,
      }}
    >
      <div
        style={{
          fontSize: isSquare ? 52 : 76,
          fontWeight: 700,
          letterSpacing: -2,
          color: theme.ink,
          opacity: enter,
          transform: `translateY(${interpolate(enter, [0, 1], [30, 0])}px)`,
        }}
      >
        react-native-canvas-kit
      </div>
      <div
        style={{
          fontFamily: theme.mono,
          fontSize: isSquare ? 28 : 36,
          color: theme.ink,
          background: theme.surface,
          padding: isSquare ? '18px 30px' : '24px 40px',
          borderRadius: 16,
          border: `1px solid ${theme.hairline}`,
          opacity: install,
          transform: `translateY(${interpolate(install, [0, 1], [24, 0])}px)`,
        }}
      >
        <span style={{ color: theme.faint }}>$ </span>
        npm install react-native-canvas-kit
      </div>
      <div
        style={{
          fontSize: isSquare ? 24 : 30,
          color: theme.muted,
          opacity: link,
          transform: `translateY(${interpolate(link, [0, 1], [20, 0])}px)`,
        }}
      >
        github.com/adithyavis/react-native-canvas-kit
      </div>
    </AbsoluteFill>
  );
};
