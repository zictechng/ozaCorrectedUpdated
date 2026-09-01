
// ─────────────────────────────────────────────────
// examTypes.js
// Exam card types supported by the platform.
// Prices shown are buy prices from Bigisub.
// You set your own selling price via admin panel.
// Update apiCode values after Bigisub registration.
// ─────────────────────────────────────────────────

export const EXAM_TYPES = [
  {
    id: 'waec',
    label: 'WAEC',
    fullName: 'West African Examinations Council',
    description: 'WAEC result checker scratch card — check your WASSCE results online',
    color: '#10B981',
    bgColor: '#D1FAE5',
    textColor: '#065F46',
    logo: '🎓',
    icon: 'school-outline',
    buyPrice: '700',
    apiCode: 'waec',
    deliveryMethod: 'PIN delivered to email & SMS instantly',
    website: 'https://waecdirect.org',
  },
  {
    id: 'neco',
    label: 'NECO',
    fullName: 'National Examinations Council',
    description: 'NECO result checker scratch card — check your SSCE results online',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    textColor: '#1E40AF',
    logo: '📚',
    icon: 'book-outline',
    buyPrice: '650',
    apiCode: 'neco',
    deliveryMethod: 'PIN delivered to email & SMS instantly',
    website: 'https://result.neco.gov.ng',
  },
  {
    id: 'jamb',
    label: 'JAMB',
    fullName: 'Joint Admissions and Matriculation Board',
    description: 'JAMB e-PIN for UTME registration and result checking',
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
    textColor: '#5B21B6',
    logo: '🏫',
    icon: 'library-outline',
    buyPrice: '500',
    apiCode: 'jamb',
    deliveryMethod: 'e-PIN delivered to email & SMS instantly',
    website: 'https://www.jamb.gov.ng',
  },
  {
    id: 'nabteb',
    label: 'NABTEB',
    fullName: 'National Business and Technical Examinations Board',
    description: 'NABTEB result checker scratch card — check NBC/NBE results',
    color: '#F97316',
    bgColor: '#FFEDD5',
    textColor: '#9A3412',
    logo: '🔧',
    icon: 'construct-outline',
    buyPrice: '900',
    apiCode: 'nabteb',
    deliveryMethod: 'PIN delivered to email & SMS instantly',
    website: 'https://www.nabteb.gov.ng',
  },
];

export const getExamById = (id) =>
  EXAM_TYPES.find((e) => e.id === id) || null;

export const getExamApiCode = (id) =>
  EXAM_TYPES.find((e) => e.id === id)?.apiCode || id;