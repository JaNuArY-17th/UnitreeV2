# Shared Directory

This directory contains shared resources used across multiple features in the application.

## Directory Structure

```
shared/
├── assets/         # Images, fonts, and static resources
├── components/     # Reusable UI components
├── config/         # App configuration and environment settings
├── constants/      # Application-wide constants
├── hooks/          # Custom React hooks for common functionality
├── locales/        # i18n translation files
├── providers/      # React context providers
├── services/       # Shared API services and utilities
├── store/          # Redux store configuration
├── themes/         # Theme configuration and styling
├── types/          # Shared TypeScript type definitions
└── utils/          # Utility functions and helpers
```

## Guidelines

1. **Components**: Place reusable UI components that are used by multiple features
2. **Hooks**: Custom hooks that provide common functionality across features
3. **Services**: API clients, authentication services, and data fetching utilities
4. **Store**: Redux store configuration and global state slices
5. **Utils**: Pure utility functions for common operations
6. **Types**: Shared TypeScript interfaces and types
7. **Config**: Environment variables and app configuration
8. **Themes**: Design system, colors, typography, and spacing

## Usage

Import shared resources using the configured path aliases:

```typescript
import { Button } from '@shared/components';
import { useAuth } from '@shared/hooks';
import { apiClient } from '@shared/services';
import { colors } from '@shared/themes';
```
