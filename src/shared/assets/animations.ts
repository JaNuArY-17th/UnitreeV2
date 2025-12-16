/**
 * Predefined animation options for FullScreenLoading component
 * This file provides easy-to-use animation configurations
 */

export const LOADING_ANIMATIONS = {
  // Default plane animation
  plane: {
    source: require('@/shared/assets/lottie/plane-loading.json'),
    style: {
      width: 200,
      height: 200,
    },
  },

  // Hub loading animation
  hub: {
    source: require('@/shared/assets/lottie/Loading_Hub6.json'),
    style: {
      width: 150,
      height: 150,
    },
  },

  // Small plane animation
  planeSmall: {
    source: require('@/shared/assets/lottie/plane-loading.json'),
    style: {
      width: 120,
      height: 120,
    },
  },

  // Large hub animation
  hubLarge: {
    source: require('@/shared/assets/lottie/Loading_Hub6.json'),
    style: {
      width: 250,
      height: 250,
    },
  },

  // Plant animation for registration success
  plant: {
    source: require('@/shared/assets/lottie/plant.json'),
    style: {
      width: 150,
      height: 150,
    },
  },

  success: {
    source: require('@/shared/assets/lottie/Success.json'),
    style: {
      width: 150,
      height: 150,
    },
  }
} as const;

// Type for animation keys
export type LoadingAnimationType = keyof typeof LOADING_ANIMATIONS;

/**
 * Get animation configuration by type
 * @param type - The animation type to get
 * @returns Animation source and style configuration
 */
export const getLoadingAnimation = (type: LoadingAnimationType) => {
  return LOADING_ANIMATIONS[type];
};
