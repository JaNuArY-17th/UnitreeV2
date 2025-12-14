import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/types';
import { useEkycUpload } from '../hooks/useEkycUpload';
import { parseOcrData } from '../services/ekycService';
import { colors, spacing } from '@/shared/themes';
import { VerifiedData, ContactData, UserInfoRouteParams } from '../types/userInfo';
import { formatDateToYYYYMMDD, checkInvalidOcrData, getDefaultIssueDateString, ekycDebugLog, createFileFromPath } from '../utils/ekycUtils';
import { Button } from '@/shared/components/base';
import { useAlert } from '@/shared/providers/AlertProvider';
import { useBank } from '@/features/banks/hooks/useBank';
import { useQueryClient } from '@tanstack/react-query';
import { userProfileQueryKeys } from '@/features/authentication/hooks/useUserProfile';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function UserInfoScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList & { UserInfo: UserInfoRouteParams }, 'UserInfo'>>();
  const { saveEkycVerification } = useEkycUpload();
  const { showAlert } = useAlert();
  const { checkBankAccount, chooseAccountNumber } = useBank();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRetaking, setIsRetaking] = useState(false);
  const [isBankAccountProcessing, setIsBankAccountProcessing] = useState(false);

  const ekycResult = route.params?.ekycResult;

  // Get OCR errors from route params
  const ocrErrors = ekycResult?.ocrErrors || [];
  const hasOcrErrors = ocrErrors.length > 0;

  // Lấy thông tin từ ekycResult thông qua parseOcrData
  const parsedOcrData = ekycResult ? parseOcrData(ekycResult) : {
    fullName: '',
    gender: 'Nam',
    dateOfBirth: '',
    nationality: 'Việt Nam',
    idNumber: '',
    address: '',
    ocrErrors: [],
  };

  // Split the state into verified and contact data
  const [verifiedData] = useState<VerifiedData>({
    fullName: parsedOcrData.fullName,
    gender: parsedOcrData.gender,
    dateOfBirth: parsedOcrData.dateOfBirth,
    nationality: parsedOcrData.nationality,
    idNumber: parsedOcrData.idNumber,
    address: parsedOcrData.address,
  });

  const [contactData, setContactData] = useState<ContactData>({
    contactAddress: parsedOcrData.address,
    phoneNumber: '',
    email: '',
    useSameAddress: true,
  });

  // Check if any required OCR data is missing
  const hasInvalidOcrData = checkInvalidOcrData(verifiedData);

  // Effect to update contact address when useSameAddress changes
  useEffect(() => {
    if (contactData.useSameAddress) {
      setContactData((prev: ContactData) => ({ ...prev, contactAddress: verifiedData.address }));
    }
  }, [contactData.useSameAddress, verifiedData.address]);

  // Effect to prevent navigation loops
  useEffect(() => {
    if (isRetaking) {
      setIsRetaking(false);
    }
  }, [route.params, isRetaking]);

  const handleRetakeEkyc = () => {
    if (isRetaking) {
      return; // Prevent multiple retakes
    }

    setIsRetaking(true);
    navigation.replace('EkycCapture', { isRetake: true });
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    // Check for invalid OCR data before proceeding
    if (hasInvalidOcrData || hasOcrErrors) {
      showAlert({
        title: 'Thông tin không hợp lệ',
        message: 'Một số thông tin xác thực bị thiếu hoặc không hợp lệ. Vui lòng chụp lại giấy tờ.',
        buttons: [
          {
            text: 'Chụp lại',
            onPress: handleRetakeEkyc,
          },
          {
            text: 'Hủy',
            style: 'cancel',
          },
        ]
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (ekycResult) {
        try {
          // Tạo helper function để tạo file object từ đường dẫn ảnh
          const createImageFile = (imagePath?: string, fileName: string = 'image.jpg') => {
            if (!imagePath) {
              console.log(`🔍 [EKYC-SUBMIT] No image path for ${fileName}`);
              return null;
            }

            console.log(`🔍 [EKYC-SUBMIT] Creating file object for ${fileName}: ${imagePath}`);
            return createFileFromPath(imagePath, fileName);
          };
          // Tạo file objects từ đường dẫn ảnh từ SDK
          // Kiểm tra tất cả các tên path có thể có từ SDK
          const frontCardImage = createImageFile(
            ekycResult.imagePaths?.frontPath || ekycResult.imagePaths?.frontCardPath,
            'front_card.jpg'
          );
          const backCardImage = createImageFile(
            ekycResult.imagePaths?.backPath || ekycResult.imagePaths?.backCardPath,
            'back_card.jpg'
          );
          const nearFaceImage = createImageFile(
            ekycResult.imagePaths?.faceNearPath || ekycResult.imagePaths?.facePath,
            'face_near.jpg'
          );
          const farFaceImage = createImageFile(
            ekycResult.imagePaths?.faceFarPath,
            'face_far.jpg'
          );

          // Debug log để kiểm tra paths
          console.log('🔍 [EKYC-SUBMIT] Available image paths:', {
            frontPath: ekycResult.imagePaths?.frontPath,
            frontCardPath: ekycResult.imagePaths?.frontCardPath,
            backPath: ekycResult.imagePaths?.backPath,
            backCardPath: ekycResult.imagePaths?.backCardPath,
            faceNearPath: ekycResult.imagePaths?.faceNearPath,
            facePath: ekycResult.imagePaths?.facePath,
            faceFarPath: ekycResult.imagePaths?.faceFarPath,
          });

          // Kiểm tra xem có ít nhất một ảnh để upload không
          const hasAnyImage = frontCardImage || backCardImage || nearFaceImage || farFaceImage;

          if (!hasAnyImage) {
            console.error('🔍 [EKYC-SUBMIT] No images available for upload');
            throw new Error('Không tìm thấy hình ảnh để tải lên. Vui lòng thực hiện lại eKYC.');
          }

          // Log thông tin về các ảnh có sẵn
          console.log('🔍 [EKYC-SUBMIT] Processing eKYC data for upload', {
            hasFrontCard: !!frontCardImage,
            hasBackCard: !!backCardImage,
            hasNearFace: !!nearFaceImage,
            hasFarFace: !!farFaceImage,
          });

          // Format dates to YYYY-MM-DD
          const formattedDateOfBirth = formatDateToYYYYMMDD(verifiedData.dateOfBirth);
          const formattedDateOfExpiry = formatDateToYYYYMMDD(ekycResult.ocrData?.doe || '');
          const formattedDateOfIssue = formatDateToYYYYMMDD(ekycResult.ocrData?.doi || '');

          if (!formattedDateOfBirth) {
            throw new Error('Định dạng ngày sinh không hợp lệ. Vui lòng thực hiện lại eKYC.');
          }

          // Force valid date format for API call
          const validDateOfBirth = /^\d{4}-\d{2}-\d{2}$/.test(formattedDateOfBirth)
            ? formattedDateOfBirth
            : '1990-01-01';

          const validDateOfExpiry = /^\d{4}-\d{2}-\d{2}$/.test(formattedDateOfExpiry)
            ? formattedDateOfExpiry
            : '2030-01-01';

          // Xử lý đặc biệt cho dateOfIssue
          let validDateOfIssue;

          // Nếu formattedDateOfIssue trống hoặc không đúng định dạng, sử dụng giá trị mặc định (ngày hiện tại - 5 năm)
          if (!formattedDateOfIssue || !formattedDateOfIssue.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(formattedDateOfIssue)) {
            validDateOfIssue = getDefaultIssueDateString();
            ekycDebugLog('UserInfoScreen', 'Using default issue date', {
              original: ekycResult.ocrData?.doi,
              formatted: formattedDateOfIssue,
              defaultValue: validDateOfIssue
            });
          } else {
            validDateOfIssue = formattedDateOfIssue;
          }

          const userData = {
            documentVerification: {
              personalInfo: {
                fullName: ekycResult.ocrData?.name || '',
                gender: ekycResult.ocrData?.sex || '',
                dateOfBirth: validDateOfBirth,
                dateOfExpiry: validDateOfExpiry,
                dateOfIssue: validDateOfIssue,
                nationality: ekycResult.ocrData?.nationality || '',
                identificationNumber: ekycResult.ocrData?.id || '',
                permanentAddress: ekycResult.ocrData?.address ? ekycResult.ocrData.address.replace(/\n/g, ' ').trim() : '',
                contactAddress: contactData.useSameAddress ?
                  (ekycResult.ocrData?.address ? ekycResult.ocrData.address.replace(/\n/g, ' ').trim() : '') :
                  contactData.contactAddress,
              },
              verification: {
                frontCard: {
                  isAuthentic: ekycResult.frontCardLiveness?.object?.liveness === 'success',
                  livenessScore: 1 - (ekycResult.frontCardLiveness?.object?.fake_liveness_prob || 0), // Convert fake prob to liveness score
                  faceSwappingScore: ekycResult.frontCardLiveness?.object?.face_swapping_prob || 0,
                  imageData: frontCardImage,
                },
                backCard: {
                  isAuthentic: ekycResult.backCardLiveness?.object?.liveness === 'success',
                  livenessScore: 1 - (ekycResult.backCardLiveness?.object?.fake_liveness_prob || 0), // Convert fake prob to liveness score
                  faceSwappingScore: ekycResult.backCardLiveness?.object?.face_swapping_prob || 0,
                  imageData: backCardImage,
                },
              },
            },
            faceVerification: {
              isLive: ekycResult.faceLiveness?.object?.liveness === 'success',
              livenessScore: ekycResult.faceLiveness?.object?.liveness_prob || 0,
              livenessMessage: ekycResult.faceLiveness?.object?.liveness_msg || 'Face is live and authentic',
              age: Math.max(0, ekycResult.faceLiveness?.object?.age || 30),
              gender: ekycResult.faceLiveness?.object?.gender || ekycResult.ocrData?.sex || 'Nam',
              blurScore: Math.max(0, Math.min(1, ekycResult.faceLiveness?.object?.blur_face_score || 0)),
              eyesOpen: ekycResult.faceLiveness?.object?.is_eye_open ?
                String(ekycResult.faceLiveness?.object?.is_eye_open) === 'yes' ||
                Boolean(ekycResult.faceLiveness?.object?.is_eye_open) === true : false,
              isMasked: ekycResult.maskCheck?.object?.masked ?
                String(ekycResult.maskCheck?.object?.masked) === 'yes' ||
                Boolean(ekycResult.maskCheck?.object?.masked) === true : false,
              nearImageData: nearFaceImage,
              farImageData: farFaceImage,
            },
            metadata: {
              verificationTimestamp: new Date().toISOString(),
              challengeCode: ekycResult.frontCardLiveness?.challengeCode || 'CHALLENGE123',
              serverVersion: ekycResult.frontCardLiveness?.server_version || '1.0.0',
              status: 'VERIFIED',
            },
          };

          // Chỉ lưu trữ eKYC data khi đã xác thực thành công
          if (ekycResult.faceLiveness?.object?.liveness === 'success' &&
            ekycResult.frontCardLiveness?.object?.liveness === 'success') {

            try {
              // Sử dụng hook để lưu trữ dữ liệu eKYC
              await saveEkycVerification(ekycResult, userData);
              console.log('🔍 [EKYC-SUBMIT] eKYC data saved successfully');

              // Invalidate user profile cache to refresh verification status
              console.log('🔍 [EKYC-SUBMIT] Invalidating user profile cache...');
              await queryClient.invalidateQueries({ queryKey: userProfileQueryKeys.all });
              console.log('🔍 [EKYC-SUBMIT] User profile cache invalidated');

              // Start bank account flow after successful eKYC
              console.log('🔍 [EKYC-SUBMIT] Starting bank account flow...');
              await handleBankAccountFlow();
              console.log('🔍 [EKYC-SUBMIT] Bank account flow completed');
              return; // Thoát sớm
            } catch (error: any) {
              console.error('🔍 [EKYC-SUBMIT] API Error:', error);

              // Handle specific server errors with appropriate alerts
              const errorMessage = error?.message || '';

              if (errorMessage.includes('Người dùng đã được xác minh') ||
                errorMessage.includes('không thể cập nhật EKYC') ||
                errorMessage.includes('already verified') ||
                errorMessage.includes('Người dùng đã có ekyc') ||
                errorMessage.includes('đã có ekyc') ||
                error?.code === 'USER_ALREADY_VERIFIED') {
                // User already verified, proceed to bank account flow
                console.log('🔍 [EKYC-SUBMIT] User already verified, proceeding to bank account flow');

                // Invalidate user profile cache to refresh verification status
                console.log('🔍 [EKYC-SUBMIT] Invalidating user profile cache (already verified)...');
                await queryClient.invalidateQueries({ queryKey: userProfileQueryKeys.all });

                await handleBankAccountFlow();
                return;
              } else if (errorMessage.includes('Phiên đăng nhập đã hết hạn') ||
                errorMessage.includes('unauthorized') ||
                error?.code === 'UNAUTHORIZED') {
                showAlert({
                  title: 'Phiên đăng nhập hết hạn',
                  message: 'Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại.',
                  buttons: [{
                    text: 'Đăng nhập lại',
                    onPress: () => {
                      // Navigate to login or restart app
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Login' as any }],
                      });
                    }
                  }]
                });
                return;
              } else if (errorMessage.includes('Dữ liệu không hợp lệ') ||
                errorMessage.includes('validation') ||
                error?.code === 'VALIDATION_ERROR') {
                showAlert({
                  title: 'Dữ liệu không hợp lệ',
                  message: 'Thông tin eKYC không đúng định dạng. Vui lòng thực hiện lại quá trình xác minh.',
                  buttons: [
                    {
                      text: 'Thực hiện lại',
                      onPress: handleRetakeEkyc,
                    },
                    {
                      text: 'Hủy',
                      style: 'cancel',
                    },
                  ]
                });
                return;
              } else if (errorMessage.includes('Lỗi máy chủ') ||
                errorMessage.includes('server error') ||
                error?.code === 'SERVER_ERROR') {
                showAlert({
                  title: 'Lỗi hệ thống',
                  message: 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau ít phút.',
                  buttons: [
                    {
                      text: 'Thử lại',
                      onPress: () => setIsSubmitting(false), // Allow retry
                    },
                    {
                      text: 'Hủy',
                      style: 'cancel',
                    },
                  ]
                });
                return;
              } else if (errorMessage.includes('Lỗi kết nối') ||
                errorMessage.includes('network') ||
                error?.code === 'NETWORK_ERROR') {
                showAlert({
                  title: 'Lỗi kết nối',
                  message: 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.',
                  buttons: [
                    {
                      text: 'Thử lại',
                      onPress: () => setIsSubmitting(false), // Allow retry
                    },
                    {
                      text: 'Hủy',
                      style: 'cancel',
                    },
                  ]
                });
                return;
              }

              // For other errors, re-throw to be handled by outer catch
              throw error;
            }
          } else {
            console.log('🔍 [EKYC-SUBMIT] Skipping eKYC data upload - Liveness check failed');
          }
        } catch (imageProcessError: any) {
          console.error('🔍 [EKYC-SUBMIT] Error processing images:', imageProcessError);

          // Check if this is the specific error about user already having ID information
          const errorMessage = imageProcessError?.message || '';
          if (errorMessage.includes('Người dùng này đã có thông tin căn cước công dân') ||
            errorMessage.includes('Người dùng đã có ekyc') ||
            errorMessage.includes('đã có ekyc') ||
            imageProcessError?.code === 'USER_ALREADY_VERIFIED') {
            // If user already has ID information, start bank account flow
            console.log('🔍 [EKYC-SUBMIT] User already has ID info, starting bank account flow...');

            // Invalidate user profile cache to refresh verification status
            console.log('🔍 [EKYC-SUBMIT] Invalidating user profile cache (ID exists)...');
            await queryClient.invalidateQueries({ queryKey: userProfileQueryKeys.all });

            await handleBankAccountFlow();
            console.log('🔍 [EKYC-SUBMIT] Bank account flow completed (ID exists)');
            return;
          }

          showAlert({
            title: 'Lỗi xử lý hình ảnh',
            message: imageProcessError.message || 'Không thể xử lý hình ảnh eKYC. Vui lòng thực hiện lại.',
            buttons: [
              {
                text: 'Chụp lại',
                onPress: handleRetakeEkyc,
              },
              {
                text: 'Hủy',
                style: 'cancel',
              },
            ]
          });
          return;
        }
      }

      await handleBankAccountFlow();
    } catch (error: any) {
      console.error('🔍 [EKYC-SUBMIT] Error storing eKYC verification:', error);

      // Check if this is the specific error about user already having ID information
      const errorMessage = error?.message || '';
      if (errorMessage.includes('Người dùng này đã có thông tin căn cước công dân') ||
        errorMessage.includes('Người dùng đã có ekyc') ||
        errorMessage.includes('đã có ekyc') ||
        error?.code === 'USER_ALREADY_VERIFIED') {
        // If user already has ID information, start bank account flow
        console.log('🔍 [EKYC-SUBMIT] User already has ID info (outer catch), starting bank account flow...');

        // Invalidate user profile cache to refresh verification status
        console.log('🔍 [EKYC-SUBMIT] Invalidating user profile cache (outer catch)...');
        await queryClient.invalidateQueries({ queryKey: userProfileQueryKeys.all });

        await handleBankAccountFlow();
        console.log('🔍 [EKYC-SUBMIT] Bank account flow completed (outer catch)');
      } else {
        // For all other errors, show the alert
        showAlert({
          title: 'Lỗi xử lý',
          message: 'Không thể lưu trữ thông tin xác minh. Vui lòng thử lại.',
          buttons: [{ text: 'OK' }]
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle bank account flow after eKYC success
  const handleBankAccountFlow = async () => {
    try {
      setIsBankAccountProcessing(true);
      console.log('🏦 [EKYC-BANK] Starting bank account flow...');

      // Step 1: Check if user already has a bank account
      try {
        const bankCheckResult = await checkBankAccount();
        console.log('🏦 [EKYC-BANK] Bank account check result:', bankCheckResult);

        // If check is successful, user already has an account
        // Navigate to BankAccountScreen to show account details
        console.log('🏦 [EKYC-BANK] User already has bank account, navigating to BankAccountScreen');

        setIsBankAccountProcessing(false);

        // Navigate directly to BankAccountScreen
        console.log('🔍 [EKYC-BANK] Navigating to BankAccountScreen (existing account)...');
        navigation.reset({
          index: 1,
          routes: [
            { name: 'Main' },
            { name: 'BankAccount' }
          ],
        });
        console.log('🔍 [EKYC-BANK] Navigation completed (existing account)');
        return;

      } catch (checkError: any) {
        console.log('🏦 [EKYC-BANK] User does not have bank account, will create one');
        console.log('🏦 [EKYC-BANK] Check error:', checkError);

        // Step 2: If user doesn't have account, create one by choosing account number
        try {
          const chooseResult = await chooseAccountNumber();
          console.log('🏦 [EKYC-BANK] Account number chosen successfully:', chooseResult);

          // Navigate to BankAccountScreen to show the new account
          console.log('🏦 [EKYC-BANK] New account created, navigating to BankAccountScreen');

          setIsBankAccountProcessing(false);

          // Navigate directly to BankAccountScreen
          console.log('🔍 [EKYC-BANK] Navigating to BankAccountScreen (new account)...');
          navigation.reset({
            index: 1,
            routes: [
              { name: 'Main' },
              { name: 'BankAccount' }
            ],
          });
          console.log('🔍 [EKYC-BANK] Navigation completed (new account)');
          return;

        } catch (chooseError: any) {
          console.error('🔴 [EKYC-BANK] Failed to choose account number:', chooseError);

          setIsBankAccountProcessing(false);
          // If account creation fails, show error and navigate to home
          showAlert({
            title: 'Thông báo',
            message: 'Không thể tạo tài khoản ngân hàng lúc này. Bạn có thể tạo sau trong phần cài đặt.',
            buttons: [
              {
                text: 'OK',
                onPress: () => handleNavigateToHome(),
              },
            ],
          });
          return;
        }
      }

    } catch (error: any) {
      console.error('🔴 [EKYC-BANK] Unexpected error in bank account flow:', error);

      setIsBankAccountProcessing(false);
      // For any unexpected errors, just navigate to home
      handleNavigateToHome();
    }
  };

  // Navigation về trang chủ sau khi hoàn thành eKYC
  const handleNavigateToHome = async () => {
    // Force invalidate user profile để HomeScreen luôn có data mới
    console.log('🔄 [EKYC] Invalidating user profile before navigate to home...');
    await queryClient.invalidateQueries({
      queryKey: userProfileQueryKeys.all,
      refetchType: 'active' // Force refetch active queries
    });

    // Reset navigation stack và đặt trang chủ là màn hình đầu tiên
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'Main',
        },
      ],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView style={styles.formContainer}>
          {/* Simple display of verified information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin xác thực</Text>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Họ và tên:</Text>
              <Text style={styles.value}>{verifiedData.fullName}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Số CCCD:</Text>
              <Text style={styles.value}>{verifiedData.idNumber}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Ngày sinh:</Text>
              <Text style={styles.value}>{verifiedData.dateOfBirth}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Giới tính:</Text>
              <Text style={styles.value}>{verifiedData.gender}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Địa chỉ:</Text>
              <Text style={styles.value}>{verifiedData.address}</Text>
            </View>
          </View>


          {hasInvalidOcrData || hasOcrErrors ? (
            <View style={styles.errorSection}>
              <Text style={styles.errorText}>
                Một số thông tin không hợp lệ. Vui lòng chụp lại giấy tờ.
              </Text>
              <Button
                label="Chụp lại"
                onPress={handleRetakeEkyc}
                variant="outline"
              />
            </View>
          ) : (
            <Button
              label={
                isSubmitting
                  ? 'Đang xử lý...'
                  : isBankAccountProcessing
                    ? 'Đang thiết lập tài khoản...'
                    : 'Xác nhận thông tin'
              }
              onPress={handleSubmit}
              disabled={isSubmitting || isBankAccountProcessing}
              size="lg"
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    color: colors.text.primary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  label: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '600',
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  errorSection: {
    backgroundColor: '#ffebee',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
});
