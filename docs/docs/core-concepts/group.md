---
sidebar_position: 3
title: Group
---

# Group

A `Group` is a transformable container you can nest anywhere inside a
[`Layer`](./layer.md) (or another group). Transforms, opacity, and events applied
to a group cascade to its children, so a group behaves like a single compound
object.

```tsx
import { Group, Rect, Circle, Text } from 'react-native-canvas-kit';

<Group x={100} y={120} rotation={-8} draggable>
  <Rect x={0} y={0} width={160} height={64} cornerRadius={12} fill="#fff" />
  <Circle x={32} y={32} radius={18} fill="#8a2be2" />
  <Text text="Badge" x={64} y={22} font={font} fill="#1b0030" />
</Group>;
```

Dragging the group above moves all three children together; the children keep
their own local coordinates.

## Props

`Group` accepts every shared [node prop](./nodes-and-transforms.md): `x`, `y`,
`scale` / `scaleX` / `scaleY`, `rotation`, `skewX` / `skewY`, `offset`,
`opacity`, `visible`, `id`, `name`, `listening`, `draggable`, and the full set of
[event handlers](../interactivity/events.md).

## Why group?

- **Move/scale/rotate the whole cluster as one.**
- **Attach one transformer** to a group to resize the whole cluster.
- **Children are positioned relative to the group's origin.**

## Nesting

Groups nest arbitrarily. Each level composes its transform with its parent, so a
child's final position is the product of all ancestor transforms, the same
model used by every node in the tree (see
[Nodes & Transforms](./nodes-and-transforms.md)).
