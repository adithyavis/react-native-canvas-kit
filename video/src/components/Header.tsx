import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { theme } from '../theme';

export const HEADER_SPACE_LANDSCAPE = 64;
export const HEADER_SPACE_SQUARE = 120;

export const Header: React.FC<{ introEnd: number; hideFrom: number }> = ({
  introEnd,
  hideFrom,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  if (frame >= hideFrom) {
    return null;
  }

  const isSquare = width < 1400;
  const settleStart = introEnd - 15;
  const settleEnd = introEnd - 2;
  const s = interpolate(frame, [settleStart, settleEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.ease),
  });

  const bigScale = isSquare ? 0.6 : 1;
  const smallScale = isSquare ? 0.34 : 0.44;
  const scale = interpolate(s, [0, 1], [bigScale, smallScale]);

  const parkedX = isSquare ? 40 + 130 : 70 + 250;
  const parkedY = isSquare ? 38 + 40 : 50 + 44;
  const cx = interpolate(s, [0, 1], [width / 2, parkedX]);
  const cy = interpolate(s, [0, 1], [height * 0.42, parkedY]);

  if (isSquare) {
    return;
  }

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          transform: `translate(${cx - width / 2}px, ${cy - height / 2}px) scale(${scale})`,
          textAlign: 'center',
          fontFamily: theme.sans,
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: -2,
            color: theme.ink,
            lineHeight: 1.0,
            whiteSpace: 'nowrap',
          }}
        >
          React Native Canvas Kit
        </div>
        <div
          style={{
            fontSize: 40,
            fontWeight: 500,
            color: theme.muted,
            marginTop: 14,
            whiteSpace: 'nowrap',
          }}
        >
          A batteries-included 2D canvas.
        </div>
      </div>
    </AbsoluteFill>
  );
};
