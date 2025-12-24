import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '@/shared/themes';

interface CircularProgressBarProps {
  value: number; // 0-100
  radius: number;
  strokeWidth?: number;
  activeStrokeColor?: string;
  inActiveStrokeColor?: string;
  progressValueColor?: string;
  isSegmented?: boolean;
  segmentCount?: number;
  segmentGap?: number;
  isDualSegment?: boolean;
  loadedStrokeWidth?: number;
  remainingStrokeWidth?: number;
  segmentSpacing?: number;
}

export const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  value,
  radius,
  strokeWidth = 20,
  activeStrokeColor = colors.primary,
  inActiveStrokeColor = colors.lightGray,
  progressValueColor = colors.light,
  isSegmented = false,
  segmentCount = 8,
  segmentGap = 8,
  isDualSegment = false,
  loadedStrokeWidth = 20,
  remainingStrokeWidth = 10,
  segmentSpacing = 8,
}) => {
  const size = (radius + Math.max(loadedStrokeWidth, remainingStrokeWidth, strokeWidth) / 2) * 2;
  const cx = size / 2;
  const cy = size / 2;

  // Dual segment progress bar (loaded vs remaining)
  if (isDualSegment) {
    const circumference = 2 * Math.PI * radius;
    const loadedLength = (value / 100) * circumference;
    
    // Calculate angles based on arc length
    const loadedAngle = (loadedLength / circumference) * 360;
    const gapAngle = (segmentSpacing / (circumference * 0.39)) * 360; // Convert pixel to angle based on circumference
    const remainingAngle = 360 - loadedAngle - gapAngle - 10;

    // Helper function to convert angle to SVG path
    const getArcPath = (
      startAngle: number,
      sweepAngle: number
    ) => {
      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (startAngle + sweepAngle - 90) * (Math.PI / 180);

      const x1 = cx + radius * Math.cos(startRad);
      const y1 = cy + radius * Math.sin(startRad);
      const x2 = cx + radius * Math.cos(endRad);
      const y2 = cy + radius * Math.sin(endRad);

      const largeArc = sweepAngle > 180 ? 1 : 0;

      return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
    };

    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Loaded segment */}
          {loadedAngle > 0 && (
            <Path
              d={getArcPath(0, loadedAngle)}
              stroke={activeStrokeColor}
              strokeWidth={loadedStrokeWidth}
              fill="none"
              strokeLinecap="round"
            />
          )}

          {/* Remaining segment */}
          {remainingAngle > 0 && (
            <Path
              d={getArcPath(loadedAngle + gapAngle, remainingAngle)}
              stroke={inActiveStrokeColor}
              strokeWidth={remainingStrokeWidth}
              fill="none"
              strokeLinecap="round"
            />
          )}

          {/* Center transparent circle (creates hollow effect) */}
          <Circle
            cx={cx}
            cy={cy}
            r={radius - loadedStrokeWidth}
            fill="transparent"
            stroke="transparent"
          />
        </Svg>
      </View>
    );
  }

  // Segmented progress bar (multiple segments)
  if (isSegmented) {
    const totalSegments = segmentCount;
    const filledSegments = Math.round((value / 100) * totalSegments);
    const anglePerSegment = 360 / totalSegments;
    const arcGapAngle = segmentGap / radius;

    const getSegmentPath = (index: number) => {
      const startAngle = (index * anglePerSegment - 90) * (Math.PI / 180);
      const endAngle = ((index + 1) * anglePerSegment - segmentGap - 90) * (Math.PI / 180);

      const x1 = cx + radius * Math.cos(startAngle);
      const y1 = cy + radius * Math.sin(startAngle);
      const x2 = cx + radius * Math.cos(endAngle);
      const y2 = cy + radius * Math.sin(endAngle);

      const largeArc = anglePerSegment > 180 ? 1 : 0;

      return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
    };

    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Render all segments */}
          {Array.from({ length: totalSegments }).map((_, index) => (
            <Path
              key={index}
              d={getSegmentPath(index)}
              stroke={index < filledSegments ? activeStrokeColor : inActiveStrokeColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
            />
          ))}
          
          {/* Center transparent circle (creates hollow effect) */}
          <Circle
            cx={cx}
            cy={cy}
            r={radius - strokeWidth}
            fill="transparent"
            stroke="transparent"
          />
        </Svg>
      </View>
    );
  }

  // Continuous progress bar
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Circle */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={inActiveStrokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={1}
        />

        {/* Progress Circle */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={activeStrokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          originX={cx}
          originY={cy}
        />
        
        {/* Center transparent circle (creates hollow effect) */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius - strokeWidth}
          fill="transparent"
          stroke="transparent"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});