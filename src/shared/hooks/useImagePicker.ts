import { useState } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType, ImageLibraryOptions, CameraOptions, PhotoQuality } from 'react-native-image-picker';
import { useTranslation } from '@/shared/hooks/useTranslation';

export interface SelectedImage {
    uri: string;
    type: string;
    fileName: string;
    fileSize: number;
    width: number;
    height: number;
    base64?: string;
}

export interface ImagePickerOptions {
    mediaType?: MediaType;
    includeBase64?: boolean;
    maxHeight?: number;
    maxWidth?: number;
    quality?: PhotoQuality;
    selectionLimit?: number;
}

export interface UseImagePickerReturn {
    pickFromCamera: (options?: ImagePickerOptions) => Promise<SelectedImage | null>;
    pickFromGallery: (options?: ImagePickerOptions) => Promise<SelectedImage | null>;
    showPickerOptions: (options?: ImagePickerOptions) => Promise<SelectedImage | null>;
    isLoading: boolean;
    error: string | null;
    clearError: () => void;
}

export const useImagePicker = (): UseImagePickerReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation('profile');

    const clearError = () => setError(null);

    const requestPermissions = async (type: 'camera' | 'library'): Promise<boolean> => {
        if (Platform.OS !== 'android') return true;

        try {
            if (type === 'camera') {
                const cameraGranted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: t('avatar.cameraPermissionTitle', 'Camera Permission'),
                        message: t('avatar.cameraPermissionMessage', 'App needs camera access to take photos'),
                        buttonPositive: t('common.ok', 'OK'),
                        buttonNegative: t('common.cancel', 'Cancel'),
                    }
                );

                const storageGranted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: t('avatar.storagePermissionTitle', 'Storage Permission'),
                        message: t('avatar.storagePermissionMessage', 'App needs storage access to save photos'),
                        buttonPositive: t('common.ok', 'OK'),
                        buttonNegative: t('common.cancel', 'Cancel'),
                    }
                );

                return cameraGranted === PermissionsAndroid.RESULTS.GRANTED &&
                    storageGranted === PermissionsAndroid.RESULTS.GRANTED;
            } else {
                // For Android 13+ (API 33+), Photo Picker handles permissions internally
                if (Platform.Version >= 33) {
                    return true;
                } else {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                        {
                            title: t('avatar.galleryPermissionTitle', 'Gallery Permission'),
                            message: t('avatar.galleryPermissionMessage', 'App needs access to your photos'),
                            buttonPositive: t('common.ok', 'OK'),
                            buttonNegative: t('common.cancel', 'Cancel'),
                        }
                    );
                    return granted === PermissionsAndroid.RESULTS.GRANTED;
                }
            }
        } catch (err) {
            console.warn('Permission request failed:', err);
            return false;
        }
    };

    const processImagePickerResponse = (response: ImagePickerResponse): SelectedImage | null => {
        if (response.didCancel) {
            return null;
        }

        if (response.errorMessage) {
            throw new Error(response.errorMessage);
        }

        if (response.assets && response.assets[0]) {
            const asset = response.assets[0];
            return {
                uri: asset.uri!,
                type: asset.type || 'image/jpeg',
                fileName: asset.fileName || `image_${Date.now()}.jpg`,
                fileSize: asset.fileSize || 0,
                width: asset.width || 0,
                height: asset.height || 0,
                base64: asset.base64,
            };
        }

        return null;
    };

    const pickFromCamera = async (options: ImagePickerOptions = {}): Promise<SelectedImage | null> => {
        try {
            setIsLoading(true);
            setError(null);

            const hasPermission = await requestPermissions('camera');
            if (!hasPermission) {
                throw new Error(t('avatar.cameraPermissionDenied', 'Camera permission denied'));
            }

            const cameraOptions: CameraOptions = {
                mediaType: options.mediaType || 'photo',
                includeBase64: options.includeBase64 || false,
                maxHeight: options.maxHeight || 2048,
                maxWidth: options.maxWidth || 2048,
                quality: options.quality || 0.8,
                // storageOptions: {
                //   skipBackup: true,
                //   path: 'images',
                //   cameraRoll: true,
                // },
                includeExtra: true,
            };

            const response = await launchCamera(cameraOptions);
            return processImagePickerResponse(response);

        } catch (err: any) {
            const errorMessage = err.message || t('avatar.cameraError', 'Failed to open camera');
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const pickFromGallery = async (options: ImagePickerOptions = {}): Promise<SelectedImage | null> => {
        try {
            setIsLoading(true);
            setError(null);

            const hasPermission = await requestPermissions('library');
            if (!hasPermission) {
                throw new Error(t('avatar.galleryPermissionDenied', 'Gallery permission denied'));
            }

            const galleryOptions: ImageLibraryOptions = {
                mediaType: options.mediaType || 'photo',
                includeBase64: options.includeBase64 || false,
                maxHeight: options.maxHeight || 2048,
                maxWidth: options.maxWidth || 2048,
                quality: options.quality || 0.8,
                selectionLimit: options.selectionLimit || 1,
                includeExtra: true,
                // Use Android Photo Picker for Android 13+
                ...(Platform.OS === 'android' && Platform.Version >= 33 && {
                    requestPhotoPicker: true,
                }),
            };

            const response = await launchImageLibrary(galleryOptions);
            return processImagePickerResponse(response);

        } catch (err: any) {
            const errorMessage = err.message || t('avatar.galleryError', 'Failed to open gallery');
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const showPickerOptions = async (options: ImagePickerOptions = {}): Promise<SelectedImage | null> => {
        return new Promise((resolve) => {
            Alert.alert(
                t('avatar.selectSource', 'Select Image Source'),
                t('avatar.selectSourceMessage', 'Choose where to get the image from'),
                [
                    {
                        text: t('avatar.camera', 'Camera'),
                        onPress: async () => {
                            try {
                                const result = await pickFromCamera(options);
                                resolve(result);
                            } catch (error) {
                                resolve(null);
                            }
                        },
                    },
                    {
                        text: t('avatar.gallery', 'Gallery'),
                        onPress: async () => {
                            try {
                                const result = await pickFromGallery(options);
                                resolve(result);
                            } catch (error) {
                                resolve(null);
                            }
                        },
                    },
                    {
                        text: t('common.cancel', 'Cancel'),
                        style: 'cancel',
                        onPress: () => resolve(null),
                    },
                ],
                { cancelable: true }
            );
        });
    };

    return {
        pickFromCamera,
        pickFromGallery,
        showPickerOptions,
        isLoading,
        error,
        clearError,
    };
};