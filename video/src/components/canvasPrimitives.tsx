import React from 'react';
import { theme } from '../theme';

export const CX = 50;
export const CY = 112;
export const RW = 46;
export const RH = 34;
export const RX = CX - RW / 2;
export const RY = CY - RH / 2;

export const RectShape: React.FC<{
  accent: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}> = ({ accent, x = RX, y = RY, w = RW, h = RH }) => (
  <rect x={x} y={y} width={w} height={h} rx={6} fill={accent} />
);

export const starPath = (
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  points = 5
) => {
  let d = '';
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / points) * i - Math.PI / 2;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    d += `${i === 0 ? 'M' : 'L'}${px.toFixed(2)} ${py.toFixed(2)} `;
  }
  return d + 'Z';
};

export const Star: React.FC<{
  cx: number;
  cy: number;
  outer: number;
  inner: number;
  fill: string;
}> = ({ cx, cy, outer, inner, fill }) => (
  <path d={starPath(cx, cy, outer, inner)} fill={fill} />
);

export const Transformer: React.FC<{
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  color?: string;
}> = ({ x = RX, y = RY, w = RW, h = RH, color = theme.purple }) => {
  const pad = 3.5;
  const bx = x - pad;
  const by = y - pad;
  const bw = w + pad * 2;
  const bh = h + pad * 2;
  const cx = x + w / 2;
  const corners: Array<[number, number]> = [
    [bx, by],
    [bx + bw, by],
    [bx, by + bh],
    [bx + bw, by + bh],
  ];
  return (
    <g>
      <rect
        x={bx}
        y={by}
        width={bw}
        height={bh}
        fill="none"
        stroke={color}
        strokeWidth={0.7}
        strokeDasharray="2.5 2"
      />
      <line x1={cx} y1={by} x2={cx} y2={by - 9} stroke={color} strokeWidth={0.7} />
      <circle cx={cx} cy={by - 11} r={2.4} fill="#fff" stroke={color} strokeWidth={0.7} />
      {corners.map(([hx, hy], i) => (
        <rect
          key={i}
          x={hx - 2.4}
          y={hy - 2.4}
          width={4.8}
          height={4.8}
          rx={1}
          fill="#fff"
          stroke={color}
          strokeWidth={0.7}
        />
      ))}
    </g>
  );
};

export const Finger: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <circle cx={x} cy={y} r={9} fill="#0a0a0c" opacity={0.08} />
    <circle cx={x} cy={y} r={5} fill="#0a0a0c" opacity={0.14} />
  </g>
);

export const Guides: React.FC<{ active: number }> = ({ active }) => (
  <g>
    <line
      x1={CX}
      y1={20}
      x2={CX}
      y2={204}
      stroke={theme.pink}
      strokeWidth={0.6}
      strokeDasharray="3 3"
      opacity={active}
    />
    <line
      x1={12}
      y1={CY}
      x2={88}
      y2={CY}
      stroke={theme.pink}
      strokeWidth={0.6}
      strokeDasharray="3 3"
      opacity={active}
    />
  </g>
);

export const GridDots: React.FC<{ opacity: number }> = ({ opacity }) => {
  const dots: React.ReactNode[] = [];
  for (let gx = 18; gx <= 82; gx += 16) {
    for (let gy = 40; gy <= 184; gy += 16) {
      dots.push(<circle key={`${gx}-${gy}`} cx={gx} cy={gy} r={0.7} fill={theme.faint} />);
    }
  }
  return <g opacity={opacity}>{dots}</g>;
};

export const ScreenBase: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <svg viewBox="0 0 100 216" style={{ width: '100%', height: '100%' }}>
    {children}
  </svg>
);
