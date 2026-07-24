import { useState, type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';

const HEADER_TINT = '#ffffff';
const HEADER_DISABLED = 'rgba(255, 255, 255, 0.45)';
const CANVA_PURPLE = '#8B3DFF';
const GRADIENT_START = [0, 196, 204];
const GRADIENT_END = [125, 42, 232];
const GRADIENT_STEPS = 28;

interface BoardSize {
  width: number;
  height: number;
}

interface CanvaChromeProps {
  hasSelection: boolean;
  onConfirmSelection: () => void;
  onExport?: () => void;
  children: (size: BoardSize) => ReactNode;
}

export function CanvaChrome({
  hasSelection,
  onConfirmSelection,
  onExport,
  children,
}: CanvaChromeProps) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [board, setBoard] = useState<BoardSize>({ width: 0, height: 0 });

  const onBoardLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setBoard((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height }
    );
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <GradientFill />
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            hitSlop={8}
          >
            <Ionicons name="home-outline" size={25} color={HEADER_TINT} />
          </Pressable>
          <Ionicons
            name="arrow-undo-outline"
            size={24}
            color={HEADER_TINT}
            style={styles.headerIcon}
          />
          <Ionicons
            name="arrow-redo-outline"
            size={24}
            color={HEADER_DISABLED}
            style={styles.headerIcon}
          />
          <View style={styles.flexSpacer} />
          <MaterialCommunityIcons
            name="dots-horizontal"
            size={26}
            color={HEADER_TINT}
            style={styles.headerIcon}
          />
          <MaterialCommunityIcons
            name="crown"
            size={24}
            color={HEADER_TINT}
            style={styles.headerIcon}
          />
          <View style={[styles.headerIcon, styles.badgeAnchor]}>
            <Ionicons name="chatbubble-outline" size={24} color={HEADER_TINT} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>1</Text>
            </View>
          </View>
          <MaterialIcons
            name="open-in-full"
            size={22}
            color={HEADER_TINT}
            style={styles.headerIcon}
          />
          <Pressable onPress={onExport} hitSlop={8} style={styles.headerIcon}>
            <Ionicons name="share-outline" size={24} color={HEADER_TINT} />
          </Pressable>
        </View>
      </View>

      <View style={styles.canvasArea}>
        <View style={styles.board} onLayout={onBoardLayout}>
          {board.width > 0 && children(board)}
        </View>

        {hasSelection && (
          <View style={styles.floatingBar} pointerEvents="box-none">
            <View style={styles.floatingPill}>
              <View style={styles.aiDot}>
                <MaterialCommunityIcons
                  name="auto-fix"
                  size={16}
                  color="#ffffff"
                />
              </View>
              <MaterialCommunityIcons
                name="pencil"
                size={22}
                color={CANVA_PURPLE}
                style={styles.floatingIcon}
              />
              <Ionicons
                name="chatbubble-outline"
                size={21}
                color="#3d3d47"
                style={styles.floatingIcon}
              />
              <Ionicons
                name="copy-outline"
                size={21}
                color="#3d3d47"
                style={styles.floatingIcon}
              />
              <Ionicons
                name="trash-outline"
                size={21}
                color="#3d3d47"
                style={styles.floatingIcon}
              />
              <MaterialCommunityIcons
                name="dots-horizontal"
                size={22}
                color="#3d3d47"
                style={styles.floatingIcon}
              />
            </View>
          </View>
        )}
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 4 }]}>
        <View style={styles.pagesStrip}>
          <PageThumb number="1" active label="Canva" />
          <AddPageButton />
          <PageThumb number="2" />
          <AddPageButton />
          <PageThumb number="3" heading />
          <AddPageButton />
        </View>

        {hasSelection ? (
          <View style={styles.toolbar}>
            <TextTool
              glyph={
                <MaterialCommunityIcons
                  name="keyboard-outline"
                  size={22}
                  color="#1b1b1f"
                />
              }
              label="Edit"
            />
            <TextTool
              glyph={<Text style={styles.glyphSerif}>Ff</Text>}
              label="Font"
            />
            <TextTool
              glyph={<Text style={styles.glyphBold}>H</Text>}
              label="Text styles"
            />
            <TextTool
              glyph={<Text style={styles.glyphSize}>aA</Text>}
              label="Font size"
            />
            <TextTool
              glyph={
                <MaterialCommunityIcons
                  name="format-color-text"
                  size={22}
                  color="#1b1b1f"
                />
              }
              label="Color"
            />
            <Pressable
              onPress={onConfirmSelection}
              hitSlop={8}
              style={styles.confirm}
            >
              <Ionicons name="checkmark" size={24} color="#1b1b1f" />
            </Pressable>
          </View>
        ) : (
          <View style={styles.toolbar}>
            <TextTool
              glyph={<Ionicons name="grid-outline" size={22} color="#1b1b1f" />}
              label="Templates"
            />
            <TextTool
              glyph={
                <Ionicons name="shapes-outline" size={22} color="#1b1b1f" />
              }
              label="Elements"
            />
            <TextTool
              glyph={<Ionicons name="text" size={22} color="#1b1b1f" />}
              label="Text"
            />
            <TextTool
              glyph={
                <Ionicons name="image-outline" size={22} color="#1b1b1f" />
              }
              label="Gallery"
            />
            <TextTool
              glyph={
                <MaterialCommunityIcons
                  name="shield-crown-outline"
                  size={22}
                  color="#1b1b1f"
                />
              }
              label="Brand"
              pro
            />
            <TextTool
              glyph={
                <Ionicons
                  name="cloud-upload-outline"
                  size={22}
                  color="#1b1b1f"
                />
              }
              label="Upload"
            />
          </View>
        )}
      </View>
    </View>
  );
}

function GradientFill() {
  const segments = [];
  for (let step = 0; step < GRADIENT_STEPS; step += 1) {
    const ratio = step / (GRADIENT_STEPS - 1);
    const red = Math.round(
      GRADIENT_START[0]! + (GRADIENT_END[0]! - GRADIENT_START[0]!) * ratio
    );
    const green = Math.round(
      GRADIENT_START[1]! + (GRADIENT_END[1]! - GRADIENT_START[1]!) * ratio
    );
    const blue = Math.round(
      GRADIENT_START[2]! + (GRADIENT_END[2]! - GRADIENT_START[2]!) * ratio
    );
    segments.push(
      <View
        key={step}
        style={{ flex: 1, backgroundColor: `rgb(${red}, ${green}, ${blue})` }}
      />
    );
  }
  return (
    <View
      style={[StyleSheet.absoluteFill, styles.gradientRow]}
      pointerEvents="none"
    >
      {segments}
    </View>
  );
}

function TextTool({
  glyph,
  label,
  pro,
}: {
  glyph: ReactNode;
  label: string;
  pro?: boolean;
}) {
  return (
    <View style={styles.tool}>
      <View style={styles.toolGlyph}>
        {glyph}
        {pro && (
          <MaterialCommunityIcons
            name="crown"
            size={11}
            color="#f5a623"
            style={styles.proBadge}
          />
        )}
      </View>
      <Text style={styles.toolLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function PageThumb({
  number,
  active,
  label,
  heading,
}: {
  number: string;
  active?: boolean;
  label?: string;
  heading?: boolean;
}) {
  return (
    <View style={styles.pageWrap}>
      <View style={[styles.page, active && styles.pageActive]}>
        {label && <Text style={styles.pageLabel}>{label}</Text>}
        {heading && <Text style={styles.pageHeading}>Add a heading</Text>}
      </View>
      <Text style={styles.pageNumber}>{number}</Text>
    </View>
  );
}

function AddPageButton() {
  return (
    <View style={styles.addPage}>
      <Ionicons name="add" size={22} color="#5a5a63" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#e6e6ea' },
  header: {
    paddingBottom: 10,
    overflow: 'hidden',
  },
  gradientRow: { flexDirection: 'row' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  headerIcon: { marginLeft: 18 },
  flexSpacer: { flex: 1 },
  badgeAnchor: { justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ff4d4f',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#ffffff', fontSize: 10, fontWeight: '700' },
  canvasArea: {
    flex: 1,
    padding: 14,
  },
  board: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d0d0d6',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  floatingBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '26%',
    alignItems: 'center',
  },
  floatingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 26,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  aiDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: CANVA_PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingIcon: { marginLeft: 18 },
  bottom: {
    backgroundColor: '#ffffff',
  },
  pagesStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  pageWrap: { alignItems: 'flex-start' },
  page: {
    width: 96,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e2e6',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pageActive: { borderWidth: 2, borderColor: CANVA_PURPLE },
  pageLabel: { color: '#1b1b1f', fontSize: 14, fontWeight: '700' },
  pageHeading: { color: '#9a9aa2', fontSize: 9, fontWeight: '700' },
  pageNumber: { color: '#5a5a63', fontSize: 12, marginTop: 4, marginLeft: 2 },
  addPage: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f0f0f3',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    marginBottom: 20,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ececef',
  },
  tool: { alignItems: 'center', width: 62 },
  toolGlyph: { height: 26, justifyContent: 'center' },
  toolLabel: { color: '#3d3d47', fontSize: 11, marginTop: 5 },
  glyphSerif: { fontSize: 20, fontWeight: '600', color: '#1b1b1f' },
  glyphBold: { fontSize: 21, fontWeight: '800', color: '#1b1b1f' },
  glyphSize: { fontSize: 18, fontWeight: '700', color: '#1b1b1f' },
  proBadge: { position: 'absolute', top: -8, right: -12 },
  confirm: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f3',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
