
// ─────────────────────────────────────────────────
// networkList.js
// Master list of Nigerian mobile networks.
// Used across airtime, data, and any screen
// that needs network selection.
// ─────────────────────────────────────────────────

export const NETWORKS = [
    {
    id: 'MTN',
    label: 'MTN',
    color: '#b79d0fbe',
    bgColor: '#FFF9C4',
    textColor: '#7A6000',
    borderColor: '#F0C000',
    bigisub_code: 'MTN',    // Bigisub uses uppercase
    cdh_code: 'mtn',        // CheapDataHub uses lowercase
    cdh_provider_id: 1,     // CheapDataHub numeric ID for airtime
  },
    {
    id: 'Airtel',
    label: 'Airtel',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    textColor: '#991B1B',
    borderColor: '#EF4444',
    bigisub_code: 'Airtel',
    cdh_code: 'airtel',
    cdh_provider_id: 2,
  },
    {
    id: 'Glo',
    label: 'Glo',
    color: '#10B981',
    bgColor: '#D1FAE5',
    textColor: '#065F46',
    borderColor: '#10B981',
    bigisub_code: 'Glo',
    cdh_code: 'glo',
    cdh_provider_id: 3,
  },
    {
    id: '9mobile',
    label: '9mobile',
    color: '#059669',
    bgColor: '#ECFDF5',
    textColor: '#064E3B',
    borderColor: '#059669',
    bigisub_code: '9mobile',
    cdh_code: '9mobile',
    cdh_provider_id: 4,
  },
];

export const getNetworkById = (id) =>
  NETWORKS.find((n) => n.id === id) || null;