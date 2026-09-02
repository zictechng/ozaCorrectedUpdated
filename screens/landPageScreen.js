import React, {
  useContext, useEffect, useState, useRef, useCallback,
} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
  Dimensions, Animated, FlatList, Image, PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Updates from 'expo-updates';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { gs, spacing, radius, typography, shadows } from '../styles';
import { heroHeight, screenWidth, screenHeight, isSmallPhone } from '../utils/responsive';
import useTheme from '../hooks/useTheme';
import { AuthContext } from '../contextAPI/authContext';
import client from '../contextAPI/client';

const { width, height } = Dimensions.get('window');
const SLIDE_WIDTH = width;

// ─────────────────────────────────────────────────
// SLIDE CONFIG
// ─────────────────────────────────────────────────
const SLIDES = [
  {
    id: '1',
    icon: 'swap-horizontal',
    gradientColors: ['#4C5FD5', '#6C7FE8'],
    accentColor: '#4C5FD5',
    title: 'Buy & Sell\nInstantly',
    desc: 'Trade PayPal, Payoneer and Bitcoin at the best rates — fast, secure and reliable.',
    pills: ['Best Rates', 'Fast Delivery', 'Secure'],
    cardType: 'trade',
    cardData: {
      label: 'PayPal Balance',
      amount: '$250.00',
      sub: 'Selling at ₦1,580/$',
      badge: 'Live Rate',
      badgeColor: '#10B981',
    },
  },
  {
    id: '2',
    icon: 'flash',
    gradientColors: ['#F59E0B', '#D97706'],
    accentColor: '#F59E0B',
    title: 'Pay Bills\nEasily',
    desc: 'Electricity, airtime, data, TV subscriptions and exam cards at the cheapest rates.',
    pills: ['Instant', 'Cheapest', 'All Networks'],
    cardType: 'bills',
    cardData: {
      label: 'Last Bill Payment',
      amount: '₦5,000',
      sub: 'IKEDC Electricity Token',
      badge: 'Delivered',
      badgeColor: '#10B981',
    },
  },
  {
    id: '3',
    icon: 'gift',
    gradientColors: ['#10B981', '#059669'],
    accentColor: '#10B981',
    title: 'Earn Coins\n& Rewards',
    desc: 'Earn coins on every transaction. Refer friends and unlock quarterly gift rewards.',
    pills: ['Earn Daily', 'Refer & Earn', 'VIP Gifts'],
    cardType: 'rewards',
    cardData: {
      label: 'My Coins',
      amount: '1,250 🪙',
      sub: '≈ ₦1,250 NGN • $0.75 USD',
      badge: 'Gold Tier',
      badgeColor: '#F0A500',
    },
  },
  {
    id: '4',
    icon: 'shield-checkmark',
    gradientColors: ['#8B5CF6', '#6D28D9'],
    accentColor: '#8B5CF6',
    title: 'Safe &\nSecure',
    desc: 'Your funds and data are protected with bank-level security and end-to-end encryption.',
    pills: ['Encrypted', 'KYC Verified', '2FA Login'],
    cardType: 'security',
    cardData: {
      label: 'Account Security',
      amount: '100% Secure',
      sub: '2FA • KYC • Encrypted',
      badge: 'Verified',
      badgeColor: '#10B981',
    },
  },
];

// ─────────────────────────────────────────────────
// FLOATING PRODUCT CARD
// Shows a realistic app UI preview per slide
// ─────────────────────────────────────────────────
const FloatingCard = ({ data, accentColor }) => (
  <View style={[
    styles.floatingCard,
    { backgroundColor: '#fff' },                        // ✅ always white — card on gradient
  ]}>
    <View style={styles.cardTopBar}>
      <View style={[styles.cardDot, { backgroundColor: accentColor }]} />
      <View style={[styles.cardDot, { backgroundColor: accentColor, opacity: 0.5 }]} />
      <View style={[styles.cardDot, { backgroundColor: accentColor, opacity: 0.3 }]} />
    </View>

    <Text style={[styles.cardLabel, { color: '#6B7280' }]}>         
      {data.label}
    </Text>
    <Text style={[styles.cardAmount, { color: accentColor }]}>
      {data.amount}
    </Text>
    <Text style={[styles.cardSub, { color: '#9CA3AF' }]}>       
      {data.sub}
    </Text>

    <View style={[styles.cardBadge, { backgroundColor: data.badgeColor + '20' }]}>
      <View style={[styles.cardBadgeDot, { backgroundColor: data.badgeColor }]} />
      <Text style={[styles.cardBadgeText, { color: data.badgeColor }]}>
        {data.badge}
      </Text>
    </View>
  </View>
);

// ─────────────────────────────────────────────────
// DOT INDICATORS
// ─────────────────────────────────────────────────
const DotIndicator = ({ total, active, activeColor }) => (
  <View style={styles.dotsRow}>
    {Array.from({ length: total }).map((_, i) => (
      <Animated.View
        key={i}
        style={[
          styles.dot,
          i === active
            ? [styles.dotActive, { backgroundColor: activeColor }]
            : styles.dotInactive,
        ]}
      />
    ))}
  </View>
);

// ─────────────────────────────────────────────────
// SOCIAL PROOF ROW
// ─────────────────────────────────────────────────
const SocialProof = ({ colors }) => (
  <View style={styles.socialProofRow}>
    {/* Avatar stack */}
    <View style={styles.avatarStack}>
      {['#4C5FD5', '#10B981', '#F59E0B', '#EF4444'].map((color, i) => (
        <View
          key={i}
          style={[
            styles.stackAvatar,
            { backgroundColor: color, marginLeft: i === 0 ? 0 : -10,
              borderColor: colors.bgColor,
             },
            
          ]}>
          <Ionicons name="person" size={12} color="#fff" />
        </View>
      ))}
    </View>
    <View style={styles.socialProofInfo}>
      <Text style={[styles.socialProofTitle, { color: colors.textBlack }]}>
        10,000+ users trust us
      </Text>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((s) => (
          <Ionicons key={s} name="star" size={12} color="#F59E0B" />
        ))}
        <Text style={[styles.ratingText, { color: colors.textSecColor }]}>
          4.8 rating
        </Text>
      </View>
    </View>
  </View>
);

// ─────────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────────
const LandPageScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { colors, isDark } = useTheme();
  const { appSettingDetails } = useContext(AuthContext);

  const [activeSlide, setActiveSlide] = useState(0);
  const [appDetails, setAppDetails] = useState(null);

  const flatListRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const autoPlayRef = useRef(null);
  const isScrolling = useRef(false);

  const currentSlide = SLIDES[activeSlide];
  const appName = appDetails?.infoData?.app_name
    || appSettingDetails?.app_name
    || 'OtaMobile';

  // ── Animate slide content ─────────────────────
  const animateContent = useCallback(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.95, duration: 150, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20 }),
      ]),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  // ── Auto-play ─────────────────────────────────
  const startAutoPlay = useCallback(() => {
    clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      if (!isScrolling.current) {
        const next = (activeSlide + 1) % SLIDES.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        setActiveSlide(next);
        animateContent();
      }
    }, 4500);
  }, [activeSlide, animateContent]);

  useEffect(() => {
    startAutoPlay();
    return () => clearInterval(autoPlayRef.current);
  }, [activeSlide]);

  // ── Fetch App Details ─────────────────────────
  const loadAppDetails = async () => {
    try {
      const cached = await AsyncStorage.getItem('AppSettingInfo');
      if (cached) setAppDetails(JSON.parse(cached));
      const res = await client.get('/api/app_info');
      if (res.data.msg === '200') {
        setAppDetails(res.data);
        AsyncStorage.setItem('AppSettingInfo', JSON.stringify(res.data));
      }
    } catch (error) {
      console.log('App details error:', error.message);
    }
  };

  // ── Check for Updates (production only) ──────
  const checkForUpdate = async () => {
    try {
      if (!Updates.isEmbeddedLaunch) return;
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    } catch (error) {
      console.log('Update check skipped:', error.message);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadAppDetails();
      checkForUpdate();
    }
  }, [isFocused]);

  // ── Handle manual slide change ────────────────
  const handleSlideChange = (index) => {
    clearInterval(autoPlayRef.current);
    setActiveSlide(index);
    animateContent();
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  // ── Render each slide hero ────────────────────
  const renderSlide = ({ item }) => (
    <View style={{ width: SLIDE_WIDTH }}>
      <LinearGradient
        colors={[...item.gradientColors, colors.bgColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.2, y: 1 }}
        style={styles.heroGradient}>

        {/* Decorative circles */}
        <View style={[styles.circle1, { borderColor: 'rgba(255,255,255,0.15)' }]} />
        <View style={styles.circle2} />

        {/* Floating Product Card */}
        <Animated.View style={[
          styles.cardWrapper,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}>
          <FloatingCard data={item.cardData} accentColor={item.accentColor} />
        </Animated.View>

        {/* Large background icon */}
        <View style={styles.bgIconBox}>
          <Ionicons
            name={item.icon}
            size={180}
            color="rgba(255,255,255,0.06)"
          />
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bgColor }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* ── Skip Button ───────────────────────── */}
      <SafeAreaView style={styles.skipWrapper}>
        <View style={styles.topRow}>
          <Text style={styles.appNameText}>{appName}</Text>
          <TouchableOpacity
            style={[styles.skipBtn, { backgroundColor: 'rgba(255,255,255,0.25)' }]}
            onPress={() => navigation.navigate('Login')}>
            <Text style={styles.skipBtnText}>Sign In</Text>
            <Ionicons name="arrow-forward" size={14} color="#fff" />
          </TouchableOpacity>
          
        </View>
      </SafeAreaView>

      {/* ── Swipeable Hero Slides ─────────────── */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScrollBeginDrag={() => {
          isScrolling.current = true;
          clearInterval(autoPlayRef.current);
        }}
        onMomentumScrollEnd={(e) => {
          isScrolling.current = false;
          const index = Math.round(e.nativeEvent.contentOffset.x / SLIDE_WIDTH);
          setActiveSlide(index);
          animateContent();
        }}
        getItemLayout={(_, index) => ({
          length: SLIDE_WIDTH,
          offset: SLIDE_WIDTH * index,
          index,
        })}
        style={styles.heroPager}
      />

      {/* ── Content Section ───────────────────── */}
      <ScrollView
        style={[styles.contentSection, { backgroundColor: colors.bgColor }]}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
        bounces={false}>

        {/* Animated slide text */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={[styles.slideTitle, { color: colors.textBlack }]}>
            {currentSlide.title}
          </Text>
          <Text style={[styles.slideDesc, { color: colors.textSecColor }]}>
            {currentSlide.desc}
          </Text>
        </Animated.View>

        {/* Dot indicators */}
        <View style={styles.dotsRow}>
          {SLIDES.map((slide, i) => (
            <TouchableOpacity
              key={slide.id}
              onPress={() => handleSlideChange(i)}
              activeOpacity={0.8}>
              <View style={[
                styles.dot,
                i === activeSlide
                  ? [styles.dotActive, { backgroundColor: currentSlide.accentColor }]
                  : [styles.dotInactive, { backgroundColor: colors.dividerColor }],
              ]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Feature pills */}
        <View style={styles.pillsRow}>
          {currentSlide.pills.map((pill) => (
            <View key={pill} style={[
              styles.pill,
              { backgroundColor: currentSlide.accentColor + '15' },
            ]}>
              <Ionicons name="checkmark-circle" size={14} color={currentSlide.accentColor} />
              <Text style={[styles.pillText, { color: currentSlide.accentColor }]}>
                {pill}
              </Text>
            </View>
          ))}
        </View>

        {/* Social Proof */}
        <SocialProof colors={colors} />

        {/* CTA Buttons */}
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: currentSlide.accentColor }]}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>Create Free Account</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryBtn, { borderColor: currentSlide.accentColor }]}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}>
          <Text style={[styles.secondaryBtnText, { color: currentSlide.accentColor }]}>
            Sign In to Account
          </Text>
        </TouchableOpacity>

        {/* Terms */}
        <Text style={[styles.termsText, { color: colors.textSecColor }]}>
          By continuing, you agree to our{' '}
          <Text
            style={[styles.termsLink, { color: currentSlide.accentColor }]}
            onPress={() => navigation.navigate('TermCondition')}>
            Terms
          </Text>
          {' '}&{' '}
          <Text
            style={[styles.termsLink, { color: currentSlide.accentColor }]}
            onPress={() => navigation.navigate('PrivacyPolicy')}>
            Privacy Policy
          </Text>
        </Text>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Skip / Top Row
  skipWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  appNameText: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    letterSpacing: 0.5,
    color: '#fff',   
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: 4,
  },
  skipBtnText: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
    lineHeight: 20,
    color: '#fff', 
  },

  // Hero Pager
  heroPager: {
    height: heroHeight,
    flexShrink: 0, 
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    minHeight: heroHeight,
  },

  // Decorative
  circle1: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    top: -80,
    right: -60,
  },
  circle2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    bottom: -40,
    left: -40,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  bgIconBox: {
    position: 'absolute',
    bottom: -20,
    right: -20,
    opacity: 1,
  },

  // Floating Card
  cardWrapper: {
    zIndex: 2,
  },
  floatingCard: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    width: width * 0.6,
    ...shadows.lg,
  },
  cardTopBar: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing.md,
  },
  cardDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardLabel: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    lineHeight: 20,
    marginBottom: 4,
  },
  cardAmount: {
    fontFamily: '_bold',
    fontSize: typography.xxl,
    lineHeight: 32,
    marginBottom: 4,
  },
  cardSub: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  cardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    gap: 4,
  },
  cardBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  cardBadgeText: {
    fontFamily: '_bold',
    fontSize: typography.xs,
    lineHeight: 16,
  },

  // Content Section
  contentSection: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentInner: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  slideTitle: {
    fontFamily: '_bold',
    fontSize: typography.xxxl,
    lineHeight: 38,
    marginBottom: spacing.sm,
  },
  slideDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 24,
    marginBottom: spacing.md,
  },

  // Dots
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  dot: {
    height: 7,
    borderRadius: radius.full,
  },
  dotActive: {
    width: 22,
  },
  dotInactive: {
    width: 7,
  },

  // Pills
  pillsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: 4,
  },
  pillText: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
    lineHeight: 20,
  },

  // Social Proof
  socialProofRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackAvatar: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  socialProofInfo: {
    flex: 1,
  },
  socialProofTitle: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
    lineHeight: 18,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  ratingText: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    marginLeft: 4,
    lineHeight: 18,
  },

  // Buttons
  primaryBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 54,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
    ...shadows.md,
  },
  primaryBtnText: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    color: '#fff', 
  },
  secondaryBtn: {
    height: 50,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    marginBottom: spacing.md,
  },
  secondaryBtnText: {
    fontFamily: '_bold',
    fontSize: typography.base,
  },

  // Terms
  termsText: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    fontFamily: '_semiBold',
  },
});

export default LandPageScreen;