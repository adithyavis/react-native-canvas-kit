import { Fragment, memo } from 'react';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';
import { Path, Skia } from '@shopify/react-native-skia';
import { anchorLocalPoint, transformLocalPoint } from '../../core/transformer';
import type { Rect as BoundsRect } from '../../core/bounds';
import { DEG_TO_RAD, type ResolvedTransform } from '../../core/transform';
import type { AnchorId } from '../../core/types';
import {
  computeTransform,
  rotaterAnchorPoint,
  type TransformChannels,
} from './utils';

interface TransformerHandlesProps extends TransformChannels {
  rect: BoundsRect;
  resolvedTransformSV: SharedValue<ResolvedTransform>;
  enabledAnchors: AnchorId[];
  anchorSize: number;
  rotateAnchorOffset: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export const TransformerHandles = memo((props: TransformerHandlesProps) => {
  const {
    rect,
    resolvedTransformSV,
    dragOffsetSV,
    scaleSV,
    rotationSV,
    enabledAnchors,
    anchorSize,
    rotateAnchorOffset,
    fill,
    stroke,
    strokeWidth,
  } = props;

  const handlesPath = useDerivedValue(() => {
    const p = Skia.Path.Make();
    const t = computeTransform(resolvedTransformSV.value, {
      dragOffsetSV,
      scaleSV,
      rotationSV,
    });
    const ox = resolvedTransformSV.value.offsetX;
    const oy = resolvedTransformSV.value.offsetY;
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
      p.addCircle(c.x, c.y, half);
    }
    return p;
  }, [
    rect,
    resolvedTransformSV,
    dragOffsetSV,
    scaleSV,
    rotationSV,
    enabledAnchors,
    anchorSize,
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
