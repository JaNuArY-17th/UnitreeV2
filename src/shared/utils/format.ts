// Reusable currency formatter for VND style amounts with dot thousand separators, no decimals, and 'đ' suffix.
export function formatVND(amount: number): string {
  // Force integer VND, keep sign if negative, dot thousand, no decimals, suffix 'đ' without space
  const n = Math.round(Number.isFinite(amount) ? amount : 0);
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  const withDots = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}${withDots}đ`;
}

export default formatVND;
