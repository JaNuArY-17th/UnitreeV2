import { useState } from 'react';
import { apiClient } from '../utils/axios';
import RNFS from 'react-native-fs';
import ReactNativeBlobUtil from 'react-native-blob-util';

interface GenerateUploadUrlRequest {
  file_type: string;
  file_name: string;
  file_size: number;
}

interface GenerateUploadUrlResponse {
  success: boolean;
  message: string;
  data: {
    file_id: string;
    file_key: string;
    file_size: number;
    file_type: string;
    file_url: string;
    upload_url: string;
  };
  code: number;
}

// File type that works with React Native
export type RNFile = {
  uri: string;
  type: string;
  name: string;
};

export function useFileUpload() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generate a pre-signed URL for file upload to S3
   * @param fileType MIME type of the file (e.g., "image/jpeg")
   * @param fileName Name of the file (e.g., "profile_picture.jpg")
   * @param fileSize Size of the file in bytes (optional, default 1MB)
   * @returns Object containing upload URL and file details
   */
  const generateUploadUrl = async (fileType: string, fileName: string, fileSize: number = 1024000) => {
    setIsLoading(true);
    setError(null);

    try {
      const request: GenerateUploadUrlRequest = { 
        file_type: fileType, 
        file_name: fileName,
        file_size: fileSize
      };
      const response = await apiClient.post<GenerateUploadUrlResponse>(
        'iam/v1/files/generate-upload-url',
        request
      );

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
        console.log(`🔍 [FILE-UPLOAD] Processing base64 string, length: ${file.length}`);

        let base64Data = file;
        if (file.startsWith('data:image')) {
          base64Data = file.replace(/^data:image\/\w+;base64,/, '');
          console.log(`🔍 [FILE-UPLOAD] Extracted base64 data, length: ${base64Data.length}`);
        }

        console.log(`🔍 [FILE-UPLOAD] Uploading base64 string using ReactNativeBlobUtil...`);
        const uploadResponse = await ReactNativeBlobUtil.fetch(
          'PUT',
          uploadUrl,
          {
            'Content-Type': 'image/jpeg',
          },
          base64Data
        );

        if (uploadResponse.respInfo.status !== 200) {
          throw new Error(`S3 upload failed: ${uploadResponse.respInfo.status}`);
        }

        console.log(`🔍 [FILE-UPLOAD] Base64 upload successful!`);
        return {
          success: true,
          message: 'File uploaded successfully',
        };
      }

      // For file objects with URI
      console.log(`🔍 [FILE-UPLOAD] Fetching file from URI: ${file.uri}`);
      console.log(`🔍 [FILE-UPLOAD] File type: ${file.type}, name: ${file.name}`);

      // Validate URI format
      if (!file.uri || (!file.uri.startsWith('file://') && !file.uri.startsWith('content://'))) {
        throw new Error(`Invalid file URI format: ${file.uri}`);
      }

      let blob: Blob;

      try {
        // Clean up the file path for react-native-fs
        let filePath = file.uri;
        if (filePath.startsWith('file://')) {
          filePath = filePath.replace('file://', '');
        }

        console.log(`🔍 [FILE-UPLOAD] Checking file existence at: ${filePath}`);

        // Check if file exists using RNFS
        const exists = await RNFS.exists(filePath);
        if (!exists) {
          console.error(`🔍 [FILE-UPLOAD] File does not exist at path: ${filePath}`);
          throw new Error(`File not found at path: ${filePath}`);
        }

        // Get file info
        const stat = await RNFS.stat(filePath);
        console.log(`🔍 [FILE-UPLOAD] File info - size: ${stat.size} bytes, isFile: ${stat.isFile()}`);

        if (stat.size === 0) {
          throw new Error('File is empty');
        }

        // Use ReactNativeBlobUtil to upload directly
        console.log(`🔍 [FILE-UPLOAD] Uploading file using ReactNativeBlobUtil...`);

        const uploadResponse = await ReactNativeBlobUtil.fetch(
          'PUT',
          uploadUrl,
          {
            'Content-Type': file.type || 'image/jpeg',
          },
          ReactNativeBlobUtil.wrap(filePath)
        );

        if (uploadResponse.respInfo.status !== 200) {
          throw new Error(`S3 upload failed: ${uploadResponse.respInfo.status}`);
        }

        console.log(`🔍 [FILE-UPLOAD] Upload successful using ReactNativeBlobUtil!`);
        return {
          success: true,
          message: 'File uploaded successfully',
        };
      } catch (rnfsError: any) {
        console.error(`🔍 [FILE-UPLOAD] RNFS method failed:`, rnfsError);

        // Fallback: Try using fetch
        try {
          console.log(`🔍 [FILE-UPLOAD] Trying fetch as fallback...`);
          const response = await fetch(file.uri);

          if (!response.ok) {
            throw new Error(`Failed to fetch file from URI: ${response.status} ${response.statusText}`);
          }

          blob = await response.blob();
          console.log(`🔍 [FILE-UPLOAD] Fetch succeeded, blob size: ${blob.size} bytes`);
        } catch (fetchError: any) {
          console.error(`🔍 [FILE-UPLOAD] Fetch also failed:`, fetchError);

          // Final fallback: Try using XMLHttpRequest
          try {
            console.log(`🔍 [FILE-UPLOAD] Trying XMLHttpRequest as final fallback...`);
            blob = await new Promise((resolve, reject) => {
              const xhr = new XMLHttpRequest();
              xhr.onload = function() {
                resolve(xhr.response);
              };
              xhr.onerror = function() {
                reject(new Error('Failed to load file using XMLHttpRequest'));
              };
              xhr.responseType = 'blob';
              xhr.open('GET', file.uri, true);
              xhr.send(null);
            });
            console.log(`🔍 [FILE-UPLOAD] XMLHttpRequest succeeded, blob size: ${blob.size} bytes`);
          } catch (xhrError: any) {
            console.error(`🔍 [FILE-UPLOAD] All methods failed. Original error:`, rnfsError);
            console.error(`🔍 [FILE-UPLOAD] Fetch error:`, fetchError);
            console.error(`🔍 [FILE-UPLOAD] XHR error:`, xhrError);
            throw new Error(`Cannot read file from URI. All methods failed. URI: ${file.uri}. Original error: ${rnfsError.message}`);
          }
        }
      }

      console.log(`🔍 [FILE-UPLOAD] File blob size: ${blob.size} bytes, type: ${blob.type}`);

      if (blob.size === 0) {
        throw new Error('File is empty or could not be read');
      }

      console.log(`🔍 [FILE-UPLOAD] Uploading to S3 URL: ${uploadUrl.substring(0, 50)}...`);
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: blob,
        headers: {
          'Content-Type': file.type || 'image/jpeg',
        },
      });

      if (!uploadResponse.ok) {
        const responseText = await uploadResponse.text().catch(() => 'Unable to read response');
        console.error(`🔍 [FILE-UPLOAD] S3 upload failed. Status: ${uploadResponse.status}, Response: ${responseText}`);
        throw new Error(`S3 upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      console.log(`🔍 [FILE-UPLOAD] Upload successful!`);
      return {
        success: true,
        message: 'File uploaded successfully',
      };
    } catch (err: any) {
      console.error('🔍 [FILE-UPLOAD] Error uploading file:', err);
      console.error('🔍 [FILE-UPLOAD] Error stack:', err.stack);
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
   * Complete file upload process in one step
   * @param file The file to upload
   * @returns Object containing file details (fileUrl, fileKey, etc)
   */
  const uploadFile = async (file: RNFile | string) => {
    // Get file type and name
    let fileType = 'image/jpeg';
    let fileName = 'image.jpg';
    let fileSize = 1024000; // Default 1MB
    
    if (typeof file !== 'string') {
      fileType = file.type;
      fileName = file.name;
      // Try to get file size if available
      try {
        const response = await fetch(file.uri);
        const blob = await response.blob();
        fileSize = blob.size;
      } catch (err) {
        console.warn('Could not determine file size, using default 1MB');
      }
    } else {
      // Estimate base64 string size (approximate)
      fileSize = Math.ceil((file.length - (file.indexOf(',') + 1)) * 0.75);
    }
    
    // Generate the upload URL
    const urlResult = await generateUploadUrl(fileType, fileName, fileSize);
    
    if (!urlResult.success || !urlResult.data) {
      return {
        success: false,
        message: urlResult.message || 'Failed to generate upload URL',
        data: null,
      };
    }
    
    // Upload the file to the pre-signed URL
    const uploadResult = await uploadFileToS3(urlResult.data.upload_url, file);
    
    if (!uploadResult.success) {
      return {
        success: false,
        message: uploadResult.message,
        data: null,
      };
    }
    
    // Return the file details
    return {
      success: true,
      message: 'File uploaded successfully',
      data: {
        fileUrl: urlResult.data.file_url,
        fileKey: urlResult.data.file_key,
        fileType: urlResult.data.file_type,
        fileId: urlResult.data.file_id,
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
