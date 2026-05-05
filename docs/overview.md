# Nidaan — Product Overview

## One-sentence pitch

**Nidaan is a multi-agent clinical decision support system that helps first-line Indian physicians consider rare diseases earlier in the diagnostic process by running a specialist case conference in under 90 seconds.**

---

## The problem

### The numbers
- **96 million Indians** live with a rare disease
- Average **diagnostic odyssey: 4–6 years**
- **30% of affected children die before age 5**, many before diagnosis
- India has **4,600+ endogamous population groups** — high consanguinity rates amplify recessive rare diseases
- Only **~50 genetic counsellors** in the entire country

### Where the bottleneck actually is
The diagnostic delay does not primarily happen because genetic testing is unavailable. It happens because **the first-line doctor does not recognize the rare disease pattern early enough to order the right test or make the right referral.**

The patient sees a GP. GP treats for malaria. GP treats for kala-azar. Symptoms persist. Patient goes to another GP. Cycle repeats. By the time a geneticist sees the patient, 4 years have passed.

The bottleneck is **pattern recognition at the first visit** — not testing capability.

### Why existing tools don't solve this
- **Face2Gene, DeepRare, RareAgents** — research benchmarks, Western/Chinese cohorts, not deployment-ready for Indian first-line clinicians
- **OMIM, Orphanet** — require rare disease expertise to query; not usable during a 10-minute consult
- **Specialist referral** — KEM Hospital geneticist waitlist is 6 weeks; the nearest specialist may be 4 hours away

---

## The user

**Dr. Priya Sharma** — 34, MBBS + MD Pediatrics, runs a clinic in Nashik. Sees ~30 patients/day.

She has a patient: Aarav, 4 years old. Seizures + developmental delay + recurrent infections + failure to thrive. She suspects "something genetic" but she is not a geneticist. The nearest pediatric geneticist is at KEM Hospital Mumbai — 4 hours, 6-week waitlist.

She has **10 minutes** to decide what to do next.

**What she needs from Nidaan:**
1. Type/paste the case in her own words
2. Get a structured case conference report in under 90 seconds
3. Use it to order the right next tests, write a smart referral, and know what to tell the family

**What she does NOT need:**
- Plain-language patient-facing explanations
- "This is not a diagnosis" guardrails
- Voice input or app installs
- Perfect coverage of all 7,000 rare diseases

---

## Why clinician-facing is the right positioning

1. **Defensible accuracy claims.** Clinicians interpret probabilistic output. No need to dumb down or over-disclaim.
2. **The odyssey starts at the GP.** Fix pattern recognition at step 1, not step 10.
3. **Real deployment path.** "Dr. Priya types into a webapp during a consult" — adoption is just usefulness. No regulatory approval, no app distribution.

---

## What Nidaan is NOT

- Not a diagnosis tool — it produces a **ranked differential with evidence**
- Not a replacement for a geneticist — it helps the GP decide **when and how to refer**
- Not a patient tool — the user is always the clinician
- Not a general rare disease encyclopedia — it covers **3 categories deeply**: metabolic, neurogenetic, immunologic

---

## Indian epidemiology priors (baked into agent design)

| Category | % of Indian rare disease burden | Key diseases |
|---|---|---|
| Neuromuscular/Neurodevelopmental | 48.9% | Duchenne (32.9%), trinucleotide repeats (27.3%), SMA (15.9%) |
| Inborn Errors of Metabolism | 15.4% | Gaucher #1 IEM (11.2% of IEM cases), lysosomal storage disorders |
| Primary Immunodeficiencies | ~8% | Combined immunodeficiencies, complement deficiencies |

Sources: CDFD study, 22-year tertiary centre IEM study, Indian rare disease prevalence data.
