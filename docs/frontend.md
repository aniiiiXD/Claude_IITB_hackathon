# Nidaan — Frontend Design

## Tech stack

- **Next.js 15** (App Router)
- **Tailwind CSS** + **shadcn/ui** components
- **TypeScript**
- Backend: FastAPI running on `localhost:8000`, proxied via Next.js API route

---

## Pages

### 1. `/` — Case Input

**Purpose:** Where Dr. Priya enters the patient case.

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  🔬 Nidaan                         [About]     │
│  Clinical Decision Support for Rare Diseases        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  PATIENT CASE                                       │
│  ┌─────────────────────────────────────────────┐   │
│  │ Describe the case in your own words.        │   │
│  │ Include: symptoms, timeline, family history,│   │
│  │ consanguinity, exam findings, lab results.  │   │
│  │                                             │   │
│  │ [Large textarea — min 6 rows]               │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  [Load demo case: Ahmedabad Gaucher ▼]              │
│                                                     │
│  ┌─────────────────────┐                           │
│  │  Run Case Conference │  ← primary CTA           │
│  └─────────────────────┘                           │
│                                                     │
│  Typical runtime: 60–90 seconds                    │
└─────────────────────────────────────────────────────┘
```

**Demo case dropdown:** Pre-loads the Ahmedabad Gaucher case text with one click. Critical for live demo.

**Loading state:** After submit, show a live progress tracker:
```
✓ Common disease screener...       3s
✓ Phenotype extraction (HPO)...    8s  
⟳ Running specialist councils...   [spinning, parallel]
  · Metabolic specialist
  · Neurogenetic specialist
  · Immunologic specialist
⟳ Synthesizing case conference...
```

---

### 2. `/report` — Case Conference Report

**Purpose:** The main output. This is the demo money shot.

**Layout (top to bottom):**

#### A. Screener Banner
```
┌─────────────────────────────────────────────────────┐
│ ⚠️  SCREENER NOTE                                   │
│ Common conditions considered: malaria, kala-azar,   │
│ portal hypertension. None fully explain abdominal   │
│ distension + thrombocytopenia + ferritin pattern.   │
│ Rare disease workup recommended.                    │
└─────────────────────────────────────────────────────┘
```
(Hidden if screener found no relevant common conditions)

#### B. Unified Differential — Top 10
```
┌──────────────────────────────────────────────────────────────┐
│ DIFFERENTIAL DIAGNOSIS                                        │
├──┬──────────────────────────┬──────────┬───────────┬────────┤
│ # │ Disease                  │ Confidence│ Flagged by │ Tests  │
├──┼──────────────────────────┼──────────┼───────────┼────────┤
│ 1 │ Gaucher disease type 1   │ ████ High │ Metabolic  │ [View] │
│   │ OMIM:230800 · ORPHA:355  │          │            │        │
├──┼──────────────────────────┼──────────┼───────────┼────────┤
│ 2 │ Niemann-Pick type B      │ ██░ Med  │ Metabolic  │ [View] │
│   │ OMIM:607616 · ORPHA:70   │          │ Neuro      │        │
├──┼──────────────────────────┼──────────┼───────────┼────────┤
│ 3 │ HLH (secondary)          │ ██░ Med  │ Immunologic│ [View] │
└──┴──────────────────────────┴──────────┴───────────┴────────┘
```
Clicking `[View]` expands the row inline to show:
- Supporting features from this case
- Non-matching features
- Specific confirmatory tests
- Which agent flagged it and why

#### C. Disagreement Map
```
┌─────────────────────────────────────────────────────┐
│ SPECIALIST DISAGREEMENTS                            │
├─────────────────────────────────────────────────────┤
│ Niemann-Pick type C                                 │
│ Flagged by: Neurogenetic only                       │
│ Not flagged by: Metabolic, Immunologic              │
│ Reason: Neuro sees vertical gaze palsy as cardinal  │
│ feature; Metabolic disagrees re: sphingomyelinase   │
│ vs glucocerebrosidase pattern                       │
│ Resolving test: Filipin staining / NPC1 panel       │
└─────────────────────────────────────────────────────┘
```
This panel is the **key differentiator UI** — no other tool shows this.

#### D. Recommended Next Tests (ordered by yield-per-rupee)
```
TIER 1 — Start here (cheap, fast, high yield)
  □ CBC with differential (if not done)
  □ β-glucocerebrosidase enzyme activity (dried blood spot) — ₹2,000–4,000
  □ Serum ferritin + LDH + uric acid

TIER 2 — If Tier 1 inconclusive
  □ Bone marrow aspiration + biopsy
  □ Chitotriosidase activity

TIER 3 — Confirmatory / genetic
  □ GBA gene sequencing — ₹8,000–15,000
  □ Lysosomal enzyme panel
```

#### E. HPO Summary (copy-paste for referral letter)
```
┌─────────────────────────────────────────────────────┐
│ HPO SUMMARY FOR REFERRAL LETTER         [Copy] │    │
├─────────────────────────────────────────────────────┤
│ HP:0001744 Splenomegaly (severe, onset unknown)     │
│ HP:0001433 Hepatosplenomegaly                       │
│ HP:0001903 Thrombocytopenia                         │
│ HP:0002315 Headache                                 │
│ HP:0001250 Seizures (onset 2y, moderate)            │
└─────────────────────────────────────────────────────┘
```

#### F. Specialist Recommended
```
Refer to: Pediatric Metabolic Geneticist
Nearest centres with metabolic genetics programs:
→ AIIMS Delhi · KEM Hospital Mumbai · CMC Vellore · NIMHANS Bangalore
```

---

## Design principles

- **Clinical, not consumer.** No rounded-corner fluff. Dense tables are appropriate — Dr. Priya can read them.
- **Confidence is visual.** Color-coded confidence bars, not just text.
- **The disagreement view is the hero.** It should be the most visually striking element.
- **Copy-paste friendly.** HPO summary, disease names, OMIM IDs all one-click copyable.
- **No "this is not a diagnosis" banners.** The user is a clinician. Trust them.

---

## Component list

| Component | Description |
|---|---|
| `CaseInputForm` | Textarea + demo case loader + submit button |
| `PipelineProgress` | Live progress tracker during generation |
| `ScreenerBanner` | Conditional common-disease screener note |
| `DifferentialTable` | Ranked differential with expandable rows |
| `DisagreementPanel` | Specialist disagreement cards |
| `TestRecommendations` | Tier-ordered test list with cost estimates |
| `HPOSummary` | Copy-paste HPO term block |
| `SpecialistReferral` | Recommended specialist type + centers |
| `AgentReasoningDrawer` | Slide-out panel showing raw agent reasoning (for demo/judges) |

---

## API contract (frontend ↔ backend)

```
POST /api/analyze
Body: { case_text: string }

Response (streaming preferred):
{
  "status": "running" | "complete" | "error",
  "stage": "screener" | "extractor" | "specialists" | "synthesizer",
  "result": { ... full report schema ... }
}
```

Use Server-Sent Events (SSE) or polling `/api/status/{job_id}` to show live progress.
