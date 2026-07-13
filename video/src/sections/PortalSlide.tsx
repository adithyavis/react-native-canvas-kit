import React from 'react';
import { SlideLayout } from '../components/SlideLayout';
import { LyricsCaption } from '../components/LyricsCaption';
import { DeviceVideo } from '../components/DeviceVideo';

const PORTAL_CLIP_SECONDS = 4.08;

export const PortalSlide: React.FC<{ duration: number }> = ({ duration }) => {
  return (
    <SlideLayout
      caption={
        <LyricsCaption
          lines={['Portal for React Native.']}
          stepLen={1}
          sub="Render React Native views as nodes."
        />
      }
    >
      <DeviceVideo
        src="portal.mp4"
        clipSeconds={PORTAL_CLIP_SECONDS}
        durationInFrames={duration}
      />
    </SlideLayout>
  );
};
