import { memo } from 'react';
import { useDerivedValue } from 'react-native-reanimated';
import { Path, Skia } from '@shopify/react-native-skia';
import { transformLocalPoint } from '../../core/transformer';
import type { Rect as BoundsRect } from '../../core/bounds';
import {
  computeTransform,
  DEG_TO_RAD,
  rotaterAnchorPoint,
  type TransformChannels,
  type TransformerCfg,
} from './utils';

interface TransformerBorderProps extends TransformChannels {
  rect: BoundsRect;
  transformerConfig: TransformerCfg;
  showRotater: boolean;
  rotateAnchorOffset: number;
  stroke: string;
  strokeWidth: number;
}

export const TransformerBorder = memo((props: TransformerBorderProps) => {
  const {
    rect,
    transformerConfig,
    dragSV,
    scaleSV,
    rotationSV,
    showRotater,
    rotateAnchorOffset,
    stroke,
    strokeWidth,
  } = props;

  const borderPath = useDerivedValue(() => {
    const p = Skia.Path.Make();
    const t = computeTransform(transformerConfig, {
      dragSV,
      scaleSV,
      rotationSV,
    });
    const ox = transformerConfig.offsetX;
    const oy = transformerConfig.offsetY;
    const c0 = transformLocalPoint(t, ox, oy, rect.x, rect.y);
    const c1 = transformLocalPoint(t, ox, oy, rect.x + rect.width, rect.y);
    const c2 = transformLocalPoint(
      t,
      ox,
      oy,
      rect.x + rect.width,
      rect.y + rect.height
    );
    const c3 = transformLocalPoint(t, ox, oy, rect.x, rect.y + rect.height);
    p.moveTo(c0.x, c0.y);
    p.lineTo(c1.x, c1.y);
    p.lineTo(c2.x, c2.y);
    p.lineTo(c3.x, c3.y);
    p.close();
    if (showRotater) {
      const tc = transformLocalPoint(
        t,
        ox,
        oy,
        rect.x + rect.width / 2,
        rect.y
      );
      const tip = rotaterAnchorPoint(
        tc,
        t.rotation * DEG_TO_RAD,
        rotateAnchorOffset
      );
      p.moveTo(tc.x, tc.y);
      p.lineTo(tip.x, tip.y);
    }
    return p;
  }, [
    rect,
    transformerConfig,
    dragSV,
    scaleSV,
    rotationSV,
    showRotater,
    rotateAnchorOffset,
  ]);

  return (
    <Path
      path={borderPath}
      style="stroke"
      color={stroke}
      strokeWidth={strokeWidth}
    />
  );
});
TransformerBorder.displayName = 'TransformerBorder';
