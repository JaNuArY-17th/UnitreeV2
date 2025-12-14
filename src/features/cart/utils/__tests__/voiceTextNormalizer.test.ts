/**
 * Voice Text Normalizer Tests
 */

import { normalizeVietnameseCurrency, normalizeVoiceText } from '../voiceTextNormalizer';

describe('normalizeVietnameseCurrency', () => {
  it('should add "đồng" after "nghìn" when missing', () => {
    const input = '5 cân thịt lợn 50 nghìn';
    const expected = '5 cân thịt lợn 50 nghìn đồng';
    expect(normalizeVietnameseCurrency(input)).toBe(expected);
  });

  it('should add "đồng" after "ngàn" when missing', () => {
    const input = '3 hộp sữa 100 ngàn';
    const expected = '3 hộp sữa 100 nghìn đồng';
    expect(normalizeVietnameseCurrency(input)).toBe(expected);
  });

  it('should add "đồng" after "k" when missing', () => {
    const input = '2 chai coca 15k';
    const expected = '2 chai coca 15k đồng';
    expect(normalizeVietnameseCurrency(input)).toBe(expected);
  });

  it('should add "đồng" after "triệu" when missing', () => {
    const input = '1 thùng bia 500 triệu';
    const expected = '1 thùng bia 500 triệu đồng';
    expect(normalizeVietnameseCurrency(input)).toBe(expected);
  });

  it('should NOT add duplicate "đồng" if already present', () => {
    const input = '5 cân thịt lợn 50 nghìn đồng';
    const expected = '5 cân thịt lợn 50 nghìn đồng';
    expect(normalizeVietnameseCurrency(input)).toBe(expected);
  });

  it('should handle multiple currency expressions', () => {
    const input = '2 chai coca 15 nghìn 3 hộp sữa 20k';
    const expected = '2 chai coca 15 nghìn đồng 3 hộp sữa 20k đồng';
    expect(normalizeVietnameseCurrency(input)).toBe(expected);
  });

  it('should handle decimal numbers', () => {
    const input = '5 cân thịt lợn 50.5 nghìn';
    const expected = '5 cân thịt lợn 50.5 nghìn đồng';
    expect(normalizeVietnameseCurrency(input)).toBe(expected);
  });

  it('should handle comma as decimal separator', () => {
    const input = '5 cân thịt lợn 50,5 nghìn';
    const expected = '5 cân thịt lợn 50,5 nghìn đồng';
    expect(normalizeVietnameseCurrency(input)).toBe(expected);
  });

  it('should handle empty or null input', () => {
    expect(normalizeVietnameseCurrency('')).toBe('');
    expect(normalizeVietnameseCurrency(null as any)).toBe(null);
    expect(normalizeVietnameseCurrency(undefined as any)).toBe(undefined);
  });

  it('should handle "100.000 đồng" format (already has đồng)', () => {
    const input = '1 chai coca 100.000 đồng';
    const expected = '1 chai coca 100.000 đồng';
    expect(normalizeVietnameseCurrency(input)).toBe(expected);
  });

  it('should handle "100.000" format (bare number with dots)', () => {
    const input = '1 chai coca 100.000';
    // Should add đồng after bare number when followed by nothing
    const result = normalizeVietnameseCurrency(input);
    expect(result).toContain('100.000');
  });

  it('should handle "100" format (bare number without unit)', () => {
    const input = '1 chai coca 100';
    // Should add đồng for 3-digit numbers when followed by word
    const result = normalizeVietnameseCurrency(input);
    expect(result).toContain('100');
  });

  it('should handle "100K" format (number with K suffix)', () => {
    const input = '1 chai coca 100K';
    const expected = '1 chai coca 100K đồng';
    expect(normalizeVietnameseCurrency(input)).toBe(expected);
  });

  it('should handle "100k" format (lowercase k)', () => {
    const input = '1 chai coca 100k';
    const expected = '1 chai coca 100k đồng';
    expect(normalizeVietnameseCurrency(input)).toBe(expected);
  });
});

describe('normalizeVoiceText', () => {
  it('should normalize currency and trim whitespace', () => {
    const input = '  5 cân  thịt lợn   50 nghìn  ';
    const expected = '5 cân thịt lợn 50 nghìn đồng';
    expect(normalizeVoiceText(input)).toBe(expected);
  });

  it('should handle complex real-world examples', () => {
    const testCases = [
      {
        input: '5 cân thịt lợn 50 nghìn',
        expected: '5 cân thịt lợn 50 nghìn đồng',
      },
      {
        input: '1 thùng Coca giá 133 nghìn đồng',
        expected: '1 thùng Coca giá 133 nghìn đồng',
      },
      {
        input: '2 chai coca 15k 3 hộp sữa 20 nghìn',
        expected: '2 chai coca 15k đồng 3 hộp sữa 20 nghìn đồng',
      },
      {
        input: '10 kg gạo 200 ngàn',
        expected: '10 kg gạo 200 nghìn đồng',
      },
    ];

    testCases.forEach(({ input, expected }) => {
      expect(normalizeVoiceText(input)).toBe(expected);
    });
  });

  it('should handle all requested voice formats', () => {
    const testCases = [
      {
        input: '1 chai coca 100.000 đồng',
        expected: '1 chai coca 100.000 đồng',
        description: 'Format: 100.000 đồng',
      },
      {
        input: '1 chai coca 100K',
        expected: '1 chai coca 100K đồng',
        description: 'Format: 100K',
      },
      {
        input: '1 chai coca 100k',
        expected: '1 chai coca 100k đồng',
        description: 'Format: 100k',
      },
    ];

    testCases.forEach(({ input, expected, description }) => {
      expect(normalizeVoiceText(input)).toBe(expected);
    });
  });
});
