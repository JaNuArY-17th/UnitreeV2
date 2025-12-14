import { useState, useEffect, useCallback } from 'react';

/**
 * Hook quản lý thời gian còn lại
 * @param initialSeconds Số giây ban đầu
 * @param onTimeExpired Callback khi hết thời gian
 * @returns Đối tượng chứa thời gian còn lại và các hàm xử lý
 */
export const useTimeLeft = (initialSeconds: number = 1800, onTimeExpired?: () => void) => {
  const [timeLeft, setTimeLeft] = useState<number>(initialSeconds);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  // Xử lý khi hết thời gian
  const handleExpired = useCallback(() => {
    setIsExpired(true);
    setIsActive(false);
    if (onTimeExpired) {
      onTimeExpired();
    }
  }, [onTimeExpired]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          const newTime = prevTime - 1;
          if (newTime <= 0) {
            clearInterval(interval);
            handleExpired();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0 && !isExpired) {
      handleExpired();
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, timeLeft, isExpired, handleExpired]);

  // Dừng đếm ngược
  const pauseTimer = () => {
    setIsActive(false);
  };

  // Tiếp tục đếm ngược
  const resumeTimer = () => {
    setIsActive(true);
  };

  // Reset đếm ngược
  const resetTimer = (seconds: number = initialSeconds) => {
    setTimeLeft(seconds);
    setIsActive(true);
    setIsExpired(false);
  };

  // Đăng ký callback khi hết thời gian
  const onExpire = (callback: () => void) => {
    onTimeExpired = callback;
  };

  // Format thời gian
  const formatTimeLeft = (): string => {
    const minutes = Math.floor(timeLeft / 60);
    const remainingSeconds = timeLeft % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return {
    timeLeft,
    isActive,
    isExpired,
    formatTimeLeft,
    pauseTimer,
    resumeTimer,
    resetTimer,
    onExpire,
  };
};
