import { describe, it, expect } from '@jest/globals';
import {
  scenePanBegin,
  scenePanUpdate,
  scenePanEnd,
  sceneZoomBegin,
  sceneZoomUpdate,
  sceneZoomEnd,
  DEFAULT_MIN_ZOOM,
  DEFAULT_MAX_ZOOM,
  type ScenePanState,
  type SceneZoomState,
  type SceneBounds,
} from '../scene';
import type { SharedValue } from 'react-native-reanimated';
import type { Vector2d } from '../types';

function sv<T>(value: T): SharedValue<T> {
  return { value } as unknown as SharedValue<T>;
}

describe('scene pan', () => {
  it('translates the scene offset by the pointer delta', () => {
    const offset = sv<Vector2d>({ x: 10, y: 20 });
    const panState = sv<ScenePanState | null>(null);

    scenePanBegin(offset, panState, 100, 100);
    scenePanUpdate(offset, panState, 130, 90, null);

    expect(offset.value).toEqual({ x: 40, y: 10 });

    scenePanEnd(panState);
    expect(panState.value).toBeNull();
  });

  it('clamps the offset to the provided bounds', () => {
    const offset = sv<Vector2d>({ x: 0, y: 0 });
    const panState = sv<ScenePanState | null>(null);
    const bounds: SceneBounds = {
      minOffsetX: -50,
      maxOffsetX: 0,
      minOffsetY: -50,
      maxOffsetY: 0,
      minZoom: DEFAULT_MIN_ZOOM,
      maxZoom: DEFAULT_MAX_ZOOM,
    };

    scenePanBegin(offset, panState, 0, 0);
    scenePanUpdate(offset, panState, 999, -999, bounds);

    expect(offset.value).toEqual({ x: 0, y: -50 });
  });

  it('is a no-op when there is no active pan', () => {
    const offset = sv<Vector2d>({ x: 5, y: 5 });
    const panState = sv<ScenePanState | null>(null);
    scenePanUpdate(offset, panState, 100, 100, null);
    expect(offset.value).toEqual({ x: 5, y: 5 });
  });
});

describe('scene zoom', () => {
  it('keeps the scene point under the initial focal fixed (focal zoom)', () => {
    const offset = sv<Vector2d>({ x: 0, y: 0 });
    const scale = sv<Vector2d>({ x: 1, y: 1 });
    const zoomState = sv<SceneZoomState | null>(null);
    const touches: Vector2d[] = [
      { x: 180, y: 100 },
      { x: 220, y: 100 },
    ];

    sceneZoomBegin(offset, scale, zoomState, touches);
    sceneZoomUpdate(offset, scale, zoomState, touches, 2, 1, null);

    expect(scale.value).toEqual({ x: 2, y: 2 });
    const focal = { x: 200, y: 100 };
    const scenePointX = (focal.x - offset.value.x) / scale.value.x;
    const scenePointY = (focal.y - offset.value.y) / scale.value.y;
    expect(scenePointX).toBeCloseTo(200);
    expect(scenePointY).toBeCloseTo(100);
  });

  it('pans while zooming when the centroid moves', () => {
    const offset = sv<Vector2d>({ x: 0, y: 0 });
    const scale = sv<Vector2d>({ x: 1, y: 1 });
    const zoomState = sv<SceneZoomState | null>(null);
    const startTouches: Vector2d[] = [
      { x: 90, y: 100 },
      { x: 110, y: 100 },
    ];
    sceneZoomBegin(offset, scale, zoomState, startTouches);
    const movedTouches: Vector2d[] = [
      { x: 140, y: 100 },
      { x: 160, y: 100 },
    ];
    sceneZoomUpdate(offset, scale, zoomState, movedTouches, 1, 1, null);

    expect(scale.value).toEqual({ x: 1, y: 1 });
    expect(offset.value.x).toBeCloseTo(50);
    expect(offset.value.y).toBeCloseTo(0);
  });

  it('clamps zoom to the min/max range', () => {
    const offset = sv<Vector2d>({ x: 0, y: 0 });
    const scale = sv<Vector2d>({ x: 1, y: 1 });
    const zoomState = sv<SceneZoomState | null>(null);
    const touches: Vector2d[] = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ];
    const bounds: SceneBounds = {
      minOffsetX: -Infinity,
      maxOffsetX: Infinity,
      minOffsetY: -Infinity,
      maxOffsetY: Infinity,
      minZoom: 0.5,
      maxZoom: 3,
    };

    sceneZoomBegin(offset, scale, zoomState, touches);
    sceneZoomUpdate(offset, scale, zoomState, touches, 100, 1, bounds);
    expect(scale.value.x).toBe(3);

    sceneZoomEnd(zoomState);
    expect(zoomState.value).toBeNull();
  });
});
