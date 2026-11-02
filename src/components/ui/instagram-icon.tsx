import Svg, { Circle, Rect } from 'react-native-svg';

/**
 * Instagram glyph, drawn like the Lucide icons (24dp grid, 2dp stroke):
 * Lucide no longer ships brand icons.
 */
export function InstagramIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round">
      <Rect x={2} y={2} width={20} height={20} rx={5} ry={5} />
      <Circle cx={12} cy={12} r={4} />
      <Circle cx={17.5} cy={6.5} r={0.5} fill={color} />
    </Svg>
  );
}
