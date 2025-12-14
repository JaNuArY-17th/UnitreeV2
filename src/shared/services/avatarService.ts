import { apiClient } from '@/shared/utils/axios';
import { API_ENDPOINTS } from '@/shared/config/env';
import { fileService } from '@/shared/services';
import { authService } from '@/features/authentication/services/authService';
import * as RNFS from 'react-native-fs';
import { Platform } from 'react-native';

export interface AvatarUploadResponse {
  success: boolean;
  message: string;
  data?: {
    avatar_id: string;
    avatar_url: string;
  };
}

export interface AvatarValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ProcessedImageData {
  uri: string;
  type: string;
  fileName: string;
  fileSize: number;
  width: number;
  height: number;
}

class AvatarService {
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly UPLOAD_TIMEOUT = 30000; // 30 seconds

  /**
   * Validates image file before processing
   */
  async validateImage(imageUri: string): Promise<AvatarValidationResult> {
    try {
      // Get file stats
      const fileStats = await RNFS.stat(imageUri.replace('file://', ''));

      if (fileStats.size > this.MAX_FILE_SIZE) {
        return {
          isValid: false,
          error: 'File size exceeds 5MB limit'
        };
      }

      // Basic type validation from file extension
      const fileName = fileStats.path.split('/').pop()?.toLowerCase() || '';

      // Extract file extension and map to MIME type
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      let mimeType: string;
      switch (fileExtension) {
        case 'jpg':
        case 'jpeg':
          mimeType = 'image/jpeg';
          break;
        case 'png':
          mimeType = 'image/png';
          break;
        case 'webp':
          mimeType = 'image/webp';
          break;
        default:
          mimeType = '';
      }

      const isValidType = this.ALLOWED_TYPES.includes(mimeType);

      if (!isValidType) {
        return {
          isValid: false,
          error: 'Unsupported file format. Use JPEG, PNG, or WebP'
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Image validation error:', error);
      return {
        isValid: false,
        error: 'Unable to validate image file'
      };
    }
  }

  /**
   * Processes image for upload (compress and resize if needed)
   */
  async processImageForUpload(imageUri: string): Promise<string> {
    try {
      // For now, return the original URI
      // In a full implementation, you would compress/resize here
      // using react-native-image-resizer or similar library
      return imageUri;
    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error('Failed to process image');
    }
  }

  /**
   * Uploads avatar image to server
   */
  async uploadAvatar(
    imageUri: string,
    userId: string,
    onProgress?: (progress: number) => void
  ): Promise<AvatarUploadResponse> {
    try {
      // Step 1: Validate image
      const validation = await this.validateImage(imageUri);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Step 2: Process image (compress/resize)
      const processedImageUri = await this.processImageForUpload(imageUri);

      // Step 3: Get file stats for upload URL generation
      const filePathForStats = processedImageUri.replace('file://', '');

      const fileStats = await RNFS.stat(filePathForStats);

      const fileType = this.getFileTypeFromUri(processedImageUri);
      const fileName = `avatar_${userId}_${Date.now()}.jpg`;

      // Step 4: Generate upload URL using authService
      const uploadUrlResponse = await authService.generateUploadUrl({
        file_name: fileName,
        file_type: fileType,
        file_size: fileStats.size,
      });
      console.log('Upload URL response data:', uploadUrlResponse.data);

      if (!uploadUrlResponse.success) {
        throw new Error(uploadUrlResponse.message || 'Failed to generate upload URL');
      }

      const { upload_url, file_id } = uploadUrlResponse.data;

      // Step 5: Upload the file using authService
      const file = {
        uri: processedImageUri,
        type: fileType,
        name: fileName,
      };

      const uploadSuccess = await authService.uploadFile(upload_url, file);

      if (!uploadSuccess) {
        throw new Error('File upload failed');
      }

      // Step 6: Update avatar with file_id using authService
      const updateResponse = await authService.updateAvatar({
        avatar_id: file_id,
      });

      if (!updateResponse.success) {
        throw new Error(updateResponse.message || 'Failed to update avatar in user profile');
      }

      // Step 7: Cleanup temporary files
      await this.cleanup(processedImageUri);

      return {
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
          avatar_id: file_id,
          avatar_url: updateResponse.data.file_url,
        },
      };

    } catch (error: any) {
      console.error('❌ Avatar upload failed:', error);
      // Cleanup on failure
      await this.cleanup(imageUri).catch(() => {});
      throw error;
    }
  }

  /**
   * Gets file type from URI
   */
  private getFileTypeFromUri(uri: string): string {
    const extension = uri.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      default:
        console.warn('Unknown file extension, defaulting to JPEG:', extension);
        return 'image/jpeg'; // Default fallback
    }
  }

  /**
   * Cleans up temporary files
   */
  private async cleanup(imageUri: string): Promise<void> {
    try {
      // Only cleanup if it's a temporary file we created
      if (imageUri.includes('temp_upload_') || imageUri.includes(RNFS.TemporaryDirectoryPath)) {
        const filePath = imageUri.replace('file://', '');
        await RNFS.unlink(filePath);
      }
    } catch (error) {
      // Ignore cleanup errors
      console.warn('Cleanup warning:', error);
    }
  }
}

export const avatarService = new AvatarService();