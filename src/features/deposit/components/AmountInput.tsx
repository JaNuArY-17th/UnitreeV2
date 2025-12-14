import React, { useRef, useEffect } from 'react'
import { View, StyleSheet, TextInput, Platform, Text } from 'react-native'

import { useTranslation } from 'react-i18next'

import { colors, spacing, typography } from '@/shared/themes'

type Props = {
  amount: string
  onAmountChange: (amount: string) => void
  maxLength?: number
  autoFocus?: boolean
  editable?: boolean
  error?: string
}

const AmountInput: React.FC<Props> = ({
  amount,
  onAmountChange,
  maxLength = 12,
  autoFocus = false,
  editable = true,
  error,
}) => {
  const inputRef = useRef<TextInput>(null)
  const { t } = useTranslation('payment')

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      // Small delay to ensure the component is mounted
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [autoFocus])

  const handleTextChange = (text: string) => {
    // Remove all non-digit characters and thousand separators
    const cleanText = text.replace(/[^\d]/g, '')

    // Limit length
    if (cleanText.length <= maxLength) {
      onAmountChange(cleanText)
    }
  }
  // Format display with thousand separators but without đ suffix
  const formattedValue = React.useMemo(() => {
    console.log('🔍 [AmountInput] amount:', amount)
    if (!amount || amount === '') {
      return ''
    }
    const numValue = Number(amount)
    if (isNaN(numValue) || numValue === 0) {
      return ''
    }
    const formatted = parseInt(amount, 10).toLocaleString('vi-VN')
    console.log('🔍 [AmountInput] formattedValue:', formatted)
    return formatted
  }, [amount])

  console.log('🔍 [AmountInput] Rendering with value:', formattedValue)

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t('transfer.transferAmount')}</Text>

      <View
        style={[
          styles.inputWrapper,
          !editable && styles.inputWrapperDisabled,
          error && styles.inputWrapperError,
        ]}
      >
        <Text
          style={[
            styles.currencySymbol,
            !editable && styles.textDisabled,
            error && styles.textError,
          ]}
        >
          đ
        </Text>
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            !editable && styles.textDisabled,
            error && styles.textError,
          ]}
          value={formattedValue}
          onChangeText={handleTextChange}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={colors.text.secondary}
          editable={editable}
          selectTextOnFocus
          selectionColor={error ? colors.danger : colors.primary}
          returnKeyType="done"
          underlineColorAndroid="transparent"
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.title,
    marginBottom: spacing.sm,
    textAlign: 'left',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    minHeight: 60,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.light,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  inputWrapperDisabled: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  inputWrapperError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  textDisabled: {
    color: colors.text.secondary,
  },
  textError: {
    color: colors.danger,
  },
  currencySymbol: {
    ...typography.h2,
    color: colors.primary,
    marginRight: spacing.sm,
    includeFontPadding: false,
  },
  input: {
    flex: 1,
    ...typography.h1,
    color: colors.primary,
    textAlign: 'left',
    padding: 0,
    margin: 0,
    includeFontPadding: false,
    ...Platform.select({
      ios: {
        paddingTop: 0,
        paddingBottom: 0,
      },
      android: {
        textAlignVertical: 'center',
        paddingTop: 0,
        paddingBottom: 0,
      },
    }),
  },
})

export default AmountInput
