import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { colors, spacing } from '@/shared/themes';
import { shadows } from '@/shared/themes';

export interface TicketCardProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  borderRadius?: number;
  showShadow?: boolean;
  perforationColor?: string;
  showPerforationLine?: boolean;
  perforationPosition?: 'middle' | 'top' | 'bottom';
}

const TicketCard: React.FC<TicketCardProps> = ({
  children,
  style,
  backgroundColor = colors.background,
  borderRadius = 16,
  showShadow = true,
  perforationColor = colors.background,
  showPerforationLine = true,
  perforationPosition = 'middle',
}) => {
  const renderPerforationDots = (side: 'left' | 'right') => {
    const dots = [];
    const dotCount = 15; // Number of dots on each side

    for (let i = 0; i < dotCount; i++) {
      dots.push(
        <View
          key={`${side}-dot-${i}`}
          style={[
            styles.perforationDot,
            {
              backgroundColor: perforationColor,
              top: `${(i + 1) * (100 / (dotCount + 1))}%`,
            },
          ]}
        />
      );
    }

    return dots;
  };

  const renderPerforationLine = () => {
    if (!showPerforationLine) return null;

    const linePosition = perforationPosition === 'middle' ? '50%' :
      perforationPosition === 'top' ? '30%' : '70%';

    return (
      <View style={[styles.perforationLineHorizontal, { top: linePosition }]}>
        {/* Left circle cutout */}
        <View style={[styles.perforationCircle, styles.perforationCircleLeft, { backgroundColor: colors.primary }]} />

        {/* Dashed line */}
        <View style={styles.dashedLineContainer}>
          {Array.from({ length: 35 }).map((_, index) => (
            <View
              key={`dash-${index}`}
              style={[
                styles.dashLine,
                { backgroundColor: colors.gray }
              ]}
            />
          ))}
        </View>

        {/* Right circle cutout */}
        <View style={[styles.perforationCircle, styles.perforationCircleRight, { backgroundColor: colors.primary, opacity: 0.96 }]} />
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.ticketWrapper,
          {
            backgroundColor,
            borderRadius,
          },
        ]}
      >

        {/* Horizontal perforation line */}
        {renderPerforationLine()}

        {/* Main content area */}
        <View style={styles.contentArea}>
          {children}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  ticketWrapper: {
    position: 'relative',
    maxHeight: '200%',
    overflow: 'hidden',
  },
  perforationLine: {
    position: 'absolute',
    top: 8,
    bottom: 8,
    width: 1,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  perforationLineLeft: {
    left: 12,
  },
  perforationLineRight: {
    right: 12,
  },
  perforationDot: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    left: -0.5,
  },
  perforationLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 3,
    transform: [{ translateY: -10 }],
  },
  perforationCircle: {
    width: 22,
    height: 22,
    borderRadius: 40,
    position: 'absolute',
  },
  perforationCircleLeft: {
    left: -14,
  },
  perforationCircleRight: {
    right: -14,
  },
  dashedLineContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 10,
  },
  dashLine: {
    width: 6,
    height: 2,
    borderRadius: 20,
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    zIndex: 2,
  },
});

export default TicketCard;
