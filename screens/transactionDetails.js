import React, { useContext, useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Share, Platform,
  ToastAndroid, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import moment from 'moment';

import { gs, spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';

import { AuthContext } from '../contextAPI/authContext';
import client from '../contextAPI/client';
import { NumberValueFormat } from '../components/formatValue';
import { NumberDollarValueFormat } from '../components/formatDollarValue';
import InfoRow from '../components/InfoRow';
import SectionCard from '../components/SectionCard';
import TransactionStatusBadge from '../components/TransactionStatusBadge';

// ── Get transaction icon config ───────────────────
const getTransactionIcon = (nature = '', type = '') => {
  const n = nature.toLowerCase();
  if (n.includes('paypal'))      return { icon: 'logo-paypal',          color: '#003087', bg: '#DBEAFE' };
  if (n.includes('payoneer'))    return { icon: 'card-outline',          color: '#FF4800', bg: '#FEE2E2' };
  if (n.includes('bitcoin'))     return { icon: 'logo-bitcoin',          color: '#F7931A', bg: '#FEF3C7' };
    if (n.includes('electric'))    return { icon: 'flash',                 color: '#F59E0B', bg: '#FEF3C7' };
  if (n.includes('data') || n.includes('airtime')) return { icon: 'wifi', color: '#3B82F6', bg: '#DBEAFE' };
  if (n.includes('tv') || n.includes('cable'))     return { icon: 'tv',  color: '#8B5CF6', bg: '#EDE9FE' };
  if (n.includes('waec') || n.includes('neco') || n.includes('jamb') || n.includes('nabteb'))
    return { icon: 'school', color: '#10B981', bg: '#D1FAE5' };
  if (n.includes('fund') || n.includes('deposit'))
    return { icon: 'arrow-down-circle', color: '#10B981', bg: '#D1FAE5' };
    if (n.includes('withdraw'))    return { icon: 'arrow-up-circle',       color: '#EF4444', bg: '#FEE2E2' };
    return { icon: 'gift', color: '#F0A500', bg: '#FFF3CD' };
  return type === 'Debit'
    ? { icon: 'arrow-up-outline',   color: '#EF4444', bg: '#FEE2E2' }
    : { icon: 'arrow-down-outline', color: '#10B981', bg: '#D1FAE5' };
};

// ── Main Screen ───────────────────────────────────
const TransactionsDetails = ({ route, navigation }) => {
  const isFocused = useIsFocused();
  const { S, colors, isDark } = useThemeStyles();
  const { userToken } = useContext(AuthContext);
  const tPayId = route.params?.record_id;

  const [dataDetails, setDataDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Fetch Transaction Details ─────────────────
  const loadTransactionDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await client.get(
        `api/getTransactionInfo/${tPayId}`,
        { headers: { 'Authorization': 'Bearer ' + userToken } }
      );
      if (res.data.msg === '200') {
        setDataDetails(res.data.dataInfo);
      } else {
        setError('Transaction not found. Please try again.');
      }
    } catch (error) {
      setError('Could not load transaction details. Please check your connection.');
      console.log('Transaction details error:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, [tPayId, userToken]);

  useEffect(() => {
    loadTransactionDetails();
  }, []);

  // ── Share Receipt ─────────────────────────────
  const handleShareReceipt = async () => {
    if (!dataDetails) return;
    try {
      const receipt = [
        '📄 Transaction Receipt',
        '─────────────────────────',
        `Amount: ${dataDetails.currency_level === '2' ? '$' : '₦'}${dataDetails.amount}`,
        `Type: ${dataDetails.transac_nature}`,
        `Status: ${dataDetails.transaction_status}`,
        `Date: ${moment(dataDetails.creditOn).format('DD MMM YYYY hh:mm A')}`,
        `Transaction ID: ${dataDetails.tid}`,
        dataDetails.pay_tran ? `Payment ID: ${dataDetails.pay_tran}` : '',
      ].filter(Boolean).join('\n');

      await Share.share({ message: receipt });
    } catch (error) {
      console.log('Share error:', error.message);
    }
  };

  // ── Copy Transaction ID ───────────────────────
  const handleCopyTxId = async () => {
    if (!dataDetails?.tid) return;
    await Clipboard.setStringAsync(dataDetails.tid);
    if (Platform.OS === 'android') {
      ToastAndroid.show('Transaction ID copied!', ToastAndroid.SHORT);
    } else {
      Alert.alert('Copied!', 'Transaction ID copied to clipboard');
    }
  };

  // ── Derived Values ────────────────────────────
  const isDebit = dataDetails?.tran_type === 'Debit';
  const isDollar = dataDetails?.currency_level === '2';
  const iconInfo = getTransactionIcon(
    dataDetails?.transac_nature || '',
    dataDetails?.tran_type || ''
  );
  const canUploadProof =
    dataDetails?.transac_category !== 'Withdraw' &&
    (!dataDetails?.payment_proof_url || dataDetails?.payment_proof_url === '');

  // ── Loading State ─────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bgColor }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bgColor}
      />
        <View style={styles.header}>
          <TouchableOpacity style={gs.homeSideMenu} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.textBlack} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction Details</Text>
          <View style={[gs.homeSideMenu, { opacity: 0 }]} />
        </View>
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={colors.primaryColor1} />
          <Text style={styles.loadingText}>Loading transaction details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Error State ───────────────────────────────
  if (error || !dataDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bgColor} />
        <View style={styles.header}>
          <TouchableOpacity style={gs.homeSideMenu} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.textBlack} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction Details</Text>
          <View style={[gs.homeSideMenu, { opacity: 0 }]} />
        </View>
        <View style={styles.errorState}>
          <View style={styles.errorIconBox}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.dangerColor} />
          </View>
          <Text style={styles.errorTitle}>Could Not Load</Text>
          <Text style={styles.errorDesc}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadTransactionDetails}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bgColor} />

      {/* ── Header ───────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={gs.homeSideMenu}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textBlack} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Details</Text>
        <TouchableOpacity
          style={gs.homeSideMenu}
          onPress={handleShareReceipt}>
          <Ionicons name="share-outline" size={22} color={colors.primaryColor1} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* ── Transaction Hero Banner ───────────── */}
        <LinearGradient
          colors={isDebit
            ? ['#EF4444', '#B91C1C']
            : [colors.primaryColor1, colors.primaryColor1b]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}>
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />

          {/* Transaction Icon */}
          <View style={styles.heroIconBox}>
            <Ionicons name={iconInfo.icon} size={32} color={isDebit ? '#EF4444' : colors.primaryColor1} />
          </View>

          {/* Amount */}
          <Text style={styles.heroLabel}>
            {dataDetails.transac_nature}
          </Text>
          <Text style={styles.heroAmount}>
            {isDebit ? '−' : '+'}
            {isDollar
              ? <NumberDollarValueFormat value={dataDetails.amount} />
              : <NumberValueFormat value={dataDetails.amount} />}
          </Text>

          {/* Status Badge */}
          <TransactionStatusBadge
            status={dataDetails.transaction_status}
            size="lg"
          />

          {/* Date */}
          <Text style={styles.heroDate}>
            {moment(dataDetails.creditOn).format('DD MMM YYYY • hh:mm A')}
          </Text>
        </LinearGradient>

        {/* ── Quick Actions ─────────────────────── */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={handleShareReceipt}
            activeOpacity={0.8}>
            <View style={[styles.quickActionIcon, { backgroundColor: colors.bgLight }]}>
              <Ionicons name="share-outline" size={20} color={colors.primaryColor1} />
            </View>
            <Text style={styles.quickActionLabel}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={handleCopyTxId}
            activeOpacity={0.8}>
            <View style={[styles.quickActionIcon, { backgroundColor: colors.bgLight }]}>
              <Ionicons name="copy-outline" size={20} color={colors.primaryColor1} />
            </View>
            <Text style={styles.quickActionLabel}>Copy ID</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => navigation.navigate('History')}
            activeOpacity={0.8}>
            <View style={[styles.quickActionIcon, { backgroundColor: colors.bgLight }]}>
              <Ionicons name="list-outline" size={20} color={colors.primaryColor1} />
            </View>
            <Text style={styles.quickActionLabel}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.8}>
            <View style={[styles.quickActionIcon, { backgroundColor: colors.bgLight }]}>
              <Ionicons name="home-outline" size={20} color={colors.primaryColor1} />
            </View>
            <Text style={styles.quickActionLabel}>Home</Text>
          </TouchableOpacity>
        </View>

        {/* ── Transaction Overview ──────────────── */}
        {/* Uses InfoRow component from components/InfoRow.js */}
        <SectionCard title="Transaction Overview">
          <InfoRow
            icon="cash-outline"
            label="Amount"
            value={isDollar
              ? `$${dataDetails.amount}`
              : `₦${Number(dataDetails.amount).toLocaleString()}`}
            valueColor={isDebit ? colors.dangerColor : colors.successColor}
          />
          <InfoRow
            icon="pricetag-outline"
            label="Transaction Nature"
            value={dataDetails.transac_nature}
          />
          <InfoRow
            icon="layers-outline"
            label="Transaction Category"
            value={dataDetails.transac_category}
          />
          <InfoRow
            icon="swap-horizontal-outline"
            label="Transaction Type"
            value={dataDetails.tran_type}
            valueColor={isDebit ? colors.dangerColor : colors.successColor}
          />
          <InfoRow
            icon="construct-outline"
            label="Service Type"
            value={dataDetails.tran_service_type}
          />
          {dataDetails.trans_method && (
            <InfoRow
              icon="card-outline"
              label="Payment Method"
              value={dataDetails.trans_method}
            />
          )}
          <InfoRow
            icon="document-text-outline"
            label="Description"
            value={dataDetails.tran_desc}
          />
        </SectionCard>

        {/* ── Status & Dates ───────────────────── */}
        <SectionCard title="Status & Timeline">
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Current Status</Text>
            <TransactionStatusBadge
              status={dataDetails.transaction_status}
              size="md"
            />
          </View>
          <View style={styles.sectionDivider} />
          <InfoRow
            icon="calendar-outline"
            label="Transaction Date"
            value={moment(dataDetails.creditOn).format('DD MMM YYYY • hh:mm:ss A')}
          />
          <InfoRow
            icon="checkmark-circle-outline"
            label="Approved Date"
            value={dataDetails.approved_date
              ? moment(dataDetails.approved_date).format('DD MMM YYYY • hh:mm:ss A')
              : 'Pending approval'}
          />
        </SectionCard>

        {/* ── Reference Numbers ─────────────────── */}
        <SectionCard title="Reference Numbers">
          <InfoRow
            icon="finger-print-outline"
            label="Account Tag ID"
            value={dataDetails.acct_number}
          />
          <View style={styles.txIdRow}>
            <InfoRow
              icon="barcode-outline"
              label="Transaction ID"
              value={dataDetails.tid}
            />
            <TouchableOpacity
              style={styles.copyTxBtn}
              onPress={handleCopyTxId}>
              <Ionicons name="copy-outline" size={16} color={colors.primaryColor1} />
              <Text style={styles.copyTxBtnText}>Copy</Text>
            </TouchableOpacity>
          </View>
          {dataDetails.pay_tran && dataDetails.pay_tran !== '' && (
            <InfoRow
              icon="receipt-outline"
              label="Payment Reference ID"
              value={dataDetails.pay_tran}
            />
          )}
        </SectionCard>

        {/* ── Upload Proof of Payment ───────────── */}
        {canUploadProof && (
          <SectionCard>
            <View style={styles.uploadNotice}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={colors.warningColor}
              />
              <Text style={styles.uploadNoticeText}>
                Payment proof has not been uploaded for this transaction.
                Upload it to speed up processing.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={() => navigation.navigate('UploadPaymentProof', {
                track_id: dataDetails.tid,
              })}
              activeOpacity={0.85}>
              <Ionicons
                name="cloud-upload-outline"
                size={20}
                color="#fff"
                style={{ marginRight: spacing.sm }}
              />
              <Text style={styles.uploadBtnText}>Upload Proof of Payment</Text>
            </TouchableOpacity>
          </SectionCard>
        )}

        {/* ── Support Notice ───────────────────── */}
        <View style={styles.supportCard}>
          <Ionicons
            name="help-circle-outline"
            size={18}
            color={colors.primaryColor1}
          />
          <Text style={styles.supportText}>
            If you have any issues with this transaction, contact our
            support team with your Transaction ID for quick resolution.
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

  // Loading & Error States
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    
    lineHeight: 22,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorIconBox: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  errorTitle: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    
    marginBottom: spacing.sm,
  },
  errorDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  retryBtn: {
    
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  retryBtnText: {
    fontFamily: '_bold',
    fontSize: typography.base,
  },

  // Hero Banner
  heroBanner: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.lg,
  },
  heroCircle1: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  heroCircle2: {
    position: 'absolute',
    left: -20,
    bottom: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  heroIconBox: {
    width: 68,
    height: 68,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  heroLabel: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    marginBottom: spacing.xs,
    lineHeight: 22,
  },
  heroAmount: {
    fontFamily: '_bold',
    fontSize: typography.giant,
    lineHeight: 48,
    marginBottom: spacing.md,
  },
  heroDate: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    marginTop: spacing.sm,
    lineHeight: 20,
  },

  // Quick Actions
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  quickActionBtn: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  quickActionLabel: {
    fontFamily: '_semiBold',
    fontSize: typography.xs,
    
    textAlign: 'center',
  },

  // Status Row
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusLabel: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    
    lineHeight: 22,
  },
  sectionDivider: {
    height: 1,
    marginBottom: spacing.md,
  },

  // Transaction ID Row
  txIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  copyTxBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: 4,
  },
  copyTxBtnText: {
    fontFamily: '_semiBold',
    fontSize: typography.xs,
    
  },

  // Upload Section
  uploadNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
  },
  uploadNoticeText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    
    flex: 1,
    lineHeight: 22,
  },
  uploadBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    
    borderRadius: radius.lg,
    height: 52,
    ...shadows.md,
  },
  uploadBtnText: {
    fontFamily: '_bold',
    fontSize: typography.base,
  },

  // Support Card
  supportCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
  },
  supportText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    
    flex: 1,
    lineHeight: 22,
  },
});

export default TransactionsDetails;