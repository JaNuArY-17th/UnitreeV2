import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/shared/themes';

interface PaymentDateProgressBarProps {
    dueDate: string;
    height?: number;
    backgroundColor?: string;
    progressColor?: string;
    borderRadius?: number;
}

export const PaymentDateProgressBar: React.FC<PaymentDateProgressBarProps> = ({
    dueDate,
    height = 8,
    backgroundColor = colors.lightGray,
    progressColor = colors.primary,
    borderRadius = 4,
}) => {
    // Calculate days remaining until due date
    const getDaysRemaining = (dueDateStr: string): number => {
        const today = new Date();
        const due = new Date(dueDateStr);
        const timeDifference = due.getTime() - today.getTime();
        return Math.ceil(timeDifference / (1000 * 3600 * 24));
    };

    // Assume 30-day billing cycle for progress calculation
    const billingCycleDays = 30;
    const daysRemaining = getDaysRemaining(dueDate);
    const daysPassed = Math.max(0, billingCycleDays - daysRemaining);

    // Calculate progress percentage (0-100)
    const progressPercentage = Math.min((daysPassed / billingCycleDays) * 100, 100);

    // Determine color based on urgency
    const getProgressColor = () => {
        if (daysRemaining <= 3) return colors.danger; // Critical - 3 days or less
        if (daysRemaining <= 7) return colors.warning; // Warning - 7 days or less
        return colors.success; // Normal - more than 7 days
    };

    const dynamicProgressColor = progressColor === colors.primary ? getProgressColor() : progressColor;

    return (
        <View style={[
            styles.container,
            {
                height,
                backgroundColor,
                borderRadius,
            }
        ]}>
            <View
                style={[
                    styles.progressFill,
                    {
                        width: `${progressPercentage}%`,
                        backgroundColor: dynamicProgressColor,
                        borderRadius,
                    }
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
    },
});