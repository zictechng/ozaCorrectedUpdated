
// ─────────────────────────────────────────────────
// tvProviders.js
// TV subscription providers and their bouquet
// plans. Prices shown to users — live prices
// pulled from Monnify/VTUGate API at runtime.
// Update apiCode values after provider registration.
// ─────────────────────────────────────────────────

export const TV_PROVIDERS = [
  {
    id: 'DSTV',
    label: 'DStv',
    color: '#0066CC',
    bgColor: '#DBEAFE',
    textColor: '#1E40AF',
    logo: '📺',
    apiCode: 'dstv',
    verifyParam: 'smartcard_number',
    verifyLabel: 'Smartcard Number',
    verifyPlaceholder: 'Enter DStv smartcard number',
    verifyLength: 10,
    verifyHint: 'Enter your 10-digit DStv smartcard number',
  },
  {
    id: 'GOTV',
    label: 'GOtv',
    color: '#E8A900',
    bgColor: '#FEF3C7',
    textColor: '#92400E',
    logo: '📡',
    apiCode: 'gotv',
    verifyParam: 'smartcard_number',
    verifyLabel: 'IUC Number',
    verifyPlaceholder: 'Enter GOtv IUC number',
    verifyLength: 10,
    verifyHint: 'Enter your 10-digit GOtv IUC number',
  },
  {
    id: 'STARTIMES',
    label: 'Startimes',
    color: '#E53E3E',
    bgColor: '#FEE2E2',
    textColor: '#991B1B',
    logo: '🌟',
    apiCode: 'startimes',
    verifyParam: 'smartcard_number',
    verifyLabel: 'Smartcard Number',
    verifyPlaceholder: 'Enter Startimes smartcard number',
    verifyLength: 11,
    verifyHint: 'Enter your 11-digit Startimes smartcard number',
  },
  {
    id: 'SHOWMAX',
    label: 'Showmax',
    color: '#7C3AED',
    bgColor: '#EDE9FE',
    textColor: '#5B21B6',
    logo: '🎬',
    apiCode: 'showmax',
    verifyParam: 'email',
    verifyLabel: 'Email Address',
    verifyPlaceholder: 'Enter Showmax email address',
    verifyLength: null,
    verifyHint: 'Enter the email address linked to your Showmax account',
  },
];

export const TV_BOUQUETS = {
  DSTV: [
    { id: 'dstv_padi', label: 'Padi', price: '2950', validity: '1 Month', apiCode: 'DStv Padi' },
    { id: 'dstv_yanga', label: 'Yanga', price: '4150', validity: '1 Month', apiCode: 'DStv Yanga' },
    { id: 'dstv_confam', label: 'Confam', price: '6200', validity: '1 Month', apiCode: 'DStv Confam' },
    { id: 'dstv_compact', label: 'Compact', price: '15700', validity: '1 Month', apiCode: 'DStv Compact' },
    { id: 'dstv_compact_plus', label: 'Compact Plus', price: '25000', validity: '1 Month', apiCode: 'DStv Compact Plus' },
    { id: 'dstv_premium', label: 'Premium', price: '37000', validity: '1 Month', apiCode: 'DStv Premium' },
    { id: 'dstv_premium_asia', label: 'Premium Asia', price: '42500', validity: '1 Month', apiCode: 'DStv Premium Asia' },
  ],
  GOTV: [
    { id: 'gotv_smallie', label: 'Smallie', price: '1575', validity: '1 Month', apiCode: 'GOtv Smallie' },
    { id: 'gotv_jinja', label: 'Jinja', price: '2715', validity: '1 Month', apiCode: 'GOtv Jinja' },
    { id: 'gotv_jolli', label: 'Jolli', price: '4115', validity: '1 Month', apiCode: 'GOtv Jolli' },
    { id: 'gotv_max', label: 'Max', price: '5500', validity: '1 Month', apiCode: 'GOtv Max' },
    { id: 'gotv_supa', label: 'Supa', price: '9600', validity: '1 Month', apiCode: 'GOtv Supa' },
    { id: 'gotv_supa_plus', label: 'Supa+', price: '15700', validity: '1 Month', apiCode: 'GOtv Supa+' },
  ],
  STARTIMES: [
    { id: 'startimes_nova', label: 'Nova', price: '1900', validity: '1 Month', apiCode: 'Startimes Nova' },
    { id: 'startimes_basic', label: 'Basic', price: '2690', validity: '1 Month', apiCode: 'Startimes Basic' },
    { id: 'startimes_smart', label: 'Smart', price: '3800', validity: '1 Month', apiCode: 'Startimes Smart' },
    { id: 'startimes_classic', label: 'Classic', price: '5100', validity: '1 Month', apiCode: 'Startimes Classic' },
    { id: 'startimes_super', label: 'Super', price: '7100', validity: '1 Month', apiCode: 'Startimes Super' },
  ],
  SHOWMAX: [
    { id: 'showmax_mobile', label: 'Mobile', price: '2900', validity: '1 Month', apiCode: 'Showmax Mobile' },
    { id: 'showmax_standard', label: 'Standard', price: '4900', validity: '1 Month', apiCode: 'Showmax Standard' },
    { id: 'showmax_standard_with_sport', label: 'Standard + Sport', price: '7900', validity: '1 Month', apiCode: 'Showmax Standard With Sport' },
  ],
};

export const getProviderById = (id) =>
  TV_PROVIDERS.find((p) => p.id === id) || null;

export const getBouquets = (providerId) =>
  TV_BOUQUETS[providerId] || [];

export const getBouquetById = (providerId, bouquetId) =>
  TV_BOUQUETS[providerId]?.find((b) => b.id === bouquetId) || null;