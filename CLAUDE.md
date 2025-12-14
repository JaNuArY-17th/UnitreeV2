# CLAUDE.md - Code Formatting Standards for ENSOGO-ESPay-App

This document defines the code formatting standards and conventions for the ENSOGO-ESPay-App project. **Claude Code must strictly follow these standards when generating, modifying, or refactoring code.**

---

## Table of Contents

1. [TypeScript/JavaScript Formatting](#1-typescriptjavascript-formatting)
2. [React/React Native Component Structure](#2-reactreact-native-component-structure)
3. [File Organization & Naming Conventions](#3-file-organization--naming-conventions)
4. [Import Statement Ordering](#4-import-statement-ordering)
5. [Function & Variable Naming](#5-function--variable-naming)
6. [Comments & Documentation](#6-comments--documentation)
7. [Type Definitions](#7-type-definitions)
8. [State Management Patterns](#8-state-management-patterns)
9. [Styling Approaches](#9-styling-approaches)
10. [Error Handling](#10-error-handling)

---

## 1. TypeScript/JavaScript Formatting

### Prettier Configuration

```javascript
// .prettierrc.js
{
  arrowParens: 'avoid',      // No parentheses for single parameter arrow functions
  singleQuote: true,         // Use single quotes for strings
  trailingComma: 'all',      // Trailing commas everywhere
}
```

### Core Rules

- **Indentation**: 2 spaces (no tabs)
- **Quotes**: Single quotes (`'`) for strings
- **Semicolons**: **NO semicolons** at end of statements
- **Trailing Commas**: Always include in objects, arrays, and function parameters
- **Arrow Functions**: No parentheses for single parameters (`item => item.id`)

### Examples

```typescript
// ✅ CORRECT
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {}).format(amount)
}

const items = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
]

// ❌ INCORRECT
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {}).format(amount);  // No semicolon
};

const items = [
  { id: 1, name: "Item 1" },  // Use single quotes
  { id: 2, name: "Item 2" }   // Missing trailing comma
];
```

---

## 2. React/React Native Component Structure

### Component Template

```typescript
import React, { useState, useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useTranslation } from '@/shared/hooks/useTranslation'
import { colors, spacing, typography } from '@/shared/themes'
import { Text } from '@/shared/components/base'

// Props interface
interface ComponentNameProps {
  prop1?: string
  prop2: number
  onPress?: () => void
}

// Component
const ComponentName: React.FC<ComponentNameProps> = ({
  prop1,
  prop2,
  onPress,
}) => {
  // 1. Hooks (state, refs, context, custom hooks)
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { t } = useTranslation('namespace')
  const [isLoading, setIsLoading] = useState(false)

  // 2. Effects
  useEffect(() => {
    // Effect logic
  }, [])

  // 3. Event handlers
  const handlePress = () => {
    console.log('🔄 [ComponentName] Button pressed')
    onPress?.()
  }

  // 4. Computed values
  const computedValue = useMemo(() => {
    return prop2 * 2
  }, [prop2])

  // 5. Render
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{prop1}</Text>
    </View>
  )
}

// Styles at bottom
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
  },
})

export default ComponentName
```

### Key Rules

1. **Always use functional components** with `React.FC<PropsType>`
2. **Define prop interfaces** above the component
3. **Order component sections**: Hooks → Effects → Handlers → Computed Values → Render
4. **Styles at bottom** using `StyleSheet.create()`
5. **Export default** at the end

---

## 3. File Organization & Naming Conventions

### Project Structure

```
src/
├── features/               # Feature modules (feature-based architecture)
│   ├── account/
│   │   ├── components/    # Feature-specific components
│   │   ├── hooks/         # Feature-specific hooks
│   │   ├── locales/       # Feature-specific translations
│   │   ├── screens/       # Feature screens
│   │   ├── services/      # Feature API services
│   │   ├── store/         # Redux slices & selectors
│   │   ├── types/         # TypeScript types
│   │   └── index.ts       # Barrel export
│   └── notifications/
│       └── ...
├── shared/                # Shared resources
│   ├── components/        # Reusable components
│   │   ├── base/         # Basic UI components (Text, Button, etc.)
│   │   └── ...           # Complex shared components
│   ├── hooks/            # Shared hooks
│   ├── themes/           # Theme system (colors, typography, spacing)
│   ├── utils/            # Utility functions
│   └── types/            # Shared TypeScript types
├── navigation/           # Navigation configuration
├── locales/             # Global translations
└── assets/              # Images, fonts, icons
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| **Components** | PascalCase | `PostpaidCard.tsx`, `NotificationItem.tsx` |
| **Screens** | PascalCase + "Screen" suffix | `AccountManagementScreen.tsx` |
| **Hooks** | camelCase + "use" prefix | `useAccountTabData.ts`, `useNotifications.ts` |
| **Services** | camelCase + "Service" suffix | `accountService.ts`, `authService.ts` |
| **Types/Interfaces** | PascalCase | `AccountState`, `MyPostPaidResponse` |
| **Redux Slices** | camelCase + "Slice" suffix | `accountSlice.ts`, `authSlice.ts` |
| **Redux Selectors** | camelCase + "Selectors" suffix | `accountSelectors.ts` |
| **Utils** | camelCase | `formatCurrency.ts`, `dateUtils.ts` |
| **Constants** | UPPER_SNAKE_CASE | `FONT_WEIGHTS`, `API_ENDPOINTS` |

---

## 4. Import Statement Ordering

### Standard Import Order

```typescript
// 1. React and React Native core imports
import React, { useState, useEffect, useMemo } from 'react'
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// 2. Third-party libraries
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

// 3. Navigation types
import type { RootStackParamList } from '@/navigation/types'

// 4. Shared utilities, hooks, and components (using @/ alias)
import { useTranslation } from '@/shared/hooks/useTranslation'
import { colors, spacing, typography, getFontFamily } from '@/shared/themes'
import { Text } from '@/shared/components/base'
import { ScreenHeader } from '@/shared/components'

// 5. Icons
import { HugeiconsIcon } from '@hugeicons/react-native'
import { CheckmarkCircle01Icon } from '@hugeicons/core-free-icons'

// 6. Feature-specific imports (relative paths)
import { useNotifications } from '../hooks/useNotifications'
import { NotificationItem } from '../components/NotificationItem'
import type { NotificationTabType } from '../types/notificationTypes'

// 7. Assets
import Logo from '@assets/images/logo.png'
```

### Path Aliases (from tsconfig.json)

- `@/*` → `src/*` (src root)
- `@shared/*` → `src/shared/*`
- `@features/*` → `src/features/*`
- `@navigation/*` → `src/navigation/*`
- `@assets/*` → `src/assets/*`
- `@locales/*` → `src/locales/*`

**Prefer path aliases for shared resources, relative paths for feature-internal imports.**

---

## 5. Function & Variable Naming

### Naming Rules

| Pattern | Use Case | Example |
|---------|----------|---------|
| `camelCase` | Functions, variables | `formatCurrency`, `totalAmount` |
| `PascalCase` | Components, types, interfaces | `AccountCard`, `UserData` |
| `UPPER_SNAKE_CASE` | Constants | `API_BASE_URL`, `MAX_RETRY_COUNT` |
| `handle*` | Event handlers | `handlePress`, `handleSubmit`, `handleChange` |
| `is*`, `has*`, `should*` | Boolean variables | `isLoading`, `hasAccount`, `shouldDisplay` |
| `use*` | Custom hooks | `useAuth`, `useAccountData` |
| `_*` | Private/internal methods | `_calculateProgress`, `_validateInput` |

### Examples

```typescript
// ✅ CORRECT
const formatCurrency = (amount: number) => { /* ... */ }
const isWithinPaymentPeriod = (dueDate: string): boolean => { /* ... */ }
const handleNotificationPress = () => { /* ... */ }
const useAccountTabData = () => { /* ... */ }

// Constants
const API_BASE_URL = 'https://api.example.com'
const MAX_RETRY_COUNT = 3

// Boolean variables
const [isLoading, setIsLoading] = useState(false)
const hasUnreadNotifications = notifications.some(n => !n.isRead)

// ❌ INCORRECT
const FormatCurrency = (amount: number) => { /* ... */ }  // Should be camelCase
const loading = true  // Should be isLoading
const clickHandler = () => { /* ... */ }  // Should be handleClick
```

---

## 6. Comments & Documentation

### JSDoc for Exported Functions

```typescript
/**
 * Account service for postpaid API calls
 */
export const accountService = {
  /**
   * Get user's postpaid information
   * @returns Promise with postpaid data
   */
  getMyPostpaid: async (): Promise<MyPostPaidResponse> => {
    const response = await apiClient.get('/postpaid/my-postpaid')
    return response.data
  },
}
```

### Inline Comments

```typescript
// Use single-line comments for explanations
// Provide context for complex logic or business rules

// Calculate remaining credit based on limit and spent amount
const remainingCredit = creditLimit - spentCredit

// Check if user is within payment period (before due date)
const isWithinPaymentPeriod = new Date() < new Date(dueDate)
```

### Console Logging with Emoji Prefixes

Use emoji prefixes for better log visibility during debugging:

| Emoji | Purpose | Example |
|-------|---------|---------|
| 🔄 | Action/Process | `console.log('🔄 [NotificationScreen] Fetching notifications')` |
| ✅ | Success | `console.log('✅ [LoginScreen] Login successful')` |
| ❌ | Error | `console.error('❌ [AccountService] Failed to fetch data:', error)` |
| 🔍 | Debug/Inspection | `console.log('🔍 [Component] Current state:', state)` |
| 📝 | Info/Note | `console.log('📝 [App] App initialized')` |
| ⚠️ | Warning | `console.warn('⚠️ [Validator] Invalid input detected')` |

```typescript
// ✅ CORRECT
console.log('🔄 [NotificationScreen] Marking notification as read:', notificationId)
console.log('✅ [AccountSlice] Postpaid data fetched successfully')
console.error('❌ [AuthService] Login failed:', error.message)

// ❌ INCORRECT
console.log('Marking notification as read')  // No emoji, no component name
```

---

## 7. Type Definitions

### Type vs Interface

- Use `type` for unions, primitives, and mapped types
- Use `interface` for object shapes that may be extended

```typescript
// ✅ Use 'type' for unions and literals
export type PostpaidStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'LOCKED'
export type NotificationTabType = 'all' | 'unread' | 'read'

// ✅ Use 'interface' for object shapes
export interface MyPostPaidResponse {
  success: boolean
  message: string
  data: {
    userId: string
    creditLimit: number
    spentCredit: number
    status: PostpaidStatus
    dueDate: string
  }
  code: number
}
```

### Type Import Syntax

Always use the `type` keyword for type-only imports:

```typescript
// ✅ CORRECT
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '@/navigation/types'
import type { AccountState } from '../types/accountTypes'

// ❌ INCORRECT
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '@/navigation/types'
```

### Generic Types for API Responses

```typescript
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  code: number
}

export type MyPostPaidResponse = ApiResponse<{
  userId: string
  creditLimit: number
  spentCredit: number
}>
```

---

## 8. State Management Patterns

### Redux Toolkit Structure

```typescript
// accountSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { accountService } from '../services/accountService'

// State interface
export interface AccountState {
  postpaidData: PostpaidData | null
  isLoading: boolean
  error: string | null
}

const initialState: AccountState = {
  postpaidData: null,
  isLoading: false,
  error: null,
}

// Async thunk
export const fetchPostpaidData = createAsyncThunk(
  'account/fetchPostpaidData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await accountService.getMyPostpaid()
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to fetch postpaid data')
      }
      return response.data
    } catch (error: any) {
      console.error('❌ [AccountSlice] Failed to fetch postpaid data:', error)
      return rejectWithValue(error.message || 'Failed to fetch postpaid data')
    }
  },
)

// Slice
const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null
    },
    resetAccountState: () => initialState,
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPostpaidData.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPostpaidData.fulfilled, (state, action) => {
        state.isLoading = false
        state.postpaidData = action.payload
      })
      .addCase(fetchPostpaidData.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, resetAccountState } = accountSlice.actions
export default accountSlice.reducer
```

### Local State with Hooks

```typescript
// Component state
const [isLoading, setIsLoading] = useState(false)
const [data, setData] = useState<UserData | null>(null)
const [activeTab, setActiveTab] = useState<TabType>('all')

// Refs for mutable values
const scrollRef = useRef<ScrollView>(null)
const timeoutRef = useRef<NodeJS.Timeout>()

// Memoized values
const filteredNotifications = useMemo(() => {
  return notifications.filter(n => n.type === activeTab)
}, [notifications, activeTab])

// Memoized callbacks
const handlePress = useCallback(() => {
  console.log('🔄 [Component] Button pressed')
}, [])
```

---

## 9. Styling Approaches

### StyleSheet Pattern

Always use `StyleSheet.create()` at the bottom of component files:

```typescript
const ComponentName: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello</Text>
    </View>
  )
}

// Styles at bottom
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.background.primary,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
})

export default ComponentName
```

### Theme System Usage

**Always use theme tokens** instead of hardcoded values:

```typescript
// ✅ CORRECT - Use theme tokens
import { colors, spacing, typography, dimensions } from '@/shared/themes'

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,              // Use spacing tokens
    backgroundColor: colors.background.primary,  // Use color tokens
  },
  title: {
    ...typography.h2,                 // Spread typography styles
    fontSize: dimensions.fontSize.xl, // Use dimension tokens
  },
})

// ❌ INCORRECT - Hardcoded values
const styles = StyleSheet.create({
  container: {
    padding: 16,                      // Don't hardcode spacing
    backgroundColor: '#FFFFFF',       // Don't hardcode colors
  },
  title: {
    fontSize: 24,                     // Don't hardcode font sizes
    fontWeight: '700',
  },
})
```

### Dynamic Styling

```typescript
// Conditional styles with array syntax
<View style={[styles.container, isActive && styles.activeContainer]} />

// Dynamic styles with insets
const insets = useSafeAreaInsets()
<View style={[styles.container, { paddingTop: insets.top }]} />

// Style composition
<Text style={[styles.baseText, styles.boldText, customStyle]} />
```

---

## 10. Error Handling

### Try-Catch with Logging

```typescript
// ✅ CORRECT - Comprehensive error handling
try {
  const response = await accountService.getMyPostpaid()

  if (!response.success) {
    console.error('❌ [AccountScreen] API returned error:', response.message)
    return rejectWithValue(response.message || 'Failed to fetch postpaid data')
  }

  console.log('✅ [AccountScreen] Postpaid data fetched successfully')
  return response.data
} catch (error: any) {
  console.error('❌ [AccountScreen] Failed to fetch postpaid data:', error)
  return rejectWithValue(error.message || 'An unexpected error occurred')
}
```

### User-Facing Error Messages

```typescript
import { Alert } from 'react-native'

// Show user-friendly error messages
const handleLogin = async () => {
  try {
    await login(username, password)
  } catch (error: any) {
    Alert.alert(
      t('errors.loginFailed'),
      error.message || t('errors.unexpectedError'),
      [{ text: 'OK', style: 'default' }],
    )
  }
}
```

### Defensive Programming

```typescript
// ✅ Use optional chaining and nullish coalescing
const userName = user?.profile?.name ?? 'Guest'
const totalAmount = data?.amount || 0

// ✅ Early returns for error states
if (!userId) {
  console.warn('⚠️ [Component] User ID is missing')
  return null
}

// ✅ Fallback values
const notifications = data?.notifications ?? []
const count = items?.length || 0
```

### API Error Handling (axios)

```typescript
private handleError(error: any): ApiError {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.',
      status: error.response.status,
      errors: error.response.data?.errors,
    }
  } else if (error.request) {
    // Request made but no response
    return {
      message: 'Đã xảy ra lỗi kết nối. Vui lòng kiểm tra kết nối mạng của bạn và thử lại.',
    }
  } else {
    // Something else happened
    return {
      message: error.message || 'Đã xảy ra lỗi không mong muốn.',
    }
  }
}
```

---

## Quick Reference Checklist

Before submitting code, verify:

- [ ] **Formatting**: Single quotes, no semicolons, trailing commas, 2-space indentation
- [ ] **Imports**: Ordered correctly (React → third-party → shared → feature-specific)
- [ ] **Component Structure**: Props interface → Component → Hooks → Effects → Handlers → Render → Styles
- [ ] **Naming**: camelCase for functions, PascalCase for components, `handle*` for event handlers
- [ ] **Types**: Use `type` keyword for type-only imports
- [ ] **Comments**: Emoji prefixes for console logs (`🔄`, `✅`, `❌`)
- [ ] **Styling**: Use theme tokens instead of hardcoded values
- [ ] **Error Handling**: Try-catch blocks with detailed logging
- [ ] **Path Aliases**: Use `@/` for shared resources, relative paths for feature-internal imports
- [ ] **Exports**: Default export at the bottom

---

## ESLint & Prettier Configuration

The project uses:
- **ESLint**: `@react-native` config
- **Prettier**: Custom config (see [.prettierrc.js](.prettierrc.js))
- **TypeScript**: `@react-native/typescript-config`

Always run linting and formatting before committing:

```bash
npm run lint
npm run format
```

---

**Last Updated**: 2025-12-11
**Project**: ENSOGO-ESPay-App
**Version**: 1.0
