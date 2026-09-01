import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useThemeStyles from '../hooks/useThemeStyles';

const InfoRow = ({ label, value, icon, valueColor }) => {
  const { S, colors } = useThemeStyles();

  return (
    <View style={S.infoRow}>
      <View style={S.infoIconBox}>
        <Ionicons name={icon} size={16} color={colors.primaryColor1} />
      </View>
      <View style={S.flex1}>
        <Text style={S.infoRowLabel}>{label}</Text>
        <Text style={[
          S.infoRowValue,
          valueColor && { color: valueColor },
        ]}
          numberOfLines={3}
          selectable>
          {value || '—'}
        </Text>
      </View>
    </View>
  );
};

export default InfoRow;