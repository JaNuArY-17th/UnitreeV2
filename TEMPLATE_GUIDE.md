# React Native TypeScript Template Guide

This is a clean, reusable template for React Native applications built with TypeScript, Redux Toolkit, React Navigation v7, and TanStack React Query.

## Features Included

✅ **Authentication System**
- JWT token management with automatic refresh
- 401 error handling and interceptors
- AuthProvider context for global auth state
- Basic auth hooks (useAuthGuard, useCustomAlert)

✅ **State Management**
- Redux Toolkit with redux-persist
- React Query (TanStack) for server state
- Type-safe Redux hooks

✅ **Navigation**
- React Navigation v7 with Native Stack
- Bottom Tab Navigator structure
- Type-safe navigation params

✅ **Internationalization (i18n)**
- Multi-language support (EN, VI as examples)
- Feature-based locale structure
- 6 core translation sections:
  - `common`: Basic UI strings
  - `validation`: Form validation messages
  - `navigation`: Navigation labels
  - `auth`: Authentication messages
  - `timeAgo`: Relative time formatting
  - `date`: Date and month names

✅ **Components**
11 reusable, generic components:
- `AuthProvider.tsx` - Auth context
- `CustomAlert.tsx` - Custom alerts
- `FullScreenLoading.tsx` - Loading overlay
- `LanguageSwitcher.tsx` - Language selection
- `LoadingOverlay.tsx` - Loading indicator
- `NativeModuleErrorBoundary.tsx` - Error boundary
- `PasswordPromptModal.tsx` - Password modal
- `ScreenHeader.tsx` - Header component
- `SearchBar.tsx` - Search functionality
- `SectionCardBackground.tsx` - Card background
- `TimeframeSelector.tsx` - Time range picker

✅ **Utils & Services**
- Axios client with interceptors
- File upload service
- Avatar management service
- Device info utilities
- Token management
- Biometric storage utilities

✅ **Generic Assets**
- 80+ generic icons (Notification, Settings, Profile, Search, etc.)
- Removed: Finance/wallet/payment/inventory-specific icons

✅ **Type System**
- Generic API types (ApiResponse<T>, ApiError)
- Store types for Redux
- Timeframe selection types
- Navigation param lists

## Architecture Overview

```
src/
├── features/
│   ├── [YourFeatureName]/
│   │   ├── components/       # Feature-specific components
│   │   ├── screens/          # Screen components
│   │   ├── hooks/            # Custom hooks
│   │   ├── services/         # API calls
│   │   ├── store/            # Redux slices (if needed)
│   │   ├── types/            # TypeScript interfaces
│   │   ├── utils/            # Utilities
│   │   ├── locales/          # i18n files (en.json, vi.json)
│   │   └── index.ts          # Barrel exports
│
├── navigation/
│   ├── RootNavigator.tsx      # Auth conditional rendering
│   ├── BottomTabNavigator.tsx # Main app tabs
│   ├── types.ts               # Navigation param lists
│   └── ...
│
└── shared/
    ├── components/     # Reusable generic components
    ├── config/         # App configuration (i18n, env, fonts)
    ├── constants/      # Generic constants and routes
    ├── contexts/       # Shared context providers
    ├── hooks/          # Shared custom hooks
    ├── locales/        # Generic i18n (en.json, vi.json)
    ├── providers/      # Provider components
    ├── services/       # Shared services (auth, file upload, etc.)
    ├── store/          # Redux configuration
    ├── themes/         # Design tokens (colors, typography)
    ├── types/          # Shared TypeScript types
    ├── utils/          # Generic utilities
    └── assets/
        ├── fonts/      # Font files
        └── icons/      # SVG/icon components
```

## Customization Guide

### 1. Add Your First Feature

```typescript
// src/features/myfeature/index.ts
export { MyFeatureScreen } from './screens/MyFeatureScreen';
export { useMyFeature } from './hooks/useMyFeature';

// src/features/myfeature/screens/MyFeatureScreen.tsx
import { useTranslation } from 'react-i18next';

export function MyFeatureScreen() {
  const { t } = useTranslation();
  
  return (
    <View>
      <Text>{t('common:loading')}</Text>
    </View>
  );
}
```

### 2. Add Feature Locales

```json
// src/features/myfeature/locales/en.json
{
  "myfeature": {
    "title": "My Feature",
    "description": "Feature description"
  }
}
```

Update `src/shared/config/i18n.ts` to include feature locales.

### 3. Add Redux Slice (if needed)

```typescript
// src/features/myfeature/store/mySlice.ts
import { createSlice } from '@reduxjs/toolkit';

const mySlice = createSlice({
  name: 'myFeature',
  initialState: {},
  reducers: {},
});

export default mySlice.reducer;
```

Register in `src/shared/store/index.ts`:
```typescript
import myFeatureReducer from '@/features/myfeature/store/mySlice';

const store = configureStore({
  reducer: {
    myFeature: myFeatureReducer,
    // ...
  },
});
```

### 4. Add API Service

```typescript
// src/features/myfeature/services/api.ts
import { apiClient } from '@/shared/utils/axios';
import { ApiResponse } from '@/shared/types/api';

export interface MyData {
  id: string;
  name: string;
}

export async function fetchMyData(): Promise<ApiResponse<MyData[]>> {
  const response = await apiClient.get('/api/mydata');
  return response.data;
}
```

### 5. Add Locales

Add new language support by updating:
- `src/shared/locales/[language].json` - Generic translations
- `src/features/[name]/locales/[language].json` - Feature-specific translations

## Key Configuration Files

### `/src/shared/config/env.ts`
```typescript
export const BASE_URL = 'https://your-api.com';
export const TIMEOUT = 30000; // 30 seconds
```

### `/src/shared/config/i18n.ts`
Configure language detection and fallback language.

### `/src/shared/themes/`
Customize colors, typography, spacing, and shadows here.

### `/src/shared/constants/routes.ts`
Define navigation route names:
```typescript
export const ROUTES = {
  HOME: 'Home',
  YOUR_FEATURE: 'YourFeature',
  // ...
};
```

## Building for Production

```bash
# Android
npm run android -- --variant=release

# iOS
cd ios && xcodebuild -configuration Release && cd ..
```

## Common Patterns

### Using Typed Redux
```typescript
import { useAppDispatch, useAppSelector } from '@/shared/hooks/useRedux';

function MyComponent() {
  const dispatch = useAppDispatch();
  const state = useAppSelector(state => state.myFeature);
  
  return <Text>{state.data}</Text>;
}
```

### Using React Query
```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchMyData } from './services/api';

function MyComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['myData'],
    queryFn: fetchMyData,
  });
  
  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error</Text>;
  
  return <Text>{data?.map(item => item.name)}</Text>;
}
```

### Using i18n
```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();
  
  return (
    <>
      <Text>{t('common:loading')}</Text>
      <Text>{t('myfeature:title')}</Text>
      <Button onPress={() => i18n.changeLanguage('vi')}>
        Vietnamese
      </Button>
    </>
  );
}
```

## Removed Domain-Specific Code

This template had the following finance/wallet-specific code removed:

**Deleted Files:**
- ❌ Finance icons (30+ files): Revenue, Invoice, Bank, Deposit, Product, Loan, etc.
- ❌ Utility functions: `format.ts` (VND currency), `currencyPronunciation.ts`, `chart.ts`, `chartDataProcessor.ts`
- ❌ Services: `pronunciationService.ts`
- ❌ Routes: Finance-specific screens (Deposit, Withdraw, Trading, eKYC, Loans, etc.)

**Simplified Locales:**
- ❌ Removed 150+ finance keys (verification, otp, account, store, inventory, bank, payment)
- ✅ Kept 6 generic sections (common, validation, navigation, auth, timeAgo, date)

**Result:** Clean, reusable template ready for any application domain.

## Environment Setup

```bash
# Install dependencies
npm install
bundle install

# iOS setup
cd ios && bundle exec pod install && cd ..

# Android (no additional setup needed)

# Start development
npm start
npm run ios    # or npm run android
```

## Support & Troubleshooting

### Metro Cache Issues
```bash
npx react-native start --reset-cache
```

### Pod Installation
```bash
cd ios && bundle exec pod install --repo-update && cd ..
```

### TypeScript Errors
```bash
npx tsc --noEmit
```

---

**Template Version:** 1.0.0  
**Last Updated:** December 2024  
**Based on:** React Native 0.82 + TypeScript
