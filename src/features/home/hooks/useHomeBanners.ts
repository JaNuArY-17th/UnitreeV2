import { useState, useEffect } from 'react';
import { useHomeData } from './useHomeData';

export const useHomeBanners = (data: ReturnType<typeof useHomeData>) => {
  const {
    userData,
    verificationStatus,
    storeStatus,
    hasStore,
    isStoreDataLoading,
  } = data;

  const [showVerificationBanner, setShowVerificationBanner] = useState(false);
  const [showCreateStoreBanner, setShowCreateStoreBanner] = useState(false);
  const [showStoreLockedBanner, setShowStoreLockedBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const userAccountType = userData?.account_type || (userData?.is_shop ? 'STORE' : 'USER');

  useEffect(() => {
    if ((verificationStatus === 'NOT_VERIFIED' || verificationStatus === 'CARD_VERIFIED') && !dismissed) {
      setShowVerificationBanner(true);
    } else {
      setShowVerificationBanner(false);
    }
  }, [verificationStatus, dismissed]);

  useEffect(() => {
    if (userAccountType === 'STORE' && hasStore === false && !isStoreDataLoading && !dismissed) {
      setShowCreateStoreBanner(true);
    } else {
      setShowCreateStoreBanner(false);
    }
  }, [userAccountType, hasStore, isStoreDataLoading, dismissed]);

  useEffect(() => {
    if (storeStatus === 'LOCKED' && !dismissed) {
      setShowStoreLockedBanner(true);
    } else {
      setShowStoreLockedBanner(false);
    }
  }, [storeStatus, dismissed]);

  return {
    showVerificationBanner,
    showCreateStoreBanner,
    showStoreLockedBanner,
    setDismissed,
    userAccountType,
  };
};
