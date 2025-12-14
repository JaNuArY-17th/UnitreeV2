import { apiClient } from '../../../shared/utils/axios';
import { ekycDebugLog } from '../utils/ekycUtils';
import { EKYC_ERROR_CODES } from '../utils/constants';

// API Request/Response types for saveEkycInfo
export interface SaveEkycInfoRequest {
  full_name: string;
  gender: boolean; // true for male, false for female
  date_of_birth: string;
  nationality: string;
  date_of_issue: string;
  date_of_expiry: string;
  identification_number: string;
  permanent_address: string;
  contact_address: string;

  // Front card verification
  front_card_is_authentic: boolean;
  front_card_liveness_score: number;
  front_card_face_swapping_score: number;

  // Back card verification
  back_card_is_authentic: boolean;
  back_card_liveness_score: number;
  back_card_face_swapping_score: number;

  // Face verification
  face_is_live: boolean;
  face_liveness_score: number;
  face_liveness_message: string;
  face_age: number;
  face_gender: boolean; // true for male, false for female
  face_blur_score: number;
  face_eyes_open: boolean;
  face_is_masked: boolean;

  // Metadata
  verification_timestamp: string;
  challenge_code: string;
  server_version: string;
  verification_status: string;

  // File IDs
  front_file_id: string;
  back_file_id: string;
  near_face_file_id: string;
  far_face_file_id: string;
}

export interface SaveEkycInfoResponse {
  success: boolean;
  message: string;
  data?: any;
  code?: number;
}

// API endpoints
const EKYC_API_ENDPOINTS = {
  GET_TOKEN: 'iam/v1/ekyc/get-token',
  SAVE_EKYC_INFO: 'iam/v1/ekyc/save-ekyc-info',
} as const;

/**
 * eKYC API Service
 * Handles all eKYC-related API calls
 */
export class EkycApiService {
  private static instance: EkycApiService;

  private constructor() {}

  static getInstance(): EkycApiService {
    if (!EkycApiService.instance) {
      EkycApiService.instance = new EkycApiService();
    }
    return EkycApiService.instance;
  }

  /**
   * Get eKYC token from API
   */
  async getEkycToken(): Promise<string> {
    try {
      ekycDebugLog('EkycApiService', 'Getting eKYC token from API');

      const response = await apiClient.get<{
        success: boolean;
        data: string;
        message?: string;
      }>(EKYC_API_ENDPOINTS.GET_TOKEN);

      if (response.data && response.data.success && response.data.data) {
        ekycDebugLog('EkycApiService', 'eKYC token received successfully');
        return response.data.data;
      }

      ekycDebugLog('EkycApiService', 'Invalid API response for eKYC token', response.data, true);
      throw {
        success: false,
        message: 'Không thể lấy token eKYC. Phản hồi từ API không hợp lệ.',
        code: EKYC_ERROR_CODES.TOKEN_ERROR,
        type: 'NETWORK'
      };
    } catch (error: any) {
      ekycDebugLog('EkycApiService', 'Failed to get eKYC token', error, true);
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 401) {
          throw {
            success: false,
            message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
            code: EKYC_ERROR_CODES.UNAUTHORIZED,
            type: 'AUTH'
          };
        } else if (status === 403) {
          throw {
            success: false,
            message: 'Bạn không có quyền truy cập tính năng eKYC.',
            code: EKYC_ERROR_CODES.FORBIDDEN,
            type: 'AUTH'
          };
        } else if (status >= 500) {
          throw {
            success: false,
            message: 'Lỗi máy chủ. Vui lòng thử lại sau.',
            code: EKYC_ERROR_CODES.SERVER_ERROR,
            type: 'NETWORK'
          };
        }
        
        throw {
          success: false,
          message: data?.message || 'Không thể lấy token eKYC.',
          code: EKYC_ERROR_CODES.TOKEN_ERROR,
          type: 'NETWORK'
        };
      }
      
      throw {
        success: false,
        message: error.message || 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.',
        code: EKYC_ERROR_CODES.NETWORK_ERROR,
        type: 'NETWORK'
      };
    }
  }

  /**
   * Save eKYC information to server
   */
  async saveEkycInfo(data: SaveEkycInfoRequest): Promise<SaveEkycInfoResponse> {
    try {
      ekycDebugLog('EkycApiService', 'saveEkycInfo - Starting API call', {
        hasData: !!data,
        dataKeys: Object.keys(data || {}),
      });

      const response = await apiClient.post<SaveEkycInfoResponse>(
        EKYC_API_ENDPOINTS.SAVE_EKYC_INFO, 
        data
      );

      if (response.data) {
        ekycDebugLog('EkycApiService', 'saveEkycInfo - API call successful', {
          success: response.data.success,
          message: response.data.message,
          code: response.data.code,
        });
        return response.data;
      }

      throw {
        success: false,
        message: 'Không nhận được phản hồi từ máy chủ.',
        code: EKYC_ERROR_CODES.SERVER_ERROR,
      };
    } catch (error: any) {
      ekycDebugLog('EkycApiService', 'saveEkycInfo - API call failed', error, true);
      
      if (error.response) {
        const status = error.response.status;
        const responseData = error.response.data;
        
        ekycDebugLog('EkycApiService', 'saveEkycInfo - HTTP Error Response', {
          status,
          responseData,
          message: responseData?.message,
        }, true);
        
        if (status === 400) {
          // Handle specific 400 errors - user already verified, validation issues, etc.
          const serverMessage = responseData?.message || '';
          
          if (serverMessage.includes('Người dùng đã được xác minh') ||
              serverMessage.includes('không thể cập nhật EKYC') ||
              serverMessage.includes('Người dùng đã có ekyc') ||
              serverMessage.includes('đã có ekyc') ||
              serverMessage.toLowerCase().includes('already verified')) {
            throw {
              success: false,
              message: 'Bạn đã hoàn thành xác minh danh tính trước đó.',
              code: 'USER_ALREADY_VERIFIED',
              originalMessage: serverMessage,
            };
          } else {
            throw {
              success: false,
              message: serverMessage || 'Dữ liệu gửi lên không hợp lệ.',
              code: EKYC_ERROR_CODES.VALIDATION_ERROR,
              originalMessage: serverMessage,
            };
          }
        } else if (status === 401) {
          throw {
            success: false,
            message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
            code: EKYC_ERROR_CODES.UNAUTHORIZED,
            originalMessage: responseData?.message,
          };
        } else if (status === 403) {
          throw {
            success: false,
            message: 'Bạn không có quyền lưu thông tin eKYC.',
            code: EKYC_ERROR_CODES.FORBIDDEN,
            originalMessage: responseData?.message,
          };
        } else if (status === 422) {
          throw {
            success: false,
            message: responseData?.message || 'Dữ liệu không hợp lệ.',
            code: EKYC_ERROR_CODES.VALIDATION_ERROR,
            errors: responseData?.errors,
            originalMessage: responseData?.message,
          };
        } else if (status >= 500) {
          throw {
            success: false,
            message: 'Lỗi máy chủ. Vui lòng thử lại sau.',
            code: EKYC_ERROR_CODES.SERVER_ERROR,
            originalMessage: responseData?.message,
          };
        }

        // Default case for other HTTP errors
        throw {
          success: false,
          message: responseData?.message || 'Không thể lưu thông tin eKYC.',
          code: EKYC_ERROR_CODES.SAVE_ERROR,
          originalMessage: responseData?.message,
        };
      }
      
      // Check if the network error contains eKYC already verified message
      const errorMessage = error.message || '';
      if (errorMessage.includes('Người dùng đã có ekyc') ||
          errorMessage.includes('đã có ekyc')) {
        throw {
          success: false,
          message: 'Bạn đã hoàn thành xác minh danh tính trước đó.',
          code: 'USER_ALREADY_VERIFIED',
          originalMessage: errorMessage,
        };
      }
      
      throw {
        success: false,
        message: error.message || 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.',
        code: EKYC_ERROR_CODES.NETWORK_ERROR,
      };
    }
  }
}

// Export singleton instance
export const ekycApiService = EkycApiService.getInstance();

// Export standalone functions for backward compatibility
export const getEkycToken = () => ekycApiService.getEkycToken();
export const saveEkycInfo = (data: SaveEkycInfoRequest) => ekycApiService.saveEkycInfo(data);
