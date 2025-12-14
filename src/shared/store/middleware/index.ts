import { Middleware } from '@reduxjs/toolkit';
import { logger } from './logger';

// Array of middleware to be used in the store
export const middleware = [
  // Add logger middleware only in development
  ...(__DEV__ ? [logger] : []),
];

// Development-only middleware for enhanced debugging
export const devMiddleware: Middleware[] = [
  logger,
];

// Production middleware (can add performance monitoring, etc.)
export const prodMiddleware: Middleware[] = [
  // Add production-specific middleware here
];