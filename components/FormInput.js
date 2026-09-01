import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { spacing, radius, typography } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';

const FormInput = ({
  label,
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  maxLength,
  error,
  hint,
  editable = true,
  rightElement,
  multiline = false,
  numberOfLines = 1,
  onFocus: onFocusProp,
  onBlur: onBlurProp,
}) => {
  const { colors } = useThemeStyles();
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry || false);

  const handleFocus = () => {
    setIsFocused(true);
    onFocusProp?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlurProp?.();
  };

  const borderColor = error
    ? colors.dangerColor
    : isFocused
      ? colors.primaryColor1
      : colors.dividerColor;

  const bgColor = error
    ? colors.lightRed + '30'
    : isFocused
      ? colors.primaryColor1 + '10'
      : colors.bgCard;

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecColor }]}>
          {label}
        </Text>
      )}
      <View style={[
        styles.inputContainer,
        {
          borderColor,
          backgroundColor: bgColor,
          minHeight: multiline ? 90 : 52,
          alignItems: multiline ? 'flex-start' : 'center',
        },
      ]}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? colors.primaryColor1 : colors.textSecColor}
            style={[styles.icon, multiline && { marginTop: spacing.sm }]}
          />
        )}
        <TextInput
          style={[
            styles.input,
            { color: colors.textBlack },
            multiline && styles.multilineInput,
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecColor2}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          maxLength={maxLength}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsSecure(!isSecure)}
            style={styles.eyeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather
              name={isSecure ? 'eye-off' : 'eye'}
              size={18}
              color={colors.textSecColor}
            />
          </TouchableOpacity>
        )}
        {rightElement && !secureTextEntry && (
          <View style={styles.rightEl}>{rightElement}</View>
        )}
      </View>
      {error && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color={colors.dangerColor} />
          <Text style={[styles.errorText, { color: colors.dangerColor }]}>
            {error}
          </Text>
        </View>
      )}
      {hint && !error && (
        <Text style={[styles.hint, { color: colors.textSecColor }]}>
          {hint}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    marginBottom: spacing.xs,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: '_regular',
    fontSize: typography.base,
    paddingVertical: spacing.md,
    lineHeight: 22,
  },
  multilineInput: {
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
  eyeBtn: {
    padding: spacing.xs,
  },
  rightEl: {
    marginLeft: spacing.xs,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  errorText: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    lineHeight: 20,
    flex: 1,
  },
  hint: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
});

export default FormInput;