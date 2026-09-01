
// ─────────────────────────────────────────────────
// useThemeStyles.js
// Central dynamic styles hook.
// Returns ALL color-dependent styles based on
// current theme (light/dark).
//
// Usage in ANY screen or component:
//   const { S, colors, isDark } = useThemeStyles();
//   <View style={S.card}>
//   <Text style={S.bodyText}>
//   <View style={[S.card, S.row]}>
//
// This eliminates ALL hardcoded colors from every
// screen. One change here = updates everywhere.
// ─────────────────────────────────────────────────
import { StyleSheet } from 'react-native';
import useTheme from './useTheme';
import { spacing, radius, typography, shadows } from '../styles';

const useThemeStyles = () => {
  const { colors, isDark, toggleTheme } = useTheme();

  const S = StyleSheet.create({

    // ── Containers ──────────────────────────────
    screen: {
      flex: 1,
      backgroundColor: colors.bgColor,
    },
    scrollContent: {
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xxxl,
    },
    card: {
      backgroundColor: colors.bgCard,
      borderRadius: radius.xl,
      padding: spacing.xl,
      marginHorizontal: spacing.xl,
      marginBottom: spacing.lg,
      ...shadows.card,
    },
    cardSm: {
      backgroundColor: colors.bgCard,
      borderRadius: radius.lg,
      padding: spacing.lg,
      marginBottom: spacing.md,
      ...shadows.sm,
    },
    cardFlat: {
      backgroundColor: colors.bgCard,
      borderRadius: radius.xl,
      padding: spacing.xl,
      marginHorizontal: spacing.xl,
      marginBottom: spacing.lg,
    },
    infoBox: {
      backgroundColor: colors.bgLight,
      borderRadius: radius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.dividerColor,
    },
    section: {
      marginHorizontal: spacing.xl,
      marginBottom: spacing.lg,
    },

    // ── Header ──────────────────────────────────
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      backgroundColor: colors.bgColor,
    },
    headerTitle: {
      fontFamily: '_bold',
      fontSize: typography.xl,
      color: colors.textBlack,
    },
    headerBtn: {
      width: 40,
      height: 40,
      borderRadius: radius.full,
      backgroundColor: colors.bgLight,
      justifyContent: 'center',
      alignItems: 'center',
    },

    // ── Typography ───────────────────────────────
    h1: {
      fontFamily: '_bold',
      fontSize: typography.xxxl,
      color: colors.textBlack,
      lineHeight: 38,
    },
    h2: {
      fontFamily: '_bold',
      fontSize: typography.xxl,
      color: colors.textBlack,
      lineHeight: 32,
    },
    h3: {
      fontFamily: '_bold',
      fontSize: typography.xl,
      color: colors.textBlack,
      lineHeight: 28,
    },
    h4: {
      fontFamily: '_bold',
      fontSize: typography.lg,
      color: colors.textBlack,
      lineHeight: 24,
    },
    bodyLg: {
      fontFamily: '_regular',
      fontSize: typography.lg,
      color: colors.textBlack,
      lineHeight: 26,
    },
    body: {
      fontFamily: '_regular',
      fontSize: typography.base,
      color: colors.textBlack,
      lineHeight: 22,
    },
    bodyMuted: {
      fontFamily: '_regular',
      fontSize: typography.base,
      color: colors.textSecColor,
      lineHeight: 22,
    },
    caption: {
      fontFamily: '_regular',
      fontSize: typography.sm,
      color: colors.textSecColor,
      lineHeight: 20,
    },
    label: {
      fontFamily: '_semiBold',
      fontSize: typography.base,
      color: colors.textSecColor,
      lineHeight: 22,
      marginBottom: spacing.xs,
    },
    sectionTitle: {
      fontFamily: '_bold',
      fontSize: typography.lg,
      color: colors.textBlack,
      marginBottom: spacing.md,
    },
    sectionLink: {
      fontFamily: '_semiBold',
      fontSize: typography.sm,
      color: colors.primaryColor1,
    },
    primaryText: {
      fontFamily: '_semiBold',
      fontSize: typography.base,
      color: colors.primaryColor1,
    },
    successText: {
      fontFamily: '_semiBold',
      fontSize: typography.base,
      color: colors.successColor,
    },
    dangerText: {
      fontFamily: '_semiBold',
      fontSize: typography.base,
      color: colors.dangerColor,
    },
    warningText: {
      fontFamily: '_semiBold',
      fontSize: typography.base,
      color: colors.warningColor,
    },

    // ── Input Fields ─────────────────────────────
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderRadius: radius.lg,
      borderColor: colors.dividerColor,
      backgroundColor: colors.bgCard,
      paddingHorizontal: spacing.md,
      height: 52,
    },
    inputContainerFocused: {
      borderColor: colors.primaryColor1,
      backgroundColor: colors.primaryColor1 + '10',
    },
    inputField: {
      flex: 1,
      fontFamily: '_regular',
      fontSize: typography.base,
      color: colors.textBlack,
      paddingVertical: 0,
    },

    // ── Buttons ──────────────────────────────────
    primaryBtn: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      height: 54,
      borderRadius: radius.lg,
      backgroundColor: colors.primaryColor1,
      gap: spacing.sm,
      ...shadows.md,
    },
    primaryBtnText: {
      fontFamily: '_bold',
      fontSize: typography.lg,
      color: '#fff',
    },
    secondaryBtn: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      height: 54,
      borderRadius: radius.lg,
      borderWidth: 1.5,
      borderColor: colors.primaryColor1,
      backgroundColor: 'transparent',
      gap: spacing.sm,
    },
    secondaryBtnText: {
      fontFamily: '_bold',
      fontSize: typography.base,
      color: colors.primaryColor1,
    },
    dangerBtn: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      height: 52,
      borderRadius: radius.lg,
      borderWidth: 1.5,
      borderColor: colors.dangerColor,
      backgroundColor: colors.lightRed,
      gap: spacing.sm,
    },
    dangerBtnText: {
      fontFamily: '_bold',
      fontSize: typography.lg,
      color: colors.dangerColor,
    },
    ghostBtn: {
      alignItems: 'center',
      padding: spacing.md,
    },
    ghostBtnText: {
      fontFamily: '_semiBold',
      fontSize: typography.base,
      color: colors.textSecColor,
      lineHeight: 22,
    },

    // ── List Items ───────────────────────────────
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.bgCard,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
      ...shadows.sm,
      gap: spacing.md,
    },
    listItemTitle: {
      fontFamily: '_semiBold',
      fontSize: typography.base,
      color: colors.textBlack,
      lineHeight: 22,
    },
    listItemSubtitle: {
      fontFamily: '_regular',
      fontSize: typography.sm,
      color: colors.textSecColor,
      lineHeight: 20,
      marginTop: 2,
    },
    listIconBox: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      backgroundColor: colors.bgLight,
      justifyContent: 'center',
      alignItems: 'center',
    },

    // ── Menu Items ───────────────────────────────
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.bgLight,
      gap: spacing.md,
    },
    menuLabel: {
      fontFamily: '_semiBold',
      fontSize: typography.base,
      color: colors.textBlack,
      lineHeight: 22,
    },
    menuSubtitle: {
      fontFamily: '_regular',
      fontSize: typography.base,
      color: colors.textSecColor,
      lineHeight: 22,
      marginTop: 2,
    },
    menuIconBox: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      backgroundColor: colors.bgLight,
      justifyContent: 'center',
      alignItems: 'center',
    },

    // ── Divider ──────────────────────────────────
    divider: {
      height: 1,
      backgroundColor: colors.dividerColor,
      marginVertical: spacing.md,
    },

    // ── Info Rows ────────────────────────────────
    infoRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.bgLight,
      gap: spacing.md,
    },
    infoRowLabel: {
      fontFamily: '_regular',
      fontSize: typography.base,
      color: colors.textSecColor,
      lineHeight: 22,
    },
    infoRowValue: {
      fontFamily: '_semiBold',
      fontSize: typography.base,
      color: colors.textBlack,
      lineHeight: 22,
    },
    infoIconBox: {
      width: 32,
      height: 32,
      borderRadius: radius.md,
      backgroundColor: colors.bgLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 2,
    },

    // ── Transaction Items ─────────────────────────
    transactionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.bgCard,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
      ...shadows.sm,
      gap: spacing.md,
    },
    transactionTitle: {
      fontFamily: '_semiBold',
      fontSize: typography.base,
      color: colors.textBlack,
      lineHeight: 22,
    },
    transactionDate: {
      fontFamily: '_regular',
      fontSize: typography.sm,
      color: colors.textSecColor,
      lineHeight: 20,
      marginTop: 2,
    },
    transactionIconBox: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      backgroundColor: colors.bgLight,
      justifyContent: 'center',
      alignItems: 'center',
    },

    // ── Summary Rows ──────────────────────────────
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.md,
      gap: spacing.md,
    },
    summaryLabel: {
      fontFamily: '_regular',
      fontSize: typography.base,
      color: colors.textSecColor,
      lineHeight: 22,
      flex: 1,
    },
    summaryValue: {
      fontFamily: '_semiBold',
      fontSize: typography.base,
      color: colors.textBlack,
      lineHeight: 22,
    },
    summaryTotalLabel: {
      fontFamily: '_bold',
      fontSize: typography.lg,
      color: colors.textBlack,
    },
    summaryTotalValue: {
      fontFamily: '_bold',
      fontSize: typography.xl,
      color: colors.primaryColor1,
    },
    summaryDivider: {
      height: 1,
      backgroundColor: colors.dividerColor,
      marginVertical: spacing.md,
    },

    // ── Section Cards ─────────────────────────────
    sectionCard: {
      backgroundColor: colors.bgCard,
      borderRadius: radius.xl,
      padding: spacing.lg,
      marginHorizontal: spacing.xl,
      marginBottom: spacing.lg,
      ...shadows.card,
    },
    sectionCardTitle: {
      fontFamily: '_bold',
      fontSize: typography.lg,
      color: colors.textBlack,
      marginBottom: spacing.md,
      paddingBottom: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.dividerColor,
    },

    // ── Bill Service Cards ────────────────────────
    billServiceCard: {
      width: '47%',
      backgroundColor: colors.bgCard,
      borderRadius: radius.lg,
      padding: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
      ...shadows.card,
      minHeight: 100,
    },
    billServiceLabel: {
      fontFamily: '_semiBold',
      fontSize: typography.sm,
      color: colors.textBlack,
      textAlign: 'center',
      marginTop: 4,
    },
    billServiceMaintenance: {
      fontFamily: '_regular',
      fontSize: typography.xs,
      color: colors.warningColor,
      textAlign: 'center',
      marginTop: 2,
    },

    // ── Status Badges ─────────────────────────────
    badgeSuccess: {
      backgroundColor: colors.greenColorLight,
      borderRadius: radius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    badgeSuccessText: {
      fontFamily: '_semiBold',
      fontSize: typography.sm,
      color: colors.successColor,
      lineHeight: 20,
    },
    badgeDanger: {
      backgroundColor: colors.lightRed,
      borderRadius: radius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      alignSelf: 'flex-start',
    },
    badgeDangerText: {
      fontFamily: '_semiBold',
      fontSize: typography.sm,
      color: colors.dangerColor,
      lineHeight: 20,
    },
    badgeWarning: {
      backgroundColor: colors.warningLight,
      borderRadius: radius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      alignSelf: 'flex-start',
    },
    badgeWarningText: {
      fontFamily: '_semiBold',
      fontSize: typography.sm,
      color: colors.warningColor,
      lineHeight: 20,
    },

    // ── Notices ───────────────────────────────────
    infoNotice: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.bgLight,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.lg,
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: colors.dividerColor,
    },
    infoNoticeText: {
      fontFamily: '_regular',
      fontSize: typography.base,
      color: colors.textSecColor,
      flex: 1,
      lineHeight: 22,
    },
    warningNotice: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.warningLight,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.lg,
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: '#FDE68A',
    },
    warningNoticeText: {
      fontFamily: '_regular',
      fontSize: typography.base,
      color: colors.textSecColor,
      flex: 1,
      lineHeight: 22,
    },
    successNotice: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.greenColorLight,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.lg,
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: '#A7F3D0',
    },
    successNoticeText: {
      fontFamily: '_regular',
      fontSize: typography.base,
      color: colors.successColor,
      flex: 1,
      lineHeight: 22,
    },
    dangerNotice: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.lightRed,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.lg,
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: '#FECACA',
    },
    dangerNoticeText: {
      fontFamily: '_regular',
      fontSize: typography.base,
      color: colors.dangerColor,
      flex: 1,
      lineHeight: 22,
    },

    // ── Empty States ──────────────────────────────
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
      backgroundColor: colors.bgLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    emptyTitle: {
      fontFamily: '_bold',
      fontSize: typography.xl,
      color: colors.textBlack,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    emptyDesc: {
      fontFamily: '_regular',
      fontSize: typography.base,
      color: colors.textSecColor,
      textAlign: 'center',
      lineHeight: 22,
    },

    // ── Stats ─────────────────────────────────────
    statCard: {
      flex: 1,
      backgroundColor: colors.bgCard,
      borderRadius: radius.lg,
      padding: spacing.md,
      alignItems: 'center',
      ...shadows.sm,
    },
    statValue: {
      fontFamily: '_bold',
      fontSize: typography.lg,
      color: colors.primaryColor1,
      lineHeight: 24,
    },
    statLabel: {
      fontFamily: '_regular',
      fontSize: typography.sm,
      color: colors.textSecColor,
      textAlign: 'center',
      marginTop: 2,
      lineHeight: 20,
    },

    // ── Tips Card ─────────────────────────────────
    tipsCard: {
      backgroundColor: colors.bgLight,
      borderRadius: radius.xl,
      padding: spacing.xl,
      marginHorizontal: spacing.xl,
      borderWidth: 1,
      borderColor: colors.dividerColor,
      marginBottom: spacing.lg,
    },
    tipsTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
      gap: spacing.xs,
    },
    tipsTitle: {
      fontFamily: '_bold',
      fontSize: typography.base,
      color: colors.primaryColor1,
      lineHeight: 22,
    },
    tipText: {
      fontFamily: '_regular',
      fontSize: typography.base,
      color: colors.textSecColor,
      marginBottom: spacing.sm,
      lineHeight: 22,
    },
    tipHighlight: {
      fontFamily: '_bold',
      color: colors.primaryColor1,
    },

    // ── Form Card ─────────────────────────────────
    formCard: {
      backgroundColor: colors.bgCard,
      borderRadius: radius.xl,
      padding: spacing.xl,
      marginHorizontal: spacing.xl,
      marginBottom: spacing.lg,
      ...shadows.card,
    },

    // ── Footer Loader ─────────────────────────────
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
      color: colors.textSecColor,
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
      backgroundColor: colors.dividerColor,
    },
    footerEndText: {
      fontFamily: '_regular',
      fontSize: typography.sm,
      color: colors.textSecColor,
      lineHeight: 20,
    },

    // ── Balance Card ──────────────────────────────
    balanceCard: {
      borderRadius: radius.xl,
      padding: spacing.xl,
      marginHorizontal: spacing.xl,
      marginBottom: spacing.lg,
      overflow: 'hidden',
      ...shadows.lg,
    },
    balanceLabel: {
      fontFamily: '_regular',
      fontSize: typography.sm,
      color: 'rgba(255,255,255,0.8)',
      marginBottom: 4,
    },
    balanceAmount: {
      fontFamily: '_bold',
      fontSize: typography.huge,
      color: '#fff',
      lineHeight: 42,
    },

    // ── Utility ───────────────────────────────────
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rowBetween: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    center: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    flex1: {
      flex: 1,
    },
    mhXl: {
      marginHorizontal: spacing.xl,
    },
    mbLg: {
      marginBottom: spacing.lg,
    },
    mtLg: {
      marginTop: spacing.lg,
    },
    pvMd: {
      paddingVertical: spacing.md,
    },
    phXl: {
      paddingHorizontal: spacing.xl,
    },
    spacer: {
      height: spacing.xxxl,
    },
  });

  return { S, colors, isDark, toggleTheme };
};

export default useThemeStyles;