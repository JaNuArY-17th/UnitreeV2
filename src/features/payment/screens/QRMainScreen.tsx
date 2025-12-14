import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import QRPaymentScreen from './QRPaymentScreen';
import ScanQRScreen from './ScanQRScreen';
import { QRBottomActions } from '../components';
import VerificationRequiredOverlay from '@/shared/components/VerificationRequiredOverlay';

type QRTab = 'payment' | 'scan';

type QRMainScreenRouteProp = RouteProp<any, any>;

const QRMainScreen: React.FC = () => {
  const route = useRoute<QRMainScreenRouteProp>();
  const initialTab = (route.params as any)?.initialTab || 'scan';
  const [activeTab, setActiveTab] = useState<QRTab>(initialTab);

  const handleQRPaymentPress = () => {
    setActiveTab('payment');
  };

  const handleScanQRPress = () => {
    setActiveTab('scan');
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'payment':
        return <QRPaymentScreen hideBottomActions />;
      case 'scan':
        return <ScanQRScreen hideBottomActions />;
      default:
        return <QRPaymentScreen hideBottomActions />;
    }
  };

  return (
    <VerificationRequiredOverlay>
    <View style={styles.container}>
      {/* Active Screen Content */}
      <View style={styles.screenContainer}>
        {renderActiveScreen()}
      </View>
      
      {/* Bottom Tab Actions */}
      <View style={styles.bottomActionsContainer}>
        <QRBottomActions 
          onQRPaymentPress={handleQRPaymentPress}
          onScanQRPress={handleScanQRPress}
          activeTab={activeTab}
        />
      </View>
    </View>
    </VerificationRequiredOverlay>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  bottomActionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default QRMainScreen;
