
// ─────────────────────────────────────────────────
// discoList.js
// Master list of all Nigerian electricity
// distribution companies (DISCOs).
// Used across electricity screen, meter
// verification, admin panel and reports.
// Update here when new DISCOs are added.
// ─────────────────────────────────────────────────

export const DISCOS = [
  {
    id: 'IKEDC',
    label: 'Ikeja Electric',
    shortName: 'Ikeja',
    state: 'Lagos',
    coverage: 'Lagos (Ikeja axis)',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    apiCode: 'ikeja-electric',
  },
  {
    id: 'EKEDC',
    label: 'Eko Electric',
    shortName: 'Eko',
    state: 'Lagos',
    coverage: 'Lagos (Eko axis)',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    apiCode: 'eko-electric',
  },
  {
    id: 'AEDC',
    label: 'Abuja Electric',
    shortName: 'Abuja',
    state: 'FCT',
    coverage: 'FCT / Niger / Nassarawa / Kogi',
    color: '#10B981',
    bgColor: '#D1FAE5',
    apiCode: 'abuja-electric',
  },
  {
    id: 'IBEDC',
    label: 'Ibadan Electric',
    shortName: 'Ibadan',
    state: 'Oyo',
    coverage: 'Oyo / Ogun / Osun / Kwara',
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
    apiCode: 'ibadan-electric',
  },
  {
    id: 'PHED',
    label: 'Port Harcourt Electric',
    shortName: 'PHED',
    state: 'Rivers',
    coverage: 'Rivers / Bayelsa / Cross River / Akwa Ibom',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    apiCode: 'portharcourt-electric',
  },
  {
    id: 'EEDC',
    label: 'Enugu Electric',
    shortName: 'Enugu',
    state: 'Enugu',
    coverage: 'Enugu / Anambra / Imo / Abia / Ebonyi',
    color: '#EC4899',
    bgColor: '#FCE7F3',
    apiCode: 'enugu-electric',
  },
  {
    id: 'BEDC',
    label: 'Benin Electric',
    shortName: 'Benin',
    state: 'Edo',
    coverage: 'Edo / Delta / Ondo / Ekiti',
    color: '#14B8A6',
    bgColor: '#CCFBF1',
    apiCode: 'benin-electric',
  },
  {
    id: 'KAEDCO',
    label: 'Kaduna Electric',
    shortName: 'Kaduna',
    state: 'Kaduna',
    coverage: 'Kaduna / Kebbi / Sokoto / Zamfara',
    color: '#F97316',
    bgColor: '#FFEDD5',
    apiCode: 'kaduna-electric',
  },
  {
    id: 'KEDCO',
    label: 'Kano Electric',
    shortName: 'Kano',
    state: 'Kano',
    coverage: 'Kano / Jigawa / Katsina',
    color: '#6366F1',
    bgColor: '#E0E7FF',
    apiCode: 'kano-electric',
  },
  {
    id: 'JED',
    label: 'Jos Electric',
    shortName: 'Jos',
    state: 'Plateau',
    coverage: 'Plateau / Benue / Taraba / Gombe',
    color: '#0EA5E9',
    bgColor: '#E0F2FE',
    apiCode: 'jos-electric',
  },
  {
    id: 'YEDC',
    label: 'Yola Electric',
    shortName: 'Yola',
    state: 'Adamawa',
    coverage: 'Adamawa / Borno / Yobe',
    color: '#84CC16',
    bgColor: '#ECFCCB',
    apiCode: 'yola-electric',
  },
];

// Helper — get DISCO by ID
export const getDiscoById = (id) =>
  DISCOS.find((d) => d.id === id) || null;

// Helper — get API code for billing provider
export const getDiscoApiCode = (id) =>
  DISCOS.find((d) => d.id === id)?.apiCode || id.toLowerCase();