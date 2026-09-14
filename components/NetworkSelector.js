import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { spacing, radius, typography } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';
import client from '../contextAPI/client';

// Fallback colors per network name — used when backend
// does not return color info
const NETWORK_COLORS = {
  mtn:     { color: '#b79d0fbe', bgColor: '#FFF9C4', textColor: '#7A6000' },
  airtel:  { color: '#EF4444',   bgColor: '#FEE2E2', textColor: '#991B1B' },
  glo:     { color: '#10B981',   bgColor: '#D1FAE5', textColor: '#065F46' },
  '9mobile':{ color: '#059669',  bgColor: '#ECFDF5', textColor: '#064E3B' },
};

const getNetworkStyle = (name = '') => {
  return NETWORK_COLORS[name.toLowerCase()] || {
    color: '#6B7280', bgColor: '#F3F4F6', textColor: '#374151',
  };
};

const NetworkSelector = ({ selectedNetwork, onSelect, serviceType = 'airtime' }) => {
  const { colors } = useThemeStyles();
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNetworks = async () => {
      setLoading(true);
      try {
        const res = await client.get(`/api/bills/networks/${serviceType}`);
        if (res.data.msg === '200' && res.data.networks?.length > 0) {
          setNetworks(res.data.networks);
        } else {
          // Fallback to static list
          setNetworks(FALLBACK_NETWORKS);
        }
      } catch (error) {
        setNetworks(FALLBACK_NETWORKS);
      } finally {
        setLoading(false);
      }
    };
    fetchNetworks();
  }, [serviceType]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.label, { color: colors.textSecColor }]}>
          Select Network
        </Text>
        <ActivityIndicator size="small" color={colors.primaryColor1} style={{ marginTop: spacing.sm }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecColor }]}>
        Select Network
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollRow}>
        {networks.map((network) => {
          const networkId = network.id || network.name;
          const isSelected = selectedNetwork === networkId;
          const style = getNetworkStyle(networkId);
          return (
            <TouchableOpacity
              key={networkId}
              style={[
                styles.networkBtn,
                { backgroundColor: style.bgColor },
                isSelected && {
                  borderColor: style.color,
                  borderWidth: 2.5,
                },
              ]}
              onPress={() => onSelect(networkId, network)}
              activeOpacity={0.8}>
              <View style={[styles.networkDot, { backgroundColor: style.color }]} />
              <Text style={[
                styles.networkLabel,
                { color: style.textColor },
                isSelected && { fontFamily: '_bold' },
              ]}>
                {network.name || network.id}
              </Text>
              {isSelected && (
                <View style={[styles.selectedCheck, { backgroundColor: style.color }]}>
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

// Static fallback if API is down
const FALLBACK_NETWORKS = [
  { id: 'MTN',     name: 'MTN' },
  { id: 'Airtel',  name: 'Airtel' },
  { id: 'Glo',     name: 'Glo' },
  { id: '9mobile', name: '9mobile' },
];

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
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
  networkDot: { width: 10, height: 10, borderRadius: 5 },
  networkLabel: { fontFamily: '_semiBold', fontSize: typography.base },
  selectedCheck: {
    width: 18, height: 18, borderRadius: 9,
    justifyContent: 'center', alignItems: 'center', marginLeft: 4,
  },
  checkMark: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
});

export default NetworkSelector;
export { FALLBACK_NETWORKS as NETWORKS };