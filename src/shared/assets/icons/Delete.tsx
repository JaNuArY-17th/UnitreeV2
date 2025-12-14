import React from 'react';
import Svg, { G, Path } from 'react-native-svg';

// Reusable icon props type (kept local to avoid cross-file coupling)
export type IconProps = { width?: number; height?: number; color?: string };

// Delete (close) icon converted from provided SVG. Original SVG used a translated group; we
// preserve that transform so we don't need to manually recalculate coordinates. The viewBox
// is normalized to the post-transform bounds (0 0 32 22).
export default function Delete({ width = 24, height = 24, color = '#6B7280' }: IconProps) {
	return (
		<Svg width={width} height={height} viewBox="0 0 32 22" fill="none">
			<G fill={color} transform="translate(-518 -1146)">
				<Path d="M540.647 1159.24c.392.39.392 1.03 0 1.42-.39.39-1.024.39-1.415 0l-2.239-2.24-2.268 2.27c-.394.39-1.033.39-1.427 0-.394-.4-.394-1.04 0-1.43l2.268-2.27-2.239-2.23c-.391-.39-.391-1.03 0-1.42.391-.39 1.025-.39 1.415 0l2.239 2.24 2.3-2.3c.395-.39 1.033-.39 1.427 0 .395.4.395 1.03 0 1.43l-2.3 2.3 2.239 2.23Zm5.349-13.24h-17.945a.74.74 0 0 0-.78.28l-8.986 9.94a.75.75 0 0 0-.287.76.75.75 0 0 0 .287.77l8.986 9.94c.196.19.452.29.708.29v.02h18.017c2.211 0 4.004-1.79 4.004-4v-14c0-2.21-1.793-4-4.004-4Z" />
			</G>
		</Svg>
	);
}

