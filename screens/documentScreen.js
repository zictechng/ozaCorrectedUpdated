import React, { useContext, useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Image, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';
import { AuthContext } from '../contextAPI/authContext';
import client from '../contextAPI/client';

// ── Document Status Config ────────────────────────
const getDocStatusConfig = (status) => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return {
        icon:      'checkmark-circle',
        color:     '#10B981',
        bg:        '#D1FAE5',
        label:     'Approved',
      };
    case 'rejected':
      return {
        icon:      'close-circle',
        color:     '#EF4444',
        bg:        '#FEE2E2',
        label:     'Rejected',
      };
    default: // pending
      return {
        icon:      'time',
        color:     '#F59E0B',
        bg:        '#FEF3C7',
        label:     'Under Review',
      };
  }
};

// ── Document Card ─────────────────────────────────
const DocumentCard = ({ doc, colors }) => {
  const cfg = getDocStatusConfig(doc.document_status);
  return (
    <View style={[styles.docCard, { backgroundColor: colors.bgCard, borderColor: colors.dividerColor }]}>
      <View style={styles.docCardLeft}>
        {doc.document_url ? (
          <Image
            source={{ uri: doc.document_url }}
            style={styles.docThumb}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.docThumbPlaceholder, { backgroundColor: colors.bgLight }]}>
            <Ionicons name="document-outline" size={24} color={colors.textSecColor} />
          </View>
        )}
        <View style={styles.docInfo}>
          <Text style={[styles.docName, { color: colors.textBlack }]} numberOfLines={1}>
            {doc.document_name}
          </Text>
          <Text style={[styles.docDate, { color: colors.textSecColor }]}>
            {doc.createdOn ? new Date(doc.createdOn).toLocaleDateString('en-GB', {
              day: '2-digit', month: 'short', year: 'numeric',
            }) : '—'}
          </Text>
          {doc.reject_document_reason && doc.document_status?.toLowerCase() === 'rejected' && (
            <Text style={[styles.docReason, { color: '#EF4444' }]} numberOfLines={2}>
              Reason: {doc.reject_document_reason}
            </Text>
          )}
        </View>
      </View>
      <View style={[styles.docStatusBadge, { backgroundColor: cfg.bg }]}>
        <Ionicons name={cfg.icon} size={16} color={cfg.color} />
        <Text style={[styles.docStatusText, { color: cfg.color }]}>{cfg.label}</Text>
      </View>
    </View>
  );
};

// ── Main Screen ───────────────────────────────────
const DocumentScreen = ({ navigation }) => {
  const { colors, isDark } = useThemeStyles();
  const { userToken, userInfo } = useContext(AuthContext);
  const isFocused = useIsFocused();

  const [documents, setDocuments]   = useState([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const userId = userInfo?.userData?._id;

  // ── Fetch user documents ──────────────────────
  const fetchDocuments = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    try {
      const res = await client.get(
        `/api/user_documentUpload/${userId}?pageSize=20&page=1`,
        { headers: { 'Authorization': 'Bearer ' + userToken } }
      );
      if (res.data.msg === '200') {
        setDocuments(res.data.data || []);
      } else {
        setDocuments([]);
      }
    } catch {
      setDocuments([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userId, userToken]);

  useEffect(() => {
    if (isFocused) fetchDocuments();
  }, [isFocused]);

  // ── Compute overall status ────────────────────
  const hasAnyDoc      = documents.length > 0;
  const hasRejected    = documents.some(d => d.document_status?.toLowerCase() === 'rejected');
  const hasAllApproved = hasAnyDoc && documents.every(d => d.document_status?.toLowerCase() === 'approved');
  const hasPending     = documents.some(d => d.document_status?.toLowerCase() === 'pending');
  const isFullyVerified = userInfo?.userData?.acct_approved_status === 'Approved';

  const canReUpload = !hasAnyDoc || hasRejected;

  const overallStatus = isFullyVerified
    ? 'approved'
    : hasRejected
      ? 'rejected'
      : hasPending
        ? 'review'
        : hasAnyDoc
          ? 'review'
          : 'pending';

  const statusConfig = {
    approved: {
      gradientColors: ['#10B981', '#059669'],
      icon:           'shield-checkmark',
      iconColor:      '#10B981',
      title:          'Account Verified!',
      desc:           'Your identity has been verified. You have full access to all platform features.',
      badge:          'Verified',
      badgeBg:        '#D1FAE5',
      badgeColor:     '#10B981',
    },
    rejected: {
      gradientColors: ['#EF4444', '#DC2626'],
      icon:           'close-circle',
      iconColor:      '#EF4444',
      title:          'Documents Rejected',
      desc:           'One or more documents were rejected. Please re-upload the rejected documents.',
      badge:          'Action Required',
      badgeBg:        '#FEE2E2',
      badgeColor:     '#EF4444',
    },
    review: {
      gradientColors: ['#F59E0B', '#D97706'],
      icon:           'time',
      iconColor:      '#F59E0B',
      title:          'Under Review',
      desc:           'Your documents are being reviewed. This usually takes up to 24 hours.',
      badge:          'Under Review',
      badgeBg:        '#FEF3C7',
      badgeColor:     '#F59E0B',
    },
    pending: {
      gradientColors: [colors.primaryColor1, colors.primaryColor1b || '#3D4EAA'],
      icon:           'document-text-outline',
      iconColor:      colors.primaryColor1,
      title:          'Verification Required',
      desc:           'Upload a government-issued ID to verify your identity and unlock all features.',
      badge:          'Not Verified',
      badgeBg:        colors.bgLight,
      badgeColor:     colors.textSecColor,
    },
  };

  const cfg = statusConfig[overallStatus];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgColor} />

      {/* ── Header ──────────────────────────────── */}
      <View style={[styles.header, { backgroundColor: colors.bgColor }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.bgLight }]}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textBlack} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textBlack }]}>KYC Documents</Text>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.bgLight }]}
          onPress={() => fetchDocuments(true)}>
          {isRefreshing
            ? <ActivityIndicator size={18} color={colors.primaryColor1} />
            : <Ionicons name="refresh-outline" size={20} color={colors.textBlack} />
          }
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── Status Hero ──────────────────────── */}
        <LinearGradient
          colors={cfg.gradientColors}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.heroBanner}>
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />
          <View style={[styles.heroIconBox, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
            <Ionicons name={cfg.icon} size={36} color={cfg.iconColor} />
          </View>
          <Text style={styles.heroTitle}>{cfg.title}</Text>
          <Text style={styles.heroDesc}>{cfg.desc}</Text>
          <View style={[styles.heroBadge, { backgroundColor: cfg.badgeBg }]}>
            <Text style={[styles.heroBadgeText, { color: cfg.badgeColor }]}>{cfg.badge}</Text>
          </View>
        </LinearGradient>

        {/* ── Uploaded Documents List ───────────── */}
        <View style={[styles.sectionCard, { backgroundColor: colors.bgCard }]}>
          <Text style={[styles.sectionTitle, { color: colors.textBlack }]}>
            Uploaded Documents
          </Text>
          <Text style={[styles.sectionDesc, { color: colors.textSecColor }]}>
            {hasAnyDoc
              ? `${documents.length} document${documents.length > 1 ? 's' : ''} uploaded`
              : 'No documents uploaded yet'}
          </Text>

          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={colors.primaryColor1}
              style={{ marginVertical: spacing.xl }}
            />
          ) : hasAnyDoc ? (
            documents.map((doc, index) => (
              <DocumentCard
                key={`${doc._id || index}`}
                doc={doc}
                colors={colors}
              />
            ))
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.bgLight }]}>
              <Ionicons name="document-outline" size={40} color={colors.textSecColor} />
              <Text style={[styles.emptyTitle, { color: colors.textBlack }]}>
                No Documents Yet
              </Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecColor }]}>
                Upload a valid government-issued ID to get verified
              </Text>
            </View>
          )}
        </View>

        {/* ── Verification Steps ────────────────── */}
        <View style={[styles.sectionCard, { backgroundColor: colors.bgCard }]}>
          <Text style={[styles.sectionTitle, { color: colors.textBlack }]}>
            Verification Progress
          </Text>
          {[
            {
              title: 'Account Created',
              desc:  'Your account is active',
              status: 'done',
            },
            {
              title: 'Documents Uploaded',
              desc:  hasAnyDoc ? 'ID documents submitted' : 'Upload a government-issued ID',
              status: hasAnyDoc ? 'done' : 'idle',
            },
            {
              title: 'Documents Under Review',
              desc:  isFullyVerified
                ? 'Documents verified by our team'
                : hasRejected
                  ? 'Some documents were rejected'
                  : hasPending
                    ? 'Our team is reviewing your documents'
                    : 'Pending document upload',
              status: isFullyVerified ? 'done' : hasRejected ? 'rejected' : hasPending ? 'pending' : 'idle',
            },
            {
              title: 'Account Verified',
              desc:  isFullyVerified
                ? 'Full access granted — all features unlocked'
                : 'Complete the steps above to get verified',
              status: isFullyVerified ? 'done' : 'idle',
            },
          ].map((step, i) => (
            <View key={i} style={[styles.stepRow, { borderBottomColor: colors.dividerColor }]}>
              <View style={[styles.stepIconBox, {
                backgroundColor:
                  step.status === 'done'     ? '#D1FAE5' :
                  step.status === 'pending'  ? '#FEF3C7' :
                  step.status === 'rejected' ? '#FEE2E2' :
                  colors.bgLight,
              }]}>
                <Ionicons
                  name={
                    step.status === 'done'     ? 'checkmark-circle' :
                    step.status === 'pending'  ? 'time-outline' :
                    step.status === 'rejected' ? 'close-circle' :
                    'ellipse-outline'
                  }
                  size={22}
                  color={
                    step.status === 'done'     ? '#10B981' :
                    step.status === 'pending'  ? '#F59E0B' :
                    step.status === 'rejected' ? '#EF4444' :
                    colors.textSecColor
                  }
                />
              </View>
              <View style={styles.stepInfo}>
                <Text style={[styles.stepTitle, { color: colors.textBlack }]}>{step.title}</Text>
                <Text style={[styles.stepDesc, { color: colors.textSecColor }]}>{step.desc}</Text>
              </View>
              {step.status === 'done' && (
                <MaterialCommunityIcons name="check-decagram" size={22} color="#10B981" />
              )}
            </View>
          ))}
        </View>

        {/* ── Benefits Card ─────────────────────── */}
        <View style={[styles.sectionCard, { backgroundColor: colors.bgCard }]}>
          <Text style={[styles.sectionTitle, { color: colors.textBlack }]}>
            Benefits of Verification
          </Text>
          {[
            { icon: 'trending-up-outline',     color: '#10B981', label: 'Higher transaction limits' },
            { icon: 'shield-outline',          color: '#4C5FD5', label: 'Full account security' },
            { icon: 'wallet-outline',          color: '#F59E0B', label: 'Withdraw without restrictions' },
            { icon: 'people-outline',          color: '#EC4899', label: 'Access referral rewards' },
            { icon: 'checkmark-circle-outline',color: '#10B981', label: 'Trusted account badge' },
          ].map((b, i) => (
            <View key={i} style={[styles.benefitRow, { borderBottomColor: colors.dividerColor }]}>
              <View style={[styles.benefitIconBox, { backgroundColor: b.color + '20' }]}>
                <Ionicons name={b.icon} size={18} color={b.color} />
              </View>
              <Text style={[styles.benefitLabel, { color: colors.textBlack }]}>{b.label}</Text>
              {isFullyVerified && (
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              )}
            </View>
          ))}
        </View>

        <View style={{ height: spacing.xxxl * 2 }} />
      </ScrollView>

      {/* ── Bottom Action Button ──────────────────── */}
      {canReUpload && (
        <View style={[styles.bottomBar, {
          backgroundColor: colors.bgColor,
          borderTopColor:  colors.dividerColor,
        }]}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.primaryColor1 }]}
            onPress={() => navigation.navigate('SignupSteps')}
            activeOpacity={0.85}>
            <Ionicons
              name={hasRejected ? 'refresh-outline' : 'cloud-upload-outline'}
              size={20}
              color="#fff"
            />
            <Text style={styles.actionBtnText}>
              {hasRejected ? 'Re-upload Rejected Documents' : 'Upload Documents Now'}
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
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
  },
  headerTitle: { fontFamily: '_bold', fontSize: typography.xl },
  backBtn: { width: 42, height: 42, borderRadius: radius.full, justifyContent: 'center', alignItems: 'center' },

  heroBanner: {
    marginHorizontal: spacing.xl, borderRadius: radius.xl,
    padding: spacing.xl, marginBottom: spacing.lg,
    overflow: 'hidden', alignItems: 'center', ...shadows.lg,
  },
  heroCircle1: { position: 'absolute', right: -40, top: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.08)' },
  heroCircle2: { position: 'absolute', left: -20, bottom: -30, width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.06)' },
  heroIconBox: { width: 80, height: 80, borderRadius: radius.full, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg, ...shadows.md },
  heroTitle: { fontFamily: '_bold', fontSize: typography.xxl, color: '#fff', textAlign: 'center', marginBottom: spacing.sm },
  heroDesc: { fontFamily: '_regular', fontSize: typography.base, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  heroBadge: { borderRadius: radius.full, paddingHorizontal: spacing.lg, paddingVertical: spacing.xs },
  heroBadgeText: { fontFamily: '_bold', fontSize: typography.base, lineHeight: 22 },

  sectionCard: { marginHorizontal: spacing.xl, borderRadius: radius.xl, padding: spacing.xl, marginBottom: spacing.lg, ...shadows.card },
  sectionTitle: { fontFamily: '_bold', fontSize: typography.lg, marginBottom: 4 },
  sectionDesc: { fontFamily: '_regular', fontSize: typography.base, lineHeight: 22, marginBottom: spacing.lg },

  // Document Card
  docCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1 },
  docCardLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  docThumb: { width: 52, height: 52, borderRadius: radius.md },
  docThumbPlaceholder: { width: 52, height: 52, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center' },
  docInfo: { flex: 1 },
  docName: { fontFamily: '_semiBold', fontSize: typography.base, lineHeight: 22, marginBottom: 2 },
  docDate: { fontFamily: '_regular', fontSize: typography.sm, lineHeight: 20 },
  docReason: { fontFamily: '_regular', fontSize: typography.sm, lineHeight: 20, marginTop: 2 },
  docStatusBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3, gap: 4, flexShrink: 0 },
  docStatusText: { fontFamily: '_semiBold', fontSize: typography.sm },

  // Empty
  emptyState: { borderRadius: radius.lg, padding: spacing.xl, alignItems: 'center', gap: spacing.sm },
  emptyTitle: { fontFamily: '_bold', fontSize: typography.lg },
  emptyDesc: { fontFamily: '_regular', fontSize: typography.base, lineHeight: 22, textAlign: 'center' },

  // Steps
  stepRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, gap: spacing.md },
  stepIconBox: { width: 44, height: 44, borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center' },
  stepInfo: { flex: 1 },
  stepTitle: { fontFamily: '_bold', fontSize: typography.base, lineHeight: 22, marginBottom: 2 },
  stepDesc: { fontFamily: '_regular', fontSize: typography.base, lineHeight: 22 },

  // Benefits
  benefitRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, gap: spacing.md },
  benefitIconBox: { width: 38, height: 38, borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center' },
  benefitLabel: { fontFamily: '_semiBold', fontSize: typography.base, lineHeight: 22, flex: 1 },

  // Bottom
  bottomBar: { padding: spacing.xl, paddingBottom: spacing.xl, borderTopWidth: 1 },
  actionBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 56, borderRadius: radius.lg, gap: spacing.sm, ...shadows.md },
  actionBtnText: { fontFamily: '_bold', fontSize: typography.base, color: '#fff' },
});

export default DocumentScreen;

