import AsyncStorage from '@react-native-async-storage/async-storage';
import Tts from 'react-native-tts';
import { Platform, PermissionsAndroid } from 'react-native';
import type { SpeakerNotificationSettings, TransactionNotificationData } from '../types';

const STORAGE_KEY = '@speaker_notification_settings';

class SpeakerNotificationService {
  private settings: SpeakerNotificationSettings | null = null;
  private isInitialized = false;

  /**
   * Initialize TTS engine
   */
  async initializeTts(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('🎤 Initializing TTS...');
      
      // Set up TTS event listeners
      Tts.addEventListener('tts-start', (event) => console.log('▶️ TTS started:', event));
      Tts.addEventListener('tts-finish', (event) => console.log('✅ TTS finished:', event));
      Tts.addEventListener('tts-cancel', (event) => console.log('⏹️ TTS cancelled:', event));
      Tts.addEventListener('tts-error', (event) => console.error('❌ TTS error:', event));
      
      // Initialize TTS - this is critical for Android
      const initStatus = await Tts.getInitStatus();
      console.log('🎤 TTS Init Status:', initStatus);
      
      // Get available voices and log them
      const voices = await Tts.voices();
      console.log(`🗣️ Available voices (${voices.length}):`);
      voices.forEach((v: any, i: number) => {
        if (i < 5 || v.language?.includes('vi') || v.language?.includes('en')) {
          console.log(`  - ${v.name} (${v.language})`);
        }
      });
      
      // Try to set Vietnamese language, fallback to English if not available
      let languageSet = false;
      try {
        const vietnameseVoice = voices.find((v: any) => 
          v.language && (v.language.includes('vi') || v.language.includes('VN'))
        );
        
        if (vietnameseVoice) {
          await Tts.setDefaultLanguage(vietnameseVoice.language);
          console.log('✅ TTS set to Vietnamese:', vietnameseVoice.language);
          languageSet = true;
        } else {
          console.log('⚠️ Vietnamese voice not found');
          // Try en-US first (preferred American English)
          const usEnglishVoice = voices.find((v: any) => 
            v.language && v.language.toLowerCase().startsWith('en-us')
          );
          
          if (usEnglishVoice) {
            await Tts.setDefaultLanguage(usEnglishVoice.language);
            console.log('✅ TTS set to en-US (preferred):', usEnglishVoice.language);
            languageSet = true;
          } else {
            // Fallback to any English voice if en-US not available
            const englishVoice = voices.find((v: any) => 
              v.language && v.language.toLowerCase().includes('en')
            );
            if (englishVoice) {
              await Tts.setDefaultLanguage(englishVoice.language);
              console.log('✅ TTS set to English (fallback):', englishVoice.language);
              languageSet = true;
            }
          }
        }
      } catch (langError) {
        console.log('⚠️ Could not set specific language, using system default');
      }
      
      // Configure TTS settings
      try {
        await Tts.setDefaultRate(0.5, true); // true = skip transform
        await Tts.setDefaultPitch(1.0);
        console.log('✅ TTS rate and pitch configured');
      } catch (configError) {
        console.log('⚠️ Could not set TTS configuration, using defaults');
      }
      
      // Android: Enable audio ducking for better audio focus
      if (Platform.OS === 'android') {
        try {
          await Tts.setDucking(true);
          console.log('✅ Android: Audio ducking enabled');
        } catch (e) {
          console.log('⚠️ Could not set audio ducking');
        }
      }
      
      // Set ignore silence switch for iOS
      if (Platform.OS === 'ios') {
        try {
          await Tts.setIgnoreSilentSwitch('ignore');
          console.log('✅ iOS: Ignore silent switch enabled');
        } catch (e) {
          console.log('⚠️ Could not set ignore silent switch');
        }
      }
      
      this.isInitialized = true;
      console.log('✅ TTS initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize TTS:', error);
      // Don't throw error - allow app to continue without TTS
      this.isInitialized = false;
    }
  }

  /**
   * Request notification permissions
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (error) {
        console.error('Failed to request notification permission:', error);
        return false;
      }
    }
    return true;
  }

  /**
   * Get saved settings from AsyncStorage
   */
  async getSettings(): Promise<SpeakerNotificationSettings | null> {
    try {
      const savedSettings = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedSettings) {
        this.settings = JSON.parse(savedSettings);
        return this.settings;
      }
      return null;
    } catch (error) {
      console.error('Failed to load speaker settings:', error);
      return null;
    }
  }

  /**
   * Save settings to AsyncStorage
   */
  async saveSettings(settings: SpeakerNotificationSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      this.settings = settings;
      
      // Update TTS settings with error handling
      try {
        await Tts.setDefaultRate(settings.rate);
        await Tts.setDefaultPitch(settings.pitch);
      } catch (ttsError) {
        console.log('⚠️ Could not update TTS settings, but settings were saved');
      }
      
      console.log('✅ Speaker settings saved successfully');
    } catch (error) {
      console.error('❌ Failed to save speaker settings:', error);
      throw error;
    }
  }

  /**
   * Format message template with transaction data
   */
  formatMessage(template: string, data: TransactionNotificationData): string {
    let message = template;
    
    // Replace template variables
    message = message.replace(/\{\{amount\}\}/g, data.amount);
    message = message.replace(/\{\{sender\}\}/g, data.sender);
    message = message.replace(/\{\{time\}\}/g, data.time);
    message = message.replace(/\{\{bankName\}\}/g, data.bankName);
    
    if (data.description) {
      message = message.replace(/\{\{description\}\}/g, data.description);
    }
    
    return message;
  }

  /**
   * Speak the message using TTS
   */
  async speak(message: string, settings?: SpeakerNotificationSettings): Promise<void> {
    try {
      console.log('🎤 Attempting to speak:', message);
      
      // Initialize TTS if not already initialized
      if (!this.isInitialized) {
        console.log('🎤 TTS not initialized, initializing now...');
        await this.initializeTts();
      }
      
      // Stop any ongoing speech
      try {
        await Tts.stop();
        console.log('⏹️ Stopped any previous speech');
      } catch (stopError) {
        console.log('⚠️ Could not stop previous speech (may be none playing)');
      }
      
      // Use provided settings or cached settings
      const speakerSettings = settings || this.settings;
      
      if (speakerSettings) {
        try {
          await Tts.setDefaultRate(speakerSettings.rate, true);
          await Tts.setDefaultPitch(speakerSettings.pitch);
          console.log(`🎤 Applied settings - Rate: ${speakerSettings.rate}, Pitch: ${speakerSettings.pitch}`);
        } catch (configError) {
          console.log('⚠️ Could not apply TTS settings:', configError);
        }
      }
      
      // For Android, ensure audio focus is requested
      if (Platform.OS === 'android') {
        console.log('🔊 Android: Requesting audio focus...');
      }
      
      // Speak the message
      console.log('🔊 Starting to speak...');
      const utteranceId = await Tts.speak(message);
      console.log('🔊 TTS.speak() called successfully (utteranceId: ' + utteranceId + ')');
      console.log('🔊 Message:', message);
    } catch (error) {
      console.error('❌ Failed to speak message:', error);
      console.error('❌ Error details:', JSON.stringify(error));
      throw error;
    }
  }

  /**
   * Stop current speech
   */
  async stopSpeaking(): Promise<void> {
    try {
      await Tts.stop();
    } catch (error) {
      console.error('Failed to stop speech:', error);
    }
  }

  /**
   * Handle incoming transaction notification
   */
  async handleTransactionNotification(data: TransactionNotificationData): Promise<void> {
    try {
      // Get current settings
      const settings = await this.getSettings();
      
      // Check if speaker is enabled
      if (!settings || !settings.enabled) {
        console.log('Speaker notifications disabled');
        return;
      }
      
      // Format the message
      const message = this.formatMessage(settings.messageTemplate, data);
      
      // Speak the message
      await this.speak(message, settings);
    } catch (error) {
      console.error('Failed to handle transaction notification:', error);
    }
  }

  /**
   * Check if TTS is available on the device
   */
  async isTtsAvailable(): Promise<boolean> {
    try {
      const engines = await Tts.engines();
      return engines.length > 0;
    } catch (error) {
      console.error('Failed to check TTS availability:', error);
      return false;
    }
  }

  /**
   * Get available voices
   */
  async getAvailableVoices(): Promise<any[]> {
    try {
      const voices = await Tts.voices();
      return voices;
    } catch (error) {
      console.error('Failed to get available voices:', error);
      return [];
    }
  }

  /**
   * Get Vietnamese voices
   */
  async getVietnameseVoices(): Promise<any[]> {
    try {
      const voices = await Tts.voices();
      return voices.filter((voice: any) => 
        voice.language && (
          voice.language.includes('vi') || 
          voice.language.includes('VN')
        )
      );
    } catch (error) {
      console.error('Failed to get Vietnamese voices:', error);
      return [];
    }
  }

  /**
   * Test TTS with a simple message to verify audio output
   */
  async testBasicTTS(): Promise<void> {
    console.log('🧪 Testing basic TTS audio output...');
    
    try {
      // Stop any ongoing speech
      await Tts.stop();
      
      // Reset to defaults
      await Tts.setDefaultRate(0.5);
      await Tts.setDefaultPitch(1.0);
      
      // Try simple English phrase
      console.log('🔊 Testing with English: "Hello World"');
      await Tts.speak('Hello World');
      
      // Wait a bit
      await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));
      
      console.log('🧪 Basic TTS test complete. Did you hear audio?');
      console.log('📱 If no audio, check:');
      console.log('   1. Device media volume');
      console.log('   2. Do Not Disturb mode');
      console.log('   3. TTS engine in Android Settings');
      console.log('   4. Audio output (not connected to silent Bluetooth)');
    } catch (error) {
      console.error('❌ Basic TTS test failed:', error);
    }
  }

  /**
   * Diagnose TTS setup and log detailed information
   * Useful for troubleshooting
   */
  async diagnoseTTS(): Promise<{
    isAvailable: boolean;
    hasVietnameseVoices: boolean;
    availableVoices: any[];
    vietnameseVoices: any[];
    currentLanguage: string | null;
    engines: any[];
  }> {
    console.log('🔍 Running TTS Diagnostics...');
    
    const result = {
      isAvailable: false,
      hasVietnameseVoices: false,
      availableVoices: [] as any[],
      vietnameseVoices: [] as any[],
      currentLanguage: null as string | null,
      engines: [] as any[],
    };

    try {
      // Check if TTS is available
      result.isAvailable = await this.isTtsAvailable();
      console.log(`✅ TTS Available: ${result.isAvailable}`);

      // Get engines
      result.engines = await Tts.engines();
      console.log(`📱 TTS Engines (${result.engines.length}):`, result.engines);

      // Get all voices
      result.availableVoices = await this.getAvailableVoices();
      console.log(`🗣️ Total Voices: ${result.availableVoices.length}`);

      // Get Vietnamese voices
      result.vietnameseVoices = await this.getVietnameseVoices();
      result.hasVietnameseVoices = result.vietnameseVoices.length > 0;
      console.log(`🇻🇳 Vietnamese Voices (${result.vietnameseVoices.length}):`, result.vietnameseVoices);

      if (!result.hasVietnameseVoices) {
        console.log('⚠️ No Vietnamese voices found. Please install Vietnamese language pack.');
      }
      
      // Run basic audio test
      console.log('🧪 Running basic audio test...');
      await this.testBasicTTS();

    } catch (error) {
      console.error('❌ TTS Diagnostic Error:', error);
    }

    console.log('🔍 Diagnostics Complete');
    return result;
  }
}

export const speakerNotificationService = new SpeakerNotificationService();
