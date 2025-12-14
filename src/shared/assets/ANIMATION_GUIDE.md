# Custom LottieView Animations Guide

## Overview

The `FullScreenLoading` and `OtpVerificationScreen` components now support custom LottieView animations through the `animationSource` and `animationStyle` props.

## Usage Examples

### 1. Using FullScreenLoading with Custom Animation

```tsx
import FullScreenLoading from '@/shared/screens/FullScreenLoading';
import { getLoadingAnimation } from '@/shared/assets/animations';

// Using predefined animation
const hubAnimation = getLoadingAnimation('hub');

<FullScreenLoading
  title="Processing..."
  subtitle="Please wait while we verify your information"
  animationSource={hubAnimation.source}
  animationStyle={hubAnimation.style}
  showProgressBar={false}
/>

// Using custom animation
<FullScreenLoading
  title="Loading..."
  subtitle="Custom animation example"
  animationSource={require('./path/to/your/animation.json')}
  animationStyle={{ width: 180, height: 180 }}
/>
```

### 2. Using OtpVerificationScreen with Custom Loading Animation

```tsx
import OtpVerificationScreen from '@/shared/screens/OtpVerificationScreen';
import { getLoadingAnimation } from '@/shared/assets/animations';

const animation = getLoadingAnimation('planeSmall');

<OtpVerificationScreen
  title="OTP Verification"
  subtitle="Enter the code sent to your phone"
  loading={isLoading}
  loadingAnimationSource={animation.source}
  loadingAnimationStyle={animation.style}
  onVerify={handleVerify}
  onResend={handleResend}
/>
```

## Available Predefined Animations

| Animation Type | Description | Default Size |
|---------------|-------------|--------------|
| `plane` | Default plane loading animation | 200x200 |
| `hub` | Hub/circle loading animation | 150x150 |
| `planeSmall` | Small plane animation | 120x120 |
| `hubLarge` | Large hub animation | 250x250 |

## Props Reference

### FullScreenLoading Props

- `animationSource?: any` - LottieView animation source (JSON file)
- `animationStyle?: any` - Custom styles for the animation view

### OtpVerificationScreen Props

- `loadingAnimationSource?: any` - LottieView animation source for loading state
- `loadingAnimationStyle?: any` - Custom styles for the loading animation

## Adding New Animations

1. Add your `.json` LottieView file to `src/shared/assets/lottie/`
2. Update `src/shared/assets/animations.ts` to include your new animation:

```tsx
export const LOADING_ANIMATIONS = {
  // ... existing animations
  myCustomAnimation: {
    source: require('@/shared/assets/lottie/my-animation.json'),
    style: {
      width: 160,
      height: 160,
    },
  },
} as const;
```

3. Use the new animation:

```tsx
const customAnimation = getLoadingAnimation('myCustomAnimation');
```

## Best Practices

1. **Animation Size**: Keep animations between 120x120 and 250x250 pixels for optimal UX
2. **File Size**: Optimize LottieView JSON files to keep them under 100KB
3. **Fallback**: The components will use the default plane animation if no custom animation is provided
4. **Performance**: Consider using smaller animations for frequently shown loading states

## Example Implementation

See `LoginOtpScreen.tsx` for a complete example of how to implement custom animations in your screens.
