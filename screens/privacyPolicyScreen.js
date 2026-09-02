import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, ActivityIndicator, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';

import { spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';
import client from '../contextAPI/client';

const { width, height } = Dimensions.get('window');

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useThemeStyles();

  const [fetchInfo, setFetchInfo] = useState({});
  const [fetchLoading, setFetchLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    loadPrivacyPolicy();
  }, []);

  const loadPrivacyPolicy = async () => {
    setFetchLoading(true);
    setHasError(false);
    try {
      const res = await client.get('/api/fetchAboutCompany');
      if (res.data.msg === '200') {
        setFetchInfo(res.data.infoData);
      } else {
        setHasError(true);
      }
    } catch (error) {
      console.log('Server error occurred:', error.message);
      setHasError(true);
    } finally {
      setFetchLoading(false);
    }
  };

  // ── Check if policy content is available ──────
  const isPolicyAvailable =
    !fetchLoading &&
    fetchInfo?.company_privacy_policy != null &&
    fetchInfo?.policy_status === 'Active';

  const isPolicyEmpty =
    !fetchLoading &&
    (fetchInfo?.company_privacy_policy == null ||
      fetchInfo?.policy_status !== 'Active');

  // ── Build HTML content for WebView ───────────
  const buildHtmlContent = (content) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 15px;
            line-height: 1.7;
            padding: 16px;
            background-color: ${isDark ? '#1E2132' : '#ffffff'};
            color: ${isDark ? '#E5E7EB' : '#1F2937'};
          }
          h1, h2, h3, h4, h5, h6 {
            color: ${isDark ? '#F9FAFB' : '#111827'};
            margin-bottom: 12px;
            margin-top: 20px;
            line-height: 1.4;
          }
          p {
            margin-bottom: 14px;
            color: ${isDark ? '#D1D5DB' : '#374151'};
          }
          ul, ol {
            margin-left: 20px;
            margin-bottom: 14px;
          }
          li {
            margin-bottom: 8px;
            color: ${isDark ? '#D1D5DB' : '#374151'};
          }
          a {
            color: ${isDark ? '#818CF8' : '#4C5FD5'};
            text-decoration: none;
          }
          strong, b {
            color: ${isDark ? '#F9FAFB' : '#111827'};
          }
          hr {
            border: none;
            border-top: 1px solid ${isDark ? '#374151' : '#E5E7EB'};
            margin: 20px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
          }
          td, th {
            border: 1px solid ${isDark ? '#374151' : '#E5E7EB'};
            padding: 8px 12px;
            color: ${isDark ? '#D1D5DB' : '#374151'};
          }
          th {
            background-color: ${isDark ? '#2D3250' : '#F3F4F6'};
            color: ${isDark ? '#F9FAFB' : '#111827'};
          }
        </style>
      </head>
      <body>${content}</body>
    </html>
  `;

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
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={colors.textBlack} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textBlack }]}>
          Privacy Policy
        </Text>
        <View style={styles.backBtn} />
      </View>

      {/* ── Hero Banner ──────────────────────────── */}
      <LinearGradient
        colors={['#8B5CF6', '#6D28D9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroBanner}>
        <View style={styles.heroCircle1} />
        <View style={styles.heroCircle2} />
        <View style={[styles.heroIconBox, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
          <Ionicons name="shield-checkmark-outline" size={26} color="#8B5CF6" />
        </View>
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>Privacy Policy</Text>
          <Text style={styles.heroDesc}>
            How we collect, use and protect your personal data
          </Text>
        </View>
      </LinearGradient>

      {/* ── Content Area ─────────────────────────── */}
      <View style={[styles.contentCard, { backgroundColor: colors.bgCard }]}>

        {/* Loading State */}
        {fetchLoading && (
          <View style={styles.centerState}>
            <View style={[styles.loadingBox, { backgroundColor: colors.bgLight }]}>
              <ActivityIndicator color={colors.primaryColor1} size="large" />
              <Text style={[styles.loadingText, { color: colors.textSecColor }]}>
                Loading Privacy Policy...
              </Text>
            </View>
          </View>
        )}

        {/* Error State */}
        {hasError && !fetchLoading && (
          <View style={styles.centerState}>
            <View style={[styles.stateIconBox, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
            </View>
            <Text style={[styles.stateTitle, { color: colors.textBlack }]}>
              Could Not Load
            </Text>
            <Text style={[styles.stateDesc, { color: colors.textSecColor }]}>
              Unable to load the Privacy Policy. Please check your connection.
            </Text>
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: colors.primaryColor1 }]}
              onPress={loadPrivacyPolicy}
              activeOpacity={0.85}>
              <Ionicons name="refresh-outline" size={18} color="#fff" />
              <Text style={styles.retryBtnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State */}
        {isPolicyEmpty && !hasError && (
          <View style={styles.centerState}>
            <View style={[styles.stateIconBox, { backgroundColor: colors.bgLight }]}>
              <Ionicons name="document-outline" size={48} color={colors.textSecColor} />
            </View>
            <Text style={[styles.stateTitle, { color: colors.textBlack }]}>
              Not Available
            </Text>
            <Text style={[styles.stateDesc, { color: colors.textSecColor }]}>
              Privacy Policy is not available at the moment. Please check back later.
            </Text>
          </View>
        )}

        {/* Policy Content via WebView */}
        {isPolicyAvailable && (
          <WebView
            originWhitelist={['*']}
            source={{ html: buildHtmlContent(fetchInfo.company_privacy_policy) }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            showsVerticalScrollIndicator={false}
            style={[styles.webview, { backgroundColor: colors.bgCard }]}
            renderLoading={() => (
              <View style={styles.centerState}>
                <ActivityIndicator color={colors.primaryColor1} size="large" />
              </View>
            )}
          />
        )}
      </View>

      {/* ── Footer Notice ────────────────────────── */}
      <View style={[
        styles.footerNotice,
        {
          backgroundColor: colors.bgLight,
          borderColor: colors.dividerColor,
        },
      ]}>
        <Ionicons name="lock-closed-outline" size={14} color={colors.primaryColor1} />
        <Text style={[styles.footerText, { color: colors.textSecColor }]}>
          Last updated · Your data is protected and never sold
        </Text>
      </View>
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
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Hero Banner
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    gap: spacing.md,
    ...shadows.md,
  },
  heroCircle1: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroCircle2: {
    position: 'absolute',
    left: -20,
    bottom: -20,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroIconBox: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    color: '#fff',
    marginBottom: 4,
  },
  heroDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },

  // Content Card
  contentCard: {
    flex: 1,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.sm,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.card,
  },
  webview: {
    flex: 1,
  },

  // Center States (loading, error, empty)
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  loadingBox: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.card,
  },
  loadingText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
  },
  stateIconBox: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stateTitle: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    textAlign: 'center',
  },
  stateDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.sm,
    ...shadows.sm,
  },
  retryBtnText: {
    fontFamily: '_bold',
    fontSize: typography.base,
    color: '#fff',
  },

  // Footer
  footerNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  footerText: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    lineHeight: 20,
  },
});

export default PrivacyPolicyScreen;