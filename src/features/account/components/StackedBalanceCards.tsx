import React from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { colors, spacing } from '@/shared/themes';
import { BalanceCard } from '@/features/home/components';

interface AccountData {
  id: string;
  type: 'main_account' | 'espay_later';
  balance: number;
  accountNumber: string;
  backgroundColor: string;
}

interface StackedBalanceCardsProps {
  accountTypes: AccountData[];
  onBalancePress?: () => void;
  onAccountSelect?: () => void;
  onAccountTypeChange?: (accountType: string) => void;
  onCheckNowPress?: () => void;
  initialTopCard?: 'main_account' | 'espay_later';
  selectedCard?: 'main_account' | 'espay_later';
}

export const StackedBalanceCards: React.FC<StackedBalanceCardsProps> = ({
  accountTypes,
  onBalancePress,
  onAccountSelect,
  onAccountTypeChange,
  onCheckNowPress,
  initialTopCard = 'main_account',
  selectedCard,
}) => {
  const [topCard, setTopCard] = React.useState<'main_account' | 'espay_later'>(initialTopCard);
  const [isAnimating, setIsAnimating] = React.useState(false);
  
  // Animation values - start both at 1 to maintain stacked appearance
  const topCardAnimValue = React.useRef(new Animated.Value(1)).current;
  const bottomCardAnimValue = React.useRef(new Animated.Value(1)).current;

  // Animate to a specific card
  const animateToCard = React.useCallback((cardType: 'main_account' | 'espay_later', onComplete?: () => void) => {
    if (cardType !== topCard && !isAnimating) {
      setIsAnimating(true);
      
      // First phase: slide cards apart
      Animated.parallel([
        // Top card slides up and to the right
        Animated.timing(topCardAnimValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        // Bottom card slides down and to the left
        Animated.timing(bottomCardAnimValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Update the state (swap cards)
        setTopCard(cardType);
        
        // Second phase: slide cards back to their positions
        Animated.parallel([
          Animated.timing(topCardAnimValue, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(bottomCardAnimValue, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setIsAnimating(false);
          onComplete?.();
        });
      });
    }
  }, [topCard, isAnimating, topCardAnimValue, bottomCardAnimValue]);
  
  // Sync topCard with selectedCard prop
  React.useEffect(() => {
    if (selectedCard && selectedCard !== topCard) {
      animateToCard(selectedCard);
    }
  }, [selectedCard, topCard, animateToCard]);
  
  // Balance visibility state for each card
  const [balanceVisibility, setBalanceVisibility] = React.useState<{
    main_account: boolean;
    espay_later: boolean;
  }>({
    main_account: false,
    espay_later: false,
  });

  // Stack card tap handler
  const handleCardTap = (cardType: 'main_account' | 'espay_later') => {
    animateToCard(cardType, () => {
      onAccountTypeChange?.(cardType);
    });
  };

  // Handle balance visibility change for a specific card
  const handleBalanceVisibilityChange = (cardType: 'main_account' | 'espay_later', visible: boolean) => {
    setBalanceVisibility(prev => ({
      ...prev,
      [cardType]: visible,
    }));
  };

  const renderStackedCards = () => {
    // Determine order: topCard is rendered last (on top)
    const bottomCard = accountTypes.find(a => a.type !== topCard)!;
    const topCardData = accountTypes.find(a => a.type === topCard)!;
    
    // Animation interpolations for slide apart effect
    const topCardTransform = {
      translateX: topCardAnimValue.interpolate({
        inputRange: [0, 1],
        outputRange: [150, 0], // Slide right when animating out
      }),
      translateY: topCardAnimValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-30, 20], // Slide up when animating out, then position below bottom card
      }),
      scale: topCardAnimValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.85, 1],
      }),
    };
    
    const bottomCardTransform = {
      translateX: bottomCardAnimValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-150, 0], // Slide left when animating out
      }),
      translateY: bottomCardAnimValue.interpolate({
        inputRange: [0, 1],
        outputRange: [30, 0], // Slide down when animating out, then to normal bottom position (top)
      }),
      scale: bottomCardAnimValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.85, 0.95], // Start and end at stacked scale
      }),
    };
    
    const topCardOpacity = topCardAnimValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1],
    });
    
    const bottomCardOpacity = bottomCardAnimValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 0.7], // End at stacked opacity
    });
    
    return (
      <View style={styles.stackContainer}>
        <Animated.View style={[
          styles.cardStack, 
          { 
            zIndex: 1,
            opacity: bottomCardOpacity,
            transform: [
              { translateX: bottomCardTransform.translateX },
              { translateY: bottomCardTransform.translateY },
              { scale: bottomCardTransform.scale }
            ]
          }
        ]}> 
          <Pressable 
            style={{ flex: 1 }} 
            onPress={() => handleCardTap(bottomCard.type)}
            disabled={isAnimating}
          >
                        <BalanceCard
              key={bottomCard.id}
              balance={bottomCard.balance}
              currency="đ"
              accountType={bottomCard.type}
              accountNumber={bottomCard.accountNumber}
              isLoading={false}
              onPress={onBalancePress}
              onAccountSelect={onAccountSelect}
              onAccountTypeChange={onAccountTypeChange}
              onCheckNowPress={onCheckNowPress}
              backgroundColor={bottomCard.backgroundColor}
              showCheckNow={false}
              isBalanceVisible={balanceVisibility[bottomCard.type]}
              onBalanceVisibilityChange={(visible) => handleBalanceVisibilityChange(bottomCard.type, visible)}
              useCachedData={bottomCard.type === 'main_account'}
            />
          </Pressable>
        </Animated.View>
        <Animated.View style={[
          styles.cardStack, 
          styles.cardStackTop, 
          { 
            zIndex: 2,
            opacity: topCardOpacity,
            transform: [
              { translateX: topCardTransform.translateX },
              { translateY: topCardTransform.translateY },
              { scale: topCardTransform.scale }
            ]
          }
        ]}> 
          <BalanceCard
            key={topCardData.id}
            balance={topCardData.balance}
            currency="đ"
            accountType={topCardData.type}
            accountNumber={topCardData.accountNumber}
            isLoading={false}
            onPress={onBalancePress}
            onAccountSelect={onAccountSelect}
            onAccountTypeChange={onAccountTypeChange}
            onCheckNowPress={onCheckNowPress}
            backgroundColor={topCardData.backgroundColor}
            showCheckNow={false}
            isBalanceVisible={balanceVisibility[topCardData.type]}
            onBalanceVisibilityChange={(visible) => handleBalanceVisibilityChange(topCardData.type, visible)}
            useCachedData={topCardData.type === 'main_account'}
          />
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderStackedCards()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.xxxl + 20,
    alignItems: 'center',
    height: 150, // enough for two stacked cards
    justifyContent: 'center',
    overflow: 'hidden', // Hide cards when they slide out
  },
  stackContainer: {
    width: 320,
    height: 200,
    position: 'relative',
  },
  cardStack: {
    position: 'absolute',
    width: 300,
    left: 10,
    top: 0, // Bottom card now at top
  },
  cardStackTop: {
    top: 20, // Top card positioned below to hide bottom part of behind card
  },
});
