<div align="center">

# Nidaan

### The end-to-end operating layer for rare-disease care in India.

*From a parent's first paragraph of symptoms to the day the medicine reaches the child — Nidaan holds every link in the chain. Built around the 96 million Indians living with a rare disease, where 30% of affected children die before age 5 and the average diagnostic odyssey is seven years.*

[![Built with Claude](https://img.shields.io/badge/built%20with-Claude%20Opus%204.7-D97757)](https://www.anthropic.com/claude)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js 16](https://img.shields.io/badge/Next.js%2016-000?logo=next.js)](https://nextjs.org/)
[![NPRD 2021](https://img.shields.io/badge/Aligned-NPRD%202021-A04A1F)](#)
[![IIT Bombay × Claude](https://img.shields.io/badge/IIT%20Bombay-Claude%20Hackathon-1E2D4A)](#)

</div>

---

## Why "end-to-end" is the only framing that matters

> *"My only child died before my eyes because I couldn't afford the medicines."*
> — Yogesh Kajabe. His daughter Arohi had Gaucher disease type 1.
> *The drug existed. The ₹50 lakh NPRD scheme existed. The Centre of Excellence existed.*
> *Nothing reached her in time.*

A treatable rare disease in India is not a medical problem. It is a logistics problem dressed up as a medical one. **Five sequential things must hold for one child to live, and India breaks all five by default.** A faster diagnosis is useless if the lab is 800 km away. A confirmed lab result is useless if the NPRD application stalls. An approved application is useless if the drug costs more than the cap. Approved funding is useless if the infusion centre's ventilator UPS fails silently.

Existing tools fix one link. Nidaan is built to hold the whole chain.

---

## The chain — and what Nidaan ships for each link

| # | Link | What breaks | What Nidaan does |
|---|---|---|---|
| **01** | **Recognition** | District GP sees one rare-disease patient a year. The textbook differential is malaria, TB, leukemia. | **6-agent case conference** — patient text + GP findings → ranked differential with HPO/MedGen/PubMed citations in 6 minutes |
| **02** | **Confirmation** | Enzyme assays and gene sequencing live in five labs across the entire country. | **Lab routing & sample-collection kit** — nearest accredited lab, costs in ₹, pre-filled requisition form, sample-shipping instructions |
| **03** | **Funding** | NPRD 2021 promises ₹50 L/patient. Ministry approves 3 of 10 applications. | **NPRD application autodraft** — pre-filled from case data the moment a CoE specialist confirms the diagnosis, ready for signature |
| **04** | **Drug access** | The drug costs more than the cap. There is no domestic orphan-drug pathway. | **Drug-access surfacing** — manufacturer pathways, import status, top-up schemes, and patient-assistance programmes in the same report |
| **05** | **Time** | Even when the chain holds, the infusion centre is hours away; equipment fails; fund release is delayed. | **Compression** — Links 01–04 collapsed into a single afternoon. Care timeline + ongoing-care dashboard for the patient and family |

The funding exists. The labs exist. The specialists exist. The legal precedent exists (*Master Arnesh Shaw v. Union of India*, Delhi HC, October 2024). **Nidaan is the connective tissue between them.**

---

## The patient journey, end to end

```
   ┌─────────────────────────────────────────────────────────────────────┐
   │                                                                     │
   │   ┌──────────┐                                                      │
   │   │ Patient  │  /patient/submit                                     │
   │   │ writes   │─── plain language, own words ─────────┐              │
   │   └──────────┘                                       │              │
   │                                                      ▼              │
   │   ┌──────────┐    /doctor/cases                ┌──────────┐         │
   │   │ GP adds  │◀───────────────────────────────│ Case      │         │
   │   │ findings │   exam · labs · family hx ────▶│ inbox     │         │
   │   └──────────┘                                └──────────┘         │
   │        │                                                            │
   │        ▼  "Send for AI conference"                                  │
   │   ┌─────────────────────────────────────────────────────────────┐   │
   │   │  /analyze · 6 agents · Haiku → Sonnet ×3 → Opus · 6 min     │   │
   │   │                                                             │   │
   │   │   Screeners → Specialists (parallel) → Synthesizer          │   │
   │   │                                                             │   │
   │   │   Output: ranked differential · disagreement view ·         │   │
   │   │           tier-1/2/3 test cascade · cited evidence          │   │
   │   └─────────────────────────────────────────────────────────────┘   │
   │        │                                                            │
   │        ▼                                                            │
   │   ┌──────────┐  /report                                             │
   │   │ GP       │── confirms diagnosis ──┐                             │
   │   │ reviews  │── orders Tier-1 test ──┤                             │
   │   └──────────┘── routes to CoE ───────┤                             │
   │                                       ▼                             │
   │   ┌─────────────────────────────────────────────────────────────┐   │
   │   │   Lab routing  →  Sample collection  →  Confirmed result    │   │
   │   └─────────────────────────────────────────────────────────────┘   │
   │                                       │                             │
   │                                       ▼                             │
   │   ┌─────────────────────────────────────────────────────────────┐   │
   │   │   NPRD application (auto-drafted) → CoE signs → MoH submit  │   │
   │   └─────────────────────────────────────────────────────────────┘   │
   │                                       │                             │
   │                                       ▼                             │
   │   ┌─────────────────────────────────────────────────────────────┐   │
   │   │   Drug access pathway · ongoing care · /patient/dashboard   │   │
   │   │   nearest infusion centre · fund-release status · timeline  │   │
   │   └─────────────────────────────────────────────────────────────┘   │
   │                                                                     │
   └─────────────────────────────────────────────────────────────────────┘
```

Every step has a route. Every route has a state machine. Nothing falls between the cracks.

---

## The diagnostic engine — six specialists, three layers

The case-conference engine is the heart of Link 01. It runs as a digital teaching-hospital board, compressed from six weeks into six minutes.

```
┌─────────────────────── Layer 1 · Screeners (Haiku 4.5) ──────────────────────────┐
│   ① Common-disease screener  →  rules out malaria, TB, kala-azar first           │
│   ② Phenotype extractor      →  free text → HPO terms                            │
│                                  "big belly on the left" → HP:0001744            │
└──────────────────────────────────┬───────────────────────────────────────────────┘
                                   │
┌─────────────────────── Layer 2 · Specialists (Sonnet 4.6) ───────────────────────┐
│   ③ Metabolic         ④ Neurogenetic         ⑤ Immunologic                       │
│   lysosomal storage,  Duchenne, SMA,         primary immunodeficiencies,         │
│   inborn errors of    trinucleotide          complement deficiencies,            │
│   metabolism (200+)   repeats, mito (200+)   rare autoimmune (200+)              │
│                                                                                  │
│   └────────────────────── asyncio.gather (parallel) ────────────────────┘        │
│   Each agent has independent tool access to NCBI MedGen, HPO, Wikipedia,         │
│   PubMed. Each writes its own ranked differential with citations.                │
└──────────────────────────────────┬───────────────────────────────────────────────┘
                                   │
┌─────────────────────── Layer 3 · Synthesizer (Opus 4.7) ─────────────────────────┐
│   Reads all three specialist reports. Merges overlapping diagnoses.              │
│   Surfaces where the experts disagreed and proposes the single test that         │
│   resolves it. Disagreement is the feature — not a bug to hide.                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

| Layer | Model | Why this model |
|---|---|---|
| Screening, extraction | `claude-haiku-4-5-20251001` | Fast, cheap, deterministic |
| Specialist reasoning | `claude-sonnet-4-6` | Tool-use loop over medical APIs |
| Synthesis | `claude-opus-4-7` | Weighing disagreement is the hardest step — only Opus is good enough |

---

## What every stakeholder gets

Nidaan is one system — but each role sees the slice of the pipeline they actually need.

| Role | Route | What it does for them, end to end |
|---|---|---|
| **Patient & family** | `/patient/submit` → `/patient/dashboard` | Submit symptoms in plain language. Track status as the case moves through diagnosis → lab → NPRD → drug access. See nearest CoE on a map, government schemes you're eligible for, your medical-term symptom translation, your specialist type, and your full care timeline. |
| **First-line GP** | `/analyze` + `/doctor/cases` | Run the 6-agent conference on any clinical note. Get a ranked differential with cited evidence, a tier-1/2/3 test cascade, the lab to send the sample to, and the specialist to refer to. |
| **Specialist consultant** | `/doctor/consultations/[id]` | Receive routed referrals already pre-screened with the AI report and disagreement view. Confirm, modify, or escalate. |
| **Researcher** | `/research/query` + `/research/requests` | Search consented patient cohorts by disease, gene, geography. **Counts only — never identifying records.** Submit formal data requests through the admin pipeline. |
| **Government / MoHFW** | `/government/dashboard` | Aggregate epidemiology by state, disease category, quarter. Diagnostic-delay metrics. NPRD approval-rate gaps. CoE coverage map. CSV export for policy work. |
| **Admin / data steward** | `/admin/users` + `/admin/requests` | Approve researcher access requests under ethics review. Manage role assignments. |

Patient consent is required for every flow that escapes the consulting room.

---

## Tech stack

**Backend** — `backend/`
- FastAPI + Uvicorn, fully async
- `anthropic` async SDK orchestrating Opus 4.7 + Sonnet 4.6 + Haiku 4.5
- `httpx` for live medical-database calls (HPO, NCBI MedGen, Wikipedia REST)
- Server-Sent Events stream agent progress to the UI in real time

**Frontend** — `frontend/`
- Next.js 16 (App Router) + React 19
- NextAuth v5 + Drizzle ORM + Neon Postgres
- Tailwind 4 + shadcn/ui + Framer Motion
- Leaflet for Centre-of-Excellence and NIDAN Kendra maps

**Real-world data baked in** *(no scraping; ToS-respectful)*
- **Human Phenotype Ontology** — symptom → HPO term mapping
- **NCBI MedGen** — canonical clinical genetics, OMIM cross-refs
- **Wikipedia REST API** — clinical narrative fallback
- **NPRD 2021 centre registry** — 12 Centres of Excellence + DBT/UMMID NIDAN Kendras (geocoded, in `frontend/lib/centers.ts`)

---

## Quick start

```bash
git clone git@github.com:aniiiiXD/Claude_IITB_hackathon.git
cd Claude_IITB_hackathon

# 1. Backend
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env

# 2. Frontend
cd ../frontend
npm install
cp .env.local.example .env.local
# (optional) DATABASE_URL=... for Neon Postgres

# 3. Run both
cd .. && ./start.sh
# Backend:  http://localhost:8000
# Frontend: http://localhost:3000
```

### API

```bash
# Blocking — full result
curl -X POST http://localhost:8000/analyze \
  -H 'Content-Type: application/json' \
  -d '{"case_text": "4yo male, splenomegaly, platelets 54k, bone pain..."}'

# Streaming — live agent progress over SSE
curl -X POST http://localhost:8000/analyze/stream \
  -H 'Content-Type: application/json' \
  -d '{"case_text": "..."}'
```

---

## The hero demo — Ahmedabad Gaucher case (full chain)

```
Day 1, 10:00 AM   Patient submits: "tired all the time, big belly,
                  bruises for no reason, bone pain at night"

Day 1, 10:05 AM   Doctor adds: "spleen palpable 6 cm below costal margin,
                  platelets 54k, anaemia, no fever"

Day 1, 10:11 AM   Six specialists return:
                  ✓  Most likely:   Gaucher disease type 1 (98% confidence)
                  ✓  Disagreement:  Immunologic flagged ITP — same enzyme
                                    assay resolves both
                  ✓  Tier-1 test:   β-glucocerebrosidase enzyme assay (₹2,500)
                  ✓  Lab:           Sandor Speciality Diagnostics, Hyderabad
                                    [pre-filled requisition · sample protocol]
                  ✓  Refer to:      Metabolic Geneticist · FRIGE Ahmedabad (8 km)

Day 1, 10:30 AM   Patient sees treatment-centre map, ₹50 L NPRD eligibility,
                  next-step timeline, what to expect in clinic.

Day 4             Confirmed enzyme result returns. CoE specialist signs.
                  NPRD application — already auto-drafted from the case
                  record — submits to MoHFW.

Week 2            Drug-access dashboard surfaces: Sanofi Genzyme PAP route,
                  Cipla domestic-supply pathway, ₹50 L NPRD top-up applied.

Week 4            First ERT infusion at FRIGE Ahmedabad.
                  /patient/dashboard tracks every infusion, every fund
                  release, every follow-up — for life.
```

One afternoon for the diagnosis. Three weeks for the medicine. Not seven years for one and never for the other.

---

## Repo layout

```
.
├── backend/
│   ├── main.py             # FastAPI · /analyze + /analyze/stream + /health
│   ├── pipeline.py         # 6-agent orchestrator (sequential → parallel → synthesis)
│   ├── prompts.py          # Per-agent system prompts
│   ├── tools.py            # HPO + MedGen + Wikipedia tool implementations
│   └── scripts/            # Tool integration tests
│
├── frontend/
│   └── app/
│       ├── analyze/        # 6-agent live progress (SSE)
│       ├── patient/        # submit · dashboard · consent · community
│       ├── doctor/         # cases · consultations
│       ├── report/         # final differential + CoE map + test cascade
│       ├── research/       # cohort queries · formal data requests
│       ├── government/     # epidemiology dashboard
│       ├── admin/          # users · data-access requests
│       └── how-it-works/   # public explainer of the topology
│
├── docs/                   # Architecture, build plan, agent specs, demo script
├── flow.md                 # Plain-English walkthrough — start here
└── start.sh                # Run backend + frontend together
```

---

## The numbers behind the chain

| Stat | Value | Source |
|---|---|---|
| Children with rare disease who die before age 5 | **30%** | Indian rare-disease prevalence data |
| Average time to diagnosis in India | **7 years** | (vs. 4.7 years globally) |
| NPRD funding application approval rate | **30%** | Ministry of Health — RTI |
| Total raised on the official crowdfunding portal since 2021 | **₹2.93 lakh** | (need: ₹91 billion) |
| Centres of Excellence in India | **12** | 20 of 28 states have none |
| Enzyme-assay & sequencing labs nationwide | **5** | almost all in metros |

Yes, ~70 million Indians live with some form of rare disease — but most public conversation gets stuck on that headline. The numbers above are the ones that actually decide whether a child with a treatable disease lives or dies.

---

## Real cases that shaped this product

| Patient | Disease | Which link broke |
|---|---|---|
| Arohi Kajabe (rural Maharashtra) | Gaucher type 1 | Link 03 — NPRD application never approved; father sold land, daughter died |
| 12-year-old girl, malaria-endemic India | Gaucher | Link 01 — positive malaria test "explained" splenomegaly; diagnosed years late |
| 12-year-old boy, rural Maharashtra | Wilson's disease | Link 02 — rural facility had no slit-lamp; Kayser-Fleischer rings missed; diagnosed at autopsy |
| Shaurya Singh, 13 | Hunter Syndrome | Link 04 — ₹50 L cap exhausted; ₹1.8 cr/yr drug priced out; died August 2025 |
| Nidhi Shirol | Pompe (India's first known case) | Link 05 — lived 17 years on ERT; ventilator UPS battery failed silently in 2017 |

Each of these is a link Nidaan is built to hold.

---

## What Nidaan is not

- **Not just a diagnostic tool.** Diagnosis without lab routing, funding, drug access, and follow-up is a half-built bridge. Nidaan ships all five.
- **Not a replacement for a geneticist.** It helps the GP decide *when and how* to refer — and lets the specialist start from a pre-screened, structured case.
- **Not a patient-facing diagnostic.** Patients submit and track; clinicians interpret and confirm.
- **Not a general rare-disease encyclopedia.** It covers three categories deeply — metabolic, neurogenetic, immunologic — chosen to match the Indian rare-disease burden distribution.
- **Not vaporware.** Every screen in the journey above maps to a real route in `frontend/app/`. The diagnostic engine is `backend/pipeline.py`. The CoE registry is `frontend/lib/centers.ts`. Open the repo.

---

## Acknowledgements

The clinical framing draws on real reporting from *Global Health NOW*, *The Indian Express*, *SCMP*, *Indian J. of Pathology and Oncology*, PubMed central case reports, and the work of **ORDI** (Organization for Rare Diseases India) — co-founded by Prasanna Shirol, Nidhi's father, who turned his loss into the country's first rare-disease patient advocacy organisation.

The legal precedent — *Master Arnesh Shaw v. Union of India* (Delhi High Court, October 2024) — established the obligation to provide rare-disease care. The Supreme Court hears the Union government's appeal in **March 2026**. The clinical infrastructure to act on a favourable ruling does not yet exist.

That is the gap Nidaan is built into.

---

<div align="center">

**Nidaan** · निदान · *the diagnosis*

Built for the Claude × IIT Bombay Hackathon · May 2026

*The funding exists. The labs exist. The specialists exist. The drugs exist.*
*We are the connective tissue between them.*

</div>
