import { memo } from 'react';
import type { NodeConfig } from '../core/types';
import { Container } from './internal/Container';

export type GroupProps = NodeConfig;

export const Group = memo(({ children, ...config }: GroupProps) => {
  return <Container config={config}>{children}</Container>;
});
Group.displayName = 'Group';
