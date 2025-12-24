import { useEffect, useState, useCallback } from 'react';

interface UseSessionTimerOptions {
  initialSeconds?: number;
  targetSeconds?: number; // For progress calculation
  autoStart?: boolean;
}

interface SessionTimerState {
  elapsedSeconds: number;
  formattedTime: string; // HH:MM
  formattedSeconds: string; // SS
  progress: number; // 0-100
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export const useSessionTimer = ({
  initialSeconds = 0,
  targetSeconds = 3600, // Default 1 hour
  autoStart = true,
}: UseSessionTimerOptions = {}): SessionTimerState => {
  const [elapsedSeconds, setElapsedSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);

  // Format seconds to HH:MM
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  // Format seconds part (SS)
  const formatSeconds = (seconds: number): string => {
    const secs = seconds % 60;
    return `${String(secs).padStart(2, '0')}s`;
  };

  // Calculate progress percentage
  const calculateProgress = (elapsed: number): number => {
    const progress = (elapsed / targetSeconds) * 100;
    return Math.min(progress, 100); // Cap at 100%
  };

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setElapsedSeconds(initialSeconds);
    setIsRunning(autoStart);
  }, [initialSeconds, autoStart]);

  return {
    elapsedSeconds,
    formattedTime: formatTime(elapsedSeconds),
    formattedSeconds: formatSeconds(elapsedSeconds),
    progress: calculateProgress(elapsedSeconds),
    isRunning,
    start,
    stop,
    reset,
  };
};
