import type { SharedValue } from 'react-native-reanimated';
import { clampToBounds } from './nodeBounds';
import type { Vector2d } from './types';

export const DEFAULT_MIN_ZOOM = 0.1;
export const DEFAULT_MAX_ZOOM = 10;

export interface ScenePanState {
  startTouchX: number;
  startTouchY: number;
  startOffsetX: number;
  startOffsetY: number;
}

export interface SceneZoomState {
  focalX: number;
  focalY: number;
  startScale: number;
  startOffsetX: number;
  startOffsetY: number;
}

export interface SceneBounds {
  minOffsetX: number;
  maxOffsetX: number;
  minOffsetY: number;
  maxOffsetY: number;
  minZoom: number;
  maxZoom: number;
}

export interface SceneState {
  x: number;
  y: number;
  scale: number;
}

export function zoomAroundPoint(
  offset: Vector2d,
  currentScale: number,
  nextScale: number,
  focalX: number,
  focalY: number
): Vector2d {
  'worklet';
  if (currentScale === 0) return offset;
  const scaleRatio = nextScale / currentScale;
  return {
    x: focalX - scaleRatio * (focalX - offset.x),
    y: focalY - scaleRatio * (focalY - offset.y),
  };
}

function centroidOf(touches: Vector2d[]): Vector2d {
  'worklet';
  let sumX = 0;
  let sumY = 0;
  for (let i = 0; i < touches.length; i++) {
    sumX += touches[i]!.x;
    sumY += touches[i]!.y;
  }
  const count = touches.length || 1;
  return { x: sumX / count, y: sumY / count };
}

function clampOffset(offset: Vector2d, bounds: SceneBounds | null): Vector2d {
  'worklet';
  if (!bounds) return offset;
  return {
    x: clampToBounds(offset.x, bounds.minOffsetX, bounds.maxOffsetX),
    y: clampToBounds(offset.y, bounds.minOffsetY, bounds.maxOffsetY),
  };
}

export function scenePanBegin(
  sceneOffset: SharedValue<Vector2d>,
  panState: SharedValue<ScenePanState | null>,
  px: number,
  py: number
): void {
  'worklet';
  const offset = sceneOffset.value;
  panState.value = {
    startTouchX: px,
    startTouchY: py,
    startOffsetX: offset.x,
    startOffsetY: offset.y,
  };
}

export function scenePanUpdate(
  sceneOffset: SharedValue<Vector2d>,
  panState: SharedValue<ScenePanState | null>,
  px: number,
  py: number,
  bounds: SceneBounds | null
): void {
  'worklet';
  const state = panState.value;
  if (!state) return;
  const next = {
    x: state.startOffsetX + (px - state.startTouchX),
    y: state.startOffsetY + (py - state.startTouchY),
  };
  sceneOffset.value = clampOffset(next, bounds);
}

export function scenePanEnd(panState: SharedValue<ScenePanState | null>): void {
  'worklet';
  panState.value = null;
}

export function sceneZoomBegin(
  sceneOffset: SharedValue<Vector2d>,
  sceneScale: SharedValue<Vector2d>,
  zoomState: SharedValue<SceneZoomState | null>,
  touches: Vector2d[]
): void {
  'worklet';
  const focal = centroidOf(touches);
  const offset = sceneOffset.value;
  zoomState.value = {
    focalX: focal.x,
    focalY: focal.y,
    startScale: sceneScale.value.x,
    startOffsetX: offset.x,
    startOffsetY: offset.y,
  };
}

export function sceneZoomUpdate(
  sceneOffset: SharedValue<Vector2d>,
  sceneScale: SharedValue<Vector2d>,
  zoomState: SharedValue<SceneZoomState | null>,
  touches: Vector2d[],
  gestureScale: number,
  sensitivity: number,
  bounds: SceneBounds | null
): void {
  'worklet';
  const state = zoomState.value;
  if (!state || state.startScale === 0) return;
  const dampedScale = 1 + (gestureScale - 1) * sensitivity;
  const minZoom = bounds ? bounds.minZoom : DEFAULT_MIN_ZOOM;
  const maxZoom = bounds ? bounds.maxZoom : DEFAULT_MAX_ZOOM;
  const nextScale = clampToBounds(
    state.startScale * dampedScale,
    minZoom,
    maxZoom
  );
  const current = centroidOf(touches);
  const scaleRatio = nextScale / state.startScale;
  const next = {
    x: current.x - scaleRatio * (state.focalX - state.startOffsetX),
    y: current.y - scaleRatio * (state.focalY - state.startOffsetY),
  };
  sceneScale.value = { x: nextScale, y: nextScale };
  sceneOffset.value = clampOffset(next, bounds);
}

export function sceneZoomEnd(
  zoomState: SharedValue<SceneZoomState | null>
): void {
  'worklet';
  zoomState.value = null;
}
