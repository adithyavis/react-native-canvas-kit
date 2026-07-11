import type { ComponentType } from 'react';
import { useState } from 'react';
import {
  StyleSheet,
  Text as RNText,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  Stage,
  Layer,
  Rect,
  Circle,
  Transformer,
  type EventObject,
  type TransformEvent,
} from 'react-native-canvas-kit';
import { DemoStage } from '../../src/DemoStage';

function FirstCanvas() {
  return (
    <DemoStage logicalWidth={320} logicalHeight={280}>
      <Rect
        x={30}
        y={40}
        width={140}
        height={90}
        cornerRadius={16}
        fill="#8a2be2"
      />
      <Circle
        x={230}
        y={170}
        radius={60}
        fill="#ff5aa5"
        stroke="#1b0030"
        strokeWidth={6}
      />
    </DemoStage>
  );
}

function DraggableCircle() {
  const { width, height } = useWindowDimensions();
  return (
    <View style={styles.root}>
      <Stage width={width} height={height} style={styles.stage}>
        <Layer width={width} height={height} gestureEnabled>
          <Circle
            x={width / 2}
            y={height / 2}
            radius={60}
            fill="#ff5aa5"
            draggable
          />
        </Layer>
      </Stage>
    </View>
  );
}

function DraggableWithEvents() {
  const { width, height } = useWindowDimensions();
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  return (
    <View style={styles.root}>
      <Stage width={width} height={height} style={styles.stage}>
        <Layer width={width} height={height} gestureEnabled>
          <Circle
            x={width / 2}
            y={height / 2}
            radius={60}
            fill="#ff5aa5"
            draggable
            onDragEnd={(e: EventObject) => {
              const { x, y } = e.currentTarget.getAbsolutePosition();
              setPos({ x: Math.round(x), y: Math.round(y) });
            }}
          />
        </Layer>
      </Stage>
      <View style={styles.badge} pointerEvents="none">
        <RNText style={styles.badgeText}>
          {pos ? `Dropped at ${pos.x}, ${pos.y}` : 'Drag the circle'}
        </RNText>
      </View>
    </View>
  );
}

function Editor() {
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
          onTap={() => setSelected(null)}
          width={width}
          height={height}
          gestureEnabled
        >
          <Rect
            id="box"
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
            rotatable
            scalable
            onTap={(e: EventObject) => {
              setSelected('#box');
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
          Tap the rectangle to attach a Transformer
        </RNText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  stage: { backgroundColor: '#faf7ff' },
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

export const gettingStartedDemos: Record<string, ComponentType> = {
  'quick-start-1': FirstCanvas,
  'quick-start-2': DraggableCircle,
  'quick-start-3': DraggableWithEvents,
  'quick-start-4': Editor,
};
