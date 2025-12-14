import { useQuery } from '@tanstack/react-query';
import { RecipientService } from '../services/RecipientService';
import type { GetRecentRecipientsParams } from '../types/transfer';

export const useRecentRecipients = (params: GetRecentRecipientsParams = {}) => {
    return useQuery({
        queryKey: ['recentRecipients', params],
        queryFn: () => RecipientService.getRecentRecipients(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    });
};