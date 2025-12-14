import RNFS from 'react-native-fs';

/**
 * Invoice Caching Utility
 * Manages cached invoice PDFs to avoid redundant downloads
 */
export class InvoiceCacheManager {
  private static instance: InvoiceCacheManager;
  private cacheDir = `${RNFS.DocumentDirectoryPath}/invoices`;

  private constructor() {}

  static getInstance(): InvoiceCacheManager {
    if (!InvoiceCacheManager.instance) {
      InvoiceCacheManager.instance = new InvoiceCacheManager();
    }
    return InvoiceCacheManager.instance;
  }

  /**
   * Initialize cache directory if it doesn't exist
   */
  async initializeCache(): Promise<void> {
    try {
      const exists = await RNFS.exists(this.cacheDir);
      if (!exists) {
        await RNFS.mkdir(this.cacheDir, { NSURLIsExcludedFromBackupKey: true });
        console.log('[InvoiceCacheManager] Cache directory created');
      }
    } catch (error) {
      console.error('[InvoiceCacheManager] Error initializing cache:', error);
    }
  }

  /**
   * Get cache file path for an order
   * @param orderId - Order ID
   * @returns File path for cached invoice
   */
  getCacheFilePath(orderId: string): string {
    return `${this.cacheDir}/invoice_${orderId}.pdf`;
  }

  /**
   * Check if invoice is cached
   * @param orderId - Order ID
   * @returns Promise<boolean> - True if cached file exists
   */
  async isCached(orderId: string): Promise<boolean> {
    try {
      const filePath = this.getCacheFilePath(orderId);
      const exists = await RNFS.exists(filePath);
      console.log(`[InvoiceCacheManager] Cache check for order ${orderId}:`, exists);
      return exists;
    } catch (error) {
      console.error('[InvoiceCacheManager] Error checking cache:', error);
      return false;
    }
  }

  /**
   * Get cached invoice file path if it exists
   * @param orderId - Order ID
   * @returns Promise<string | null> - File path or null if not cached
   */
  async getCachedFile(orderId: string): Promise<string | null> {
    try {
      const isCached = await this.isCached(orderId);
      if (isCached) {
        const filePath = this.getCacheFilePath(orderId);
        console.log('[InvoiceCacheManager] Returning cached file:', filePath);
        return filePath;
      }
      return null;
    } catch (error) {
      console.error('[InvoiceCacheManager] Error getting cached file:', error);
      return null;
    }
  }

  /**
   * Save invoice to cache
   * @param orderId - Order ID
   * @param base64Data - Base64 encoded PDF data
   * @returns Promise<string> - File path of saved cache
   */
  async saveCachedFile(orderId: string, base64Data: string): Promise<string> {
    try {
      await this.initializeCache();
      const filePath = this.getCacheFilePath(orderId);
      
      await RNFS.writeFile(filePath, base64Data, 'base64');
      console.log('[InvoiceCacheManager] Invoice cached successfully:', filePath);
      
      return filePath;
    } catch (error) {
      console.error('[InvoiceCacheManager] Error saving cache:', error);
      throw error;
    }
  }

  /**
   * Clear cache for specific order
   * @param orderId - Order ID
   */
  async clearCache(orderId: string): Promise<void> {
    try {
      const filePath = this.getCacheFilePath(orderId);
      const exists = await RNFS.exists(filePath);
      if (exists) {
        await RNFS.unlink(filePath);
        console.log('[InvoiceCacheManager] Cache cleared for order:', orderId);
      }
    } catch (error) {
      console.error('[InvoiceCacheManager] Error clearing cache:', error);
    }
  }

  /**
   * Clear all cached invoices
   */
  async clearAllCache(): Promise<void> {
    try {
      const exists = await RNFS.exists(this.cacheDir);
      if (exists) {
        await RNFS.unlink(this.cacheDir);
        console.log('[InvoiceCacheManager] All cache cleared');
      }
    } catch (error) {
      console.error('[InvoiceCacheManager] Error clearing all cache:', error);
    }
  }

  /**
   * Get cache size for a specific invoice
   * @param orderId - Order ID
   * @returns Promise<number> - File size in bytes
   */
  async getCacheFileSize(orderId: string): Promise<number> {
    try {
      const filePath = this.getCacheFilePath(orderId);
      const exists = await RNFS.exists(filePath);
      if (exists) {
        const fileInfo = await RNFS.stat(filePath);
        return fileInfo.size || 0;
      }
      return 0;
    } catch (error) {
      console.error('[InvoiceCacheManager] Error getting cache size:', error);
      return 0;
    }
  }

  /**
   * Get total cache size
   * @returns Promise<number> - Total size in bytes
   */
  async getTotalCacheSize(): Promise<number> {
    try {
      const exists = await RNFS.exists(this.cacheDir);
      if (!exists) return 0;

      const files = await RNFS.readDir(this.cacheDir);
      let totalSize = 0;
      
      for (const file of files) {
        totalSize += file.size || 0;
      }

      return totalSize;
    } catch (error) {
      console.error('[InvoiceCacheManager] Error getting total cache size:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const invoiceCacheManager = InvoiceCacheManager.getInstance();
