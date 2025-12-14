import React, { forwardRef, useEffect, useState } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import LoginScreen from '@/features/authentication/screens/LoginScreen';
import RememberLoginScreen from '@/features/authentication/screens/RememberLoginScreen';
import RegisterScreen from '@/features/authentication/screens/RegisterScreen';
import LoginOtpScreen from '@/features/authentication/screens/LoginOtpScreen';
import RegisterOtpScreen from '@/features/authentication/screens/RegisterOtpScreen';
import ForgotPasswordScreen from '@/features/authentication/screens/ForgotPasswordScreen';
import ForgotPasswordOtpScreen from '@/features/authentication/screens/ForgotPasswordOtpScreen';
import ResetPasswordScreen from '@/features/authentication/screens/ResetPasswordScreen';
import CreateStoreStartScreen from '@/features/authentication/screens/CreateStoreStartScreen';
import CreateStoreScreen from '@/features/authentication/screens/CreateStoreScreen';
import UploadBusinessLicenseScreen from '@/features/authentication/screens/UploadBusinessLicenseScreen';
import {
  UserDetailScreen,
  ProfileResetPasswordScreen,
  ProfileResetPasswordOtpScreen,
  ProfileResetPasswordNewPasswordScreen,
  ChangePasswordScreen,
  StoreDetailScreen,
  AppInformationScreen,
  SupportCenterScreen
} from '@/features/profile/screens';
import { NotificationScreen, SpeakerServiceScreen, LinkSpeakerScreen } from '@/features/notifications/screens';
import NotificationSettingsScreen from '@/features/profile/screens/NotificationSettingsScreen';
import SecuritySettingsScreen from '@/features/profile/screens/SecuritySettingsScreen';
import {
  AccountManagementScreen,
  PostpaidPaymentConfirmScreen,
  PostpaidPaymentOtpScreen,
  PostpaidPaymentSuccessScreen,
  CreateStoreSuccessScreen,
  PostpaidWalletScreen,
  PostpaidInstallmentScreen,
  PostpaidSettingsScreen,
  PostpaidTransactionHistoryScreen,
  PostpaidBillingScreen,
  PostpaidPaymentOptionsScreen,
} from '@/features/account/screens';
import { VoucherManagementScreen, CreateVoucherScreen } from '@/features/voucher/screens';
import BottomTabNavigator from './BottomTabNavigator';
import { ReportScreen } from '../features/report';
import QRMainScreen from '../features/payment/screens/QRMainScreen';
import QRReceiveMoneyScreen from '../features/payment/screens/QRReceiveMoneyScreen';
import { SavedRecipientsScreen, ScanQRScreen } from '../features/payment/screens';
import {
  TransferMoneyScreen,
  TransferConfirmScreen,
  TransferOtpScreen,
  TransferSuccessScreen
} from '../features/payment';
import {
  DepositWithdrawScreen,
  QRCodeDepositScreen,
  WithdrawConfirmationScreen,
  WithdrawOtpScreen,
  WithdrawSuccessScreen,
  LinkBankScreen
} from '@/features/deposit/screens';
import {
  TransactionHistoryScreen,
  TransactionDetailScreen
} from '@/features/transactions/screens';
import { useAuth } from '@/shared/components/AuthProvider';
import type { RootStackParamList } from './types';
import { EkycStartScreen, UserInfoScreen } from '../features/ekyc';
import { BankAccountScreen } from '@/features/banks/screen';
import EcontractSigningScreen from '@/features/econtract/screen/EcontractSigning';
import EcontractOtpScreen from '@/features/econtract/screen/EcontractOtpScreen';
import { EditContactScreen, EditContactOtpScreen } from '@/features/profile/screens';
import { PolicySecurityRiskScreen as PolicyScreen } from '@/features/profile/screens/PolicyScreen';
import { OTPVerificationScreen } from '@/features/otp/screens';
import HistoryScreen from '../features/transactions/screens/HistoryScreen';
import { CommissionHistoryScreen, CommissionPaymentScreen, CommissionOtpScreen, CommissionPaymentSuccessScreen } from '@/features/commission';
import { useNotificationNavigation } from '@/features/notifications/hooks/useNotificationNavigation';
import { CartScreen, DraftOrdersScreen } from '@/features/cart';
import CartPaymentConfirmScreen from '@/features/cart/screens/CartPaymentConfirmScreen';
import {
  ProductMenuScreen,
  ProductManagementScreen,
  SupplierManagementScreen,
  LocationManagementScreen,
  CategoryManagementScreen
} from '@/features/product';
import EditProductScreen from '@/features/product/screens/EditProductScreen';
import ProductDetailScreen from '@/features/product/screens/ProductDetailScreen';
import EditVariationScreen from '@/features/product/screens/EditVariationScreen';
import { OrderManagementScreen, OrderDetailScreen } from '@/features/order';
import {
  InventoryManagementScreen,
  InventoryHistoryScreen,
  StockCheckScreen,
  StockCheckDetailScreen,
  CreateImportScreen,
  CreateExportScreen,
  CreateStockCheckScreen,
} from '@/features/inventory/screens';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Component that renders inside NavigationContainer to handle notifications
const NavigationContent = () => {
  const { isAuthenticated } = useAuth();
  const [initialAuthRoute, setInitialAuthRoute] = useState<'Login' | 'RememberLogin'>('Login');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check for cached credentials on mount to determine initial route
  useEffect(() => {
    const checkInitialRoute = async () => {
      try {
        const { AutoLoginUtils } = await import('@/features/authentication/utils/autoLoginUtils');
        const cachedPhone = await AutoLoginUtils.getRememberedPhone();
        const cachedUserType = await AutoLoginUtils.getLastUserType();

        if (cachedPhone && cachedUserType) {
          console.log('✅ [RootNavigator] Found cached credentials, setting initial route to RememberLogin');
          setInitialAuthRoute('RememberLogin');
        } else {
          console.log('⚠️ [RootNavigator] No cached credentials, setting initial route to Login');
          setInitialAuthRoute('Login');
        }
      } catch (error) {
        console.error('❌ [RootNavigator] Error checking cached credentials:', error);
        setInitialAuthRoute('Login');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    if (!isAuthenticated) {
      checkInitialRoute();
    } else {
      setIsCheckingAuth(false);
    }
  }, [isAuthenticated]);

  // Use notification navigation hook - this must be inside NavigationContainer
  const notificationToast = useNotificationNavigation('top'); // You can change this to 'bottom' or 'center'

  // Show loading while checking auth route
  if (!isAuthenticated && isCheckingAuth) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {!isAuthenticated ? (
          // Auth Stack - order matters! First screen is the initial route
          <Stack.Group key="auth">
            {initialAuthRoute === 'RememberLogin' ? (
              <>
                <Stack.Screen
                  name="RememberLogin"
                  component={RememberLoginScreen}
                  options={{
                    animation: 'fade',
                  }}
                />
                <Stack.Screen
                  name="Login"
                  component={LoginScreen}
                  options={{
                    animation: 'fade',
                  }}
                />
              </>
            ) : (
              <>
                <Stack.Screen
                  name="Login"
                  component={LoginScreen}
                  options={{
                    animation: 'fade',
                  }}
                />
                <Stack.Screen
                  name="RememberLogin"
                  component={RememberLoginScreen}
                  options={{
                    animation: 'fade',
                  }}
                />
              </>
            )}
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="RegisterOtp" component={RegisterOtpScreen} />
            <Stack.Screen name="LoginOtp" component={LoginOtpScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen
              name="ForgotPasswordOtp"
              component={ForgotPasswordOtpScreen}
            />
            <Stack.Screen
              name="ResetPassword"
              component={ResetPasswordScreen}
            />
            <Stack.Screen name="Policy" component={PolicyScreen} />
          </Stack.Group>
        ) : (
          // Main App Stack
          <Stack.Group key="main">
            <Stack.Screen
              name="MainTabs"
              component={BottomTabNavigator}
              options={{
                animation: 'fade',
              }}
            />
            <Stack.Screen
              name="Main"
              component={BottomTabNavigator}
              options={{
                animation: 'fade',
              }}
            />
            <Stack.Screen
              name="QRPayment"
              component={QRMainScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="TransferMoney"
              component={TransferMoneyScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="TransferConfirm"
              component={TransferConfirmScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="TransferOtp"
              component={TransferOtpScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="TransferSuccess"
              component={TransferSuccessScreen}
              options={{
                animation: 'slide_from_right',
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="QRReceiveMoney"
              component={QRReceiveMoneyScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="UserDetail"
              component={UserDetailScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="Notification"
              component={NotificationScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="NotificationSettings"
              component={NotificationSettingsScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="SpeakerNotificationSettings"
              component={SpeakerServiceScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="LinkSpeaker"
              component={LinkSpeakerScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="SecuritySettings"
              component={SecuritySettingsScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="ProfileResetPassword"
              component={ProfileResetPasswordScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="ProfileResetPasswordOtp"
              component={ProfileResetPasswordOtpScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="ProfileResetPasswordNewPassword"
              component={ProfileResetPasswordNewPasswordScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="AccountManagement"
              component={AccountManagementScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="PostpaidWallet"
              component={PostpaidWalletScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="PostpaidInstallment"
              component={PostpaidInstallmentScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="PostpaidSettings"
              component={PostpaidSettingsScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="PostpaidTransactionHistory"
              component={PostpaidTransactionHistoryScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="PostpaidBilling"
              component={PostpaidBillingScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="PostpaidPaymentOptions"
              component={PostpaidPaymentOptionsScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="VoucherManagement"
              component={VoucherManagementScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="CreateVoucher"
              component={CreateVoucherScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="PostpaidPaymentConfirm"
              component={PostpaidPaymentConfirmScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="PostpaidPaymentOtp"
              component={PostpaidPaymentOtpScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="PostpaidPaymentSuccess"
              component={PostpaidPaymentSuccessScreen}
              options={{
                animation: 'slide_from_right',
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="TransactionDetail"
              component={TransactionDetailScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="DepositWithdraw"
              component={DepositWithdrawScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="QRCodeDeposit"
              component={QRCodeDepositScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="ScanQRScreen"
              component={ScanQRScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="WithdrawConfirmation"
              component={WithdrawConfirmationScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="LinkBank"
              component={LinkBankScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="WithdrawOtp"
              component={WithdrawOtpScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="WithdrawSuccess"
              component={WithdrawSuccessScreen}
              options={{
                animation: 'slide_from_right',
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="WithdrawHistory"
              component={TransactionHistoryScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="WithdrawTransactionDetail"
              component={TransactionDetailScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="StoreDetail"
              component={StoreDetailScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="CreateStoreStart"
              component={CreateStoreStartScreen}
            />
            <Stack.Screen
              name="CreateStore"
              component={CreateStoreScreen}
            />
            <Stack.Screen
              name="UploadBusinessLicense"
              component={UploadBusinessLicenseScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="CreateStoreSuccess"
              component={CreateStoreSuccessScreen}
              options={{
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="Contact"
              component={SavedRecipientsScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="Cart"
              component={CartScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="DraftOrders"
              component={DraftOrdersScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="ProductMenu"
              component={ProductMenuScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="ProductManagement"
              component={ProductManagementScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="ProductDetail"
              component={ProductDetailScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="EditProduct"
              component={EditProductScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="EditVariation"
              component={EditVariationScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="SupplierManagement"
              component={SupplierManagementScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="LocationManagement"
              component={LocationManagementScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="CategoryManagement"
              component={CategoryManagementScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="OrderManagement"
              component={OrderManagementScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="OrderDetail"
              component={OrderDetailScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="CartPaymentConfirm"
              component={CartPaymentConfirmScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            {/* Inventory Management */}
            <Stack.Screen
              name="InventoryManagement"
              component={InventoryManagementScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="InventoryHistory"
              component={InventoryHistoryScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="StockCheck"
              component={StockCheckScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="StockCheckDetail"
              component={StockCheckDetailScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="CreateImport"
              component={CreateImportScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="CreateExport"
              component={CreateExportScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="CreateStockCheck"
              component={CreateStockCheckScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            {/* eKYC Flow */}
            <Stack.Screen name="Ekyc" component={EkycStartScreen} />
            <Stack.Screen name="UserInfo" component={UserInfoScreen} />
            <Stack.Screen name="BankAccount" component={BankAccountScreen} />
            <Stack.Screen name="EcontractSigning" component={EcontractSigningScreen} options={{
              animation: 'slide_from_right',
            }} />
            <Stack.Screen name="EcontractOtp" component={EcontractOtpScreen} options={{
              animation: 'slide_from_right',
            }} />
            <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
            <Stack.Screen name="EditContact" component={EditContactScreen} />
            <Stack.Screen name="EditContactOtp" component={EditContactOtpScreen} />
            <Stack.Screen name="AppInformation" component={AppInformationScreen} />
            <Stack.Screen name="SupportCenter" component={SupportCenterScreen} />
            <Stack.Screen name="Policy" component={PolicyScreen} />
            <Stack.Screen name="CommissionHistory" component={CommissionHistoryScreen} />
            <Stack.Screen name="CommissionPayment" component={CommissionPaymentScreen} />
            <Stack.Screen name="CommissionOtp" component={CommissionOtpScreen} />
            <Stack.Screen
              name="CommissionPaymentSuccess"
              component={CommissionPaymentSuccessScreen}
              options={{
                gestureEnabled: false,
              }}
            />
          </Stack.Group>
        )}
      </Stack.Navigator>
      {notificationToast}
    </>
  );
};

const RootNavigator = forwardRef<NavigationContainerRef<RootStackParamList>>((props, ref) => {
  const { isLoading } = useAuth();

  // Log authentication state changes for debugging
  useEffect(() => {
    console.log('🔐 RootNavigator: Auth state changed', {
      isLoading,
      timestamp: new Date().toISOString(),
    });
  }, [isLoading]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00492B" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={ref}>
      <NavigationContent />
    </NavigationContainer>
  );
});

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default RootNavigator;
