import { EspayStatus } from '@/shared/types';

export const getEspayStatusText = (status: EspayStatus, t: (key: string) => string): string => {
  switch (status) {
    case 'ACTIVE':
      return t('espay.active');
    case 'PENDING':
      return t('espay.pending');
    case 'INACTIVE':
      return t('espay.inactive');
    case 'LOCKED':
      return t('espay.locked');
    default:
      return t('espay.inactive');
  }
};
