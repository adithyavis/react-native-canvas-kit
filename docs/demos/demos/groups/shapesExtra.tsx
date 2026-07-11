import type { ComponentType } from 'react';
import { Asset } from 'expo-asset';
import {
  RegularPolygon,
  Star,
  Text,
  Image,
  Rect,
  useFont,
  useImage,
} from 'react-native-canvas-kit';
import { DemoStage } from '../../src/DemoStage';
import { FONT_URL } from '../../src/scene';

function PolygonBasic() {
  return (
    <DemoStage logicalWidth={320} logicalHeight={320} background="#faf7ff">
      <RegularPolygon x={160} y={160} sides={6} radius={90} fill="#8a2be2" />
    </DemoStage>
  );
}

function PolygonTrianglePentagon() {
  return (
    <DemoStage logicalWidth={320} logicalHeight={320} background="#faf7ff">
      <RegularPolygon x={90} y={160} sides={3} radius={70} fill="#22d3ee" />
      <RegularPolygon x={230} y={160} sides={5} radius={70} fill="#ff5aa5" />
    </DemoStage>
  );
}

function PolygonRotated() {
  return (
    <DemoStage logicalWidth={320} logicalHeight={320} background="#faf7ff">
      <RegularPolygon
        x={160}
        y={160}
        sides={6}
        radius={100}
        rotation={30}
        fill="#c084fc"
        stroke="#1b0030"
        strokeWidth={5}
      />
    </DemoStage>
  );
}

function StarBasic() {
  return (
    <DemoStage logicalWidth={320} logicalHeight={320} background="#faf7ff">
      <Star
        x={160}
        y={160}
        numPoints={5}
        innerRadius={42}
        outerRadius={100}
        fill="#8a2be2"
      />
    </DemoStage>
  );
}

function StarSpikyChunky() {
  return (
    <DemoStage logicalWidth={320} logicalHeight={320} background="#faf7ff">
      <Star
        x={100}
        y={160}
        numPoints={5}
        innerRadius={22}
        outerRadius={92}
        fill="#ff5aa5"
      />
      <Star
        x={235}
        y={160}
        numPoints={6}
        innerRadius={62}
        outerRadius={92}
        fill="#22d3ee"
      />
    </DemoStage>
  );
}

function TextHello() {
  const font = useFont(FONT_URL, 32);
  return (
    <DemoStage logicalWidth={320} logicalHeight={320} background="#faf7ff">
      {font && <Text text="Hello" x={40} y={150} font={font} fill="#1b0030" />}
    </DemoStage>
  );
}

function TextRemoteFont() {
  const font = useFont(FONT_URL, 28);
  return (
    <DemoStage logicalWidth={320} logicalHeight={320} background="#faf7ff">
      {font && (
        <Text text="Loaded from a URL" x={30} y={150} font={font} fill="#6D28D9" />
      )}
    </DemoStage>
  );
}

function measureLabel(font: ReturnType<typeof useFont>, label: string, size: number) {
  let width = label.length * size * 0.55;
  let height = size * 1.2;
  if (font) {
    try {
      width = font.measureText(label).width;
      const m = font.getMetrics();
      height = m.descent - m.ascent;
    } catch {}
  }
  return { width, height };
}

function TextMeasured() {
  const size = 32;
  const font = useFont(FONT_URL, size);
  const label = 'Measured';
  const { width: textWidth, height: textHeight } = measureLabel(font, label, size);
  const originX = 60;
  const originY = 150;
  const padX = 14;
  const padY = 10;
  return (
    <DemoStage logicalWidth={320} logicalHeight={320} background="#faf7ff">
      {font && (
        <>
          <Rect
            x={originX - padX}
            y={originY - padY}
            width={textWidth + padX * 2}
            height={textHeight + padY * 2}
            cornerRadius={12}
            fill="#ede9fe"
            stroke="#8a2be2"
            strokeWidth={2}
          />
          <Text text={label} x={originX} y={originY} font={font} fill="#1b0030" />
        </>
      )}
    </DemoStage>
  );
}

function TextSystemFont() {
  const font = useFont(FONT_URL, 26);
  return (
    <DemoStage logicalWidth={320} logicalHeight={320} background="#faf7ff">
      {font && (
        <Text text="Helvetica bold" x={40} y={150} font={font} fill="#1b0030" />
      )}
    </DemoStage>
  );
}

function ImageBasic() {
  return (
    <DemoStage logicalWidth={320} logicalHeight={320} background="#faf7ff">
      <Image
        src={Asset.fromModule(require('../../assets/stickers/unicorn.png')).uri}
        x={100}
        y={100}
        width={120}
        height={120}
      />
    </DemoStage>
  );
}

function ImageSources() {
  return (
    <DemoStage logicalWidth={320} logicalHeight={320} background="#faf7ff">
      <Image
        src={Asset.fromModule(require('../../assets/stickers/rocket.png')).uri}
        x={40}
        y={110}
        width={100}
        height={100}
      />
      <Image
        src={Asset.fromModule(require('../../assets/stickers/rainbow.png')).uri}
        x={180}
        y={110}
        width={100}
        height={100}
      />
    </DemoStage>
  );
}

function ImageFitModes() {
  const uri = Asset.fromModule(
    require('../../assets/stickers/unicorn.png')
  ).uri;
  return (
    <DemoStage logicalWidth={320} logicalHeight={320} background="#faf7ff">
      <Rect x={30} y={60} width={120} height={80} fill="#ffffff" stroke="#c4b5fd" strokeWidth={2} />
      <Image src={uri} x={30} y={60} width={120} height={80} fit="cover" />
      <Rect x={170} y={60} width={120} height={80} fill="#ffffff" stroke="#c4b5fd" strokeWidth={2} />
      <Image src={uri} x={170} y={60} width={120} height={80} fit="contain" />
      <Rect x={30} y={190} width={120} height={80} fill="#ffffff" stroke="#c4b5fd" strokeWidth={2} />
      <Image src={uri} x={30} y={190} width={120} height={80} fit="cover" />
      <Rect x={170} y={190} width={120} height={80} fill="#ffffff" stroke="#c4b5fd" strokeWidth={2} />
      <Image src={uri} x={170} y={190} width={120} height={80} fit="contain" />
    </DemoStage>
  );
}

function ImagePreloaded() {
  const img = useImage(
    Asset.fromModule(require('../../assets/stickers/gem.png')).uri
  );
  return (
    <DemoStage logicalWidth={320} logicalHeight={320} background="#faf7ff">
      {img && <Image image={img} x={90} y={90} width={140} height={140} />}
    </DemoStage>
  );
}

export const shapesExtraDemos: Record<string, ComponentType> = {
  'shapes-regular-polygon-1': PolygonBasic,
  'shapes-regular-polygon-2': PolygonTrianglePentagon,
  'shapes-regular-polygon-3': PolygonRotated,
  'shapes-star-1': StarBasic,
  'shapes-star-2': StarSpikyChunky,
  'shapes-text-1': TextHello,
  'shapes-text-2': TextRemoteFont,
  'shapes-text-3': TextMeasured,
  'shapes-text-4': TextSystemFont,
  'shapes-image-1': ImageBasic,
  'shapes-image-2': ImageSources,
  'shapes-image-3': ImageFitModes,
  'shapes-image-4': ImagePreloaded,
};
