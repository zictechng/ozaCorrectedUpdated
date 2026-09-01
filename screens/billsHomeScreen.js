import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { gs, spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';

import { AuthContext } from '../contextAPI/authContext';
import client from '../contextAPI/client';

// ── Service Status Badge ──────────────────────────
const ServiceBadge = ({ status }) => {
  const { colors } = useThemeStyles();
  if (status === 'active') return (
    <View style={[gs.badgeSuccess, styles.badge]}>
      <Text style={gs.badgeSuccessText}>Active</Text>
    </View>
  );
  if (status === 'paused') return (
    <View style={[gs.badgeWarning, styles.badge]}>
      <Text style={gs.badgeWarningText}>Maintenance</Text>
    </View>
  );
  return null;
};

// ── Service Card Component ────────────────────────
const ServiceCard = ({ service, onPress }) => {
  const { colors } = useThemeStyles();
  const isDisabled = service.status === 'paused';
  const isHidden = service.status === 'hidden';

  if (isHidden) return null;

  return (
    <TouchableOpacity
      style={[styles.serviceCard, isDisabled && styles.serviceCardDisabled]}
      onPress={isDisabled ? null : onPress}
      activeOpacity={0.85}>

      {/* Icon */}
      <LinearGradient
        colors={isDisabled
          ? ['#E5E7EB', '#D1D5DB']
          : service.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.serviceIconBox}>
        <MaterialCommunityIcons
          name={service.icon}
          size={28}
          color={isDisabled ? colors.textSecColor : '#fff'}
        />
      </LinearGradient>

      {/* Info */}
      <View style={styles.serviceInfo}>
        <View style={styles.serviceTopRow}>
          <Text style={[
            styles.serviceTitle,
            isDisabled && { color: colors.textSecColor },
          ]}>
            {service.title}
          </Text>
          <ServiceBadge status={service.status} />
        </View>
        <Text style={styles.serviceDesc} numberOfLines={2}>
          {isDisabled
            ? 'This service is temporarily under maintenance'
            : service.desc}
        </Text>
        {service.providers && !isDisabled && (
          <View style={styles.providersRow}>
            {service.providers.map((p, i) => (
              <View key={i} style={styles.providerChip}>
                <Text style={styles.providerChipText}>{p}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Arrow */}
      {!isDisabled && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.textSecColor}
        />
      )}
      {isDisabled && (
        <Ionicons
          name="time-outline"
          size={20}
          color={colors.warningColor}
        />
      )}
    </TouchableOpacity>
  );
};

// ── Recent Bill Transaction Item ──────────────────
const RecentBillItem = ({ item }) => (
  <View style={styles.recentItem}>
    <View style={[styles.recentIconBox, { backgroundColor: item.bgColor }]}>
      <MaterialCommunityIcons name={item.icon} size={18} color={item.color} />
    </View>
    <View style={styles.recentInfo}>
      <Text style={styles.recentTitle}>{item.title}</Text>
      <Text style={styles.recentDate}>{item.date}</Text>
    </View>
    <View style={styles.recentRight}>
      <Text style={styles.recentAmount}>{item.amount}</Text>
      <View style={item.success ? gs.badgeSuccess : gs.badgeDanger}>
        <Text style={item.success
          ? gs.badgeSuccessText
          : gs.badgeDangerText}>
          {item.status}
        </Text>
      </View>
    </View>
  </View>
);

// ── Main Bills Home Screen ────────────────────────
const BillsHomeScreen = ({ navigation }) => {
  const isFocused = useIsFocused();
  const { S, colors, isDark } = useThemeStyles();
  const { userToken, userInfo } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentBills, setRecentBills] = useState([]);
  const [billServices, setBillServices] = useState({
    airtime: 'active',
    electricity: 'active',
    mobile_data: 'active',
    tv_subscription: 'active',
    waec: 'active',
    neco: 'active',
    jamb: 'active',
    nabteb: 'active',
  });

  // ── Services Config ───────────────────────────
  const services = [
    {
      id: 'airtime',
      title: 'Buy Airtime',
      desc: 'Recharge MTN, Airtel, Glo & 9mobile airtime instantly at discounted rates',
      icon: 'phone-in-talk',
      gradientColors: ['#EC4899', '#DB2777'],
      status: billServices.airtime || 'active',
      providers: ['MTN', 'Airtel', 'Glo', '9mobile'],
      route: 'Airtime',
    },
    {
      id: 'electricity',
      title: 'Electricity Tokens',
      desc: 'Buy prepaid & postpaid tokens for all 11 DISCOs instantly',
      icon: 'lightning-bolt',
      gradientColors: ['#F59E0B', '#D97706'],
      status: billServices.electricity,
      providers: ['IKEDC', 'EKEDC', 'AEDC', 'PHED', '+7 more'],
      route: 'Electricity',
    },
    {
      id: 'mobile_data',
      title: 'Mobile Data',
      desc: 'Buy data bundles for MTN, Airtel, Glo & 9mobile at cheap rates',
      icon: 'wifi',
      gradientColors: ['#3B82F6', '#1D4ED8'],
      status: billServices.mobile_data,
      providers: ['MTN', 'Airtel', 'Glo', '9mobile'],
      route: 'MobileData',
    },
    {
      id: 'tv_subscription',
      title: 'TV Subscriptions',
      desc: 'Renew DSTV, GOtv & Startimes subscriptions instantly',
      icon: 'television-play',
      gradientColors: ['#8B5CF6', '#6D28D9'],
      status: billServices.tv_subscription,
      providers: ['DSTV', 'GOtv', 'Startimes'],
      route: 'TVSubscription',
    },
    {
      id: 'waec',
      title: 'WAEC Scratch Card',
      desc: 'Buy WAEC result checker PIN instantly — delivered to your inbox',
      icon: 'school-outline',
      gradientColors: ['#10B981', '#059669'],
      status: billServices.waec,
      providers: ['WAEC'],
      route: 'ExamCards',
      params: { examType: 'waec' },
    },
    {
      id: 'neco',
      title: 'NECO Result Checker',
      desc: 'Buy NECO result checker PIN — instant delivery guaranteed',
      icon: 'certificate-outline',
      gradientColors: ['#EF4444', '#DC2626'],
      status: billServices.neco,
      providers: ['NECO'],
      route: 'ExamCards',
      params: { examType: 'neco' },
    },
    {
      id: 'jamb',
      title: 'JAMB e-PIN',
      desc: 'Buy JAMB UTME result checker e-PIN — instant delivery',
      icon: 'book-open-page-variant',
      gradientColors: ['#0EA5E9', '#0284C7'],
      status: billServices.jamb,
      providers: ['JAMB'],
      route: 'ExamCards',
      params: { examType: 'jamb' },
    },
    {
      id: 'nabteb',
      title: 'NABTEB Scratch Card',
      desc: 'Buy NABTEB result checker PIN — fast and reliable delivery',
      icon: 'clipboard-text-outline',
      gradientColors: ['#F97316', '#EA580C'],
      status: billServices.nabteb,
      providers: ['NABTEB'],
      route: 'ExamCards',
      params: { examType: 'nabteb' },
    },
  ];

  // ── Fetch Bill Services Status ───────────────
  const fetchBillServicesStatus = async () => {
    try {
      const res = await client.get('/api/bills_services_status', {
        headers: { 'Authorization': 'Bearer ' + userToken },
      });
      if (res.data.msg === '200') {
        setBillServices(res.data.services);
      }
    } catch (error) {
      console.log('Bills status error:', error.message);
    }
  };

  // ── Fetch Recent Bill Transactions ───────────
  const fetchRecentBills = async () => {
    setIsLoading(true);
    try {
      const res = await client.get(
        '/api/bills/history/' + userInfo?.userData?._id,
        { headers: { 'Authorization': 'Bearer ' + userToken } }
      );
      if (res.data.msg === '200') {
        setRecentBills(res.data.data || []);
      }
    } catch (error) {
      console.log('Recent bills error:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchBillServicesStatus();
      fetchRecentBills();
    }
  }, [isFocused]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchBillServicesStatus();
    fetchRecentBills();
    setTimeout(() => setIsRefreshing(false), 1500);
  }, []);

  // ── Active Services Count ────────────────────
  const activeCount = services.filter(s => s.status === 'active').length;
  const maintenanceCount = services.filter(s => s.status === 'paused').length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgColor }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bgColor}
      />

      {/* ── Header ───────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={gs.homeSideMenu}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textBlack} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bill Payments</Text>
        <TouchableOpacity
          style={gs.homeSideMenu}
          onPress={handleRefresh}>
          <Ionicons name="refresh-outline" size={22} color={colors.primaryColor1} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primaryColor1}
            colors={[colors.primaryColor1]}
          />
        }>

        {/* ── Hero Banner ──────────────────────── */}
        <LinearGradient
          colors={[colors.primaryColor1, colors.primaryColor1b]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}>
          <View style={styles.heroBannerCircle1} />
          <View style={styles.heroBannerCircle2} />
          <View>
            <Text style={styles.heroTitle}>Pay Bills Instantly</Text>
            <Text style={styles.heroDesc}>
              Fast, secure & reliable bill payments
            </Text>
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatNumber}>{activeCount}</Text>
              <Text style={styles.heroStatLabel}>Active</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatNumber}>{maintenanceCount}</Text>
              <Text style={styles.heroStatLabel}>Maintenance</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatNumber}>{services.length}</Text>
              <Text style={styles.heroStatLabel}>Services</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Services List ─────────────────────── */}
        <View style={gs.sectionHeader}>
          <Text style={gs.sectionTitle}>Available Services</Text>
          <Text style={styles.serviceCount}>
            {activeCount} of {services.length} active
          </Text>
        </View>

        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onPress={() => navigation.navigate(
              service.route,
              service.params || {}
            )}
          />
        ))}

        {/* ── Recent Transactions ───────────────── */}
        {recentBills.length > 0 && (
          <>
            <View style={[gs.sectionHeader, { marginTop: spacing.xl }]}>
              <Text style={gs.sectionTitle}>Recent Bills</Text>
            </View>
            {recentBills.slice(0, 5).map((item, index) => (
              <RecentBillItem key={index} item={item} />
            ))}
          </>
        )}

        {/* ── Info Notice ───────────────────────── */}
        <View style={styles.infoCard}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={colors.primaryColor1}
          />
          <Text style={styles.infoText}>
            Services marked as <Text style={styles.infoHighlight}>Maintenance</Text> are
            temporarily unavailable. Check back soon or contact support for assistance.
          </Text>
        </View>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    
  },
  headerTitle: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    
  },

  // Hero Banner
  heroBanner: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  heroBannerCircle1: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  heroBannerCircle2: {
    position: 'absolute',
    left: -20,
    bottom: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  heroTitle: {
    fontFamily: '_bold',
    fontSize: typography.xxl,
    marginBottom: spacing.xs,
  },
  heroDesc: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    marginBottom: spacing.lg,
  },
  heroStats: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  heroStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatNumber: {
    fontFamily: '_bold',
    fontSize: typography.xl,
  },
  heroStatLabel: {
    fontFamily: '_regular',
    fontSize: typography.xs,
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    marginHorizontal: spacing.sm,
  },

  // Service Count
  serviceCount: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    
  },

  // Service Card
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  serviceCardDisabled: {
    opacity: 0.75,
  },
  serviceIconBox: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  serviceInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  serviceTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  serviceTitle: {
    fontFamily: '_bold',
    fontSize: typography.base,
    
    flex: 1,
    marginRight: spacing.sm,
  },
  serviceDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  providersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  providerChip: {
    
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  providerChipText: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
    
  },
  badge: {
    marginLeft: spacing.xs,
  },

  // Recent Bills
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  recentIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  recentInfo: {
    flex: 1,
  },
  recentTitle: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    
  },
  recentDate: {
    fontFamily: '_regular',
    fontSize: typography.xs,
    
    marginTop: 2,
  },
  recentRight: {
    alignItems: 'flex-end',
  },
  recentAmount: {
    fontFamily: '_bold',
    fontSize: typography.base,
    
    marginBottom: 4,
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
    borderWidth: 1,
  },
  infoText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    
    lineHeight: 22,
    flex: 1,
    marginLeft: spacing.sm,
  },
  infoHighlight: {
    fontFamily: '_semiBold',
    
  },
});

export default BillsHomeScreen;
