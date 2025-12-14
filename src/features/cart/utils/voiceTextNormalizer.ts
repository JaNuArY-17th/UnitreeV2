/**
 * Voice Text Normalizer
 * Normalizes Vietnamese voice input for better invoice parsing
 */

/**
 * Vietnamese number word mappings
 */
const VIETNAMESE_UNITS: Record<string, number> = {
  không: 0,
  một: 1,
  hai: 2,
  ba: 3,
  bốn: 4,
  tư: 4, // Alternative for 4
  năm: 5,
  lăm: 5, // Alternative for 5 in compound numbers
  sáu: 6,
  bảy: 7,
  bẩy: 7, // Alternative spelling
  tám: 8,
  chín: 9,
};

const VIETNAMESE_TENS: Record<string, number> = {
  mười: 10,
  mươi: 10, // Used in compound numbers like "hai mươi"
};

const VIETNAMESE_MULTIPLIERS: Record<string, number> = {
  trăm: 100,
  nghìn: 1000,
  ngàn: 1000,
  triệu: 1000000,
  tỷ: 1000000000,
};

/**
 * Convert Vietnamese number words to digits
 * Examples:
 * - "một trăm ba ba" → "133"
 * - "hai mươi ba" → "23"
 * - "một nghìn năm trăm" → "1500"
 * - "ba mươi lăm" → "35"
 * - "mười hai" → "12"
 * - "100 ba ba" → "133" (digit followed by Vietnamese words)
 */
export const convertVietnameseNumberToDigit = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let result = text;

  // Build regex pattern for Vietnamese number words (units only for suffix pattern)
  const unitWords = Object.keys(VIETNAMESE_UNITS).join('|');

  // Pattern 1: Handle "digit + Vietnamese unit words" pattern
  // e.g., "100 ba ba" → "133", "50 hai năm" → "525"
  // This handles cases where voice recognition outputs mixed digit + word
  const digitPlusWordsPattern = new RegExp(
    `(\\d+)\\s+((?:(?:${unitWords})\\s*){2,})(?=\\s|$|[.,!?])`,
    'gi'
  );

  result = result.replace(digitPlusWordsPattern, (match, digitPart, wordsPart) => {
    const baseNumber = parseInt(digitPart, 10);
    const words = wordsPart.trim().toLowerCase().split(/\s+/);

    // Convert word sequence to number (e.g., "ba ba" → 33)
    let suffix = 0;
    for (const word of words) {
      if (VIETNAMESE_UNITS[word] !== undefined) {
        suffix = suffix * 10 + VIETNAMESE_UNITS[word];
      }
    }

    if (suffix > 0) {
      // Determine how to combine: if base ends with 0s, replace them
      // e.g., 100 + 33 = 133, 50 + 25 = 525
      const suffixDigits = suffix.toString().length;
      const multiplier = Math.pow(10, suffixDigits);

      // Check if base number has trailing zeros that match suffix length
      if (baseNumber % multiplier === 0) {
        return (baseNumber + suffix).toString();
      } else {
        // Just concatenate if no clear pattern
        return baseNumber.toString() + suffix.toString();
      }
    }
    return match;
  });

  // Build regex pattern for all Vietnamese number words
  const allNumberWords = [
    ...Object.keys(VIETNAMESE_UNITS),
    ...Object.keys(VIETNAMESE_TENS),
    ...Object.keys(VIETNAMESE_MULTIPLIERS),
  ].join('|');

  // Pattern 2: Handle pure Vietnamese number sequences
  // e.g., "một trăm ba ba" → "133"
  const numberSequencePattern = new RegExp(
    `(?:^|\\s)((?:(?:${allNumberWords})\\s*)+)(?=\\s|$|[.,!?])`,
    'gi'
  );

  // Find and replace all Vietnamese number sequences
  result = result.replace(numberSequencePattern, (match, numberWords) => {
    const converted = parseVietnameseNumber(numberWords.trim());
    if (converted !== null) {
      // Preserve leading whitespace from match
      const leadingSpace = match.startsWith(' ') ? ' ' : '';
      return leadingSpace + converted.toString();
    }
    return match;
  });

  return result;
};

/**
 * Parse a Vietnamese number phrase into a numeric value
 * Handles compound numbers like "một trăm ba mươi ba" (133)
 */
const parseVietnameseNumber = (phrase: string): number | null => {
  if (!phrase) return null;

  const words = phrase.toLowerCase().trim().split(/\s+/);
  if (words.length === 0) return null;

  // Check if this is actually a number phrase (at least one number word)
  const hasNumberWord = words.some(
    word =>
      VIETNAMESE_UNITS[word] !== undefined ||
      VIETNAMESE_TENS[word] !== undefined ||
      VIETNAMESE_MULTIPLIERS[word] !== undefined
  );

  if (!hasNumberWord) return null;

  let total = 0;
  let current = 0;
  let lastMultiplier = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    // Check for unit (0-9)
    if (VIETNAMESE_UNITS[word] !== undefined) {
      const value = VIETNAMESE_UNITS[word];

      // Check if next word is a multiplier
      const nextWord = words[i + 1];
      if (nextWord && VIETNAMESE_MULTIPLIERS[nextWord]) {
        current = value;
      } else if (nextWord === 'mươi' || nextWord === 'mười') {
        // This unit is the tens digit (e.g., "hai mươi" = 20)
        current = value * 10;
        i++; // Skip the "mươi/mười"

        // Check for unit after "mươi" (e.g., "hai mươi ba" = 23)
        const afterTens = words[i + 1];
        if (afterTens && VIETNAMESE_UNITS[afterTens] !== undefined) {
          current += VIETNAMESE_UNITS[afterTens];
          i++;
        }
      } else {
        // Standalone unit or unit after multiplier
        if (lastMultiplier === 100) {
          // After "trăm", this is the tens or units place
          // Check if there's another unit following (e.g., "ba ba" = 33)
          const nextUnit = words[i + 1];
          if (nextUnit && VIETNAMESE_UNITS[nextUnit] !== undefined && !VIETNAMESE_MULTIPLIERS[words[i + 2]]) {
            // Pattern like "ba ba" for 33
            current += value * 10 + VIETNAMESE_UNITS[nextUnit];
            i++;
          } else {
            current += value;
          }
        } else {
          current += value;
        }
      }
      lastMultiplier = 0;
    }
    // Check for "mười" at the start (10-19)
    else if (word === 'mười' && current === 0) {
      current = 10;
      // Check for unit after "mười" (e.g., "mười hai" = 12)
      const afterTen = words[i + 1];
      if (afterTen && VIETNAMESE_UNITS[afterTen] !== undefined) {
        current += VIETNAMESE_UNITS[afterTen];
        i++;
      }
    }
    // Check for multiplier (trăm, nghìn, triệu, tỷ)
    else if (VIETNAMESE_MULTIPLIERS[word] !== undefined) {
      const multiplier = VIETNAMESE_MULTIPLIERS[word];

      if (current === 0) {
        current = 1; // "trăm" alone means 100
      }

      if (multiplier >= 1000) {
        // For nghìn, triệu, tỷ - add to total
        total += current * multiplier;
        current = 0;
      } else {
        // For trăm - multiply current and continue building
        current = current * multiplier;
      }
      lastMultiplier = multiplier;
    }
  }

  // Add any remaining current value
  total += current;

  return total > 0 ? total : null;
};

/**
 * Normalize Vietnamese currency expressions
 * Handles cases where "đồng" is missing after numbers
 *
 * Examples:
 * - "5 cân thịt lợn 50 nghìn" → "5 cân thịt lợn 50 nghìn đồng"
 * - "2 chai coca 15k" → "2 chai coca 15k đồng"
 * - "3 hộp sữa 100 ngàn" → "3 hộp sữa 100 nghìn đồng"
 * - "1 thùng bia 500 triệu" → "1 thùng bia 500 triệu đồng"
 * - "ba quả táo 100.002 cân" → "ba quả táo 100.002 đồng cân"
 * - "30K coca" → "30K đồng coca"
 * - "một trăm ba ba" → "133"
 */
export const normalizeVietnameseCurrency = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return text;
  }
  let normalized = text.trim();

  // Step 0: Convert Vietnamese number words to digits FIRST
  normalized = convertVietnameseNumberToDigit(normalized);

  // Remove thousand separators (dots and commas) in numbers when followed by exactly 3 digits
  normalized = normalized.replace(/(\d+)[.](\d{3})/g, '$1$2');
  normalized = normalized.replace(/(\d+)[,](\d{3})/g, '$1$2');

  // Standardize decimal separators from comma to dot (after removing thousand seps)
  normalized = normalized.replace(/(\d+),(\d+)/g, '$1.$2');

  // Handle "kđ" or "KĐ" specifically
  normalized = normalized.replace(
    /(\d+(?:[.,]\d+)?)\s*([kK])[đĐ]/gi,
    '$1 nghìn đồng'
  );

  // Handle "trđ" or "TRĐ" specifically
  normalized = normalized.replace(
    /(\d+(?:[.,]\d+)?)\s*(tr)[đĐ]/gi,
    '$1 triệu đồng'
  );

  // Pattern 1: "số + nghìn/ngàn/triệu/k" NOT followed by "đồng"
  // Matches: "50 nghìn", "50k", "50 ngàn", "50 triệu"
  // But NOT: "50 nghìn đồng" (already has đồng)
  // Handle "nghìn" without "đồng"
  normalized = normalized.replace(
    /(\d+(?:[.,]\d+)?)\s*(nghìn|ngàn)(?!\s*đồng)/gi,
    '$1 nghìn đồng'
  );
  // Handle "k/K" without "đồng" (but not "kg", "km", etc.)
  // Expand "k" to "nghìn"
  normalized = normalized.replace(
    /(\d+(?:[.,]\d+)?)\s*([kK])(?!\s*đồng)(?![a-z])/gi,
    '$1 nghìn đồng'
  );
  // Handle "tr/TR" for "triệu" without "đồng"
  normalized = normalized.replace(
    /(\d+(?:[.,]\d+)?)\s*(tr)(?!\s*đồng)(?![a-z])/gi,
    '$1 triệu đồng'
  );
  // Handle "triệu" without "đồng"
  normalized = normalized.replace(
    /(\d+(?:[.,]\d+)?)\s*triệu(?!\s*đồng)/gi,
    '$1 triệu đồng'
  );
  // Handle "tỷ" without "đồng"
  normalized = normalized.replace(
    /(\d+(?:[.,]\d+)?)\s*tỷ(?!\s*đồng)/gi,
    '$1 tỷ đồng'
  );
  // Handle "trăm" without "đồng" (less common but possible)
  normalized = normalized.replace(
    /(\d+(?:[.,]\d+)?)\s*trăm(?!\s*đồng)/gi,
    '$1 trăm đồng'
  );
  // Handle "chục" without "đồng" (less common but possible)
  normalized = normalized.replace(
    /(\d+(?:[.,]\d+)?)\s*chục(?!\s*đồng)/gi,
    '$1 chục đồng'
  );

  // Handle bare numbers (2-3 digits) before product names, add "nghìn đồng"
  normalized = normalized.replace(
    /(\d{2,3})(?!\s*(?:nghìn|ngàn|triệu|trăm|chục|đồng|k|K))\s+(?=[a-zàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ])/gi,
    '$1 nghìn đồng '
  );

  // Handle bare numbers (4+ digits) before product names, add "đồng"
  normalized = normalized.replace(
    /(\d{4,}(?:[.,]\d+)?)(?!\s*(?:nghìn|ngàn|triệu|trăm|chục|đồng|k|K))\s+(?=[a-zàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ])/gi,
    '$1 đồng '
  );

  // Handle standalone numbers (2-3 digits) that represent prices
  // Pattern: number followed by space then another number (next quantity)
  // e.g., "giá 133 2 con lợn" → "giá 133 nghìn đồng 2 con lợn"
  normalized = normalized.replace(
    /(\d{2,3})(\s+)(\d+\s+(?:con|cái|chai|lon|thùng|hộp|gói|kg|cân|bịch|túi|quả|trái))/gi,
    '$1 nghìn đồng$2$3'
  );

  // Handle standalone numbers at end of string
  // For 2-3 digits, add "nghìn đồng"
  normalized = normalized.replace(
    /(\d{2,3})(?!\s*(?:nghìn|ngàn|triệu|trăm|chục|đồng|k|K))\s*$/gi,
    '$1 nghìn đồng'
  );
  // For 4+ digits at end, add "đồng"
  normalized = normalized.replace(
    /(\d{4,})(?!\s*(?:nghìn|ngàn|triệu|trăm|chục|đồng|k|K))\s*$/gi,
    '$1 đồng'
  );

  return normalized.trim();
};

/**
 * Main text normalizer for voice input
 * Applies all normalization rules
 */
export const normalizeVoiceText = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let normalized = text;

  // Step 1: Normalize currency expressions
  normalized = normalizeVietnameseCurrency(normalized);

  // Step 2: Trim extra whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized;
};
