import type { ComponentType } from 'react';
import { Circle, Ellipse, Line, Rect } from 'react-native-canvas-kit';
import { DemoStage } from '../../src/DemoStage';

function FillVsStroke() {
  return (
    <DemoStage logicalWidth={320} logicalHeight={320}>
      <Circle x={90} y={160} radius={50} fill="#8a2be2" />
      <Circle x={230} y={160} radius={50} stroke="#8a2be2" strokeWidth={6} />
    </DemoStage>
  );
}

function CircleBasic() {
  return (
    <DemoStage logicalWidth={320} logicalHeight={320}>
      <Circle x={160} y={160} radius={60} fill="#8a2be2" />
    </DemoStage>
  );
}

function CircleFilledOutlined() {
  return (
    <DemoStage logicalWidth={320} logicalHeight={320}>
      <Circle x={90} y={160} radius={50} fill="#22d3ee" />
      <Circle x={230} y={160} radius={50} stroke="#1b0030" strokeWidth={6} />
    </DemoStage>
  );
}

function CircleRing() {
  return (
    <DemoStage logicalWidth={320} logicalHeight={320}>
      <Circle x={160} y={160} radius={60} stroke="#ff5aa5" strokeWidth={14} />
    </DemoStage>
  );
}

function EllipseBasic() {
  return (
    <DemoStage logicalWidth={320} logicalHeight={320}>
      <Ellipse x={160} y={160} radiusX={110} radiusY={60} fill="#8a2be2" />
    </DemoStage>
  );
}

function EllipseStroked() {
  return (
    <DemoStage logicalWidth={320} logicalHeight={320}>
      <Ellipse
        x={160}
        y={160}
        radiusX={110}
        radiusY={60}
        fill="#22d3ee"
        stroke="#1b0030"
        strokeWidth={4}
      />
    </DemoStage>
  );
}

function RectBasic() {
  return (
    <DemoStage logicalWidth={320} logicalHeight={320}>
      <Rect
        x={80}
        y={110}
        width={160}
        height={100}
        cornerRadius={16}
        fill="#8a2be2"
      />
    </DemoStage>
  );
}

function RectRounded() {
  return (
    <DemoStage logicalWidth={320} logicalHeight={320}>
      <Rect
        x={90}
        y={115}
        width={140}
        height={90}
        cornerRadius={20}
        fill="#22d3ee"
      />
    </DemoStage>
  );
}

function RectOutlined() {
  return (
    <DemoStage logicalWidth={320} logicalHeight={320}>
      <Rect
        x={90}
        y={115}
        width={140}
        height={90}
        cornerRadius={8}
        stroke="#1b0030"
        strokeWidth={4}
      />
    </DemoStage>
  );
}

function RectCenteredRotation() {
  return (
    <DemoStage logicalWidth={320} logicalHeight={320}>
      <Rect
        x={160}
        y={160}
        width={120}
        height={80}
        offsetX={60}
        offsetY={40}
        rotation={20}
        fill="#ff5aa5"
      />
    </DemoStage>
  );
}

function LineBasic() {
  return (
    <DemoStage logicalWidth={320} logicalHeight={320}>
      <Line
        x={40}
        y={110}
        points={[0, 0, 80, 60, 160, 20, 240, 90]}
        stroke="#8a2be2"
        strokeWidth={4}
      />
    </DemoStage>
  );
}

function LinePointsFormat() {
  return (
    <DemoStage logicalWidth={320} logicalHeight={320}>
      <Line
        x={110}
        y={120}
        points={[0, 0, 50, 80, 100, 0]}
        stroke="#22d3ee"
        strokeWidth={3}
      />
    </DemoStage>
  );
}

function LineTension() {
  const pts = [0, 0, 60, 90, 120, 0, 180, 90, 240, 0];
  return (
    <DemoStage logicalWidth={320} logicalHeight={320}>
      <Line x={40} y={120} points={pts} stroke="#1b0030" strokeWidth={3} />
      <Line
        x={40}
        y={120}
        points={pts}
        stroke="#ff5aa5"
        strokeWidth={3}
        tension={0.5}
      />
    </DemoStage>
  );
}

function LineClosed() {
  return (
    <DemoStage logicalWidth={320} logicalHeight={320}>
      <Line
        x={100}
        y={115}
        points={[60, 0, 120, 90, 0, 90]}
        closed
        fill="#8a2be2"
        stroke="#1b0030"
        strokeWidth={2}
      />
    </DemoStage>
  );
}

function LineCapsAndJoins() {
  return (
    <DemoStage logicalWidth={320} logicalHeight={320}>
      <Line
        x={80}
        y={80}
        points={[0, 0, 80, 60, 160, 0]}
        stroke="#22d3ee"
        strokeWidth={12}
        lineCap="round"
        lineJoin="round"
      />
      <Line
        x={80}
        y={160}
        points={[0, 0, 80, 60, 160, 0]}
        stroke="#ff5aa5"
        strokeWidth={12}
        lineCap="butt"
        lineJoin="miter"
      />
    </DemoStage>
  );
}

export const shapesDemos: Record<string, ComponentType> = {
  'shapes-overview-1': FillVsStroke,
  'shapes-circle-1': CircleBasic,
  'shapes-circle-2': CircleFilledOutlined,
  'shapes-circle-3': CircleRing,
  'shapes-ellipse-1': EllipseBasic,
  'shapes-ellipse-2': EllipseStroked,
  'shapes-rect-1': RectBasic,
  'shapes-rect-2': RectRounded,
  'shapes-rect-3': RectOutlined,
  'shapes-rect-4': RectCenteredRotation,
  'shapes-line-1': LineBasic,
  'shapes-line-2': LinePointsFormat,
  'shapes-line-3': LineTension,
  'shapes-line-4': LineClosed,
  'shapes-line-5': LineCapsAndJoins,
};
