import React, { useContext, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';
import { AuthContext } from '../contextAPI/authContext';
import client from '../contextAPI/client';

// ── Step config ───────────────────────────────────
const STEPS = [
  {
    key: 'stage0',
    label: 'Open Account',
    desc: 'Account successfully created',
    icon: 'person-circle-outline',
    route: null,
    alwaysDone: true,
  },
  {
    key: 'stage2',
    label: 'Complete Profile Details',
    desc: 'Fill in your personal information',
    icon: 'person-outline',
    route: 'CompleteSignup',
  },
  {
    key: 'stage3',
    label: 'Upload Profile Photo',
    desc: 'Add a clear profile picture',
    icon: 'camera-outline',
    route: 'UploadProfile_image',
  },
  {
    key: 'stage4',
    label: 'Upload Document ID',
    desc: 'Verify identity with a valid ID',
    icon: 'document-text-outline',
    route: 'UploadDocument',
  },
  {
    key: 'stage5',
    label: 'Proof of Account Ownership',
    desc: 'Verify you own this account',
    icon: 'shield-checkmark-outline',
    route: 'Verify2faces',
    iconLib: 'material',
  },
  {
    key: 'stage6',
    label: 'Proof of Address',
    desc: 'Upload a utility bill or bank statement',
    icon: 'home-outline',
    route: 'UploadProofAddress',
  },
];

// ── Step Row Component ────────────────────────────
const StepRow = ({ step, isDone, isFirst, onPress, colors, isDark, index }) => {
  const isDisabled = isDone || step.alwaysDone;

  return (
    <TouchableOpacity
      style={[
        styles.stepCard,
        {
          backgroundColor: colors.bgCard,
          borderColor: isDone
            ? colors.successColor + '30'
            : isDark ? colors.dividerColor : '#F3F4F6',
          borderWidth: 1.5,
        },
      ]}
      onPress={isDisabled ? null : onPress}
      disabled={isDisabled}
      activeOpacity={0.8}>

      {/* Step number + icon */}
      <View style={[
        styles.stepIconBox,
        {
          backgroundColor: isDone
            ? colors.successColor + '15'
            : step.alwaysDone
              ? colors.successColor + '15'
              : colors.primaryColor1 + '15',
        },
      ]}>
        {step.iconLib === 'material' ? (
          <Ionicons
            name={step.icon}
            size={22}
            color={isDone || step.alwaysDone
              ? colors.successColor
              : colors.primaryColor1}
          />
        ) : (
          <Ionicons
            name={step.icon}
            size={22}
            color={isDone || step.alwaysDone
              ? colors.successColor
              : colors.primaryColor1}
          />
        )}
      </View>

      {/* Step info */}
      <View style={styles.stepInfo}>
        <Text style={[
          styles.stepLabel,
          {
            color: isDone || step.alwaysDone
              ? colors.textSecColor
              : colors.textBlack,
          },
        ]}>
          {step.label}
        </Text>
        <Text style={[styles.stepDesc, { color: colors.textSecColor }]}>
          {step.desc}
        </Text>
      </View>

      {/* Status indicator */}
      <View style={[
        styles.statusBox,
        {
          backgroundColor: isDone || step.alwaysDone
            ? colors.successColor + '15'
            : '#FEE2E2',
        },
      ]}>
        {isDone || step.alwaysDone ? (
          <Ionicons name="checkmark-circle" size={22} color={colors.successColor} />
        ) : (
          <MaterialCommunityIcons
            name="progress-clock"
            size={22}
            color="#EF4444"
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

// ── Main Screen ───────────────────────────────────
const SignupStepScreen = ({ navigation }) => {
  const isFocused = useIsFocused();
  const { colors, isDark } = useThemeStyles();
  const { userToken, userInfo, setUserInfo } = useContext(AuthContext);

  const [stages, setStages] = useState({
    stage2: false,
    stage3: false,
    stage4: false,
    stage5: false,
    stage6: false,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Refresh user from API ─────────────────────
  const refreshUserDetails = async () => {
    setIsRefreshing(true);
    try {
      const res = await client.get(
        '/api/userProfileMobile/' + userInfo.userData._id,
        { headers: { 'Authorization': 'Bearer ' + userToken } }
      );
      if (res.data.msg === '200') {
        AsyncStorage.setItem('userInfo', JSON.stringify(res.data));
        setUserInfo(res.data);
      }
    } catch (error) {
      console.log('Refresh user error:', error.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  // ── Check completion stages ───────────────────
  const checkStages = (info) => {
    const data = info?.userData || userInfo?.userData;
    setStages({
      stage2: data?.reg_stage2 === 'Yes',
      stage3: data?.reg_stage3 === 'Yes',
      stage4: data?.reg_stage4 === 'Yes',
      stage5: data?.reg_stage5 === 'Yes',
      stage6: data?.reg_stage6 === 'Yes',
    });
  };

  useEffect(() => {
    if (isFocused) {
      checkStages(userInfo);
      refreshUserDetails();
    }
  }, [isFocused]);

  // ── Completed count ───────────────────────────
  const completedCount = Object.values(stages).filter(Boolean).length;
  const totalSteps = STEPS.length - 1; // exclude always-done first step
  const progressPercent = ((completedCount + 1) / STEPS.length) * 100;
  const allDone = completedCount === totalSteps;

  // ── Check if step is done ─────────────────────
  const isStepDone = (key) => {
    if (key === 'stage0') return true;
    return stages[key] || false;
  };

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
          Account Setup
        </Text>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.bgLight }]}
          onPress={refreshUserDetails}
          activeOpacity={0.8}>
          {isRefreshing ? (
            <ActivityIndicator size={18} color={colors.primaryColor1} />
          ) : (
            <Ionicons name="refresh-outline" size={20} color={colors.primaryColor1} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        bounces={true}>

        {/* ── Hero Banner ────────────────────────── */}
        <LinearGradient
          colors={allDone
            ? ['#10B981', '#059669']
            : [colors.primaryColor1, colors.primaryColor1b]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}>
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />

          <View style={styles.heroTop}>
            <View style={[
              styles.heroIconBox,
              { backgroundColor: 'rgba(255,255,255,0.95)' },
            ]}>
              <Ionicons
                name={allDone ? 'checkmark-circle' : 'person-add-outline'}
                size={28}
                color={allDone ? '#10B981' : colors.primaryColor1}
              />
            </View>
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>
                {allDone ? 'Setup Complete! 🎉' : 'Complete Your Account'}
              </Text>
              <Text style={styles.heroDesc}>
                {allDone
                  ? 'Your account is fully verified and ready to use'
                  : 'Complete all steps to unlock full access to your account'}
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressWrapper}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>
                {completedCount + 1} of {STEPS.length} steps completed
              </Text>
              <Text style={styles.progressPercent}>
                {Math.round(progressPercent)}%
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[
                styles.progressBarFill,
                { width: `${progressPercent}%` },
              ]} />
            </View>
          </View>
        </LinearGradient>

        {/* ── All Done Banner ───────────────────── */}
        {allDone && (
          <View style={[
            styles.allDoneCard,
            {
              backgroundColor: colors.successColor + '12',
              borderColor: colors.successColor + '30',
            },
          ]}>
            <Ionicons name="checkmark-circle" size={22} color={colors.successColor} />
            <Text style={[styles.allDoneText, { color: colors.successColor }]}>
              All steps completed — your account is fully verified!
            </Text>
          </View>
        )}

        {/* ── Info Notice ───────────────────────── */}
        {!allDone && (
          <View style={[
            styles.infoCard,
            {
              backgroundColor: colors.bgLight,
              borderColor: colors.dividerColor,
            },
          ]}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={colors.primaryColor1}
            />
            <Text style={[styles.infoText, { color: colors.textSecColor }]}>
              Complete all steps to remove account restrictions and unlock all features. Takes less than 5 minutes.
            </Text>
          </View>
        )}

        {/* ── Steps List ────────────────────────── */}
        <View style={styles.stepsContainer}>
          {STEPS.map((step, index) => (
            <StepRow
              key={step.key}
              step={step}
              index={index}
              isDone={isStepDone(step.key)}
              colors={colors}
              isDark={isDark}
              onPress={() => step.route && navigation.navigate(step.route)}
            />
          ))}
        </View>

        {/* ── Support Notice ────────────────────── */}
        <View style={[
          styles.supportCard,
          {
            backgroundColor: colors.bgLight,
            borderColor: colors.dividerColor,
          },
        ]}>
          <Ionicons
            name="help-circle-outline"
            size={18}
            color={colors.primaryColor1}
          />
          <Text style={[styles.supportText, { color: colors.textSecColor }]}>
            Need help completing your profile? Contact our support team for assistance.
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
    marginBottom: spacing.md,
    overflow: 'hidden',
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
    left: -30,
    bottom: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  heroIconBox: {
    width: 54,
    height: 54,
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
    fontSize: typography.xl,
    color: '#fff',
    marginBottom: 4,
    lineHeight: 26,
  },
  heroDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },

  // Progress Bar
  progressWrapper: {
    gap: spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
  progressPercent: {
    fontFamily: '_bold',
    fontSize: typography.sm,
    color: '#fff',
    lineHeight: 20,
  },
  progressBarBg: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: '#fff',
  },

  // All Done Card
  allDoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    gap: spacing.sm,
    borderWidth: 1.5,
  },
  allDoneText: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    flex: 1,
    lineHeight: 22,
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
  },
  infoText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    flex: 1,
    lineHeight: 22,
  },

  // Steps
  stepsContainer: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.sm,
  },
  stepIconBox: {
    width: 46,
    height: 46,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepInfo: {
    flex: 1,
  },
  stepLabel: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: 2,
  },
  stepDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 18,
  },
  statusBox: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Support Card
  supportCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.xl,
    gap: spacing.sm,
    borderWidth: 1,
  },
  supportText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    flex: 1,
    lineHeight: 20,
  },
});

export default SignupStepScreen;