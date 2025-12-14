import { useMutation } from '@tanstack/react-query';
import { profileService } from '../services/profileService';
import { fileService } from '@/shared/services';
import type {
  UpdateAvatarRequest,
  UpdatePhoneNumberRequest,
  VerifyUpdatePhoneNumberRequest,
  UpdateEmailRequest,
  VerifyUpdateEmailRequest,
} from '../types/profile';
import type { GenerateUploadUrlRequest } from '@/shared/services/fileService';

export function useUpdateAvatar() {
  return useMutation({
    mutationFn: (data: UpdateAvatarRequest) => profileService.updateAvatar(data),
  });
}

export function useGenerateUploadUrl() {
  return useMutation({
    mutationFn: (data: GenerateUploadUrlRequest) => fileService.generateUploadUrl(data),
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: () => profileService.deleteAccount(),
  });
}

export function useUpdatePhoneNumber() {
  return useMutation({
    mutationFn: (data: UpdatePhoneNumberRequest) => profileService.updatePhoneNumber(data),
  });
}

export function useVerifyUpdatePhoneNumber() {
  return useMutation({
    mutationFn: (data: VerifyUpdatePhoneNumberRequest) => profileService.verifyUpdatePhoneNumber(data),
  });
}

export function useResendUpdatePhoneNumber() {
  return useMutation({
    mutationFn: () => profileService.resendUpdatePhoneNumber(),
  });
}

export function useUpdateEmail() {
  return useMutation({
    mutationFn: (data: UpdateEmailRequest) => profileService.updateEmail(data),
  });
}

export function useVerifyUpdateEmail() {
  return useMutation({
    mutationFn: (data: VerifyUpdateEmailRequest) => profileService.verifyUpdateEmail(data),
  });
}

export function useResendUpdateEmail() {
  return useMutation({
    mutationFn: () => profileService.resendeUpdateEmail(),
  });
}
