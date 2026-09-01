
import { useState, useCallback } from 'react';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import client from '../contextAPI/client';
import { noticeData } from '../components/errorNotice';

// ─────────────────────────────────────────────────
// useBillService — Reusable hook for all bill
// payment screens. Handles:
//   1. Fetching service status on screen load
//   2. Pre-flight status check before payment
//   3. Consistent error/maintenance messaging
// ─────────────────────────────────────────────────
const useBillService = (serviceKey) => {
  const [serviceStatus, setServiceStatus] = useState('active');
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // ── Fetch status on screen load ───────────────
  const fetchServiceStatus = useCallback(async () => {
    try {
      const res = await client.get('/api/bills_services_status');
      if (res.data.msg === '200') {
        const status = res.data.services?.[serviceKey] || 'active';
        setServiceStatus(status);
        return status;
      }
    } catch (error) {
      console.log(`Service status fetch error [${serviceKey}]:`, error.message);
    }
    return 'active'; // default to active if fetch fails
  }, [serviceKey]);

  // ── Pre-flight check before payment ──────────
  // Called when user taps Proceed/Pay button
  // Returns true if service is active, false if not
  const preFlightCheck = useCallback(async () => {
    setIsCheckingStatus(true);
    try {
      const res = await client.get('/api/bills_services_status');
      if (res.data.msg === '200') {
        const currentStatus = res.data.services?.[serviceKey];
        setServiceStatus(currentStatus);

        if (currentStatus === 'paused') {
          Toast.show({
            type: ALERT_TYPE.WARNING,
            title: 'Service Under Maintenance',
            textBody: 'This service is temporarily unavailable. Please try again later.',
            titleStyle: noticeData[0].errorTitleStyle,
            textBodyStyle: noticeData[0].errorMessageStyle,
          });
          return false;
        }

        if (currentStatus === 'hidden') {
          Toast.show({
            type: ALERT_TYPE.DANGER,
            title: 'Service Unavailable',
            textBody: 'This service is currently not available.',
            titleStyle: noticeData[0].errorTitleStyle,
            textBodyStyle: noticeData[0].errorMessageStyle,
          });
          return false;
        }

        return true; // active — proceed with payment
      }
    } catch (error) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Connection Error',
        textBody: 'Could not verify service status. Check your connection and try again.',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
      return false;
    } finally {
      setIsCheckingStatus(false);
    }
    return false;
  }, [serviceKey]);

  return {
    serviceStatus,
    isCheckingStatus,
    fetchServiceStatus,
    preFlightCheck,
  };
};

export default useBillService;