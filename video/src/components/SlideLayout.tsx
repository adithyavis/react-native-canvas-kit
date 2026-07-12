import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { theme } from '../theme';
import { DeviceFrame } from './DeviceFrame';
import { HEADER_SPACE_LANDSCAPE, HEADER_SPACE_SQUARE } from './Header';

export const useIsSquare = () => {
  const { width } = useVideoConfig();
  return width < 1400;
};

export const SlideLayout: React.FC<{
  caption: React.ReactNode;
  children: React.ReactNode;
}> = ({ caption, children }) => {
  const { width, height } = useVideoConfig();
  const isSquare = width < 1400;
  const headerSpace = isSquare ? HEADER_SPACE_SQUARE : HEADER_SPACE_LANDSCAPE;
  const screenHeight = Math.round(
    isSquare ? Math.min(height * 0.44, 520) : Math.min(height * 0.72, 760)
  );

  return (
    <AbsoluteFill
      style={{
        background: theme.bg,
        display: 'flex',
        flexDirection: isSquare ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: isSquare ? 'flex-start' : 'space-around',
        gap: isSquare ? 36 : 40,
        paddingTop: headerSpace,
        paddingLeft: isSquare ? 60 : 110,
        paddingRight: isSquare ? 60 : 110,
        paddingBottom: isSquare ? 50 : 0,
        fontFamily: theme.sans,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: isSquare ? 'center' : 'flex-start',
          flex: isSquare ? 'none' : '0 1 640px',
        }}
      >
        {caption}
      </div>
      <div style={{ flex: 'none', display: 'flex', justifyContent: 'center' }}>
        <DeviceFrame screenHeight={screenHeight}>{children}</DeviceFrame>
      </div>
    </AbsoluteFill>
  );
};
