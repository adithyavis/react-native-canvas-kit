import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  Children,
  isValidElement,
  type ReactNode,
} from 'react';
import type { NodeConfig, Vector2d } from '../../core/types';
import { NodeRegistry, type NodeType } from '../../core/registry';
import { buildAffineMatrixFromConfig, type Mat } from '../../core/matrix';

export const RegistryContext = createContext<NodeRegistry | null>(null);
export const ParentContext = createContext<number | null>(null);
export const OrderContext = createContext<number>(0);

export function useRegistry(): NodeRegistry | null {
  return useContext(RegistryContext);
}

interface RegisterArgs {
  type: NodeType;
  config: NodeConfig;
  getLocalMatrix?: () => Mat;
  hitTest?: (p: Vector2d) => boolean;
}

export function useRegisterNode({
  type,
  config,
  getLocalMatrix,
  hitTest,
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
  const localMatrixRef = useRef(getLocalMatrix);
  localMatrixRef.current = getLocalMatrix;
  const hitTestRef = useRef(hitTest);
  hitTestRef.current = hitTest;
  const hasHitTest = hitTest != null;

  useLayoutEffect(() => {
    if (!registry || id == null) return;
    registry.register({
      id,
      parentId,
      type,
      paintIndex,
      getConfig: () => configRef.current,
      getLocalMatrix: () =>
        localMatrixRef.current
          ? localMatrixRef.current()
          : buildAffineMatrixFromConfig(configRef.current),
      hitTest: hasHitTest ? (p) => hitTestRef.current!(p) : undefined,
    });
    return () => registry.unregister(id);
    // Registered once per mount; parentId/type are stable for an element.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registry, id, parentId, type]);

  useLayoutEffect(() => {
    if (registry && id != null) registry.setChildIndex(id, paintIndex);
  });

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
