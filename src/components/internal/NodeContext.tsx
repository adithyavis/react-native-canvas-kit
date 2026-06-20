import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  Children,
  isValidElement,
  type ReactNode,
} from 'react';
import type { NodeConfig } from '../../core/types';
import { NodeRegistry, type NodeType } from '../../core/registry';
import type { Mat } from '../../core/matrix';
import type { HitTestDescriptor } from '../../core/hitTestDescriptor';

export const RegistryContext = createContext<NodeRegistry | null>(null);
export const ParentContext = createContext<number | null>(null);
export const OrderContext = createContext<number>(0);

export function useRegistry(): NodeRegistry | null {
  return useContext(RegistryContext);
}

interface RegisterArgs {
  type: NodeType;
  config: NodeConfig;
  getBaseMatrix?: () => Mat;
  hitTestDescriptor?: HitTestDescriptor;
}

export function useRegisterNode({
  type,
  config,
  getBaseMatrix,
  hitTestDescriptor,
}: RegisterArgs): number | null {
  const registry = useContext(RegistryContext);
  const parentId = useContext(ParentContext);
  const paintIndex = useContext(OrderContext);

  const idRef = useRef<number | null>(null);
  if (registry && idRef.current == null) {
    idRef.current = registry.allocateId();
  }
  const id = idRef.current;

  const configRef = useRef(config);
  configRef.current = config;
  const baseMatrixRef = useRef(getBaseMatrix);
  baseMatrixRef.current = getBaseMatrix;
  const hitTestDescriptorRef = useRef(hitTestDescriptor);
  hitTestDescriptorRef.current = hitTestDescriptor;
  const paintIndexRef = useRef(paintIndex);
  paintIndexRef.current = paintIndex;

  useLayoutEffect(() => {
    const hasHitTestDescriptor = hitTestDescriptorRef.current != null;
    if (!registry || id == null) return;
    registry.register({
      id,
      parentId,
      type,
      paintIndex: paintIndexRef.current,
      getConfig: () => configRef.current,
      getBaseMatrix: baseMatrixRef.current
        ? () => baseMatrixRef.current!()
        : undefined,
      getHitTestDescriptor: hasHitTestDescriptor
        ? () => hitTestDescriptorRef.current ?? null
        : undefined,
    });
    return () => registry.unregister(id);
  }, [registry, id, parentId, type]);

  useLayoutEffect(() => {
    if (registry && id !== null) {
      registry.setChildIndex(id, paintIndex);
    }
  }, [registry, id, paintIndex]);

  useLayoutEffect(() => {
    if (registry && id !== null) {
      // on changing radius,x,y etc, we mark the snapshot stale in order to rebuild it
      registry.invalidateSnapshot();
    }
  }, [registry, id, config, getBaseMatrix, hitTestDescriptor]);

  return id;
}

export function OrderedChildren({ children }: { children?: ReactNode }) {
  return Children.toArray(children).map((child, index) => {
    const key = isValidElement(child) && child.key != null ? child.key : index;
    return (
      <OrderContext.Provider key={key} value={index}>
        {child}
      </OrderContext.Provider>
    );
  });
}
