import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BankType } from '../types/bank';
import { STORAGE_KEYS } from '@/shared/config/env';

const BANK_TYPE_KEY = STORAGE_KEYS.USER_PREFERENCES + ':bank_type';

export const getPersistedBankType = async (): Promise<BankType | undefined> => {
  try {
    const value = await AsyncStorage.getItem(BANK_TYPE_KEY);
    return value ? (value as BankType) : undefined;
  } catch (error) {
    console.error('Error getting persisted bank type:', error);
    return undefined;
  }
};

export const setPersistedBankType = async (bankType: BankType): Promise<void> => {
  try {
    await AsyncStorage.setItem(BANK_TYPE_KEY, bankType);
  } catch (error) {
    console.error('Error setting persisted bank type:', error);
  }
};

export const clearPersistedBankType = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(BANK_TYPE_KEY);
  } catch (error) {
    console.error('Error clearing persisted bank type:', error);
  }
};
