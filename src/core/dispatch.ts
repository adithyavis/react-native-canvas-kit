import type { EventObject, NodeEventHandlers, Vector2d } from './types';
import type { NodeRegistry } from './registry';
import { applyTransformsToPoint, invert, type Mat } from './matrix';
import { dist } from './geometry';

export const TYPE_TO_PROP_NAME: Record<string, keyof NodeEventHandlers> = {
  pointerdown: 'onPointerDown',
  pointermove: 'onPointerMove',
  pointerup: 'onPointerUp',
  touchstart: 'onTouchStart',
  touchmove: 'onTouchMove',
  touchend: 'onTouchEnd',
  click: 'onClick',
  tap: 'onTap',
  dblclick: 'onDblClick',
  dbltap: 'onDblTap',
  dragstart: 'onDragStart',
  dragmove: 'onDragMove',
  dragend: 'onDragEnd',
};

export const DEFAULT_DRAG_DISTANCE = 3;
export const TAP_SLOP = 5;
export const DBL_TAP_MS = 300;

export function dispatch(
  registry: NodeRegistry,
  type: string,
  targetId: number,
  evt: unknown
): EventObject {
  const eventPropName = TYPE_TO_PROP_NAME[type];
  const event: EventObject = {
    type,
    target: registry.getHandle(targetId),
    currentTarget: registry.getHandle(targetId),
    evt,
    cancelBubble: false,
  };
  if (!eventPropName) return event;
  const chain = registry.getAncestorChain(targetId);
  for (const id of chain) {
    const eventHandler = registry.getConfig(id)?.[eventPropName];
    if (eventHandler) {
      event.currentTarget = registry.getHandle(id);
      eventHandler(event);
      if (event.cancelBubble) break;
    }
  }
  return event;
}

export interface DragHost {
  setDragOffset: (id: number, x: number, y: number) => void;
}

interface PressState {
  startPt: Vector2d;
  startTime: number;
  downHitId: number | null;
  dragTargetId: number | null;
  dragDistance: number;
  dragging: boolean;
  parentInv: Mat | null;
  dragStartParentPt: Vector2d;
  baseOffset: Vector2d;
}

export class GestureController {
  private pressState: PressState | null = null;
  private lastTap: { targetId: number; time: number } | null = null;
  private offsets = new Map<number, Vector2d>();

  constructor(
    private registry: NodeRegistry,
    private rootId: number,
    private host: DragHost
  ) {}

  pointerDown(pt: Vector2d, evt: unknown, now: number): void {
    const hitId = this.registry.hitTest(pt, this.rootId);
    const dragTargetId =
      hitId != null ? this.registry.getDragTarget(hitId) : null;
    const dragDistance =
      (dragTargetId != null
        ? this.registry.getConfig(dragTargetId)?.dragDistance
        : undefined) ?? DEFAULT_DRAG_DISTANCE;
    this.pressState = {
      startPt: pt,
      startTime: now,
      downHitId: hitId,
      dragTargetId,
      dragDistance,
      dragging: false,
      parentInv: null,
      dragStartParentPt: { x: 0, y: 0 },
      baseOffset: { x: 0, y: 0 },
    };
    const target = hitId ?? this.rootId;
    dispatch(this.registry, 'pointerdown', target, evt);
    dispatch(this.registry, 'touchstart', target, evt);
  }

  pointerMove(pt: Vector2d, evt: unknown): void {
    const pressState = this.pressState;
    if (!pressState || pressState.dragTargetId == null) return;
    if (!pressState.dragging) {
      if (
        dist(pt.x, pt.y, pressState.startPt.x, pressState.startPt.y) <
        pressState.dragDistance
      )
        return;
      this.beginDrag(pressState, evt);
    }
    if (pressState.dragging && pressState.parentInv) {
      const cur = applyTransformsToPoint(pressState.parentInv, pt);
      const dx =
        pressState.baseOffset.x + (cur.x - pressState.dragStartParentPt.x);
      const dy =
        pressState.baseOffset.y + (cur.y - pressState.dragStartParentPt.y);
      this.offsets.set(pressState.dragTargetId, { x: dx, y: dy });
      this.host.setDragOffset(pressState.dragTargetId, dx, dy);
      dispatch(this.registry, 'dragmove', pressState.dragTargetId, evt);
    }
  }

  pointerUp(pt: Vector2d, evt: unknown, now: number): void {
    const pressState = this.pressState;
    this.pressState = null;
    if (!pressState) return;

    if (pressState.dragging && pressState.dragTargetId != null) {
      dispatch(this.registry, 'dragend', pressState.dragTargetId, evt);
    }

    const target = pressState.downHitId ?? this.rootId;
    dispatch(this.registry, 'pointerup', target, evt);
    dispatch(this.registry, 'touchend', target, evt);

    if (pressState.dragging || pressState.downHitId == null) return;

    const upHit = this.registry.hitTest(pt, this.rootId);
    if (
      dist(pt.x, pt.y, pressState.startPt.x, pressState.startPt.y) > TAP_SLOP ||
      upHit !== pressState.downHitId
    ) {
      return;
    }
    const tapTarget = pressState.downHitId;
    dispatch(this.registry, 'click', tapTarget, evt);
    dispatch(this.registry, 'tap', tapTarget, evt);
    if (
      this.lastTap &&
      this.lastTap.targetId === tapTarget &&
      now - this.lastTap.time <= DBL_TAP_MS
    ) {
      dispatch(this.registry, 'dblclick', tapTarget, evt);
      dispatch(this.registry, 'dbltap', tapTarget, evt);
      this.lastTap = null;
    } else {
      this.lastTap = { targetId: tapTarget, time: now };
    }
  }

  private beginDrag(pressState: PressState, evt: unknown): void {
    const id = pressState.dragTargetId!;
    const parentId = this.registry.getParentId(id);
    const parentAbs =
      parentId != null ? this.registry.getAbsoluteMatrix(parentId) : null;
    pressState.parentInv = parentAbs
      ? invert(parentAbs)
      : invert([1, 0, 0, 1, 0, 0]);
    if (pressState.parentInv) {
      pressState.dragStartParentPt = applyTransformsToPoint(
        pressState.parentInv,
        pressState.startPt
      );
    }
    pressState.baseOffset = this.offsets.get(id) ?? { x: 0, y: 0 };
    pressState.dragging = true;
    dispatch(this.registry, 'dragstart', id, evt);
  }
}
