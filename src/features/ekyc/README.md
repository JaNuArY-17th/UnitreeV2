# eKYC Feature

Electronic Know Your Customer (eKYC) feature for identity verification using document scanning and facial recognition.

## 📋 Overview

The eKYC feature provides comprehensive identity verification capabilities including:
- Document OCR (ID card, passport scanning)
- Facial liveness detection
- Face matching with document photo
- Complete identity verification workflow

## 🏗️ Architecture

This feature follows a clean architecture pattern with clear separation of concerns:

```
src/features/ekyc/
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── screens/            # Screen components
├── services/           # Business logic & API calls
├── store/              # Redux state management
├── types/              # TypeScript definitions
├── utils/              # Utility functions
└── locales/            # Internationalization
```

## 🧩 Components

### Core Components
- **DocumentCapture**: Main capture interface with instructions
- **VerificationSteps**: Progress tracking during verification
- **ResultDisplay**: Shows extracted information and verification status
- **EkycErrorBoundary**: Error handling and recovery

### Usage Example
```tsx
import { DocumentCapture, VerificationSteps } from '@/features/ekyc';

function MyScreen() {
  const { handleCapture, isProcessing, error } = useEkycCapture();
  
  return (
    <DocumentCapture
      onCapture={handleCapture}
      isProcessing={isProcessing}
      error={error}
    />
  );
}
```

## 🪝 Hooks

### Main Hooks
- **useEkyc**: Main hook for eKYC operations
- **useEkycCapture**: Form handling and capture flow
- **useEkycValidation**: Data validation utilities
- **useEkycScreen**: Screen-specific business logic

### Hook Examples
```tsx
// Main eKYC hook
const {
  currentStep,
  isProcessing,
  results,
  error,
  startCapture,
  retryCapture,
  resetEkyc,
} = useEkyc();

// Capture flow hook
const {
  handleCapture,
  isProcessing,
  canRetry,
  error,
} = useEkycCapture();

// Validation hook
const {
  validateOcrData,
  isValidResult,
  currentValidation,
} = useEkycValidation();
```

## 🏪 State Management

Uses Redux Toolkit for state management with the following structure:

```typescript
interface EkycState {
  currentStep: EkycStep;
  isProcessing: boolean;
  isInitialized: boolean;
  results: ParsedEkycResult | null;
  error: string | null;
  retryCount: number;
  sessionId: string | null;
  startTime: number | null;
  endTime: number | null;
}
```

### Actions
- `initializeEkycAsync`: Initialize eKYC SDK
- `startEkycCaptureAsync`: Start capture process
- `retryEkycCaptureAsync`: Retry failed capture
- `resetEkyc`: Reset state
- `clearError`: Clear error state

### Selectors
```tsx
import { 
  selectCurrentStep,
  selectIsProcessing,
  selectEkycResults,
  selectEkycSummary,
} from '@/features/ekyc';
```

## 🔧 Services

### EkycService
Singleton service handling SDK integration:

```typescript
import { ekycService } from '@/features/ekyc';

// Check availability
const isAvailable = ekycService.isAvailable();

// Start different types of verification
const ocrResult = await ekycService.startEkycOcr();
const fullResult = await ekycService.startEkycFull();
const faceResult = await ekycService.startEkycFace();

// Validate results
const isValid = ekycService.validateEkycResult(result);
const faceMatch = ekycService.validateFaceMatchResult(result);
```

## 📱 Screens

### EkycCaptureScreen
Main screen for eKYC capture process. Heavily refactored to use hooks and components:

```tsx
export function EkycCaptureScreen() {
  const {
    isProcessing,
    error,
    handleStartEkyc,
    canRetry,
  } = useEkycScreen();

  return (
    <EkycErrorBoundary>
      <DocumentCapture
        onCapture={handleStartEkyc}
        isProcessing={isProcessing}
        error={error}
        canRetry={canRetry}
      />
    </EkycErrorBoundary>
  );
}
```

## 🔍 Types

### Core Types
```typescript
// Main result type
interface ParsedEkycResult {
  ocrData?: EkycOcrData;
  ocrErrors?: string[];
  faceLiveness?: EkycLivenessData;
  compareResult?: EkycCompareData;
  verifyResult?: EkycVerifyData;
  imagePaths?: ImagePaths;
}

// Verification steps
enum EkycStep {
  IDLE = 'idle',
  INITIALIZING = 'initializing',
  CAPTURING = 'capturing',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error',
}

// Verification types
enum EkycType {
  OCR = 'ocr',
  FACE = 'face',
  FULL = 'full',
}
```

## 🛠️ Utilities

### Validation
```typescript
import { 
  validateOcrData,
  validateEkycResult,
  validateIdNumber,
  validateFullName,
} from '@/features/ekyc';

// Validate extracted data
const errors = validateOcrData(ocrData);
const isValid = validateEkycResult(result);

// Validate individual fields
const idValidation = validateIdNumber('123456789');
const nameValidation = validateFullName('Nguyễn Văn A');
```

### Constants
```typescript
import { 
  EKYC_CONSTANTS,
  EKYC_ERROR_CODES,
  EKYC_MESSAGES,
} from '@/features/ekyc';

// Use predefined constants
const threshold = EKYC_CONSTANTS.FACE_MATCH_THRESHOLD;
const timeout = EKYC_CONSTANTS.EKYC_TIMEOUT;
```

## 🧪 Testing

### Running Tests
```bash
# Run all eKYC tests
npm test src/features/ekyc

# Run specific test files
npm test ekycService.test.ts
npm test useEkyc.test.ts
npm test validation.test.ts
```

### Test Coverage
- **Services**: SDK integration, error handling, validation
- **Hooks**: State management, form handling, validation
- **Utils**: Validation functions, constants
- **Store**: Redux actions, reducers, selectors

### Example Test
```typescript
import { renderHook } from '@testing-library/react-native';
import { useEkyc } from '../useEkyc';

test('should initialize eKYC successfully', async () => {
  const { result } = renderHook(() => useEkyc(), { wrapper });
  
  await act(async () => {
    await result.current.initializeEkyc();
  });
  
  expect(result.current.isInitialized).toBe(true);
});
```

## 🚀 Usage

### Basic Integration
```tsx
import { 
  EkycCaptureScreen,
  useEkyc,
  DocumentCapture,
} from '@/features/ekyc';

// Use in navigation
<Stack.Screen 
  name="EkycCapture" 
  component={EkycCaptureScreen} 
/>

// Use hooks in custom components
function CustomEkycComponent() {
  const { startCapture, isProcessing, results } = useEkyc();
  
  return (
    <DocumentCapture
      onCapture={() => startCapture('full')}
      isProcessing={isProcessing}
    />
  );
}
```

### Error Handling
```tsx
import { EkycErrorBoundary } from '@/features/ekyc';

function App() {
  return (
    <EkycErrorBoundary
      onError={(error) => console.error('eKYC Error:', error)}
      onRetry={() => console.log('Retrying...')}
    >
      <YourEkycComponents />
    </EkycErrorBoundary>
  );
}
```

## 📝 Migration Notes

This feature has been completely refactored from the original implementation:

### Before Refactor
- 619 lines of mixed UI and business logic
- Complex useEffect chains
- Difficult to test and maintain
- No reusable components

### After Refactor
- 189 lines of clean UI code (70% reduction)
- Business logic in custom hooks
- Reusable components
- Comprehensive test coverage
- Type-safe implementation

## 🔧 Configuration

### Constants
Key configuration values in `utils/constants.ts`:
- `FACE_MATCH_THRESHOLD`: 90% (minimum face similarity)
- `EKYC_TIMEOUT`: 120000ms (2 minutes)
- `MAX_RETRY_COUNT`: 3 attempts

### Environment
Ensure eKYC SDK is properly configured for your platform:
- iOS: SDK integrated via native modules
- Android: EkycBridge native module required

## 📚 API Reference

See individual files for detailed API documentation:
- [Types](./types/README.md)
- [Hooks](./hooks/README.md)
- [Components](./components/README.md)
- [Services](./services/README.md)
- [Utils](./utils/README.md)
