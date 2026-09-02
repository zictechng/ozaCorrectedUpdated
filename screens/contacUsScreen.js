import React, { useState, useContext, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, TextInput, ActivityIndicator, Platform,
  KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ALERT_TYPE, Toast, Dialog } from 'react-native-alert-notification';

import { spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';
import { AuthContext } from '../contextAPI/authContext';
import { noticeData } from '../components/errorNotice';
import { applicationDetails } from '../components/controls';
import client from '../contextAPI/client';

// ── Contact Channel Card ──────────────────────────
const ChannelCard = ({ icon, iconBg, iconColor, title, subtitle, onPress, colors }) => (
  <TouchableOpacity
    style={[styles.channelCard, {
      backgroundColor: colors.bgCard,
      borderColor: colors.dividerColor,
    }]}
    onPress={onPress}
    activeOpacity={0.85}>
    <View style={[styles.channelIconBox, { backgroundColor: iconBg }]}>
      <Ionicons name={icon} size={22} color={iconColor} />
    </View>
    <View style={styles.channelInfo}>
      <Text style={[styles.channelTitle, { color: colors.textBlack }]}>{title}</Text>
      <Text style={[styles.channelSubtitle, { color: colors.textSecColor }]}>{subtitle}</Text>
    </View>
    <View style={[styles.channelArrow, { backgroundColor: colors.bgLight }]}>
      <Ionicons name="chevron-forward" size={16} color={colors.primaryColor1} />
    </View>
  </TouchableOpacity>
);

// ── FAQ Item ──────────────────────────────────────
const FAQItem = ({ question, answer, colors }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <TouchableOpacity
      style={[styles.faqItem, { borderBottomColor: colors.dividerColor }]}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.8}>
      <View style={styles.faqHeader}>
        <Text style={[styles.faqQuestion, { color: colors.textBlack }]}>{question}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.primaryColor1}
        />
      </View>
      {expanded && (
        <Text style={[styles.faqAnswer, { color: colors.textSecColor }]}>{answer}</Text>
      )}
    </TouchableOpacity>
  );
};

const FAQS = [
  {
    question: 'How long does a withdrawal take?',
    answer: 'Withdrawals are processed within 24 hours on business days. Ensure your bank details are correct before submitting.',
  },
  {
    question: 'How do I sell PayPal or Payoneer?',
    answer: 'Go to Transactions → Sell Assets, select the asset, enter the amount and our wallet address. Send the exact amount and click "I\'ve Sent Payment" to confirm.',
  },
  {
    question: 'Why is my account restricted?',
    answer: 'Accounts are restricted when KYC verification is incomplete. Go to Profile → KYC Documents to complete your verification.',
  },
  {
    question: 'How do I earn coins and rewards?',
    answer: 'You earn coins on every bill payment and referral. Coins can be redeemed as bonus credits. Check your profile for your current coin balance and tier.',
  },
  {
    question: 'What payment methods are accepted for funding?',
    answer: 'You can fund your wallet via Paystack (instant, card payment) or Manual Bank Transfer (1-24 hours processing).',
  },
];

// ── Main Contact Screen ───────────────────────────
const ContactUsScreen = ({ navigation }) => {
  const { colors, isDark } = useThemeStyles();
  const { userToken, userInfo } = useContext(AuthContext);

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [subjectFocused, setSubjectFocused] = useState(false);
  const [messageFocused, setMessageFocused] = useState(false);
  const [appInfo, setAppInfo] = useState(null);

  useEffect(() => {
    applicationDetails().then((res) => {
      if (res?.infoData) setAppInfo(res.infoData);
    });
  }, []);

  // ── Send message ──────────────────────────────
  const handleSend = async () => {
    Keyboard.dismiss();
    if (!subject.trim()) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Subject Required', textBody: 'Please enter a subject for your message.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Message Too Short', textBody: 'Please enter a detailed message (at least 10 characters).', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return;
    }
    setIsSending(true);
    try {
      const res = await client.post(
        '/api/contactUs_mobile',
        {
          subject: subject.trim(),
          message: message.trim(),
          userId: userInfo?.userData?._id,
          userEmail: userInfo?.userData?.email,
          userName: userInfo?.userData?.display_name,
        },
        { headers: { 'Authorization': 'Bearer ' + userToken } }
      );
      if (res.data.msg === '200') {
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Message Sent!',
          textBody: 'Your message has been sent to our support team. We will respond within 24 hours.',
          button: 'Done',
          titleStyle: noticeData[0].errorTitleStyle,
          textBodyStyle: noticeData[0].errorMessageStyle,
          onHide: () => {
            setSubject('');
            setMessage('');
          },
        });
      } else {
        Toast.show({ type: ALERT_TYPE.DANGER, title: 'Failed', textBody: 'Could not send your message. Please try again.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      }
    } catch (error) {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Network Error', textBody: 'Could not connect. Please check your internet connection.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
    } finally {
      setIsSending(false);
    }
  };

  const openEmail = () => {
    const email = appInfo?.support_email || 'support@ozaapp.com';
    Linking.openURL(`mailto:${email}?subject=Support Request`);
  };

  const openWhatsApp = () => {
    const phone = appInfo?.support_whatsapp || '';
    if (phone) Linking.openURL(`https://wa.me/${phone}`);
  };

  const openTelegram = () => {
    const telegram = appInfo?.support_telegram || '';
    if (telegram) Linking.openURL(`https://t.me/${telegram}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgColor }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bgColor}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled">

            {/* ── Header ──────────────────────── */}
            <View style={[styles.header, { backgroundColor: colors.bgColor }]}>
              <TouchableOpacity
                style={[styles.backBtn, { backgroundColor: colors.bgLight }]}
                onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={22} color={colors.textBlack} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: colors.textBlack }]}>
                Contact Us
              </Text>
              <View style={styles.backBtn} />
            </View>

            {/* ── Hero Banner ──────────────────── */}
            <LinearGradient
              colors={[colors.primaryColor1, colors.primaryColor1b]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroBanner}>
              <View style={styles.heroCircle1} />
              <View style={styles.heroCircle2} />
              <View style={[styles.heroIconBox, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
                <Ionicons name="headset-outline" size={28} color={colors.primaryColor1} />
              </View>
              <View style={styles.heroText}>
                <Text style={styles.heroTitle}>We're Here to Help</Text>
                <Text style={styles.heroDesc}>
                  Our support team is available 24/7. Reach out via any channel below or send us a message.
                </Text>
              </View>
            </LinearGradient>

            {/* ── Response Time Card ────────────── */}
            <View style={[styles.responseCard, {
              backgroundColor: colors.bgCard,
              borderColor: colors.dividerColor,
            }]}>
              <View style={styles.responseRow}>
                <View style={styles.responseItem}>
                  <Text style={[styles.responseValue, { color: colors.primaryColor1 }]}>
                    {'< 2hrs'}
                  </Text>
                  <Text style={[styles.responseLabel, { color: colors.textSecColor }]}>
                    Email Response
                  </Text>
                </View>
                <View style={[styles.responseDivider, { backgroundColor: colors.dividerColor }]} />
                <View style={styles.responseItem}>
                  <Text style={[styles.responseValue, { color: colors.successColor }]}>
                    Instant
                  </Text>
                  <Text style={[styles.responseLabel, { color: colors.textSecColor }]}>
                    WhatsApp Chat
                  </Text>
                </View>
                <View style={[styles.responseDivider, { backgroundColor: colors.dividerColor }]} />
                <View style={styles.responseItem}>
                  <Text style={[styles.responseValue, { color: '#8B5CF6' }]}>
                    24/7
                  </Text>
                  <Text style={[styles.responseLabel, { color: colors.textSecColor }]}>
                    Available
                  </Text>
                </View>
              </View>
            </View>

            {/* ── Contact Channels ──────────────── */}
            <Text style={[styles.sectionTitle, { color: colors.textBlack }]}>
              Contact Channels
            </Text>

            <ChannelCard
              icon="mail-outline"
              iconBg="#EEF2FF"
              iconColor={colors.primaryColor1}
              title="Email Support"
              subtitle={appInfo?.support_email || 'support@ozaapp.com'}
              onPress={openEmail}
              colors={colors}
            />
            <ChannelCard
              icon="logo-whatsapp"
              iconBg="#D1FAE5"
              iconColor="#25D366"
              title="WhatsApp Support"
              subtitle="Chat with us directly on WhatsApp"
              onPress={openWhatsApp}
              colors={colors}
            />
            <ChannelCard
              icon="send-outline"
              iconBg="#EDE9FE"
              iconColor="#8B5CF6"
              title="Telegram Support"
              subtitle="Message us on Telegram"
              onPress={openTelegram}
              colors={colors}
            />

            {/* ── Message Form ──────────────────── */}
            <Text style={[styles.sectionTitle, { color: colors.textBlack }]}>
              Send a Message
            </Text>

            <View style={[styles.formCard, { backgroundColor: colors.bgCard }]}>
              <Text style={[styles.formDesc, { color: colors.textSecColor }]}>
                Fill out the form below and our support team will get back to you within 24 hours.
              </Text>

              {/* Subject */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>
                  Subject
                </Text>
                <View style={[
                  styles.inputContainer,
                  {
                    borderColor: subjectFocused ? colors.primaryColor1 : colors.dividerColor,
                    backgroundColor: subjectFocused ? colors.primaryColor1 + '10' : colors.bgLight,
                  },
                ]}>
                  <Ionicons
                    name="text-outline"
                    size={20}
                    color={subjectFocused ? colors.primaryColor1 : colors.textSecColor}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.inputField, { color: colors.textBlack }]}
                    placeholder="What is your message about?"
                    placeholderTextColor={colors.textSecColor2}
                    value={subject}
                    onChangeText={setSubject}
                    maxLength={100}
                    onFocus={() => setSubjectFocused(true)}
                    onBlur={() => setSubjectFocused(false)}
                  />
                </View>
              </View>

              {/* Message */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>
                  Message
                </Text>
                <View style={[
                  styles.messageContainer,
                  {
                    borderColor: messageFocused ? colors.primaryColor1 : colors.dividerColor,
                    backgroundColor: messageFocused ? colors.primaryColor1 + '10' : colors.bgLight,
                  },
                ]}>
                  <TextInput
                    style={[styles.messageField, { color: colors.textBlack }]}
                    placeholder="Describe your issue in detail. Include any relevant transaction IDs or screenshots..."
                    placeholderTextColor={colors.textSecColor2}
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    maxLength={1000}
                    onFocus={() => setMessageFocused(true)}
                    onBlur={() => setMessageFocused(false)}
                  />
                </View>
                <Text style={[styles.charCount, { color: colors.textSecColor }]}>
                  {message.length}/1000
                </Text>
              </View>

              {/* Send Button */}
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  { backgroundColor: colors.primaryColor1 },
                  (!subject || !message || isSending) && { opacity: 0.6 },
                ]}
                onPress={handleSend}
                disabled={!subject || !message || isSending}
                activeOpacity={0.85}>
                {isSending ? (
                  <ActivityIndicator color="#fff" size={22} />
                ) : (
                  <>
                    <Ionicons name="send-outline" size={20} color="#fff" />
                    <Text style={styles.sendBtnText}>Send Message</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* ── FAQs ──────────────────────────── */}
            <Text style={[styles.sectionTitle, { color: colors.textBlack }]}>
              Frequently Asked Questions
            </Text>

            <View style={[styles.faqCard, { backgroundColor: colors.bgCard }]}>
              {FAQS.map((faq, i) => (
                <FAQItem
                  key={i}
                  question={faq.question}
                  answer={faq.answer}
                  colors={colors}
                />
              ))}
            </View>

            <View style={{ height: spacing.xxxl }} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxxl },

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
  heroBanner: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.lg,
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroIconBox: {
    width: 54,
    height: 54,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  heroText: { flex: 1 },
  heroTitle: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    color: '#fff',
    marginBottom: 4,
  },
  heroDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
  },
  responseCard: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    ...shadows.card,
  },
  responseRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  responseItem: {
    flex: 1,
    alignItems: 'center',
  },
  responseValue: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    lineHeight: 26,
    marginBottom: 2,
  },
  responseLabel: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    textAlign: 'center',
  },
  responseDivider: {
    width: 1,
    height: 40,
    marginHorizontal: spacing.sm,
  },
  sectionTitle: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  channelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    gap: spacing.md,
    ...shadows.card,
  },
  channelIconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelInfo: { flex: 1 },
  channelTitle: {
    fontFamily: '_bold',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: 2,
  },
  channelSubtitle: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
  },
  channelArrow: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formCard: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  formDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  inputGroup: { marginBottom: spacing.lg },
  inputLabel: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 56,
  },
  inputIcon: { marginRight: spacing.sm },
  inputField: {
    flex: 1,
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    paddingVertical: 0,
  },
  messageContainer: {
    borderWidth: 1.5,
    borderRadius: radius.lg,
    padding: spacing.md,
    minHeight: 140,
  },
  messageField: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    textAlignVertical: 'top',
    minHeight: 120,
  },
  charCount: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  sendBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 56,
    borderRadius: radius.lg,
    gap: spacing.sm,
    marginTop: spacing.sm,
    ...shadows.md,
  },
  sendBtnText: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    color: '#fff',
  },
  faqCard: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  faqItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  faqQuestion: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    lineHeight: 22,
    flex: 1,
  },
  faqAnswer: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
});

export default ContactUsScreen;