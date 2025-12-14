import { useState } from 'react';
import { ekycApiService } from '../services/ekycApiService';
import type { ParsedEkycResult } from '../types/ekyc';
import { UserInfoSubmitData } from '../types/userInfo';
import { useFileUpload } from '../../../shared/hooks/useFileUpload';
import { ekycDebugLog } from '../utils/ekycUtils';

/**
 * Hook quản lý việc tải lên và lưu trữ dữ liệu eKYC
 * @returns Các hàm và trạng thái liên quan đến quá trình tải lên và lưu trữ eKYC
 */
export function useEkycUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { uploadFile } = useFileUpload();

  /**
   * Tạo file object từ đường dẫn ảnh từ SDK
   * @param imagePath Đường dẫn ảnh từ SDK
   * @param fileName Tên file
   * @returns File object để upload hoặc null nếu không có đường dẫn
   */
  const createFileFromImagePath = (imagePath?: string, fileName: string = 'image.jpg') => {
    if (!imagePath) {
      ekycDebugLog('useEkycUpload', 'createFileFromImagePath - No image path provided', { fileName });
      return null;
    }

    ekycDebugLog('useEkycUpload', 'createFileFromImagePath - Creating file object', { imagePath, fileName });

    return {
      uri: imagePath.startsWith('file://') ? imagePath : `file://${imagePath}`,
      type: 'image/jpeg',
      name: fileName,
    };
  };

  /**
   * Lưu thông tin xác thực eKYC sau khi tải lên file
   * @param ekycData Kết quả eKYC đã được xử lý
   * @param userData Thông tin người dùng từ form
   * @returns Kết quả lưu thông tin
   */
  const saveEkycVerification = async (
    ekycData: ParsedEkycResult, 
    userData: UserInfoSubmitData
  ) => {
    if (!ekycData || !userData) {
      const error = 'Dữ liệu eKYC hoặc thông tin người dùng không hợp lệ';
      ekycDebugLog('useEkycUpload', 'saveEkycVerification - Invalid input data', {
        hasEkycData: !!ekycData,
        hasUserData: !!userData,
      }, true);
      setUploadError(error);
      throw new Error(error);
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      ekycDebugLog('useEkycUpload', 'saveEkycVerification - Starting upload process', {
        hasUserData: !!userData,
        hasFrontImagePath: !!ekycData.imagePaths?.frontPath,
        hasBackImagePath: !!ekycData.imagePaths?.backPath,
        hasNearFaceImagePath: !!ekycData.imagePaths?.faceNearPath,
        hasFarFaceImagePath: !!ekycData.imagePaths?.faceFarPath,
        hasImagePaths: !!ekycData.imagePaths,
      });

      // Upload các ảnh
      let frontFileId = '', backFileId = '', nearFaceFileId = '', farFaceFileId = '';

      // Upload ảnh mặt trước CCCD
      const frontCardImage = createFileFromImagePath(
        ekycData.imagePaths?.frontPath,
        'front_card.jpg'
      );
      
      if (frontCardImage) {
        try {
          ekycDebugLog('useEkycUpload', 'Uploading front card image', {
            imageType: typeof frontCardImage,
            hasUri: typeof frontCardImage === 'object' && 'uri' in frontCardImage,
            isBase64: typeof frontCardImage === 'string'
          });
          const frontUploadResult = await uploadFile(frontCardImage);

          if (frontUploadResult.success && frontUploadResult.data) {
            frontFileId = frontUploadResult.data.fileId;
            ekycDebugLog('useEkycUpload', 'Front card image uploaded successfully', { fileId: frontFileId });
          } else {
            console.error('🔍 [EKYC-SUBMIT] Front card upload failed:', frontUploadResult.message);
            throw new Error('Failed to upload front card image: ' + frontUploadResult.message);
          }
        } catch (error: any) {
          console.error('🔍 [EKYC-SUBMIT] Error uploading front card image:', error);
          // Không throw error ngay, để tiếp tục với các ảnh khác
          console.warn('🔍 [EKYC-SUBMIT] Continuing without front card image');
        }
      }

      // Upload ảnh mặt sau CCCD
      const backCardImage = createFileFromImagePath(
        ekycData.imagePaths?.backPath,
        'back_card.jpg'
      );
      
      if (backCardImage) {
        try {
          ekycDebugLog('useEkycUpload', 'Uploading back card image', {
            imageType: typeof backCardImage,
            hasUri: typeof backCardImage === 'object' && 'uri' in backCardImage,
            isBase64: typeof backCardImage === 'string'
          });
          const backUploadResult = await uploadFile(backCardImage);

          if (backUploadResult.success && backUploadResult.data) {
            backFileId = backUploadResult.data.fileId;
            ekycDebugLog('useEkycUpload', 'Back card image uploaded successfully', { fileId: backFileId });
          } else {
            console.error('🔍 [EKYC-SUBMIT] Back card upload failed:', backUploadResult.message);
            throw new Error('Failed to upload back card image: ' + backUploadResult.message);
          }
        } catch (error: any) {
          console.error('🔍 [EKYC-SUBMIT] Error uploading back card image:', error);
          // Không throw error ngay, để tiếp tục với các ảnh khác
          console.warn('🔍 [EKYC-SUBMIT] Continuing without back card image');
        }
      }

      // Upload ảnh khuôn mặt gần
      const nearFaceImage = createFileFromImagePath(
        ekycData.imagePaths?.faceNearPath,
        'face_near.jpg'
      );
      
      if (nearFaceImage) {
        try {
          const nearFaceUploadResult = await uploadFile(nearFaceImage);

          if (nearFaceUploadResult.success && nearFaceUploadResult.data) {
            nearFaceFileId = nearFaceUploadResult.data.fileId;
            ekycDebugLog('useEkycUpload', 'Near face image uploaded successfully', { fileId: nearFaceFileId });
          } else {
            console.error('🔍 [EKYC-SUBMIT] Near face upload failed:', nearFaceUploadResult.message);
          }
        } catch (error: any) {
          console.error('🔍 [EKYC-SUBMIT] Error uploading near face image:', error);
          console.warn('🔍 [EKYC-SUBMIT] Continuing without near face image');
        }
      }

      // Upload ảnh khuôn mặt xa
      const farFaceImage = createFileFromImagePath(
        ekycData.imagePaths?.faceFarPath,
        'face_far.jpg'
      );

      if (farFaceImage) {
        try {
          const farFaceUploadResult = await uploadFile(farFaceImage);

          if (farFaceUploadResult.success && farFaceUploadResult.data) {
            farFaceFileId = farFaceUploadResult.data.fileId;
            ekycDebugLog('useEkycUpload', 'Far face image uploaded successfully', { fileId: farFaceFileId });
          } else {
            console.error('🔍 [EKYC-SUBMIT] Far face upload failed:', farFaceUploadResult.message);
          }
        } catch (error: any) {
          console.error('🔍 [EKYC-SUBMIT] Error uploading far face image:', error);
          console.warn('🔍 [EKYC-SUBMIT] Continuing without far face image');
        }
      }

      // Kiểm tra xem có ít nhất một ảnh được upload thành công không
      const uploadedImagesCount = [frontFileId, backFileId, nearFaceFileId, farFaceFileId].filter(id => id).length;

      if (uploadedImagesCount === 0) {
        throw new Error('Không thể tải lên bất kỳ hình ảnh nào. Vui lòng thực hiện lại eKYC.');
      }

      ekycDebugLog('useEkycUpload', 'Image upload summary', {
        frontFileId: !!frontFileId,
        backFileId: !!backFileId,
        nearFaceFileId: !!nearFaceFileId,
        farFaceFileId: !!farFaceFileId,
        totalUploaded: uploadedImagesCount
      });

      // Chuẩn bị dữ liệu để lưu
      const saveEkycRequest = {
        full_name: userData.documentVerification.personalInfo.fullName || '',
        gender: userData.documentVerification.personalInfo.gender === 'Nam' || userData.documentVerification.personalInfo.gender === 'male' || userData.documentVerification.personalInfo.gender === 'M',
        date_of_birth: userData.documentVerification.personalInfo.dateOfBirth || '',
        nationality: userData.documentVerification.personalInfo.nationality || 'Vietnam',
        date_of_issue: userData.documentVerification.personalInfo.dateOfIssue || '',
        date_of_expiry: userData.documentVerification.personalInfo.dateOfExpiry || '',
        identification_number: userData.documentVerification.personalInfo.identificationNumber || '',
        permanent_address: userData.documentVerification.personalInfo.permanentAddress || '',
        contact_address: userData.documentVerification.personalInfo.contactAddress || '',
        
        // Thông tin xác thực mặt trước CCCD
        front_card_is_authentic: userData.documentVerification.verification.frontCard.isAuthentic || false,
        front_card_liveness_score: Math.max(0, Math.min(1, userData.documentVerification.verification.frontCard.livenessScore || 0)),
        front_card_face_swapping_score: Math.max(0, Math.min(1, userData.documentVerification.verification.frontCard.faceSwappingScore || 0)),
        
        // Thông tin xác thực mặt sau CCCD
        back_card_is_authentic: userData.documentVerification.verification.backCard.isAuthentic || false,
        back_card_liveness_score: Math.max(0, Math.min(1, userData.documentVerification.verification.backCard.livenessScore || 0)),
        back_card_face_swapping_score: Math.max(0, Math.min(1, userData.documentVerification.verification.backCard.faceSwappingScore || 0)),
        
        // Thông tin xác thực khuôn mặt
        face_is_live: userData.faceVerification.isLive || false,
        face_liveness_score: Math.max(0, Math.min(1, userData.faceVerification.livenessScore || 0)),
        face_liveness_message: userData.faceVerification.livenessMessage || 'Face verification completed',
        face_age: Math.max(0, userData.faceVerification.age || 0),
        face_gender: userData.faceVerification.gender === 'Nam' || userData.faceVerification.gender === 'male' || userData.faceVerification.gender === 'M',
        face_blur_score: Math.max(0, Math.min(1, userData.faceVerification.blurScore || 0)),
        face_eyes_open: userData.faceVerification.eyesOpen || false,
        face_is_masked: userData.faceVerification.isMasked || false,
        
        // Metadata
        verification_timestamp: userData.metadata.verificationTimestamp || new Date().toISOString(),
        challenge_code: userData.metadata.challengeCode || ekycData.frontCardLiveness?.challengeCode || '',
        server_version: userData.metadata.serverVersion || ekycData.frontCardLiveness?.server_version || '1.0.0',
        verification_status: userData.metadata.status || 'VERIFIED',
        
        // ID các file đã tải lên
        front_file_id: frontFileId || '',
        back_file_id: backFileId || '',
        near_face_file_id: nearFaceFileId || '',
        far_face_file_id: farFaceFileId || '',
      };

      ekycDebugLog('useEkycUpload', 'saveEkycVerification - Calling API to save eKYC info', {
        requestKeys: Object.keys(saveEkycRequest),
        uploadedFiles: {
          frontFileId: !!frontFileId,
          backFileId: !!backFileId,
          nearFaceFileId: !!nearFaceFileId,
          farFaceFileId: !!farFaceFileId,
        },
        imageSourceTypes: {
          frontImage: ekycData.imagePaths?.frontPath ? 'path' : 'none',
          backImage: ekycData.imagePaths?.backPath ? 'path' : 'none',
          nearFaceImage: ekycData.imagePaths?.faceNearPath ? 'path' : 'none',
          farFaceImage: ekycData.imagePaths?.faceFarPath ? 'path' : 'none',
        }
      });

      // Log trường date_of_issue để debug
      ekycDebugLog('useEkycUpload', 'saveEkycVerification - Date fields values', {
        date_of_birth: saveEkycRequest.date_of_birth,
        date_of_issue: saveEkycRequest.date_of_issue,
        date_of_expiry: saveEkycRequest.date_of_expiry
      });

      // Gọi API lưu thông tin eKYC
      const result = await ekycApiService.saveEkycInfo(saveEkycRequest);
      
      ekycDebugLog('useEkycUpload', 'saveEkycVerification - API call completed', {
        success: result.success,
        message: result.message,
        code: result.code,
      });

      return result;
    } catch (error: any) {
      ekycDebugLog('useEkycUpload', 'saveEkycVerification - Error', {
        errorType: typeof error,
        message: error?.message,
        code: error?.code,
        originalMessage: error?.originalMessage,
        stack: error?.stack?.substring(0, 200)
      }, true);
      
      // Set upload error for UI
      const errorMessage = error?.message || String(error);
      setUploadError(errorMessage);
      
      // Re-throw the original error object to preserve error details
      // This allows the calling component to handle specific error types
      if (error && typeof error === 'object' && (error.code || error.message)) {
        throw error; // Preserve original error structure
      } else {
        // Fallback for non-structured errors
        throw new Error(errorMessage);
      }
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Xóa lỗi upload hiện tại
   */
  const clearUploadError = () => {
    setUploadError(null);
  };

  return {
    // State
    isUploading,
    uploadError,
    
    // Actions
    saveEkycVerification,
    clearUploadError,
  };
} 