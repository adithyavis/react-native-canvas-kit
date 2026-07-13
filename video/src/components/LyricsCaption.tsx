import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { theme } from '../theme';
import { useIsSquare } from './SlideLayout';

const Sub: React.FC<{ sub: string; isSquare: boolean }> = ({ sub, isSquare }) => (
  <div
    style={{
      color: theme.muted,
      fontSize: isSquare ? 26 : 32,
      fontWeight: 500,
      marginTop: 18,
      lineHeight: 1.35,
    }}
  >
    {sub}
  </div>
);

export const LyricsCaption: React.FC<{
  lines: string[];
  stepLen: number;
  sub?: string;
}> = ({ lines, stepLen, sub }) => {
  const frame = useCurrentFrame();
  const isSquare = useIsSquare();
  const index = Math.min(lines.length - 1, Math.floor(frame / stepLen));
  const fontSize = isSquare ? 34 : 52;

  if (lines.length === 1) {
    return (
      <div
        style={{
          textAlign: isSquare ? 'center' : 'left',
          width: '100%',
          fontFamily: theme.sans,
        }}
      >
        <div
          style={{
            fontSize,
            fontWeight: 700,
            letterSpacing: -1.5,
            lineHeight: 1.08,
            color: theme.ink,
          }}
        >
          {lines[0]}
        </div>
        {sub ? <Sub sub={sub} isSquare={isSquare} /> : null}
      </div>
    );
  }

  const scrollPos = index;
  const lineStep = isSquare ? 58 : 88;
  const viewport = lineStep * 5;
  const translateY = viewport / 2 - (scrollPos + 0.5) * lineStep;
  const mask =
    'linear-gradient(to bottom, transparent, #000 24%, #000 76%, transparent)';

  return (
    <div
      style={{
        textAlign: isSquare ? 'center' : 'left',
        width: '100%',
        fontFamily: theme.sans,
      }}
    >
      <div
        style={{
          position: 'relative',
          height: viewport,
          overflow: 'hidden',
          WebkitMaskImage: mask,
          maskImage: mask,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            transform: `translateY(${translateY}px)`,
          }}
        >
          {lines.map((text, i) => {
            const dist = Math.abs(i - scrollPos);
            const active = dist < 0.5;
            const opacity = interpolate(dist, [0, 1, 2.6], [1, 0.4, 0.06], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return (
              <div
                key={i}
                style={{
                  height: lineStep,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isSquare ? 'center' : 'flex-start',
                  fontSize,
                  fontWeight: active ? 700 : 600,
                  letterSpacing: -1.5,
                  color: active ? theme.ink : theme.muted,
                  opacity,
                }}
              >
                {text}
              </div>
            );
          })}
        </div>
      </div>
      {sub ? <Sub sub={sub} isSquare={isSquare} /> : null}
    </div>
  );
};
