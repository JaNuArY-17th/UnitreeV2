import { apiClient } from '@/shared/utils/axios';
import { API_ENDPOINTS } from '@/shared/config';
import RNFS from 'react-native-fs';
import { Buffer } from 'buffer';
import { invoiceCacheManager } from '../utils/invoiceCache';
import type { TaxCodeResponse } from '../types/invoice';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { PermissionsAndroid, Platform } from 'react-native';
import Share from 'react-native-share';

/**
 * Invoice Service
 * Handles all invoice-related API calls
 */
export class InvoiceService {
  private static instance: InvoiceService;

  private constructor() {}

  static getInstance(): InvoiceService {
    if (!InvoiceService.instance) {
      InvoiceService.instance = new InvoiceService();
    }
    return InvoiceService.instance;
  }

  /**
   * Get tax code information
   * @param taxCode - Tax code to lookup (10 or 13 digit number)
   * @returns Tax code information
   */
  async getTaxCodeInfo(taxCode: string): Promise<TaxCodeResponse> {
    try {
      const response = await apiClient.get<any>(
        `${API_ENDPOINTS.INVOICE.TAX_CODE}/${taxCode}`
      );

      console.log('[InvoiceService] getTaxCodeInfo response:', {
        success: response.success,
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : 'no data',
        rawResponse: response,
      });

      // Return the response with proper type casting
      return {
        success: response.success || false,
        message: response.message || '',
        data: response.data || null,
        code: (response as any).code || 200,
      } as unknown as TaxCodeResponse;
    } catch (error: any) {
      console.error('[InvoiceService] Error getting tax code info:', error);
      throw {
        success: false,
        message: error.message || 'Failed to get tax code information',
        data: null,
        code: error.code || 400,
      };
    }
  }

  /**
   * Download invoice PDF by order ID with caching
   * @param orderId - Order ID
   * @returns Promise with file path where PDF is saved
   */
  async downloadInvoicePdf(orderId: string): Promise<string> {
    try {
      console.log('[InvoiceService] Downloading invoice PDF for order:', orderId);

      // Check if already cached
      const cachedFile = await invoiceCacheManager.getCachedFile(orderId);
      if (cachedFile) {
        console.log('[InvoiceService] Using cached invoice PDF:', cachedFile);
        return cachedFile;
      }

      // Get PDF data from API
      const response = await apiClient.get(
        `${API_ENDPOINTS.INVOICE.INVOICE_PDF}/${orderId}`,
        {
          responseType: 'arraybuffer',
          timeout: 30000, // 30 seconds for large files
        }
      );

      if (!response.data) {
        throw new Error('No data received from API');
      }

      // Convert to base64
      let base64Data: string;

      if (response.data instanceof ArrayBuffer) {
        base64Data = this.arrayBufferToBase64(response.data);
      } else if (typeof response.data === 'string') {
        // If already a string, check if it's base64
        base64Data = response.data.includes(',') 
          ? response.data.split(',')[1] 
          : response.data;
      } else {
        // For other types, convert to buffer
        const buffer = Buffer.from(JSON.stringify(response.data));
        base64Data = buffer.toString('base64');
      }

      // Save to cache
      const cachedPath = await invoiceCacheManager.saveCachedFile(orderId, base64Data);

      console.log('[InvoiceService] PDF saved successfully at:', cachedPath);
      return cachedPath;
    } catch (error: any) {
      console.error('[InvoiceService] Error downloading invoice PDF:', error);
      throw {
        success: false,
        message: error.message || 'Failed to download invoice PDF',
        code: error.code || 400,
      };
    }
  }

  /**
   * Get invoice PDF as base64 (for inline viewing)
   * @param orderId - Order ID
   * @returns Promise with base64 encoded PDF data
   */
  async getInvoicePdfBase64(orderId: string): Promise<string> {
    try {
      console.log('[InvoiceService] Getting invoice PDF as base64 for order:', orderId);

      const response = await apiClient.get(
        `${API_ENDPOINTS.INVOICE.INVOICE_PDF}/${orderId}`,
        {
          responseType: 'arraybuffer',
          timeout: 30000,
        }
      );

      if (!response.data) {
        throw new Error('No data received from API');
      }

      // Convert to base64
      let base64Data: string;

      if (response.data instanceof ArrayBuffer) {
        base64Data = this.arrayBufferToBase64(response.data);
      } else if (typeof response.data === 'string') {
        base64Data = response.data.includes(',')
          ? response.data.split(',')[1]
          : response.data;
      } else {
        const buffer = Buffer.from(JSON.stringify(response.data));
        base64Data = buffer.toString('base64');
      }

      console.log('[InvoiceService] PDF converted to base64 successfully');
      return base64Data;
    } catch (error: any) {
      console.error('[InvoiceService] Error getting invoice PDF as base64:', error);
      throw {
        success: false,
        message: error.message || 'Failed to get invoice PDF',
        code: error.code || 400,
      };
    }
  }

  /**
   * Share invoice PDF
   * @param orderId - Order ID
   * @returns Promise with file path
   */
  async shareInvoicePdf(orderId: string): Promise<string> {
    return this.downloadInvoicePdf(orderId);
  }

  /**
   * Save invoice PDF to gallery/library using Share API (like QR code)
   * @param orderId - Order ID
   * @returns Promise with share result
   */
  async saveInvoicePdfToGallery(orderId: string): Promise<any> {
    try {
      console.log('[InvoiceService] Sharing invoice PDF for order:', orderId);

      // First ensure we have the PDF downloaded/cached
      const pdfPath = await this.downloadInvoicePdf(orderId);

      // Use Share API to allow user to save to Files or share
      const shareOptions = {
        title: 'Lưu Hóa Đơn',
        message: 'Hóa đơn ENSOGO ESPay',
        url: `file://${pdfPath}`, // Share local file
        type: 'application/pdf',
        failOnCancel: false, // Don't throw error if user cancels
      };

      const result = await Share.open(shareOptions);
      console.log('[InvoiceService] PDF shared successfully:', result);
      return result;
    } catch (error: any) {
      console.error('[InvoiceService] Error sharing PDF:', error);
      // Don't throw error for user cancellation
      if ((error as Error).message === 'User did not share') {
        return { success: false, cancelled: true };
      }
      throw {
        success: false,
        message: error.message || 'Failed to share PDF',
        code: error.code || 400,
      };
    }
  }

  /**
   * Download order item images to Downloads folder
   * @param orderId - Order ID
   * @param imageUrls - Array of image URLs to download
   * @returns Promise with array of saved file paths
   */
  async downloadOrderImages(orderId: string, imageUrls: string[]): Promise<string[]> {
    try {
      console.log('[InvoiceService] Downloading order images for order:', orderId, 'URLs:', imageUrls);

      if (!imageUrls || imageUrls.length === 0) {
        throw new Error('No image URLs provided');
      }

      // Request storage permissions for Android
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to storage to save images',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          throw new Error('Storage permission denied');
        }
      }

      // Create downloads directory if it doesn't exist
      const downloadsDir = Platform.OS === 'android'
        ? RNFS.DownloadDirectoryPath
        : RNFS.DocumentDirectoryPath;

      // Ensure downloads directory exists
      const downloadsExists = await RNFS.exists(downloadsDir);
      if (!downloadsExists) {
        await RNFS.mkdir(downloadsDir);
      }

      // Create images/order subdirectory
      const imagesDir = `${downloadsDir}/OrderImages`;
      const imagesExists = await RNFS.exists(imagesDir);
      if (!imagesExists) {
        await RNFS.mkdir(imagesDir);
      }

      // Create order-specific subdirectory
      const orderDir = `${imagesDir}/${orderId}`;
      const orderExists = await RNFS.exists(orderDir);
      if (!orderExists) {
        await RNFS.mkdir(orderDir);
      }

      const savedPaths: string[] = [];

      // Download each image
      for (let i = 0; i < imageUrls.length; i++) {
        const imageUrl = imageUrls[i];
        try {
          // Generate filename
          const extension = this.getImageExtension(imageUrl);
          const fileName = `image_${i + 1}_${Date.now()}.${extension}`;
          const localPath = `${orderDir}/${fileName}`;

          // Download image
          const downloadResult = await RNFS.downloadFile({
            fromUrl: imageUrl,
            toFile: localPath,
            background: false,
          }).promise;

          if (downloadResult.statusCode === 200) {
            savedPaths.push(localPath);
            console.log(`[InvoiceService] Image ${i + 1} saved:`, localPath);
          } else {
            console.warn(`[InvoiceService] Failed to download image ${i + 1}, status:`, downloadResult.statusCode);
          }
        } catch (error) {
          console.error(`[InvoiceService] Error downloading image ${i + 1}:`, error);
        }
      }

      if (savedPaths.length === 0) {
        throw new Error('Failed to download any images');
      }

      console.log('[InvoiceService] Images saved successfully:', savedPaths);
      return savedPaths;
    } catch (error: any) {
      console.error('[InvoiceService] Error downloading order images:', error);
      throw {
        success: false,
        message: error.message || 'Failed to download order images',
        code: error.code || 400,
      };
    }
  }

  /**
   * Helper: Get image extension from URL
   */
  private getImageExtension(url: string): string {
    const urlParts = url.split('.');
    const lastPart = urlParts[urlParts.length - 1];
    const queryIndex = lastPart.indexOf('?');
    const extension = queryIndex > -1 ? lastPart.substring(0, queryIndex) : lastPart;
    return extension.toLowerCase() || 'jpg';
  }

  /**
   * Helper: Convert ArrayBuffer to Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    return Buffer.from(bytes).toString('base64');
  }
}

// Export singleton instance
export const invoiceService = InvoiceService.getInstance();
