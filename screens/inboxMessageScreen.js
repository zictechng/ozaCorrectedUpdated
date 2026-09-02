import React, { useContext, useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';

import { gs, spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';
import { AuthContext } from '../contextAPI/authContext';
import client from '../contextAPI/client';
import MessageCard from '../components/MessageCard';

// ── List Footer ───────────────────────────────────
const ListFooter = ({ isLoading, isEnd, colors }) => {
  if (isLoading) {
    return (
      <View style={styles.footerRow}>
        <ActivityIndicator size={22} color={colors.primaryColor1} />
        <Text style={[styles.footerText, { color: colors.textSecColor }]}>
          Loading more...
        </Text>
      </View>
    );
  }
  if (isEnd) {
    return (
      <View style={styles.footerEndRow}>
        <View style={[styles.footerLine, { backgroundColor: colors.dividerColor }]} />
        <Text style={[styles.footerEndText, { color: colors.textSecColor }]}>
          All messages loaded
        </Text>
        <View style={[styles.footerLine, { backgroundColor: colors.dividerColor }]} />
      </View>
    );
  }
  return <View style={{ height: spacing.xl }} />;
};

// ── Empty State ───────────────────────────────────
const EmptyState = ({ colors }) => (
  <View style={styles.emptyState}>
    <View style={[styles.emptyIconBox, { backgroundColor: colors.bgLight }]}>
      <Ionicons name="mail-outline" size={48} color={colors.textSecColor2} />
    </View>
    <Text style={[styles.emptyTitle, { color: colors.textBlack }]}>
      No Messages Yet
    </Text>
    <Text style={[styles.emptyDesc, { color: colors.textSecColor }]}>
      Your notifications and alerts from the platform will appear here
    </Text>
  </View>
);

// ── Main Screen ───────────────────────────────────
const InboxMessageScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { colors, isDark } = useThemeStyles();
  const { userToken, userInfo } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isListEnd, setIsListEnd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // ── Load Messages ─────────────────────────────
  const loadMessages = useCallback(async (reset = false) => {
    if (isLoading || (isListEnd && !reset)) return;
    setIsLoading(true);
    const page = reset ? 1 : currentPage;
    try {
      const res = await client.get(
        `api/user_notificationMobile/${userInfo.userData._id}?page=${page}`,
        { headers: { 'Authorization': 'Bearer ' + userToken } }
      );
      if (Array.isArray(res.data) && res.data.length > 0) {
        setMessages(prev => reset ? res.data : [...prev, ...res.data]);
        setCurrentPage(page + 1);
        setIsListEnd(false);
        // Count unread — assume all unread if no read flag
        const unread = res.data.filter(m => !m.is_read).length;
        setUnreadCount(prev => reset ? unread : prev + unread);
      } else {
        setIsListEnd(true);
      }
    } catch (error) {
      console.log('Messages error:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isListEnd, currentPage, userInfo, userToken]);

  useEffect(() => {
    if (isFocused) loadMessages(true);
  }, [isFocused]);

  // ── Pull to Refresh ───────────────────────────
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setMessages([]);
    setCurrentPage(1);
    setIsListEnd(false);
    await loadMessages(true);
    setIsRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgColor }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bgColor}
      />

      {/* ── Header ─────────────────────────── */}
      <View style={[styles.header, { backgroundColor: colors.bgColor }]}>
        <TouchableOpacity
          style={[gs.homeSideMenu, { backgroundColor: colors.bgLight }]}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textBlack} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.textBlack }]}>
            Inbox
          </Text>
          {unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.dangerColor }]}>
              <Text style={styles.unreadCount}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={[gs.homeSideMenu, { backgroundColor: colors.bgLight }]}
          onPress={handleRefresh}>
          <Ionicons name="refresh-outline" size={22} color={colors.primaryColor1} />
        </TouchableOpacity>
      </View>

      {/* ── Summary Banner ─────────────────── */}
      <LinearGradient
        colors={[colors.primaryColor1, colors.primaryColor1b]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.summaryBanner}>
        <View style={styles.summaryCircle} />
        <View style={styles.summaryItem}>
          <Ionicons name="mail-outline" size={18} color="rgba(255,255,255,0.8)" />
          <Text style={styles.summaryLabel}>Total Messages</Text>
          <Text style={styles.summaryValue}>{messages.length}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Ionicons name="notifications-outline" size={18} color="rgba(255,255,255,0.8)" />
          <Text style={styles.summaryLabel}>Unread</Text>
          <Text style={styles.summaryValue}>{unreadCount}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Ionicons name="checkmark-done-outline" size={18} color="rgba(255,255,255,0.8)" />
          <Text style={styles.summaryLabel}>Read</Text>
          <Text style={styles.summaryValue}>
            {Math.max(messages.length - unreadCount, 0)}
          </Text>
        </View>
      </LinearGradient>

      {/* ── Messages FlatList ──────────────── */}
      <FlatList
        data={messages}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={({ item }) => <MessageCard item={item} />}
        ListEmptyComponent={
          !isLoading ? <EmptyState colors={colors} /> : null
        }
        ListFooterComponent={
          <ListFooter
            isLoading={isLoading}
            isEnd={isListEnd}
            colors={colors}
          />
        }
        onEndReached={() => loadMessages()}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          messages.length === 0 && { flexGrow: 1 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primaryColor1}
            colors={[colors.primaryColor1]}
          />
        }
        ItemSeparatorComponent={() => (
          <View style={{ height: spacing.xs }} />
        )}
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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontFamily: '_bold',
    fontSize: typography.xl,
  },
  unreadBadge: {
    borderRadius: radius.full,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  unreadCount: {
    fontFamily: '_bold',
    fontSize: typography.xs,
    lineHeight: 16,
    color: '#fff',
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
  summaryCircle: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
    summaryLabel: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.8)',
  },
  summaryValue: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    lineHeight: 24,
    color: '#fff',
  },
  summaryDivider: {
    width: 1,
    marginHorizontal: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },

  // List
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
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
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  footerText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
  },
  footerEndRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  footerLine: {
    flex: 1,
    height: 1,
  },
  footerEndText: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    lineHeight: 20,
  },
});

export default InboxMessageScreen;