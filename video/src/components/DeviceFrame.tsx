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
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: statusH,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 18px',
            fontFamily: theme.sans,
            fontSize: Math.round(statusH * 0.42),
            fontWeight: 600,
            color: theme.ink,
            zIndex: 3,
          }}
        >
          <span>9:41</span>
          <span
            style={{
              width: 17,
              height: 9,
              border: `1.5px solid ${theme.ink}`,
              borderRadius: 2,
              position: 'relative',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 1.5,
                left: 1.5,
                bottom: 1.5,
                width: '68%',
                background: theme.ink,
                borderRadius: 1,
              }}
            />
          </span>
        </div>
        <div
          style={{
            position: 'absolute',
            top: Math.round(statusH * 0.34),
            left: '50%',
            marginLeft: -hole / 2,
            width: hole,
            height: hole,
            borderRadius: 999,
            background: '#0a0a0c',
            zIndex: 4,
          }}
        />
      </div>
    </div>
  );
};
