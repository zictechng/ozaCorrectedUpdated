import React, { useContext, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';
import { AuthContext } from '../contextAPI/authContext';

// ── Status Step ───────────────────────────────────
const StatusStep = ({ icon, title, desc, status, colors }) => {
  const bgColor = status === 'done'
    ? '#D1FAE5'
    : status === 'pending'
      ? '#FEF3C7'
      : colors.bgLight;

  const iconColor = status === 'done'
    ? '#10B981'
    : status === 'pending'
      ? '#F59E0B'
      : colors.textSecColor;

  const iconName = status === 'done'
    ? 'checkmark-circle'
    : status === 'pending'
      ? 'time-outline'
      : 'ellipse-outline';

  return (
    <View style={[styles.stepRow, { borderBottomColor: colors.dividerColor }]}>
      <View style={[styles.stepIconBox, { backgroundColor: bgColor }]}>
        <Ionicons name={iconName} size={22} color={iconColor} />
      </View>
      <View style={styles.stepInfo}>
        <Text style={[styles.stepTitle, { color: colors.textBlack }]}>{title}</Text>
        <Text style={[styles.stepDesc, { color: colors.textSecColor }]}>{desc}</Text>
      </View>
      {status === 'done' && (
        <MaterialCommunityIcons name="check-decagram" size={22} color="#10B981" />
      )}
    </View>
  );
};

// ── Main Screen ───────────────────────────────────
const DocumentScreen = ({ navigation }) => {
  const { colors, isDark } = useThemeStyles();
  const { userInfo } = useContext(AuthContext);

  const [documentUploaded, setDocumentUploaded] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    if (userInfo?.userData?.reg_stage4 === 'Yes') setDocumentUploaded(true);
    if (userInfo?.userData?.acct_approved_status === 'Approved') setIsApproved(true);
  }, []);

  // ── Determine overall status ──────────────────
  const overallStatus = isApproved
    ? 'approved'
    : documentUploaded
      ? 'review'
      : 'pending';

  const statusConfig = {
    approved: {
      gradientColors: ['#10B981', '#059669'],
      icon: 'shield-checkmark',
      iconBg: 'rgba(255,255,255,0.95)',
      iconColor: '#10B981',
      title: 'Account Verified!',
      desc: 'Your identity has been verified successfully. You have full access to all platform features.',
      badge: 'Verified',
      badgeBg: '#D1FAE5',
      badgeColor: '#10B981',
    },
    review: {
      gradientColors: ['#F59E0B', '#D97706'],
      icon: 'time',
      iconBg: 'rgba(255,255,255,0.95)',
      iconColor: '#F59E0B',
      title: 'Under Review',
      desc: 'Your documents have been submitted and are currently being reviewed. This usually takes up to 24 hours.',
      badge: 'Under Review',
      badgeBg: '#FEF3C7',
      badgeColor: '#F59E0B',
    },
    pending: {
      gradientColors: [colors.primaryColor1, colors.primaryColor1b],
      icon: 'document-text-outline',
      iconBg: 'rgba(255,255,255,0.95)',
      iconColor: colors.primaryColor1,
      title: 'Verification Required',
      desc: 'Upload your government-issued ID to verify your identity and unlock all platform features.',
      badge: 'Not Verified',
      badgeBg: colors.bgLight,
      badgeColor: colors.textSecColor,
    },
  };

  const cfg = statusConfig[overallStatus];

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
        <Text style={[styles.headerTitle, { color: colors.textBlack }]}>
          KYC Documents
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* ── Status Hero ──────────────────────── */}
        <LinearGradient
          colors={cfg.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}>
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />

          <View style={[styles.heroIconBox, { backgroundColor: cfg.iconBg }]}>
            <Ionicons name={cfg.icon} size={36} color={cfg.iconColor} />
          </View>

          <Text style={styles.heroTitle}>{cfg.title}</Text>
          <Text style={styles.heroDesc}>{cfg.desc}</Text>

          <View style={[styles.heroBadge, { backgroundColor: cfg.badgeBg }]}>
            <Text style={[styles.heroBadgeText, { color: cfg.badgeColor }]}>
              {cfg.badge}
            </Text>
          </View>
        </LinearGradient>

        {/* ── Verification Steps ────────────────── */}
        <View style={[styles.stepsCard, { backgroundColor: colors.bgCard }]}>
          <Text style={[styles.stepsTitle, { color: colors.textBlack }]}>
            Verification Progress
          </Text>

          <StatusStep
            icon="person-outline"
            title="Account Created"
            desc="Your account has been created successfully"
            status="done"
            colors={colors}
          />
          <StatusStep
            icon="document-text-outline"
            title="Documents Uploaded"
            desc={documentUploaded
              ? 'Your ID documents have been submitted'
              : 'Upload a valid government-issued ID'}
            status={documentUploaded ? 'done' : 'idle'}
            colors={colors}
          />
          <StatusStep
            icon="search-outline"
            title="Documents Under Review"
            desc={isApproved
              ? 'Your documents have been verified'
              : documentUploaded
                ? 'Our team is reviewing your documents'
                : 'Pending document upload'}
            status={isApproved ? 'done' : documentUploaded ? 'pending' : 'idle'}
            colors={colors}
          />
          <StatusStep
            icon="shield-checkmark-outline"
            title="Account Verified"
            desc={isApproved
              ? 'Full access granted — all features unlocked'
              : 'Complete the steps above to get verified'}
            status={isApproved ? 'done' : 'idle'}
            colors={colors}
          />
        </View>

        {/* ── What You Get Card ─────────────────── */}
        <View style={[styles.benefitsCard, { backgroundColor: colors.bgCard }]}>
          <Text style={[styles.benefitsTitle, { color: colors.textBlack }]}>
            Benefits of Verification
          </Text>
          {[
            { icon: 'trending-up-outline', color: '#10B981', label: 'Higher transaction limits' },
            { icon: 'shield-outline', color: '#4C5FD5', label: 'Full account security' },
            { icon: 'wallet-outline', color: '#F59E0B', label: 'Withdraw without restrictions' },
            { icon: 'people-outline', color: '#EC4899', label: 'Access referral rewards' },
            { icon: 'checkmark-circle-outline', color: '#10B981', label: 'Trusted account badge' },
          ].map((b, i) => (
            <View key={i} style={[styles.benefitRow, { borderBottomColor: colors.dividerColor }]}>
              <View style={[styles.benefitIconBox, { backgroundColor: b.color + '20' }]}>
                <Ionicons name={b.icon} size={18} color={b.color} />
              </View>
              <Text style={[styles.benefitLabel, { color: colors.textBlack }]}>{b.label}</Text>
              {isApproved && (
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              )}
            </View>
          ))}
        </View>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>

      {/* ── Bottom Action Button ──────────────────── */}
      {!isApproved && (
        <View style={[styles.bottomBar, { backgroundColor: colors.bgColor, borderTopColor: colors.dividerColor }]}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: documentUploaded
                  ? 'transparent'
                  : colors.primaryColor1,
                borderColor: documentUploaded
                  ? colors.primaryColor1
                  : 'transparent',
                borderWidth: documentUploaded ? 1.5 : 0,
              },
            ]}
            onPress={() => navigation.navigate('UploadDocument')}
            activeOpacity={0.85}>
            <Ionicons
              name={documentUploaded ? 'refresh-outline' : 'cloud-upload-outline'}
              size={20}
              color={documentUploaded ? colors.primaryColor1 : '#fff'}
            />
            <Text style={[
              styles.actionBtnText,
              { color: documentUploaded ? colors.primaryColor1 : '#fff' },
            ]}>
              {documentUploaded ? 'Re-upload Documents' : 'Upload Documents Now'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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

  // Hero
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
    right: -40,
    top: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroCircle2: {
    position: 'absolute',
    left: -20,
    bottom: -30,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroIconBox: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  heroTitle: {
    fontFamily: '_bold',
    fontSize: typography.xxl,
    color: '#fff',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heroDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  heroBadge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  heroBadgeText: {
    fontFamily: '_bold',
    fontSize: typography.base,
    lineHeight: 22,
  },

  // Steps Card
  stepsCard: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  stepsTitle: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    marginBottom: spacing.lg,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  stepIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepInfo: { flex: 1 },
  stepTitle: {
    fontFamily: '_bold',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: 2,
  },
  stepDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
  },

  // Benefits Card
  benefitsCard: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  benefitsTitle: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    marginBottom: spacing.lg,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  benefitIconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitLabel: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    lineHeight: 22,
    flex: 1,
  },

  // Bottom Bar
  bottomBar: {
    padding: spacing.xl,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 56,
    borderRadius: radius.lg,
    gap: spacing.sm,
    ...shadows.md,
  },
  actionBtnText: {
    fontFamily: '_bold',
    fontSize: typography.lg,
  },
});

export default DocumentScreen;