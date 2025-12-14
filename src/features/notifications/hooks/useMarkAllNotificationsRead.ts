import { useCallback, useState } from 'react';
import { notificationService } from '../services';

interface UseMarkAllNotificationsReadOptions {
  optimistic?: () => void; // run before network (e.g., local state update)
  onSuccess?: () => void;  // run after success
  onError?: (e: any) => void; // run on error
  appId?: number; // override app id if needed
}

interface UseMarkAllNotificationsReadResult {
  markAllRead: (opts?: UseMarkAllNotificationsReadOptions) => Promise<void>;
  loading: boolean;
  error?: string;
  resetError: () => void;
}

export const useMarkAllNotificationsRead = (): UseMarkAllNotificationsReadResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const markAllRead = useCallback(async (opts?: UseMarkAllNotificationsReadOptions) => {
    if (loading) return;
    setError(undefined);
    opts?.optimistic?.();
    setLoading(true);
    try {
      await notificationService.markAllNotificationsAsRead();
      opts?.onSuccess?.();
    } catch (e: any) {
      setError(e?.message || 'Failed to mark all notifications as read');
      opts?.onError?.(e);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const resetError = useCallback(() => setError(undefined), []);

  return { markAllRead, loading, error, resetError };
};

export default useMarkAllNotificationsRead;
