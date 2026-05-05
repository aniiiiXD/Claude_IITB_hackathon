/**
 * Static database of NPRD 2021 approved Centers of Excellence, NIDAN Kendras,
 * and key specialist centers for rare diseases in India.
 *
 * Sources:
 * - Ministry of Health & Family Welfare — NPRD 2021 CoE list
 *   https://www.rarediseases.mohfw.gov.in/Hospital_Treating_Rare_Diseases
 * - Department of Biotechnology — UMMID / NIDAN Kendras
 *   https://dbtindia.gov.in/scientific-decision-units/computational-biology/ummid-initiative
 * - FRIGE Institute of Human Genetics, Ahmedabad — primary Gaucher center in western India
 */

export type CenterType = 'coe' | 'nidan' | 'specialist';

export interface TreatmentCenter {
  id: string;
  name: string;
  shortName: string;
  type: CenterType;
  city: string;
  state: string;
  address: string;
  lat: number;
  lon: number;
  phone?: string;
  diseases: string[];   // OMIM IDs this center specializes in
  capabilities: string[];
  nprdApproved: boolean;
}

export const CENTERS: TreatmentCenter[] = [
  // ── NPRD 2021 Approved CoEs ──────────────────────────────────────────────
  {
    id: 'aiims-delhi',
    name: 'All India Institute of Medical Sciences',
    shortName: 'AIIMS New Delhi',
    type: 'coe',
    city: 'New Delhi',
    state: 'Delhi',
    address: 'Sri Aurobindo Marg, Ansari Nagar East, New Delhi 110029',
    lat: 28.5672,
    lon: 77.2100,
    phone: '+91-11-26588500',
    diseases: ['230800', '253550', '310200', '277900', '301000', '257220', '607616', '232300'],
    capabilities: ['Enzyme assay', 'Gene panel', 'ERT', 'Genetic counselling', 'NPRD funding'],
    nprdApproved: true,
  },
  {
    id: 'mamc-delhi',
    name: 'Maulana Azad Medical College',
    shortName: 'MAMC New Delhi',
    type: 'coe',
    city: 'New Delhi',
    state: 'Delhi',
    address: 'Bahadur Shah Zafar Marg, New Delhi 110002',
    lat: 28.6367,
    lon: 77.2168,
    phone: '+91-11-23234501',
    diseases: ['230800', '277900', '310200', '253550'],
    capabilities: ['Rare disease OPD', 'Genetic testing', 'NPRD funding'],
    nprdApproved: true,
  },
  {
    id: 'sgpgi-lucknow',
    name: 'Sanjay Gandhi Post Graduate Institute of Medical Sciences',
    shortName: 'SGPGI Lucknow',
    type: 'coe',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    address: 'New PMSSY Road, Raibareli Road, Lucknow, UP 226014',
    lat: 26.8381,
    lon: 80.9770,
    phone: '+91-522-2668700',
    diseases: ['230800', '277900', '253550', '310200'],
    capabilities: ['Enzyme assay', 'Liver specialist', 'Neurology', 'NPRD funding'],
    nprdApproved: true,
  },
  {
    id: 'pgimer-chandigarh',
    name: 'Post Graduate Institute of Medical Education and Research',
    shortName: 'PGIMER Chandigarh',
    type: 'coe',
    city: 'Chandigarh',
    state: 'Punjab',
    address: 'Sector 12, Chandigarh 160012',
    lat: 30.7643,
    lon: 76.7764,
    phone: '+91-172-2746018',
    diseases: ['230800', '310200', '253550', '277900', '301000'],
    capabilities: ['Enzyme assay', 'Genetic counselling', 'Paediatric neurology', 'NPRD funding'],
    nprdApproved: true,
  },
  {
    id: 'cdfd-hyderabad',
    name: "Centre for DNA Fingerprinting & Diagnostics / Nizam's Institute of Medical Sciences",
    shortName: 'CDFD + NIMS Hyderabad',
    type: 'coe',
    city: 'Hyderabad',
    state: 'Telangana',
    address: 'Tuljaguda Complex, Nampally, Hyderabad 500001',
    lat: 17.4051,
    lon: 78.4720,
    phone: '+91-40-24749374',
    diseases: ['230800', '277900', '253550', '310200', '301000'],
    capabilities: ['DNA fingerprinting', 'Gene sequencing', 'Rare metabolic disorders', 'NPRD funding'],
    nprdApproved: true,
  },
  {
    id: 'kem-mumbai',
    name: 'King Edward Memorial Hospital & Seth GS Medical College',
    shortName: 'KEM Hospital Mumbai',
    type: 'coe',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: 'Acharya Donde Marg, Parel, Mumbai 400012',
    lat: 18.9897,
    lon: 72.8396,
    phone: '+91-22-24136051',
    diseases: ['230800', '253550', '310200', '277900', '301000', '257220', '607616', '232300'],
    capabilities: ['Enzyme assay', 'ERT infusion', 'Gene panel', 'Genetic counselling', 'NPRD funding'],
    nprdApproved: true,
  },
  {
    id: 'ipgmer-kolkata',
    name: 'Institute of Post-Graduate Medical Education and Research',
    shortName: 'IPGMER Kolkata',
    type: 'coe',
    city: 'Kolkata',
    state: 'West Bengal',
    address: '244 AJC Bose Road, Kolkata 700020',
    lat: 22.5376,
    lon: 88.3562,
    phone: '+91-33-22043869',
    diseases: ['230800', '277900', '310200', '253550'],
    capabilities: ['Rare metabolic disorders', 'Neuromuscular clinic', 'NPRD funding'],
    nprdApproved: true,
  },
  {
    id: 'chg-bengaluru',
    name: 'Centre for Human Genetics / Indira Gandhi Hospital',
    shortName: 'CHG Bengaluru',
    type: 'coe',
    city: 'Bengaluru',
    state: 'Karnataka',
    address: 'Horamavu Main Road, Bengaluru 560043',
    lat: 12.9949,
    lon: 77.6550,
    phone: '+91-80-25431978',
    diseases: ['230800', '253550', '310200', '277900'],
    capabilities: ['Genetic diagnosis', 'Enzyme assay', 'Prenatal diagnosis', 'NPRD funding'],
    nprdApproved: true,
  },
  {
    id: 'ich-chennai',
    name: 'Institute of Child Health and Hospital for Children',
    shortName: 'ICH & HC Chennai',
    type: 'coe',
    city: 'Chennai',
    state: 'Tamil Nadu',
    address: 'Halls Road, Egmore, Chennai 600008',
    lat: 13.0784,
    lon: 80.2611,
    phone: '+91-44-28194561',
    diseases: ['230800', '253550', '301000', '232300'],
    capabilities: ['Paediatric rare diseases', 'Enzyme assay', 'Immunology', 'NPRD funding'],
    nprdApproved: true,
  },
  {
    id: 'aiims-jodhpur',
    name: 'All India Institute of Medical Sciences Jodhpur',
    shortName: 'AIIMS Jodhpur',
    type: 'coe',
    city: 'Jodhpur',
    state: 'Rajasthan',
    address: 'Basni Industrial Area Phase 2, Jodhpur, Rajasthan 342005',
    lat: 26.2515,
    lon: 73.0088,
    phone: '+91-291-2740741',
    diseases: ['230800', '253550', '277900', '310200'],
    capabilities: ['Rare disease clinic', 'Genetic testing', 'NPRD funding'],
    nprdApproved: true,
  },
  {
    id: 'sat-thiruvananthapuram',
    name: 'Sree Avittam Thirunal Hospital, Government Medical College',
    shortName: 'SAT Hospital Trivandrum',
    type: 'coe',
    city: 'Thiruvananthapuram',
    state: 'Kerala',
    address: 'Medical College Road, Ulloor, Thiruvananthapuram 695011',
    lat: 8.4875,
    lon: 76.9485,
    phone: '+91-471-2528735',
    diseases: ['230800', '253550', '277900', '301000'],
    capabilities: ['Paediatric neurology', 'Metabolic diseases', 'NPRD funding'],
    nprdApproved: true,
  },
  {
    id: 'aiims-bhopal',
    name: 'All India Institute of Medical Sciences Bhopal',
    shortName: 'AIIMS Bhopal',
    type: 'coe',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    address: 'Saket Nagar, Bhopal, MP 462020',
    lat: 23.2039,
    lon: 77.4384,
    phone: '+91-755-2672335',
    diseases: ['230800', '253550', '310200', '277900'],
    capabilities: ['Rare disease clinic', 'Genetic counselling', 'NPRD funding'],
    nprdApproved: true,
  },

  // ── Key specialist centers (not on official CoE list but widely used) ────
  {
    id: 'cmc-vellore',
    name: 'Christian Medical College',
    shortName: 'CMC Vellore',
    type: 'specialist',
    city: 'Vellore',
    state: 'Tamil Nadu',
    address: 'Ida Scudder Road, Vellore 632004',
    lat: 12.9342,
    lon: 79.1375,
    phone: '+91-416-2281000',
    diseases: ['230800', '253550', '310200', '277900', '301000', '232300'],
    capabilities: ['Enzyme assay', 'Genetic counselling', 'ERT', 'Neuromuscular clinic'],
    nprdApproved: false,
  },
  {
    id: 'nimhans-bengaluru',
    name: 'National Institute of Mental Health and Neurosciences',
    shortName: 'NIMHANS Bengaluru',
    type: 'specialist',
    city: 'Bengaluru',
    state: 'Karnataka',
    address: 'Hosur Road, Bengaluru 560029',
    lat: 12.9400,
    lon: 77.5960,
    phone: '+91-80-46110007',
    diseases: ['253550', '310200', '277900'],
    capabilities: ['Neuromuscular clinic', 'Neurogenetic diagnosis', 'EMG/NCS'],
    nprdApproved: false,
  },
  {
    id: 'frige-ahmedabad',
    name: 'FRIGE Institute of Human Genetics',
    shortName: 'FRIGE Ahmedabad',
    type: 'specialist',
    city: 'Ahmedabad',
    state: 'Gujarat',
    address: 'FRIGE House, Jodhpur Gam Road, Satellite, Ahmedabad, Gujarat 380015',
    lat: 23.0265,
    lon: 72.5101,
    phone: '+91-79-26921414',
    diseases: ['230800', '257220', '607616'],  // Gaucher + Niemann-Pick specialists
    capabilities: ['GBA enzyme assay', 'Gaucher molecular typing', 'N370S testing', 'ERT coordination'],
    nprdApproved: false,
  },

  // ── NIDAN Kendras (DBT/UMMID — genetic screening & counselling) ──────────
  {
    id: 'nrs-kolkata',
    name: 'NRS Medical College NIDAN Kendra',
    shortName: 'NRS Kolkata (NIDAN)',
    type: 'nidan',
    city: 'Kolkata',
    state: 'West Bengal',
    address: '138 AJC Bose Road, Kolkata 700014',
    lat: 22.5737,
    lon: 88.3693,
    diseases: ['253550', '310200', '230800'],
    capabilities: ['Genetic screening', 'Carrier testing', 'Prenatal diagnosis'],
    nprdApproved: false,
  },
  {
    id: 'army-rr-delhi',
    name: 'Army Hospital Research & Referral NIDAN Kendra',
    shortName: 'Army Hospital R&R Delhi (NIDAN)',
    type: 'nidan',
    city: 'New Delhi',
    state: 'Delhi',
    address: 'Dhaula Kuan, Delhi Cantonment, New Delhi 110010',
    lat: 28.5992,
    lon: 77.1756,
    diseases: ['253550', '310200', '277900'],
    capabilities: ['Genetic screening', 'Rare metabolic OPD'],
    nprdApproved: false,
  },
  {
    id: 'lhmc-delhi',
    name: 'Lady Hardinge Medical College NIDAN Kendra',
    shortName: 'LHMC New Delhi (NIDAN)',
    type: 'nidan',
    city: 'New Delhi',
    state: 'Delhi',
    address: 'Shahid Bhagat Singh Marg, New Delhi 110001',
    lat: 28.6363,
    lon: 77.2109,
    diseases: ['230800', '253550', '301000'],
    capabilities: ['Genetic screening', 'Paediatric rare diseases'],
    nprdApproved: false,
  },
  {
    id: 'nims-hyderabad',
    name: "Nizam's Institute of Medical Sciences NIDAN Kendra",
    shortName: 'NIMS Hyderabad (NIDAN)',
    type: 'nidan',
    city: 'Hyderabad',
    state: 'Telangana',
    address: 'Punjagutta, Hyderabad 500082',
    lat: 17.4397,
    lon: 78.4528,
    diseases: ['230800', '253550', '310200', '277900'],
    capabilities: ['Genetic screening', 'Enzyme assay', 'Carrier testing'],
    nprdApproved: false,
  },
];

/** Returns centers that have this disease in their specialties, sorted by relevance (specialist > coe > nidan). */
export function getCentersForDisease(omimId: string): TreatmentCenter[] {
  const matches = CENTERS.filter(c => c.diseases.includes(omimId));
  return matches.sort((a, b) => {
    const order: Record<CenterType, number> = { specialist: 0, coe: 1, nidan: 2 };
    return order[a.type] - order[b.type];
  });
}

/** Returns all NPRD-approved CoEs. */
export function getNprdCenters(): TreatmentCenter[] {
  return CENTERS.filter(c => c.nprdApproved);
}
