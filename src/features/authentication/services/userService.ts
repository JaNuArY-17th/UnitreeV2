import { apiClient } from '@/shared/utils/axios';
import { API_ENDPOINTS } from '@/shared/config';
import type { UserFromAPI, MyDataActualResponse, AuthApiResponse } from '../types';

export class UserService {
    private static instance: UserService;

    private constructor() {}

    static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }

    /**
    * Get current user data from /iam/v1/users/my-data
    */
    async getMyData(): Promise<AuthApiResponse<UserFromAPI>> {
        try {
            const response = await apiClient.get<MyDataActualResponse>(
                API_ENDPOINTS.AUTH.CURRENT_USER
            );

            // The API returns user data directly in response.data.data, not in items array
            if (response.success && response.data?.data) {
                const userData = response.data.data;

                return {
                    success: true,
                    data: userData,
                    message: response.message,
                };
            }

            throw new Error('No user data found');
        } catch (error: any) {
            throw {
                success: false,
                message: error.message || 'Failed to get user data',
                errors: error.errors,
            };
        }
    }
}

export const userService = UserService.getInstance();
