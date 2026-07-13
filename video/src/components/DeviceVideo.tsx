import React from 'react';
import { OffthreadVideo, staticFile, useVideoConfig } from 'remotion';

export const fitPlaybackRate = (
  clipSeconds: number,
  durationInFrames: number,
  fps: number
) => (clipSeconds * fps) / durationInFrames;

export const DeviceVideo: React.FC<{
  src: string;
  clipSeconds: number;
  durationInFrames: number;
  aspect?: number;
}> = ({ src, clipSeconds, durationInFrames, aspect = 0.462 }) => {
  const { fps, width, height } = useVideoConfig();
  const isSquare = width < 1400;
  const displayHeight = Math.round(
    isSquare ? Math.min(height * 0.62, 660) : Math.min(height * 0.94, 900)
  );
  const displayWidth = Math.round(displayHeight * aspect);
  const radius = Math.round(displayWidth * 0.12);

  return (
    <div
      style={{
        width: displayWidth,
        height: displayHeight,
        borderRadius: radius,
        overflow: 'hidden',
        background: '#000',
        boxShadow:
          '0 44px 100px rgba(20,12,40,0.24), 0 12px 30px rgba(20,12,40,0.14)',
      }}
    >
      <OffthreadVideo
        src={staticFile(src)}
        playbackRate={fitPlaybackRate(clipSeconds, durationInFrames, fps)}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  );
};
