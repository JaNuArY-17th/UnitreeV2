export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit?: string;
  image?: string;
  abbreviation?: string; // For avatar display
  isVoiceItem?: boolean; // Flag to identify if item was added via voice
}

export interface PaymentMethod {
  id: 'cash' | 'transfer';
  label: string;
  icon: string;
  selected: boolean;
}

export interface CartSummary {
  subtotal: number;
  discount: number;
  total: number;
}

// Export invoice types
export * from './invoice';
