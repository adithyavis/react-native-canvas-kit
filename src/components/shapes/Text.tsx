import { memo, useMemo } from 'react';
import { Text as SkiaText, matchFont } from '@shopify/react-native-skia';
import type { FontStyle, ShapeConfig } from '../../core/types';
import {
  basePaintProps,
  hasStroke,
  ShapeDecorations,
} from '../../core/styling';
import { Container } from '../internal/Container';

export interface TextProps extends ShapeConfig {
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontStyle?: FontStyle; // e.g. "normal", "bold", "italic", "italic bold"
}

export const Text = memo(
  ({
    text = '',
    fontFamily = 'sans-serif',
    fontSize = 16,
    fontStyle = 'normal',
    ...props
  }: TextProps) => {
    const config: ShapeConfig = {
      ...props,
      fill: props.fill ?? (hasStroke(props) ? undefined : 'black'),
    };

    const font = useMemo(() => {
      const style = {
        fontFamily,
        fontSize,
        fontStyle: fontStyle.includes('italic') ? 'italic' : 'normal',
        fontWeight: fontStyle.includes('bold') ? 'bold' : 'normal',
      };
      return matchFont(style as Parameters<typeof matchFont>[0]);
    }, [fontFamily, fontSize, fontStyle]);

    if (!font) {
      return null;
    }
    const base = basePaintProps(config);
    if (!base) {
      return null;
    }
    const baseline = -font.getMetrics().ascent;

    return (
      <Container config={config}>
        <SkiaText x={0} y={baseline} text={text} font={font} {...base}>
          <ShapeDecorations c={config} />
        </SkiaText>
      </Container>
    );
  }
);
Text.displayName = 'Text';
