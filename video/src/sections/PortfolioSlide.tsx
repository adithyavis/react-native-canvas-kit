import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { theme } from '../theme';
import { portfolio } from '../portfolio';
import type { PortfolioItem } from '../portfolio';
import { fitPlaybackRate } from '../components/DeviceVideo';
import { LyricsCaption } from '../components/LyricsCaption';
import {
  HEADER_SPACE_LANDSCAPE,
  HEADER_SPACE_SQUARE,
} from '../components/Header';

const ASPECT = 0.462;

const PhoneCard: React.FC<{
  item: PortfolioItem;
  index: number;
  duration: number;
  phoneWidth: number;
  phoneHeight: number;
  radius: number;
}> = ({ item, index, duration, phoneWidth, phoneHeight, radius }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - 6 - index * 4, fps, config: { damping: 200 } });
  const stagger = (index % 2 === 0 ? -1 : 1) * 20;

  return (
    <div
      style={{
        flex: 'none',
        width: phoneWidth,
        height: phoneHeight,
        borderRadius: radius,
        overflow: 'hidden',
        background: '#000',
        boxShadow: '0 28px 64px rgba(20,12,40,0.2)',
        opacity: s,
        transform: `translateY(${stagger + interpolate(s, [0, 1], [28, 0])}px) scale(${interpolate(s, [0, 1], [0.94, 1])})`,
      }}
    >
      <OffthreadVideo
        src={staticFile(`portfolio/${item.source}`)}
        playbackRate={fitPlaybackRate(item.clipSeconds, duration, fps)}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  );
};

export const PortfolioSlide: React.FC<{ duration: number }> = ({
  duration,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const isSquare = width < 1400;
  const enter = spring({ frame, fps, config: { damping: 200 } });

  const cols = portfolio.length;
  const gap = isSquare ? 12 : 16;
  const phonesAreaW = isSquare ? width - 120 : width - 200 - 360 - 50;
  const phoneWidth = Math.floor((phonesAreaW - gap * (cols - 1)) / cols);
  const phoneHeight = Math.round(phoneWidth / ASPECT);
  const radius = Math.round(phoneWidth * 0.12);

  return (
    <AbsoluteFill
      style={{
        background: theme.bg,
        display: 'flex',
        flexDirection: isSquare ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: isSquare ? 'flex-start' : 'space-between',
        gap: isSquare ? 30 : 50,
        paddingTop: isSquare ? HEADER_SPACE_SQUARE : HEADER_SPACE_LANDSCAPE,
        paddingLeft: isSquare ? 60 : 100,
        paddingRight: isSquare ? 60 : 100,
        paddingBottom: 40,
        fontFamily: theme.sans,
      }}
    >
      <div style={{ flex: isSquare ? 'none' : '0 0 360px', opacity: enter }}>
        <LyricsCaption
          lines={['Versatile.']}
          stepLen={1}
          sub="Canva, Docusign, Snapseed.. Countless opportunities"
        />
      </div>
      <div
        style={{
          display: 'flex',
          gap,
          justifyContent: 'center',
          alignItems: 'center',
          flex: isSquare ? 'none' : '1',
        }}
      >
        {portfolio.map((item, i) => (
          <PhoneCard
            key={item.id}
            item={item}
            index={i}
            duration={duration}
            phoneWidth={phoneWidth}
            phoneHeight={phoneHeight}
            radius={radius}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
