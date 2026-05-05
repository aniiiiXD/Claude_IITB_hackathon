# Risks, harms, and ethical alignment

Nidaan touches three things that don't tolerate sloppiness: a vulnerable
patient population, a clinician's diagnostic judgement, and a public funding
scheme. This document is our honest accounting of what could go wrong, what
we've designed against, and what we have not solved yet.

---

## What could go wrong — failure modes and mitigations

We sorted failure modes by **who gets hurt** (patient, doctor, system) and how
recoverable the harm is. The first three are the ones we lose sleep over.

### 1. False confidence in a wrong diagnosis (patient harm — high)

**The failure:** The synthesizer returns "Gaucher disease — 98% confidence."
The GP, busy and undertrained on rare diseases, treats it as ground truth and
refers the family for ERT before the enzyme assay returns. The AI was wrong.
The family burns through ₹50 lakh of NPRD funding on the wrong drug.

**What we've designed against it:**
- The output is a **ranked differential with evidence**, not a diagnosis.
  Confidence scores are paired with the **specific tool calls** (HPO terms,
  MedGen IDs, PubMed citations) that produced them.
- The synthesizer surfaces a **disagreement view** — where the three
  specialists disagreed and why. Hidden disagreement would be the easiest
  way to launder false confidence; we make it the headline.
- The recommended action is always **a confirmatory test, not a treatment**.
  The β-glucocerebrosidase enzyme assay (₹2,500) sits between the AI's guess
  and any drug order. The system never asks the GP to skip it.
- The CoE specialist signs every NPRD application — the AI drafts, the
  human commits.

**What we have not solved:** A truly overconfident output combined with a
truly time-pressed GP can still bypass the test step. The structural fix is
to require the test result before the report unlocks the "refer for ERT"
button — that's a v2 change.

### 2. False negative — AI rules out rare disease, GP stops looking (patient harm — high)

**The failure:** Common-disease screener (Layer 1) labels the case as
"likely malaria, no rare-disease workup needed." GP discharges. Patient
dies of an undiagnosed treatable condition.

**What we've designed against it:**
- The screener does not have authority to **end** the pipeline. It can flag
  high prior probability of common disease but specialists still run.
- The screener's output is shown to the GP as a **caveat**, not a
  conclusion: "Consider ruling out malaria first; if febrile workup is
  negative, the differential below is what matters."
- Indian endemic-disease overlap is a known failure mode in the literature
  (the 12-year-old Gaucher case, malaria-endemic India, where a positive
  malaria test "explained" the splenomegaly for years). We list it
  explicitly in the screener's system prompt as an anti-pattern.

**What we have not solved:** The screener is a Haiku model and will be
wrong sometimes. Our protection is a deliberately wide differential window
(top-5 with evidence, not top-1), and the disagreement view.

### 3. Hallucinated diseases or made-up genes (system credibility — high)

**The failure:** A specialist agent invents a disease or cites a paper that
doesn't exist. The GP, trusting the citation format, doesn't verify.

**What we've designed against it:**
- **Every disease claim must carry an OMIM/Orphanet/MedGen ID returned from
  a tool call.** If the agent didn't call the tool, the claim doesn't ship.
- HPO term mapping is hard-coded against the live HPO API — no
  free-form symptom invention.
- The OMIM API is **not scraped** (their ToS forbids it); we use NCBI MedGen
  as the canonical alternative and Wikipedia REST as a fallback. Both are
  first-party, key-free, and traceable.
- A hardcoded stub serves as last-resort offline mode for demo continuity —
  but it's flagged in the response so reviewers can see when it kicked in.

### 4. Patient sees the AI report directly and panics

**The failure:** A confirmation email leaks the synthesizer's raw output to
the patient ("Gaucher disease — 98% confidence") before the GP has reviewed.

**What we've designed against it:**
- **The patient never sees raw AI output.** The patient dashboard shows
  status updates ("Doctor is reviewing your case", "Six specialists are
  analysing — this takes about 5 minutes") and the **doctor-confirmed**
  diagnosis with the doctor's note attached.
- The handoff between AI report and patient view is gated by an explicit
  "Confirm Diagnosis" action by the GP, with an audit log.

### 5. NPRD application autodraft contains errors

**The failure:** Auto-drafted NPRD application includes a hallucinated
clinical detail. MoHFW reviewer flags it. Family is disqualified or, worse,
flagged for fraud.

**What we've designed against it:**
- The autodraft fills only **structured fields** from the case record:
  patient demographics, confirmed enzyme/genetic test result with lab
  reference number, CoE registration, prescribing specialist's MCI number.
- The narrative section is left for the CoE specialist to write — the AI
  does not pretend to be a clinician filling out government forms.
- The CoE specialist signs and submits. The AI's role ends at "draft
  ready for review."

### 6. Re-identification of rare-disease patients in research queries

**The failure:** A researcher queries "GBA Gaucher cases in Mizoram." The
answer is "1 case." The patient's identity is now effectively public to
anyone with regional context.

**What we've designed against it:**
- **Minimum cohort floor.** Queries returning fewer than N patients (we use
  N=5 as a starting threshold; the right number depends on the disease and
  the geography and is a real privacy-engineering question) return
  "insufficient cohort" instead of a count.
- Researcher access requires admin approval through `/admin/requests`,
  with the researcher's affiliation, ethics-board approval number, and
  the specific question they're answering on file.
- Geography is bucketed at state level by default. Sub-state queries
  (district, PIN code) are a separate request tier.
- Patient consent is required for inclusion in any researchable cohort.

**What we have not solved:** Differential privacy is not yet implemented;
the cohort floor is a blunt instrument. For a v2, query-level epsilon
budgets are the right shape.

### 7. Dataset bias toward Western/Chinese cohorts

**The failure:** The medical literature the agents draw from
(HPO, OMIM, PubMed) is dominated by Western and Chinese patient cohorts.
Indian patients have different consanguinity patterns, endemic-disease
overlap, and founder mutations (e.g., L444P GBA in some communities).
The AI's priors don't match Indian reality.

**What we've designed against it:**
- The system prompt for each specialist agent **explicitly anchors on the
  Indian rare-disease prevalence distribution** — 48.9% neuromuscular/
  neurodevelopmental, 15.4% inborn errors of metabolism, ~8% primary
  immunodeficiencies — sourced from the CDFD study and Indian tertiary
  centre IEM data.
- The common-disease screener weights for Indian endemic disease (malaria,
  TB, kala-azar, dengue) — the diseases that are repeatedly cited as the
  thing rare disease was misdiagnosed as in the real cases we read.

**What we have not solved:** The underlying medical databases are still
biased. The right fix is to feed Indian rare-disease registry data
(GenomeIndia, ORDI consortium) into the prompts as context — that's a
data-partnership conversation, not a code change.

### 8. Privacy / data breach

**The failure:** A breach exposes clinical notes from thousands of rare-disease
patients — a tiny, identifiable population.

**What we've designed against it:**
- Clinical notes are stored in Neon Postgres (managed, encrypted at rest,
  TLS in transit). The minimum-cohort floor extends to admin and government
  views.
- Anthropic API calls do not retain prompts under the default API
  policy (no fine-tuning use, no training).
- Role-based access in the auth layer; each role sees only the data it
  needs (`/government/dashboard` sees aggregates only, never identifying
  records).

**What we have not solved:** Consent revocation isn't fully built —
a patient who withdraws consent today has their case removed from
researcher cohorts, but historical aggregates can't be retroactively
recomputed without re-running the pipeline. That's a v2 task.

### 9. Deskilling — clinicians stop learning

**The failure:** Over time, GPs lean on the AI's differential and stop
building rare-disease pattern-recognition themselves.

**What we've designed against it:**
- The output **explains its reasoning** — every disease comes with the
  HPO terms that triggered it and the citations behind it. The intent is
  to make the GP a better diagnostician over time, not just to hand them
  an answer.
- The disagreement view is a **teaching surface**: "the metabolic agent
  said X, the immunologic agent said Y, here's the test that resolves it"
  is exactly the case-conference reasoning that medical residents learn
  from.

### 10. Liability — who is responsible when the AI is wrong?

**The failure:** A patient is harmed. The family sues. The GP says "the AI
told me it was Gaucher." The AI vendor says "this is decision support, not
diagnosis."

**What we've not solved, but the framing matters:**
- Indian medical liability law does not yet have a clear position on AI
  decision support. We position Nidaan as a **clinical decision support
  tool**, not a diagnostic device — the same legal posture as UpToDate or
  BMJ Best Practice. The doctor remains the decision-maker.
- The audit log preserves every input, every tool call, every output, and
  every clinician edit, so that any retrospective review has the full
  trace.
- We are not, at this stage, the right organisation to define the
  liability standard. We track the *Master Arnesh Shaw v. Union of India*
  Supreme Court appeal (March 2026) as the moment that question gets
  forced.

---

## How Nidaan helps people instead of deciding for them

The single design rule, stated as plainly as we can:

> **Every irreversible action is taken by a human, not the AI.**

The AI:
- Drafts a differential — the doctor confirms.
- Drafts an NPRD application — the specialist signs and submits.
- Maps a patient's words to medical terms — the patient sees the mapping
  and can correct it.
- Suggests a referral — the doctor decides whether to send it.
- Flags disagreement — the doctor weighs it.

The AI does not:
- Diagnose. (It produces a ranked differential.)
- Prescribe. (It suggests confirmatory tests with costs.)
- Communicate to the patient directly. (The doctor reviews; then the
  patient dashboard reflects the doctor's confirmation.)
- Approve funding. (It drafts; the CoE signs; the Ministry approves.)
- Replace the specialist. (It builds toward the specialist referral with
  pre-screened context.)

In hospital-board terms: the AI is the resident who reads the chart and
presents the case. The attending is still the human.

---

## Equitable access — who benefits, who's left out, what's owed to them

**Who benefits:**
- The first-line GP in a district hospital who sees one rare-disease
  patient a year and would never recognise it otherwise.
- The patient who can't afford a 4-hour drive to KEM Hospital and a
  6-week specialist waitlist.
- The specialist consultant who currently gets cold referrals and has to
  re-take the history; with Nidaan, they receive pre-screened cases
  with structured context.
- The Ministry of Health, which currently has no real-time visibility
  into where rare-disease cases concentrate or where Centres of
  Excellence are missing.
- The researcher studying Indian rare-disease genetics, who today has
  to negotiate one-off data-sharing agreements with individual hospitals.

**Who is left out — and why this matters:**
- **Patients without smartphones / literacy** — the system assumes a
  patient (or family member) can type symptoms. Voice input and ASHA-worker
  intermediation are v2 priorities, not v1 features.
- **Patients in regions with no Centre of Excellence** — Nidaan can
  diagnose, but the chain breaks at Link 02 (lab access) for most of
  rural India. Diagnosis without follow-through is its own kind of harm.
  The government dashboard exists specifically to surface this gap to
  policymakers — that is the only honest answer we have.
- **Patients with rare diseases outside our three categories** —
  metabolic, neurogenetic, immunologic together cover ~70% of the Indian
  rare-disease burden. The remaining 30% (haematologic, ophthalmologic,
  certain endocrine and oncologic rare diseases) gets a generic-specialist
  referral but not a deep workup. Expanding categories is a roadmap item.

**What we're doing about the gaps:**
- Open, free at point of care for clinicians and patients. No paywall.
- The CoE registry and gap analysis are part of the public dashboard —
  not gated behind ministerial access. State health departments, NGOs,
  patient advocacy groups (ORDI, ICR), and journalists can see the same
  data.
- Codebase is open: every prompt, every tool, every list of CoEs is
  inspectable. If a clinician disagrees with a specialist agent's prior,
  they can read the prompt and audit it.

---

## Consent, dignity, and the patient's voice

- **Patients describe symptoms in their own language.** The phenotype
  extractor maps to HPO terms; the patient dashboard shows the mapping
  ("you said 'big belly on the left' — we recorded 'splenomegaly'") so
  the patient can see and correct the translation. The clinical record
  is not allowed to silently overwrite the patient's voice.
- **Consent is per-flow.** Submitting symptoms doesn't auto-enrol the
  patient in research cohorts. Each downstream use (research access,
  government aggregate, specialist referral) requires its own consent.
- **The community page** (`/patient/community`) is a future surface for
  patient advocacy and peer support, not an AI surface — built around
  ORDI's model of patient-led organising.

---

## The questions we have not answered yet

We don't think it's credible to claim we've solved every problem. The
honest list of what's still open:

1. **Differential privacy** for cohort queries (we have a cohort floor;
   we need an ε-budget).
2. **Voice / vernacular input** for patients without text literacy.
3. **Liability framework** under Indian medical law — not our problem
   to solve alone, but our problem to track.
4. **Consent revocation** that retroactively scrubs aggregates.
5. **Dataset bias correction** by partnering with Indian rare-disease
   registries (GenomeIndia, ORDI consortium, CSIR cohorts).
6. **The 30% of rare diseases outside our three categories** — current
   answer is "generic referral", which is not good enough long-term.
7. **Real-world clinical validation** — every claim about diagnostic
   accuracy in this hackathon submission is based on retrospective
   case review, not prospective RCT. Any deployment beyond demo
   requires ethics-approved validation.

We will be wrong about some of these. We would rather be wrong publicly
than silently.

---

*Last updated: 2026-05-06.*
