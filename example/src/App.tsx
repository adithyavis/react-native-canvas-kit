import { useWindowDimensions, StyleSheet, View } from 'react-native';
import {
  Stage,
  Layer,
  Group,
  Rect,
  Circle,
  Ellipse,
  Line,
  RegularPolygon,
  Star,
  Text,
} from 'react-native-canvas-kit';

export default function App() {
  const { width } = useWindowDimensions();
  const stageWidth = Math.min(width, 480);
  const stageHeight = 640;

  return (
    <View style={styles.container}>
      <Stage width={stageWidth} height={stageHeight} style={styles.stage}>
        <Layer>
          {/* Solid fill + stroke */}
          <Rect
            x={24}
            y={24}
            width={120}
            height={80}
            fill="#4F8EF7"
            stroke="#0B3D91"
            strokeWidth={4}
            cornerRadius={12}
          />

          {/* Linear gradient fill + drop shadow */}
          <Rect
            x={170}
            y={24}
            width={120}
            height={80}
            cornerRadius={8}
            fillLinearGradientStartPoint={{ x: 0, y: 0 }}
            fillLinearGradientEndPoint={{ x: 120, y: 80 }}
            fillLinearGradientColorStops={[0, '#FF5F6D', 1, '#FFC371']}
            shadowColor="black"
            shadowBlur={12}
            shadowOffsetX={4}
            shadowOffsetY={6}
          />

          {/* Dashed stroke-only rect */}
          <Rect
            x={316}
            y={24}
            width={120}
            height={80}
            stroke="#333"
            strokeWidth={3}
            dash={[12, 6]}
          />

          {/* Circle with radial gradient */}
          <Circle
            x={84}
            y={200}
            radius={56}
            fillRadialGradientEndPoint={{ x: 0, y: 0 }}
            fillRadialGradientEndRadius={56}
            fillRadialGradientColorStops={[0, '#43E97B', 1, '#38F9D7']}
            stroke="#0B6E4F"
            strokeWidth={3}
          />

          {/* Ellipse */}
          <Ellipse
            x={230}
            y={200}
            radiusX={70}
            radiusY={44}
            fill="#A66CFF"
            opacity={0.85}
          />

          {/* Rotated polyline */}
          <Line
            x={330}
            y={160}
            points={[0, 0, 40, 60, 80, 0, 120, 60]}
            stroke="#E91E63"
            strokeWidth={5}
            lineCap="round"
            lineJoin="round"
          />

          {/* Star with rotation */}
          <Star
            x={90}
            y={360}
            numPoints={5}
            innerRadius={26}
            outerRadius={56}
            fill="#FFD166"
            stroke="#C9962B"
            strokeWidth={3}
            rotation={15}
          />

          {/* Regular polygon (hexagon) */}
          <RegularPolygon
            x={230}
            y={360}
            sides={6}
            radius={54}
            fill="#06D6A0"
            stroke="#04795F"
            strokeWidth={3}
          />

          {/* Closed filled polygon via Line */}
          <Group x={330} y={310}>
            <Line
              points={[0, 0, 100, 20, 80, 100, 10, 80]}
              closed
              fill="#118AB2"
              stroke="#073B4C"
              strokeWidth={3}
            />
          </Group>

          {/* Text */}
          <Text
            x={24}
            y={470}
            text="react-native-canvas-kit"
            fontSize={28}
            fontStyle="bold"
            fill="#222"
          />
          <Text
            x={24}
            y={520}
            text="Shapes, rendered with Skia"
            fontSize={16}
            fill="#666"
          />
        </Layer>
      </Stage>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2f2f4',
  },
  stage: {
    backgroundColor: '#ffffff',
  },
});
