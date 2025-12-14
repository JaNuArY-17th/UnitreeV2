/**
 * QR Payment Feature Usage Example
 * 
 * This example shows how to integrate the QR Payment screen into your navigation
 * and how to use the individual components.
 */

// 1. Add to your navigation stack
/*
import { QRScanScreen } from '@/features/payment';

// In your navigation stack:
<Stack.Screen 
  name="QRPayment" 
  component={QRScanScreen}
  options={{
    headerShown: false, // We use custom header
    gestureEnabled: true,
  }}
/>
*/

// 2. Navigate to QR Payment screen
/*
import { useNavigation } from '@react-navigation/native';

const navigation = useNavigation();

const handleQRPaymentPress = () => {
  navigation.navigate('QRPayment');
};
*/

// 3. Use individual components separately
/*
import { 
  QRCodeDisplay, 
  AccountSelector, 
  QRReceiveAction 
} from '@/features/payment';

// QR Code Display with custom data
<QRCodeDisplay
  qrData={{
    qrCode: 'your-qr-data',
    autoUpdateInterval: 30,
  }}
  onRefresh={() => refreshQRCode()}
  onPromotionPress={() => showPromotions()}
/>

// Account Selector
<AccountSelector
  accounts={userAccounts}
  selectedAccount={currentAccount}
  onAccountSelect={setCurrentAccount}
  onViewAll={() => navigation.navigate('AccountsList')}
/>

// QR Receive Action
<QRReceiveAction 
  onPress={() => navigation.navigate('QRReceive')}
/>
*/

// 4. Screen Features:
// ✅ Responsive design matching the provided mockup
// ✅ Ticket-style card layout using TicketCard component
// ✅ QR code display with barcode and auto-refresh
// ✅ Account/card selector with horizontal scroll
// ✅ Promotion section
// ✅ QR receive functionality
// ✅ TypeScript support
// ✅ Internationalization (Vietnamese & English)
// ✅ Proper theming and spacing
// ✅ Touch interactions and navigation

export {};
