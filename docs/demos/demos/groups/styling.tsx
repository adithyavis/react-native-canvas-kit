import type { ComponentType } from 'react';
import { Group, Rect, Circle, Line } from 'react-native-canvas-kit';
import { DemoStage } from '../../src/DemoStage';

function FillSolid() {
  return (
    <DemoStage logicalWidth={320} logicalHeight={320}>
      <Rect x={80} y={110} width={160} height={100} cornerRadius={12} fill="#8a2be2" />
    </DemoStage>
  );
}

function FillAndStroke() {
  return (
    <DemoStage logicalWidth={320} logicalHeight={320}>
      <Rect
        x={80}
        y={110}
        width={160}
        height={100}
        cornerRadius={12}
        fill="#ffffff"
        stroke="#1b0030"
        strokeWidth={4}
      />
    </DemoStage>
  );
}

function LineCapsAndJoins() {
  return (
    <DemoStage logicalWidth={320} logicalHeight={320}>
      <Line
        points={[40, 120, 110, 70, 180, 120, 250, 70, 280, 100]}
        stroke="#22d3ee"
        strokeWidth={16}
        lineCap="round"
        lineJoin="round"
      />
      <Line
        points={[40, 240, 110, 190, 180, 240, 250, 190, 280, 220]}
        stroke="#ff5aa5"
        strokeWidth={16}
        lineCap="butt"
        lineJoin="miter"
      />
    </DemoStage>
  );
}

function DashedStroke() {
  return (
    <DemoStage logicalWidth={320} logicalHeight={320}>
      <Rect
        x={80}
        y={110}
        width={160}
        height={100}
        cornerRadius={12}
        stroke="#8a2be2"
        strokeWidth={3}
        dash={[12, 8]}
      />
    </DemoStage>
  );
}

function LinearGradient() {
  return (
    <DemoStage logicalWidth={320} logicalHeight={320}>
      <Rect
        x={60}
        y={100}
        width={200}
        height={120}
        cornerRadius={12}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: 200, y: 120 }}
        fillLinearGradientColorStops={[0, '#8a2be2', 1, '#22d3ee']}
      />
    </DemoStage>
  );
}

function RadialGradient() {
  return (
    <DemoStage logicalWidth={320} logicalHeight={320}>
      <Circle
        x={160}
        y={160}
        radius={90}
        fillRadialGradientStartPoint={{ x: 0, y: 0 }}
        fillRadialGradientStartRadius={0}
        fillRadialGradientEndPoint={{ x: 0, y: 0 }}
        fillRadialGradientEndRadius={90}
        fillRadialGradientColorStops={[0, '#ffffff', 1, '#8a2be2']}
      />
    </DemoStage>
  );
}

function MultipleStops() {
  return (
    <DemoStage logicalWidth={320} logicalHeight={320}>
      <Rect
        x={60}
        y={100}
        width={200}
        height={120}
        cornerRadius={12}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: 200, y: 0 }}
        fillLinearGradientColorStops={[0, '#ff5aa5', 0.5, '#8a2be2', 1, '#22d3ee']}
      />
    </DemoStage>
  );
}

function OpacityCascade() {
  return (
    <DemoStage logicalWidth={320} logicalHeight={320}>
      <Group x={80} y={100} opacity={0.5}>
        <Rect x={0} y={0} width={100} height={100} cornerRadius={12} fill="#8a2be2" />
        <Circle x={120} y={50} radius={40} fill="#ff5aa5" />
      </Group>
    </DemoStage>
  );
}

function DropShadow() {
  return (
    <DemoStage logicalWidth={320} logicalHeight={320}>
      <Rect
        x={90}
        y={110}
        width={140}
        height={90}
        cornerRadius={12}
        fill="#ffffff"
        shadowColor="#000000"
        shadowBlur={16}
        shadowOffset={{ x: 0, y: 8 }}
        shadowOpacity={0.3}
      />
    </DemoStage>
  );
}

function BlendMode() {
  return (
    <DemoStage logicalWidth={320} logicalHeight={320}>
      <Circle x={130} y={160} radius={60} fill="#ff5aa5" />
      <Circle
        x={190}
        y={160}
        radius={60}
        fill="#22d3ee"
        globalCompositeOperation="multiply"
      />
    </DemoStage>
  );
}

function IntroHello() {
  return (
    <DemoStage logicalWidth={320} logicalHeight={320}>
      <Rect x={50} y={60} width={120} height={80} cornerRadius={12} fill="#8a2be2" />
      <Circle
        x={220}
        y={210}
        radius={50}
        fill="#ff5aa5"
        stroke="#1b0030"
        strokeWidth={4}
      />
    </DemoStage>
  );
}

export const stylingDemos: Record<string, ComponentType> = {
  'styling-fill-and-stroke-1': FillSolid,
  'styling-fill-and-stroke-2': FillAndStroke,
  'styling-fill-and-stroke-3': LineCapsAndJoins,
  'styling-fill-and-stroke-4': DashedStroke,
  'styling-gradients-1': LinearGradient,
  'styling-gradients-2': RadialGradient,
  'styling-gradients-3': MultipleStops,
  'styling-shadows-and-blend-1': OpacityCascade,
  'styling-shadows-and-blend-2': DropShadow,
  'styling-shadows-and-blend-3': BlendMode,
  'intro-1': IntroHello,
};
