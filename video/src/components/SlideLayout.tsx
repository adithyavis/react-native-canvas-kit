import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { theme } from '../theme';
import { HEADER_SPACE_LANDSCAPE, HEADER_SPACE_SQUARE } from './Header';

export const useIsSquare = () => {
  const { width } = useVideoConfig();
  return width < 1400;
};

export const SlideLayout: React.FC<{
  caption: React.ReactNode;
  children: React.ReactNode;
}> = ({ caption, children }) => {
  const { width } = useVideoConfig();
  const isSquare = width < 1400;
  const headerSpace = isSquare ? HEADER_SPACE_SQUARE : HEADER_SPACE_LANDSCAPE;

  return (
    <AbsoluteFill
      style={{
        background: theme.bg,
        display: 'flex',
        flexDirection: isSquare ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: isSquare ? 'flex-start' : 'space-around',
        gap: isSquare ? 30 : 40,
        paddingTop: headerSpace,
        paddingLeft: isSquare ? 60 : 110,
        paddingRight: isSquare ? 60 : 110,
        paddingBottom: isSquare ? 40 : 0,
        fontFamily: theme.sans,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: isSquare ? 'center' : 'flex-start',
          flex: isSquare ? 'none' : '0 1 600px',
        }}
      >
        {caption}
      </div>
      <div style={{ flex: 'none', display: 'flex', justifyContent: 'center' }}>
        {children}
      </div>
    </AbsoluteFill>
  );
};
