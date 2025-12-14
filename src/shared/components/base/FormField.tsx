import React from 'react';
import { View, StyleSheet, TextInput, TextInputProps, Touchable, Pressable, ScrollView } from 'react-native';
import { colors, spacing, getFontFamily, FONT_WEIGHTS, dimensions } from '@/shared/themes';
import Text from './Text';
import PencilEdit from '@/shared/assets/icons/PencilEdit';

export interface FormFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  containerStyle?: any;
  inputStyle?: any;
  error?: string;
  helperText?: string;
  showEditButton?: boolean;
  scrollAble?: boolean;
  onEditPress?: () => void;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  containerStyle,
  inputStyle,
  error,
  helperText,
  scrollAble = false,
  editable = true,
  showEditButton = false,
  onEditPress,
  ...textInputProps
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text variant="label" style={styles.label}>
        {label}
      </Text>
      <View style={[
        styles.inputContainer,
        !editable && styles.disabledContainer,
      ]}>
        {scrollAble && !editable ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            style={styles.scrollView}
          >
            <Text style={[styles.input, styles.disabledInput, styles.scrollableText]}>
              {value || ''}
            </Text>
          </ScrollView>
        ) : (
          <TextInput
            style={[styles.input,
              inputStyle,
            !editable && styles.disabledInput,
            showEditButton && styles.inputWithButton,
            scrollAble && !showEditButton && styles.horizontalScrollableInput,
            scrollAble && showEditButton && styles.scrollableInputWithButton,
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholderTextColor="#9CA3AF"
            editable={editable && !showEditButton}
            scrollEnabled={scrollAble}
            multiline={false}
            numberOfLines={1}
            textAlignVertical='center'
            showSoftInputOnFocus={editable && !showEditButton}
            {...textInputProps}
          />
        )}

        {showEditButton && (
          <View style={styles.buttonContainer}>
            <Pressable onPress={onEditPress} style={styles.editButton}>
              <PencilEdit width={16} height={16} color={colors.text.primary} />
            </Pressable>
          </View>
        )}
      </View>

      {error && (
        <Text variant="caption" style={styles.errorText}>
          {error}
        </Text>
      )}
      {helperText && !error && (
        <Text variant="caption" style={styles.helperText}>
          {helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  label: {
    color: '#6B7280',

    fontSize: dimensions.fontSize.md,
    // letterSpacing: 0.2,
    //
  },
  inputContainer: {
    backgroundColor: colors.lightGray,
    borderRadius: dimensions.radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  disabledContainer: {
    backgroundColor: colors.lightGray,
  },
  input: {
    fontSize: dimensions.fontSize.lg,
    color: colors.text.primary,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    letterSpacing: 0.2,
    padding: 0,
    margin: 0,
    flex: 1,
  },
  disabledInput: {
    color: colors.text.primary,
  },
  errorText: {
    color: colors.danger,
    fontSize: dimensions.fontSize.sm,
  },
  helperText: {
    color: colors.text.secondary,
    fontSize: dimensions.fontSize.sm,
  },
  editIcon: {
    position: 'absolute',
    right: dimensions.spacing.lg,
    top: dimensions.spacing.lg,
  },
  inputWithButton: {
    marginRight: spacing.xxxl, // Space for edit button
  },
  buttonContainer: {
    position: 'absolute',
    right: dimensions.spacing.md,
    top: '85%',
    transform: [{ translateY: -12 }],
  },
  editButton: {
    padding: dimensions.spacing.sm,
  },
  horizontalScrollableInput: {
    textAlign: 'left',
    textAlignVertical: 'center',
    minWidth: '100%',
  },
  scrollableInputWithButton: {
    textAlign: 'left',
    textAlignVertical: 'center',
    minWidth: '100%',
    paddingRight: spacing.xxxl,
  },
  scrollView: {
    flex: 1,
    height: 24,
  },
  scrollContent: {
    alignItems: 'center',
    minWidth: '100%',
  },
  scrollableText: {
    lineHeight: 24,
    paddingVertical: 0,
  },
});

export default FormField;
