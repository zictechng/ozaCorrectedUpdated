import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  StyleSheet, View, Text, RefreshControl, TouchableOpacity,
  FlatList, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';

import { gs, spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';

import { AuthContext } from '../contextAPI/authContext';
import client from '../contextAPI/client';
import { NumberValueFormat } from '../components/formatValue';
import { NumberDollarValueFormat } from '../components/formatDollarValue';

// ─────────────────────────────────────────────────
// FILTER TABS CONFIG
// ─────────────────────────────────────────────────
const TABS = [
  { id: 1, label: 'All',      icon: 'list-outline',         color: '#4C5FD5' },
  { id: 2, label: 'PayPal',   icon: 'logo-paypal',          color: '#003087' },
  { id: 3, label: 'Payoneer', icon: 'card-outline',         color: '#FF4800' },
  { id: 4, label: 'Bills',    icon: 'flash-outline',        color: '#F59E0B' },
];

// ─────────────────────────────────────────────────
// TRANSACTION ITEM COMPONENT — Reusable
// ─────────────────────────────────────────────────
const TransactionItem = ({ item, onPress }) => {
  const { colors } = useThemeStyles();
  const isDebit = item.tran_type === 'Debit';
  const isCredit = item.tran_type === 'Credit';

  const getTransactionIcon = () => {
    const nature = item.transac_nature?.toLowerCase() || '';
    if (nature.includes('paypal')) return { name: 'logo-paypal', color: '#003087', bg: '#DBEAFE' };
    if (nature.includes('payoneer')) return { name: 'card-outline', color: '#FF4800', bg: '#FEE2E2' };
    if (nature.includes('bitcoin')) return { name: 'logo-bitcoin', color: '#F7931A', bg: '#FEF3C7' };
    if (nature.includes('electricity') || nature.includes('electric')) return { name: 'flash', color: '#F59E0B', bg: '#FEF3C7' };
    if (nature.includes('data') || nature.includes('airtime')) return { name: 'wifi', color: '#3B82F6', bg: '#DBEAFE' };
    if (nature.includes('tv') || nature.includes('cable')) return { name: 'tv', color: '#8B5CF6', bg: '#EDE9FE' };
    if (nature.includes('exam') || nature.includes('waec') || nature.includes('neco')) return { name: 'school', color: '#10B981', bg: '#D1FAE5' };
    if (nature.includes('fund') || nature.includes('deposit')) return { name: 'arrow-down-circle', color: '#10B981', bg: '#D1FAE5' };
    if (nature.includes('withdraw')) return { name: 'arrow-up-circle', color: '#EF4444', bg: '#FEE2E2' };
    if (nature.includes('bonus') || nature.includes('reward')) return { name: 'gift', color: '#F0A500', bg: '#FFF3CD' };
    return isDebit
      ? { name: 'arrow-up-outline', color: '#EF4444', bg: '#FEE2E2' }
      : { name: 'arrow-down-outline', color: '#10B981', bg: '#D1FAE5' };
  };

  // ── Add this helper above TransactionItem ─────────────────
const formatAmount = (item) => {
  const num = Number(item.amount || 0);
  if (item.currency_level === '2') {
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `₦${num.toLocaleString('en-NG')}`;
};

  const iconInfo = getTransactionIcon();

  return (
    <TouchableOpacity
      style={[styles.transactionItem, { backgroundColor: colors.bgCard }]}
      onPress={onPress}
      activeOpacity={0.7}>

      {/* Icon */}
      <View style={[styles.transactionIconBox, { backgroundColor: iconInfo.bg }]}>
        <Ionicons name={iconInfo.name} size={20} color={iconInfo.color} />
      </View>

      {/* Info */}
      <View style={styles.transactionInfo}>
        <Text style={[styles.transactionNature, { color: colors.textBlack }]} numberOfLines={1}>
          {item.transac_nature || 'Transaction'}
        </Text>
        <Text style={[styles.transactionDate, { color: colors.textSecColor }]}>
          {moment(item.creditOn).format('DD MMM YYYY • hh:mm A')}
        </Text>
        <View style={styles.transactionStatusRow}>
          <View style={[
            styles.statusBadge,
            {
              backgroundColor: item.transaction_status === 'Completed'
                ? '#D1FAE5'
                : item.transaction_status === 'Pending'
                  ? '#FEF3C7'
                  : '#FEE2E2',
            },
          ]}>
            <Text style={[
              styles.statusText,
              {
                color: item.transaction_status === 'Completed'
                  ? colors.successColor
                  : item.transaction_status === 'Pending'
                    ? colors.warningColor
                    : colors.dangerColor,
              },
            ]}>
              {item.transaction_status || 'Processing'}
            </Text>
          </View>
          <Text style={[styles.transactionType, { color: colors.textSecColor }]}>
            {item.tran_type}
          </Text>
        </View>
      </View>

      {/* Amount */}
      <View style={styles.transactionAmountCol}>
        <Text style={[
            styles.transactionAmount,
            { color: isDebit ? colors.dangerColor : colors.successColor },
          ]}>
          {isDebit ? '−' : '+'}{formatAmount(item)}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={colors.textSecColor}
          style={{ marginTop: 4 }}
        />
      </View>
    </TouchableOpacity>
  );
};

// ─────────────────────────────────────────────────
// EMPTY STATE COMPONENT
// ─────────────────────────────────────────────────
const EmptyState = ({ tab, colors  }) => (
  <View style={styles.emptyState}>
    <View style={[styles.emptyIconBox, { backgroundColor: colors.bgLight }]}>
      <Ionicons name="receipt-outline" size={48} color={colors.textSecColor2} />
    </View>
    <Text style={[styles.emptyTitle, { color: colors.textBlack }]}>No Transactions Yet</Text>
    <Text style={[styles.emptyDesc, { color: colors.textSecColor }]}>
      {tab === 1
        ? 'Your transaction history will appear here once you make a transaction'
        : `No ${TABS.find(t => t.id === tab)?.label} transactions found`}
    </Text>
  </View>
);

// ─────────────────────────────────────────────────
// FOOTER LOADER
// ─────────────────────────────────────────────────
const ListFooter = ({ isLoading, isEnd }) => {
  const { colors } = useThemeStyles();
  if (isLoading) {
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size={24} color={colors.primaryColor1} />
        <Text style={[styles.footerText, { color: colors.textSecColor }]}>Loading more...</Text>
      </View>
    );
  }
  if (isEnd) {
    return (
      <View style={styles.footerEnd}>
        <View style={[styles.footerEndLine, { backgroundColor: colors.dividerColor }]} />
        <Text style={[styles.footerEndText, { color: colors.textSecColor }]}>All transactions loaded</Text>
        <View style={styles.footerEndLine} />
      </View>
    );
  }
  return <View style={{ height: spacing.xl }} />;
};

// ─────────────────────────────────────────────────
// MAIN HISTORY SCREEN
// ─────────────────────────────────────────────────
const HistoryScreen = ({ navigation }) => {
  const isFocused = useIsFocused();
  const { S, colors, isDark } = useThemeStyles();
  const { userToken, userInfo } = useContext(AuthContext);

  // ── State ─────────────────────────────────────
  const [activeTab, setActiveTab] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // All transactions
  const [allData, setAllData] = useState([]);
  const [allPage, setAllPage] = useState(1);
  const [allLoading, setAllLoading] = useState(false);
  const [allEnd, setAllEnd] = useState(false);

  // PayPal transactions
  const [paypalData, setPaypalData] = useState([]);
  const [paypalPage, setPaypalPage] = useState(1);
  const [paypalLoading, setPaypalLoading] = useState(false);
  const [paypalEnd, setPaypalEnd] = useState(false);

  // Payoneer transactions
  const [payoneerData, setPayoneerData] = useState([]);
  const [payoneerPage, setPayoneerPage] = useState(1);
  const [payoneerLoading, setPayoneerLoading] = useState(false);
  const [payoneerEnd, setPayoneerEnd] = useState(false);

  // Bills transactions
  const [billsData, setBillsData] = useState([]);
  const [billsPage, setBillsPage] = useState(1);
  const [billsLoading, setBillsLoading] = useState(false);
  const [billsEnd, setBillsEnd] = useState(false);

  // ── Fetch All Transactions ────────────────────
const loadAll = async (reset = false) => {
  if (allLoading || (allEnd && !reset)) return;
  setAllLoading(true);
  const page = reset ? 1 : allPage;
  try {
    const res = await client.get(
      `api/all_historyMobile/${userInfo.userData._id}?page=${page}`,
      { headers: { 'Authorization': 'Bearer ' + userToken } }
    );
    if (res.data.length > 0) {
      setAllData(prev => {
        const combined = reset ? res.data : [...prev, ...res.data];
        const seen = new Set();                                    // ✅ deduplicate
        return combined.filter(item => {
          if (seen.has(item._id)) return false;
          seen.add(item._id);
          return true;
        });
      });
      setAllPage(page + 1);
      setAllEnd(false);
    } else {
      setAllEnd(true);
    }
  } catch (error) {
    console.log('All history error:', error.message);
  } finally {
    setAllLoading(false);
  }
};

// ── Fetch PayPal Transactions ─────────────────
const loadPaypal = async (reset = false) => {
  if (paypalLoading || (paypalEnd && !reset)) return;
  setPaypalLoading(true);
  const page = reset ? 1 : paypalPage;
  try {
    const res = await client.get(
      `api/all_historyMobilePapay/${userInfo.userData._id}?page=${page}`,
      { headers: { 'Authorization': 'Bearer ' + userToken } }
    );
    if (res.data.length > 0) {
      setPaypalData(prev => {
        const combined = reset ? res.data : [...prev, ...res.data];
        const seen = new Set();                                    // ✅ deduplicate
        return combined.filter(item => {
          if (seen.has(item._id)) return false;
          seen.add(item._id);
          return true;
        });
      });
      setPaypalPage(page + 1);
      setPaypalEnd(false);
    } else {
      setPaypalEnd(true);
    }
  } catch (error) {
    console.log('PayPal history error:', error.message);
  } finally {
    setPaypalLoading(false);
  }
};

// ── Fetch Payoneer Transactions ───────────────
const loadPayoneer = async (reset = false) => {
  if (payoneerLoading || (payoneerEnd && !reset)) return;
  setPayoneerLoading(true);
  const page = reset ? 1 : payoneerPage;
  try {
    const res = await client.get(
      `api/all_historyMobilePayooner/${userInfo.userData._id}?page=${page}`,
      { headers: { 'Authorization': 'Bearer ' + userToken } }
    );
    if (res.data.length > 0) {
      setPayoneerData(prev => {
        const combined = reset ? res.data : [...prev, ...res.data];
        const seen = new Set();                                    // ✅ deduplicate
        return combined.filter(item => {
          if (seen.has(item._id)) return false;
          seen.add(item._id);
          return true;
        });
      });
      setPayoneerPage(page + 1);
      setPayoneerEnd(false);
    } else {
      setPayoneerEnd(true);
    }
  } catch (error) {
    console.log('Payoneer history error:', error.message);
  } finally {
    setPayoneerLoading(false);
  }
};

// ── Fetch Bills Transactions ──────────────────
const loadBills = async (reset = false) => {
  if (billsLoading || (billsEnd && !reset)) return;
  setBillsLoading(true);
  const page = reset ? 1 : billsPage;
  try {
    const res = await client.get(
      `api/bills/history/${userInfo.userData._id}?page=${page}`,
      { headers: { 'Authorization': 'Bearer ' + userToken } }
    );
    if (res.data?.data?.length > 0) {
      setBillsData(prev => {
        const combined = reset ? res.data.data : [...prev, ...res.data.data];
        const seen = new Set();                                    // ✅ deduplicate
        return combined.filter(item => {
          if (seen.has(item._id)) return false;
          seen.add(item._id);
          return true;
        });
      });
      setBillsPage(page + 1);
      setBillsEnd(false);
    } else {
      setBillsEnd(true);
    }
  } catch (error) {
    console.log('Bills history error:', error.message);
    setBillsEnd(true);
  } finally {
    setBillsLoading(false);
  }
};

  // ── Tab Change Handler ─────────────────────────
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 1 && allData.length === 0) loadAll();
    if (tabId === 2 && paypalData.length === 0) loadPaypal();
    if (tabId === 3 && payoneerData.length === 0) loadPayoneer();
    if (tabId === 4 && billsData.length === 0) loadBills();
  };

  // ── Pull to Refresh ───────────────────────────
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setAllData([]); setAllPage(1); setAllEnd(false);
    setPaypalData([]); setPaypalPage(1); setPaypalEnd(false);
    setPayoneerData([]); setPayoneerPage(1); setPayoneerEnd(false);
    setBillsData([]); setBillsPage(1); setBillsEnd(false);
    await loadAll(true);
    if (activeTab === 2) await loadPaypal(true);
    if (activeTab === 3) await loadPayoneer(true);
    if (activeTab === 4) await loadBills(true);
    setIsRefreshing(false);
  }, [activeTab]);

  useEffect(() => {
    if (isFocused) {
      loadAll();
      loadPaypal();
      loadPayoneer();
    }
  }, [isFocused]);

  // ── Get active tab data ───────────────────────
  const getActiveData = () => {
    switch (activeTab) {
      case 1: return { data: allData, loading: allLoading, end: allEnd, onEnd: loadAll };
      case 2: return { data: paypalData, loading: paypalLoading, end: paypalEnd, onEnd: loadPaypal };
      case 3: return { data: payoneerData, loading: payoneerLoading, end: payoneerEnd, onEnd: loadPayoneer };
      case 4: return { data: billsData, loading: billsLoading, end: billsEnd, onEnd: loadBills };
      default: return { data: allData, loading: allLoading, end: allEnd, onEnd: loadAll };
    }
  };

  const { data, loading, end, onEnd } = getActiveData();

  // ── Summary Stats ─────────────────────────────
  const totalCredit = allData
    .filter(t => t.tran_type === 'Credit')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalDebit = allData
    .filter(t => t.tran_type === 'Debit')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgColor }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bgColor}
      />

      {/* ── Header ───────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={gs.homeSideMenu}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textBlack} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textBlack }]}>Transaction History</Text>
        <TouchableOpacity
          style={gs.homeSideMenu}
          onPress={handleRefresh}>
          <Ionicons name="refresh-outline" size={22} color={colors.primaryColor1} />
        </TouchableOpacity>
      </View>

      {/* ── Summary Banner ───────────────────────── */}
      <LinearGradient
        colors={[colors.primaryColor1, colors.primaryColor1b]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.summaryBanner}>
        <View style={styles.summaryCircle1} />
        <View style={styles.summaryCircle2} />

        <View style={styles.summaryItem}>
          <Ionicons name="arrow-down-circle-outline" size={20} color="rgba(255,255,255,0.8)" />
          <Text style={[styles.summaryLabel, { color: 'rgba(255,255,255,0.75)' }]}>
            Total In
          </Text>
          <Text style={[styles.summaryValue, { color: '#fff' }]}>
            ₦{totalCredit.toLocaleString()}
          </Text>
        </View>

        <View style={[styles.summaryDivider, { backgroundColor: 'rgba(255,255,255,0.25)' }]} />

        <View style={styles.summaryItem}>
          <Ionicons name="receipt-outline" size={20} color="rgba(255,255,255,0.8)" />
          <Text style={[styles.summaryLabel, { color: 'rgba(255,255,255,0.75)' }]}>
            Transactions
          </Text>
          <Text style={[styles.summaryValue, { color: '#fff' }]}>
            {allData.length}+
          </Text>
        </View>

        <View style={[styles.summaryDivider, { backgroundColor: 'rgba(255,255,255,0.25)' }]} />

        <View style={styles.summaryItem}>
          <Ionicons name="arrow-up-circle-outline" size={20} color="rgba(255,255,255,0.8)" />
          <Text style={[styles.summaryLabel, { color: 'rgba(255,255,255,0.75)' }]}>
            Total Out
          </Text>
          <Text style={[styles.summaryValue, { color: '#fff' }]}>
            ₦{totalDebit.toLocaleString()}
          </Text>
        </View>
      </LinearGradient>

      {/* ── Filter Tabs ───────────────────────────── */}
      <View style={styles.tabsContainer}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id.toString()}
              style={[
                  styles.tab,
                  { borderColor: colors.dividerColor },
                  isActive && { backgroundColor: tab.color, borderColor: tab.color },
                ]}
              onPress={() => handleTabChange(tab.id)}
              activeOpacity={0.8}>
              <Ionicons
                name={tab.icon}
                size={14}
                color={isActive ? '#fff' : colors.textSecColor}
              />
              <Text style={[
                  styles.tabText,
                  { color: colors.textSecColor },
                  isActive && { color: '#fff' },
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Transaction List ──────────────────────── */}
      <FlatList
        data={data}
        keyExtractor={(item, index) => `${item._id?.toString() ?? 'item'}-${index}`}
        renderItem={({ item }) => (
          <TransactionItem
            item={item}
            onPress={() => navigation.navigate('TranDetails', {
              record_id: item._id,
            })}
          />
        )}
        ListEmptyComponent={
          !loading ? <EmptyState tab={activeTab} colors={colors} /> : null
        }
        ListFooterComponent={
          <ListFooter isLoading={loading} isEnd={end} />
        }
        onEndReached={() => onEnd()}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primaryColor1}
            colors={[colors.primaryColor1]}
          />
        }
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

  // Summary Banner
  summaryBanner: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.lg,
  },
  summaryCircle1: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  summaryCircle2: {
    position: 'absolute',
    left: -15,
    bottom: -15,
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryLabel: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 16,
  },
  summaryValue: {
    fontFamily: '_bold',
    fontSize: typography.base,
    lineHeight: 22,
  },
  summaryDivider: {
    width: 1,
    marginHorizontal: spacing.sm,
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    
    
    gap: 4,
  },
  tabText: {
    fontFamily: '_semiBold',
    fontSize: typography.xs,
    
  },

  // List
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },

  // Transaction Item
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.sm,
    gap: spacing.md,
  },
  transactionIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionNature: {
    fontFamily: '_bold',
    fontSize: typography.base,
    
    lineHeight: 22,
    marginBottom: 2,
  },
  transactionDate: {
    fontFamily: '_regular',
    fontSize: typography.xs,
    
    lineHeight: 18,
    marginBottom: 4,
  },
  transactionStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusBadge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  statusText: {
    fontFamily: '_semiBold',
    fontSize: typography.xs,
    lineHeight: 16,
  },
  transactionType: {
    fontFamily: '_regular',
    fontSize: typography.xs,
    
    lineHeight: 16,
  },
  transactionAmountCol: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontFamily: '_bold',
    fontSize: typography.base,
    lineHeight: 22,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    
    textAlign: 'center',
    lineHeight: 22,
  },

  // Footer
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  footerText: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    
    lineHeight: 20,
  },
  footerEnd: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  footerEndLine: {
    flex: 1,
    height: 1,
  },
  footerEndText: {
    fontFamily: '_regular',
    fontSize: typography.xs,
    
    lineHeight: 16,
  },
});

export default HistoryScreen;
