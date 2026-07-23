import React from 'react';
import {
  Series,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { SlideLayout, useIsSquare } from '../components/SlideLayout';
import { DeviceVideo } from '../components/DeviceVideo';
import { theme } from '../theme';

type Phase = {
  id: string;
  caption: string;
  subtitle: string;
  video: string;
  videoSeconds: number;
  aspect: number;
};

const PHASES: Phase[] = [
  {
    id: 'shapes',
    caption: 'Add an Image. Or a circle. Or anything.',
    subtitle: 'Comes with pre-defined Shapes.',
    video: 'Canvas_shapes.mp4',
    videoSeconds: 3.15,
    aspect: 0.483,
  },
  {
    id: 'interactivity',
    caption: 'Drag it. Rotate it. Scale it.',
    subtitle: 'All on the UI thread; buttery smooth.',
    video: 'drag.mp4',
    videoSeconds: 6.38,
    aspect: 0.462,
  },
];

const PhaseCaption: React.FC<{ phase: Phase }> = ({ phase }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const isSquare = useIsSquare();
  const enter = spring({ frame, fps, config: { damping: 200 } });
  const y = interpolate(enter, [0, 1], [24, 0]);
  return (
    <div
      style={{
        textAlign: isSquare ? 'center' : 'left',
        maxWidth: isSquare ? 820 : 600,
        fontFamily: theme.sans,
        transform: isSquare ? `translateY(${0}px)` : `translateY(${y}px)`,
      }}
    >
      <div
        style={{
          fontSize: isSquare ? 46 : 62,
          fontWeight: 700,
          letterSpacing: -2,
          lineHeight: 1.08,
          color: theme.ink,
        }}
      >
        {phase.caption}
      </div>
      <div
        style={{
          fontSize: isSquare ? 26 : 32,
          fontWeight: 500,
          color: theme.muted,
          marginTop: 20,
          lineHeight: 1.35,
        }}
      >
        {phase.subtitle}
      </div>
    </div>
  );
};

const PhaseView: React.FC<{ phase: Phase; phaseLen: number }> = ({
  phase,
  phaseLen,
}) => (
  <SlideLayout caption={<PhaseCaption phase={phase} />}>
    <DeviceVideo
      src={phase.video}
      clipSeconds={phase.videoSeconds}
      durationInFrames={phaseLen}
      aspect={phase.aspect}
    />
  </SlideLayout>
);

export const CanvasSlide: React.FC<{ duration: number }> = ({ duration }) => {
  const phaseLen = Math.floor(duration / PHASES.length);
  return (
    <Series>
      {PHASES.map((phase) => (
        <Series.Sequence key={phase.id} durationInFrames={phaseLen}>
          <PhaseView phase={phase} phaseLen={phaseLen} />
        </Series.Sequence>
      ))}
    </Series>
  );
};
