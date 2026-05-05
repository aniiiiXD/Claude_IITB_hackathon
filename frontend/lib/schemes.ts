/**
 * Comprehensive funding/support landscape for rare-disease patients in India.
 * Sources: MoHFW NPRD 2021 portal, NHA, ICMR, state health portals, manufacturer
 * patient-assistance program pages, ORDI/LSDSS public listings.
 *
 * Use {@link findApplicableSchemes} to filter by disease + state + flags.
 */

export type SchemeCategory =
  | 'central'         // central government schemes (NPRD, PM-JAY, ICMR)
  | 'state'           // state government schemes
  | 'pharma'          // pharmaceutical compassionate-use / patient-assistance programs
  | 'advocacy'        // patient advocacy org direct-aid funds
  | 'tax'             // tax benefits / deductions
  | 'crowdfunding';   // legitimate crowdfunding platforms

export interface Scheme {
  id: string;
  category: SchemeCategory;
  name: string;
  shortName: string;
  ministry?: string;
  amount: string;
  /** One-line summary for cards. */
  description: string;
  /** Application portal / contact URL. */
  url: string;
  /** UI accent color (rust/sage/ink/ochre). */
  color: string;

  /**
   * Eligibility filters. Empty array means "any" for that field.
   */
  eligibility: {
    /** OMIM IDs eligible. Empty = any rare disease. */
    omimIds?: string[];
    /** Indian states. Empty = nationwide. */
    states?: string[];
    /** "BPL", "Below ₹X family income", etc. — informational only. */
    incomeNote?: string;
    /** NPRD group classification (1, 2, 3a, 3b). */
    nprdGroup?: ('1' | '2' | '3a' | '3b')[];
    /** Age constraints. */
    maxAge?: number;
    /** Other notes. */
    other?: string;
  };

  /** Typical processing time (informational). */
  processingTime?: string;
  /** Approval rate when known (helps set expectations). */
  approvalRate?: string;
}


// ─────────────────────────────────────────────────────────────────────────────
// CENTRAL GOVERNMENT
// ─────────────────────────────────────────────────────────────────────────────

const CENTRAL: Scheme[] = [
  {
    id: 'nprd-2021',
    category: 'central',
    name: 'National Policy for Rare Diseases 2021',
    shortName: 'NPRD 2021',
    ministry: 'Ministry of Health & Family Welfare',
    amount: 'Up to ₹50 lakh / patient (lifetime)',
    description: 'Financial assistance for treatment at approved Centres of Excellence. Covers ERT, gene therapy, and specialty drugs across all NPRD groups.',
    url: 'https://rarediseases.mohfw.gov.in',
    color: '#B8842A',
    eligibility: {
      other: 'Confirmed rare-disease diagnosis from a designated Centre of Excellence. Application must be filed by the CoE specialist, not the patient or referring GP.',
    },
    processingTime: '4–24 weeks (no real-time tracking)',
    approvalRate: '~30%',
  },
  {
    id: 'pm-jay',
    category: 'central',
    name: 'Pradhan Mantri Jan Arogya Yojana (Ayushman Bharat)',
    shortName: 'PM-JAY',
    ministry: 'National Health Authority',
    amount: '₹5 lakh / family / year (hospitalization)',
    description: 'Cashless hospitalization at empanelled hospitals. Covers inpatient ERT infusions and surgical interventions for BPL and low-income families.',
    url: 'https://pmjay.gov.in',
    color: '#1E2D4A',
    eligibility: {
      incomeNote: 'BPL card OR SECC 2011 deprivation criteria OR ₹5L family income (varies by state)',
      other: 'Hospitalization-only. Does not cover outpatient ERT or genetic testing. Must be enrolled BEFORE hospitalization.',
    },
    processingTime: 'Real-time at empanelled hospital',
  },
  {
    id: 'icmr-rd-registry',
    category: 'central',
    name: 'ICMR Rare Disease Registry',
    shortName: 'ICMR Registry',
    ministry: 'ICMR / Department of Biotechnology',
    amount: 'Treatment + research access (varies by trial)',
    description: 'Voluntary enrolment for research-linked care and trial access. Provides genetic counselling and family-screening support. Patient consent + IRB protected.',
    url: 'https://icmr.gov.in',
    color: '#8B6C9C',
    eligibility: {
      other: 'Voluntary patient consent. Must be enrolled within 90 days of diagnosis to qualify for treatment-linked study access.',
    },
    processingTime: '6–8 weeks',
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// STATE GOVERNMENT
// ─────────────────────────────────────────────────────────────────────────────

const STATE: Scheme[] = [
  {
    id: 'gujarat-mma',
    category: 'state',
    name: 'Mukhya Mantri Amrutum / Vatsalya Yojana',
    shortName: 'MA / MAV (Gujarat)',
    ministry: 'Gujarat Govt · Health & Family Welfare',
    amount: '₹3 lakh / family / year (top-up)',
    description: 'Top-up cover above PM-JAY for Gujarat residents. Covers tertiary-care expenses including rare-disease treatments not fully covered by NPRD.',
    url: 'https://magujarat.com',
    color: '#5C7855',
    eligibility: {
      states: ['Gujarat'],
      incomeNote: 'Family income up to ₹4L per year',
    },
  },
  {
    id: 'maharashtra-mjpjay',
    category: 'state',
    name: 'Mahatma Jyotiba Phule Jan Arogya Yojana',
    shortName: 'MJPJAY (Maharashtra)',
    ministry: 'Maharashtra State Health Assurance Society',
    amount: '₹1.5 lakh / family / year',
    description: 'Cashless tertiary care at empanelled hospitals. Successor to Rajiv Gandhi Jeevandayee Arogya Yojana. Includes select rare-disease procedures.',
    url: 'https://www.jeevandayee.gov.in',
    color: '#5C7855',
    eligibility: {
      states: ['Maharashtra'],
      incomeNote: 'Yellow / Orange ration card holders',
    },
  },
  {
    id: 'tn-cmchis',
    category: 'state',
    name: 'CM Comprehensive Health Insurance Scheme',
    shortName: 'CMCHIS (Tamil Nadu)',
    ministry: 'Tamil Nadu Govt',
    amount: '₹5 lakh / family / year',
    description: 'Tamil Nadu state health insurance with one of the most comprehensive rare-disease procedure lists in India.',
    url: 'https://www.cmchistn.com',
    color: '#5C7855',
    eligibility: {
      states: ['Tamil Nadu'],
      incomeNote: 'Family income up to ₹72,000 / year',
    },
  },
  {
    id: 'kerala-karunya',
    category: 'state',
    name: 'Karunya Health Scheme',
    shortName: 'Karunya (Kerala)',
    ministry: 'Kerala State Lotteries Dept',
    amount: '₹2 lakh / patient (per condition, repeatable)',
    description: 'Funded by Kerala State Lotteries. Treatment grants for cancer, cardiac, kidney, and select rare-disease conditions.',
    url: 'https://www.karunya.kerala.gov.in',
    color: '#5C7855',
    eligibility: {
      states: ['Kerala'],
      incomeNote: 'Family income up to ₹3L / year',
    },
  },
  {
    id: 'karnataka-arogya-karnataka',
    category: 'state',
    name: 'Ayushman Bharat – Arogya Karnataka',
    shortName: 'Arogya Karnataka',
    ministry: 'Karnataka Health Dept',
    amount: '₹5 lakh / family / year (with PM-JAY top-up)',
    description: 'Karnataka state implementation of PM-JAY with additional state top-up for non-BPL families.',
    url: 'https://arogya.karnataka.gov.in',
    color: '#5C7855',
    eligibility: { states: ['Karnataka'] },
  },
  {
    id: 'ap-aarogyasri',
    category: 'state',
    name: 'Dr. YSR Aarogyasri',
    shortName: 'Aarogyasri (AP/Telangana)',
    ministry: 'Andhra Pradesh / Telangana',
    amount: 'Up to ₹25 lakh for cochlear implants and selected rare conditions',
    description: 'One of the oldest state rare-disease support programs. Procedure-list based with explicit rare-disease procedures.',
    url: 'https://ysraarogyasri.ap.gov.in',
    color: '#5C7855',
    eligibility: { states: ['Andhra Pradesh', 'Telangana'] },
  },
  {
    id: 'delhi-dajib',
    category: 'state',
    name: 'Delhi Arogya Janani Bandhu Programme',
    shortName: 'DAJIB (Delhi)',
    ministry: 'Delhi Health & Family Welfare',
    amount: '₹5 lakh / patient / year',
    description: 'Delhi-specific top-up for tertiary-care patients including rare-disease treatments at AIIMS Delhi and Lady Hardinge.',
    url: 'https://health.delhi.gov.in',
    color: '#5C7855',
    eligibility: { states: ['Delhi'] },
  },
  {
    id: 'wb-swasthya-sathi',
    category: 'state',
    name: 'Swasthya Sathi',
    shortName: 'Swasthya Sathi (West Bengal)',
    ministry: 'West Bengal Health & Family Welfare',
    amount: '₹5 lakh / family / year',
    description: 'Universal health insurance for West Bengal residents. Cashless treatment at empanelled hospitals including IPGMER.',
    url: 'https://swasthyasathi.gov.in',
    color: '#5C7855',
    eligibility: { states: ['West Bengal'] },
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// PHARMA COMPASSIONATE-USE / PATIENT-ASSISTANCE PROGRAMS
// (real, named programs — confirmed via manufacturer disclosures)
// ─────────────────────────────────────────────────────────────────────────────

const PHARMA: Scheme[] = [
  {
    id: 'sanofi-charitable',
    category: 'pharma',
    name: 'Sanofi Charitable Access (Cerezyme / Myozyme)',
    shortName: 'Sanofi Charitable Access',
    amount: 'Free drug supply (compassionate use)',
    description: 'Manufacturer-funded free supply of imiglucerase (Cerezyme) for Gaucher and alglucosidase alfa (Myozyme) for Pompe. Application via treating CoE specialist. Supports patients with no other funding pathway. This is the program that kept Nidhi Shirol alive for ten years.',
    url: 'https://www.sanofi.in',
    color: '#A04A1F',
    eligibility: {
      omimIds: ['230800', '231000', '232300'], // Gaucher 1/3, Pompe
      other: 'Confirmed diagnosis required. Application by treating physician at a recognised centre. No income limit but must demonstrate inability to fund through other channels.',
    },
    processingTime: '4–8 weeks',
  },
  {
    id: 'takeda-pap',
    category: 'pharma',
    name: 'Takeda Patient Assistance Program',
    shortName: 'Takeda PAP',
    amount: 'Free or subsidised drug (case-by-case)',
    description: 'Free / subsidised supply of velaglucerase (Vpriv) for Gaucher and idursulfase (Elaprase) for Hunter syndrome. Reviewed by independent medical committee.',
    url: 'https://www.takeda.com/en-in',
    color: '#A04A1F',
    eligibility: {
      omimIds: ['230800', '309900'], // Gaucher, Hunter
    },
    processingTime: '6–12 weeks',
  },
  {
    id: 'ripap-roche',
    category: 'pharma',
    name: 'Roche India Patient Assistance Program',
    shortName: 'RIPAP',
    amount: 'Subsidised drug pricing (sliding scale)',
    description: 'Roche India PAP covers risdiplam (Evrysdi) for SMA. Subsidy scales with family income. Direct enrolment via treating neurologist.',
    url: 'https://www.roche.in/patients/patient-support-programs',
    color: '#A04A1F',
    eligibility: {
      omimIds: ['253300', '253400', '253550'], // SMA 1/2/3
    },
  },
  {
    id: 'novartis-zolgensma',
    category: 'pharma',
    name: 'Novartis Managed Access (Zolgensma)',
    shortName: 'Zolgensma Managed Access',
    amount: 'Free dose lottery (limited slots / year globally)',
    description: 'Global lottery for free Zolgensma (onasemnogene abeparvovec) gene therapy for SMA Type 1 patients under 2 years. Indian patients have received doses through this program (e.g., Teera Kamat 2021).',
    url: 'https://www.novartis.com/news/zolgensma-managed-access-program',
    color: '#A04A1F',
    eligibility: {
      omimIds: ['253300'], // SMA Type 1
      maxAge: 2,
      other: 'Time-critical: must apply before age 2. Single-dose gene therapy.',
    },
  },
  {
    id: 'biomarin-pap',
    category: 'pharma',
    name: 'BioMarin Patient Assistance',
    shortName: 'BioMarin PAP',
    amount: 'Free drug (case-by-case)',
    description: 'Vimizim (elosulfase alfa) for MPS IVA, Brineura (cerliponase alfa) for CLN2, Naglazyme for MPS VI. India access via clinical trial extension or compassionate use.',
    url: 'https://www.biomarin.com/patients-caregivers',
    color: '#A04A1F',
    eligibility: {
      other: 'MPS IVA, CLN2, MPS VI patients. Application via treating geneticist.',
    },
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// ADVOCACY-ORG DIRECT-AID FUNDS
// ─────────────────────────────────────────────────────────────────────────────

const ADVOCACY: Scheme[] = [
  {
    id: 'ordi-relief',
    category: 'advocacy',
    name: 'ORDI Patient Relief Fund',
    shortName: 'ORDI Relief',
    ministry: 'Organisation for Rare Diseases India',
    amount: 'Grant-based emergency support',
    description: 'Umbrella patient-advocacy organisation founded by Prasanna Shirol. Coordinates emergency support, advocacy for NPRD reform, and family connection across 7,000+ rare-disease conditions.',
    url: 'https://ordindia.in',
    color: '#8B6C9C',
    eligibility: { other: 'Any confirmed rare-disease diagnosis.' },
  },
  {
    id: 'lsdss',
    category: 'advocacy',
    name: 'Lysosomal Storage Disorders Support Society',
    shortName: 'LSDSS',
    ministry: 'LSDSS India (founded by Manisha Kale)',
    amount: 'Family support, navigation, peer connection',
    description: 'India\'s LSD-specific patient organisation. Tracks every Indian Gaucher / Pompe / MPS / Niemann-Pick / Fabry patient, advocates for NPRD funding, runs peer-mentor program connecting newly-diagnosed families with established ones.',
    url: 'https://lsdssindia.org',
    color: '#8B6C9C',
    eligibility: {
      omimIds: ['230800', '232300', '301500', '607616', '253220', '253200'], // Gaucher, Pompe, Fabry, Niemann-Pick, MPS
    },
  },
  {
    id: 'cure-sma-india',
    category: 'advocacy',
    name: 'Cure SMA Foundation of India',
    shortName: 'Cure SMA India',
    amount: 'Crowdfunding coordination, peer support',
    description: 'SMA-specific advocacy. Coordinates Zolgensma crowdfunding campaigns, Spinraza access, and peer connection. Recently supported the Teera Kamat and Hridyaansh Bhalla campaigns.',
    url: 'https://curesmaindia.org',
    color: '#8B6C9C',
    eligibility: {
      omimIds: ['253300', '253400', '253550'],
    },
  },
  {
    id: 'dmd-trust-india',
    category: 'advocacy',
    name: 'DART (Dystrophy Annihilation Research Trust)',
    shortName: 'DART India',
    amount: 'Research-linked support',
    description: 'Bangalore-based DMD-specific organisation. Combined research + family support model. Peer mentorship, gene-therapy pathway navigation.',
    url: 'https://www.dartindia.in',
    color: '#8B6C9C',
    eligibility: {
      omimIds: ['310200'], // DMD
    },
  },
  {
    id: 'wilson-india',
    category: 'advocacy',
    name: 'Wilson Disease Foundation of India',
    shortName: 'WDF India',
    amount: 'Family support, awareness campaigns',
    description: 'Wilson-specific advocacy. Critical because Indian Wilson misdiagnosis rate is 63% and the disease is treatable when caught early.',
    url: 'https://wilsonfoundationindia.org',
    color: '#8B6C9C',
    eligibility: {
      omimIds: ['277900'], // Wilson
    },
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// TAX BENEFITS
// ─────────────────────────────────────────────────────────────────────────────

const TAX: Scheme[] = [
  {
    id: 'sec-80ddb',
    category: 'tax',
    name: 'Income Tax Section 80DDB',
    shortName: 'Sec 80DDB',
    ministry: 'CBDT',
    amount: 'Up to ₹1 lakh / year (₹40k below age 60)',
    description: 'Income-tax deduction for medical treatment of specified rare diseases. Notified diseases include hemophilia, thalassaemia, chronic renal failure, neurological conditions like motor neuron disease.',
    url: 'https://www.incometax.gov.in',
    color: '#1E2D4A',
    eligibility: {
      other: 'Doctor certification (Form 10-I) required from a specialist at a government / approved hospital.',
    },
  },
  {
    id: 'sec-80dd',
    category: 'tax',
    name: 'Income Tax Section 80DD',
    shortName: 'Sec 80DD',
    ministry: 'CBDT',
    amount: '₹75k–1.25L / year (depends on disability severity)',
    description: 'Income-tax deduction for caretaker of a dependent with a specified disability (40%+) including severe rare diseases.',
    url: 'https://www.incometax.gov.in',
    color: '#1E2D4A',
    eligibility: {
      other: 'Disability certificate (PWD Act 2016) showing 40%+ permanent disability.',
    },
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// CROWDFUNDING (curated — only legitimate platforms)
// ─────────────────────────────────────────────────────────────────────────────

const CROWDFUNDING: Scheme[] = [
  {
    id: 'gov-crowdfund',
    category: 'crowdfunding',
    name: 'Government Rare Disease Crowdfunding Portal',
    shortName: 'rarediseases.nhp.gov.in',
    ministry: 'MoHFW',
    amount: 'Public donations · 80G tax exemption',
    description: 'Official government crowdfunding portal under NPRD 2021. Has historically underperformed (₹2.93L raised total since 2021 across ~4,000 patients) but offers 80G tax-exemption to donors, which private platforms do not.',
    url: 'https://rarediseases.nhp.gov.in',
    color: '#B8842A',
    eligibility: { other: 'NPRD-registered patient with CoE certification.' },
  },
  {
    id: 'impactguru-rd',
    category: 'crowdfunding',
    name: 'ImpactGuru Rare Disease',
    shortName: 'ImpactGuru',
    amount: 'Crowdfund-driven (varies)',
    description: 'Largest medical crowdfunding platform in India by volume. Strong success rate for SMA (Zolgensma campaigns) and pediatric rare-disease cases. 5–8% platform fee.',
    url: 'https://www.impactguru.com',
    color: '#A04A1F',
    eligibility: { other: 'Verified medical documentation.' },
  },
  {
    id: 'ketto-rd',
    category: 'crowdfunding',
    name: 'Ketto Health Fundraiser',
    shortName: 'Ketto',
    amount: 'Crowdfund-driven (varies)',
    description: 'Mumbai-based crowdfunding platform with a dedicated rare-disease vertical. Known for the Teera Kamat (SMA, ₹16 cr) campaign.',
    url: 'https://www.ketto.org',
    color: '#A04A1F',
    eligibility: { other: 'Verified medical documentation.' },
  },
  {
    id: 'milaap-rd',
    category: 'crowdfunding',
    name: 'Milaap Medical',
    shortName: 'Milaap',
    amount: 'Crowdfund-driven (varies)',
    description: 'Bangalore-based crowdfunding platform. Strong networks for SMA / DMD / pediatric oncology.',
    url: 'https://milaap.org',
    color: '#A04A1F',
    eligibility: { other: 'Verified medical documentation.' },
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED — combined list + helpers
// ─────────────────────────────────────────────────────────────────────────────

export const ALL_SCHEMES: Scheme[] = [
  ...CENTRAL,
  ...STATE,
  ...PHARMA,
  ...ADVOCACY,
  ...TAX,
  ...CROWDFUNDING,
];

/** Backwards-compat: the original 3-scheme list used elsewhere. */
export const SCHEMES: Scheme[] = CENTRAL;

/**
 * Filter schemes applicable to a confirmed case.
 */
export function findApplicableSchemes(filter: {
  omimId?: string | null;
  state?: string | null;
}): Scheme[] {
  return ALL_SCHEMES.filter(s => {
    // OMIM match — empty array means "any rare disease"
    const omimOk =
      !s.eligibility.omimIds ||
      s.eligibility.omimIds.length === 0 ||
      (filter.omimId ? s.eligibility.omimIds.includes(filter.omimId) : false);

    // State match — empty array means "nationwide"
    const stateOk =
      !s.eligibility.states ||
      s.eligibility.states.length === 0 ||
      (filter.state ? s.eligibility.states.includes(filter.state) : false);

    return omimOk && stateOk;
  });
}

export function schemesByCategory(schemes: Scheme[]): Record<SchemeCategory, Scheme[]> {
  const grouped: Record<SchemeCategory, Scheme[]> = {
    central: [],
    state: [],
    pharma: [],
    advocacy: [],
    tax: [],
    crowdfunding: [],
  };
  for (const s of schemes) {
    grouped[s.category].push(s);
  }
  return grouped;
}
