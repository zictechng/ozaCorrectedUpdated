import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, Linking, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';
import { applicationDetails } from '../components/controls';

// ── Feature Card ──────────────────────────────────
const FeatureCard = ({ icon, iconBg, iconColor, title, desc, colors }) => (
  <View style={[styles.featureCard, {
    backgroundColor: colors.bgCard,
    borderColor: colors.dividerColor,
  }]}>
    <View style={[styles.featureIconBox, { backgroundColor: iconBg }]}>
      <Ionicons name={icon} size={22} color={iconColor} />
    </View>
    <View style={styles.featureInfo}>
      <Text style={[styles.featureTitle, { color: colors.textBlack }]}>{title}</Text>
      <Text style={[styles.featureDesc, { color: colors.textSecColor }]}>{desc}</Text>
    </View>
  </View>
);

// ── Stat Item ─────────────────────────────────────
const StatItem = ({ value, label }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ── Link Row ──────────────────────────────────────
const LinkRow = ({ icon, label, url, colors }) => (
  <TouchableOpacity
    style={[styles.linkRow, { borderBottomColor: colors.dividerColor }]}
    onPress={() => url && Linking.openURL(url)}
    activeOpacity={0.8}>
    <View style={[styles.linkIconBox, { backgroundColor: colors.bgLight }]}>
      <Ionicons name={icon} size={18} color={colors.primaryColor1} />
    </View>
    <Text style={[styles.linkLabel, { color: colors.textBlack }]}>{label}</Text>
    <Ionicons name="chevron-forward" size={16} color={colors.textSecColor} />
  </TouchableOpacity>
);

const FEATURES = [
  {
    icon: 'swap-horizontal-outline',
    iconBg: '#EEF2FF',
    iconColor: '#4C5FD5',
    title: 'Buy & Sell Digital Assets',
    desc: 'Trade PayPal, Payoneer and Bitcoin at the best rates with instant processing.',
  },
  {
    icon: 'flash-outline',
    iconBg: '#FEF3C7',
    iconColor: '#F59E0B',
    title: 'Bill Payments',
    desc: 'Pay electricity, airtime, data, TV subscriptions and exam cards instantly.',
  },
  {
    icon: 'shield-checkmark-outline',
    iconBg: '#D1FAE5',
    iconColor: '#10B981',
    title: 'Secure & Reliable',
    desc: 'Bank-level security with end-to-end encryption protecting your funds and data.',
  },
  {
    icon: 'gift-outline',
    iconBg: '#FFF3CD',
    iconColor: '#F0A500',
    title: 'Rewards & Coins',
    desc: 'Earn coins on every transaction and referral. Unlock quarterly gift rewards.',
  },
  {
    icon: 'people-outline',
    iconBg: '#FCE7F3',
    iconColor: '#EC4899',
    title: 'Referral Programme',
    desc: 'Share your referral code and earn commissions on every purchase made by friends.',
  },
  {
    icon: 'headset-outline',
    iconBg: '#DBEAFE',
    iconColor: '#3B82F6',
    title: '24/7 Support',
    desc: 'Our support team is always available to help you via WhatsApp, Email or Telegram.',
  },
];

// ── Main About Screen ─────────────────────────────
const AboutUsScreen = ({ navigation }) => {
  const { colors, isDark } = useThemeStyles();
  const [appInfo, setAppInfo] = useState(null);

  useEffect(() => {
    applicationDetails().then((res) => {
      if (res?.infoData) setAppInfo(res.infoData);
    });
  }, []);

  const appName = appInfo?.app_name || 'OtaMobile';
  const appVersion = appInfo?.app_version || '2.0.1';
  const appDesc = appInfo?.app_desc || 'Nigeria\'s most trusted platform for digital asset trading and instant bill payments. Fast, secure and reliable.';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgColor }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bgColor}
      />

      {/* ── Header ──────────────────────────────── */}
      <View style={[styles.header, { backgroundColor: colors.bgColor }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.bgLight }]}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textBlack} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textBlack }]}>About Us</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* ── Brand Hero ───────────────────────── */}
        <LinearGradient
          colors={[colors.primaryColor1, colors.primaryColor1b]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}>
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />

          <View style={[styles.logoBox, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
            <Ionicons name="swap-horizontal" size={36} color={colors.primaryColor1} />
          </View>
          <Text style={styles.brandName}>{appName}</Text>
          <Text style={styles.brandTagline}>
            Trade • Pay • Earn
          </Text>
          <Text style={styles.brandDesc}>{appDesc}</Text>

          {/* Stats */}
          <View style={[styles.statsRow, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <StatItem value="50K+" label="Users" />
            <View style={styles.statDivider} />
            <StatItem value="₦1B+" label="Traded" />
            <View style={styles.statDivider} />
            <StatItem value="4.8★" label="Rating" />
            <View style={styles.statDivider} />
            <StatItem value="24/7" label="Support" />
          </View>
        </LinearGradient>

        {/* ── Mission Card ──────────────────────── */}
        <View style={[styles.missionCard, { backgroundColor: colors.bgCard }]}>
          <View style={styles.missionHeader}>
            <View style={[styles.missionIconBox, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="rocket-outline" size={22} color={colors.primaryColor1} />
            </View>
            <Text style={[styles.missionTitle, { color: colors.textBlack }]}>
              Our Mission
            </Text>
          </View>
          <Text style={[styles.missionText, { color: colors.textSecColor }]}>
            To make digital finance accessible, affordable and reliable for every Nigerian — from buying and selling digital currencies to paying everyday bills at the cheapest rates available.
          </Text>
          <Text style={[styles.missionText, { color: colors.textSecColor }]}>
            We believe everyone deserves access to fast, transparent and secure financial services — regardless of location or bank status.
          </Text>
        </View>

        {/* ── Features ──────────────────────────── */}
        <Text style={[styles.sectionTitle, { color: colors.textBlack }]}>
          What We Offer
        </Text>

        {FEATURES.map((feature, i) => (
          <FeatureCard
            key={i}
            icon={feature.icon}
            iconBg={feature.iconBg}
            iconColor={feature.iconColor}
            title={feature.title}
            desc={feature.desc}
            colors={colors}
          />
        ))}

        {/* ── Values Card ───────────────────────── */}
        <View style={[styles.valuesCard, { backgroundColor: colors.bgCard }]}>
          <Text style={[styles.valuesTitle, { color: colors.textBlack }]}>
            Our Core Values
          </Text>
          {[
            { icon: 'shield-outline', color: '#10B981', label: 'Security First', desc: 'Every transaction is protected with bank-level encryption and multi-layer security.' },
            { icon: 'flash-outline', color: '#F59E0B', label: 'Speed & Reliability', desc: 'Instant processing with 99.9% uptime — your transactions never wait.' },
            { icon: 'heart-outline', color: '#EF4444', label: 'Customer First', desc: 'Every feature, every decision is made with our users\' best interest in mind.' },
            { icon: 'eye-outline', color: '#4C5FD5', label: 'Transparency', desc: 'No hidden fees. No surprises. What you see is what you get, always.' },
          ].map((value, i) => (
            <View key={i} style={styles.valueRow}>
              <View style={[styles.valueIconBox, { backgroundColor: value.color + '20' }]}>
                <Ionicons name={value.icon} size={18} color={value.color} />
              </View>
              <View style={styles.valueInfo}>
                <Text style={[styles.valueLabel, { color: colors.textBlack }]}>
                  {value.label}
                </Text>
                <Text style={[styles.valueDesc, { color: colors.textSecColor }]}>
                  {value.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Legal & Links ─────────────────────── */}
        <Text style={[styles.sectionTitle, { color: colors.textBlack }]}>
          Legal & Information
        </Text>

        <View style={[styles.linksCard, { backgroundColor: colors.bgCard }]}>
          <LinkRow
            icon="document-text-outline"
            label="Terms & Conditions"
            url={null}
            colors={colors}
          />
          <LinkRow
            icon="shield-outline"
            label="Privacy Policy"
            url={null}
            colors={colors}
          />
          <LinkRow
            icon="help-circle-outline"
            label="Help Centre"
            url={null}
            colors={colors}
          />
          <LinkRow
            icon="globe-outline"
            label="Visit Our Website"
            url={appInfo?.app_website || 'https://ozaapp.com'}
            colors={colors}
          />
        </View>

        {/* ── App Version ───────────────────────── */}
        <View style={styles.versionBlock}>
          <View style={[styles.versionIconBox, { backgroundColor: colors.bgLight }]}>
            <Ionicons name="swap-horizontal" size={24} color={colors.primaryColor1} />
          </View>
          <Text style={[styles.versionApp, { color: colors.textBlack }]}>
            {appName}
          </Text>
          <Text style={[styles.versionNum, { color: colors.textSecColor }]}>
            Version {appVersion}
          </Text>
          <Text style={[styles.versionCopyright, { color: colors.textSecColor }]}>
            © {new Date().getFullYear()} {appName}. All rights reserved.
          </Text>
          <Text style={[styles.versionMade, { color: colors.textSecColor }]}>
            Made with ❤️ in Nigeria
          </Text>
        </View>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxxl },

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
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Hero Banner
  heroBanner: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    alignItems: 'center',
    ...shadows.lg,
  },
  heroCircle1: {
    position: 'absolute',
    right: -50,
    top: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroCircle2: {
    position: 'absolute',
    left: -30,
    bottom: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  brandName: {
    fontFamily: '_bold',
    fontSize: typography.xxl,
    color: '#fff',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  brandDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    padding: spacing.md,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    color: '#fff',
    lineHeight: 24,
  },
  statLabel: {
    fontFamily: '_regular',
    fontSize: typography.base,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: spacing.xs,
  },

  // Mission Card
  missionCard: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  missionIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  missionTitle: {
    fontFamily: '_bold',
    fontSize: typography.lg,
  },
  missionText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 24,
    marginBottom: spacing.md,
  },

  // Section Title
  sectionTitle: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },

  // Feature Card
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    gap: spacing.md,
    ...shadows.card,
  },
  featureIconBox: {
    width: 46,
    height: 46,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  featureInfo: { flex: 1 },
  featureTitle: {
    fontFamily: '_bold',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: 4,
  },
  featureDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
  },

  // Values Card
  valuesCard: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  valuesTitle: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    marginBottom: spacing.lg,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  valueIconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  valueInfo: { flex: 1 },
  valueLabel: {
    fontFamily: '_bold',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: 2,
  },
  valueDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
  },

  // Links Card
  linksCard: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  linkIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkLabel: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    lineHeight: 22,
    flex: 1,
  },

  // Version Block
  versionBlock: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  versionIconBox: {
    width: 56,
    height: 56,
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  versionApp: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    lineHeight: 26,
    marginBottom: 4,
  },
  versionNum: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  versionCopyright: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 4,
  },
  versionMade: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
  },
});

export default AboutUsScreen;