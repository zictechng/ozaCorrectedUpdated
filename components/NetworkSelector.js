import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { spacing, radius, typography } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';

const NETWORKS = [
  { id: 'MTN',     label: 'MTN',     color: '#FFD700', bgColor: '#FFF9C4', textColor: '#7A6000' },
  { id: 'Airtel',  label: 'Airtel',  color: '#EF4444', bgColor: '#FEE2E2', textColor: '#991B1B' },
  { id: 'Glo',     label: 'Glo',     color: '#10B981', bgColor: '#D1FAE5', textColor: '#065F46' },
  { id: '9mobile', label: '9mobile', color: '#059669', bgColor: '#ECFDF5', textColor: '#064E3B' },
];

const NetworkSelector = ({ selectedNetwork, onSelect }) => {
  const { colors } = useThemeStyles();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecColor }]}>
        Select Network
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollRow}>
        {NETWORKS.map((network) => {
          const isSelected = selectedNetwork === network.id;
          return (
            <TouchableOpacity
              key={network.id}
              style={[
                styles.networkBtn,
                { backgroundColor: network.bgColor },
                isSelected && {
                  borderColor: network.color,
                  borderWidth: 2.5,
                },
              ]}
              onPress={() => onSelect(network.id)}
              activeOpacity={0.8}>
              <View style={[
                styles.networkDot,
                { backgroundColor: network.color },
              ]} />
              <Text style={[
                styles.networkLabel,
                { color: network.textColor },
                isSelected && { fontFamily: '_bold' },
              ]}>
                {network.label}
              </Text>
              {isSelected && (
                <View style={[
                  styles.selectedCheck,
                  { backgroundColor: network.color },
                ]}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
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
  scrollRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  networkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: 'transparent',
    minWidth: 90,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  networkDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  networkLabel: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
  },
  selectedCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  checkMark: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default NetworkSelector;
export { NETWORKS };