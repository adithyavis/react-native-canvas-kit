import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { theme } from '../theme';
import { useIsSquare } from './SlideLayout';

export const LyricsCaption: React.FC<{ lines: string[]; stepLen: number }> = ({
  lines,
  stepLen,
}) => {
  const frame = useCurrentFrame();
  const isSquare = useIsSquare();
  const index = Math.min(lines.length - 1, Math.floor(frame / stepLen));
  const local = frame - index * stepLen;
  const shift = Math.min(18, stepLen * 0.5);
  const eased = interpolate(local, [stepLen - shift, stepLen], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.ease),
  });
  const scrollPos = index + eased;

  const lineStep = isSquare ? 62 : 92;
  const fontSize = isSquare ? 34 : 52;
  const viewport = lineStep * 5;
  const translateY = viewport / 2 - (scrollPos + 0.5) * lineStep;
  const mask =
    'linear-gradient(to bottom, transparent, #000 24%, #000 76%, transparent)';

  return (
    <div
      style={{
        position: 'relative',
        width: isSquare ? '100%' : 640,
        height: viewport,
        overflow: 'hidden',
        fontFamily: theme.sans,
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
  );
};
