# Nidaan — MVP Specification
## Four-Actor Platform: Doctor · Patient · Government · Research Lab

**Date:** May 4, 2026  
**Status:** Build-ready specification  
**Depends on:** `platform-vision.md` (the why), `analysis.md` (the evidence), `architecture.md` (the AI pipeline)

---

## What This MVP Proves

The current build proves one thing: the AI diagnostic pipeline works for a single doctor and a single case. This MVP proves something harder: that the four actors — doctor, patient, government, biology lab — can share a single infrastructure in a way that creates compounding value none of them could create alone.

The MVP is not about features. It is about proving the feedback loop. Every confirmed diagnosis must flow to the patient's record, surface in the government dashboard, and become queryable by a researcher. If that chain works for 10 confirmed cases, it will work for 10,000.

**What the MVP explicitly does not attempt:**
- Genomic data ingestion or biobanking
- Mobile or WhatsApp interface
- Integration with ABDM or government health IDs
- Billing or payment
- Real-time streaming output (remains simulated)
- Automated IRB clearance or regulatory approval pathways

These are Phase 2 and beyond. The MVP establishes the data architecture and trust model that makes them possible.

---

## The Four Actors: Who They Are and What They Want

### Doctor — The GP and The Specialist

**The GP (primary user)**  
Dr. Priya Sharma, 34, MBBS + MD Pediatrics, Nashik. 30 patients per day. She has 10 minutes with a patient who has been misdiagnosed twice. She needs to know what to order and who to call. She does not need a diagnosis — she needs a ranked differential and a next test.

What she wants from the platform: diagnostic intelligence at the point of need, a warm connection to a specialist when she needs one, and evidence that her clinical instincts were right when the diagnosis comes back confirmed.

**The Specialist (consultant)**  
Dr. Mehra, Clinical Geneticist, AIIMS New Delhi. 200 outpatient appointments per month. A 6-week waitlist. For every patient he sees in person, there are 20 GPs across Maharashtra and Telangana who need 10 minutes of his judgment, not a full appointment. He wants to help more patients without being physically present for all of them.

What he wants: a structured summary of the case that lets him add meaningful guidance quickly, without starting from scratch on every consultation.

### Patient — The Person Behind the Case

Aarav, 39, Ahmedabad. Ten months of wrong diagnoses. He finally has a name for what is wrong with him: Gaucher disease. He does not understand what that means biologically, whether his children are at risk, or whether there are others like him in Gujarat. He wants to understand his own condition. He wants to not feel alone in it. And quietly, he wants the experience that nearly killed him to mean something for the next person it happens to.

What he wants: plain-language explanation of his diagnosis, connection to others with the same disease, and a way to contribute to making it easier for the next patient — on his own terms, with his own consent.

### Government — The Health Secretary

Dr. Anitha Krishnan, Joint Secretary, National Health Mission, Ministry of Health. She knows the 2021 National Policy for Rare Diseases exists and mandates a functioning rare disease registry. She knows the registry does not work. She has no real-time data on how many Gaucher patients are in India, whether they are receiving imiglucerase, or which districts are underserved by Centres of Excellence. She cannot justify budget allocation for treatments she cannot count patients for.

What she wants: a dashboard that gives her the epidemiology data she needs to do her job — not individual patient records, which she has no right to, but aggregate patterns that justify policy and budget decisions.

### Biology Research Lab — The Scientist

Dr. Krishnaswamy, Senior Scientist, CSIR-CCMB Hyderabad. He has a hypothesis about a GBA variant common in the Maharashtrian endogamous population that may have a different clinical trajectory from the European L444P variant. He has seen three cases. He needs 20 to publish. He cannot find them. The patients exist in India — they are in the AIIMS and KEM registries, scattered across clinical notes no one has systematised. He needs a pathway to find them, contact their treating doctors, and get de-identified data with proper consent.

What he wants: a structured cohort query interface that finds patients matching his criteria, shows him a count, and creates a mediated pathway to reach those patients through their treating physicians.

---

## Feature Scope Per Actor (MVP Only)

### Doctor Features

| Feature | MVP | Notes |
|---|---|---|
| Case input + 6-agent pipeline | ✓ existing | No changes |
| Diagnostic report | ✓ existing | No changes |
| Persistent case storage | ✓ MVP | Requires auth + DB |
| Confirm diagnosis | ✓ MVP | Triggers cascade to all other actors |
| Invite patient | ✓ MVP | One-time token link via email/SMS |
| Request specialist consult | ✓ MVP | Select from registered specialists |
| View specialist notes | ✓ MVP | Inline on case view |
| My cases dashboard | ✓ MVP | List of all cases run |
| Specialist consult inbox | ✓ MVP | Specialists only |
| CME credit tracking | ✗ Phase 2 | |
| EMR integration | ✗ Phase 3 | |

### Patient Features

| Feature | MVP | Notes |
|---|---|---|
| Invite-only account creation | ✓ MVP | No self-registration |
| Diagnosis summary (plain language) | ✓ MVP | Not the clinical differential |
| Consent management | ✓ MVP | Three toggles, append-only history |
| Case timeline | ✓ MVP | Key events: confirmed, consult, research |
| Disease community count | ✓ MVP | Count only, no PII |
| Community opt-in | ✓ MVP | Mailing list only |
| Symptom diary / longitudinal tracking | ✗ Phase 2 | |
| Family risk notification | ✗ Phase 2 | |
| Trial notifications | ✗ Phase 2 | Requires research layer maturity |
| Genomic data access | ✗ Phase 3 | |

### Government Features

| Feature | MVP | Notes |
|---|---|---|
| Admin-provisioned account | ✓ MVP | No self-registration |
| Aggregate case counts by disease category | ✓ MVP | |
| Geographic distribution by state | ✓ MVP | Doctor's state, not patient address |
| Diagnostic delay histogram | ✓ MVP | Requires symptom onset date field |
| Treatment access gap flag | ✓ MVP | Uses existing referral_centers in ai_result |
| CSV download of aggregate stats | ✓ MVP | No individual rows |
| Real-time data | ✗ Phase 2 | MVP uses 24h cache |
| District-level granularity | ✗ Phase 2 | |
| ABDM integration | ✗ Phase 3 | |

### Research Lab Features

| Feature | MVP | Notes |
|---|---|---|
| Admin-provisioned account | ✓ MVP | IRB reference required |
| Cohort query (disease + gene + state + consent) | ✓ MVP | Returns count only |
| Minimum 3-patient threshold | ✓ MVP | Enforced server-side |
| Formal cohort request submission | ✓ MVP | |
| Admin approval workflow | ✓ MVP | |
| Treating-doctor-mediated consent confirmation | ✓ MVP | |
| De-identified data release | ✓ MVP | Age range, gender, HPO terms, test names |
| Direct patient contact | ✗ Never | Platform always mediates |
| Raw genomic data | ✗ Phase 3 | |
| Real-time cohort size updates | ✗ Phase 2 | |

---

## User Journeys

### Journey 1 — Dr. Priya runs a case and confirms a diagnosis

**Step 1 — Registration**  
Dr. Priya finds Nidaan through a CME newsletter. She goes to `nidaan.in/auth/signup`. She enters her name, email, MBBS registration number, and selects role: GP. She selects her state: Maharashtra. She verifies her email. She is now logged in with `role = 'gp'`.

**Step 2 — Running the analysis**  
She navigates to `/analyze`. The experience is identical to the existing demo. She selects the Gaucher demo case or types her own. She submits. The pipeline animation plays. She lands on `/report`.

**Step 3 — Reading the report**  
The report is identical to the existing demo. Because she is logged in, two new elements appear below the report:
- A case ID badge in the top bar: `Case #4A1F saved to your account`
- A blue "Confirm Diagnosis" panel at the bottom of the page

**Step 4 — Ordering the test**  
She orders β-glucocerebrosidase enzyme activity on dried blood spot per the Tier 1 test recommendation.

**Step 5 — Confirming the diagnosis (14 days later)**  
The test returns: enzyme activity 4% (reference: >30%). She goes to `/doctor/cases` and opens Case #4A1F. She clicks "Confirm Diagnosis." A modal appears with four fields:
- Confirmed disease name: `Gaucher disease type 1` (pre-filled from AI rank 1, editable)
- OMIM ID: `230800` (pre-filled, editable)
- Gene: `GBA` (optional)
- Confirming test: `β-glucocerebrosidase enzyme activity, DBS` (free text)

She hits Submit. The case status changes to Confirmed. The "Invite Patient" and "Request Specialist Consult" buttons become visible.

**Step 6 — Inviting the patient**  
She clicks "Invite Patient." She enters Aarav's phone number. He receives an SMS: *"Dr. Priya Sharma has confirmed your diagnosis on Nidaan and invited you to view your record. Click here: [link]"*

**Step 7 — Requesting a specialist consult**  
She clicks "Request Specialist Consult." A dropdown shows registered specialists. She selects Dr. Mehra (Metabolic Geneticist, AIIMS Delhi). She adds a note: *"Patient is 39, starting ERT. Any guidance on imiglucerase dosing and GBA sequencing for family planning?"* She submits.

---

### Journey 2 — Dr. Mehra reviews the consultation

**Step 1 — Notification**  
Dr. Mehra receives an email: *"New consultation request from Dr. Priya Sharma, Nashik — Confirmed: Gaucher disease type 1."* He logs into `/doctor/consultations`.

**Step 2 — Reviewing the case**  
He opens the consultation. He sees the full Nidaan report — the same UI as the patient report page, but with clinical detail intact. He sees the AI differential, the disagreement with the Neurogenetic agent about Niemann-Pick type C, the HPO terms, and the test tier recommendations. He sees Dr. Priya's note.

**Step 3 — Adding consultation notes**  
He fills in the consultation notes form:
- *Free text:* "Recommend starting imiglucerase at 60 U/kg IV every 2 weeks. GBA sequencing appropriate for family planning — recommend testing siblings and children of patient. Standard N370S and L444P panel first at CDFD Hyderabad."
- *Revised rank 1:* Gaucher type 1 — HIGH confidence (confirms AI output)
- *Note on disagreement:* "Neurogenetic concern about NPC-C is reasonable but the crumpled tissue-paper BM morphology effectively rules it out clinically. I would not order filipin staining here."

He submits. Status changes to Completed.

**Step 4 — Notification back to Dr. Priya**  
Dr. Priya receives an email: *"Dr. Mehra has completed a consultation on Case #4A1F."* She opens her case view. The specialist notes appear inline below the AI report, attributed to Dr. Mehra with timestamp.

**Step 5 — Patient sees timeline update**  
Aarav's timeline on his patient dashboard gains a new entry: *"Specialist consultation completed — Clinical Geneticist, AIIMS New Delhi"*. He does not see the clinical notes — he sees only the event and the type of specialist consulted.

---

### Journey 3 — Aarav claims his patient account

**Step 1 — Receiving the invite**  
Aarav receives the SMS from Step 6 of Journey 1. He taps the link. He lands on `/auth/claim/[token]`.

**Step 2 — Creating his account**  
He enters his name and creates a password. He cannot choose a role — it is forced to `patient`. His account is linked to Case #4A1F automatically. He is redirected to `/patient/dashboard`.

**Step 3 — Seeing his diagnosis**  
His dashboard shows:
- A blue card: **Gaucher disease type 1** · OMIM: 230800 · ORPHA: 355
- Plain-language description: *"Gaucher disease is a genetic condition where the body cannot break down a fatty substance called glucocerebroside. This causes it to build up in organs, especially the spleen, liver, and bone marrow. It is treatable with enzyme replacement therapy (ERT)."*
- The HPO summary: a readable list of his symptoms mapped to medical terms
- The recommended specialist type: *Metabolic Geneticist (Lysosomal Storage Disorder specialist)*
- Referral centres: AIIMS Delhi, KEM Mumbai, CMC Vellore, NIMHANS Bangalore, CDFD Hyderabad
- His case timeline: Diagnosis confirmed [date] · Specialist consultation completed [date]

**Step 4 — Managing consent**  
He navigates to `/patient/consent`. He sees three toggles, all off by default:

> **Epidemiology reporting to government**  
> Your anonymised case (disease name, your state) will be included in aggregate statistics shared with the Ministry of Health. The government sees only counts — never your name or contact details.  
> ☐ I consent

> **Research cohort inclusion**  
> Biology research labs can search for patients with your condition for studies. They will only see that N patients with your diagnosis exist — never your identity. You will be asked separately before any data about you is shared.  
> ☐ I consent

> **Research contact pathway**  
> If a research lab is approved to contact patients with your condition, your treating doctor will reach out to re-confirm your consent before anything is shared. You are never contacted directly by researchers.  
> ☐ I consent

He enables all three. Each toggle saves immediately and adds a row to the consent history table below, timestamped.

**Step 5 — Finding community**  
He navigates to `/patient/community`. He sees:

> *"11 other patients with Gaucher disease are registered on Nidaan in India. 3 are in Maharashtra."*

A button: *"Join the Gaucher disease community mailing list"* — he clicks it. He will receive a monthly digest of research news and new confirmed cases in his region.

---

### Journey 4 — The Health Secretary reviews the dashboard

**Step 1 — Access provisioning**  
Dr. Anitha's ministry has been given access by Nidaan admin. She receives login credentials and logs into `/government/dashboard`.

**Step 2 — Seeing the overview**  
The dashboard shows four panels:

**Panel 1 — Total confirmed cases**  
47 confirmed cases in the last 12 months · Metabolic: 22 · Neurogenetic: 18 · Immunologic: 7

**Panel 2 — Geographic distribution**  
A table (or simple map) of Indian states:
- Maharashtra: 14 · Karnataka: 8 · Telangana: 7 · Delhi: 6 · Tamil Nadu: 5 · Others: 7

**Panel 3 — Diagnostic delay**  
*"For the 31 cases where symptom onset date was recorded:"*
- Median days from symptom onset to Nidaan analysis: **187 days (6.2 months)**
- For Gaucher specifically: 247 days
- For SMA: 142 days
- For DMD: 312 days

*"This represents the delay from symptom onset to the point when Nidaan was consulted. It does not represent time from first doctor visit."*

**Panel 4 — Treatment access gap**  
Confirmed Gaucher cases in states with no Centre of Excellence for metabolic genetics: **4 cases** (2 in Rajasthan, 2 in Uttar Pradesh). These patients are flagged as potentially lacking access to imiglucerase.

**Step 3 — Exporting for the ministry**  
She clicks "Download as CSV." She receives a file with aggregate rows — one row per disease per state per quarter. No individual patient data. She includes this in her budget justification presentation to the Ministry of Finance.

---

### Journey 5 — Dr. Krishnaswamy queries a research cohort

**Step 1 — Access provisioning**  
Dr. Krishnaswamy is a researcher at CSIR-CCMB Hyderabad. He applies for research access through the Nidaan website, providing his institution name, IRB reference number for his natural history study, and the scope of data he needs. The Nidaan admin approves his account. He receives login credentials.

**Step 2 — Running a cohort query**  
He logs into `/research/query`. He fills in the query form:
- Disease: Gaucher disease type 1
- OMIM: 230800
- Gene: GBA (optional filter)
- State: (leave blank — all India)
- Research cohort consent: Yes (only patients who have consented)

He submits. The result:

> *"23 patients match your query. All have confirmed diagnoses and have consented to research cohort inclusion."*

A button appears: "Submit Formal Research Request."

**Step 3 — Submitting the formal request**  
He fills in the formal request form:
- Purpose: *"Natural history study of GBA variant distribution in Indian Gaucher patients — characterising novel variants not present in ClinVar"*
- Institution: CSIR-CCMB Hyderabad
- IRB reference: CCMB/IEC/2026/04
- Data fields needed: Age range, gender, HPO terms, confirmed variant if available, state

He submits. Status: Pending admin review.

**Step 4 — Admin approval**  
The Nidaan admin reviews the request, verifies the IRB reference, and approves it. The approval triggers a notification to all 23 treating doctors.

**Step 5 — Treating doctors re-confirm patient consent**  
Each of the 23 treating doctors receives an email: *"A research request for your patient's Gaucher disease case has been approved by Nidaan. Please re-confirm patient consent before data is released."*

Each doctor logs into their case view. A prompt appears: *"CSIR-CCMB Hyderabad has been approved to receive de-identified data for your patient's case for a natural history study. Do you confirm your patient has consented?"*

Doctors who click Confirm move the process forward. 17 of 23 doctors confirm within 7 days.

**Step 6 — Data release**  
The platform releases a de-identified data package to Dr. Krishnaswamy:
- 17 rows, one per confirmed patient
- Fields: age range (e.g. 30–39), gender, HPO terms (the structured list), confirmed OMIM/ORPHA code, confirmed gene (GBA), confirmed variant if doctor entered it, state

He receives no names, no contact details, no addresses. He begins his natural history study with a sample size he could not have assembled otherwise.

---

## Technical Architecture — MVP Additions

### Infrastructure to Add

The current stack (Next.js 16, Tailwind, motion/react) stays untouched. Three additions are needed:

**1. PostgreSQL via Neon**  
Available as a zero-configuration Vercel Marketplace integration. Provides `DATABASE_URL` in the environment. Use Drizzle ORM for type-safe queries that match the TypeScript-first codebase.

```
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit
```

**2. Authentication via Auth.js v5**  
Credentials provider (email + password) for the initial build, with Google OAuth as an optional second provider for doctors. Role is stored in the JWT and session. The session object includes `id`, `email`, `name`, `role`, and `state_india`.

```
npm install next-auth@beta
```

**3. Email via Resend**  
Transactional email for patient invites, specialist consultation notifications, and research request notifications. Resend integrates directly with Next.js Route Handlers with a single SDK call.

```
npm install resend
```

### Database Schema

Eight tables. The schema is append-only where consent is concerned and immutable where AI results are concerned.

```sql
-- Core identity
users (id, email, name, role, institution, state_india, created_at, invited_by)

-- Extended patient data
patient_profiles (id, user_id, date_of_birth, gender, created_at)

-- The diagnostic case — the central entity
cases (
  id, created_by, patient_id,
  case_text,
  ai_result JSONB,            -- the full CaseResult, immutable after write
  status,                     -- draft | confirmed | archived
  confirmed_at,
  confirmed_diagnosis_name, confirmed_omim_id, confirmed_orpha_code,
  confirmed_gene, confirmed_variant,
  symptom_onset_date,
  doctor_state,               -- denormalized from doctor's state at confirm time
  created_at, updated_at
)

-- Consent — append-only, never UPDATE
consents (id, patient_user_id, consent_type, granted, granted_at)

-- One-time invite tokens for patients
patient_invite_tokens (id, token, case_id, created_by, claimed_by, expires_at, claimed_at)

-- Specialist consultation records
consultations (
  id, case_id, requesting_doctor_id, specialist_id,
  status,
  specialist_notes,
  specialist_revised_differential JSONB,
  created_at, updated_at
)

-- Research cohort requests
research_requests (
  id, researcher_id,
  query_disease_name, query_omim_id, query_gene, query_variant, query_state,
  matched_count,              -- snapshot at query time, never updated
  purpose, institution, irb_reference, data_fields_requested,
  status,                     -- pending | approved | rejected | data_released
  admin_notes, created_at, updated_at
)

-- Per-case consent confirmation for each research request
research_request_consents (
  id, research_request_id, case_id, treating_doctor_id,
  patient_re_confirmed, re_confirmed_at, data_released_at
)

-- Append-only event log powering patient timeline and audit trail
case_timeline_events (
  id, case_id, event_type, actor_user_id, metadata JSONB, created_at
)
```

### New Routes

```
app/
├── auth/
│   ├── login/page.tsx
│   ├── signup/page.tsx            doctors + specialists only
│   └── claim/[token]/page.tsx     patients only
│
├── doctor/
│   ├── layout.tsx                 role guard: gp | specialist
│   ├── cases/page.tsx             list of all doctor's cases
│   ├── cases/[id]/page.tsx        case detail + confirm + invite + consult
│   ├── consultations/page.tsx     specialist inbox
│   └── consultations/[id]/page.tsx  review + add notes
│
├── patient/
│   ├── layout.tsx                 role guard: patient
│   ├── dashboard/page.tsx         diagnosis summary + timeline
│   ├── consent/page.tsx           three-toggle consent management
│   └── community/page.tsx         disease community count + opt-in
│
├── government/
│   ├── layout.tsx                 role guard: government
│   └── dashboard/page.tsx         aggregate epidemiology dashboard
│
├── research/
│   ├── layout.tsx                 role guard: researcher
│   ├── query/page.tsx             cohort query form + count
│   └── requests/page.tsx          submitted requests + status
│
└── admin/
    ├── layout.tsx                 role guard: admin
    ├── users/page.tsx             provision government + researcher accounts
    └── requests/page.tsx          approve/reject research requests

API routes (all under /api/):
  POST   /api/cases                  create case record when pipeline runs
  PATCH  /api/cases/[id]/confirm     confirm diagnosis, trigger cascade
  POST   /api/invites                create patient invite token + send email
  POST   /api/consultations          request specialist consult
  PATCH  /api/consultations/[id]     specialist adds notes
  POST   /api/research/query         run cohort count query
  POST   /api/research/requests      submit formal research request
  PATCH  /api/research/requests/[id] admin approve/reject
  POST   /api/consent                patient updates a consent toggle
  GET    /api/government/export      aggregate CSV download
```

### Authentication Model

| Role | How Created | Access |
|---|---|---|
| `gp` | Self-register at `/auth/signup` | `/doctor/*`, `/analyze`, `/report` |
| `specialist` | Self-register at `/auth/signup` | `/doctor/*`, `/analyze`, `/report` |
| `patient` | Invited only via one-time token | `/patient/*` |
| `government` | Admin-provisioned | `/government/*` |
| `researcher` | Admin-provisioned (IRB required) | `/research/*` |
| `admin` | Seed script, env var | All routes |

**Critical rule:** No role is self-assignable server-side. The signup route validates that the posted role value is only `gp` or `specialist`. Any attempt to post `government` or `researcher` at signup is rejected with 403. Government and researcher accounts exist only if an admin created them.

### The Confirm Diagnosis Cascade

This is the keystone interaction. When a doctor calls `PATCH /api/cases/[id]/confirm`, the following happen in a single database transaction:

```
1. cases.status = 'confirmed'
2. cases.confirmed_at = now()
3. cases.confirmed_diagnosis_name, omim_id, orpha_code, gene, variant = from request body
4. cases.doctor_state = (SELECT state_india FROM users WHERE id = current_doctor_id)
5. INSERT INTO case_timeline_events (event_type = 'diagnosis_confirmed')
6. revalidateTag('gov-dashboard')  -- invalidates government dashboard cache
```

After the transaction, outside the transaction:
```
7. If patient_invite_tokens exists for this case: no action (invite was already sent)
8. The case is now eligible for researcher cohort queries
```

The government dashboard and researcher query results are both derived from the `cases` table filtered by `status = 'confirmed'`. The revalidation tag on step 6 ensures the government dashboard picks up the new case on its next page load (24-hour revalidation window).

---

## Architectural Constraints

These are non-negotiable. Violating any of them creates legal, ethical, or trust risks that would end the platform.

**1. The AI result is immutable.**  
`cases.ai_result` is written once when the case is created and never updated. Specialist notes go in `consultations.specialist_notes`. The AI output belongs to the moment of analysis — it is not amended retroactively.

**2. Consent is append-only.**  
The `consents` table is insert-only. No UPDATE statements. Ever. The current consent state is the most recent row per `patient_user_id` + `consent_type`. This creates a full audit trail required by India's Digital Personal Data Protection Act (DPDPA) 2023.

**3. The 3-patient minimum for research is server-side.**  
The cohort count query enforces a minimum of 3 matching patients server-side before a count is returned to the researcher. This is not a UI-only validation. Even if a researcher calls the API directly, they cannot learn that a specific individual exists in the database.

**4. Researchers never contact patients directly.**  
The research pathway is always mediated: researcher → admin approval → treating doctor re-consent → platform data release. Researchers receive no names, no contact details, no addresses at any stage.

**5. The patient portal shows plain language, not clinical AI output.**  
The patient dashboard shows: disease name, OMIM/ORPHA code, plain-language description, HPO summary string, and specialist recommendation. It does not show confidence percentages, agent disagreements, the raw differential table, or the AI pipeline details. Those are clinical outputs for the doctor.

**6. Government data is aggregate-only.**  
The government dashboard shows no individual rows and no data that could identify a patient or doctor. The minimum granularity is disease + state + quarter. No geographic detail finer than state in MVP.

**7. The existing demo stays public.**  
`/analyze` and `/report` remain fully functional without authentication. The Gaucher demo, the pipeline animation, and the report render must work identically to today. Auth-gated features (confirm button, consult request) are conditionally rendered based on session presence, not behind a redirect wall. This is how the hackathon demo stays alive while the platform is built around it.

---

## Build Sequence

### Phase 0 — Infrastructure (3–5 days)
*Build this first. Nothing else starts without it.*

- [ ] Provision Neon PostgreSQL via Vercel Marketplace
- [ ] Install and configure Drizzle ORM — create `/lib/db.ts` and `/lib/schema.ts`
- [ ] Run initial migration: all 8 tables created
- [ ] Install Auth.js v5, configure credentials provider
- [ ] Build `/auth/login` and `/auth/signup` — minimal UI, full dark design system
- [ ] Test: GP can register, log in, session includes `role = 'gp'`

**Gate:** auth works, database is live, zero new visible features.

### Phase 1 — Doctor Confirmation Flow (4–6 days)
*The keystone. Everything else depends on confirmed cases existing in the database.*

- [ ] Modify `analyze-client.tsx`: when authenticated as GP, `POST /api/cases` at pipeline start, storing the case ID in session state alongside the mock result
- [ ] Modify `/report/page.tsx`: hydrate from DB when case ID present, sessionStorage when not — preserving demo mode
- [ ] Add "Confirm Diagnosis" panel to report page — visible only when authenticated as GP
- [ ] Build `POST /api/cases` and `PATCH /api/cases/[id]/confirm` route handlers
- [ ] Build `/doctor/cases/page.tsx` — list of doctor's cases
- [ ] Build `/doctor/cases/[id]/page.tsx` — case detail with confirmation state, post-confirmation buttons

**Gate:** doctor can run analysis, confirm, and see a persistent record. The confirm cascade works.

### Phase 2 — Patient Portal (5–7 days)
*Requires Phase 1 — confirmed cases must exist before patients can be invited.*

- [ ] Build `POST /api/invites` — create token, send email via Resend
- [ ] Build `/auth/claim/[token]/page.tsx` — token validation, account creation
- [ ] Build `/patient/dashboard/page.tsx` — diagnosis summary in plain language + timeline
- [ ] Build `/patient/consent/page.tsx` — three consent toggles + history
- [ ] Build `POST /api/consent` — save consent to DB
- [ ] Build `/patient/community/page.tsx` — disease count + mailing list opt-in

**Gate:** patient receives invite, claims account, sees their record, manages consent.

### Phase 3 — Specialist Consult (4–5 days)
*Requires Phase 1 — cases must be confirmed before consults make sense.*

- [ ] Add "Request Specialist Consult" to `/doctor/cases/[id]/page.tsx`
- [ ] Build `POST /api/consultations` — creates record, emails specialist via Resend
- [ ] Build `/doctor/consultations/page.tsx` — specialist inbox
- [ ] Build `/doctor/consultations/[id]/page.tsx` — case view + notes form for specialist
- [ ] Build `PATCH /api/consultations/[id]` — save notes, notify requesting GP
- [ ] Show specialist notes inline on GP's case view

**Gate:** GP-to-geneticist consult loop works end-to-end.

### Phase 4 — Government Dashboard (3–4 days)
*Requires Phase 1 — needs confirmed cases with doctor_state populated.*

- [ ] Provision first government test account via admin
- [ ] Build `/government/dashboard/page.tsx` — four aggregate panels
- [ ] Build `GET /api/government/export` — aggregate CSV, no individual rows
- [ ] Add `revalidate = 86400` to the dashboard page
- [ ] Verify: no individual patient data is accessible at any government route

**Gate:** government dashboard shows real aggregate data from confirmed cases.

### Phase 5 — Research Cohort Interface (5–6 days)
*Requires Phase 2 — patient consent must be functional before cohort queries are meaningful.*

- [ ] Provision first researcher test account via admin
- [ ] Build `/research/query/page.tsx` — query form + server action
- [ ] Build `POST /api/research/query` — count query with 3-patient minimum, server-side enforced
- [ ] Build `/research/requests/page.tsx` — request history
- [ ] Build `POST /api/research/requests` — formal request submission
- [ ] Build `/admin/requests/page.tsx` — admin approve/reject
- [ ] Build `PATCH /api/research/requests/[id]` — approval triggers doctor notifications
- [ ] Add "Confirm Patient Consent for Research" to `/doctor/cases/[id]/page.tsx`
- [ ] Build data release logic — assemble de-identified data package, deliver to researcher

**Gate:** full research pathway works from query to consent to de-identified data release.

---

## Success Metrics for the MVP

The MVP is done when these are all true — not before.

| Metric | Target | Measured How |
|---|---|---|
| Existing demo still works | ✓ | `/analyze?demo=gaucher` runs end-to-end without auth |
| Doctor can confirm a diagnosis | ✓ | Case row in DB with status = confirmed |
| Confirmation cascades to patient | ✓ | Patient invite token created and sent |
| Patient can claim account and manage consent | ✓ | Consent rows appear in DB on toggle |
| Specialist notes reach the GP | ✓ | Consultation row completed, email received |
| Government dashboard shows real cases | ✓ | At least 1 confirmed case in the DB renders on the dashboard |
| Researcher gets a count | ✓ | Query returns correct count for a test confirmed case |
| Researcher count enforces minimum 3 | ✓ | Query returns "fewer than 3" message for queries with 1 match |
| Researcher cannot see patient names | ✓ | Audit all researcher-accessible routes — zero PII |
| No government route returns individual rows | ✓ | Code review + manual test |

The MVP does not require 100 real cases or 10 real doctors. It requires the architecture to work correctly for 1 real case flowing through all five layers.

---

## Timeline Summary

| Phase | Working Days (solo) | Can Parallelize With |
|---|---|---|
| 0 — Infrastructure | 3–5 | — |
| 1 — Doctor confirmation | 4–6 | — (must finish first) |
| 2 — Patient portal | 5–7 | Phase 3 |
| 3 — Specialist consult | 4–5 | Phase 2 |
| 4 — Government dashboard | 3–4 | Phase 2, 3 |
| 5 — Research cohort | 5–6 | After Phase 2 consent is done |
| **Total (solo)** | **24–33 days** | |
| **Total (2 developers)** | **14–19 days** | Phases 2–5 in parallel |

---

## What Comes After the MVP

The MVP establishes the data architecture and trust model. Once 50+ confirmed cases are in the database:

**Phase 6 — Longitudinal patient tracking**  
The patient can log symptoms, treatments, and quality of life scores over time. The case becomes a living record, not a point-in-time snapshot.

**Phase 7 — Mobile and WhatsApp interface**  
The doctor can submit a case via WhatsApp message. The platform transcribes, structures, and runs the pipeline. The report arrives in WhatsApp. This doubles the reachable doctor population overnight.

**Phase 8 — ABDM integration**  
Confirmed diagnoses link to the Ayushman Bharat health ID. The patient's rare disease record travels with them across public and private providers. The government dashboard shows ABDM-linked treatment access in real time.

**Phase 9 — Genomic data layer**  
Consented patients can submit a saliva sample. Sequencing results are returned to the patient record, interpreted against Indian variant databases, and contributed to the genomic commons. This is where Nidaan becomes infrastructure for Indian genomic science.

None of these require rethinking the core design. They are extensions of the architecture the MVP establishes. The feedback loop — diagnosis confirmed, patient contributes, government sees, researcher queries — is the foundation everything else builds on.
