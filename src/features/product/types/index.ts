/**
 * Product & Category Types Barrel Export
 */

// Common Types (export first to avoid conflicts)
export * from './common';

// Product Types
export * from './product';

// Category Types
export * from './category';

// Variation Types
export * from './variation';

// Instance Types
export * from './instance';

// Supplier Types
export * from './supplier';

// Location Types
export * from './location';

// Re-export legacy types for backward compatibility
export type { LegacyProduct as Product } from './product';
