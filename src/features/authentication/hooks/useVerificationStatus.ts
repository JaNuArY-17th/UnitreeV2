import { useUserProfile } from './useUserProfile';

export type VerificationStatus = 'VERIFIED' | 'NOT_VERIFIED' | 'CARD_VERIFIED';

export function useVerificationStatus() {
  const { userData, isLoading, isError, error, refetch } = useUserProfile();

  const verificationStatus = userData?.verify_status as VerificationStatus | undefined;
  const isVerified = verificationStatus === 'VERIFIED';
  const isCardVerified = verificationStatus === 'CARD_VERIFIED';
  const isNotVerified = verificationStatus === 'NOT_VERIFIED';

  return {
    verificationStatus,
    isVerified,
    isCardVerified,
    isNotVerified,
    isLoading,
    refetch,
    error,
  };
}
