import i18n from 'i18next';

/**
 * Formats a timestamp to show relative time (e.g., "4 minutes ago", "2 hours ago")
 * @param timestamp - ISO string or Date object
 * @returns Formatted relative time string
 */
export const formatTimeAgo = (timestamp: string | Date): string => {
  const now = new Date();
  const time = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;

  // Calculate difference in milliseconds
  const diffMs = now.getTime() - time.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  // Handle future dates
  if (diffMs < 0) {
    return i18n.t('common:timeAgo.justNow');
  }

  // Less than a minute
  if (diffSeconds < 60) {
    return i18n.t('common:timeAgo.justNow');
  }

  // Less than an hour
  if (diffMinutes < 60) {
    return i18n.t('common:timeAgo.minutesAgo', { count: diffMinutes });
  }

  // Less than a day
  if (diffHours < 24) {
    return i18n.t('common:timeAgo.hoursAgo', { count: diffHours });
  }

  // Less than 2 days - show relative days
  if (diffDays <= 2) {
    return i18n.t('common:timeAgo.daysAgo', { count: diffDays });
  }

  // More than 2 days - show date format
  const currentLang = i18n.language;
  const day = time.getDate();
  const month = time.getMonth() + 1;
  const dayOfWeek = time.getDay();

  if (currentLang === 'vi') {
    // Vietnamese day names: Chủ nhật, Thứ 2, Thứ 3, etc.
    const viDays = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return `${viDays[dayOfWeek]} ${day}/${month}`;
  } else {
    // English day names: Sun, Mon, Tue, etc.
    const enDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `${enDays[dayOfWeek]} ${month}/${day}`;
  }
};
