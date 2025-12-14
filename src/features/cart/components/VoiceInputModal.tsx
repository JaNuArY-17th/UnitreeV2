import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  Alert,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import { Text, Button } from '@/shared/components/base';
import { colors, spacing, getFontFamily, FONT_WEIGHTS, dimensions } from '@/shared/themes';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { VoiceOrderIcon, Close } from '@/shared/assets/icons';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import Voice from '@react-native-voice/voice';
import {
  startListening,
  stopListening,
  getRecognitionLanguage,
  setRecognitionLanguage,
  addEventListener,
} from '@ascendtis/react-native-voice-to-text';
import BottomSheetModal from '@/shared/components/base/BottomSheetModal';
import type { CartItem, InvoiceItem } from '../types';
import { invoiceService } from '../services/invoiceService';
import { normalizeVoiceText } from '../utils/voiceTextNormalizer';

// Event names from the native module (Android only)
const VoiceToTextEvents = {
  START: 'onSpeechStart',
  BEGIN: 'onSpeechBegin',
  END: 'onSpeechEnd',
  ERROR: 'onSpeechError',
  RESULTS: 'onSpeechResults',
  PARTIAL_RESULTS: 'onSpeechPartialResults',
  VOLUME_CHANGED: 'onSpeechVolumeChanged',
  AUDIO_BUFFER: 'onSpeechAudioBuffer',
};

interface VoiceInputModalProps {
  visible: boolean;
  onClose: () => void;
  onProductAdded?: (product: Omit<CartItem, 'id'>) => void;
}

const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  visible,
  onClose,
  onProductAdded,
}) => {
  const { t } = useTranslation('cart');
  const [scaleAnim] = useState(new Animated.Value(1));
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [partialTranscript, setPartialTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [parsedProducts, setParsedProducts] = useState<InvoiceItem[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [silenceTimer, setSilenceTimer] = useState<number | null>(null);
  const [userRequestedStop, setUserRequestedStop] = useState(false);
  const [isProcessingTranscript, setIsProcessingTranscript] = useState(false);

  // Use refs to track latest values for event handlers
  const userRequestedStopRef = React.useRef(false);
  const isProcessingTranscriptRef = React.useRef(false);
  const isStartingRef = React.useRef(false); // Prevent multiple start calls
  const transcriptRef = React.useRef('');
  const partialTranscriptRef = React.useRef('');

  // Start silence timer (5 seconds)
  const startSilenceTimer = () => {
    // Clear existing timer
    if (silenceTimer) {
      clearTimeout(silenceTimer);
    }

    // Set new timer for 5 seconds
    const timer = setTimeout(() => {
      // Only process if still listening and not already processing
      if (isListening && !isProcessingTranscriptRef.current && !userRequestedStopRef.current) {
        console.log('⏰ Silence timeout - stopping listening and processing');
        userRequestedStopRef.current = true;
        setUserRequestedStop(true);

        // Stop listening
        Voice.stop().catch((err: any) => {
          console.log('Stop on timeout error:', err);
        });
      }
    }, 5000);

    setSilenceTimer(timer);
  };

  // Stop silence timer
  const stopSilenceTimer = () => {
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      setSilenceTimer(null);
    }
  };

  // Request microphone permission (Android)
  const requestMicrophonePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Quyền truy cập Microphone',
          message: 'Ứng dụng cần quyền truy cập microphone để nhận diện giọng nói',
          buttonPositive: 'Đồng ý',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // Parse product from transcript using API
  const parseProductFromTranscript = async (text: string): Promise<void> => {
    if (!text || text.trim().length === 0) {
      setIsParsing(false); // Clear loading if empty text
      return;
    }

    try {
      setError(null);

      // Normalize text before sending to server
      const normalizedText = normalizeVoiceText(text.trim());

      // Call invoice API - returns {itemsVoice: [...]}
      const response = await invoiceService.parseInvoice({ text: normalizedText });

      if (response?.itemsVoice && response.itemsVoice.length > 0) {
        response.itemsVoice.forEach((item) => {
          const newProduct: Omit<CartItem, 'id'> = {
            name: item.itemName,
            price: item.unitPrice,
            quantity: item.quantity,
            unit: item.unit,
            abbreviation: item.itemName.substring(0, 2).toUpperCase(),
            isVoiceItem: true, // Mark as voice item
          };

          onProductAdded?.(newProduct);
        });

        // Close modal after successfully adding products
        setIsParsing(false);
        setIsProcessingTranscript(false);
        onClose();
      } else {
        console.warn('⚠️ [Invoice API] No items returned');
        setParsedProducts([]);
        setError(t('voiceInput.noItemsRecognized'));
        setIsParsing(false);
      }
    } catch (err: any) {
      console.error('❌ [Invoice API] Error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Lỗi kết nối đến server';
      setError(errorMessage);
      setIsParsing(false);
      setIsProcessingTranscript(false);
    }
  };

  // Setup event listeners and language
  useEffect(() => {
    if (Platform.OS === 'ios') {
      // iOS: Use @react-native-voice/voice
      Voice.onSpeechStart = () => {
        console.log('🎤 [iOS] Voice started');
        setIsListening(true);
        setError(null);
        startSilenceTimer();
      };

      Voice.onSpeechEnd = () => {
        console.log('🛑 [iOS] Voice ended - userRequestedStopRef:', userRequestedStopRef.current, 'isProcessingTranscriptRef:', isProcessingTranscriptRef.current);

        stopSilenceTimer();

        const currentText = partialTranscriptRef.current || transcriptRef.current;
        console.log('📝 [iOS] Current text from refs:', currentText);

        if (userRequestedStopRef.current && !isProcessingTranscriptRef.current) {
          if (currentText.trim()) {
            console.log('📤 [iOS] Processing transcript on user/timeout stop:', currentText);
            isProcessingTranscriptRef.current = true;
            setIsProcessingTranscript(true);
            setIsParsing(true);

            parseProductFromTranscript(currentText).finally(() => {
              console.log('✅ [iOS] Processing complete, resetting states');
              userRequestedStopRef.current = false;
              isProcessingTranscriptRef.current = false;
              setIsListening(false);
              setUserRequestedStop(false);
              setIsProcessingTranscript(false);
            });
          } else {
            console.log('⚠️ [iOS] No transcript to process, resetting states');
            userRequestedStopRef.current = false;
            setIsListening(false);
            setUserRequestedStop(false);
          }
        } else {
          console.log('ℹ️ [iOS] Not user/timeout stop, resetting listening state');
          userRequestedStopRef.current = false;
          setIsListening(false);
          setUserRequestedStop(false);
        }
      };

      Voice.onSpeechError = (event: any) => {
        console.error('❌ [iOS] Voice error:', event);
        stopSilenceTimer();

        const errorMessage = (event.error?.message || event.error || '').toLowerCase();
        const shouldIgnore =
          errorMessage.includes('error 216') ||
          errorMessage.includes('no speech') ||
          errorMessage.includes('cancel') ||
          errorMessage.includes('already started');

        if (!shouldIgnore) {
          setError(event.error?.message || event.error || 'Lỗi nhận diện giọng nói');
        }

        setIsListening(false);
      };

      Voice.onSpeechResults = (event: any) => {
        const result = event.value?.[0] || '';
        console.log('📱 [iOS] Voice results:', result);

        transcriptRef.current = result;
        setTranscript(result);

        partialTranscriptRef.current = '';
        setPartialTranscript('');
      };

      Voice.onSpeechPartialResults = (event: any) => {
        const result = event.value?.[0] || '';
        console.log('📝 [iOS] Partial result:', result);

        partialTranscriptRef.current = result;
        setPartialTranscript(result);

        if (!userRequestedStopRef.current && !isProcessingTranscriptRef.current) {
          startSilenceTimer();
        }
      };
    } else {
      // Android: Use @ascendtis/react-native-voice-to-text
      const initLanguage = async () => {
        try {
          await setRecognitionLanguage('vi-VN');
          console.log('✅ [Android] Language set to Vietnamese (vi-VN)');
          const currentLang = await getRecognitionLanguage();
          console.log('📍 [Android] Current language:', currentLang);
        } catch (err) {
          console.error('❌ [Android] Failed to set language:', err);
        }
      };

      initLanguage();

      // Start listener
      const startListener = addEventListener(
        VoiceToTextEvents.START,
        () => {
          console.log('🎤 [Android] Voice started');
          setIsListening(true);
          setError(null);
          startSilenceTimer();
        }
      );

      // End listener
      const endListener = addEventListener(
        VoiceToTextEvents.END,
        () => {
          console.log('🛑 [Android] Voice ended - userRequestedStopRef:', userRequestedStopRef.current, 'isProcessingTranscriptRef:', isProcessingTranscriptRef.current);

          stopSilenceTimer();

          const currentText = partialTranscriptRef.current || transcriptRef.current;
          console.log('📝 [Android] Current text from refs:', currentText);

          if (userRequestedStopRef.current && !isProcessingTranscriptRef.current) {
            if (currentText.trim()) {
              console.log('📤 [Android] Processing transcript on user/timeout stop:', currentText);
              isProcessingTranscriptRef.current = true;
              setIsProcessingTranscript(true);
              setIsParsing(true);

              parseProductFromTranscript(currentText).finally(() => {
                console.log('✅ [Android] Processing complete, resetting states');
                userRequestedStopRef.current = false;
                isProcessingTranscriptRef.current = false;
                setIsListening(false);
                setUserRequestedStop(false);
                setIsProcessingTranscript(false);
              });
            } else {
              console.log('⚠️ [Android] No transcript to process, resetting states');
              userRequestedStopRef.current = false;
              setIsListening(false);
              setUserRequestedStop(false);
            }
          } else {
            console.log('ℹ️ [Android] Not user/timeout stop, resetting listening state');
            userRequestedStopRef.current = false;
            setIsListening(false);
            setUserRequestedStop(false);
          }
        }
      );

      // Error listener
      const errorListener = addEventListener(
        VoiceToTextEvents.ERROR,
        (event: any) => {
          console.error('❌ [Android] Voice error:', event);
          stopSilenceTimer();

          const errorMessage = (event.message || event.error || '').toLowerCase();
          const shouldIgnore =
            errorMessage.includes('ERROR_SPEECH_TIMEOUT'.toLowerCase()) ||
            errorMessage.includes('ERROR_NO_MATCH'.toLowerCase()) ||
            errorMessage.includes('no speech') ||
            errorMessage.includes('cancel') ||
            errorMessage.includes('request was cancel');

          if (!shouldIgnore) {
            setError(event.message || event.error || 'Lỗi nhận diện giọng nói');
          }

          setIsListening(false);
        }
      );

      // Results listener
      const resultsListener = addEventListener(
        VoiceToTextEvents.RESULTS,
        (event: any) => {
          const result = event.value || '';
          console.log('📱 [Android] Voice results:', result);

          transcriptRef.current = result;
          setTranscript(result);

          partialTranscriptRef.current = '';
          setPartialTranscript('');
        }
      );

      // Partial results listener
      const partialListener = addEventListener(
        VoiceToTextEvents.PARTIAL_RESULTS,
        (event: any) => {
          const result = event.value || '';
          console.log('📝 [Android] Partial result:', result);

          partialTranscriptRef.current = result;
          setPartialTranscript(result);

          if (!userRequestedStopRef.current && !isProcessingTranscriptRef.current) {
            startSilenceTimer();
          }
        }
      );

      // Cleanup for Android
      return () => {
        try {
          stopSilenceTimer();
          resultsListener?.remove();
          partialListener?.remove();
          startListener?.remove();
          endListener?.remove();
          errorListener?.remove();

          const stopPromise = stopListening();
          if (stopPromise && typeof stopPromise.catch === 'function') {
            stopPromise.catch((err: any) => {
              const errMsg = err?.message || err;
              if (!errMsg?.toLowerCase?.()?.includes('cancel')) {
                console.log('[Android] Cleanup stop error (non-cancel):', err);
              }
            });
          }
        } catch (err) {
          console.error('[Android] Cleanup error:', err);
        }
      };
    }

    // Cleanup for iOS
    return () => {
      try {
        stopSilenceTimer();

        if (Platform.OS === 'ios') {
          Voice.removeAllListeners();
          // Use destroy() instead of stop() to fully release the speech recognizer
          Voice.destroy().catch((err: any) => {
            const errMsg = err?.message || err;
            if (!errMsg?.toLowerCase?.()?.includes('cancel')) {
              console.log('[iOS] Cleanup destroy error (non-cancel):', err);
            }
          });
        }
      } catch (err) {
        console.error('[iOS] Cleanup error:', err);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animate mic button when listening or user requested stop
  useEffect(() => {
    if (isListening || userRequestedStop) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(1);
    }
  }, [isListening, userRequestedStop, scaleAnim]);

  // Handle mic press (tap to toggle)
  const handleMicPress = async () => {
    // Haptic feedback for better UX
    ReactNativeHapticFeedback.trigger('impactLight', {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });

    try {
      if (isListening) {
        console.log('🛑 User requested stop');

        // Stop silence timer
        stopSilenceTimer();

        // Mark that user requested stop - keep listening state for animation
        userRequestedStopRef.current = true;
        setUserRequestedStop(true);

        // Platform-specific stop
        if (Platform.OS === 'ios') {
          Voice.stop()
            .then(() => console.log('✅ [iOS] Native stop completed'))
            .catch((stopErr: any) => {
              const errMsg = stopErr?.message || stopErr;
              if (!errMsg?.toLowerCase?.()?.includes('cancel')) {
                console.log('[iOS] Stop listening error (non-cancel):', stopErr);
              }
            });
        } else {
          // Android
          const stopPromise = stopListening();
          if (stopPromise && typeof stopPromise.then === 'function') {
            stopPromise
              .then(() => console.log('✅ [Android] Native stop completed'))
              .catch((stopErr: any) => {
                const errMsg = stopErr?.message || stopErr;
                if (!errMsg?.toLowerCase?.()?.includes('cancel')) {
                  console.log('[Android] Stop listening error (non-cancel):', stopErr);
                }
              });
          } else {
            console.log('✅ [Android] Native stop completed (sync)');
          }
        }
      } else {
        // Check permission first
        const hasPermission = await requestMicrophonePermission();
        if (!hasPermission) {
          Alert.alert('Quyền bị từ chối', 'Vui lòng cấp quyền microphone trong cài đặt');
          return;
        }

        // Prevent multiple start calls
        if (isStartingRef.current) {
          console.log('⚠️ Already starting, skipping');
          return;
        }

        // Check if already listening (iOS) and destroy any existing session
        if (Platform.OS === 'ios') {
          const isRecognizing = await Voice.isRecognizing();
          if (isRecognizing) {
            console.log('⚠️ [iOS] Already recognizing, destroying first');
            try {
              await Voice.destroy();
              console.log('✅ [iOS] Destroyed existing session');
            } catch (destroyErr) {
              console.log('[iOS] Destroy error (continuing):', destroyErr);
            }
          }
        }

        // Mark as starting
        isStartingRef.current = true;

        // Reset states
        setParsedProducts([]);
        setTranscript('');
        setPartialTranscript('');
        setError(null);
        setUserRequestedStop(false);
        setIsProcessingTranscript(false);

        // Reset refs
        transcriptRef.current = '';
        partialTranscriptRef.current = '';
        userRequestedStopRef.current = false;
        isProcessingTranscriptRef.current = false;

        // Platform-specific start
        if (Platform.OS === 'ios') {
          const startPromise = Voice.start('vi-VN');
          if (startPromise && typeof startPromise.then === 'function') {
            await startPromise;
          }
          console.log('🎤 [iOS] Started listening');
          isStartingRef.current = false;
        } else {
          // Android
          const startPromise = startListening();
          if (startPromise && typeof startPromise.then === 'function') {
            await startPromise;
          }
          console.log('🎤 [Android] Started listening');
          isStartingRef.current = false;
        }
      }
    } catch (err: any) {
      console.error('Toggle listening error:', err);
      setError('Không thể bắt đầu nhận diện giọng nói');
      setIsListening(false);
      isStartingRef.current = false;
    }
  };

  // Handle adding parsed products to cart
  const handleAddProducts = () => {
    if (!parsedProducts || parsedProducts.length === 0) return;

    // Add all parsed products to cart with voice flag
    parsedProducts.forEach((item) => {
      const newProduct: Omit<CartItem, 'id'> = {
        name: item.itemName,
        price: item.unitPrice,
        quantity: item.quantity,
        unit: item.unit,
        abbreviation: item.itemName.substring(0, 2).toUpperCase(),
        isVoiceItem: true, // Mark as voice item
      };

      onProductAdded?.(newProduct);
    });

    setParsedProducts([]);
    onClose();
  };

  // Cancel and close
  const handleClose = async () => {
    // Stop silence timer
    stopSilenceTimer();

    // Reset states
    setUserRequestedStop(false);
    setIsProcessingTranscript(false);
    setIsListening(false);

    // Reset refs
    userRequestedStopRef.current = false;
    isProcessingTranscriptRef.current = false;
    isStartingRef.current = false;

    // Always destroy voice session on close to ensure clean state
    try {
      if (Platform.OS === 'ios') {
        // Use destroy() to fully release the speech recognizer
        await Voice.destroy();
        console.log('✅ [iOS] Voice destroyed on close');
      } else {
        // Android
        const stopPromise = stopListening();
        if (stopPromise && typeof stopPromise.then === 'function') {
          await stopPromise;
        }
      }
    } catch (err: any) {
      // Ignore cancellation errors - they're expected when stopping
      const errMsg = err?.message || err;
      if (!errMsg?.toLowerCase?.()?.includes('cancel')) {
        console.log('Stop on close error (non-cancel):', err);
      }
    }

    setParsedProducts([]);
    setTranscript('');
    setPartialTranscript('');
    setError(null);
    onClose();
  };

  // Get current display text
  const displayText = partialTranscript || transcript || '';

  // Don't render modal if not visible to prevent layout measurement errors
  if (!visible) {
    return null;
  }

  return (
    <BottomSheetModal
      visible={visible}
      onClose={handleClose}
      title={t('voiceInput.title', 'Nói để thêm sản phẩm')}
      maxHeightRatio={0.85}
      showHandle={true}
    >
      {/* Content Container */}
      <View style={styles.contentContainer}>
        {/* Mic Button */}
        <Pressable
          onPress={handleMicPress}
          disabled={isParsing || userRequestedStop}
          style={({ pressed }) => [
            styles.micButton,
            (isListening || userRequestedStop) && styles.micButtonListening,
            isParsing && styles.micButtonDisabled,
            pressed && !isParsing && !userRequestedStop && styles.micButtonPressed,
          ]}
        >
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <VoiceOrderIcon
              size={80}
              color={isListening ? colors.light : isParsing ? colors.text.secondary : colors.primary}
            />
          </Animated.View>
        </Pressable>

        {/* Status Text */}
        <Text style={styles.statusText}>
          {isParsing
            ? t('voiceInput.processing', 'Đang phân tích...')
            : userRequestedStop
              ? t('voiceInput.stopping', 'Đang dừng...')
              : isListening
                ? t('voiceInput.tapToStop', 'Chạm để dừng')
                : t('voiceInput.tapToSpeak', 'Chạm để nói')}
        </Text>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>
            {t('voiceInput.instructions', 'Đọc số lượng + tên hàng + giá bán')}
          </Text>
          <Text style={styles.exampleText}>
            {t('voiceInput.example', 'Ví dụ: 1 thùng Coca, giá 133 nghìn đồng')}
          </Text>
        </View>

        {/* Transcript Display */}
        <View style={[
          styles.transcriptContainer,
          displayText.length > 0 && styles.transcriptContainerActive,
        ]}>
          {displayText.length > 0 ? (
            <Text style={styles.transcriptText}>
              {displayText}
            </Text>
          ) : (
            <Text style={styles.placeholderText}>
              {t('voiceInput.placeholder', 'Kết quả nhận diện sẽ hiển thị ở đây')}
            </Text>
          )}
        </View>

        {/* Error Display */}
        {error && typeof error === 'string' && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            {/* Show tip if no items recognized */}
            {error.includes(String(t('voiceInput.noItemsRecognized', '')).substring(0, 20)) && (
              <Text style={styles.errorTipText}>
                {t('voiceInput.recognitionTips')}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Full Screen Overlay Loading */}
      {isParsing && (
        <View style={styles.overlayLoading}>
          <View style={styles.overlayLoadingContent}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.overlayLoadingText}>
              {t('voiceInput.processingAndAdding', 'Đang xử lý và thêm sản phẩm...')}
            </Text>
          </View>
        </View>
      )}
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  micButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  micButtonListening: {
    backgroundColor: colors.primary,
  },
  micButtonDisabled: {
    backgroundColor: colors.background,
    opacity: 0.6,
  },
  micButtonPressed: {
    opacity: 0.8,
  },
  statusText: {
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  instructionsContainer: {
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  instructionsTitle: {
    fontSize: 15,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  exampleText: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  transcriptContainer: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    minHeight: 80,
    justifyContent: 'center',
  },
  transcriptContainerActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  transcriptText: {
    fontSize: 15,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.primary,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
    textAlign: 'center',
    opacity: 0.6,
  },

  errorContainer: {
    backgroundColor: colors.dangerSoft,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.danger,
    textAlign: 'center',
  },
  errorTipText: {
    fontSize: 13,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  overlayLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayLoadingContent: {
    backgroundColor: colors.light,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  overlayLoadingText: {
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.text.primary,
    textAlign: 'center',
  },
});

export default VoiceInputModal;
