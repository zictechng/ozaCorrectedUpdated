import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { spacing, radius, typography } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';

export default function MoreBottomSheet({
  titleText,
  iconType1,
  iconType2,
  iconType3,
  buttonLabel_paypal,
  buttonLabel_payooner,
  buttonLabel_bitcoin,
  onPress1,
  onPress2,
  onPress3,
}) {
  const { colors } = useThemeStyles();

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={[styles.title, { color: colors.textBlack }]}>{titleText}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecColor }]}>
        What do you want to do today? Select an option to get started.
      </Text>

      {/* Buttons */}
      <View style={styles.buttonList}>
        <TouchableOpacity
          style={[styles.optionBtn, { backgroundColor: colors.bgLight, borderColor: colors.dividerColor }]}
          onPress={onPress1}
          activeOpacity={0.8}>
          <View style={[styles.iconBox, { backgroundColor: colors.bgCard }]}>
            {iconType1}
          </View>
          <Text style={[styles.optionLabel, { color: colors.textBlack }]}>{buttonLabel_paypal}</Text>
          <Text style={[styles.optionArrow, { color: colors.textSecColor }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionBtn, { backgroundColor: colors.bgLight, borderColor: colors.dividerColor }]}
          onPress={onPress2}
          activeOpacity={0.8}>
          <View style={[styles.iconBox, { backgroundColor: colors.bgCard }]}>
            {iconType2}
          </View>
          <Text style={[styles.optionLabel, { color: colors.textBlack }]}>{buttonLabel_payooner}</Text>
          <Text style={[styles.optionArrow, { color: colors.textSecColor }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionBtn, { backgroundColor: colors.bgLight, borderColor: colors.dividerColor }]}
          onPress={onPress3}
          activeOpacity={0.8}>
          <View style={[styles.iconBox, { backgroundColor: colors.bgCard }]}>
            {iconType3}
          </View>
          <Text style={[styles.optionLabel, { color: colors.textBlack }]}>{buttonLabel_bitcoin}</Text>
          <Text style={[styles.optionArrow, { color: colors.textSecColor }]}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxxl,
  },
  title: {
    fontFamily: '_bold',
    fontSize: typography.xxl,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  buttonList: {
    gap: spacing.md,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLabel: {
    flex: 1,
    fontFamily: '_semiBold',
    fontSize: typography.base,
    lineHeight: 22,
  },
  optionArrow: {
    fontFamily: '_bold',
    fontSize: 22,
    lineHeight: 26,
  },
});