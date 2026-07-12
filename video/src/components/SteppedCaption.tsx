import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { theme } from '../theme';
import { useIsSquare } from './SlideLayout';

export const SteppedCaption: React.FC<{
  steps: string[];
  stepLen: number;
  sub?: string;
}> = ({ steps, stepLen, sub }) => {
  const frame = useCurrentFrame();
  const isSquare = useIsSquare();
  const index = Math.min(steps.length - 1, Math.floor(frame / stepLen));
  const local = frame - index * stepLen;
  const y = interpolate(local, [0, 12], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        textAlign: isSquare ? 'center' : 'left',
        maxWidth: isSquare ? 900 : 640,
        fontFamily: theme.sans,
      }}
    >
      <div
        key={index}
        style={{
          fontSize: isSquare ? 60 : 84,
          fontWeight: 700,
          letterSpacing: -2,
          lineHeight: 1.05,
          color: theme.ink,
          transform: `translateY(${y}px)`,
        }}
      >
        {steps[index]}
      </div>
      {sub ? (
        <div
          style={{
            color: theme.muted,
            fontSize: isSquare ? 26 : 32,
            marginTop: 18,
            fontWeight: 500,
          }}
        >
          {sub}
        </div>
      ) : null}
    </div>
  );
};
