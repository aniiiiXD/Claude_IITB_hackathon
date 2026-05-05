// All seeded fake data for demo. No real DB needed.

export type Role = 'gp' | 'specialist' | 'patient' | 'government' | 'researcher' | 'admin';

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  institution?: string;
  stateIndia?: string;
}

export const MOCK_USERS: MockUser[] = [
  { id: 'u1', name: 'Dr. Priya Sharma', email: 'priya@demo.in', role: 'gp', institution: 'Nashik District Hospital', stateIndia: 'Maharashtra' },
  { id: 'u2', name: 'Dr. Rajesh Mehra', email: 'mehra@aiims.in', role: 'specialist', institution: 'AIIMS New Delhi', stateIndia: 'Delhi' },
  { id: 'u3', name: 'Aarav Patel', email: 'aarav@demo.in', role: 'patient' },
  { id: 'u7', name: 'Meera Iyer (new patient)', email: 'meera@demo.in', role: 'patient' },
  { id: 'u4', name: 'Dr. Anitha Krishnan', email: 'anitha@nhm.gov.in', role: 'government', institution: 'National Health Mission, MoHFW' },
  { id: 'u5', name: 'Dr. S. Krishnaswamy', email: 'krishna@csir-ccmb.res.in', role: 'researcher', institution: 'CSIR-CCMB Hyderabad' },
  { id: 'u6', name: 'Admin', email: 'admin@rarecouncil.in', role: 'admin' },
];

export type CaseStatus = 'draft' | 'confirmed' | 'archived';

export interface MockCase {
  id: string;
  doctorId: string;
  patientId?: string;
  patientSummary: string;
  caseText: string;
  status: CaseStatus;
  confirmedAt?: string;
  confirmedDiagnosisName?: string;
  confirmedOmimId?: string;
  confirmedGene?: string;
  confirmedVariant?: string;
  symptomOnsetDate?: string;
  doctorState: string;
  createdAt: string;
  consultationId?: string;
  demoId: string; // links to DEMO_CASES for AI result
}

export const MOCK_CASES: MockCase[] = [
  {
    id: 'case-4a1f',
    doctorId: 'u1',
    patientId: 'u3',
    patientSummary: 'Male, 39, Ahmedabad — 10 months of fatigue, progressive splenomegaly, thrombocytopenia',
    caseText: `Patient: Male, 39 years old, Ahmedabad, Gujarat\nFamily: Parents are first cousins (consanguineous marriage)\n\nPresenting complaints (10 months):\n- Progressively worsening fatigue and weakness\n- Dragging sensation and visible fullness in the left upper abdomen\n- Frequent bruising; 2 episodes of spontaneous nosebleed\n- No fever, no lymphadenopathy\n\nFindings:\n- Massive splenomegaly (spleen palpable 12 cm below costal margin)\n- Hepatomegaly (liver 4 cm below costal margin)\n- CBC: Hb 8.2, Platelet 54,000, WBC 3.1\n- LFTs mildly elevated (AST 52, ALT 61)\n- Bone pain reported in bilateral femurs\n\nPrevious diagnoses (all incorrect): Idiopathic thrombocytopenic purpura, chronic malarial splenomegaly`,
    status: 'confirmed',
    confirmedAt: '2026-03-18T09:14:00Z',
    confirmedDiagnosisName: 'Gaucher disease type 1',
    confirmedOmimId: '230800',
    confirmedGene: 'GBA',
    confirmedVariant: 'N370S',
    symptomOnsetDate: '2025-05-01',
    doctorState: 'Maharashtra',
    createdAt: '2026-03-04T11:22:00Z',
    consultationId: 'consult-1',
    demoId: 'gaucher',
  },
  {
    id: 'case-7c3e',
    doctorId: 'u1',
    patientSummary: 'Female, 8 months, Pune — progressive hypotonia, feeding difficulty since 3 months',
    caseText: `Patient: Female infant, 8 months, Pune, Maharashtra\nFamily: No consanguinity\n\nPresenting: Progressive hypotonia, floppy infant since 3 months\nFeeding: Difficulty swallowing, nasogastric tube feeds since 6 weeks\nMotor: Never achieved head control; absent deep tendon reflexes\nBreathing: Paradoxical breathing pattern, reduced cry volume`,
    status: 'confirmed',
    confirmedAt: '2026-04-02T14:30:00Z',
    confirmedDiagnosisName: 'Spinal muscular atrophy type II',
    confirmedOmimId: '253550',
    confirmedGene: 'SMN1',
    symptomOnsetDate: '2025-08-01',
    doctorState: 'Maharashtra',
    createdAt: '2026-03-28T10:05:00Z',
    demoId: 'sma',
  },
  {
    id: 'case-9f2b',
    doctorId: 'u1',
    patientSummary: 'Male, 16, Nagpur — liver disease with tremors and Kayser-Fleischer rings',
    caseText: `Patient: Male, 16 years, Nagpur, Maharashtra\nFamily: Parents non-consanguineous, maternal uncle died of liver disease aged 22\n\nPresenting: 8 months progressive jaundice, tremors, personality change\nFindings: Hepatomegaly, splenomegaly, Kayser-Fleischer rings on slit-lamp, ALT 340`,
    status: 'draft',
    symptomOnsetDate: '2025-08-01',
    doctorState: 'Maharashtra',
    createdAt: '2026-04-20T08:40:00Z',
    demoId: 'wilson',
  },
  {
    id: 'case-2d8a',
    doctorId: 'u1',
    patientSummary: 'Male, 4, Kolhapur — recurrent infections, eczema, low platelets since birth',
    caseText: `Patient: Male, 4 years, Kolhapur, Maharashtra\nFamily: X-linked family history, maternal grandfather died of infections aged 6\n\nPresenting: Recurrent sinopulmonary infections, severe eczema, thrombocytopenia\nIgM elevated, IgG low, small-volume platelets on smear`,
    status: 'draft',
    symptomOnsetDate: '2022-06-01',
    doctorState: 'Maharashtra',
    createdAt: '2026-04-25T16:15:00Z',
    demoId: 'wiskott-aldrich',
  },
];

export interface MockConsultation {
  id: string;
  caseId: string;
  requestingDoctorId: string;
  specialistId: string;
  status: 'pending' | 'completed';
  requestNote: string;
  specialistNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export const MOCK_CONSULTATIONS: MockConsultation[] = [
  {
    id: 'consult-1',
    caseId: 'case-4a1f',
    requestingDoctorId: 'u1',
    specialistId: 'u2',
    status: 'completed',
    requestNote: 'Patient is 39, starting ERT. Any guidance on imiglucerase dosing and GBA sequencing for family planning?',
    specialistNotes: `Recommend starting imiglucerase at 60 U/kg IV every 2 weeks. GBA sequencing appropriate for family planning — recommend testing siblings and children of patient. Standard N370S and L444P panel first at CDFD Hyderabad.\n\nRegarding the Neurogenetic agent's concern about NPC-C: the crumpled tissue-paper BM morphology and the dramatic response pattern here effectively rule it out clinically. I would not order filipin staining. The N370S variant is overwhelmingly the most common Gujarati GBA pathogenic variant.`,
    createdAt: '2026-03-19T10:00:00Z',
    updatedAt: '2026-03-21T15:30:00Z',
  },
];

export interface MockConsent {
  patientUserId: string;
  epidemiology: boolean;
  researchCohort: boolean;
  researchContact: boolean;
  updatedAt: string;
}

export const MOCK_CONSENTS: MockConsent = {
  patientUserId: 'u3',
  epidemiology: true,
  researchCohort: true,
  researchContact: true,
  updatedAt: '2026-03-22T11:00:00Z',
};

export const MOCK_PATIENT_TIMELINE = [
  { date: '2026-03-04', event: 'Case submitted by Dr. Priya Sharma', type: 'case_created', icon: 'file' },
  { date: '2026-03-18', event: 'Diagnosis confirmed — Gaucher disease type 1', type: 'diagnosis_confirmed', icon: 'check' },
  { date: '2026-03-18', event: 'Invited to Nidaan by Dr. Priya Sharma', type: 'patient_invited', icon: 'mail' },
  { date: '2026-03-19', event: 'Specialist consultation requested — Clinical Geneticist, AIIMS New Delhi', type: 'consult_requested', icon: 'users' },
  { date: '2026-03-21', event: 'Specialist consultation completed — Dr. Rajesh Mehra, AIIMS New Delhi', type: 'consult_completed', icon: 'stethoscope' },
  { date: '2026-03-22', event: 'Research consent updated', type: 'consent_updated', icon: 'shield' },
];

// Government dashboard aggregate data
export const MOCK_GOV_STATS = {
  totalConfirmed: 47,
  last12Months: 47,
  byCategory: { Metabolic: 22, Neurogenetic: 18, Immunologic: 7 },
  byState: [
    { state: 'Maharashtra', count: 14 },
    { state: 'Karnataka', count: 8 },
    { state: 'Telangana', count: 7 },
    { state: 'Delhi', count: 6 },
    { state: 'Tamil Nadu', count: 5 },
    { state: 'Gujarat', count: 4 },
    { state: 'Uttar Pradesh', count: 3 },
  ],
  diagnosticDelay: {
    medianDays: 187,
    byDisease: [
      { disease: 'Gaucher disease', days: 247 },
      { disease: 'Wilson disease', days: 198 },
      { disease: 'SMA', days: 142 },
      { disease: 'DMD', days: 312 },
      { disease: 'Wiskott-Aldrich', days: 156 },
    ],
  },
  treatmentAccessGap: {
    noCoECount: 4,
    noCoEStates: [
      { state: 'Rajasthan', count: 2, disease: 'Gaucher disease' },
      { state: 'Uttar Pradesh', count: 2, disease: 'Gaucher disease' },
    ],
  },
  quarterlyTrend: [
    { quarter: 'Q2 2025', confirmed: 6 },
    { quarter: 'Q3 2025', confirmed: 9 },
    { quarter: 'Q4 2025', confirmed: 14 },
    { quarter: 'Q1 2026', confirmed: 18 },
  ],
};

// Research data
export interface MockResearchRequest {
  id: string;
  researcherId: string;
  queryDiseaseName: string;
  queryOmimId?: string;
  queryGene?: string;
  queryState?: string;
  matchedCount: number;
  purpose: string;
  institution: string;
  irbReference: string;
  dataFieldsRequested: string;
  status: 'pending' | 'approved' | 'rejected' | 'data_released';
  adminNotes?: string;
  createdAt: string;
}

export const MOCK_RESEARCH_REQUESTS: MockResearchRequest[] = [
  {
    id: 'rr-1',
    researcherId: 'u5',
    queryDiseaseName: 'Gaucher disease type 1',
    queryOmimId: '230800',
    queryGene: 'GBA',
    matchedCount: 23,
    purpose: 'Natural history study of GBA variant distribution in Indian Gaucher patients — characterising novel variants not present in ClinVar',
    institution: 'CSIR-CCMB Hyderabad',
    irbReference: 'CCMB/IEC/2026/04',
    dataFieldsRequested: 'Age range, gender, HPO terms, confirmed variant, state',
    status: 'approved',
    adminNotes: 'IRB verified. Standard de-identification protocol applies.',
    createdAt: '2026-04-10T09:00:00Z',
  },
  {
    id: 'rr-2',
    researcherId: 'u5',
    queryDiseaseName: 'Spinal muscular atrophy',
    queryOmimId: '253300',
    queryGene: 'SMN1',
    queryState: 'Maharashtra',
    matchedCount: 11,
    purpose: 'SMN1 deletion breakpoint characterisation in Maharashtra cohort',
    institution: 'CSIR-CCMB Hyderabad',
    irbReference: 'CCMB/IEC/2026/07',
    dataFieldsRequested: 'Age range, SMA type, HPO terms, deletion type',
    status: 'pending',
    createdAt: '2026-04-28T14:30:00Z',
  },
];

// Specialist list for consult request dropdown
export const MOCK_SPECIALISTS = [
  { id: 'u2', name: 'Dr. Rajesh Mehra', specialty: 'Metabolic Geneticist — AIIMS New Delhi' },
  { id: 'sp2', name: 'Dr. Sheela Nampoori', specialty: 'Neurogenetics — CMC Vellore' },
  { id: 'sp3', name: 'Dr. Arun Bhatt', specialty: 'Clinical Immunologist — KEM Mumbai' },
  { id: 'sp4', name: 'Dr. Pooja Dewan', specialty: 'Pediatric Metabolic — AIIMS Delhi' },
];

export function getCaseById(id: string): MockCase | undefined {
  return MOCK_CASES.find(c => c.id === id);
}

export function getCasesByDoctor(doctorId: string): MockCase[] {
  return MOCK_CASES.filter(c => c.doctorId === doctorId);
}

export function getConsultationById(id: string): MockConsultation | undefined {
  return MOCK_CONSULTATIONS.find(c => c.id === id);
}

export function getConsultationsBySpecialist(specialistId: string): MockConsultation[] {
  return MOCK_CONSULTATIONS.filter(c => c.specialistId === specialistId);
}
