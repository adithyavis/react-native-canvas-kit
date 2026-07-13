import React from 'react';
import { SlideLayout } from '../components/SlideLayout';
import { LyricsCaption } from '../components/LyricsCaption';
import { DeviceVideo } from '../components/DeviceVideo';

const BRUSH_CLIP_SECONDS = 10.73;

export const BrushSlide: React.FC<{ duration: number }> = ({ duration }) => {
  return (
    <SlideLayout
      caption={
        <LyricsCaption
          lines={['One canvas, every brush.']}
          stepLen={1}
          sub="Pen, pencil, marker, highlighter, and tape."
        />
      }
    >
      <DeviceVideo
        src="brushes.mp4"
        clipSeconds={BRUSH_CLIP_SECONDS}
        durationInFrames={duration}
      />
    </SlideLayout>
  );
};
