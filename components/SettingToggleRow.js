import React from 'react';
import { View, Text, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useThemeStyles from '../hooks/useThemeStyles';

const SettingToggleRow = ({
  icon, iconBg, iconColor,
  label, subtitle,
  value, onValueChange,
  disabled = false,
}) => {
  const { S, colors } = useThemeStyles();

  return (
    <View style={[S.menuItem, disabled && { opacity: 0.5 }]}>
      <View style={[S.menuIconBox, { backgroundColor: iconBg || colors.bgLight }]}>
        <Ionicons name={icon} size={20} color={iconColor || colors.primaryColor1} />
      </View>
      <View style={S.flex1}>
        <Text style={S.menuLabel}>{label}</Text>
        {subtitle && (
          <Text style={S.menuSubtitle} numberOfLines={2}>{subtitle}</Text>
        )}
      </View>
      <Switch
        trackColor={{ false: colors.dividerColor, true: colors.primaryColor1 + '80' }}
        thumbColor={value ? colors.primaryColor1 : '#f4f3f4'}
        onValueChange={onValueChange}
        value={value}
        disabled={disabled}
      />
    </View>
  );
};

export default SettingToggleRow;