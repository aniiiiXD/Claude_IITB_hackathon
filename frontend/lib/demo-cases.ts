export interface HPOTerm {
  id: string
  name: string
  onset?: string
  severity?: string
}

export interface ConfirmatoryTest {
  test: string
  yield_level: string
  cost_inr?: string
  cost_tier: 'low' | 'moderate' | 'high'
}

export interface Differential {
  rank: number
  disease_name: string
  omim_id: string
  orpha_code: string
  confidence: 'high' | 'medium' | 'low'
  confidence_pct: number
  flagged_by: string[]
  supporting_features: string[]
  non_matching_features: string[]
  confirmatory_tests: ConfirmatoryTest[]
}

export interface Disagreement {
  disease: string
  flagged_by: string[]
  not_flagged_by: string[]
  reason: string
  resolving_test: string
}

export interface RecommendedTest {
  name: string
  rationale: string
  cost_inr?: string
  tier: 1 | 2 | 3
}

export interface CaseResult {
  screener: {
    proceed_to_rare_workup: boolean
    screener_note: string
    common_conditions_considered: string[]
  }
  hpo_terms: HPOTerm[]
  unified_differential: Differential[]
  disagreements: Disagreement[]
  recommended_tests: RecommendedTest[]
  hpo_referral_summary: string
  specialist_type_recommended: string
  referral_centers: string[]
  runtime_seconds: number
  case_conference_narrative: string
}

export interface DemoCase {
  id: string
  label: string
  patient_summary: string
  true_diagnosis: string
  case_text: string
  result: CaseResult
}

export const DEMO_CASES: DemoCase[] = [
  {
    id: 'gaucher',
    label: 'Ahmedabad, 39M — Gaucher disease',
    patient_summary: '39M, Ahmedabad · 10 months abdominal distension, splenomegaly, pancytopenia',
    true_diagnosis: 'Gaucher disease type 1',
    case_text: `39-year-old Indian Muslim male from Ahmedabad, from a consanguineous marriage (first cousins). 10 months of progressive abdominal distension, low-grade fever (37.8–38.2°C), anorexia, and significant weight loss (8 kg over 10 months). On examination: massive splenomegaly (spleen palpable 12 cm below left costal margin, firm, non-tender), hepatomegaly (liver 4 cm below right costal margin). No lymphadenopathy. Laboratory: pancytopenia — Hb 7.2 g/dL, platelets 48,000/μL, TLC 2,800/μL. Serum ferritin markedly elevated at 2,840 ng/mL. LDH elevated. Bone marrow biopsy: foamy macrophages with crumpled tissue-paper appearance of cytoplasm. Previously treated empirically for malaria with artemisinin — no response. Treated for visceral leishmaniasis (kala-azar) with liposomal amphotericin B for full course — no sustained response. No organochlorine exposure. No alcohol use. No travel outside India.`,
    result: {
      screener: {
        proceed_to_rare_workup: true,
        screener_note: 'Kala-azar (visceral leishmaniasis) was appropriately treated with full-course liposomal amphotericin B — confirmed treatment failure excludes active VL as primary cause. Malaria ruled out clinically and by treatment failure. The combination of foamy macrophages on bone marrow biopsy with crumpled tissue-paper appearance, massive splenomegaly, and pancytopenia in a consanguineous Indian patient is pathognomonic for a lysosomal storage disorder, most likely Gaucher disease. Rare disease workup is strongly indicated.',
        common_conditions_considered: ['Visceral leishmaniasis (kala-azar)', 'Plasmodium falciparum malaria', 'Portal hypertension (hepatic cause)', 'Myeloproliferative neoplasm'],
      },
      hpo_terms: [
        { id: 'HP:0001744', name: 'Splenomegaly', onset: 'unknown', severity: 'severe' },
        { id: 'HP:0001433', name: 'Hepatosplenomegaly', onset: 'unknown', severity: 'moderate' },
        { id: 'HP:0001903', name: 'Thrombocytopenia', onset: 'unknown', severity: 'moderate' },
        { id: 'HP:0001876', name: 'Pancytopenia', onset: 'unknown', severity: 'moderate' },
        { id: 'HP:0003109', name: 'Hyperferritinemia', onset: 'unknown', severity: 'moderate' },
        { id: 'HP:0001824', name: 'Weight loss', onset: '10 months ago', severity: 'moderate' },
        { id: 'HP:0001952', name: 'Foamy macrophages', onset: 'unknown', severity: 'severe' },
      ],
      unified_differential: [
        {
          rank: 1,
          disease_name: 'Gaucher disease type 1',
          omim_id: '230800',
          orpha_code: '355',
          confidence: 'high',
          confidence_pct: 89,
          flagged_by: ['Metabolic'],
          supporting_features: [
            'Foamy macrophages with crumpled tissue-paper cytoplasm on BM biopsy (near-pathognomonic)',
            'Massive splenomegaly with hepatomegaly',
            'Pancytopenia consistent with splenic sequestration',
            'Consanguineous parents (autosomal recessive)',
            'Indian Muslim from Ahmedabad — high prevalence of GBA mutations in this population',
            'Hyperferritinemia (chitotriosidase elevation correlates with disease burden)',
            'Failure to respond to full kala-azar treatment',
          ],
          non_matching_features: ['No bone crisis or bone pain reported', 'No Gaucher cell demonstration (yet) with specific staining'],
          confirmatory_tests: [
            { test: 'β-glucocerebrosidase enzyme activity (dried blood spot)', yield_level: 'Definitive — <15% activity confirms diagnosis', cost_inr: '₹2,000–4,000', cost_tier: 'low' },
            { test: 'Chitotriosidase activity (serum)', yield_level: 'High — elevated 100–1000x in Gaucher disease', cost_inr: '₹1,500–3,000', cost_tier: 'low' },
            { test: 'GBA gene sequencing (full gene)', yield_level: 'Confirmatory — identifies causal variant for family counselling', cost_inr: '₹8,000–15,000', cost_tier: 'high' },
          ],
        },
        {
          rank: 2,
          disease_name: 'Niemann-Pick disease type B',
          omim_id: '607616',
          orpha_code: '70',
          confidence: 'medium',
          confidence_pct: 61,
          flagged_by: ['Metabolic'],
          supporting_features: [
            'Hepatosplenomegaly with foamy macrophages',
            'Pancytopenia from splenic sequestration',
            'Absence of neurological features consistent with type B (non-neuronopathic)',
            'Consanguineous family',
          ],
          non_matching_features: ['No cherry-red spot on fundoscopy (type A feature)', 'No pulmonary infiltrates reported', 'Tissue-paper cytoplasm more characteristic of Gaucher'],
          confirmatory_tests: [
            { test: 'Sphingomyelinase enzyme activity (leucocytes/DBS)', yield_level: 'Definitive if reduced', cost_inr: '₹3,000–6,000', cost_tier: 'moderate' },
            { test: 'SMPD1 gene sequencing', yield_level: 'Confirmatory', cost_inr: '₹8,000–12,000', cost_tier: 'high' },
          ],
        },
        {
          rank: 3,
          disease_name: 'Haemophagocytic lymphohistiocytosis (secondary)',
          omim_id: '267700',
          orpha_code: '158029',
          confidence: 'medium',
          confidence_pct: 44,
          flagged_by: ['Immunologic'],
          supporting_features: [
            'Hyperferritinemia (ferritin >2,000)',
            'Pancytopenia',
            'Hepatosplenomegaly',
            'Low-grade fever',
            'Foamy macrophages could represent haemophagocytosis',
          ],
          non_matching_features: ['Ferritin not typically >10,000 in HLH (usually >5,000)', 'No NK cell dysfunction data', 'No hemophagocytosis specifically noted on BM', 'No coagulopathy or hypertriglyceridemia mentioned'],
          confirmatory_tests: [
            { test: 'HScore calculation + NK cell function', yield_level: 'Probability assessment', cost_inr: '₹2,000', cost_tier: 'low' },
            { test: 'Serum triglycerides, fibrinogen, soluble CD25', yield_level: 'Supports/refutes HLH', cost_inr: '₹1,500', cost_tier: 'low' },
          ],
        },
        {
          rank: 4,
          disease_name: 'Primary myelofibrosis',
          omim_id: '254450',
          orpha_code: '824',
          confidence: 'low',
          confidence_pct: 22,
          flagged_by: ['Metabolic'],
          supporting_features: ['Splenomegaly', 'Pancytopenia', 'Elevated LDH'],
          non_matching_features: ['Age 39 with consanguinity points strongly to inherited LSD', 'Foamy macrophage pattern atypical for myelofibrosis', 'No tear-drop cells mentioned'],
          confirmatory_tests: [
            { test: 'JAK2/CALR/MPL mutation panel', yield_level: 'Excludes if negative', cost_inr: '₹5,000', cost_tier: 'moderate' },
          ],
        },
        {
          rank: 5,
          disease_name: 'Wolman disease / LAL deficiency',
          omim_id: '278000',
          orpha_code: '75233',
          confidence: 'low',
          confidence_pct: 14,
          flagged_by: ['Metabolic'],
          supporting_features: ['Hepatosplenomegaly', 'Foamy macrophages', 'Consanguinity'],
          non_matching_features: ['Typically presents in infancy', 'No adrenal calcification mentioned', 'Survival to age 39 unusual without enzyme replacement'],
          confirmatory_tests: [
            { test: 'Lysosomal acid lipase (LAL) enzyme activity', yield_level: 'Definitive if reduced', cost_inr: '₹4,000', cost_tier: 'moderate' },
          ],
        },
      ],
      disagreements: [
        {
          disease: 'Niemann-Pick disease type C',
          flagged_by: ['Neurogenetic'],
          not_flagged_by: ['Metabolic', 'Immunologic'],
          reason: 'Neurogenetic flagged NPC due to overlapping hepatosplenomegaly + foamy macrophages pattern, noting that NPC can present without overt neurological features early in adult-onset forms. Metabolic specialist disagrees: the crumpled tissue-paper cytoplasmic pattern on BM biopsy is far more specific for Gaucher (glucocerebrosidase) than NPC (NPC1/NPC2 cholesterol trafficking). NPC macrophages accumulate unesterified cholesterol, detected by filipin, not described here.',
          resolving_test: 'Filipin staining of skin fibroblasts / NPC1 + NPC2 gene panel — if positive, overrides Metabolic; if negative, confirms Gaucher/NPC-B differential',
        },
      ],
      recommended_tests: [
        { tier: 1, name: 'β-glucocerebrosidase enzyme activity (dried blood spot)', rationale: 'Single most specific test for Gaucher disease. Definitive if <15% residual activity. Available at AIIMS, KEM, CMC Vellore.', cost_inr: '₹2,000–4,000' },
        { tier: 1, name: 'Chitotriosidase activity (serum)', rationale: 'Disease activity marker elevated 100–1000× in Gaucher. Low cost. Also useful for treatment monitoring.', cost_inr: '₹1,500–2,500' },
        { tier: 1, name: 'Serum ferritin + LDH + uric acid (repeat)', rationale: 'Baseline for monitoring. LDH/uric acid elevated in both Gaucher and HLH — helps differentiate trajectory.', cost_inr: '₹500–800' },
        { tier: 2, name: 'Sphingomyelinase enzyme activity (leucocytes)', rationale: 'Rules out Niemann-Pick type B if Gaucher enzyme activity is borderline. Required if DBS result is inconclusive.', cost_inr: '₹3,000–6,000' },
        { tier: 2, name: 'Filipin staining (skin fibroblast culture)', rationale: 'Resolves Neurogenetic-flagged Niemann-Pick type C disagreement. Detects cholesterol accumulation in NPC.', cost_inr: '₹4,000–8,000' },
        { tier: 2, name: 'Bone marrow biopsy with Gaucher cell staining (PAS, iron, CD68)', rationale: 'Morphology confirmation. Useful if enzyme activity is in grey zone. Already done — request specific Gaucher staining if not done.', cost_inr: '₹2,000' },
        { tier: 3, name: 'GBA gene sequencing (full gene + MLPA)', rationale: 'Confirms mutation for genetic counselling of family. Not needed for treatment decision (enzyme activity is sufficient).', cost_inr: '₹8,000–15,000' },
        { tier: 3, name: 'Lysosomal enzyme panel (full panel)', rationale: 'Comprehensive if enzyme activity results are atypical. Covers Gaucher, NPC-B, Pompe, MPS in one panel.', cost_inr: '₹12,000–25,000' },
      ],
      hpo_referral_summary: 'HP:0001744 Splenomegaly (severe, adult onset) · HP:0001433 Hepatosplenomegaly (moderate) · HP:0001903 Thrombocytopenia (moderate, platelet 48k) · HP:0001876 Pancytopenia (moderate) · HP:0003109 Hyperferritinemia (ferritin 2840) · HP:0001824 Weight loss (8 kg/10 months) · HP:0001952 Foamy macrophages on BM biopsy',
      specialist_type_recommended: 'Pediatric/Adult Metabolic Geneticist (Lysosomal Storage Disorder specialist)',
      referral_centers: ['AIIMS New Delhi — Pediatric Genetics & Metabolic Disease Unit', 'KEM Hospital Mumbai — Clinical Genetics (Dr. Girish Deshpande)', 'CMC Vellore — Clinical Genetics Unit', 'NIMHANS Bangalore — Neurogenetics (if NPC-C remains in differential)', 'CDFD Hyderabad — Genetic diagnosis + GBA sequencing'],
      runtime_seconds: 67,
      case_conference_narrative: 'This 39-year-old consanguineous Indian male presents with a constellation of massive splenomegaly, pancytopenia, and foamy macrophages showing crumpled tissue-paper cytoplasm on bone marrow biopsy — a near-pathognomonic presentation of Gaucher disease type 1, the most common inborn error of metabolism at Indian tertiary centres (11.2% of IEM burden). Treatment failure with full-course antileishmanial therapy effectively excludes active kala-azar. The Metabolic specialist assigns 89% confidence to Gaucher type 1 (OMIM:230800) with Niemann-Pick type B as the primary alternative. The Neurogenetic specialist raises Niemann-Pick type C as a consideration due to adult-onset atypical presentation; this disagreement is resolvable by filipin staining. Immediate next step: β-glucocerebrosidase enzyme activity on dried blood spot — if <15% activity, Gaucher disease is confirmed and enzyme replacement therapy with imiglucerase should be initiated without delay.',
    },
  },

  {
    id: 'sma',
    label: 'Pune, 8M infant — SMA type 2',
    patient_summary: '8M male infant, Pune · Progressive proximal weakness, absent DTRs, tongue fasciculations',
    true_diagnosis: 'Spinal Muscular Atrophy type 2',
    case_text: `8-month-old male infant from Pune. Parents noticed progressive proximal weakness since age 3 months — initially floppy, now unable to sit unsupported despite being 8 months old. No regression; never achieved sitting milestone. On examination: marked generalised hypotonia with proximal predominance, absent deep tendon reflexes in all four limbs bilaterally, tongue fasciculations visible at rest, intercostal muscle weakness with subcostal retractions, paradoxical breathing pattern. Arms weaker than legs. Weak cry and cough. Sensation appears intact. No facial diplegia. No eye movement abnormality. Family history: maternal uncle had similar presentation from infancy and died at age 3 years after respiratory failure. Consanguinity: none reported. No antenatal complications. Developmental: social smile present, no hand manipulation.`,
    result: {
      screener: {
        proceed_to_rare_workup: true,
        screener_note: 'No common diagnosis (birth asphyxia, nutritional deficiency, congenital hypothyroidism) explains the combination of progressive proximal hypotonia, absent DTRs, tongue fasciculations, and respiratory compromise at 8 months. The X-linked family pattern (maternal uncle affected) and pure lower motor neuron picture with tongue fasciculations is highly specific for an inherited anterior horn cell or neuromuscular disease. Rare disease workup is mandated.',
        common_conditions_considered: ['Birth asphyxia / Hypoxic-ischaemic encephalopathy', 'Nutritional deficiency (B12, vitamin D)', 'Congenital hypothyroidism', 'Congenital infection (TORCH)'],
      },
      hpo_terms: [
        { id: 'HP:0001290', name: 'Hypotonia', onset: '3 months', severity: 'severe' },
        { id: 'HP:0003560', name: 'Muscular dystrophy (proximal)', onset: '3 months', severity: 'severe' },
        { id: 'HP:0001265', name: 'Hyporeflexia', onset: '3 months', severity: 'severe' },
        { id: 'HP:0002380', name: 'Fasciculations', onset: '3 months', severity: 'moderate' },
        { id: 'HP:0002093', name: 'Respiratory insufficiency', onset: '8 months', severity: 'moderate' },
        { id: 'HP:0002486', name: 'Myotonia', onset: 'N/A', severity: 'absent' },
      ],
      unified_differential: [
        {
          rank: 1,
          disease_name: 'Spinal Muscular Atrophy type 2',
          omim_id: '253550',
          orpha_code: '83418',
          confidence: 'high',
          confidence_pct: 94,
          flagged_by: ['Neurogenetic'],
          supporting_features: [
            'Progressive proximal hypotonia onset 3 months — classic SMA-II window',
            'Tongue fasciculations — anterior horn cell involvement',
            'Absent DTRs bilaterally',
            'Paradoxical breathing with intercostal weakness',
            'X-linked family history consistent with SMN1 inheritance',
            'Never achieved sitting (SMA-II: sits but never walks)',
          ],
          non_matching_features: ['No confirmed SMN1 deletion yet'],
          confirmatory_tests: [
            { test: 'SMN1 gene deletion analysis (MLPA)', yield_level: 'Definitive — homozygous deletion in >95% of SMA', cost_inr: '₹4,000–8,000', cost_tier: 'moderate' },
            { test: 'SMN2 copy number (same MLPA)', yield_level: 'Required for prognosis and treatment eligibility', cost_inr: 'Included in MLPA', cost_tier: 'moderate' },
          ],
        },
        {
          rank: 2,
          disease_name: 'Congenital myopathy (nemaline/centronuclear)',
          omim_id: '255310',
          orpha_code: '69186',
          confidence: 'medium',
          confidence_pct: 52,
          flagged_by: ['Neurogenetic'],
          supporting_features: ['Hypotonia from birth', 'Respiratory involvement', 'Proximal weakness'],
          non_matching_features: ['Tongue fasciculations argue against myopathy (upper motor neuron sign)', 'Absent DTRs can occur in myopathy but less specific'],
          confirmatory_tests: [
            { test: 'Muscle biopsy with electron microscopy', yield_level: 'Diagnostic for nemaline bodies or central cores', cost_inr: '₹6,000–10,000', cost_tier: 'moderate' },
            { test: 'NEB/RYR1/TPM gene panel', yield_level: 'Genetic confirmation', cost_inr: '₹15,000', cost_tier: 'high' },
          ],
        },
        {
          rank: 3,
          disease_name: 'Pompe disease (GSD type II)',
          omim_id: '232300',
          orpha_code: '365',
          confidence: 'medium',
          confidence_pct: 41,
          flagged_by: ['Metabolic'],
          supporting_features: ['Hypotonia', 'Respiratory insufficiency', 'Proximal muscle weakness', 'Consanguineous population risk'],
          non_matching_features: ['No cardiomegaly mentioned (classic infantile Pompe)', 'Tongue fasciculations not typical of myopathy', 'Family history suggests anterior horn cell disease'],
          confirmatory_tests: [
            { test: 'GAA enzyme activity (DBS or leucocytes)', yield_level: 'Definitive if <1% activity (infantile) or 1–10% (late-onset)', cost_inr: '₹2,500–4,000', cost_tier: 'low' },
          ],
        },
        {
          rank: 4,
          disease_name: 'Congenital myasthenic syndrome',
          omim_id: '601462',
          orpha_code: '590',
          confidence: 'low',
          confidence_pct: 28,
          flagged_by: ['Neurogenetic'],
          supporting_features: ['Generalised hypotonia', 'Respiratory failure', 'Weakness in infant'],
          non_matching_features: ['No fatigable ptosis or ophthalmoplegia described', 'Absent DTRs not typical of NMJ disease'],
          confirmatory_tests: [
            { test: 'Repetitive nerve stimulation (2-3 Hz)', yield_level: 'Decremental response >10% confirms NMJ dysfunction', cost_inr: '₹1,500', cost_tier: 'low' },
          ],
        },
        {
          rank: 5,
          disease_name: 'BICD2-related spinal muscular atrophy (SMALED)',
          omim_id: '615290',
          orpha_code: '329178',
          confidence: 'low',
          confidence_pct: 15,
          flagged_by: ['Neurogenetic'],
          supporting_features: ['Lower limb predominant SMA phenotype', 'Autosomal dominant — could explain family history'],
          non_matching_features: ['Typically less severe than observed here', 'Upper limb involvement present here'],
          confirmatory_tests: [
            { test: 'BICD2 gene sequencing', yield_level: 'If SMN1 deletion absent', cost_inr: '₹5,000', cost_tier: 'moderate' },
          ],
        },
      ],
      disagreements: [
        {
          disease: 'Pompe disease (GSD type II)',
          flagged_by: ['Metabolic'],
          not_flagged_by: ['Neurogenetic', 'Immunologic'],
          reason: 'Metabolic specialist flags Pompe because GAA deficiency causes proximal myopathy with respiratory failure in infancy. Neurogenetic specialist disagrees: tongue fasciculations are an anterior horn cell sign not seen in pure myopathies, and the family history pattern (X-linked uncle) better fits SMN1 SMA. The two are easily distinguished by GAA enzyme activity — if normal, Pompe is excluded.',
          resolving_test: 'GAA enzyme activity on DBS (Pompe screen) — simultaneously order with SMN1 MLPA to resolve both top candidates',
        },
      ],
      recommended_tests: [
        { tier: 1, name: 'SMN1 gene deletion analysis + SMN2 copy number (MLPA)', rationale: 'Definitive for SMA — detects >95% of cases. SMN2 copy number determines disease severity and nusinersen/risdiplam eligibility.', cost_inr: '₹4,000–8,000' },
        { tier: 1, name: 'Creatine kinase (CK) serum', rationale: 'Mildly elevated in SMA (<5× normal), markedly elevated in muscular dystrophies. Helps differentiate anterior horn cell from myopathic disease.', cost_inr: '₹300' },
        { tier: 1, name: 'GAA enzyme activity (DBS)', rationale: 'Simultaneous Pompe screen — critical because infantile Pompe can masquerade as SMA and has very different treatment (enzyme replacement vs gene therapy).', cost_inr: '₹2,500–4,000' },
        { tier: 2, name: 'Electromyography (EMG) + nerve conduction studies', rationale: 'Confirms anterior horn cell pattern vs myopathic pattern. Acute denervation with fibrillation potentials = SMA. Available at most tertiary centres.', cost_inr: '₹2,000–4,000' },
        { tier: 2, name: 'Echocardiogram', rationale: 'Screen for cardiomegaly (Pompe) and pulmonary hypertension. Determines respiratory management urgency.', cost_inr: '₹2,500' },
        { tier: 3, name: 'Neuromuscular gene panel (if SMN1 negative)', rationale: 'Covers BICD2, DYNC1H1, TRPV4 for atypical SMA. Also covers congenital myopathy genes (NEB, RYR1, TPM) if EMG shows myopathic pattern.', cost_inr: '₹15,000–25,000' },
      ],
      hpo_referral_summary: 'HP:0001290 Hypotonia (severe, onset 3M) · HP:0003560 Proximal muscle weakness (severe) · HP:0001265 Hyporeflexia (absent DTRs, all limbs) · HP:0002380 Fasciculations (tongue, at rest) · HP:0002093 Respiratory insufficiency (moderate, 8M) · Family: maternal uncle SMA phenotype, died age 3',
      specialist_type_recommended: 'Paediatric Neurologist with neuromuscular specialisation',
      referral_centers: ['AIIMS Delhi — Paediatric Neurology (SMA multidisciplinary clinic)', 'KEM Hospital Mumbai — Paediatric Neurology', 'NIMHANS Bangalore — Neuromuscular Disorders', 'PGIMER Chandigarh — Paediatric Neurology', 'CMC Vellore — Paediatric Neurology + Clinical Genetics'],
      runtime_seconds: 58,
      case_conference_narrative: 'This 8-month-old male infant presents with the classic SMA-II triad: progressive proximal hypotonia from 3 months, absent deep tendon reflexes, and tongue fasciculations pointing directly to anterior horn cell disease. The maternal uncle\'s death from identical disease at age 3 years after respiratory failure is consistent with SMN1-related SMA in an autosomal recessive pattern. The Neurogenetic specialist assigns 94% confidence to SMA type 2 (OMIM:253550). The Metabolic specialist raises Pompe disease (GAA deficiency) as a competing diagnosis — this is resolvable with concurrent SMN1 MLPA and GAA enzyme activity on a single blood spot. Immediate priorities: confirm SMN1 deletion, determine SMN2 copy number for nusinersen/risdiplam eligibility, and assess respiratory function urgently given intercostal involvement.',
    },
  },

  {
    id: 'wilsons',
    label: 'Delhi, 14M — Wilson\'s disease',
    patient_summary: '14M male, Delhi · Jaundice, KF rings, neuropsychiatric changes, low ceruloplasmin',
    true_diagnosis: "Wilson's disease",
    case_text: `14-year-old male from Delhi. 6 months of progressive jaundice, abdominal pain, and fatigue. On examination: jaundice (bilirubin 4.1 mg/dL total), hepatomegaly, mild ascites, spider naevi. Liver function: AST 380 U/L, ALT 290 U/L (AST:ALT ratio >1.3), direct bilirubin 3.2 mg/dL, albumin 2.8 g/dL. Slit-lamp examination: bilateral Kayser-Fleischer rings confirmed by ophthalmologist. Serum ceruloplasmin: 6 mg/dL (reference: 20–35 mg/dL). 24-hour urinary copper pending. Behavioural changes over past 3 months: aggressive outbursts, declining school performance (top student to failing), handwriting deterioration. Mild dysarthria on examination. No family history in parents; paternal grandfather reportedly had liver disease of unknown cause. No alcohol, no hepatotoxic drugs.`,
    result: {
      screener: {
        proceed_to_rare_workup: true,
        screener_note: 'Viral hepatitis (A, B, C, E) could explain liver disease but does NOT explain Kayser-Fleischer rings, neuropsychiatric features, or markedly suppressed ceruloplasmin (6 mg/dL). The triad of hepatic disease + KF rings + low ceruloplasmin is near-pathognomonic for Wilson\'s disease. Autoimmune hepatitis is in the differential for the liver disease but also cannot explain KF rings. Rare disease workup (ATP7B mutation) is indicated.',
        common_conditions_considered: ['Viral hepatitis (HBV, HCV, HEV)', 'Autoimmune hepatitis', 'Drug-induced liver injury', 'Alcoholic hepatitis (excluded by age)'],
      },
      hpo_terms: [
        { id: 'HP:0001396', name: 'Cholestasis', onset: '6 months', severity: 'moderate' },
        { id: 'HP:0000952', name: 'Jaundice', onset: '6 months', severity: 'moderate' },
        { id: 'HP:0007305', name: 'Kayser-Fleischer ring', onset: 'present', severity: 'present' },
        { id: 'HP:0001251', name: 'Ataxia', onset: 'recent', severity: 'mild' },
        { id: 'HP:0100543', name: 'Cognitive impairment', onset: '3 months', severity: 'mild-moderate' },
        { id: 'HP:0001260', name: 'Dysarthria', onset: 'recent', severity: 'mild' },
        { id: 'HP:0001876', name: 'Pancytopenia', onset: 'possible', severity: 'mild' },
      ],
      unified_differential: [
        {
          rank: 1,
          disease_name: "Wilson's disease",
          omim_id: '277900',
          orpha_code: '905',
          confidence: 'high',
          confidence_pct: 93,
          flagged_by: ['Metabolic'],
          supporting_features: [
            'Kayser-Fleischer rings (bilateral, confirmed by slit lamp) — pathognomonic with liver disease',
            'Serum ceruloplasmin 6 mg/dL — markedly suppressed (<20 mg/dL in 95% of Wilson\'s)',
            'Hepatic disease with AST:ALT >1 (unusual in viral hepatitis)',
            'Neuropsychiatric features: personality change, dysarthria, cognitive decline',
            'Age of onset 14 years (peak Wilson\'s presentation: 5–35 years)',
            'Albumin 2.8 — hepatic synthetic failure',
          ],
          non_matching_features: ['24-hour urinary copper pending — needed to confirm'],
          confirmatory_tests: [
            { test: '24-hour urinary copper excretion', yield_level: '>100 μg/24h diagnostic; >200 μg symptomatic Wilson\'s', cost_inr: '₹500–1,000', cost_tier: 'low' },
            { test: 'ATP7B gene sequencing (full gene)', yield_level: 'Identifies mutation in ~98% — guides family screening', cost_inr: '₹6,000–12,000', cost_tier: 'high' },
            { test: 'Liver biopsy with copper quantification', yield_level: '>250 μg/g dry weight diagnostic. Only if diagnosis uncertain.', cost_inr: '₹5,000–8,000', cost_tier: 'moderate' },
          ],
        },
        {
          rank: 2,
          disease_name: 'Autoimmune hepatitis type 1',
          omim_id: '608297',
          orpha_code: '2129',
          confidence: 'medium',
          confidence_pct: 48,
          flagged_by: ['Immunologic'],
          supporting_features: ['Liver disease with elevated transaminases', 'Low albumin', 'Age range consistent'],
          non_matching_features: ['KF rings not explained by AIH', 'Low ceruloplasmin not a feature of AIH', 'Neuropsychiatric features not from liver alone at this severity'],
          confirmatory_tests: [
            { test: 'ANA, ASMA (anti-smooth muscle Ab), anti-LKM1', yield_level: 'If positive, AIH likely; if negative, reduces probability', cost_inr: '₹2,000', cost_tier: 'low' },
            { test: 'Serum IgG', yield_level: 'Elevated in AIH', cost_inr: '₹800', cost_tier: 'low' },
          ],
        },
        {
          rank: 3,
          disease_name: 'Niemann-Pick disease type C',
          omim_id: '257220',
          orpha_code: '583',
          confidence: 'medium',
          confidence_pct: 31,
          flagged_by: ['Neurogenetic', 'Metabolic'],
          supporting_features: ['Adolescent-onset liver disease + neuropsychiatric features', 'Progressive liver disease with neurological deterioration', 'Autosomal recessive — consanguinity risk'],
          non_matching_features: ['No vertical supranuclear gaze palsy described', 'KF rings not a feature of NPC — highly specific for Wilson\'s', 'Ceruloplasmin normal in NPC'],
          confirmatory_tests: [
            { test: 'Filipin staining (skin fibroblast)', yield_level: 'Diagnoses NPC via cholesterol accumulation', cost_inr: '₹4,000–8,000', cost_tier: 'moderate' },
          ],
        },
        {
          rank: 4,
          disease_name: 'Alpha-1 antitrypsin deficiency',
          omim_id: '613490',
          orpha_code: '60',
          confidence: 'low',
          confidence_pct: 24,
          flagged_by: ['Metabolic'],
          supporting_features: ['Liver disease in adolescent', 'Autosomal recessive inheritance'],
          non_matching_features: ['No KF rings in A1AT deficiency', 'No ceruloplasmin abnormality', 'No neuropsychiatric features'],
          confirmatory_tests: [
            { test: 'Serum alpha-1 antitrypsin level + phenotyping (PiMM, PiZZ)', yield_level: 'Definitive', cost_inr: '₹1,500', cost_tier: 'low' },
          ],
        },
        {
          rank: 5,
          disease_name: 'Hereditary haemochromatosis',
          omim_id: '235200',
          orpha_code: '308',
          confidence: 'low',
          confidence_pct: 12,
          flagged_by: ['Metabolic'],
          supporting_features: ['Liver disease', 'Metabolic origin'],
          non_matching_features: ['KF rings are copper-specific, not iron', 'Neuropsychiatric at age 14 unusual for haemochromatosis', 'Ethnicity: far more common in Northern European'],
          confirmatory_tests: [
            { test: 'Serum ferritin + transferrin saturation', yield_level: 'Screen', cost_inr: '₹600', cost_tier: 'low' },
          ],
        },
      ],
      disagreements: [
        {
          disease: 'Niemann-Pick disease type C',
          flagged_by: ['Neurogenetic', 'Metabolic'],
          not_flagged_by: ['Immunologic'],
          reason: 'Both Neurogenetic and Metabolic flag NPC-C because adolescent hepatic + neuropsychiatric presentation overlaps with Wilson\'s. However, Metabolic notes that Kayser-Fleischer rings are copper-specific deposits in Descemet\'s membrane — they are not a feature of NPC-C, which involves cholesterol trafficking. KF rings in a context of low ceruloplasmin are essentially diagnostic of Wilson\'s disease and should resolve this disagreement clinically.',
          resolving_test: 'Kayser-Fleischer rings with ceruloplasmin <10 mg/dL + 24h urinary copper >100 μg/day is diagnostically definitive for Wilson\'s — no filipin staining needed unless Wilson\'s is excluded',
        },
      ],
      recommended_tests: [
        { tier: 1, name: '24-hour urinary copper excretion', rationale: 'Single most important confirmatory test. >100 μg/day diagnostic; >200 μg/day in symptomatic Wilson\'s. Cheap and available at any lab.', cost_inr: '₹500–1,000' },
        { tier: 1, name: 'Hepatitis A, B, C, E serology panel', rationale: 'Exclude viral hepatitis as concurrent cause. Required before starting chelation therapy.', cost_inr: '₹1,500–2,500' },
        { tier: 1, name: 'ANA, ASMA, anti-LKM1, IgG', rationale: 'Exclude autoimmune hepatitis which requires immunosuppression — contraindicated if Wilson\'s is primary.', cost_inr: '₹2,500' },
        { tier: 2, name: 'ATP7B gene sequencing (full gene + deletion/duplication analysis)', rationale: 'Confirms mutation for definitive diagnosis and sibling/parental screening. Available at CDFD Hyderabad.', cost_inr: '₹6,000–12,000' },
        { tier: 2, name: 'MRI brain (T2/FLAIR + susceptibility-weighted imaging)', rationale: 'Assess degree of neurological involvement — T2 hyperintensities in basal ganglia are characteristic of neurological Wilson\'s and guide treatment intensity.', cost_inr: '₹4,000–7,000' },
        { tier: 3, name: 'Liver biopsy with hepatic copper quantification', rationale: 'Only if diagnosis remains uncertain after urinary copper + ATP7B sequencing. >250 μg/g dry weight is diagnostic.', cost_inr: '₹5,000–8,000' },
      ],
      hpo_referral_summary: "HP:0007305 Kayser-Fleischer ring (bilateral, confirmed) · HP:0000952 Jaundice (moderate, 6M duration) · HP:0001396 Cholestasis (moderate) · HP:0001251 Ataxia (mild, recent onset) · HP:0100543 Cognitive impairment (moderate, declining school performance) · HP:0001260 Dysarthria (mild) · Ceruloplasmin 6 mg/dL (markedly suppressed)",
      specialist_type_recommended: 'Hepatologist with Wilson\'s disease expertise + Paediatric Neurologist',
      referral_centers: ['AIIMS Delhi — Hepatology + Medical Genetics', 'PGIMER Chandigarh — Hepatology', 'KEM Hospital Mumbai — Hepatology (liver transplant centre if fulminant)', 'CDFD Hyderabad — ATP7B molecular diagnosis', 'CMC Vellore — Clinical Genetics'],
      runtime_seconds: 54,
      case_conference_narrative: "This 14-year-old male has the classic triad of Wilson's disease: Kayser-Fleischer rings (copper deposition in Descemet's membrane, pathognomonic), markedly suppressed serum ceruloplasmin (6 mg/dL), and combined hepatic + neuropsychiatric disease. The Metabolic specialist assigns 93% confidence to Wilson's disease (OMIM:277900). Both Neurogenetic and Metabolic flag Niemann-Pick type C as an alternative, but the specialist council notes that KF rings do not occur in NPC, making Wilson's the commanding diagnosis. Immediate treatment (D-penicillamine or trientine chelation) should not await genetic confirmation — initiate based on clinical triad + urinary copper >100 μg/day. ATP7B sequencing should be ordered for family screening. Orthotopic liver transplantation is a consideration if fulminant hepatic failure supervenes.",
    },
  },

  {
    id: 'was',
    label: 'Chennai, 14M infant — Wiskott-Aldrich',
    patient_summary: '14M male infant, Chennai · Eczema + recurrent infections + thrombocytopenia + small platelets',
    true_diagnosis: 'Wiskott-Aldrich Syndrome',
    case_text: `14-month-old male infant from Chennai. Recurrent otitis media since age 3 months — 7 episodes total, requiring multiple antibiotic courses. Two episodes of pneumococcal pneumonia requiring hospitalisation (age 8M and 12M). One episode of bacterial meningitis (S. pneumoniae, age 11M). Persistent eczema since age 2 months — severe, not responding to topical steroids or emollients. Thrombocytopenia on all blood counts: current platelets 38,000/μL (range 25,000–55,000 across visits). Mean platelet volume (MPV) 6.0 fL (low — normal >7.5 fL), characteristically small platelets on peripheral smear. Immunoglobulins: IgM markedly low (12 mg/dL, reference 50–200), IgA elevated (340 mg/dL), IgE markedly elevated (2,400 IU/mL). Family history: maternal uncle had recurrent infections from infancy and died in childhood. Maternal grandfather: reportedly had bleeding tendency. No consanguinity. Male-to-male transmission absent in family.`,
    result: {
      screener: {
        proceed_to_rare_workup: true,
        screener_note: 'The triad of eczema + thrombocytopenia with small platelets + recurrent bacterial infections in a male infant with X-linked family history is the pathognomonic presentation of Wiskott-Aldrich Syndrome. No common immunodeficiency explains this exact combination. IgM suppression with IgA/IgE elevation is the classic WAS immunoglobulin pattern. This is not common variable immunodeficiency (CVID) — onset is too early and thrombocytopenia is not a CVID feature.',
        common_conditions_considered: ['Idiopathic thrombocytopenic purpura (ITP)', 'Atopic dermatitis + coincidental thrombocytopenia', 'Common variable immunodeficiency (CVID)'],
      },
      hpo_terms: [
        { id: 'HP:0001888', name: 'Lymphopenia', onset: 'presumed', severity: 'moderate' },
        { id: 'HP:0001903', name: 'Thrombocytopenia', onset: '3 months', severity: 'moderate' },
        { id: 'HP:0001882', name: 'Leukopenia', onset: 'unknown', severity: 'mild' },
        { id: 'HP:0000964', name: 'Eczema', onset: '2 months', severity: 'severe' },
        { id: 'HP:0002719', name: 'Recurrent infections', onset: '3 months', severity: 'severe' },
        { id: 'HP:0004313', name: 'Decreased antibody level', onset: 'present', severity: 'moderate' },
      ],
      unified_differential: [
        {
          rank: 1,
          disease_name: 'Wiskott-Aldrich Syndrome',
          omim_id: '301000',
          orpha_code: '906',
          confidence: 'high',
          confidence_pct: 91,
          flagged_by: ['Immunologic'],
          supporting_features: [
            'Classic triad: eczema + thrombocytopenia + recurrent infections',
            'Small platelets (low MPV 6.0 fL) — pathognomonic for WAS',
            'Low IgM, high IgA and IgE — classic WAS immunoglobulin pattern',
            'X-linked inheritance (maternal uncle, maternal grandfather affected)',
            'Recurrent encapsulated bacterial infections (pneumococcus)',
            'Onset in infancy with progression',
          ],
          non_matching_features: ['WASp protein expression not yet measured'],
          confirmatory_tests: [
            { test: 'WASp protein expression (flow cytometry on lymphocytes)', yield_level: 'Absent/reduced in WAS — fastest diagnostic test', cost_inr: '₹3,000–5,000', cost_tier: 'moderate' },
            { test: 'WAS gene sequencing', yield_level: 'Definitive — identifies mutation class for prognosis', cost_inr: '₹5,000–10,000', cost_tier: 'moderate' },
          ],
        },
        {
          rank: 2,
          disease_name: 'Hyper-IgM syndrome type 1 (CD40L deficiency)',
          omim_id: '308230',
          orpha_code: '183660',
          confidence: 'medium',
          confidence_pct: 38,
          flagged_by: ['Immunologic'],
          supporting_features: ['Recurrent bacterial infections', 'Low IgG', 'X-linked family history'],
          non_matching_features: ['Eczema is not a feature of Hyper-IgM', 'Thrombocytopenia with small platelets is specific to WAS', 'IgM is low here — Hyper-IgM has elevated IgM by definition'],
          confirmatory_tests: [
            { test: 'CD40L expression on activated T cells (flow cytometry)', yield_level: 'Absent in CD40L deficiency', cost_inr: '₹3,000', cost_tier: 'moderate' },
          ],
        },
        {
          rank: 3,
          disease_name: 'Chronic granulomatous disease',
          omim_id: '306400',
          orpha_code: '379',
          confidence: 'low',
          confidence_pct: 25,
          flagged_by: ['Immunologic'],
          supporting_features: ['Recurrent bacterial infections', 'X-linked inheritance possible', 'Male patient'],
          non_matching_features: ['CGD causes catalase-positive bacterial/fungal infections, not predominantly S. pneumoniae', 'Eczema and thrombocytopenia not typical of CGD'],
          confirmatory_tests: [
            { test: 'Dihydrorhodamine (DHR) oxidative burst assay (flow cytometry)', yield_level: 'Absent/reduced oxidative burst in CGD', cost_inr: '₹2,000–4,000', cost_tier: 'moderate' },
          ],
        },
        {
          rank: 4,
          disease_name: 'RAG1/RAG2 deficiency (Omenn syndrome)',
          omim_id: '603554',
          orpha_code: '93560',
          confidence: 'low',
          confidence_pct: 18,
          flagged_by: ['Immunologic'],
          supporting_features: ['Eczematous rash', 'Recurrent infections', 'Immunoglobulin abnormalities'],
          non_matching_features: ['Omenn syndrome typically more severe and presents earlier', 'Small platelets very specific for WAS', 'No erythroderma described'],
          confirmatory_tests: [
            { test: 'T cell receptor Vβ repertoire analysis', yield_level: 'Oligoclonal expansion in Omenn', cost_inr: '₹5,000', cost_tier: 'moderate' },
          ],
        },
        {
          rank: 5,
          disease_name: 'X-linked thrombocytopenia (XLT, mild WAS)',
          omim_id: '313900',
          orpha_code: '86864',
          confidence: 'low',
          confidence_pct: 12,
          flagged_by: ['Immunologic'],
          supporting_features: ['Thrombocytopenia with small platelets', 'X-linked', 'Same gene (WAS) as WAS syndrome — milder mutation'],
          non_matching_features: ['Infections and eczema are more severe here than typical XLT', 'Family history of death argues for classic WAS severity'],
          confirmatory_tests: [
            { test: 'WAS gene sequencing — mutation type determines XLT vs WAS', yield_level: 'Null mutations = WAS; missense = XLT', cost_inr: '₹5,000', cost_tier: 'moderate' },
          ],
        },
      ],
      disagreements: [
        {
          disease: 'Hyper-IgM syndrome type 1',
          flagged_by: ['Immunologic'],
          not_flagged_by: ['Neurogenetic', 'Metabolic'],
          reason: 'Immunologic specialist initially considered Hyper-IgM given X-linked recurrent bacterial infections. However, low IgM (12 mg/dL) in this case directly contradicts the Hyper-IgM phenotype (which by definition has elevated IgM). Additionally, eczema and platelet microthrombus (small MPV) are WAS-specific. The immunologist resolves this internally as WAS being the primary diagnosis.',
          resolving_test: 'WASp protein expression by flow cytometry — if absent, confirms WAS and excludes CD40L deficiency simultaneously',
        },
      ],
      recommended_tests: [
        { tier: 1, name: 'WASp protein expression (flow cytometry on PBMCs)', rationale: 'Fastest diagnostic test for WAS. Absent or reduced WASp expression is confirmatory. Available at major immunology centres.', cost_inr: '₹3,000–5,000' },
        { tier: 1, name: 'Complete blood count with MPV and peripheral smear', rationale: 'Confirm thrombocytopenia and characteristically small platelets (MPV <7.5 fL). Small platelet size is the key differentiator from ITP.', cost_inr: '₹500' },
        { tier: 1, name: 'Immunoglobulins (IgG, IgA, IgM, IgE)', rationale: 'WAS pattern: low IgM, elevated IgA and IgE. Confirms immunological phenotype and guides IVIG replacement decision.', cost_inr: '₹1,500' },
        { tier: 2, name: 'WAS gene sequencing', rationale: 'Identifies specific mutation — determines prognosis (null = severe WAS, missense = XLT) and guides HSCT candidacy discussion.', cost_inr: '₹5,000–10,000' },
        { tier: 2, name: 'Lymphocyte subsets (CD3, CD4, CD8, CD19, NK)', rationale: 'Baseline immune assessment. Progressive T cell lymphopenia in WAS predicts worse outcomes and influences HSCT timing.', cost_inr: '₹2,500' },
        { tier: 3, name: 'HLA typing (patient + siblings/parents)', rationale: 'Required urgently if HSCT is considered — matched sibling donor or MUD search. Begin now, before age 5 (optimal HSCT window).', cost_inr: '₹8,000–15,000' },
      ],
      hpo_referral_summary: 'HP:0000964 Eczema (severe, onset 2M, treatment-resistant) · HP:0001903 Thrombocytopenia (moderate, platelet 38k, small MPV 6.0 fL) · HP:0002719 Recurrent infections (severe: 7 OM episodes, 2 pneumonias, 1 meningitis) · HP:0004313 Decreased IgM (12 mg/dL) with elevated IgA/IgE · X-linked family history (maternal uncle and grandfather)',
      specialist_type_recommended: 'Paediatric Immunologist (Primary Immunodeficiency specialist) — urgently for HSCT evaluation',
      referral_centers: ['AIIMS Delhi — Paediatric Immunology (Dr. Nidhi Raizada, PIDNET centre)', 'CMC Vellore — Clinical Immunology (HSCT programme)', 'Tata Memorial Hospital Mumbai — Bone marrow transplant', 'PGIMER Chandigarh — Paediatric Immunology', 'JIPMER Puducherry — Paediatric Immunology'],
      runtime_seconds: 62,
      case_conference_narrative: 'This 14-month-old male presents with the pathognomonic triad of Wiskott-Aldrich Syndrome: severe treatment-resistant eczema, thrombocytopenia with characteristically small platelets (MPV 6.0 fL), and recurrent encapsulated bacterial infections including two pneumococcal pneumonias and meningitis. The X-linked inheritance pattern (maternal uncle death in childhood) and the specific immunoglobulin signature (low IgM, high IgA/IgE) are confirmatory. The Immunologic specialist assigns 91% confidence to WAS (OMIM:301000). The only therapeutic disagreement is HSCT timing — this should be determined urgently at a PID centre with HLA typing initiated now. Without HSCT, WAS carries a median survival of ~15 years with mounting infection and bleeding risks.',
    },
  },

  {
    id: 'dmd',
    label: 'Mumbai, 6M boy — Duchenne MD',
    patient_summary: '6M boy, Mumbai · Gait difficulty, calf pseudohypertrophy, CK 12,400, Gower\'s sign',
    true_diagnosis: 'Duchenne Muscular Dystrophy',
    case_text: `6-year-old boy from Mumbai. Parents first noticed walking difficulty at age 4 years — initially subtle, now clearly abnormal gait. Frequent falls (4–5 times per day). Cannot run. Difficulty rising from floor — positive Gower's sign. Cannot climb stairs without rail support. On examination: waddling gait, bilateral calf pseudohypertrophy (firm, non-tender, enlarged calves), positive Gower's sign, hip girdle weakness, lumbar hyperlordosis. Sensation intact. Cognition: normal school performance for grade 1. CK: 12,400 IU/L (reference <200 IU/L — elevated 62×). ALT 89 U/L, AST 95 U/L (elevated due to muscle isoenzymes, not hepatic). Family history: mother's brother had progressive muscle weakness from childhood and died at age 25. Maternal grandmother unaffected. No consanguinity. Treated for 8 months with iron, vitamin D, and physiotherapy for "nutritional deficiency" — no improvement; CK persistently elevated.`,
    result: {
      screener: {
        proceed_to_rare_workup: true,
        screener_note: 'Nutritional deficiency (iron, vitamin D) does not cause CK elevation of 12,400 IU/L (62× upper limit of normal) or calf pseudohypertrophy. These findings are pathognomonic for a primary muscular dystrophy. The X-linked inheritance pattern (maternal uncle death at 25) with onset of weakness at age 4 and CK >10,000 in a male is the classic presentation of Duchenne Muscular Dystrophy. Immediate rare disease workup is mandatory.',
        common_conditions_considered: ['Nutritional deficiency (iron, vitamin D, protein-energy)', 'Cerebral palsy (non-progressive — excluded by progression)', 'Inflammatory myopathy (JDM)'],
      },
      hpo_terms: [
        { id: 'HP:0003236', name: 'Elevated CK', onset: '4 years', severity: 'severe (62×)' },
        { id: 'HP:0003712', name: 'Calf muscle pseudohypertrophy', onset: '4-5 years', severity: 'moderate' },
        { id: 'HP:0002486', name: 'Myotonia', onset: 'N/A', severity: 'absent' },
        { id: 'HP:0001763', name: 'Pes planus', onset: 'possible', severity: 'mild' },
        { id: 'HP:0003560', name: 'Muscular dystrophy', onset: '4 years', severity: 'moderate' },
        { id: 'HP:0003552', name: 'Muscle stiffness', onset: 'N/A', severity: 'absent' },
        { id: 'HP:0002093', name: 'Respiratory insufficiency', onset: 'not yet', severity: 'absent currently' },
      ],
      unified_differential: [
        {
          rank: 1,
          disease_name: 'Duchenne Muscular Dystrophy',
          omim_id: '310200',
          orpha_code: '98896',
          confidence: 'high',
          confidence_pct: 96,
          flagged_by: ['Neurogenetic'],
          supporting_features: [
            'CK 12,400 IU/L (62× ULN) — hallmark of DMD/BMD',
            'Calf pseudohypertrophy (fibrofatty replacement of muscle)',
            'Positive Gower\'s sign (hip girdle weakness)',
            'Onset of difficulty at age 4 years (DMD: 2–5 years)',
            'X-linked family history (maternal uncle progressive MD, died age 25)',
            'Male patient',
            'Waddling gait + lumbar hyperlordosis',
          ],
          non_matching_features: ['Dystrophin gene deletion not yet confirmed', 'Cognition normal (DMD can have cognitive involvement — IQ ~1 SD below mean)'],
          confirmatory_tests: [
            { test: 'DMD gene deletion/duplication analysis (MLPA, exons 1–79)', yield_level: 'Detects 70% of DMD mutations (large deletions/duplications)', cost_inr: '₹4,000–8,000', cost_tier: 'moderate' },
            { test: 'DMD gene sequencing (full gene, if MLPA negative)', yield_level: 'Detects remaining 30% (point mutations, small indels)', cost_inr: '₹10,000–18,000', cost_tier: 'high' },
            { test: 'Muscle biopsy with dystrophin immunostaining', yield_level: 'Absent dystrophin = DMD; reduced = BMD. Only if genetic testing inconclusive.', cost_inr: '₹6,000–10,000', cost_tier: 'moderate' },
          ],
        },
        {
          rank: 2,
          disease_name: 'Becker Muscular Dystrophy',
          omim_id: '300376',
          orpha_code: '98895',
          confidence: 'medium',
          confidence_pct: 65,
          flagged_by: ['Neurogenetic'],
          supporting_features: ['CK dramatically elevated', 'Calf pseudohypertrophy', 'X-linked inheritance', 'Progressive proximal weakness'],
          non_matching_features: ['BMD onset typically later (5–15 years) and milder', 'Uncle died at 25 — suggests DMD severity rather than BMD (typically survives to 40s+)', 'Disease severity at age 6 years consistent with DMD not BMD'],
          confirmatory_tests: [
            { test: 'In-frame vs out-of-frame deletion analysis', yield_level: 'Out-of-frame = DMD; in-frame = BMD (Monaco rule)', cost_inr: 'Determined from MLPA result', cost_tier: 'low' },
          ],
        },
        {
          rank: 3,
          disease_name: 'LGMD type 2D (alpha-sarcoglycanopathy)',
          omim_id: '254110',
          orpha_code: '79388',
          confidence: 'low',
          confidence_pct: 32,
          flagged_by: ['Neurogenetic'],
          supporting_features: ['CK elevation', 'Proximal weakness', 'Progressive course'],
          non_matching_features: ['Autosomal recessive — maternal uncle-to-nephew X-linked pattern argues against LGMD', 'Calf pseudohypertrophy less prominent in LGMD', 'CK 12,400 is in DMD range, higher than most LGMD'],
          confirmatory_tests: [
            { test: 'Sarcoglycan immunostaining on muscle biopsy', yield_level: 'Absent sarcoglycan = LGMD2D', cost_inr: '₹6,000', cost_tier: 'moderate' },
          ],
        },
        {
          rank: 4,
          disease_name: 'Emery-Dreifuss Muscular Dystrophy (X-linked)',
          omim_id: '310300',
          orpha_code: '98853',
          confidence: 'low',
          confidence_pct: 18,
          flagged_by: ['Neurogenetic'],
          supporting_features: ['X-linked', 'Progressive muscle weakness', 'Early childhood onset'],
          non_matching_features: ['EDMD hallmark is contractures + cardiac conduction defects — neither described', 'CK in EDMD is mildly elevated (rarely >5,000)'],
          confirmatory_tests: [
            { test: 'Emerin immunostaining (EDMD1) or LMNA sequencing (EDMD2)', yield_level: 'Only if DMD excluded', cost_inr: '₹3,000', cost_tier: 'low' },
          ],
        },
        {
          rank: 5,
          disease_name: 'Juvenile dermatomyositis',
          omim_id: '710800',
          orpha_code: '93672',
          confidence: 'low',
          confidence_pct: 12,
          flagged_by: ['Immunologic'],
          supporting_features: ['Elevated CK', 'Proximal muscle weakness', 'Childhood onset'],
          non_matching_features: ['No rash (heliotrope, Gottron\'s papules)', 'No periorbital oedema', 'Family history argues for inherited disease', 'Pseudohypertrophy not a JDM feature'],
          confirmatory_tests: [
            { test: 'Myositis-specific antibodies (Mi-2, Jo-1, MDA5 panel)', yield_level: 'If positive suggests JDM', cost_inr: '₹3,000', cost_tier: 'moderate' },
          ],
        },
      ],
      disagreements: [
        {
          disease: 'Juvenile dermatomyositis',
          flagged_by: ['Immunologic'],
          not_flagged_by: ['Neurogenetic', 'Metabolic'],
          reason: 'Immunologic specialist flags JDM because CK elevation in inflammatory myopathy can reach 10,000+ IU/L. Neurogenetic specialist strongly disagrees: the combination of pseudohypertrophy (fibrofatty replacement causing calf enlargement, NOT inflammation), X-linked family history, male sex, and Gower\'s sign from age 4 is diagnostic for dystrophinopathy. JDM does not cause pseudohypertrophy. DMD MLPA should be ordered first, making JDM workup unnecessary if DMD mutation is confirmed.',
          resolving_test: 'DMD gene deletion/duplication MLPA — if deletion confirmed, JDM is excluded; if negative, add myositis antibody panel',
        },
      ],
      recommended_tests: [
        { tier: 1, name: 'DMD gene deletion/duplication analysis (MLPA, all 79 exons)', rationale: 'Detects ~70% of DMD mutations. Determines reading frame (in-frame = BMD; out-of-frame = DMD). Required for exon-skipping therapy eligibility (ataluren, eteplirsen, golodirsen).', cost_inr: '₹4,000–8,000' },
        { tier: 1, name: 'Echocardiogram + ECG', rationale: 'DMD cardiomyopathy begins before symptoms (~10 years). Baseline at diagnosis is mandatory. ACE inhibitor/eplerenone started prophylactically once dilated CM detected.', cost_inr: '₹2,500' },
        { tier: 1, name: 'Pulmonary function tests (FVC, FEV1)', rationale: 'Baseline respiratory function. DMD: FVC declines after ambulation loss (~12–15 years). Ventilatory support planning begins now.', cost_inr: '₹1,000' },
        { tier: 2, name: 'DMD full gene sequencing (if MLPA negative)', rationale: 'Point mutations/small indels in 30% of DMD. Same result interpretation: reading frame predicts severity.', cost_inr: '₹10,000–18,000' },
        { tier: 2, name: 'Bone density DEXA scan', rationale: 'Corticosteroids (deflazacort/prednisolone — standard DMD treatment) cause osteoporosis. Baseline before starting steroids.', cost_inr: '₹1,500–2,000' },
        { tier: 3, name: 'MRI muscle (lower limb, Dixon sequence)', rationale: 'Maps fatty infiltration pattern. Useful for tracking progression and selecting biopsy site if needed. Research centres.', cost_inr: '₹6,000–10,000' },
      ],
      hpo_referral_summary: "HP:0003236 Elevated CK (12,400 IU/L, 62× ULN) · HP:0003712 Calf pseudohypertrophy (bilateral, firm) · HP:0003560 Proximal muscular dystrophy (onset 4 years) · HP:0002540 Inability to walk (not yet, but Gower's sign present) · HP:0002093 Respiratory insufficiency (absent currently, monitor) · X-linked family history: maternal uncle DMD, died age 25",
      specialist_type_recommended: 'Paediatric Neurologist (Neuromuscular) + Physiotherapist + Cardiologist (MDT)',
      referral_centers: ['AIIMS Delhi — Paediatric Neurology (DMD multidisciplinary clinic)', 'KEM Hospital Mumbai — Paediatric Neurology + Cardiac', 'NIMHANS Bangalore — Neuromuscular Disorders', 'PGIMER Chandigarh — Paediatric Neurology', 'Parent Project India (NGO) — Support + trial access'],
      runtime_seconds: 51,
      case_conference_narrative: "This 6-year-old boy has an unambiguous clinical presentation of Duchenne Muscular Dystrophy: CK elevated 62× above normal, calf pseudohypertrophy, Gower's sign, waddling gait, and X-linked family history (maternal uncle died of progressive muscle disease at age 25). The Neurogenetic specialist assigns 96% confidence to DMD (OMIM:310200). The 8-month treatment with nutritional supplements represented a critical delay — DMD window for optimal corticosteroid initiation is 4–7 years during ambulatory phase. DMD MLPA should be ordered urgently to confirm deletion type and exon-skipping eligibility. Deflazacort should be initiated as soon as diagnosis is genetically confirmed, alongside echocardiogram and physiotherapy assessment.",
    },
  },
]

export function getCaseById(id: string): DemoCase | undefined {
  return DEMO_CASES.find(c => c.id === id)
}

export const DEFAULT_CASE_ID = 'gaucher'
