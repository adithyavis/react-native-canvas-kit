declare const require: undefined | ((id: string) => { version?: string });

const SUPPORTED_MAJOR = 4;

function getReanimatedMajor(): number | undefined {
  try {
    if (typeof require !== 'function') return undefined;
    const version = require('react-native-reanimated/package.json').version;
    if (!version) return undefined;
    const major = Number.parseInt(version.split('.')[0] ?? '', 10);
    return Number.isFinite(major) ? major : undefined;
  } catch {
    return undefined;
  }
}

let asserted = false;

export function assertReanimatedVersion(): void {
  if (asserted) return;
  asserted = true;

  const major = getReanimatedMajor();
  if (major === undefined || major === SUPPORTED_MAJOR) return;

  const advice =
    major > SUPPORTED_MAJOR
      ? `reanimated ${major}.x is not yet supported`
      : `install react-native-reanimated@^${SUPPORTED_MAJOR} for this version.`;

  throw new Error(`[react-native-canvas-kit] ${advice}`);
}
