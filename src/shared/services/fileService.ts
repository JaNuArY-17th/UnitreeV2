import { apiClient } from '@/shared/utils/axios';
import { API_ENDPOINTS } from '@/shared/config/env';

export interface GenerateUploadUrlRequest {
  file_type: string;
  file_name: string;
  file_size: number;
}

export interface GenerateUploadUrlResponse {
  status: boolean;
  message: string;
  data: {
    upload_url: string;
    file_key: string;
    file_url: string;
    file_type: string;
    file_id: string;
    file_size: number;
  };
  code: number;
}

export const fileService = {
  generateUploadUrl: async (request: GenerateUploadUrlRequest): Promise<GenerateUploadUrlResponse> => {
    const response = await apiClient.post<GenerateUploadUrlResponse>(
      API_ENDPOINTS.FILES.GENERATE_UPLOAD_URL,
      request
    );
    if (!response.data) {
      throw new Error('Failed to generate upload URL');
    }
    return response.data;
  },

  uploadFileToS3: async (uploadUrl: string, fileUri: string, fileType: string): Promise<void> => {
    // This would typically use a library like react-native-fs or fetch to upload to S3
    // For now, we'll use fetch as a placeholder
    const fileData = await fetch(fileUri);
    const blob = await fileData.blob();

    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type': fileType,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file to S3');
    }
  },
};