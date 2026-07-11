import type { ComponentType } from 'react';
import { useState } from 'react';
import {
  StyleSheet,
  Text as RNText,
  View,
  useWindowDimensions,
} from 'react-native';
import { Asset } from 'expo-asset';
import {
  Stage,
  Layer,
  Group,
  Rect,
  Circle,
  Star,
  Image,
  Transformer,
  SnapGrid,
  type EventObject,
  type TransformEvent,
  type TransformResult,
} from 'react-native-canvas-kit';
import { STICKERS } from '../../src/scene';

function Badge({ text }: { text: string }) {
  return (
    <View style={styles.badge} pointerEvents="none">
      <RNText style={styles.badgeText}>{text}</RNText>
    </View>
  );
}

function EventsTap() {
  const { width, height } = useWindowDimensions();
  const [count, setCount] = useState(0);
  return (
    <View style={styles.root}>
      <Stage width={width} height={height} style={styles.stage}>
        <Layer width={width} height={height} gestureEnabled>
          <Circle
            x={width / 2}
            y={height / 2}
            radius={60}
            fill="#8a2be2"
            name="orb"
            onTap={(e: EventObject) => setCount((prev) => prev + 1)}
          />
        </Layer>
      </Stage>
      <View style={styles.badge} pointerEvents="none">
        <RNText style={styles.badgeText}>
          Tap the circle. No of taps: {count} times
        </RNText>
      </View>
    </View>
  );
}

function EventsEventObject() {
  const { width, height } = useWindowDimensions();
  const [info, setInfo] = useState('tap the card');
  return (
    <View style={styles.root}>
      <Stage width={width} height={height} style={styles.stage}>
        <Layer width={width} height={height} gestureEnabled>
          <Rect
            x={width / 2 - 80}
            y={height / 2 - 55}
            width={160}
            height={110}
            cornerRadius={12}
            fill="#22d3ee"
            name="card"
            onTap={(e: EventObject) =>
              setInfo(`type: ${e.type} · target: ${e.target.name}`)
            }
          />
        </Layer>
      </Stage>
      <Badge text={info} />
    </View>
  );
}

function EventsNodeHandle() {
  const { width, height } = useWindowDimensions();
  const [info, setInfo] = useState('drag, then tap to read values');
  return (
    <View style={styles.root}>
      <Stage width={width} height={height} style={styles.stage}>
        <Layer width={width} height={height} gestureEnabled>
          <Rect
            x={width / 2 - 70}
            y={height / 2 - 50}
            width={140}
            height={100}
            cornerRadius={12}
            fill="#ff5aa5"
            name="handle"
            rotation={12}
            draggable
            onTap={(e: EventObject) => {
              const { x, y } = e.target.getAbsolutePosition();
              setInfo(
                `x ${Math.round(x)} · y ${Math.round(y)} · rot ${Math.round(
                  e.target.getRotation()
                )}°`
              );
            }}
          />
        </Layer>
      </Stage>
      <Badge text={info} />
    </View>
  );
}

function EventsAbsolutePosition() {
  const { width, height } = useWindowDimensions();
  const [info, setInfo] = useState('drag the card, then tap it');
  return (
    <View style={styles.root}>
      <Stage width={width} height={height} style={styles.stage}>
        <Layer width={width} height={height} gestureEnabled>
          <Rect
            id="card"
            name="card"
            x={width / 2 - 60}
            y={height / 2 - 40}
            width={120}
            height={80}
            cornerRadius={12}
            fill="#22d3ee"
            draggable
            onTap={(e: EventObject) => {
              const { x, y } = e.target.getAbsolutePosition();
              setInfo(`card at ${Math.round(x)}, ${Math.round(y)}`);
            }}
          />
        </Layer>
      </Stage>
      <Badge text={info} />
    </View>
  );
}

function EventsBubbling() {
  const { width, height } = useWindowDimensions();
  const [selected, setSelected] = useState<string | null>(null);
  const [box, setBox] = useState({
    x: width / 2 - 60,
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
            id="box"
            x={box.x}
            y={box.y}
            scaleX={box.scaleX}
            scaleY={box.scaleY}
            rotation={box.rotation}
            width={120}
            height={80}
            cornerRadius={12}
            fill="#8a2be2"
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
      <Badge
        text={
          selected
            ? 'Tap empty space to deselect the shape'
            : 'Tap the shape to select it'
        }
      />
    </View>
  );
}

function DragCircle() {
  const { width, height } = useWindowDimensions();
  return (
    <View style={styles.root}>
      <Stage width={width} height={height} style={styles.stage}>
        <Layer width={width} height={height} gestureEnabled>
          <Circle
            x={width / 2}
            y={height / 2}
            radius={50}
            fill="#8a2be2"
            draggable
          />
        </Layer>
      </Stage>
      <Badge text="drag the circle" />
    </View>
  );
}

function DragLifecycle() {
  const { width, height } = useWindowDimensions();
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  return (
    <View style={styles.root}>
      <Stage width={width} height={height} style={styles.stage}>
        <Layer width={width} height={height} gestureEnabled>
          <Circle
            x={width / 2}
            y={height / 2}
            radius={50}
            fill={active ? '#f97316' : '#8a2be2'}
            draggable
            onDragStart={() => setActive(true)}
            onDragEnd={(e: EventObject) => {
              setActive(false);
              const { x, y } = e.currentTarget.getAbsolutePosition();
              setPos({ x: Math.round(x), y: Math.round(y) });
            }}
          />
        </Layer>
      </Stage>
      <Badge
        text={
          active
            ? 'Dragging…'
            : pos
              ? `Dropped at ${pos.x}, ${pos.y}`
              : 'Drag the circle'
        }
      />
    </View>
  );
}

function DragDistance() {
  const { width, height } = useWindowDimensions();
  return (
    <View style={styles.root}>
      <Stage width={width} height={height} style={styles.stage}>
        <Layer width={width} height={height} gestureEnabled>
          <Rect
            x={width / 2 - 50}
            y={height / 2 - 50}
            width={100}
            height={100}
            cornerRadius={12}
            fill="#22d3ee"
            draggable
            dragDistance={25}
          />
        </Layer>
      </Stage>
      <Badge text="DragDistance is 25. Move 25px before it drags" />
    </View>
  );
}

function DragPersist() {
  const { width, height } = useWindowDimensions();
  const [pos, setPos] = useState({ x: width / 2, y: height / 2 });
  return (
    <View style={styles.root}>
      <Stage width={width} height={height} style={styles.stage}>
        <Layer width={width} height={height} gestureEnabled>
          <Circle
            x={pos.x}
            y={pos.y}
            radius={50}
            fill="#8a2be2"
            draggable
            onDragEnd={(e: EventObject) => {
              const p = e.currentTarget.getAbsolutePosition();
              setPos({ x: p.x, y: p.y });
            }}
          />
        </Layer>
      </Stage>
      <Badge text={`state: ${Math.round(pos.x)}, ${Math.round(pos.y)}`} />
    </View>
  );
}

function DragGroup() {
  const { width, height } = useWindowDimensions();
  return (
    <View style={styles.root}>
      <Stage width={width} height={height} style={styles.stage}>
        <Layer width={width} height={height} gestureEnabled>
          <Group x={width / 2 - 60} y={height / 2 - 35} draggable>
            <Rect
              x={0}
              y={0}
              width={120}
              height={70}
              cornerRadius={12}
              fill="#ffffff"
            />
            <Circle x={24} y={35} radius={16} fill="#ff5aa5" />
            <Circle x={90} y={35} radius={16} fill="#22d3ee" />
          </Group>
        </Layer>
      </Stage>
      <Badge text="Drag the whole group" />
    </View>
  );
}

function GesturesImage() {
  const { width, height } = useWindowDimensions();
  const [t, setT] = useState({
    x: width / 2,
    y: height / 2,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
  });
  const src = Asset.fromModule(STICKERS[3]!.src).uri;
  return (
    <View style={styles.root}>
      <Stage width={width} height={height} style={styles.stage}>
        <Layer width={width} height={height} gestureEnabled>
          <Image
            src={src}
            x={t.x}
            y={t.y}
            scaleX={t.scaleX}
            scaleY={t.scaleY}
            rotation={t.rotation}
            width={120}
            height={120}
            draggable
            scalable
            rotatable
            onTransformEnd={(e: EventObject) => {
              const r = e.evt as TransformResult;
              setT({
                x: r.x,
                y: r.y,
                scaleX: r.scaleX,
                scaleY: r.scaleY,
                rotation: r.rotation,
              });
            }}
          />
        </Layer>
      </Stage>
      <Badge text="You can drag, pinch (on touch devices) and rotate (on touch devices)" />
    </View>
  );
}

function GesturesSensitivity() {
  const { width, height } = useWindowDimensions();
  const [t, setT] = useState({
    x: width / 2,
    y: height / 2,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
  });
  return (
    <View style={styles.root}>
      <Stage
        width={width}
        height={height}
        style={styles.stage}
        pinchSensitivity={1.2}
        rotationSensitivity={0.8}
      >
        <Layer width={width} height={height} gestureEnabled>
          <Star
            x={t.x}
            y={t.y}
            scaleX={t.scaleX}
            scaleY={t.scaleY}
            rotation={t.rotation}
            numPoints={5}
            innerRadius={30}
            outerRadius={66}
            fill="#FBBF24"
            stroke="#F59E0B"
            strokeWidth={4}
            draggable
            scalable
            rotatable
            onTransformEnd={(e: EventObject) => {
              const r = e.evt as TransformResult;
              setT({
                x: r.x,
                y: r.y,
                scaleX: r.scaleX,
                scaleY: r.scaleY,
                rotation: r.rotation,
              });
            }}
          />
        </Layer>
      </Stage>
      <Badge text="Scaling happens faster, rotation happens slower" />
    </View>
  );
}

function TransformerEditor() {
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
      <Badge text="Tap the shape, then drag the handles" />
    </View>
  );
}

function TransformerPersist() {
  const { width, height } = useWindowDimensions();
  const [selected, setSelected] = useState<string | null>('#star');
  const [box, setBox] = useState({
    x: width / 2,
    y: height / 2,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
  });
  const commit = (t: TransformResult) =>
    setBox({
      x: t.x,
      y: t.y,
      scaleX: t.scaleX,
      scaleY: t.scaleY,
      rotation: t.rotation,
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
          <Star
            id="star"
            x={box.x}
            y={box.y}
            scaleX={box.scaleX}
            scaleY={box.scaleY}
            rotation={box.rotation}
            numPoints={5}
            innerRadius={28}
            outerRadius={62}
            fill="#FBBF24"
            stroke="#F59E0B"
            strokeWidth={4}
            draggable
            onTap={(e: EventObject) => {
              setSelected('#star');
              e.cancelBubble = true;
            }}
          />
          <Transformer
            node={selected}
            onTransformEnd={(e: TransformEvent) => commit(e)}
          />
        </Layer>
      </Stage>
      <Badge text="transform, release to persist to state" />
    </View>
  );
}

function TransformerEvent() {
  const { width, height } = useWindowDimensions();
  const [selected, setSelected] = useState<string | null>('#evtbox');
  const [info, setInfo] = useState('drag a handle to read the event');
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
            id="evtbox"
            x={box.x}
            y={box.y}
            scaleX={box.scaleX}
            scaleY={box.scaleY}
            rotation={box.rotation}
            width={160}
            height={110}
            cornerRadius={12}
            fill="#8a2be2"
            draggable
            onTap={(e: EventObject) => {
              setSelected('#evtbox');
              e.cancelBubble = true;
            }}
          />
          <Transformer
            node={selected}
            onTransform={(e: TransformEvent) =>
              setInfo(
                `scale ${e.scaleX.toFixed(2)} · rot ${Math.round(
                  e.rotation
                )}° · ${e.anchor}`
              )
            }
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
      <Badge text={info} />
    </View>
  );
}

function TransformerAnchors() {
  const { width, height } = useWindowDimensions();
  const [selected, setSelected] = useState<string | null>('#pic');
  const [t, setT] = useState({
    x: width / 2 - 60,
    y: height / 2 - 60,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
  });
  const src = Asset.fromModule(STICKERS[7]!.src).uri;
  return (
    <View style={styles.root}>
      <Stage width={width} height={height} style={styles.stage}>
        <Layer
          width={width}
          height={height}
          gestureEnabled
          onTap={() => setSelected(null)}
        >
          <Image
            id="pic"
            src={src}
            x={t.x}
            y={t.y}
            scaleX={t.scaleX}
            scaleY={t.scaleY}
            rotation={t.rotation}
            width={120}
            height={120}
            draggable
            scalable
            rotatable
            onTap={(e: EventObject) => {
              setSelected('#pic');
              e.cancelBubble = true;
            }}
          />
          <Transformer
            node={selected}
            keepRatio
            enabledAnchors={[
              'top-left',
              'top-right',
              'bottom-left',
              'bottom-right',
              'rotater',
            ]}
            onTransformEnd={(e: TransformEvent) =>
              setT({
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
      <Badge text="Only corner and rotation anchors are visible" />
    </View>
  );
}

function TransformerRotationSnaps() {
  const { width, height } = useWindowDimensions();
  const [selected, setSelected] = useState<string | null>('#snapbox');
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
            id="snapbox"
            x={box.x}
            y={box.y}
            scaleX={box.scaleX}
            scaleY={box.scaleY}
            rotation={box.rotation}
            width={160}
            height={110}
            cornerRadius={12}
            fill="#ff5aa5"
            draggable
            scalable
            rotatable
            onTap={(e: EventObject) => {
              setSelected('#snapbox');
              e.cancelBubble = true;
            }}
          />
          <Transformer
            node={selected}
            rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
            rotationSnapTolerance={8}
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
      <Badge text="Rotate near 45° increments to snap" />
    </View>
  );
}

function BoundsNode() {
  const { width, height } = useWindowDimensions();
  const [selected, setSelected] = useState<string | null>('#bounded');
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
            minX={0}
            maxX={width - 80}
            minY={0}
            maxY={height - 80}
            minScaleX={0.5}
            maxScaleX={3}
            minRotation={-45}
            maxRotation={45}
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
      <Badge text="Rotation clamps to ±45°. Scale clamps to 0.5–3×" />
    </View>
  );
}

function SnappingNode() {
  const { width, height } = useWindowDimensions();
  const [box, setBox] = useState({
    x: width / 2 - 60,
    y: height / 2 - 40,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
  });
  return (
    <View style={styles.root}>
      <Stage width={width} height={height} style={styles.stage}>
        <Layer width={width} height={height} gestureEnabled>
          <Rect
            x={box.x}
            y={box.y}
            scaleX={box.scaleX}
            scaleY={box.scaleY}
            rotation={box.rotation}
            width={120}
            height={80}
            cornerRadius={10}
            fill="#8a2be2"
            draggable
            rotatable
            xEdgeSnaps={[0, width]}
            xCenterSnaps={[width / 2]}
            yEdgeSnaps={[0, height]}
            rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
            onTransformEnd={(e: EventObject) => {
              const r = e.evt as TransformResult;
              setBox({
                x: r.x,
                y: r.y,
                scaleX: r.scaleX,
                scaleY: r.scaleY,
                rotation: r.rotation,
              });
            }}
          />
          <SnapGrid tolerance={10} dash={[6, 6]} />
        </Layer>
      </Stage>
      <Badge text="Drag near the center or edges to snap" />
    </View>
  );
}

function SnapGridVisual() {
  const { width, height } = useWindowDimensions();
  return (
    <View style={styles.root}>
      <Stage width={width} height={height} style={styles.stage}>
        <Layer width={width} height={height} gestureEnabled>
          <Circle
            x={width / 2 - 90}
            y={height / 2}
            radius={44}
            fill="#22d3ee"
            draggable
            xCenterSnaps={[width / 2]}
            yCenterSnaps={[height / 2]}
          />
          <Rect
            x={width / 2 + 40}
            y={height / 2 - 40}
            width={110}
            height={80}
            cornerRadius={10}
            fill="#ff5aa5"
            draggable
            xEdgeSnaps={[0, width]}
            xCenterSnaps={[width / 2]}
            yCenterSnaps={[height / 2]}
          />
          <SnapGrid stroke="#ff2d87" strokeWidth={1} dash={[6, 6]} />
        </Layer>
      </Stage>
      <Badge text="Drag a shape toward the center" />
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

export const interactivityDemos: Record<string, ComponentType> = {
  'interactivity-events-1': EventsTap,
  'interactivity-events-2': EventsEventObject,
  'interactivity-events-3': EventsNodeHandle,
  'interactivity-events-4': EventsAbsolutePosition,
  'interactivity-events-5': EventsBubbling,
  'interactivity-drag-and-drop-1': DragCircle,
  'interactivity-drag-and-drop-2': DragLifecycle,
  'interactivity-drag-and-drop-3': DragDistance,
  'interactivity-drag-and-drop-4': DragPersist,
  'interactivity-drag-and-drop-5': DragGroup,
  'interactivity-gestures-1': GesturesImage,
  'interactivity-gestures-2': GesturesSensitivity,
  'interactivity-transformer-1': TransformerEditor,
  'interactivity-transformer-2': TransformerPersist,
  'interactivity-transformer-3': TransformerEvent,
  'interactivity-transformer-4': TransformerAnchors,
  'interactivity-transformer-5': TransformerRotationSnaps,
  'interactivity-bounds-and-snapping-1': BoundsNode,
  'interactivity-bounds-and-snapping-2': SnappingNode,
  'interactivity-bounds-and-snapping-3': SnapGridVisual,
};
