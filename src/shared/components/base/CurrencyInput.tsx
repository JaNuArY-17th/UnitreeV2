import React, { useEffect, useMemo, useState } from 'react';
import { TextInputProps, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Input from './Input';
import Text from './Text';
import { colors, spacing } from '../../themes';
import { getFontFamily, getPlatformFontExtras } from '../../themes/fonts';
import { currencyToPronunciation, currencyToShortPronunciation } from '../../utils/currencyPronunciation';

export type CurrencyInputProps = {
  label?: string;
  value?: number | null;
  onChangeValue?: (value: number | null) => void;
  placeholder?: string;
  helperText?: string;
  error?: string;
  min?: number;
  max?: number;
  containerStyle?: any;
  showSuffix?: boolean; // show 'đ' at the end of the field
  showPronunciation?: boolean; // show pronunciation as helper text
  pronunciationOptions?: {
    useShortForm?: boolean;
  };
} & Omit<TextInputProps, 'value' | 'onChangeText' | 'keyboardType'>;

function formatWithCommas(n: number): string {
  const abs = Math.abs(n);
  return abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function toReadableVND(n?: number | null): string | null {
  if (n == null || isNaN(n)) return null;
  const abs = Math.abs(n);
  const units = [
    { v: 1_000_000_000_000, s: 'trillion' },
    { v: 1_000_000_000, s: 'billion' },
    { v: 1_000_000, s: 'million' },
    { v: 1_000, s: 'thousand' },
  ];
  for (const u of units) {
    if (abs >= u.v) {
      const x = abs / u.v;
      const rounded = x >= 100 ? Math.round(x) : Math.round(x * 10) / 10; // 1 decimal for small numbers
      const sign = n < 0 ? '-' : '';
      return `${sign}${rounded} ${u.s} Vietnam dong`;
    }
  }
  return `${n} Vietnam dong`;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  value,
  onChangeValue,
  placeholder = 'Nhập số tiền',
  helperText,
  error,
  min,
  max,
  containerStyle,
  showSuffix = true,
  showPronunciation = false,
  pronunciationOptions = {},
  ...rest
}) => {
  const [text, setText] = useState('');
  const { i18n } = useTranslation('common');

  // Keep internal text in sync when external value changes
  useEffect(() => {
    if (value == null || isNaN(value)) {
      setText('');
      return;
    }
    const formatted = formatWithCommas(Math.round(value));
    setText(formatted);
  }, [value]);

  // Debug effect to track language changes (only in development)
  useEffect(() => {
    if (__DEV__ && showPronunciation) {
      console.log('CurrencyInput: Language changed to:', i18n.language);
    }
  }, [i18n.language, showPronunciation]);

  const onChangeText = (t: string) => {
    // Keep only digits
    const digits = t.replace(/[^0-9]/g, '');
    if (!digits) {
      setText('');
      onChangeValue?.(null);
      return;
    }
    let num = parseInt(digits, 10);
    if (Number.isFinite(min) && num < (min as number)) num = min as number;
    if (Number.isFinite(max) && num > (max as number)) num = max as number;
    const formatted = formatWithCommas(num);
    setText(formatted);
    onChangeValue?.(num);
  };

  const adornment = showSuffix ? (
    <Text variant="body" style={{ color: colors.text.secondary }}>đ</Text>
  ) : undefined;

  const readable = useMemo(() => {
    const r = toReadableVND(value ?? null);
    return r ? `(${r})` : undefined;
  }, [value]);

  // Generate pronunciation text based on current language
  const pronunciationText = useMemo(() => {
    if (!showPronunciation || !value || !Number.isFinite(value)) return undefined;

    // Get current language from i18n system
    const currentLang = i18n.language || 'vi';
    const language = currentLang.startsWith('en') ? 'en' : 'vi';

    // Generate pronunciation based on selected form
    try {
      let text: string;
      if (pronunciationOptions?.useShortForm) {
        text = currencyToShortPronunciation(value, language);
      } else {
        text = currencyToPronunciation(value, language);
      }

      // Capitalize the first character of the pronunciation text
      return text.charAt(0).toUpperCase() + text.slice(1);
    } catch (error) {
      console.warn('Error generating pronunciation text:', error);
      return undefined;
    }
  }, [showPronunciation, value, i18n.language, pronunciationOptions?.useShortForm]);

  const composedHelper = useMemo(() => {
    // When pronunciation is enabled, only show pronunciation text (not the readable English format)
    // to avoid showing both "(10 million Vietnam dong) • mười triệu đồng"
    const parts = showPronunciation
      ? [helperText, pronunciationText].filter(Boolean)
      : [helperText, readable].filter(Boolean);
    return parts.length > 0 ? parts.join(' • ') : undefined;
  }, [helperText, readable, pronunciationText, showPronunciation]);

  return (
    <View style={containerStyle}>
      <Input
        label={label}
        value={text}
        onChangeText={onChangeText}
        keyboardType="number-pad"
        placeholder={placeholder}
        rightAdornment={adornment}
        error={error}
        helperText={composedHelper}
        style={[{ fontFamily: getFontFamily(), ...getPlatformFontExtras() }, rest.style]}
        {...rest}
      />
    </View>
  );
};

export default CurrencyInput;
