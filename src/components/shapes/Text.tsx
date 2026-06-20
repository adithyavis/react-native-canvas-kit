import { memo, useMemo } from 'react';
import {
  Text as SkiaText,
  matchFont,
  type SkFont,
} from '@shopify/react-native-skia';
import type { FontStyle, ShapeConfig } from '../../core/types';
import { basePaintProps, ShapeDecorations } from '../../core/styling';
import {
  boxHitTestDescriptor,
  hitStrokePad,
} from '../../core/hitTestDescriptor';
import { Container } from '../internal/Container';
import { hasStroke } from '../../core/paint';

export interface TextProps extends ShapeConfig {
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontStyle?: FontStyle;
  font?: SkFont | null;
}

export const Text = memo(
  ({
    text = '',
    fontFamily = 'sans-serif',
    fontSize = 16,
    fontStyle = 'normal',
    font: fontProp,
    ...props
  }: TextProps) => {
    const config: ShapeConfig = {
      ...props,
      fill: props.fill ?? (hasStroke(props) ? undefined : 'black'),
    };

    const matched = useMemo(() => {
      const style = {
        fontFamily,
        fontSize,
        fontStyle: fontStyle.includes('italic') ? 'italic' : 'normal',
        fontWeight: fontStyle.includes('bold') ? 'bold' : 'normal',
      };
      return matchFont(style as Parameters<typeof matchFont>[0]);
    }, [fontFamily, fontSize, fontStyle]);
    const font = fontProp ?? matched;

    if (!font) {
      return null;
    }
    const base = basePaintProps(config);
    if (!base) {
      return null;
    }
    const metrics = font.getMetrics();
    const baseline = -metrics.ascent;
    const boxWidth = font.measureText(text).width;
    const boxHeight = metrics.descent - metrics.ascent;

    return (
      <Container
        config={config}
        type="shape"
        hitTestDescriptor={boxHitTestDescriptor(
          0,
          0,
          boxWidth,
          boxHeight,
          hitStrokePad(config)
        )}
      >
        <SkiaText x={0} y={baseline} text={text} font={font} {...base}>
          <ShapeDecorations c={config} />
        </SkiaText>
      </Container>
    );
  }
);
Text.displayName = 'Text';
