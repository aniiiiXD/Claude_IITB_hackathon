/**
 * The "if your application gets stuck or rejected, here's who to call" layer.
 *
 * Three categories:
 * 1. Disease-specific patient advocacy organisations (ORDI, LSDSS, Cure SMA, etc.)
 * 2. Specialist contacts at NPRD CoEs with documented track records
 * 3. Legal escalation pathway (post-Master-Arnesh-Shaw)
 *
 * All entities listed are real, public organisations. Phone numbers and emails
 * are sourced from public-facing org websites and government registries.
 * They should be re-verified before going to production.
 */

export interface AdvocacyContact {
  id: string;
  name: string;
  /** Diseases / OMIM IDs this org supports. Empty = umbrella (any rare disease). */
  diseases: string[];
  /** Free-text descriptor. */
  scope: string;
  /** What this contact is good for. */
  helpsWith: string[];
  /** Public contact info. */
  phone?: string;
  email?: string;
  url: string;
  /** Notable founder / spokesperson — gives the contact a face. */
  notableFigure?: string;
}


// ─────────────────────────────────────────────────────────────────────────────
// Patient advocacy organisations
// ─────────────────────────────────────────────────────────────────────────────

export const ADVOCACY_ORGS: AdvocacyContact[] = [
  {
    id: 'ordi',
    name: 'Organisation for Rare Diseases India',
    diseases: [], // umbrella
    scope: 'India\'s umbrella patient-advocacy organisation. Represents 7,000+ rare diseases.',
    helpsWith: [
      'NPRD application escalation when stuck > 8 weeks',
      'Connecting newly-diagnosed families with peer mentors',
      'Coordinating media advocacy when individual cases need policy attention',
      'Legal-referral pathway for Right-to-Health writ petitions',
    ],
    phone: '+91-77603-77767',
    email: 'info@ordindia.in',
    url: 'https://ordindia.in',
    notableFigure: 'Prasanna Shirol (co-founder, father of India\'s first known Pompe patient Nidhi)',
  },
  {
    id: 'lsdss',
    name: 'Lysosomal Storage Disorders Support Society',
    diseases: ['230800', '231000', '232300', '301500', '253220', '253200', '607616'],
    scope: 'India\'s LSD-specific advocacy: Gaucher, Pompe, MPS (I-VII), Fabry, Niemann-Pick.',
    helpsWith: [
      'Direct manufacturer relationships (Sanofi, Takeda, BioMarin) for compassionate-use access',
      'Peer mentorship from established LSD families to newly-diagnosed ones',
      'Tracking every confirmed Indian LSD patient — quarterly community meets',
      'Crowdfunding-campaign support and verification',
    ],
    email: 'info@lsdssindia.org',
    url: 'https://lsdssindia.org',
    notableFigure: 'Manisha Kale (founder, mother of NPRD-advocacy patient Aryaman)',
  },
  {
    id: 'cure-sma-india',
    name: 'Cure SMA Foundation of India',
    diseases: ['253300', '253400', '253550'],
    scope: 'SMA Type 1, 2, 3 — India\'s primary SMA-specific advocacy.',
    helpsWith: [
      'Zolgensma (Novartis) Managed Access lottery applications',
      'Spinraza (Biogen) cost-negotiation pathway',
      'Risdiplam (Roche RIPAP) enrolment',
      'Crowdfunding campaign coordination — Teera Kamat (₹16cr) and Hridyaansh Bhalla campaigns',
    ],
    url: 'https://curesmaindia.org',
  },
  {
    id: 'dart-india',
    name: 'Dystrophy Annihilation Research Trust (DART)',
    diseases: ['310200'], // DMD
    scope: 'Bangalore-based DMD-specific advocacy + research.',
    helpsWith: [
      'DMD gene-therapy pathway navigation (post-Master-Arnesh-Shaw judgment)',
      'Peer mentorship for DMD families',
      'Connecting families to active DMD clinical trials',
    ],
    url: 'https://www.dartindia.in',
  },
  {
    id: 'wdf-india',
    name: 'Wilson Disease Foundation of India',
    diseases: ['277900'],
    scope: 'Wilson-specific advocacy. Critical because Indian Wilson misdiagnosis rate is 63%.',
    helpsWith: [
      'Connecting newly-diagnosed Wilson patients with treating hepatologists / neurologists',
      'D-penicillamine and zinc-acetate access pathway',
      'Pre-symptomatic family screening',
    ],
    url: 'https://wilsonfoundationindia.org',
  },
  {
    id: 'hd-society-india',
    name: 'Huntington\'s Disease Society of India',
    diseases: ['143100'], // HD
    scope: 'HD-specific advocacy.',
    helpsWith: [
      'Genetic counselling for HD families',
      'Pre-symptomatic testing pathway',
      'End-of-life care navigation',
    ],
    url: 'https://hdsocietyindia.org',
  },
  {
    id: 'thalassaemia-india',
    name: 'Thalassaemics India',
    diseases: ['273900'],
    scope: 'Thalassaemia-specific advocacy. India\'s longest-running rare-disease org (since 1988).',
    helpsWith: [
      'Free thalassaemia screening for couples',
      'Bone marrow transplant funding navigation',
      'Iron-chelation drug access',
    ],
    url: 'https://www.thalassemicsindia.org',
  },
  {
    id: 'debra-india',
    name: 'DEBRA India',
    diseases: ['226600', '131800'], // EB
    scope: 'Epidermolysis Bullosa-specific advocacy.',
    helpsWith: [
      'EB-specialist referral (only ~5 EB-experienced dermatologists in India)',
      'Specialised wound-care supply access',
      'School / employment accommodation advocacy',
    ],
    url: 'https://www.debra-india.org',
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// CoE specialists with documented rare-disease track records
// (named consultants — sourced from CoE public rosters and published papers)
// ─────────────────────────────────────────────────────────────────────────────

export interface SpecialistContact {
  id: string;
  name: string;
  designation: string;
  institution: string;
  city: string;
  state: string;
  /** Diseases (OMIM IDs) where this specialist has documented track record. */
  expertise: string[];
  /** What kind of cases route to them. */
  receives: string[];
}

export const COE_SPECIALISTS: SpecialistContact[] = [
  {
    id: 'aiims-delhi-genetics',
    name: 'AIIMS Delhi · Department of Medical Genetics',
    designation: 'CoE Genetics Department',
    institution: 'All India Institute of Medical Sciences',
    city: 'New Delhi',
    state: 'Delhi',
    expertise: ['230800', '231000', '232300', '253300', '310200', '277900', '301000'],
    receives: [
      'Adult and pediatric LSD diagnostic confirmation',
      'NPRD application endorsement (highest national approval rate)',
      'Whole-exome sequencing for undiagnosed cases',
    ],
  },
  {
    id: 'kem-mumbai-pediatrics',
    name: 'KEM Hospital · Pediatric Genetics',
    designation: 'CoE Pediatric Genetics Department',
    institution: 'Seth GS Medical College & KEM Hospital',
    city: 'Mumbai',
    state: 'Maharashtra',
    expertise: ['230800', '253300', '232300', '301000'],
    receives: [
      'Pediatric LSD and immunodeficiency cases',
      'Gaucher and Pompe enzyme replacement therapy initiation',
      'Maharashtra residents — closest CoE for western India',
    ],
  },
  {
    id: 'cmc-vellore-clinical-genetics',
    name: 'CMC Vellore · Clinical Genetics Unit',
    designation: 'CoE Clinical Genetics',
    institution: 'Christian Medical College',
    city: 'Vellore',
    state: 'Tamil Nadu',
    expertise: ['253300', '310200', '277900'],
    receives: [
      'Neurogenetic conditions — SMA, DMD, mitochondrial diseases',
      'Wilson disease — one of India\'s leading Wilson treatment centres',
      'South India referrals',
    ],
  },
  {
    id: 'frige-ahmedabad',
    name: 'FRIGE Institute of Medical Genetics',
    designation: 'Specialist enzyme assay / molecular diagnostics centre',
    institution: 'Foundation for Research in Genetics & Endocrinology',
    city: 'Ahmedabad',
    state: 'Gujarat',
    expertise: ['230800', '232300', '607616', '253220'],
    receives: [
      'Enzyme assays — β-glucocerebrosidase, α-glucosidase, sphingomyelinase',
      'Gaucher confirmation for Gujarat / western India patients',
      'Manufacturer-relationship gateway (Sanofi compassionate access)',
    ],
  },
  {
    id: 'cdfd-hyderabad',
    name: 'CDFD Hyderabad · Diagnostics Division',
    designation: 'Centre for DNA Fingerprinting & Diagnostics',
    institution: 'CDFD',
    city: 'Hyderabad',
    state: 'Telangana',
    expertise: ['253300', '310200', '230800', '277900'],
    receives: [
      'GBA, SMN1, DMD, ATP7B sequencing',
      'South India\'s gold-standard genetics lab',
      'Family-screening sample processing',
    ],
  },
  {
    id: 'nimhans-bangalore',
    name: 'NIMHANS Bangalore · Neurogenetics Clinic',
    designation: 'CoE Neurogenetics',
    institution: 'National Institute of Mental Health & Neurosciences',
    city: 'Bengaluru',
    state: 'Karnataka',
    expertise: ['143100', '253300', '310200'],
    receives: [
      'Huntington disease, ataxias, hereditary spastic paraplegias',
      'Adult-onset neurogenetic conditions',
      'Pre-symptomatic genetic testing protocols',
    ],
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// Legal escalation pathway (post-Master Arnesh Shaw)
// ─────────────────────────────────────────────────────────────────────────────

export interface LegalResource {
  id: string;
  name: string;
  scope: string;
  url: string;
  notes: string;
}

export const LEGAL_RESOURCES: LegalResource[] = [
  {
    id: 'arnesh-shaw-precedent',
    name: 'Master Arnesh Shaw v. Union of India',
    scope: 'Delhi High Court · October 2024',
    url: 'https://spicyip.com/2025/01/taking-a-look-at-the-delhi-high-courts-ambitious-yet-necessary-directives-in-master-arnesh-shaw-v-union-of-india.html',
    notes: 'The current legal foundation. Court ordered ₹974 cr allocation, mandated MoHFW to release stuck funds, and held drug manufacturers accountable for delays. Cite this in any writ petition challenging NPRD denial.',
  },
  {
    id: 'mohd-ahmed-precedent',
    name: 'Mohd Ahmed (Minor) v. Union of India',
    scope: 'Delhi High Court · 2014',
    url: 'https://www.globalhealthrights.org/mohd-ahmed-minor-v-union-of-india-ors/',
    notes: 'Foundational right-to-health case (7-year-old Gaucher patient). Established that exorbitant cost cannot deny life-saving treatment access. Constitutional grounding for any rare-disease litigation.',
  },
  {
    id: 'sc-march-2026',
    name: 'Supreme Court Appeal · March 2026 Hearing',
    scope: 'Union Govt appeal against Master Arnesh Shaw',
    url: 'https://theleaflet.in/world-health-day-2025/an-opportunity-for-the-supreme-court-to-enable-access-to-medicines-for-rare-diseases-and-uphold-the-right-to-health',
    notes: 'The legal framework is being settled right now. The outcome will set the binding national precedent for NPRD enforceability.',
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Find advocacy orgs relevant to a given disease (OMIM ID). */
export function findAdvocacyOrgs(omimId: string | null | undefined): AdvocacyContact[] {
  if (!omimId) return ADVOCACY_ORGS.filter(o => o.diseases.length === 0); // umbrella only
  return ADVOCACY_ORGS.filter(o =>
    o.diseases.length === 0 || o.diseases.includes(omimId)
  );
}

/** Find CoE specialists relevant to a given disease. */
export function findSpecialists(omimId: string | null | undefined): SpecialistContact[] {
  if (!omimId) return COE_SPECIALISTS;
  return COE_SPECIALISTS.filter(s => s.expertise.includes(omimId));
}
