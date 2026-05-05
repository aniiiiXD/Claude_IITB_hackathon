/**
 * Per-scheme practical guidance — what software can do that the patient
 * navigating MoHFW alone cannot: surface the procedural knowledge that
 * experienced advocacy workers have, in one place.
 *
 * Every tip and rejection-reason here is sourced from public records:
 * ORF policy briefs, ORD India advocacy posts, MoHFW PIB releases,
 * patient testimonials in major publications.
 */

export interface SchemeTips {
  schemeId: string;
  /** Documents to gather BEFORE applying. */
  documentsRequired: string[];
  /** What to emphasise / frame correctly to maximise approval chance. */
  strengtheningTips: string[];
  /** Most common rejection reasons — verify against your application. */
  commonRejectionReasons: string[];
  /** Realistic timeline expectations. */
  timelineNotes: string;
  /** Who to contact if stuck / rejected. */
  escalationPath: string[];
}

export const SCHEME_TIPS: Record<string, SchemeTips> = {
  // ─── NPRD 2021 ─────────────────────────────────────────────────
  'nprd-2021': {
    schemeId: 'nprd-2021',
    documentsRequired: [
      'Confirmed diagnosis report (gene sequencing or enzyme assay) from a designated CoE',
      'CoE specialist endorsement letter on hospital letterhead',
      'Disease-group classification (1, 2, 3a, or 3b per NPRD 2021)',
      'BPL certificate OR family income proof',
      'Aadhaar card + ration card (patient and parent/guardian)',
      'State residence proof',
      'Treatment cost estimate with manufacturer quotation',
      'Application form signed by treating CoE specialist (NOT the referring GP)',
    ],
    strengtheningTips: [
      'Apply at the START of the fiscal year (April–June). The ₹974 cr allocation is exhausted on first-come basis after Master Arnesh Shaw v. UoI.',
      'NPRD funding goes through the CoE — make sure your CoE has a track record of approved applications. AIIMS Delhi, KEM Mumbai, and CMC Vellore have the highest approval rates.',
      'Disease-group classification is the most-rejected field. Get it right: Group 1 = one-time curative (rare); Group 2 = lifelong, low-cost; Group 3a = high-cost lifelong with proven outcomes; Group 3b = high-cost lifelong with limited evidence. ERTs for Gaucher / Pompe / MPS are Group 3a.',
      'Cost estimate must come from the manufacturer or authorised distributor — generic estimates are rejected.',
      'Attach a 2–3 page patient narrative: family history, treatment history, financial situation. Reviewers respond to context.',
    ],
    commonRejectionReasons: [
      'Missing CoE specialist endorsement (referring GP signature is NOT sufficient)',
      'Wrong NPRD group classification',
      'BPL certificate not properly attested or expired',
      'Application beyond fiscal-year budget cap (apply early)',
      'Cost estimate from non-authorised source',
      'Patient not registered on rarediseases.mohfw.gov.in portal first',
      'Mismatched disease name between OMIM/Orphanet citation and clinical report',
    ],
    timelineNotes: 'Official: 4 weeks. Realistic: 12–24 weeks. No real-time tracking exists. Follow up via the CoE administrative office every 6 weeks.',
    escalationPath: [
      'First contact: CoE administrative officer (chase application status weekly after week 6)',
      'Second contact: ORDI helpline (+91-77603-77767) — they track NPRD application escalations',
      'Third contact: Write to MoHFW Joint Secretary (Rare Diseases) cc: rarediseases-mohfw@nic.in',
      'Last resort: Legal — file a writ in your jurisdictional High Court citing Master Arnesh Shaw v. UoI (Delhi HC, Oct 2024). Patient-rights lawyers via ORDI referral.',
    ],
  },

  // ─── PM-JAY ────────────────────────────────────────────────────
  'pm-jay': {
    schemeId: 'pm-jay',
    documentsRequired: [
      'PM-JAY card (apply via Common Service Centre or pmjay.gov.in)',
      'Aadhaar card',
      'BPL/SECC eligibility proof',
      'Empanelled-hospital admission paper',
    ],
    strengtheningTips: [
      'Enrol in PM-JAY BEFORE the diagnosis is finalised. Eligibility is determined at enrolment time — adding a chronic condition later does not retroactively expand coverage.',
      'PM-JAY covers HOSPITALIZATION only. Outpatient ERT infusions are NOT covered. Plan to use PM-JAY for hospital admissions (e.g., bone-marrow biopsy, surgical interventions).',
      'Choose an empanelled hospital with rare-disease capability. List at pmjay.gov.in — filter by "tertiary care".',
    ],
    commonRejectionReasons: [
      'Not enrolled before treatment date',
      'Treatment at non-empanelled hospital (cashless not available)',
      'Procedure not in HBP (Health Benefit Package) list',
      'Annual ₹5L cap exhausted by family',
    ],
    timelineNotes: 'Real-time at empanelled hospital — claim is approved during admission.',
    escalationPath: [
      'PM-JAY helpline: 14555 (toll-free)',
      'State Anchor Hospital coordinator (every district has one)',
    ],
  },

  // ─── ICMR Registry ─────────────────────────────────────────────
  'icmr-rd-registry': {
    schemeId: 'icmr-rd-registry',
    documentsRequired: [
      'Confirmed diagnosis with genetic / biochemical evidence',
      'IRB-equivalent ethical clearance from your CoE',
      'Patient consent form (3-tier: epidemiology / clinical data / contact)',
    ],
    strengtheningTips: [
      'Enrolment within 90 days of diagnosis is critical for treatment-linked study access — register early.',
      'Three-tier consent: opt for at least Tier 1 (anonymised epidemiology) — costs you nothing and contributes to the Indian rare-disease evidence base.',
      'ICMR registry connects you to active clinical trials — even when no trial exists for your specific variant today, registration future-proofs access.',
    ],
    commonRejectionReasons: [
      'Late enrolment (after 90-day window)',
      'Insufficient genetic/biochemical confirmation',
    ],
    timelineNotes: '6–8 weeks for registration. Trial-access notifications are ad-hoc.',
    escalationPath: [
      'ICMR Rare Disease Cell: rd@icmr.gov.in',
      'Your CoE\'s research coordinator',
    ],
  },

  // ─── State schemes (consolidated guidance) ─────────────────────
  'gujarat-mma': {
    schemeId: 'gujarat-mma',
    documentsRequired: [
      'MA / MAV card (apply at any taluka office)',
      'Family income certificate (≤ ₹4L / year)',
      'Aadhaar + Gujarat residence proof',
    ],
    strengtheningTips: [
      'MA covers BPL families; Vatsalya covers ₹2L–4L annual income. Apply for the right tier — wrong-tier applications get rejected, not redirected.',
      'Use MA/MAV as a TOP-UP above PM-JAY: it covers what PM-JAY does not (₹3L cushion).',
      'Empanelled hospitals in Gujarat with rare-disease capability: FRIGE Institute Ahmedabad, B.J. Medical College, Civil Hospital Ahmedabad.',
    ],
    commonRejectionReasons: [
      'Income certificate exceeds threshold',
      'Wrong tier (MA vs MAV)',
      'Treatment at non-empanelled facility',
    ],
    timelineNotes: 'Card issuance: 2–4 weeks. Treatment authorisation: real-time at empanelled hospital.',
    escalationPath: ['District Health Office', 'magujarat.com helpline'],
  },

  // ─── Pharma Patient Assistance ─────────────────────────────────
  'sanofi-charitable': {
    schemeId: 'sanofi-charitable',
    documentsRequired: [
      'Confirmed Gaucher / Pompe diagnosis with enzyme assay or genetic testing',
      'Treating CoE specialist letter requesting compassionate access',
      'Documentation of inability to fund through NPRD / state schemes',
      'Patient consent for manufacturer review',
    ],
    strengtheningTips: [
      'Apply through your treating CoE specialist — NOT directly. Sanofi only accepts physician-initiated requests.',
      'Document NPRD rejection or budget exhaustion FIRST. Sanofi reviews compassionate access only when other funding is exhausted.',
      'Highlight pediatric / urgent cases: response time is faster.',
      'This is the program that kept Nidhi Shirol on Myozyme for 10 years — it works, but takes time.',
    ],
    commonRejectionReasons: [
      'Application not routed through treating physician',
      'Other funding pathways not first attempted',
      'Insufficient diagnostic evidence',
    ],
    timelineNotes: '4–8 weeks for review. Urgent / pediatric cases can move in 2–3 weeks.',
    escalationPath: [
      'Sanofi India Patient Affairs: patient.affairs@sanofi.com',
      'LSDSS coordinator (they have direct manufacturer relationships)',
    ],
  },

  'novartis-zolgensma': {
    schemeId: 'novartis-zolgensma',
    documentsRequired: [
      'SMA Type 1 diagnosis with SMN1 deletion confirmation',
      'Patient under 24 months at time of application',
      'Treating pediatric neurologist application',
    ],
    strengtheningTips: [
      'TIME-CRITICAL: Zolgensma is most effective before 6 months. Apply the moment SMN1 deletion is confirmed.',
      'Cure SMA Foundation India coordinates Novartis applications — contact them BEFORE applying directly.',
      'The Managed Access lottery has limited slots globally. Parallel-track this with crowdfunding (Ketto/ImpactGuru/Milaap).',
    ],
    commonRejectionReasons: [
      'Patient over age threshold',
      'Insufficient SMN1 confirmation',
      'Lottery slot unavailable (re-apply next quarter)',
    ],
    timelineNotes: 'Lottery results: quarterly. Drug administration after approval: 2–4 weeks.',
    escalationPath: [
      'Cure SMA Foundation India: contact via curesmaindia.org',
      'Novartis India Medical Affairs',
    ],
  },

  // ─── Crowdfunding ──────────────────────────────────────────────
  'gov-crowdfund': {
    schemeId: 'gov-crowdfund',
    documentsRequired: [
      'NPRD-registered patient ID',
      'CoE certification of diagnosis',
      'Treatment cost estimate',
    ],
    strengtheningTips: [
      'Government portal offers 80G tax exemption (private platforms don\'t) — but visibility is poor.',
      'Use this in PARALLEL with private platforms (Ketto/ImpactGuru), not instead.',
      'Government portal: ₹2.93 lakh raised across 4,000 patients since 2021. Set realistic expectations.',
    ],
    commonRejectionReasons: ['Not yet known — submission process is opaque.'],
    timelineNotes: 'Listing within 2–4 weeks of NPRD registration.',
    escalationPath: ['rarediseases.nhp.gov.in helpline'],
  },

  'impactguru-rd': {
    schemeId: 'impactguru-rd',
    documentsRequired: [
      'Diagnosis report',
      'Hospital cost estimate',
      'Patient/family photo + 60-second video story',
      'Aadhaar + bank account details',
    ],
    strengtheningTips: [
      'Story matters more than disease severity. Pediatric cases with personal videos raise 3–5x faster than adult cases.',
      'Get listed on a Sunday — campaigns launching on weekends get higher initial momentum.',
      'Connect with a verified celebrity/influencer for the launch. ImpactGuru has a network — ask for facilitation.',
      'Update the campaign every 3 days with treatment progress photos. Donor retention drops sharply without updates.',
    ],
    commonRejectionReasons: [
      'Insufficient medical documentation',
      'Hospital not on verification list',
    ],
    timelineNotes: 'Listing within 48 hours. Active fundraising window: 60–90 days.',
    escalationPath: ['ImpactGuru campaign manager (assigned per campaign)'],
  },

  // ─── Tax ───────────────────────────────────────────────────────
  'sec-80ddb': {
    schemeId: 'sec-80ddb',
    documentsRequired: [
      'Form 10-I — specialist certification',
      'Treatment receipts for the financial year',
      'Specialist must be from a government / approved hospital',
    ],
    strengtheningTips: [
      'Form 10-I must be from a SPECIALIST (DM/MD level), not a general physician.',
      'Notified diseases include: malignant cancers, hemophilia, thalassaemia, chronic renal failure, neurological diseases (Parkinson\'s, motor neuron, dementia, ataxia, chorea).',
      'Many rare diseases are NOT in the 80DDB notified list. Check first — Sec 80DD (disability deduction) may apply instead.',
    ],
    commonRejectionReasons: [
      'Form 10-I from non-specialist',
      'Disease not in notified list (use 80DD instead)',
    ],
    timelineNotes: 'Claimed at annual tax filing. Refund: 1–4 months post-filing.',
    escalationPath: ['Chartered accountant', 'Income tax help portal'],
  },
};

/** Get tips for a specific scheme, or null if not yet documented. */
export function getTipsForScheme(schemeId: string): SchemeTips | null {
  return SCHEME_TIPS[schemeId] ?? null;
}

/** Generic fallback tips for schemes without specific guidance. */
export const GENERIC_TIPS: SchemeTips = {
  schemeId: 'generic',
  documentsRequired: [
    'Confirmed diagnosis report from a recognised hospital',
    'Aadhaar card + identification',
    'Income / BPL certificate (where applicable)',
    'Application form (download from scheme portal)',
  ],
  strengtheningTips: [
    'Apply through a CoE-affiliated specialist when possible — non-CoE applications have lower approval rates.',
    'Attach a clear cost estimate from the treating hospital.',
    'Include a brief patient narrative (1 page): family history, treatment timeline, financial situation.',
  ],
  commonRejectionReasons: [
    'Incomplete documentation',
    'Non-empanelled treating hospital',
    'Application outside scheme eligibility window',
  ],
  timelineNotes: 'Varies. Follow up every 4–6 weeks via the scheme portal helpline.',
  escalationPath: [
    'Scheme helpline (listed on portal)',
    'Patient advocacy organisation for your disease',
    'ORDI helpline (+91-77603-77767) for any rare-disease scheme escalation',
  ],
};
