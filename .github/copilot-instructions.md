# Copilot Instructions for ENSOGO ESPay App

## Project Architecture

**React Native 0.81.1 financial services app** with TypeScript, Redux Toolkit, React Navigation v7, and TanStack React Query. Uses feature-based architecture with Vietnamese as primary language.

### Critical Path Aliases
```typescript
// Current aliases (use these)
'@/*' → 'src/*'
'@shared/*' → 'src/shared/*'
'@features/*' → 'src/features/*'
'@navigation/*' → 'src/navigation/*'
'@assets/*' → 'src/assets/*'

// Legacy aliases (being migrated, still work)
'@components/*', '@hooks/*', '@services/*', '@store/*', '@utils/*', '@types/*'
```

### Feature Structure Pattern
Each feature in `src/features/[name]/` follows this structure:
```
feature-name/
├── components/     # Feature-specific components
├── screens/        # Screen components
├── hooks/          # Custom hooks
├── services/       # API calls
├── store/          # Redux slices
├── types/          # TypeScript interfaces
├── utils/          # Feature utilities
├── locales/        # i18n (en.json, vi.json)
└── index.ts        # Barrel exports
```

**Always export through barrel files** (`index.ts`) for clean imports.

## Core Development Patterns

### Authentication & State Flow
- Uses `AuthProvider` with `authGuard` service for token management
- Automatic token refresh with 401 handling in axios interceptors
- Navigation splits: Auth stack (Login, OTP, etc.) vs Main app (Bottom tabs)
- Check `src/shared/components/AuthProvider.tsx` and `src/shared/services/authGuard.ts`

### API Integration
- Centralized `apiClient` in `src/shared/utils/axios.ts`
- Config in `src/shared/config/env.ts` (BASE_URL, timeouts)
- Types in `src/shared/types/api.ts` (ApiResponse<T>, ApiError)
- Device ID and language headers auto-added to requests

### Internationalization
- Primary: Vietnamese (`vi`), Fallback: English (`en`)
- Feature-specific translations in `feature/locales/`
- Namespace pattern: `t('common:navigation.home')`
- Init in `src/shared/config/i18n.ts`

### Redux Store Pattern
- Feature slices in `src/features/[name]/store/`
- Registered in `src/shared/store/index.ts`
- Use React Query for server state, Redux for client state

## Development Workflow

### Commands (Windows PowerShell)
```bash
# Setup (first time only)
npm install; bundle install; cd ios; bundle exec pod install; cd ..

# Development
npm start                    # Metro bundler
npm run android             # Android
npm run ios                 # iOS

# Debugging
npx react-native start --reset-cache  # Clear cache
npm test -- --watch        # Tests
npm run lint -- --fix      # Auto-fix linting
```

### Navigation Architecture
- `RootNavigator.tsx`: Auth conditional rendering
- `BottomTabNavigator.tsx`: Main app tabs (Home, History, QRScan, Report, Profile)
- Type-safe with `RootStackParamList` in `src/navigation/types.ts`

### Testing Approach
- Jest with React Native preset
- Colocate tests in `__tests__/` within features
- Mock external dependencies (API calls, AsyncStorage)

## Styling & UI System

### Theme System
- Design tokens in `src/shared/themes/`
- Colors, typography, spacing, shadows centralized
- Use `StyleSheet.create()` for performance
- Lottie animations and SVG support configured

### Component Patterns
- Functional components with hooks
- `forwardRef` for ref forwarding
- Custom `CustomTabBar` for bottom navigation
- Biometric authentication support via `react-native-biometrics`

## Critical Integration Points

### Metro Configuration
- SVG transformer via `react-native-svg-transformer`
- Path resolution for aliases
- Worklets plugin (must be last)

### Native Dependencies
- iOS: Run `bundle exec pod install` after adding native deps
- Android: Clean with `cd android && ./gradlew clean`
- Specific native features: Biometrics, PDF viewer, signature capture

### Query Client Setup
```typescript
// In App.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false },
    mutations: { retry: false }, // Prevent duplicate API calls
  },
});
```

## Common Gotchas

1. **Token Management**: Use `authGuard.ensureValidToken()` before protected API calls
2. **Language Loading**: Always check if i18n is initialized before rendering
3. **Barrel Exports**: Update `index.ts` when adding new public APIs
4. **Metro Cache**: Clear cache when adding new aliases or transformers
5. **Native Deps**: iOS requires `pod install`, Android may need clean builds
6. **Redux DevTools**: Only enabled in development (see store config)

## File Naming Conventions
- Screens: `ScreenName.tsx` (e.g., `LoginScreen.tsx`)
- Components: `ComponentName.tsx`
- Services: `serviceName.ts` (e.g., `authService.ts`)
- Types: `types.ts` or `typeName.ts`
- Locales: `en.json`, `vi.json`

Refer to `AGENTS.md` for comprehensive developer documentation and troubleshooting.

### NOTE: do not automatically push to github. This step is manual.