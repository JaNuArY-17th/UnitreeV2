import { useCallback, useRef, useState } from 'react';
import { notificationService } from '../services';

/**
 * Hook to mark a notification as read (with optimistic UI support).
 * Keeps track of in-flight requests per-notification id.
 */
export interface UseMarkNotificationReadOptions {
  /** Run before the network call (ideal for optimistic local state update) */
  optimistic?: () => void;
  /** Run after success */
  onSuccess?: () => void;
  /** Run on error (after rollback if you applied one manually) */
  onError?: (error: any) => void;
}

export interface UseMarkNotificationReadResult {
  /** Trigger read action for one notification id */
  markAsRead: (id: string, opts?: UseMarkNotificationReadOptions) => Promise<void>;
  /** All ids currently being marked as read */
  loadingIds: string[];
  /** Convenience checker */
  isLoading: (id: string) => boolean;
  /** Last error message (if any) */
  error?: string;
  /** Clears stored error */
  resetError: () => void;
}

export const useMarkNotificationRead = (): UseMarkNotificationReadResult => {
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const [error, setError] = useState<string | undefined>();
  // Using ref to avoid stale closure when removing ids inside finally
  const loadingRef = useRef<Set<string>>(new Set());

  const setIdLoading = useCallback((id: string, loading: boolean) => {
    const set = loadingRef.current;
    if (loading) set.add(id); else set.delete(id);
    setLoadingIds(Array.from(set));
  }, []);

  const markAsRead = useCallback(async (id: string, opts?: UseMarkNotificationReadOptions) => {
    if (!id) return;
    if (loadingRef.current.has(id)) return; // prevent duplicate in-flight
    setError(undefined);
    setIdLoading(id, true);
    opts?.optimistic?.();
    try {
  await notificationService.markNotificationAsRead(id);
      opts?.onSuccess?.();
    } catch (e: any) {
      setError(e?.message || 'Failed to mark notification as read');
      opts?.onError?.(e);
    } finally {
      setIdLoading(id, false);
    }
  }, [setIdLoading]);

  const isLoading = useCallback((id: string) => loadingRef.current.has(id), []);
  const resetError = useCallback(() => setError(undefined), []);

  return { markAsRead, loadingIds, isLoading, error, resetError };
};

export default useMarkNotificationRead;
