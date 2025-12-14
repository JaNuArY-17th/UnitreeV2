import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Animated,
  Platform,
} from 'react-native';
import Text from './Text';
import { colors, dimensions } from '@/shared/themes';
import { FONT_WEIGHTS } from '@/shared/themes/fonts';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  placement = 'top',
}) => {
  const [visible, setVisible] = useState(false);
  const [triggerLayout, setTriggerLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const triggerRef = useRef<TouchableOpacity>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const showTooltip = () => {
    if (triggerRef.current) {
      triggerRef.current.measure((x, y, width, height, pageX, pageY) => {
        setTriggerLayout({ x: pageX, y: pageY, width, height });
        setVisible(true);
        
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const hideTooltip = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
    });
  };

  const getTooltipPosition = () => {
    const tooltipWidth = Math.min(280, screenWidth - 40);
    const tooltipHeight = 80; // Approximate height
    const arrowSize = 8;
    
    let top = 0;
    let left = 0;
    let arrowStyle = {};

    switch (placement) {
      case 'top':
        top = Platform.OS === 'ios' ? triggerLayout.y - tooltipHeight - arrowSize - 20 : triggerLayout.y - tooltipHeight - arrowSize - 50;
        left = triggerLayout.x + triggerLayout.width / 2 - tooltipWidth / 2;
        arrowStyle = {
          position: 'absolute',
          flex: 9999,
          bottom: -arrowSize,
          left: tooltipWidth / 2 - arrowSize,
          width: 0,
          height: 0,
          borderLeftWidth: arrowSize,
          borderRightWidth: arrowSize,
          borderTopWidth: arrowSize,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: colors.dark,
        };
        break;
      case 'bottom':
        top = triggerLayout.y + triggerLayout.height + arrowSize + 10;
        left = triggerLayout.x + triggerLayout.width / 2 - tooltipWidth / 2;
        arrowStyle = {
          position: 'absolute',
          top: -arrowSize,
          left: tooltipWidth / 2 - arrowSize,
          width: 0,
          height: 0,
          borderLeftWidth: arrowSize,
          borderRightWidth: arrowSize,
          borderBottomWidth: arrowSize,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: colors.dark,
        };
        break;
      case 'left':
        top = triggerLayout.y + triggerLayout.height / 2 - tooltipHeight / 2;
        left = triggerLayout.x - tooltipWidth - arrowSize - 10;
        arrowStyle = {
          position: 'absolute',
          right: -arrowSize,
          top: tooltipHeight / 2 - arrowSize,
          width: 0,
          height: 0,
          borderTopWidth: arrowSize,
          borderBottomWidth: arrowSize,
          borderLeftWidth: arrowSize,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: colors.dark,
        };
        break;
      case 'right':
        top = triggerLayout.y + triggerLayout.height / 2 - tooltipHeight / 2;
        left = triggerLayout.x + triggerLayout.width + arrowSize + 10;
        arrowStyle = {
          position: 'absolute',
          left: -arrowSize,
          top: tooltipHeight / 2 - arrowSize,
          width: 0,
          height: 0,
          borderTopWidth: arrowSize,
          borderBottomWidth: arrowSize,
          borderRightWidth: arrowSize,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderRightColor: colors.dark,
        };
        break;
    }

    // Ensure tooltip stays within screen bounds
    if (left < 20) left = 20;
    if (left + tooltipWidth > screenWidth - 20) left = screenWidth - tooltipWidth - 20;
    if (top < 50) top = 50;
    if (top + tooltipHeight > screenHeight - 50) top = screenHeight - tooltipHeight - 50;

    return { top, left, tooltipWidth, arrowStyle };
  };

  const { top, left, tooltipWidth, arrowStyle } = getTooltipPosition();

  return (
    <>
      <TouchableOpacity
        ref={triggerRef}
        onPress={showTooltip}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={hideTooltip}>
          <View style={styles.overlay}>
            <Animated.View
              style={[
                styles.tooltip,
                {
                  top,
                  left,
                  width: tooltipWidth,
                  opacity: fadeAnim,
                  transform: [
                    {
                      scale: fadeAnim.interpolate({
                        inputRange: [0, 0.8],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.tooltipText} weight={FONT_WEIGHTS.REGULAR}>
                {content || 'Tooltip content'}
              </Text>
              <View style={arrowStyle as any} />
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    // backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: colors.dark,
    borderRadius: dimensions.radius.md,
    padding: dimensions.spacing.md,
  },
  tooltipText: {
    color: colors.light,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'left',
  },
});
