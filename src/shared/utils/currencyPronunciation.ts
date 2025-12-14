/**
 * Currency pronunciation utilities for Vietnamese and English
 * Converts currency amounts to pronounceable text
 */

export type SupportedLanguage = 'vi' | 'en';

// Vietnamese number words
const VIETNAMESE_NUMBERS = {
  0: 'không',
  1: 'một',
  2: 'hai',
  3: 'ba',
  4: 'bốn',
  5: 'năm',
  6: 'sáu',
  7: 'bảy',
  8: 'tám',
  9: 'chín',
  10: 'mười',
  11: 'mười một',
  12: 'mười hai',
  13: 'mười ba',
  14: 'mười bốn',
  15: 'mười lăm',
  16: 'mười sáu',
  17: 'mười bảy',
  18: 'mười tám',
  19: 'mười chín',
  20: 'hai mười',
  100: 'trăm',
  1000: 'nghìn',
  1000000: 'triệu',
  1000000000: 'tỷ',
  1000000000000: 'nghìn tỷ'
};

// English number words
const ENGLISH_NUMBERS = {
  0: 'zero',
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine',
  10: 'ten',
  11: 'eleven',
  12: 'twelve',
  13: 'thirteen',
  14: 'fourteen',
  15: 'fifteen',
  16: 'sixteen',
  17: 'seventeen',
  18: 'eighteen',
  19: 'nineteen',
  20: 'twenty',
  30: 'thirty',
  40: 'forty',
  50: 'fifty',
  60: 'sixty',
  70: 'seventy',
  80: 'eighty',
  90: 'ninety',
  100: 'hundred',
  1000: 'thousand',
  1000000: 'million',
  1000000000: 'billion',
  1000000000000: 'trillion'
};

/**
 * Convert a number to Vietnamese words
 */
function numberToVietnamese(num: number): string {
  if (num === 0) return VIETNAMESE_NUMBERS[0];

  if (num < 0) {
    return `âm ${numberToVietnamese(Math.abs(num))}`;
  }

  if (num < 20) {
    return VIETNAMESE_NUMBERS[num as keyof typeof VIETNAMESE_NUMBERS] || '';
  }

  if (num < 100) {
    const tens = Math.floor(num / 10) * 10;
    const ones = num % 10;
    if (ones === 0) {
      return tens === 10 ? 'mười' : `${VIETNAMESE_NUMBERS[tens / 10]} mười`;
    }
    if (tens === 10) {
      return `mười ${ones === 5 ? 'lăm' : VIETNAMESE_NUMBERS[ones]}`;
    }
    return `${VIETNAMESE_NUMBERS[tens / 10]} mười ${ones === 5 && tens > 10 ? 'lăm' : VIETNAMESE_NUMBERS[ones]}`;
  }

  if (num < 1000) {
    const hundreds = Math.floor(num / 100);
    const remainder = num % 100;
    let result = `${VIETNAMESE_NUMBERS[hundreds]} trăm`;
    if (remainder > 0) {
      if (remainder < 10) {
        result += ` lẻ ${VIETNAMESE_NUMBERS[remainder]}`;
      } else if (remainder < 20) {
        result += ` ${numberToVietnamese(remainder)}`;
      } else {
        result += ` ${numberToVietnamese(remainder)}`;
      }
    }
    return result;
  }

  // Handle larger numbers
  const units = [
    { value: 1000000000000, word: 'nghìn tỷ' },
    { value: 1000000000, word: 'tỷ' },
    { value: 1000000, word: 'triệu' },
    { value: 1000, word: 'nghìn' }
  ];

  for (const unit of units) {
    if (num >= unit.value) {
      const quotient = Math.floor(num / unit.value);
      const remainder = num % unit.value;
      let result = `${numberToVietnamese(quotient)} ${unit.word}`;
      if (remainder > 0) {
        result += ` ${numberToVietnamese(remainder)}`;
      }
      return result;
    }
  }

  return num.toString();
}

/**
 * Convert a number to English words
 */
function numberToEnglish(num: number): string {
  if (num === 0) return ENGLISH_NUMBERS[0];

  if (num < 0) {
    return `negative ${numberToEnglish(Math.abs(num))}`;
  }

  if (num < 20) {
    return ENGLISH_NUMBERS[num as keyof typeof ENGLISH_NUMBERS] || '';
  }

  if (num < 100) {
    const tens = Math.floor(num / 10) * 10;
    const ones = num % 10;
    if (ones === 0) {
      return ENGLISH_NUMBERS[tens as keyof typeof ENGLISH_NUMBERS];
    }
    return `${ENGLISH_NUMBERS[tens as keyof typeof ENGLISH_NUMBERS]}-${ENGLISH_NUMBERS[ones]}`;
  }

  if (num < 1000) {
    const hundreds = Math.floor(num / 100);
    const remainder = num % 100;
    let result = `${ENGLISH_NUMBERS[hundreds]} hundred`;
    if (remainder > 0) {
      result += ` ${numberToEnglish(remainder)}`;
    }
    return result;
  }

  // Handle larger numbers
  const units = [
    { value: 1000000000000, word: 'trillion' },
    { value: 1000000000, word: 'billion' },
    { value: 1000000, word: 'million' },
    { value: 1000, word: 'thousand' }
  ];

  for (const unit of units) {
    if (num >= unit.value) {
      const quotient = Math.floor(num / unit.value);
      const remainder = num % unit.value;
      let result = `${numberToEnglish(quotient)} ${unit.word}`;
      if (remainder > 0) {
        result += ` ${numberToEnglish(remainder)}`;
      }
      return result;
    }
  }

  return num.toString();
}

/**
 * Convert currency amount to pronounceable text in Vietnamese
 */
export function currencyToVietnamese(amount: number): string {
  if (amount === 0 || !Number.isFinite(amount)) {
    return 'không đồng';
  }

  const absAmount = Math.abs(amount);
  const isNegative = amount < 0;

  // Handle whole numbers (no decimals for VND)
  const wholeAmount = Math.round(absAmount);
  let result = numberToVietnamese(wholeAmount);

  // Add currency unit
  result += ' đồng';

  if (isNegative) {
    result = `âm ${result}`;
  }

  return result;
}

/**
 * Convert currency amount to pronounceable text in English
 */
export function currencyToEnglish(amount: number): string {
  if (amount === 0 || !Number.isFinite(amount)) {
    return 'zero Vietnamese dong';
  }

  const absAmount = Math.abs(amount);
  const isNegative = amount < 0;

  // Handle whole numbers (no decimals for VND)
  const wholeAmount = Math.round(absAmount);
  let result = numberToEnglish(wholeAmount);

  // Add currency unit
  result += ' Vietnamese dong';

  if (isNegative) {
    result = `negative ${result}`;
  }

  return result;
}

/**
 * Convert currency amount to pronounceable text based on language
 */
export function currencyToPronunciation(amount: number, language: SupportedLanguage): string {
  switch (language) {
    case 'vi':
      return currencyToVietnamese(amount);
    case 'en':
      return currencyToEnglish(amount);
    default:
      return currencyToVietnamese(amount);
  }
}

/**
 * Get a short pronunciation for large amounts (simplified)
 */
export function currencyToShortPronunciation(amount: number, language: SupportedLanguage): string {
  const absAmount = Math.abs(amount);
  const isNegative = amount < 0;

  const formatValue = (value: number): string => {
    return value % 1 === 0 ? value.toString() : value.toFixed(1);
  };

  if (language === 'vi') {
    let result = '';

    if (absAmount >= 1000000000000) {
      const value = absAmount / 1000000000000;
      result = `${formatValue(value)} nghìn tỷ đồng`;
    } else if (absAmount >= 1000000000) {
      const value = absAmount / 1000000000;
      result = `${formatValue(value)} tỷ đồng`;
    } else if (absAmount >= 1000000) {
      const value = absAmount / 1000000;
      result = `${formatValue(value)} triệu đồng`;
    } else if (absAmount >= 1000) {
      const value = absAmount / 1000;
      result = `${formatValue(value)} nghìn đồng`;
    } else {
      result = `${Math.round(absAmount)} đồng`;
    }

    return isNegative ? `âm ${result}` : result;
  } else {
    let result = '';

    if (absAmount >= 1000000000000) {
      const value = absAmount / 1000000000000;
      result = `${formatValue(value)} trillion Vietnamese dong`;
    } else if (absAmount >= 1000000000) {
      const value = absAmount / 1000000000;
      result = `${formatValue(value)} billion Vietnamese dong`;
    } else if (absAmount >= 1000000) {
      const value = absAmount / 1000000;
      result = `${formatValue(value)} million Vietnamese dong`;
    } else if (absAmount >= 1000) {
      const value = absAmount / 1000;
      result = `${formatValue(value)} thousand Vietnamese dong`;
    } else {
      result = `${Math.round(absAmount)} Vietnamese dong`;
    }

    return isNegative ? `negative ${result}` : result;
  }
}
