---
sidebar_position: 5
title: Infinite Canvas
---

# Infinite Canvas

Set `infinite` on the [`Stage`](./stage.md) to turn it into a pannable,
zoomable scene: one-finger drag pans the whole scene, two-finger pinch zooms it,
and content can live anywhere in scene coordinates.

```tsx
<Stage width={width} height={height} infinite>
  <Layer>{/* shapes at any coordinates */}</Layer>
</Stage>
```

Infinite mode is **not** a giant surface. The canvas stays the size of the
viewport; a scene transform (a pan offset and a zoom factor) is applied at the
root of the scene graph. Because every node's on-screen position is already
resolved by walking up to that root, hit-testing, [Portals](../portal/overview.md),
the [Transformer](../interactivity/transformer.md), and snapping all pan and
zoom for free.

## Gesture behavior

With `infinite`, gestures route to a shape when one is under the fingers, and to
the scene otherwise:

| Gesture           | On a matching node                | On empty space                    |
| ----------------- | --------------------------------- | --------------------------------- |
| One-finger drag   | Drags the node (if `draggable`)   | Pans the scene                    |
| Two-finger pinch  | Scales the node (if `scalable`)   | Zooms the scene                   |
| Two-finger rotate | Rotates the node (if `rotatable`) | Nothing — the scene never rotates |

So a note you can move and resize still declares `draggable scalable`; dragging
it moves the note, while dragging the background pans the board. The scene itself
only ever pans and zooms — it does not rotate.

## Zoom limits

Clamp how far the scene can zoom with `minZoom` / `maxZoom` (defaults `0.1` and
`10`):

```tsx
<Stage width={width} height={height} infinite minZoom={0.25} maxZoom={4} />
```

## Controlling the camera

Attach a `ref` to drive the scene imperatively through the
[`StageHandle`](./stage.md):

```tsx
const stageRef = useRef<StageHandle>(null);

stageRef.current?.zoomIn(); // zoom in around the viewport center
stageRef.current?.zoomOut();
stageRef.current?.zoomTo(2, { x: 200, y: 300 }); // zoom to 2x around a focal point
stageRef.current?.panTo(x, y); // set the scene offset
stageRef.current?.centerOn(x, y, 0.7); // center a scene point at a given zoom
stageRef.current?.resetView(); // back to offset 0, zoom 1
const scene = stageRef.current?.getScene(); // { x, y, scale }
```

| Method                             | Description                                                      |
| ---------------------------------- | ---------------------------------------------------------------- |
| `getScene()`                       | Current scene as `{ x, y, scale }`.                              |
| `zoomTo(scale, focal?)`            | Zoom to `scale` (clamped) around `focal` or the viewport center. |
| `zoomIn(step?)` / `zoomOut(step?)` | Multiply / divide the zoom by `step` (default `1.2`).            |
| `panTo(x, y)`                      | Set the scene offset directly.                                   |
| `centerOn(x, y, scale?)`           | Center the scene point `(x, y)` in the viewport at `scale`.      |
| `resetView()`                      | Reset to offset `0`, zoom `1`.                                   |

Use `centerOn` on mount to open the view on your content instead of the
top-left origin:

```tsx
useEffect(() => {
  stageRef.current?.centerOn(boardCenterX, boardCenterY, 0.7);
}, []);
```

### Observing scene changes

Pass `onSceneChange` to react to zoom on the JS thread — for example, to render a
live zoom percentage. It fires on integer-percent zoom changes, so it does not
flood React during a pinch:

```tsx
const [zoom, setZoom] = useState(1);

<Stage
  width={width}
  height={height}
  infinite
  onSceneChange={(scene) => setZoom(scene.scale)}
>
  {/* ... */}
</Stage>;

// elsewhere: <Text>{Math.round(zoom * 100)}%</Text>
```

## Reacting to the scene from children

`useSceneTransform()` exposes the live scene offset and zoom as shared values to
any component inside the `Stage`. It is the way to build scene-aware overlays —
a dot grid, rulers, a minimap — that stay crisp at every zoom without
re-rendering. Below, a grid keeps a constant on-screen dot spacing and size by
choosing them from the current zoom, entirely on the UI thread:

```tsx
import { useSceneTransform } from 'react-native-canvas-kit';
import { Path, Skia } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';

function DotGrid() {
  const scene = useSceneTransform();

  const path = useDerivedValue(() => {
    const p = Skia.Path.Make();
    if (!scene) return p;
    const scale = scene.sceneScaleSV.value.x || 1;
    const offset = scene.sceneOffsetSV.value;

    const left = -offset.x / scale;
    const top = -offset.y / scale;
    const right = (scene.width - offset.x) / scale;
    const bottom = (scene.height - offset.y) / scale;

    let spacing = 32;
    while (spacing * scale < 24) spacing *= 2;
    while (spacing * scale >= 48) spacing /= 2;

    const startX = Math.floor(left / spacing) * spacing;
    const startY = Math.floor(top / spacing) * spacing;
    for (let x = startX; x <= right; x += spacing) {
      for (let y = startY; y <= bottom; y += spacing) {
        p.addCircle(x, y, radius);
      }
    }
    return p;
  }, [scene]);

  return <Path path={path} color="#00000030" style="fill" />;
}
```

`useSceneTransform()` returns `{ sceneOffsetSV, sceneScaleSV, width, height }`,
or `null` outside a `Stage`. The scene scale is a `Vector2d`; the zoom is
uniform, so read `.x`.

## Rendering large scenes

The scene transform itself is cheap — it is one group transform on the GPU. What
costs, at scale, is **the number of nodes**. Every canvas-kit node (a `Rect`,
`Circle`, `Group`, …) is registered for hit-testing and carries its own
transform, so a scene with thousands of them pays for all of them every frame,
even the off-screen ones (Skia quick-rejects their _fill_, but the node tree is
still walked).

A few guidelines:

- **Interactive objects** (things you tap, drag, or transform) are the right use
  for canvas-kit nodes. Keep this to what the user actually manipulates.
- **Bulk decoration** (grids, backgrounds, particle fields) should be a single
  Skia primitive, like the `DotGrid` above — one node whose drawing is computed
  in a worklet, not one node per dot.
- **Large fields of static content** are cheapest drawn without per-item nodes:
  render them as raw `@shopify/react-native-skia` components (`RoundedRect`,
  `Text`, …) in a `React.memo`'d subtree so they mount once and are not
  reconciled on pan/zoom, or record them into a single `<Picture>`. Promote only
  the item currently being edited to a live, interactive node.

### Culling to the viewport

For very large scenes, `useRenderBounds(margin)` gives you the visible scene
rectangle (expanded by `margin`) as a **shared value**, updated on the UI thread
with hysteresis so it does not fire every frame. Consume it in a worklet to draw
only what is on screen, and use `rectIntersectsBounds` to test each item:

```tsx
import { useRenderBounds, rectIntersectsBounds } from 'react-native-canvas-kit';

const boundsSV = useRenderBounds(300); // SharedValue<VisibleBounds | null>
```

Because it is a shared value, `useRenderBounds` is for **worklet-driven**
rendering (a `<Picture>` or a Skia drawing). Mounting or unmounting canvas-kit
_nodes_ based on visibility is a React operation and must be driven from state,
so windowing a node list re-renders when the visible set changes — expected, and
the same model as `FlatList`.
