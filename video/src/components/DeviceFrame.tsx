import React from 'react';
import { theme } from '../theme';

export const DeviceFrame: React.FC<{
  screenHeight: number;
  children: React.ReactNode;
}> = ({ screenHeight, children }) => {
  const screenWidth = Math.round(screenHeight * 0.462);
  const bezel = Math.max(10, Math.round(screenHeight * 0.016));
  const screenRadius = Math.round(screenHeight * 0.062);
  const statusH = Math.round(screenHeight * 0.05);
  const hole = Math.round(screenHeight * 0.016);

  return (
    <div
      style={{
        position: 'relative',
        padding: bezel,
        background: '#0a0a0c',
        borderRadius: screenRadius + bezel + 6,
        boxShadow:
          '0 60px 140px rgba(20,12,40,0.28), 0 16px 40px rgba(20,12,40,0.16)',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: screenWidth,
          height: screenHeight,
          background: '#fff',
          borderRadius: screenRadius,
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
};
