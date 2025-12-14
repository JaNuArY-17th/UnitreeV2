import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { TransferService } from '../services/TransferService';
import type { SearchAccountResponse } from '../types/transfer';

export const useSearchAccount = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [accountInfo, setAccountInfo] = useState<SearchAccountResponse['data'] | null>(null);

  const searchAccountMutation = useMutation({
    mutationFn: (accountNumber: string) => TransferService.searchAccountByNumber(accountNumber),
    onMutate: () => {
      setIsSearching(true);
      setSearchError(null);
      setAccountInfo(null);
    },
    onSuccess: (response) => {
      setIsSearching(false);
      if (response.success && response.data) {
        setAccountInfo(response.data);
        setSearchError(null);
      } else {
        setSearchError(response.message || 'Account not found');
        setAccountInfo(null);
      }
    },
    onError: (error: any) => {
      setIsSearching(false);
      setSearchError(error.message || 'Failed to search account');
      setAccountInfo(null);
    },
  });

  const searchAccount = (accountNumber: string) => {
    searchAccountMutation.mutate(accountNumber);
  };

  const clearSearch = () => {
    setAccountInfo(null);
    setSearchError(null);
    setIsSearching(false);
  };

  return {
    searchAccount,
    isSearching,
    searchError,
    accountInfo,
    clearSearch,
  };
};

export const useTransferService = () => {
  const searchAccount = useSearchAccount();

  return {
    searchAccount,
  };
};
