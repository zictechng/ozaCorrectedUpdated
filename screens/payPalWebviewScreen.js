import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, ActivityIndicator, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { ALERT_TYPE, Dialog, Toast } from 'react-native-alert-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';
import { noticeData } from '../components/errorNotice';
import { AuthContext } from '../contextAPI/authContext';

const PayPalWebviewScreen = ({ route, navigation }) => {
  const { colors, isDark } = useThemeStyles();
  const { userInfo } = useContext(AuthContext);

  const uri        = route.params?.uri;
  const amount     = route.params?.amount     || '0';
  const currency   = route.params?.currency   || 'USD';
  const assetLabel = route.params?.assetLabel || 'PayPal';
  const ngnAmount  = route.params?.ngnAmount  || '0';

  const [baseUrl, setBaseUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [pageTitle, setPageTitle] = useState('PayPal');
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AsyncStorage.getItem('AppSettingData').then(res => {
      if (res) {
        const data = JSON.parse(res);
        setBaseUrl(data?.app_baseurl || '');
      }
    }).catch(() => {});
  }, []);

  // Animate progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [progress]);

    const handleNavigationStateChange = (navState) => {
    if (navState.title) setPageTitle(navState.title);
    const url = navState.url || '';

    // Detect success — URL contains /api/success regardless of domain
    if (url.includes('/api/success') || url.includes('PayerID=')) {
      navigation.replace('Home');
      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Payment Successful! 🎉',
        button: 'Done',
        textBody: `Your PayPal payment of $${amount} ${currency} has been received. Your local bank account will be credited shortly.`,
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
      return;
    }

    // Detect cancel
    if (url.includes('/api/cancel')) {
      navigation.goBack();
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Payment Cancelled',
        textBody: 'Your PayPal payment was cancelled. No funds were deducted.',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
    }
  };

  if (!uri) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bgColor }]}>
        <View style={styles.errorView}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.dangerColor} />
          <Text style={[styles.errorText, { color: colors.textBlack }]}>
            PayPal link not available
          </Text>
          <TouchableOpacity
            style={[styles.errorBtn, { backgroundColor: colors.primaryColor1 }]}
            onPress={() => navigation.goBack()}>
            <Text style={styles.errorBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgColor }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bgColor}
      />

      {/* ── Header ──────────────────────────────── */}
      <View style={[styles.header, { backgroundColor: colors.bgCard, borderBottomColor: colors.dividerColor }]}>
        <TouchableOpacity
          style={[styles.headerBtn, { backgroundColor: colors.bgLight }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}>
          <Ionicons name="close" size={20} color={colors.textBlack} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerTitleRow}>
            <View style={[styles.secureBadge, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="lock-closed" size={10} color="#2E7D32" />
            </View>
            <Text style={[styles.headerTitle, { color: colors.textBlack }]} numberOfLines={1}>
              {pageTitle}
            </Text>
          </View>
          <Text style={[styles.headerSub, { color: colors.textSecColor }]}>
            Secured by PayPal
          </Text>
        </View>

        <View style={[styles.headerBtn, { backgroundColor: colors.bgLight }]}>
          <Ionicons name="logo-paypal" size={20} color="#003087" />
        </View>
      </View>

      {/* ── Progress Bar ──────────────────────── */}
      {isLoading && (
        <Animated.View
          style={[
            styles.progressBar,
            {
              backgroundColor: '#003087',
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      )}

      {/* ── Transaction Summary Strip ─────────── */}
      <View style={[styles.summaryStrip, { backgroundColor: '#003087' }]}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Selling</Text>
          <Text style={styles.summaryValue}>{assetLabel}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>You Pay</Text>
          <Text style={styles.summaryValue}>${Number(amount).toLocaleString()} {currency}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>You Get</Text>
          <Text style={styles.summaryValue}>₦{Number(ngnAmount).toLocaleString()}</Text>
        </View>
      </View>

      {/* ── WebView ───────────────────────────── */}
      <View style={styles.webviewContainer}>
        <WebView
          source={{ uri }}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadStart={() => setIsLoading(true)}
          onLoadProgress={({ nativeEvent }) => setProgress(nativeEvent.progress)}
          onLoadEnd={(syntheticEvent) => {
            setIsLoading(false);
            setProgress(1);
            // Check URL on load end as backup
            const { url } = syntheticEvent.nativeEvent;
            if (url?.includes('/api/success') || url?.includes('PayerID=')) {
              navigation.replace('Home');
              Dialog.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'Payment Successful! 🎉',
                button: 'Done',
                textBody: `Your PayPal payment of $${amount} ${currency} has been received. Your NGN wallet will be credited shortly.`,
                titleStyle: noticeData[0].errorTitleStyle,
                textBodyStyle: noticeData[0].errorMessageStyle,
              });
            } else if (url?.includes('/api/cancel')) {
              navigation.goBack();
              Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Payment Cancelled',
                textBody: 'Your PayPal payment was cancelled.',
                titleStyle: noticeData[0].errorTitleStyle,
                textBodyStyle: noticeData[0].errorMessageStyle,
              });
            }
          }}
          startInLoadingState
          originWhitelist={['*']}
          setSupportMultipleWindows={false}
          onShouldStartLoadWithRequest={(request) => {
            const url = request.url || '';
            if (url.startsWith('about:') || url.startsWith('javascript:')) {
              return false;
            }
            return true;
          }}
          renderLoading={() => (
            <View style={[styles.loadingOverlay, { backgroundColor: colors.bgColor }]}>
              <View style={[styles.loadingCard, { backgroundColor: colors.bgCard }]}>
                <ActivityIndicator size="large" color="#003087" />
                <Text style={[styles.loadingTitle, { color: colors.textBlack }]}>
                  Loading PayPal
                </Text>
                <Text style={[styles.loadingDesc, { color: colors.textSecColor }]}>
                  Please wait while we securely connect to PayPal...
                </Text>
              </View>
            </View>
          )}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
        />
      </View>

      {/* ── Footer Security Notice ────────────── */}
      <View style={[styles.footer, { backgroundColor: colors.bgCard, borderTopColor: colors.dividerColor }]}>
        <Ionicons name="shield-checkmark-outline" size={14} color={colors.successColor} />
        <Text style={[styles.footerText, { color: colors.textSecColor }]}>
          Your payment is protected by PayPal's secure payment system
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  secureBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    maxWidth: 200,
  },
  headerSub: {
    fontFamily: '_regular',
    fontSize: typography.xs,
    marginTop: 1,
  },

  // Progress Bar
  progressBar: {
    height: 3,
    position: 'absolute',
    top: 65,
    left: 0,
    zIndex: 10,
  },

  // Summary Strip
  summaryStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontFamily: '_regular',
    fontSize: typography.xs,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  summaryValue: {
    fontFamily: '_bold',
    fontSize: typography.sm,
    color: '#FFFFFF',
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: spacing.sm,
  },

  // WebView
  webviewContainer: { flex: 1 },

  // Loading
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
  loadingCard: {
    borderRadius: radius.xl,
    padding: spacing.xxxl,
    alignItems: 'center',
    gap: spacing.md,
    width: '75%',
    ...shadows.lg,
  },
  loadingTitle: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    textAlign: 'center',
  },
  loadingDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderTopWidth: 1,
    gap: spacing.xs,
  },
  footerText: {
    fontFamily: '_regular',
    fontSize: typography.xs,
    lineHeight: 18,
    flex: 1,
  },

  // Error
  errorView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
  },
  errorText: {
    fontFamily: '_semiBold',
    fontSize: typography.lg,
    textAlign: 'center',
  },
  errorBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  errorBtnText: {
    fontFamily: '_bold',
    fontSize: typography.base,
    color: '#fff',
  },
});

export default PayPalWebviewScreen;