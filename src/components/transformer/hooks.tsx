import { useCallback, useEffect, useReducer, useRef } from 'react';
import type {
  AnchorId,
  TransformEvent,
  TransformEventListener,
} from '../../core/types';
import type { NodeRegistry } from '../../core/registry';

let nextTransformerId = 0;

export const useOnTransform = (
  onTransform: TransformEventListener | undefined
) => {
  const onTransformRef = useRef(onTransform);
  onTransformRef.current = onTransform;
  const handleTransform = useRef((e: TransformEvent) => {
    onTransformRef.current?.(e);
  }).current;

  return handleTransform;
};

export const useGetHandleId = (
  registry: NodeRegistry | null,
  selector: string
) => {
  const [, updateCounter] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    /** Forces rerender after initial mount to make node registrations possible */
    updateCounter();
  }, [registry, selector]);

  const transformerIdRef = useRef(-1);
  if (transformerIdRef.current < 0)
    transformerIdRef.current = nextTransformerId++;
  const getHandleId = useCallback(
    (h: AnchorId) => `${transformerIdRef.current}-${h}`,
    []
  );

  return getHandleId;
};
