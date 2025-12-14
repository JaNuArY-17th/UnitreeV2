import * as RNFS from 'react-native-fs';
import { Platform } from 'react-native';

export interface ImageMetadata {
  width: number;
  height: number;
  size: number;
  mimeType: string;
  orientation?: number;
}

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
}

export interface CompressionOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  outputFormat: 'jpeg' | 'png';
}

/**
 * Validates image file
 */
export const validateImage = async (imageUri: string): Promise<ImageValidationResult> => {
  try {
    const metadata = await getImageMetadata(imageUri);

    // Check file size (5MB limit)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (metadata.size > MAX_SIZE) {
      return {
        isValid: false,
        error: 'File size exceeds 5MB limit'
      };
    }

    // Check supported formats
    const supportedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!supportedTypes.includes(metadata.mimeType)) {
      return {
        isValid: false,
        error: 'Unsupported file format. Use JPEG, PNG, or WebP'
      };
    }

    // Check dimensions (reasonable limits)
    const MAX_DIMENSION = 4096;
    if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
      return {
        isValid: false,
        error: 'Image dimensions too large'
      };
    }

    return { isValid: true };
  } catch (error) {
    console.error('Image validation error:', error);
    return {
      isValid: false,
      error: 'Unable to validate image'
    };
  }
};

/**
 * Gets image metadata
 */
export const getImageMetadata = async (imageUri: string): Promise<ImageMetadata> => {
  try {
    // Get file stats
    const filePath = imageUri.replace('file://', '');
    const stats = await RNFS.stat(filePath);

    // For now, we'll use basic file extension detection
    // In a full implementation, you might use a library like react-native-image-size
    const mimeType = getMimeTypeFromUri(imageUri);

    // Default dimensions (would be extracted properly in full implementation)
    const dimensions = await getImageDimensions(imageUri);

    return {
      width: dimensions.width,
      height: dimensions.height,
      size: stats.size,
      mimeType,
    };
  } catch (error) {
    console.error('Failed to get image metadata:', error);
    throw new Error('Unable to read image metadata');
  }
};

/**
 * Compresses and resizes image
 */
export const compressImage = async (
  imageUri: string,
  options: CompressionOptions
): Promise<string> => {
  try {
    // In a full implementation, you would use react-native-image-resizer
    // For now, we'll return the original URI
    console.log('Image compression requested but not implemented yet. Returning original.');

    // Basic validation
    const validation = await validateImage(imageUri);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    return imageUri;
  } catch (error) {
    console.error('Image compression error:', error);
    throw error;
  }
};

/**
 * Gets MIME type from URI
 */
export const getMimeTypeFromUri = (uri: string): string => {
  const extension = uri.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    default:
      return 'image/jpeg'; // Default fallback
  }
};

/**
 * Gets image dimensions (placeholder implementation)
 */
const getImageDimensions = async (imageUri: string): Promise<{ width: number; height: number }> => {
  // In a real implementation, you would use a library to get actual dimensions
  // For now, return default dimensions
  return {
    width: 800,
    height: 600,
  };
};

/**
 * Calculates optimal resize dimensions maintaining aspect ratio
 */
export const calculateResizeDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxDimension: number
): { width: number; height: number } => {
  const aspectRatio = originalWidth / originalHeight;

  let newWidth = originalWidth;
  let newHeight = originalHeight;

  if (originalWidth > originalHeight) {
    // Landscape
    if (originalWidth > maxDimension) {
      newWidth = maxDimension;
      newHeight = maxDimension / aspectRatio;
    }
  } else {
    // Portrait or square
    if (originalHeight > maxDimension) {
      newHeight = maxDimension;
      newWidth = maxDimension * aspectRatio;
    }
  }

  return {
    width: Math.round(newWidth),
    height: Math.round(newHeight),
  };
};

/**
 * Gets compression options based on file size
 */
export const getCompressionOptions = (
  originalSize: number,
  dimensions: { width: number; height: number }
): CompressionOptions => {
  // Dynamic quality based on file size
  let quality = 0.9;
  if (originalSize > 2 * 1024 * 1024) { // > 2MB
    quality = 0.7;
  } else if (originalSize > 1024 * 1024) { // > 1MB
    quality = 0.8;
  }

  // Dynamic dimensions based on original size
  let maxDimension = 1024;
  if (dimensions.width > 2048 || dimensions.height > 2048) {
    maxDimension = 1536;
  }

  return {
    maxWidth: maxDimension,
    maxHeight: maxDimension,
    quality,
    outputFormat: 'jpeg',
  };
};