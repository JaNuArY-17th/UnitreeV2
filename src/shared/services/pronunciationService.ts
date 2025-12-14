/**
 * Pronunciation service for currency amounts using Text-to-Speech
 * Handles TTS operations with language detection and user preferences
 */

import Tts from 'react-native-tts';
import { currencyToPronunciation, currencyToShortPronunciation, SupportedLanguage } from '../utils/currencyPronunciation';
import i18n from '../config/i18n';

export interface PronunciationOptions {
  useShortForm?: boolean;
  rate?: number; // Speech rate (0.1 - 2.0)
  pitch?: number; // Speech pitch (0.5 - 2.0)
}

export interface PronunciationError {
  code: 'TTS_NOT_AVAILABLE' | 'TTS_ERROR' | 'INVALID_AMOUNT' | 'LANGUAGE_NOT_SUPPORTED';
  message: string;
}

class PronunciationService {
  private isInitialized = false;
  private isSpeaking = false;
  private currentLanguage: SupportedLanguage = 'vi';

  /**
   * Initialize the TTS service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize TTS
      await Tts.getInitStatus();
      
      // Set up event listeners
      Tts.addEventListener('tts-start', this.onSpeechStart);
      Tts.addEventListener('tts-finish', this.onSpeechFinish);
      Tts.addEventListener('tts-cancel', this.onSpeechCancel);
      Tts.addEventListener('tts-error', this.onSpeechError);

      // Set default speech settings
      await this.updateSpeechSettings();
      
      this.isInitialized = true;
    } catch (error) {
      console.warn('TTS initialization failed:', error);
      throw new Error('TTS_NOT_AVAILABLE');
    }
  }

  /**
   * Update speech settings based on current language
   */
  private async updateSpeechSettings(): Promise<void> {
    try {
      const currentLang = i18n.language || 'vi';
      this.currentLanguage = currentLang.startsWith('en') ? 'en' : 'vi';

      // Set language for TTS
      const ttsLanguage = this.currentLanguage === 'vi' ? 'vi-VN' : 'en-US';
      
      // Get available voices
      const voices = await Tts.voices();
      const availableVoice = voices.find(voice => 
        voice.language.startsWith(this.currentLanguage)
      );

      if (availableVoice) {
        await Tts.setDefaultLanguage(ttsLanguage);
        await Tts.setDefaultVoice(availableVoice.id);
      } else {
        // Fallback to system default
        await Tts.setDefaultLanguage(ttsLanguage);
      }

      // Set default speech rate and pitch
      await Tts.setDefaultRate(0.5); // Slightly slower for better comprehension
      await Tts.setDefaultPitch(1.0); // Normal pitch
    } catch (error) {
      console.warn('Failed to update speech settings:', error);
    }
  }

  /**
   * Speak a currency amount
   */
  async speakCurrencyAmount(
    amount: number, 
    options: PronunciationOptions = {}
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Validate amount
    if (!Number.isFinite(amount)) {
      throw { code: 'INVALID_AMOUNT', message: 'Invalid currency amount' } as PronunciationError;
    }

    try {
      // Stop any current speech
      if (this.isSpeaking) {
        await this.stopSpeaking();
      }

      // Update language settings if needed
      const currentLang = i18n.language || 'vi';
      const newLanguage: SupportedLanguage = currentLang.startsWith('en') ? 'en' : 'vi';
      
      if (newLanguage !== this.currentLanguage) {
        this.currentLanguage = newLanguage;
        await this.updateSpeechSettings();
      }

      // Convert amount to pronounceable text
      const text = options.useShortForm 
        ? currencyToShortPronunciation(amount, this.currentLanguage)
        : currencyToPronunciation(amount, this.currentLanguage);

      // Set speech options if provided
      if (options.rate !== undefined) {
        await Tts.setDefaultRate(Math.max(0.1, Math.min(2.0, options.rate)));
      }
      if (options.pitch !== undefined) {
        await Tts.setDefaultPitch(Math.max(0.5, Math.min(2.0, options.pitch)));
      }

      // Speak the text
      await Tts.speak(text);
    } catch (error) {
      console.error('TTS error:', error);
      throw { code: 'TTS_ERROR', message: 'Failed to speak currency amount' } as PronunciationError;
    }
  }

  /**
   * Stop current speech
   */
  async stopSpeaking(): Promise<void> {
    try {
      if (this.isSpeaking) {
        await Tts.stop();
      }
    } catch (error) {
      console.warn('Failed to stop TTS:', error);
    }
  }

  /**
   * Check if TTS is currently speaking
   */
  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  /**
   * Check if TTS is available on the device
   */
  async isAvailable(): Promise<boolean> {
    try {
      await Tts.getInitStatus();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get available voices for current language
   */
  async getAvailableVoices(): Promise<any[]> {
    try {
      const voices = await Tts.voices();
      return voices.filter(voice => 
        voice.language.startsWith(this.currentLanguage)
      );
    } catch {
      return [];
    }
  }

  /**
   * Set a specific voice
   */
  async setVoice(voiceId: string): Promise<void> {
    try {
      await Tts.setDefaultVoice(voiceId);
    } catch (error) {
      console.warn('Failed to set voice:', error);
    }
  }

  /**
   * Event handlers
   */
  private onSpeechStart = () => {
    this.isSpeaking = true;
  };

  private onSpeechFinish = () => {
    this.isSpeaking = false;
  };

  private onSpeechCancel = () => {
    this.isSpeaking = false;
  };

  private onSpeechError = (error: any) => {
    this.isSpeaking = false;
    console.warn('TTS error event:', error);
  };

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.isInitialized) {
      Tts.removeAllListeners('tts-start');
      Tts.removeAllListeners('tts-finish');
      Tts.removeAllListeners('tts-cancel');
      Tts.removeAllListeners('tts-error');
      this.isInitialized = false;
    }
  }
}

// Export singleton instance
export const pronunciationService = new PronunciationService();
export default pronunciationService;
