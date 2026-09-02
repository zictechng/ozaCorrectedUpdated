import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, ActivityIndicator, Dimensions, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';

import { spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';

const { width, height } = Dimensions.get('window');

const TermsConditionsScreen = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useThemeStyles();

  const [fetchLoading, setFetchLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

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
          Terms & Conditions
        </Text>
        <View style={styles.backBtn} />
      </View>

      {/* ── Hero Banner ──────────────────────────── */}
      <LinearGradient
        colors={[colors.primaryColor1, colors.primaryColor1b]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroBanner}>
        <View style={styles.heroCircle1} />
        <View style={styles.heroCircle2} />
        <View style={[styles.heroIconBox, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
          <Ionicons name="document-text-outline" size={26} color={colors.primaryColor1} />
        </View>
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>Terms & Conditions</Text>
          <Text style={styles.heroDesc}>
            Please read our terms carefully before using our services
          </Text>
        </View>
      </LinearGradient>

      {/* ── WebView Content ──────────────────────── */}
      <View style={[styles.webviewCard, { backgroundColor: colors.bgCard }]}>
        {hasError ? (
          // ── Error State ────────────────────────
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconBox, { backgroundColor: colors.bgLight }]}>
              <Ionicons name="alert-circle-outline" size={48} color={colors.dangerColor} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textBlack }]}>
              Could Not Load
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecColor }]}>
              Unable to load Terms & Conditions. Please check your connection and try again.
            </Text>
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: colors.primaryColor1 }]}
              onPress={() => setHasError(false)}
              activeOpacity={0.85}>
              <Ionicons name="refresh-outline" size={18} color="#fff" />
              <Text style={styles.retryBtnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <WebView
            originWhitelist={['*']}
            source={{ uri: 'https://ozaapp.com/mobiletc' }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            onError={() => setHasError(true)}
            onHttpError={() => setHasError(true)}
            renderLoading={() => (
              // ── Loading State ────────────────────
              <View style={styles.loadingState}>
                <View style={[styles.loadingBox, { backgroundColor: colors.bgCard }]}>
                  <ActivityIndicator
                    color={colors.primaryColor1}
                    size="large"
                  />
                  <Text style={[styles.loadingText, { color: colors.textSecColor }]}>
                    Loading Terms & Conditions...
                  </Text>
                </View>
              </View>
            )}
            style={[
              styles.webview,
              {
                backgroundColor: colors.bgCard,
                // ✅ Inject dark mode CSS into WebView when dark theme is active
              },
            ]}
            injectedJavaScript={isDark ? `
              (function() {
                var style = document.createElement('style');
                style.innerHTML = \`
                  body {
                    background-color: #1a1a2e !important;
                    color: #E5E7EB !important;
                    font-family: -apple-system, sans-serif !important;
                  }
                  a { color: #818CF8 !important; }
                  h1, h2, h3, h4, h5, h6 {
                    color: #F9FAFB !important;
                  }
                  p, li, span, td, th {
                    color: #D1D5DB !important;
                  }
                \`;
                document.head.appendChild(style);
              })();
              true;
            ` : undefined}
          />
        )}
      </View>

      {/* ── Footer Notice ────────────────────────── */}
      <View style={[styles.footerNotice, { backgroundColor: colors.bgLight, borderTopColor: colors.dividerColor }]}>
        <Ionicons name="shield-checkmark-outline" size={16} color={colors.primaryColor1} />
        <Text style={[styles.footerText, { color: colors.textSecColor }]}>
          By using our app you agree to these terms
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

  // WebView Card
  webviewCard: {
    flex: 1,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.sm,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.card,
  },
  webview: {
    flex: 1,
    borderRadius: radius.xl,
  },

  // Loading State
  loadingState: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
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

  // Empty / Error State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    textAlign: 'center',
  },
  emptyDesc: {
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
    borderTopWidth: 0,
  },
  footerText: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    lineHeight: 20,
  },
});

export default TermsConditionsScreen;