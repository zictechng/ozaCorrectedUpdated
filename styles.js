import { StyleSheet, Platform } from "react-native";

// ─────────────────────────────────────────────────
// CORE COLOR SYSTEM (static — for non-themed use)
// For themed screens use useTheme() hook instead
// ─────────────────────────────────────────────────
export const colors = {
  primaryColor1:    "#4C5FD5",
  primaryColor1a:   "#5464c4",
  primaryColor1b:   "#6C7FE8",
  primaryColor1c:   "#3D50C3",
  primaryColor1d:   "#2E40B0",
  primaryColor1F:   "#424878",
  secondaryColor:   "#6C7FE8",
  primaryColor2:    "#6C7FE8",
  accentGreen:      "#00C896",
  accentGold:       "#F0A500",
  accentGoldLight:  "#FFF3CD",
  bgColor:          "#F4F6FB",
  bgCard:           "#FFFFFF",
  bgLight:          "#EEF0FB",
  bgDark:           "#1A1D2E",
  shahColorLight:   "#F2F3F7",
  shahColorDark:    "#EEEFF3",
  textColor:        "#FFFFFF",
  textBlack:        "#1A1D2E",
  textSecColor:     "#6B7280",
  textSecColor2:    "#9CA3AF",
  textColor1:       "#374151",
  fadeText:         "#6B7280",
  text:             "#1A1D2E",
  successColor:     "#10B981",
  dangerColor:      "#EF4444",
  warningColor:     "#F59E0B",
  infoColor:        "#3B82F6",
  greenColor:       "#10B981",
  greenColorLight:  "#D1FAE5",
  lightGreenColor1: "#A7F3D0",
  lightGreenColor2: "#ECFDF5",
  redColor:         "#EF4444",
  lightRed:         "#FEE2E2",
  warningLight:     "#FEF3C7",
  blueColor:        "#3B82F6",
  blueColor2:       "#60A5FA",
  blackColor1:      "#1A1D2E",
  blackColor2:      "#374151",
  colorWhite:       "#FFFFFF",
  lightBg:          "#374151",
  lightblue:        "#EEF2FF",
  orange1:          "#F59E0B",
  orangeLight:      "#FCD34D",
  pink:             "#EC4899",
  red:              "#EF4444",
  yellowColor1:     "#F59E0B",
  statusBarColor:   "#4C5FD5",
  aishaColor:       "#6B7280",
  textColorBlack:   "#E5E7EB",
  textColorBlack2:  "#6B7280",
  iconColor:        "#4C5FD5",
  dividerColor:     "#E5E7EB",
  darkBg:           "#1A1D2E",
  bannerTextColor:  "#E0E7FF",
  pierMonthly:      "#F59E0B",
  pieYearly:        "#10B981",
  pieWeekly:        "#4C5FD5",
  paypalColor:      "#003087",
  payoneerColor:    "#FF4800",
  bitcoinColor:     "#F7931A",
  paystackColor:    "#00C3F7",
  serviceActive:    "#10B981",
  servicePaused:    "#F59E0B",
  serviceHidden:    "#EF4444",
  greenColorLight2: "#DCF2EA",
  darkHl:           "#374151",
  lightHl:          "#6B7280",
  primaryLightBlue: "#818CF8",
};

// ─────────────────────────────────────────────────
// TYPOGRAPHY SCALE
// ─────────────────────────────────────────────────
export const typography = {
  xs:    10,
  sm:    12,
  base:  14,
  md:    15,
  lg:    17,
  xl:    20,
  xxl:   24,
  xxxl:  28,
  huge:  32,
  giant: 40,
};

// ─────────────────────────────────────────────────
// SPACING SCALE
// ─────────────────────────────────────────────────
export const spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
  xxxl: 32,
};

// ─────────────────────────────────────────────────
// BORDER RADIUS SCALE
// ─────────────────────────────────────────────────
export const radius = {
  sm:     6,
  md:     10,
  lg:     14,
  xl:     20,
  xxl:    28,
  full:   999,
};

// ─────────────────────────────────────────────────
// SHADOW PRESETS
// ─────────────────────────────────────────────────
export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: "#4C5FD5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
};

// ─────────────────────────────────────────────────
// GLOBAL STYLES
// RULE: NO color values here — layout/spacing only
// Colors must be applied inline via useTheme()
// ─────────────────────────────────────────────────
export const gs = StyleSheet.create({

  // ── Navigation ─────────────────────────────
  homeHeaderRow: {
    backgroundColor: "transparent",
    marginTop: Platform.OS === "ios" ? 10 : 40,
    marginHorizontal: 10,
  },
  homeSideMenu: {
    borderRadius: radius.full,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Buttons ─────────────────────────────────
  primaryButton: {
    width: "100%",
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.lg,
    backgroundColor: "#4C5FD5",
    flexDirection: "row",
    ...shadows.md,
  },
  primaryButtonText: {
    fontFamily: "_semiBold",
    fontSize: typography.lg,
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  secondaryButton: {
    width: "100%",
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: "#4C5FD5",
    backgroundColor: "transparent",
    flexDirection: "row",
  },
  secondaryButtonText: {
    fontFamily: "_semiBold",
    fontSize: typography.lg,
    color: "#4C5FD5",
  },
  disabledButton: {
    width: "100%",
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.lg,
    backgroundColor: "#4C5FD5",
    opacity: 0.5,
    flexDirection: "row",
  },
  smallButton: {
    height: 36,
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.full,
    backgroundColor: "#4C5FD5",
  },
  smallButtonText: {
    fontFamily: "_semiBold",
    fontSize: typography.sm,
    color: "#FFFFFF",
  },
  btnDisabled: {
    width: "100%",
    height: 52,
    justifyContent: "center",
    marginTop: spacing.xl,
    alignItems: "center",
    borderRadius: radius.lg,
    backgroundColor: "#4C5FD5",
    opacity: 0.5,
  },

  // ── Cards ────────────────────────────────────
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  cardFlat: {
    borderRadius: radius.lg,
    padding: spacing.lg,
  },

  // ── Input Fields ─────────────────────────────
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: radius.md,
    borderColor: "#E5E7EB",
    paddingHorizontal: spacing.md,
    height: 52,
    marginBottom: spacing.lg,
  },
  inputContainerFocused: {
    borderColor: "#4C5FD5",
  },
  inputField: {
    flex: 1,
    fontFamily: "_regular",
    fontSize: typography.base,
    paddingVertical: 0,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  inputLabel: {
    fontFamily: "_semiBold",
    fontSize: typography.sm,
    marginBottom: spacing.xs,
    marginLeft: 2,
  },

  // ── Section Headers ──────────────────────────
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontFamily: "_semiBold",
    fontSize: typography.lg,
  },
  sectionLink: {
    fontFamily: "_semiBold",
    fontSize: typography.sm,
  },

  // ── Bill Service Card ────────────────────────
  billServiceCard: {
    width: "47%",
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    ...shadows.card,
    minHeight: 100,
  },
  billServiceIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  billServiceLabel: {
    fontFamily: "_semiBold",
    fontSize: typography.sm,
    textAlign: "center",
    marginTop: 4,
  },
  billServiceMaintenance: {
    fontFamily: "_regular",
    fontSize: typography.xs,
    textAlign: "center",
    marginTop: 2,
  },

  // ── Status Badges ─────────────────────────────
  badgeSuccess: {
    backgroundColor: "#D1FAE5",
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  badgeSuccessText: {
    fontFamily: "_semiBold",
    fontSize: typography.xs,
    color: "#10B981",
  },
  badgeDanger: {
    backgroundColor: "#FEE2E2",
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  badgeDangerText: {
    fontFamily: "_semiBold",
    fontSize: typography.xs,
    color: "#EF4444",
  },
  badgeWarning: {
    backgroundColor: "#FEF3C7",
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  badgeWarningText: {
    fontFamily: "_semiBold",
    fontSize: typography.xs,
    color: "#F59E0B",
  },

  // ── Transaction Item ──────────────────────────
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  transactionIconBox: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  transactionTitle: {
    fontFamily: "_semiBold",
    fontSize: typography.base,
  },
  transactionDate: {
    fontFamily: "_regular",
    fontSize: typography.xs,
    marginTop: 2,
  },
  transactionAmount: {
    fontFamily: "_bold",
    fontSize: typography.lg,
  },
  transactionAmountCredit: {
    fontFamily: "_bold",
    fontSize: typography.lg,
    color: "#10B981",
  },
  transactionAmountDebit: {
    fontFamily: "_bold",
    fontSize: typography.lg,
    color: "#EF4444",
  },

  // ── Bottom Sheet ──────────────────────────────
  bottomSheetButton: {
    flexDirection: "row",
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    height: 58,
    alignItems: "center",
    paddingHorizontal: spacing.md,
    ...shadows.sm,
  },
  bottomSheetButtonText: {
    fontFamily: "_semiBold",
    fontSize: typography.lg,
    marginLeft: spacing.md,
  },
  bottomSheetImageStyle: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    borderRadius: radius.full,
    alignSelf: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },

  // ── Balance Card ─────────────────────────────
  balanceCard: {
    borderRadius: radius.xl,
    backgroundColor: "#4C5FD5",
    padding: spacing.xl,
    marginTop: spacing.lg,
    ...shadows.lg,
    overflow: "hidden",
  },
  balanceLabel: {
    fontFamily: "_regular",
    fontSize: typography.sm,
    color: "#E0E7FF",
    marginBottom: 4,
  },
  balanceAmount: {
    fontFamily: "_bold",
    fontSize: typography.huge,
    color: "#FFFFFF",
    marginBottom: spacing.xs,
  },
  balanceSubLabel: {
    fontFamily: "_regular",
    fontSize: typography.xs,
    color: "#E0E7FF",
    opacity: 0.8,
  },

  // ── Empty State ───────────────────────────────
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xxxl,
  },
  emptyStateText: {
    fontFamily: "_semiBold",
    fontSize: typography.md,
    textAlign: "center",
    marginTop: spacing.md,
  },
  emptyStateSubText: {
    fontFamily: "_regular",
    fontSize: typography.sm,
    textAlign: "center",
    marginTop: spacing.xs,
    lineHeight: 20,
  },

  // ── Modal ─────────────────────────────────────
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalCard: {
    borderRadius: radius.xl,
    width: "88%",
    padding: spacing.xl,
    ...shadows.lg,
  },
  modalTitle: {
    fontFamily: "_bold",
    fontSize: typography.xl,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  modalDesc: {
    fontFamily: "_regular",
    fontSize: typography.base,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.xl,
  },

  // ── Utility ──────────────────────────────────
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    borderBottomWidth: 1,
    marginVertical: spacing.lg,
  },
  absoluteFull: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  loaderTextStyle: {
    fontSize: typography.base,
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "_regular",
    marginLeft: spacing.xs,
  },

  // ── Auth Screens ──────────────────────────────
  loginPageDescTitle: {
    fontFamily: "_regular",
    fontSize: typography.lg,
  },
  loginPageForgetPass: {
    fontSize: typography.base,
    fontFamily: "_regular",
  },
  loginPageDesc: {
    fontFamily: "_semiBold",
    fontSize: typography.lg,
    color: "#4C5FD5",
  },
  signupPageDescTitle: {
    fontFamily: "_regular",
    fontSize: typography.lg,
  },
  signupPageDesc: {
    fontFamily: "_semiBold",
    fontSize: typography.lg,
    color: "#00C896",
  },
  signupPageLogin: {
    fontFamily: "_semiBold",
    fontSize: typography.lg,
    color: "#6C7FE8",
  },

  // ── Land Page ────────────────────────────────
  logoText: {
    fontSize: typography.giant,
    fontFamily: "_bold",
    fontWeight: "600",
  },
  landPageTitle: {
    fontSize: typography.xxxl,
    fontFamily: "_semiBold",
    letterSpacing: 0.41,
  },
  landPageDesc: {
    fontSize: typography.base,
    fontFamily: "_regular",
    letterSpacing: -0.08,
    lineHeight: 22,
  },

  // ── Profile ───────────────────────────────────
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: radius.full,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4C5FD5",
  },

  // ── Share ─────────────────────────────────────
  shareView: {
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    overflow: "hidden",
    ...shadows.sm,
    marginBottom: spacing.xl,
  },
  shareRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  shareText: {
    fontFamily: "_regular",
    fontSize: typography.base,
    marginHorizontal: spacing.xs,
    flexShrink: 1,
    flexWrap: "wrap",
    lineHeight: 20,
  },
  actionButton: {
    alignContent: "center",
    alignItems: "center",
    height: 34,
    borderRadius: radius.full,
    backgroundColor: "#4C5FD5",
    marginBottom: spacing.xs,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
  },
  buttonSellText: {
    color: "#FFFFFF",
    fontFamily: "_semiBold",
    fontSize: typography.md,
  },
  actionButtonShare: {
    height: 34,
    borderRadius: radius.full,
    backgroundColor: "#4C5FD5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
  },

  // ── Carousel ─────────────────────────────────
  carouselSlide: {
    borderRadius: radius.xl,
    overflow: "hidden",
    backgroundColor: "#4C5FD5",
    height: 140,
    justifyContent: "center",
    padding: spacing.xl,
  },
  carouselTitle: {
    fontFamily: "_bold",
    fontSize: typography.lg,
    color: "#FFFFFF",
    marginBottom: spacing.xs,
  },
  carouselDesc: {
    fontFamily: "_regular",
    fontSize: typography.sm,
    color: "#E0E7FF",
    lineHeight: 18,
  },

  // ── Header Title ─────────────────────────────
  headerTitle: {
    fontFamily: "_semiBold",
    fontSize: typography.xl,
  },
  headerTitleLight: {
    fontFamily: "_semiBold",
    fontSize: typography.xl,
    color: "#FFFFFF",
  },
});