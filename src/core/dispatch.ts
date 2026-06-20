import type { EventObject, NodeEventHandlers, Vector2d } from './types';
import type { NodeRegistry } from './registry';
import { DEFAULT_DRAG_DISTANCE, type OffsetLookup } from './snapshot';
import {
  pointerDown,
  pointerMove,
  pointerUp,
  type GestureEventCallbacks,
  type LastTap,
  type PressState,
  TAP_SLOP,
  DBL_TAP_MS,
} from './gestures';
import { createSharedValue } from './reanimated';

export { DEFAULT_DRAG_DISTANCE, TAP_SLOP, DBL_TAP_MS };

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

export class GestureController {
  private press = createSharedValue<PressState | null>(null);
  private lastTap = createSharedValue<LastTap | null>(null);
  private offsets = new Map<number, Vector2d>();
  private gestureEventCallbacks: GestureEventCallbacks;
  private getOffset: OffsetLookup;
  private lastEvt: unknown = null;

  constructor(
    private registry: NodeRegistry,
    private rootId: number,
    private host: DragHost
  ) {
    this.getOffset = (id) => this.offsets.get(id) ?? { x: 0, y: 0 };
    this.gestureEventCallbacks = {
      setOffset: (id, x, y) => {
        this.offsets.set(id, { x, y });
        this.host.setDragOffset(id, x, y);
      },
      on: (type, id) => dispatch(this.registry, type, id, this.lastEvt),
    };
  }

  pointerDown(pt: Vector2d, evt: unknown, now: number): void {
    this.lastEvt = evt;
    pointerDown(
      this.registry.getSnapshot(),
      this.getOffset,
      this.press,
      this.gestureEventCallbacks,
      this.rootId,
      pt.x,
      pt.y,
      now
    );
  }

  pointerMove(pt: Vector2d, evt: unknown): void {
    this.lastEvt = evt;
    pointerMove(
      this.registry.getSnapshot(),
      this.getOffset,
      this.press,
      this.gestureEventCallbacks,
      pt.x,
      pt.y
    );
  }

  pointerUp(pt: Vector2d, evt: unknown, now: number): void {
    this.lastEvt = evt;
    pointerUp(
      this.registry.getSnapshot(),
      this.getOffset,
      this.press,
      this.lastTap,
      this.gestureEventCallbacks,
      this.rootId,
      pt.x,
      pt.y,
      now
    );
  }
}
