import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// ── Core Screens ──────────────────────────────────
import HomeStack from './homeStack';
import ProfileScreen from '../screens/profileScreen';
import SettingScreen from '../screens/settingScreen';
import HistoryScreen from '../screens/historyScreen';
import TransactionsDetails from '../screens/transactionDetails';
import InboxMessageScreen from '../screens/inboxMessageScreen';
import ReferralScreen from '../screens/referralScreen';

// ── Wallet & Funds ────────────────────────────────
import WalletScreen from '../screens/walletScreen';
import FundAccountScreen from '../screens/fundAccountScreen';
import FundAccountNextScreen from '../screens/fundAcctNextScreen';
import FundAccountPaystackScreen from '../screens/fundAcctPaystack';
import WithdrawFund from '../screens/withdraw';
import SendFundScreen from '../screens/sendFundScreen';
import SuccessfulScreen from '../screens/successfulScreen';

// ── Buy & Sell ────────────────────────────────────
import SellingScreen from '../screens/sellingScreen';
import BuyScreen from '../screens/buyScreen';
import CheckOutManualPage from '../screens/checkOutManualPage';
import PayPaypalScreen from '../screens/payPaypal';
import PayoneerCheckOutScreen from '../screens/payoneerCheckout';
import PayBitcoinCheckoutScreen from '../screens/payBitcoinCheckout';
import PayStackScreen from '../screens/payStackScreen';
import PayPalWebviewScreen from '../screens/payPalWebviewScreen';

// ── Bills Payment ─────────────────────────────────
import BillsHomeScreen from '../screens/billsHomeScreen';
import AirtimeScreen from '../screens/airtimeScreen';
import ElectricityScreen from '../screens/electricityScreen';
import MobileDataScreen from '../screens/mobileDataScreen';
import TVSubscriptionScreen from '../screens/tvSubscriptionScreen';
import ExamCardsScreen from '../screens/examCardsScreen';
import BillsConfirmScreen from '../screens/billsConfirmScreen';
import BillsSuccessScreen from '../screens/billsSuccessScreen';
import BillsFailedScreen from '../screens/billsFailedScreen';

// ── KYC & Documents ───────────────────────────────
import BankDetailsScreen from '../screens/bankDetailsScreen';
import CompleteSignupScreen from '../screens/completeSignupScreen';
import UploadProfileImageScreen from '../screens/uploadProfileImageScreen';
import UploadDocumentScreen from '../screens/uploadDocumentScreen';
import DocumentScreen from '../screens/documentScreen';
import UploadProofAddress from '../screens/uploadAddress';
import UploadPaymentProof from '../screens/uploadPaymentProof';
import SignupStepScreen from '../screens/signupStepScreen';

// ── Camera & Verification ─────────────────────────
import OpenCamera from '../screens/openCamera';
import Verify2faAccountScreen from '../screens/verify2faAccountScreen';
import Verify2faCamera from '../screens/verify2faCamera';

// ── Info & Support ────────────────────────────────
import ContactUsScreen from '../screens/contacUsScreen';
import AboutUs from '../screens/aboutUs';
import ResetPasswordScreen from '../screens/resetPasswordScreen';
import PrivacyPolicyScreen from '../screens/privacyPolicyScreen';
import TermsConditionsScreen from '../screens/term_conditionScreen';

const Stack = createNativeStackNavigator();

// ─────────────────────────────────────────────────
// MAIN ROOT STACK
// All authenticated screens live here.
// Grouped by category for easy maintenance.
// Animation: slide_from_right (default)
//            slide_from_bottom (modals)
//            fade (success/failure screens)
// ─────────────────────────────────────────────────
const MainRootStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>

      {/* ── HOME ─────────────────────────────── */}
      <Stack.Screen
        name="Home"
        component={HomeStack}
        options={{ animation: 'fade' }}
      />

      {/* ── PROFILE & SETTINGS ───────────────── */}
      <Stack.Screen
        name="profile"
        component={ProfileScreen}
        options={{
          animation: Platform.OS === 'ios'
            ? 'slide_from_bottom'
            : 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="settingScreen"
        component={SettingScreen}
        options={{ animation: 'slide_from_right' }}
      />

      {/* ── TRANSACTIONS & HISTORY ───────────── */}
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="TranDetails"
        component={TransactionsDetails}
        options={{ animation: 'slide_from_right' }}
      />

      {/* ── INBOX ────────────────────────────── */}
      <Stack.Screen
        name="messages"
        component={InboxMessageScreen}
        options={{
          animation: Platform.OS === 'ios'
            ? 'slide_from_bottom'
            : 'slide_from_right',
        }}
      />

      {/* ── REFERRALS ────────────────────────── */}
      <Stack.Screen
        name="referrals"
        component={ReferralScreen}
        options={{
          animation: Platform.OS === 'ios'
            ? 'slide_from_bottom'
            : 'slide_from_right',
        }}
      />

      {/* ── WALLET & FUNDS ───────────────────── */}
      <Stack.Screen
        name="Wallet"
        component={WalletScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Add-fund"
        component={FundAccountScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="FundAccount"
        component={FundAccountScreen}
        options={{
          animation: Platform.OS === 'ios'
            ? 'slide_from_bottom'
            : 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="FundingNextPage"
        component={FundAccountNextScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="FundAcctPaystackCheckout"
        component={FundAccountPaystackScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="withdraw-fund"
        component={WithdrawFund}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="SendFund"
        component={SendFundScreen}
        options={{
          animation: Platform.OS === 'ios'
            ? 'slide_from_bottom'
            : 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="Successful"
        component={SuccessfulScreen}
        options={{ animation: 'slide_from_bottom' }}
      />

      {/* ── BUY & SELL ───────────────────────── */}
      <Stack.Screen
        name="SalesPage"
        component={SellingScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="BuyPage"
        component={BuyScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="CheckManual"
        component={CheckOutManualPage}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="PaypalPayment"
        component={PayPaypalScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="PayoneerCheckout"
        component={PayoneerCheckOutScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="BitcoinCheckout"
        component={PayBitcoinCheckoutScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Paystack_checkout"
        component={PayStackScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="paypalWebview"
        component={PayPalWebviewScreen}
        options={{ animation: 'slide_from_right' }}
      />

      {/* ── BILLS PAYMENT ────────────────────── */}
      <Stack.Screen
        name="BillsHome"
        component={BillsHomeScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Airtime"
        component={AirtimeScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Electricity"
        component={ElectricityScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="MobileData"
        component={MobileDataScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="TVSubscription"
        component={TVSubscriptionScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="ExamCards"
        component={ExamCardsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="BillsConfirm"
        component={BillsConfirmScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="BillsSuccess"
        component={BillsSuccessScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name="BillsFailed"
        component={BillsFailedScreen}
        options={{ animation: 'fade' }}
      />

      {/* ── KYC & DOCUMENTS ──────────────────── */}
      <Stack.Screen
        name="BankDetails"
        component={BankDetailsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="CompleteSignup"
        component={CompleteSignupScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="UploadProfile_image"
        component={UploadProfileImageScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="UploadDocument"
        component={UploadDocumentScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="DocumentView"
        component={DocumentScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="UploadProofAddress"
        component={UploadProofAddress}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="UploadPaymentProof"
        component={UploadPaymentProof}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="SignupSteps"
        component={SignupStepScreen}
        options={{ animation: 'slide_from_right' }}
      />

      {/* ── CAMERA & VERIFICATION ────────────── */}
      <Stack.Screen
        name="UserCamera"
        component={OpenCamera}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="Verify2faces"
        component={Verify2faAccountScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="OpeCamera"
        component={Verify2faCamera}
        options={{ animation: 'slide_from_right' }}
      />

      {/* ── INFO & SUPPORT ───────────────────── */}
      <Stack.Screen
        name="contacts"
        component={ContactUsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="About"
        component={AboutUs}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{
          animation: Platform.OS === 'ios'
            ? 'slide_from_bottom'
            : 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="Privacy_Policy"
        component={PrivacyPolicyScreen}
        options={{ animation: 'slide_from_right' }}
      />
      {/* Alias for Privacy_Policy — used in landPageScreen */}
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Terms_Conditions"
        component={TermsConditionsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      {/* Alias for Terms_Conditions — used in landPageScreen */}
      <Stack.Screen
        name="TermCondition"
        component={TermsConditionsScreen}
        options={{ animation: 'slide_from_right' }}
      />

    </Stack.Navigator>
  );
};

export default MainRootStack;