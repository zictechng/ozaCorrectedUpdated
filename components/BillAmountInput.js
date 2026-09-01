import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, radius, typography } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';

const QUICK_AMOUNTS = ['100', '200', '500', '1000', '2000', '5000'];

const BillAmountInput = ({
  value,
  onChangeText,
  label,
  placeholder,
  prefix,
  quickAmounts,
  minAmount,
  maxAmount,
}) => {
  const { colors } = useThemeStyles();
  const [isFocused, setIsFocused] = useState(false);
  const amounts = quickAmounts || QUICK_AMOUNTS;

  const handleChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    onChangeText(cleaned);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecColor }]}>
        {label || 'Amount'}
      </Text>

      <View style={[
        styles.inputContainer,
        {
          borderColor: isFocused ? colors.primaryColor1 : colors.dividerColor,
          backgroundColor: isFocused
            ? colors.primaryColor1 + '10'
            : colors.bgCard,
        },
      ]}>
        <Text style={[styles.prefix, { color: colors.primaryColor1 }]}>
          {prefix || '₦'}
        </Text>
        <TextInput
          style={[styles.input, { color: colors.textBlack }]}
          value={value}
          onChangeText={handleChange}
          placeholder={placeholder || 'Enter amount'}
          placeholderTextColor={colors.textSecColor2}
          keyboardType="numeric"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {value !== '' && (
          <TouchableOpacity
            onPress={() => onChangeText('')}
            style={styles.clearBtn}>
            <Ionicons
              name="close-circle"
              size={20}
              color={colors.textSecColor}
            />
          </TouchableOpacity>
        )}
      </View>

      {(minAmount || maxAmount) && (
        <Text style={[styles.hint, { color: colors.textSecColor }]}>
          {minAmount && `Min: ₦${minAmount}`}
          {minAmount && maxAmount && ' • '}
          {maxAmount && `Max: ₦${maxAmount}`}
        </Text>
      )}

      <Text style={[styles.quickLabel, { color: colors.textSecColor }]}>
        Quick Select
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickRow}>
        {amounts.map((amount) => (
          <TouchableOpacity
            key={amount}
            style={[
              styles.quickBtn,
              {
                borderColor: value === amount
                  ? colors.primaryColor1
                  : colors.dividerColor,
                backgroundColor: value === amount
                  ? colors.bgLight
                  : colors.bgCard,
              },
            ]}
            onPress={() => onChangeText(amount)}
            activeOpacity={0.8}>
            <Text style={[
              styles.quickBtnText,
              {
                color: value === amount
                  ? colors.primaryColor1
                  : colors.textSecColor,
              },
            ]}>
              ₦{Number(amount).toLocaleString()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 56,
    marginBottom: spacing.xs,
  },
  prefix: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: '_semiBold',
    fontSize: typography.xl,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  hint: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  quickLabel: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
    marginBottom: spacing.sm,
  },
  quickRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  quickBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
  },
  quickBtnText: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
  },
});

export default BillAmountInput;