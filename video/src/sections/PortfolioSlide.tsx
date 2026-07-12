import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { theme } from '../theme';
import { portfolio } from '../portfolio';
import type { PortfolioItem } from '../portfolio';
import { PortfolioMock } from '../components/PortfolioMocks';
import { HEADER_SPACE_LANDSCAPE, HEADER_SPACE_SQUARE } from '../components/Header';

const PortfolioCard: React.FC<{ item: PortfolioItem; index: number }> = ({
  item,
  index,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - 8 - index * 5, fps, config: { damping: 200 } });

  return (
    <div
      style={{
        breakInside: 'avoid',
        marginBottom: 18,
        borderRadius: 18,
        overflow: 'hidden',
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px) scale(${interpolate(s, [0, 1], [0.95, 1])})`,
        boxShadow: '0 22px 55px rgba(20,12,40,0.14)',
        aspectRatio: `1 / ${item.ratio}`,
        background: '#000',
        position: 'relative',
      }}
    >
      {item.image ? (
        <img
          src={staticFile(`portfolio/${item.source}`)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <PortfolioMock id={item.id} accent={item.accent} />
      )}
    </div>
  );
};

export const PortfolioSlide: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const isSquare = width < 1400;
  const drift = interpolate(frame, [0, duration], [14, -14]);
  const enter = spring({ frame, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill
      style={{
        background: theme.bg,
        display: 'flex',
        flexDirection: isSquare ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        gap: isSquare ? 30 : 60,
        paddingTop: isSquare ? HEADER_SPACE_SQUARE : HEADER_SPACE_LANDSCAPE,
        paddingLeft: isSquare ? 60 : 100,
        paddingRight: isSquare ? 60 : 100,
        paddingBottom: isSquare ? 50 : 40,
        fontFamily: theme.sans,
      }}
    >
      <div
        style={{
          flex: isSquare ? 'none' : '0 1 480px',
          textAlign: isSquare ? 'center' : 'left',
          opacity: enter,
          transform: `translateY(${interpolate(enter, [0, 1], [24, 0])}px)`,
        }}
      >
        <div
          style={{
            color: theme.ink,
            fontWeight: 700,
            letterSpacing: -2,
            fontSize: isSquare ? 64 : 96,
            lineHeight: 1.0,
          }}
        >
          Versatile.
        </div>
        <div
          style={{
            color: theme.muted,
            fontWeight: 500,
            fontSize: isSquare ? 26 : 36,
            marginTop: 22,
          }}
        >
          All on the UI thread.
        </div>
      </div>
      <div
        style={{
          flex: isSquare ? 'none' : '0 1 760px',
          width: isSquare ? '100%' : undefined,
          maxWidth: isSquare ? 760 : 780,
          maxHeight: isSquare ? '58%' : '90%',
          columnCount: isSquare ? 3 : 3,
          columnGap: 18,
          transform: `translateY(${drift}px)`,
        }}
      >
        {portfolio.map((item, i) => (
          <PortfolioCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
