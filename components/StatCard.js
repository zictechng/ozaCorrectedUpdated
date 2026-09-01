import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useThemeStyles from '../hooks/useThemeStyles';

const StatCard = ({ label, value, icon, color }) => {
  const { S } = useThemeStyles();

  return (
    <View style={S.statCard}>
      <View style={[S.listIconBox, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={[S.statValue, { color }]} numberOfLines={1}>{value}</Text>
      <Text style={S.statLabel} numberOfLines={2}>{label}</Text>
    </View>
  );
};

export default StatCard;