---
sidebar_position: 2
title: Drag & Drop
---

# Drag & Drop

Add `draggable` to any node and it follows your finger. Position updates run on
the UI thread, so dragging stays smooth even under JS-thread load.

```tsx
<Circle x={120} y={120} radius={50} fill="#8a2be2" draggable />
```

## Enabling drag

Dragging is **opt-in per node**. Set the flag on any node you want to move:

| Prop | Default | Enables |
| --- | --- | --- |
| `draggable` | `false` | One-finger drag. |
| `dragDistance` | `3` | Pixels of movement before a drag starts. |

`draggable` is independent of the scale and rotate flags (see
[Multi-touch Gestures](./gestures.md)), so a node can be draggable without being
scalable or rotatable, and the other way around.

## Drag lifecycle

| Handler | Fires when |
| --- | --- |
| `onDragStart` | Movement passes the `dragDistance` threshold. |
| `onDragMove` | On each move while dragging. |
| `onDragEnd` | The finger lifts. |

```tsx
<Circle
  x={120}
  y={120}
  radius={50}
  fill="#8a2be2"
  draggable
  onDragStart={() => setActive(true)}
  onDragEnd={(e) => {
    setActive(false);
    const { x, y } = e.currentTarget.getAbsolutePosition();
    console.log('dropped at', x, y);
  }}
/>
```

## Activation threshold

`dragDistance` (default `3`) is how many pixels the finger must move before a
drag begins; this keeps taps from being misread as tiny drags. Raise it for
"stickier" taps:

```tsx
<Rect x={40} y={40} width={100} height={100} fill="#22d3ee" draggable dragDistance={8} />
```

## Persisting position

Dragging moves the node live via internal shared values. When the gesture ends,
commit the final transform to your React state so the position survives
re-renders; this is also what a [`Transformer`](./transformer.md) expects:

```tsx
const [pos, setPos] = useState({ x: 120, y: 120 });

<Circle
  x={pos.x}
  y={pos.y}
  radius={50}
  fill="#8a2be2"
  draggable
  onDragEnd={(e) => {
    const p = e.currentTarget.getAbsolutePosition();
    setPos({ x: p.x, y: p.y });
  }}
/>;
```

`onDragEnd` captures position only. If the node can also be scaled or rotated,
prefer `onTransformEnd`: it reports every kind of transform (position, scale, and
rotation) in one handler, and fires from both the node and an attached
[`Transformer`](./transformer.md). See
[Persisting the result](./gestures.md#persisting-the-result).

## Dragging groups

`draggable` works on a [`Group`](../core-concepts/group.md) too, moving the whole
group (and its children) as one:

```tsx
<Group x={100} y={100} draggable>
  <Rect x={0} y={0} width={120} height={70} fill="#fff" />
  <Circle x={24} y={35} radius={16} fill="#ff5aa5" />
</Group>
```
