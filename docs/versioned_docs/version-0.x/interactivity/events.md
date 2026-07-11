---
sidebar_position: 1
title: Events
---

import Demo from '@site/src/components/Demo';

# Events

Nodes respond to touch input through event handler props. Hit testing is
geometric and hierarchy-aware: the top-most shape under your finger receives the
event first, and it then **bubbles** up through parents to the stage.

```tsx
<Circle
  x={100}
  y={100}
  radius={40}
  fill="#8a2be2"
  onTap={(e) => console.log('tapped', e.target.name)}
/>
```

<Demo name="interactivity-events-1" title="Tap handler" height={460} />

## Handling taps

The most common handlers on touch devices:

| Prop                                          | Fires when                             |
| --------------------------------------------- | -------------------------------------- |
| `onTap`                                       | A finger taps the node.                |
| `onDblTap`                                    | Two quick taps on the node.            |
| `onPointerDown`                               | A pointer/touch goes down on the node. |
| `onPointerUp`                                 | A pointer/touch lifts off the node.    |
| `onTouchStart` / `onTouchMove` / `onTouchEnd` | Raw touch lifecycle.                   |

Drag-specific handlers (`onDragStart`, `onDragMove`, `onDragEnd`) are covered in
[Drag & Drop](./drag-and-drop.md); transform handlers live on the
[Transformer](./transformer.md).

> The type surface also includes desktop-style handlers (`onClick`,
> `onMouseMove`, `onMouseEnter`/`onMouseLeave`, `onWheel`, …) for API
> completeness. On touch devices, reach for `onTap` and the pointer/touch
> handlers.

## The event object

Every handler receives an `EventObject`:

```ts
interface EventObject<E = unknown> {
  type: string; // e.g. 'tap'
  target: NodeHandle; // the node the event started on
  currentTarget: NodeHandle; // the node currently handling it (changes while bubbling)
  evt: E; // the underlying native gesture event
  cancelBubble: boolean; // set true to stop bubbling
}
```

### `NodeHandle`

`target` and `currentTarget` are lightweight handles you can query for live
values:

```ts
interface NodeHandle {
  id: number;
  name?: string;
  getConfig(): NodeConfig;
  getX(): number;
  getY(): number;
  getScaleX(): number;
  getScaleY(): number;
  getRotation(): number;
  getAbsolutePosition(): { x: number; y: number };
}
```

```tsx
<Rect
  id="card"
  name="card"
  x={40}
  y={40}
  width={120}
  height={80}
  fill="#22d3ee"
  onTap={(e) => {
    const { x, y } = e.target.getAbsolutePosition();
    console.log('card at', x, y);
  }}
/>
```

## Bubbling & `cancelBubble`

After the target handles an event, it travels up to each ancestor's handler of
the same type. This lets a parent (say a `Layer`) react to taps on its children.

To stop propagation (the classic "tap a shape to select it, tap empty space to
deselect" pattern), set `cancelBubble` on the shape's handler so the tap doesn't
also reach the layer:

```tsx
<Layer
  width={width}
  height={height}
  onTap={() => setSelected(null)} // empty-space tap → deselect
>
  <Rect
    id="box"
    x={40}
    y={40}
    width={120}
    height={80}
    fill="#8a2be2"
    onTap={(e) => {
      setSelected('#box');
      e.cancelBubble = true; // don't let the layer also handle this tap
    }}
  />
</Layer>
```

<Demo name="interactivity-events-5" title="Bubbling & cancelBubble" height={460} />

## Enabling & disabling input

- `listening={false}` on a node (or the [`Stage`](../core-concepts/stage.md))
  turns off input for it and its subtree.
- Shapes and groups are hit-testable by default; a bare [`Layer`](../core-concepts/layer.md)
  needs a `width`/`height` to become a tap target.
