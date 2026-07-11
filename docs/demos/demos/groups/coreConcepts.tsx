import type { ComponentType } from 'react';
import { useState } from 'react';
import {
  StyleSheet,
  Text as RNText,
  View,
  useWindowDimensions,
  type ViewStyle,
} from 'react-native';
import {
  Stage,
  Layer,
  BrushLayer,
  Group,
  Rect,
  Circle,
  Text,
  Transformer,
  SnapGrid,
  useFont,
  type EventObject,
  type TransformEvent,
} from 'react-native-canvas-kit';
import { DemoStage } from '../../src/DemoStage';
import { FONT_URL } from '../../src/scene';

function StageBasics() {
  return (
    <DemoStage logicalWidth={320} logicalHeight={280}>
      <Rect x={20} y={20} width={100} height={100} fill="#8a2be2" />
      <Rect
        x={140}
        y={60}
        width={120}
        height={80}
        cornerRadius={14}
        fill="#22d3ee"
      />
      <Circle x={210} y={200} radius={54} fill="#ff5aa5" />
    </DemoStage>
  );
}

function StageFillScreen() {
  const { width, height } = useWindowDimensions();
  return (
    <View style={styles.root}>
      <Stage width={width} height={height} style={styles.darkStage}>
        <Layer width={width} height={height} gestureEnabled>
          <Rect
            x={24}
            y={24}
            width={width - 48}
            height={height - 48}
            cornerRadius={20}
            fill="#171727"
          />
          <Circle
            x={width / 2}
            y={height / 2}
            radius={64}
            fill="#ff5aa5"
            draggable
          />
        </Layer>
      </Stage>
      <View style={styles.badge} pointerEvents="none">
        <RNText
          style={styles.badgeText}
        >{`${Math.round(width)} × ${Math.round(height)} · drag me`}</RNText>
      </View>
    </View>
  );
}

function StageBackground() {
  return (
    <DemoStage logicalWidth={280} logicalHeight={200} background="#a441e1">
      <Rect
        x={40}
        y={40}
        width={200}
        height={120}
        cornerRadius={18}
        fill="#ffffff"
      />
      <Circle x={140} y={100} radius={40} fill="#a441e1" />
    </DemoStage>
  );
}

const eraserCursor = {
  cursor: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Cg transform='rotate(-45 14 14)'%3E%3Crect x='5' y='11' width='18' height='9' rx='2' fill='%23ff5aa5' stroke='%231b0030' stroke-width='1.5'/%3E%3Crect x='5' y='16' width='18' height='4' fill='%23ffffff' opacity='0.35'/%3E%3C/g%3E%3C/svg%3E") 7 21, auto`,
} as unknown as ViewStyle;

function LayerStacking() {
  const { width, height } = useWindowDimensions();
  const font = useFont(FONT_URL, 24);
  return (
    <View style={[styles.root, eraserCursor]}>
      <Stage width={width} height={height} style={styles.stage}>
        <Layer width={width} height={height}>
          {font && (
            <Text
              text="This will not get erased."
              x={width / 2 - 100}
              y={height / 2 - 20}
              fill="black"
              font={font}
            />
          )}
        </Layer>
        <BrushLayer tool="eraser">
          {font && (
            <Text
              text="This will get erased!!"
              x={width / 2 - 100}
              y={height / 2 + 20}
              fill="black"
              font={font}
            />
          )}
        </BrushLayer>
      </Stage>
    </View>
  );
}

function LayerTappable() {
  const { width, height } = useWindowDimensions();
  const [selected, setSelected] = useState<string | null>(null);
  const [box, setBox] = useState({
    x: width / 2 - 80,
    y: height / 2 - 55,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
  });

  return (
    <View style={styles.root}>
      <Stage width={width} height={height} style={styles.stage}>
        <Layer
          width={width}
          height={height}
          gestureEnabled
          onTap={() => setSelected(null)}
        >
          <Rect
            id="card"
            x={box.x}
            y={box.y}
            scaleX={box.scaleX}
            scaleY={box.scaleY}
            rotation={box.rotation}
            width={160}
            height={110}
            cornerRadius={12}
            fill="#22d3ee"
            draggable
            scalable
            rotatable
            onTap={(e: EventObject) => {
              setSelected('#card');
              e.cancelBubble = true;
            }}
          />
          <Transformer
            node={selected}
            onTransformEnd={(e: TransformEvent) =>
              setBox({
                x: e.x,
                y: e.y,
                scaleX: e.scaleX,
                scaleY: e.scaleY,
                rotation: e.rotation,
              })
            }
          />
        </Layer>
      </Stage>
      <View style={styles.badge} pointerEvents="none">
        <RNText style={styles.badgeText}>
          {selected ? 'Tap empty space to deselect' : 'Tap the card to select'}
        </RNText>
      </View>
    </View>
  );
}

function GroupBadge() {
  const { width, height } = useWindowDimensions();
  const font = useFont(FONT_URL, 26);
  return (
    <View style={styles.root}>
      <Stage width={width} height={height} style={styles.stage}>
        <Layer width={width} height={height} gestureEnabled>
          <Group x={width / 2 - 130} y={height / 2 - 32} rotation={0} draggable>
            <Rect
              x={0}
              y={0}
              width={260}
              height={64}
              cornerRadius={12}
              fill="#ffffff"
              stroke="#e5d5ff"
              strokeWidth={2}
            />
            <Circle x={32} y={32} radius={18} fill="#8a2be2" />
            {font && (
              <Text text="Text 1" x={64} y={16} font={font} fill="#1b0030" />
            )}
            {font && (
              <Text text="Text 2" x={160} y={16} font={font} fill="#1b0030" />
            )}
          </Group>
        </Layer>
      </Stage>
      <View style={styles.badge} pointerEvents="none">
        <RNText style={styles.badgeText}>You can drag the whole group</RNText>
      </View>
    </View>
  );
}

function TransformPosition() {
  return (
    <DemoStage logicalWidth={320} logicalHeight={220}>
      <Rect x={40} y={80} width={100} height={60} fill="#8a2be2" />
    </DemoStage>
  );
}

function TransformScale() {
  return (
    <DemoStage logicalWidth={280} logicalHeight={220}>
      <Circle x={100} y={110} radius={40} fill="#e9d5ff" />
      <Circle
        x={100}
        y={110}
        radius={40}
        scaleX={1.5}
        scaleY={0.75}
        fill="#ff5aa5"
      />
    </DemoStage>
  );
}

function TransformOffsetPivot() {
  return (
    <View style={styles.root}>
      <DemoStage logicalWidth={300} logicalHeight={300}>
        <Rect
          x={150}
          y={180}
          width={100}
          height={100}
          offsetX={110}
          offsetY={110}
          rotation={-10}
          fill="#e9d5ff"
        />
        <Rect
          x={150}
          y={180}
          width={100}
          height={100}
          offsetX={110}
          offsetY={110}
          rotation={45}
          opacity={0.8}
          fill="#22d3ee"
        />
        <Rect
          x={150}
          y={180}
          width={100}
          height={100}
          offsetX={110}
          offsetY={110}
          rotation={100}
          opacity={0.8}
          fill="#ddee22"
        />
        <Circle x={150} y={180} radius={4} fill="#1b0030" />
      </DemoStage>
      <View style={styles.badge} pointerEvents="none">
        <RNText style={styles.badgeText}>
          Rotation around an offset pivot
        </RNText>
      </View>
    </View>
  );
}

function TransformBounds() {
  const { width, height } = useWindowDimensions();
  const [selected, setSelected] = useState<string | null>('bounded');
  const [box, setBox] = useState({
    x: width / 2 - 40,
    y: height / 2 - 40,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
  });

  return (
    <View style={styles.root}>
      <Stage width={width} height={height} style={styles.stage}>
        <Layer
          width={width}
          height={height}
          gestureEnabled
          onTap={() => setSelected(null)}
        >
          <Rect
            id="bounded"
            x={box.x}
            y={box.y}
            scaleX={box.scaleX}
            scaleY={box.scaleY}
            rotation={box.rotation}
            width={80}
            height={80}
            cornerRadius={10}
            fill="#22d3ee"
            draggable
            scalable
            rotatable
            minX={40}
            maxX={width - 120}
            minY={40}
            maxY={height - 120}
            minScaleX={0.5}
            maxScaleX={3}
            minScaleY={0.5}
            maxScaleY={3}
            minRotation={-45}
            maxRotation={45}
            onDragEnd={(e: EventObject) => {
              const { x, y } = e.currentTarget.getAbsolutePosition();
              setBox((b) => ({ ...b, x, y }));
            }}
            onTap={(e: EventObject) => {
              setSelected('#bounded');
              e.cancelBubble = true;
            }}
          />
          <Transformer
            node={selected}
            onTransformEnd={(e: TransformEvent) =>
              setBox({
                x: e.x,
                y: e.y,
                scaleX: e.scaleX,
                scaleY: e.scaleY,
                rotation: e.rotation,
              })
            }
          />
        </Layer>
      </Stage>
      <View style={styles.badge} pointerEvents="none">
        <RNText style={styles.badgeText}>
          Drag clamps to the edges. Rotation clamps to ±45°
        </RNText>
      </View>
    </View>
  );
}

function TransformSnapping() {
  const { width, height } = useWindowDimensions();
  return (
    <View style={styles.root}>
      <Stage width={width} height={height} style={styles.stage}>
        <Layer width={width} height={height} gestureEnabled>
          <Rect
            x={width / 2 - 60}
            y={height / 2 - 40}
            width={120}
            height={80}
            cornerRadius={10}
            fill="#8a2be2"
            draggable
            rotatable
            xEdgeSnaps={[0, width]}
            xCenterSnaps={[width / 2]}
            yEdgeSnaps={[0, height]}
            yCenterSnaps={[height / 2]}
            rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
          />
          <SnapGrid stroke="#ff2d87" strokeWidth={1} dash={[6, 6]} />
        </Layer>
      </Stage>
      <View style={styles.badge} pointerEvents="none">
        <RNText style={styles.badgeText}>
          Drag near the center or edges to snap
        </RNText>
      </View>
    </View>
  );
}

function SnapGridDemo() {
  const { width, height } = useWindowDimensions();
  const centerX = width / 2;
  const centerY = height / 2;
  return (
    <View style={styles.root}>
      <Stage width={width} height={height} style={styles.stage}>
        <Layer width={width} height={height} gestureEnabled>
          <Circle
            x={centerX - 90}
            y={centerY - 60}
            radius={44}
            fill="#8a2be2"
            draggable
            xCenterSnaps={[centerX]}
            yCenterSnaps={[centerY]}
          />
          <Rect
            x={centerX + 40}
            y={centerY + 20}
            width={100}
            height={70}
            cornerRadius={10}
            fill="#22d3ee"
            draggable
            xCenterSnaps={[centerX]}
            yCenterSnaps={[centerY]}
          />
          <SnapGrid stroke="#ff2d87" strokeWidth={1} dash={[6, 6]} />
        </Layer>
      </Stage>
      <View style={styles.badge} pointerEvents="none">
        <RNText style={styles.badgeText}>
          guides appear as a shape nears center
        </RNText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  stage: { backgroundColor: '#faf7ff' },
  darkStage: { backgroundColor: '#0b0b12' },
  badge: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6D28D9',
    backgroundColor: '#ffffffcc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
});

export const coreConceptsDemos: Record<string, ComponentType> = {
  'core-concepts-stage-1': StageBasics,
  'core-concepts-stage-2': StageFillScreen,
  'core-concepts-stage-3': StageBackground,
  'core-concepts-layer-1': LayerStacking,
  'core-concepts-layer-2': LayerTappable,
  'core-concepts-group-1': GroupBadge,
  'core-concepts-nodes-and-transforms-1': TransformPosition,
  'core-concepts-nodes-and-transforms-2': TransformScale,
  'core-concepts-nodes-and-transforms-3': TransformOffsetPivot,
  'core-concepts-nodes-and-transforms-4': TransformBounds,
  'core-concepts-nodes-and-transforms-5': TransformSnapping,
  'core-concepts-nodes-and-transforms-6': SnapGridDemo,
};
