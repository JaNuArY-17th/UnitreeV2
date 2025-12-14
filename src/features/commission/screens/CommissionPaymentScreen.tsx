import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert, Pressable, StatusBar } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing, dimensions } from '../../../shared/themes';
import Text from '@/shared/components/base/Text';
import { useCommissionPayPlan, useStoreDashboard } from '../hooks';
import {
    CommissionPaymentSummary,
    CommissionPayPlanSection,
} from '../components';
import ScreenHeader from '@/shared/components/ScreenHeader';
import VerificationRequiredOverlay from '@/shared/components/VerificationRequiredOverlay';
import { commissionService } from '../services/commissionService';

const CommissionPaymentScreen = () => {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation('commission');
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    useStatusBarEffect('transparent', 'dark-content', true);

    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    // Fetch dashboard data for payment summary
    const { data: rawDashboardData, loading: dashboardLoading, error: dashboardError } = useStoreDashboard();

    // Fetch commission pay plan data
    const { data: payPlanData, loading: payPlanLoading, error: payPlanError, refetch } = useCommissionPayPlan();

    // Use dashboard data for payment summary
    const paymentSummary = useMemo(() => {
        if (!rawDashboardData) {
            return {
                totalRevenue: '0 đ',
                commissionPercentage: 0,
                totalReceiveAmount: '0 đ',
                totalCommissionPayment: '0 đ',
                nextPaymentDate: '',
                daysUntilPayment: 0,
            };
        }

        const { income } = rawDashboardData;

        // Calculate next payment date (25th of current/next month)
        const now = new Date();
        const currentDay = now.getDate();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let paymentMonth = currentMonth;
        let paymentYear = currentYear;

        if (currentDay > 25) {
            // Next month
            paymentMonth = currentMonth + 1;
            if (paymentMonth > 11) {
                paymentMonth = 0;
                paymentYear = currentYear + 1;
            }
        }

        const nextPaymentDate = new Date(paymentYear, paymentMonth, 25);
        const daysUntilPayment = Math.ceil((nextPaymentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Format amounts
        const formatAmount = (amount: string | number) => {
            const numAmount = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
            return numAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' đ';
        };

        return {
            totalRevenue: formatAmount(income.originalAmount),
            commissionPercentage: parseFloat(income.commissionPercent) || 0,
            totalReceiveAmount: formatAmount(income.receivedAmount),
            totalCommissionPayment: payPlanData ? formatAmount(payPlanData.totalPayment) : '0 đ',
            nextPaymentDate: nextPaymentDate.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }),
            daysUntilPayment,
        };
    }, [rawDashboardData, payPlanData]);

    const handlePayCommission = async () => {
        if (!payPlanData || payPlanData.payable.length === 0) {
            Alert.alert(t('error', 'Error'), t('noPayableCommissions', 'No payable commissions'));
            return;
        }

        try {
            setIsProcessingPayment(true);

            // Initiate commission payment
            const response = await commissionService.initiateCommissionPayment();

            if (response.success) {
                // Navigate to OTP screen
                navigation.navigate('CommissionOtp' as any, {
                    tempRequestId: response.data.requestId,
                });
            } else {
                Alert.alert(t('error', 'Error'), response.message || t('commissionPaymentFailed', 'Commission payment failed'));
            }
        } catch (error) {
            Alert.alert(t('error', 'Error'), t('commissionPaymentFailed', 'Commission payment failed'));
        } finally {
            setIsProcessingPayment(false);
        }
    };

    return (
        <VerificationRequiredOverlay>
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <StatusBar barStyle="dark-content" backgroundColor='transparent' />
                <ScreenHeader
                    title={t('commissionPayment', 'Commission Payment')}
                    showBack={true}
                />

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Section 1: Payment Summary */}
                    <CommissionPaymentSummary
                        totalRevenue={paymentSummary.totalRevenue}
                        commissionPercentage={paymentSummary.commissionPercentage}
                        totalReceiveAmount={paymentSummary.totalReceiveAmount}
                        totalCommissionPayment={paymentSummary.totalCommissionPayment}
                        nextPaymentDate={paymentSummary.nextPaymentDate}
                        daysUntilPayment={paymentSummary.daysUntilPayment}
                        onPayCommission={handlePayCommission}
                        isProcessing={isProcessingPayment}
                    />

                    {/* Section 2: Commission Pay Plan */}
                    {payPlanLoading ? (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>{t('loading', 'Loading...')}</Text>
                        </View>
                    ) : payPlanError ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{t('error', 'Error')}</Text>
                            <Pressable style={styles.retryButton} onPress={refetch}>
                                <Text style={styles.retryText}>{t('retry', 'Retry')}</Text>
                            </Pressable>
                        </View>
                    ) :  null}
                </ScrollView>
            </View>
        </VerificationRequiredOverlay>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.light,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: spacing.xl,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    loadingText: {
        color: colors.text.secondary,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    errorText: {
        color: colors.danger,
        marginBottom: spacing.md,
    },
    retryButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: dimensions.radius.md,
    },
    retryText: {
        color: colors.light,
        fontWeight: '600',
    },
});

export default CommissionPaymentScreen;