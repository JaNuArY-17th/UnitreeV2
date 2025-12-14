
import type { BankType } from '../types/bank';
import { getPersistedBankType, setPersistedBankType, clearPersistedBankType } from './bankTypeStorage';

/**
 * Manager for handling bank type across the banking services
 * Provides a centralized way to manage account type for all bank operations
 */

class BankTypeManager {
  private static instance: BankTypeManager;
  private currentBankType: BankType | undefined = undefined;
  private isLoaded = false;

  private constructor() {}

  static getInstance(): BankTypeManager {
    if (!BankTypeManager.instance) {
      BankTypeManager.instance = new BankTypeManager();
    }
    return BankTypeManager.instance;
  }

  /**
   * Set the current bank type and persist to AsyncStorage
   */
  async setBankType(bankType: BankType): Promise<void> {
    this.currentBankType = bankType;
    this.isLoaded = true;
    await setPersistedBankType(bankType);
  }

  /**
   * Get the current bank type, fallback to AsyncStorage if not loaded
   */
  async getBankType(): Promise<BankType | undefined> {
    // console.log('BankTypeManager.getBankType called');
    if (this.currentBankType !== undefined) {
      // console.log('BankTypeManager - returning cached:', this.currentBankType);
      return this.currentBankType;
    }
    if (!this.isLoaded) {
      // console.log('BankTypeManager - loading from storage');
      const persisted = await getPersistedBankType();
      // console.log('BankTypeManager - persisted value:', persisted);
      if (persisted) {
        this.currentBankType = persisted;
        this.isLoaded = true;
        return persisted;
      }
    }
    // console.log('BankTypeManager - returning undefined');
    return undefined;
  }

  /**
   * Synchronous getter (may be undefined if not loaded)
   */
  getBankTypeSync(): BankType | undefined {
    return this.currentBankType;
  }

  /**
   * Check if bank type is set (sync)
   */
  hasBankType(): boolean {
    return this.currentBankType !== undefined;
  }

  /**
   * Clear bank type from memory and storage
   */
  async clearBankType(): Promise<void> {
    this.currentBankType = undefined;
    this.isLoaded = false;
    await clearPersistedBankType();
  }
}

export const bankTypeManager = BankTypeManager.getInstance();
