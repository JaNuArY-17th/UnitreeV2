# Features Directory

This directory contains all feature modules for the application. Each feature follows a consistent folder structure:

## Feature Module Structure

Each feature module should follow this structure:

```
feature-name/
├── components/       # Feature-specific React components
├── screens/         # Screen components (pages)
├── hooks/          # Custom React hooks
├── services/       # API services and data fetching
├── store/          # Redux slices and state management
├── types/          # TypeScript type definitions
├── utils/          # Feature-specific utilities
├── locales/        # i18n translations
├── __tests__/      # Test files
└── index.ts        # Public API exports
```

## Current Features

- **authentication** - User authentication (login, signup, OTP)
- **banks** - Bank account management
- **deposit** - Deposit and withdrawal functionality
- **econtract** - Electronic contract management
- **ekyc** - Electronic KYC flow
- **home** - Main dashboard
- **loans** - Loan management
- **markets** - Stock market features
- **news** - News feed
- **notifications** - Push notifications
- **onboarding** - User onboarding flow
- **portfolio** - Investment portfolio
- **profile** - User profile management
- **savings** - Savings accounts
- **search** - Search functionality
- **settings** - App settings
- **transactions** - Transaction history
- **watchlist** - Market watchlist

## Guidelines

1. Each feature should be self-contained and independent
2. Use the shared components from `src/shared/` for common UI elements
3. Export public API through `index.ts`
4. Keep feature-specific logic within the feature folder
5. Use TypeScript for all new code
