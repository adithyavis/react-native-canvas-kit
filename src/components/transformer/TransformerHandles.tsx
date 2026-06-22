import { Fragment, memo } from 'react';
import { useDerivedValue } from 'react-native-reanimated';
import { Path, Skia } from '@shopify/react-native-skia';
import { anchorLocalPoint, transformLocalPoint } from '../../core/transformer';
import type { Rect as BoundsRect } from '../../core/bounds';
import type { AnchorId } from '../../core/types';
import {
  computeTransform,
  DEG_TO_RAD,
  rotaterAnchorPoint,
  type TransformChannels,
  type TransformerCfg,
} from './utils';

interface TransformerHandlesProps extends TransformChannels {
  rect: BoundsRect;
  transformerConfig: TransformerCfg;
  enabledAnchors: AnchorId[];
  anchorSize: number;
  anchorCornerRadius: number;
  rotateAnchorOffset: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export const TransformerHandles = memo((props: TransformerHandlesProps) => {
  const {
    rect,
    transformerConfig,
    dragSV,
    scaleSV,
    rotationSV,
    enabledAnchors,
    anchorSize,
    anchorCornerRadius,
    rotateAnchorOffset,
    fill,
    stroke,
    strokeWidth,
  } = props;

  const handlesPath = useDerivedValue(() => {
    const p = Skia.Path.Make();
    const t = computeTransform(transformerConfig, {
      dragSV,
      scaleSV,
      rotationSV,
    });
    const ox = transformerConfig.offsetX;
    const oy = transformerConfig.offsetY;
    const half = anchorSize / 2;
    for (let i = 0; i < enabledAnchors.length; i++) {
      const anchor = enabledAnchors[i]!;
      if (anchor === 'rotater') {
        const tc = transformLocalPoint(
          t,
          ox,
          oy,
          rect.x + rect.width / 2,
          rect.y
        );
        const center = rotaterAnchorPoint(
          tc,
          t.rotation * DEG_TO_RAD,
          rotateAnchorOffset
        );
        p.addCircle(center.x, center.y, half);
        continue;
      }
      const local = anchorLocalPoint(rect, anchor);
      const c = transformLocalPoint(t, ox, oy, local.x, local.y);
      const r = Skia.XYWHRect(c.x - half, c.y - half, anchorSize, anchorSize);
      if (anchorCornerRadius > 0) {
        p.addRRect(Skia.RRectXY(r, anchorCornerRadius, anchorCornerRadius));
      } else {
        p.addRect(r);
      }
    }
    return p;
  }, [
    rect,
    transformerConfig,
    dragSV,
    scaleSV,
    rotationSV,
    enabledAnchors,
    anchorSize,
    anchorCornerRadius,
    rotateAnchorOffset,
  ]);

  return (
    <Fragment>
      <Path path={handlesPath} style="fill" color={fill} />
      <Path
        path={handlesPath}
        style="stroke"
        color={stroke}
        strokeWidth={strokeWidth}
      />
    </Fragment>
  );
});
TransformerHandles.displayName = 'TransformerHandles';
