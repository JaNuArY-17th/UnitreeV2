# eKYC API Separation Guide

This document explains how the eKYC API calls have been separated into dedicated services and hooks, following the authentication module pattern.

## Overview

The eKYC functionality has been refactored to separate API concerns:

- **`ekycApiService.ts`**: Handles API calls (get token, save eKYC data)
- **`useEkycApi.ts`**: React hooks for API operations with React Query integration
- **`ekycService.ts`**: Continues to handle SDK integration and native module calls

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Components    │───▶│   useEkycApi    │───▶│ ekycApiService  │
│                 │    │     Hooks       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │  React Query    │    │   API Client    │
                       │     Cache       │    │   (Axios)       │
                       └─────────────────┘    └─────────────────┘
```

## Usage Examples

### 1. Getting eKYC Token

```typescript
import { useEkycToken } from '@/features/ekyc/hooks/useEkycApi';

function MyComponent() {
  const { 
    token, 
    isLoading, 
    error, 
    getToken 
  } = useEkycToken();

  const handleGetToken = async () => {
    try {
      const freshToken = await getToken();
      console.log('Token:', freshToken);
    } catch (error) {
      console.error('Failed to get token:', error);
    }
  };

  return (
    <div>
      {isLoading && <p>Loading token...</p>}
      {error && <p>Error: {error.message}</p>}
      <button onClick={handleGetToken}>Get Token</button>
    </div>
  );
}
```

### 2. Saving eKYC Information

```typescript
import { useEkycSave } from '@/features/ekyc/hooks/useEkycApi';
import type { SaveEkycInfoRequest } from '@/features/ekyc/services/ekycApiService';

function SaveEkycComponent() {
  const { 
    saveEkycInfo, 
    isLoading, 
    error, 
    isSuccess 
  } = useEkycSave();

  const handleSave = async () => {
    const data: SaveEkycInfoRequest = {
      full_name: "Nguyễn Văn A",
      gender: true, // true for male
      date_of_birth: "1990-01-01",
      nationality: "Vietnam",
      date_of_issue: "2020-01-01",
      date_of_expiry: "2030-01-01",
      identification_number: "123456789",
      permanent_address: "123 Main St",
      contact_address: "123 Main St",
      
      // Card verification
      front_card_is_authentic: true,
      front_card_liveness_score: 0.95,
      front_card_face_swapping_score: 0.1,
      back_card_is_authentic: true,
      back_card_liveness_score: 0.93,
      back_card_face_swapping_score: 0.05,
      
      // Face verification
      face_is_live: true,
      face_liveness_score: 0.98,
      face_liveness_message: "Face verification successful",
      face_age: 30,
      face_gender: true,
      face_blur_score: 0.1,
      face_eyes_open: true,
      face_is_masked: false,
      
      // Metadata
      verification_timestamp: new Date().toISOString(),
      challenge_code: "ABC123",
      server_version: "1.0.0",
      verification_status: "VERIFIED",
      
      // File IDs
      front_file_id: "file_123",
      back_file_id: "file_456",
      near_face_file_id: "file_789",
      far_face_file_id: "file_101"
    };

    try {
      const result = await saveEkycInfo(data);
      console.log('Save successful:', result);
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  return (
    <div>
      {isLoading && <p>Saving...</p>}
      {error && <p>Error: {error.message}</p>}
      {isSuccess && <p>Saved successfully!</p>}
      <button onClick={handleSave} disabled={isLoading}>
        Save eKYC Info
      </button>
    </div>
  );
}
```

### 3. Combined API Operations

```typescript
import { useEkycApi } from '@/features/ekyc/hooks/useEkycApi';

function CombinedEkycComponent() {
  const { 
    getToken, 
    saveWithToken, 
    isLoading, 
    tokenError, 
    saveError 
  } = useEkycApi();

  const handleCompleteFlow = async () => {
    try {
      // This automatically gets token if needed, then saves
      const result = await saveWithToken(ekycData);
      console.log('Complete flow successful:', result);
    } catch (error) {
      console.error('Flow failed:', error);
    }
  };

  return (
    <div>
      {isLoading && <p>Processing...</p>}
      {(tokenError || saveError) && (
        <p>Error: {tokenError?.message || saveError?.message}</p>
      )}
      <button onClick={handleCompleteFlow} disabled={isLoading}>
        Complete eKYC Flow
      </button>
    </div>
  );
}
```

### 4. Direct Service Usage (Advanced)

```typescript
import { ekycApiService } from '@/features/ekyc/services/ekycApiService';

// Direct service usage without hooks
async function directApiCall() {
  try {
    // Get token
    const token = await ekycApiService.getEkycToken();
    
    // Save data
    const result = await ekycApiService.saveEkycInfo(data);
    
    return result;
  } catch (error) {
    console.error('Direct API call failed:', error);
    throw error;
  }
}
```

## Migration Guide

### From Old Pattern

```typescript
// OLD - Direct import and usage
import { saveEkycInfo } from '@/features/ekyc/services/ekycService';

const result = await saveEkycInfo(data);
```

### To New Pattern

```typescript
// NEW - Using hooks
import { useEkycSave } from '@/features/ekyc/hooks/useEkycApi';

const { saveEkycInfo } = useEkycSave();
const result = await saveEkycInfo(data);

// OR - Direct service usage
import { ekycApiService } from '@/features/ekyc/services/ekycApiService';

const result = await ekycApiService.saveEkycInfo(data);
```

## Benefits

1. **Separation of Concerns**: API calls are separated from SDK operations
2. **React Query Integration**: Automatic caching, retry logic, and state management
3. **Type Safety**: Full TypeScript support with proper interfaces
4. **Error Handling**: Consistent error handling across all API operations
5. **Reusability**: Hooks can be used across multiple components
6. **Testing**: Easier to mock and test individual API operations

## Query Keys

The hooks use consistent query keys for React Query:

```typescript
export const ekycApiQueryKeys = {
  all: ['ekycApi'] as const,
  token: () => [...ekycApiQueryKeys.all, 'token'] as const,
  saveInfo: () => [...ekycApiQueryKeys.all, 'saveInfo'] as const,
} as const;
```

This allows for easy cache invalidation and management across the application.
