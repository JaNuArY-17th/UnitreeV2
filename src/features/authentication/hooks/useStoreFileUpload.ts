import { useState } from 'react';
import { apiClient } from '@/shared/utils/axios';
import { API_ENDPOINTS } from '@/shared/config';
import ReactNativeBlobUtil from 'react-native-blob-util';

interface GenerateUploadUrlRequest {
  file_type: string;
  file_name: string;
  file_size: number;
  store_id: string;
}

interface GenerateUploadUrlResponse {
  success: boolean;
  message: string;
  data: {
    fileId: string;      // camelCase, not snake_case
    fileKey: string;
    fileSize: number;
    fileType: string;
    fileUrl: string;
    uploadUrl: string;   // camelCase, not snake_case
    fileName: string;
  };
  code: number;
}

// File type that works with React Native
export type RNFile = {
  uri: string;
  type: string;
  name: string;
};

/**
 * Hook for uploading store-related files (business license, etc.)
 * Includes store_id in the generate upload URL request
 */
export function useStoreFileUpload() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generate a pre-signed URL for store file upload to S3
   * @param fileType MIME type of the file (e.g., "image/jpeg")
   * @param fileName Name of the file (e.g., "business_license.jpg")
   * @param fileSize Size of the file in bytes
   * @param storeId ID of the store
   * @returns Object containing upload URL and file details
   */
  const generateUploadUrl = async (
    fileType: string,
    fileName: string,
    fileSize: number,
    storeId: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const request: GenerateUploadUrlRequest = {
        file_type: fileType,
        file_name: fileName,
        file_size: fileSize,
        store_id: storeId,
      };

      const response = await apiClient.post<GenerateUploadUrlResponse>(
        API_ENDPOINTS.FILES.GENERATE_UPLOAD_URL_STORE,
        request
      );

      console.log('🔍 [STORE-FILE-UPLOAD] Full API response:', JSON.stringify(response, null, 2));
      console.log('🔍 [STORE-FILE-UPLOAD] response.data:', JSON.stringify(response.data, null, 2));

      if (!response.data) {
        throw new Error('No response data received from server');
      }

      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data,
        code: response.data.code,
      };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to generate upload URL';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
        data: null,
        code: err.response?.status || 500,
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Upload a file directly to the pre-signed S3 URL
   * @param uploadUrl The pre-signed URL from generateUploadUrl
   * @param file The React Native file object
   * @returns Success status and message
   */
  const uploadFileToS3 = async (uploadUrl: string, file: RNFile | string) => {
    setIsLoading(true);
    setError(null);

    try {
      // For base64 strings
      if (typeof file === 'string') {
        console.log(`🔍 [STORE-FILE-UPLOAD] Processing base64 string, length: ${file.length}`);

        let base64Data = file;
        if (file.startsWith('data:image')) {
          base64Data = file.replace(/^data:image\/\w+;base64,/, '');
          console.log(`🔍 [STORE-FILE-UPLOAD] Extracted base64 data, length: ${base64Data.length}`);
        }

        // Convert base64 to binary
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        console.log(`🔍 [STORE-FILE-UPLOAD] Uploading base64 as binary, size: ${bytes.length} bytes`);
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          body: bytes,
          headers: {
            'Content-Type': 'image/jpeg',
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(`S3 upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
        }

        return {
          success: true,
          message: 'File uploaded successfully',
        };
      }

      // For file objects with URI - use ReactNativeBlobUtil (works on both Android and iOS)
      console.log(`🔍 [STORE-FILE-UPLOAD] Uploading file from URI: ${file.uri}`);
      console.log(`🔍 [STORE-FILE-UPLOAD] File type: ${file.type}, File name: ${file.name}`);
      console.log(`🔍 [STORE-FILE-UPLOAD] Using ReactNativeBlobUtil for reliable upload`);
      
      try {
        // Convert URI to proper path (remove file:// prefix if present)
        let filePath = file.uri;
        if (filePath.startsWith('file://')) {
          filePath = filePath.replace('file://', '');
        }
        
        console.log(`🔍 [STORE-FILE-UPLOAD] File path: ${filePath}`);
        
        // Upload file to S3 using ReactNativeBlobUtil
        const uploadResponse = await ReactNativeBlobUtil.fetch(
          'PUT',
          uploadUrl,
          {
            'Content-Type': file.type || 'image/jpeg',
          },
          ReactNativeBlobUtil.wrap(filePath)
        );
        
        console.log(`✅ [STORE-FILE-UPLOAD] S3 upload response status: ${uploadResponse.respInfo.status}`);
        console.log(`🔍 [STORE-FILE-UPLOAD] Response info:`, uploadResponse.respInfo);

        if (uploadResponse.respInfo.status !== 200) {
          throw new Error(`S3 upload failed: ${uploadResponse.respInfo.status}`);
        }

        return {
          success: true,
          message: 'File uploaded successfully',
        };
      } catch (uploadError: any) {
        console.error(`❌ [STORE-FILE-UPLOAD] Upload error:`, uploadError);
        console.error(`❌ [STORE-FILE-UPLOAD] Error details:`, {
          message: uploadError.message,
          uri: file.uri,
        });
        throw uploadError;
      }
    } catch (err: any) {
      console.error('Error uploading file:', err);
      const errorMessage = err.message || 'Failed to upload file';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Complete file upload process for store in one step
   * @param file The file to upload
   * @param storeId ID of the store
   * @returns Object containing file details (fileUrl, fileKey, etc)
   */
  const uploadFile = async (file: RNFile | string, storeId: string) => {
    // Get file type and name
    let fileType = 'image/jpeg';
    let fileName = 'business_license.jpg';
    let fileSize = 1024000; // Default 1MB

    if (typeof file !== 'string') {
      fileType = file.type;
      fileName = file.name;
      // Try to get file size using ReactNativeBlobUtil
      try {
        let filePath = file.uri;
        if (filePath.startsWith('file://')) {
          filePath = filePath.replace('file://', '');
        }
        const stats = await ReactNativeBlobUtil.fs.stat(filePath);
        fileSize = stats.size;
        console.log(`🔍 [STORE-FILE-UPLOAD] File size: ${fileSize} bytes`);
      } catch (err) {
        console.warn('Could not determine file size, using default 1MB:', err);
      }
    } else {
      // Estimate base64 string size (approximate)
      fileSize = Math.ceil((file.length - (file.indexOf(',') + 1)) * 0.75);
    }

    // Generate the upload URL with store_id
    console.log(`🔍 [STORE-FILE-UPLOAD] Generating upload URL for store: ${storeId}`);
    const urlResult = await generateUploadUrl(fileType, fileName, fileSize, storeId);

    console.log(`🔍 [STORE-FILE-UPLOAD] URL generation result:`, {
      success: urlResult.success,
      hasData: !!urlResult.data,
      uploadUrl: urlResult.data?.uploadUrl,
      fileId: urlResult.data?.fileId,
    });

    if (!urlResult.success || !urlResult.data) {
      console.error(`❌ [STORE-FILE-UPLOAD] Failed to generate upload URL:`, urlResult.message);
      return {
        success: false,
        message: urlResult.message || 'Failed to generate upload URL',
        data: null,
      };
    }

    if (!urlResult.data.uploadUrl) {
      console.error(`❌ [STORE-FILE-UPLOAD] Upload URL is missing from response`);
      return {
        success: false,
        message: 'Upload URL is missing from server response',
        data: null,
      };
    }

    // Upload the file to the pre-signed URL
    console.log(`🔍 [STORE-FILE-UPLOAD] Starting upload to S3...`);
    const uploadResult = await uploadFileToS3(urlResult.data.uploadUrl, file);

    if (!uploadResult.success) {
      return {
        success: false,
        message: uploadResult.message,
        data: null,
      };
    }

    // Confirm upload with backend
    console.log(`🔍 [STORE-FILE-UPLOAD] Confirming upload with backend for fileId: ${urlResult.data.fileId}`);
    try {
      const confirmResponse = await apiClient.put(
        `${API_ENDPOINTS.FILES.CONFIRM_UPLOAD}/${urlResult.data.fileId}/confirm-upload`
      );
      console.log(`✅ [STORE-FILE-UPLOAD] Upload confirmed:`, confirmResponse.data);
    } catch (confirmError) {
      console.error(`❌ [STORE-FILE-UPLOAD] Failed to confirm upload:`, confirmError);
      // Don't fail the whole upload if confirmation fails
      // Backend might have already processed it
    }

    // Return the file details
    return {
      success: true,
      message: 'File uploaded successfully',
      data: {
        fileUrl: urlResult.data.fileUrl,
        fileKey: urlResult.data.fileKey,
        fileType: urlResult.data.fileType,
        fileId: urlResult.data.fileId,
      },
    };
  };

  return {
    // State
    isLoading,
    error,

    // Actions
    generateUploadUrl,
    uploadFileToS3,
    uploadFile,

    // Helper to clear errors
    clearError: () => setError(null),
  };
}
