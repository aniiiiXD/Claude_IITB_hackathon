<div align="center">

# Nidaan

### Six specialists. One clinical note. Six minutes to a differential.

*A multi-agent clinical decision support tool for first-line Indian physicians — built for the 96 million Indians living with a rare disease, where the average diagnostic odyssey is seven years and 30% of affected children die before age 5.*

[![Built with Claude](https://img.shields.io/badge/built%20with-Claude%20Opus%204.7-D97757)](https://www.anthropic.com/claude)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js 16](https://img.shields.io/badge/Next.js%2016-000?logo=next.js)](https://nextjs.org/)
[![NPRD 2021](https://img.shields.io/badge/Aligned-NPRD%202021-A04A1F)](#)
[![IIT Bombay × Claude](https://img.shields.io/badge/IIT%20Bombay-Claude%20Hackathon-1E2D4A)](#)

</div>

---

## Why this exists

> *"My only child died before my eyes because I couldn't afford the medicines."*
> — Yogesh Kajabe, on his daughter Arohi, who had Gaucher disease type 1.
> *The drug existed. The ₹50 lakh NPRD scheme existed. The Centre of Excellence existed.*
> *Nothing reached her in time.*

A treatable rare disease in India is not primarily a medical problem. It is a logistics problem dressed up as a medical one. Five sequential things must hold for one child to live. India breaks all five by default.

### The five-link chain

| # | Link | What breaks |
|---|---|---|
| 01 | **Recognition** | A district-hospital GP sees one rare-disease patient a year. The textbook differential is malaria, TB, leukemia. The rare diagnosis isn't even on the list. |
| 02 | **Confirmation** | Even when a doctor suspects it, enzyme assays and gene sequencing live in five labs across the entire country — almost all in metros. |
| 03 | **Funding** | NPRD 2021 promises ₹50 lakh per patient. The Ministry of Health approves three out of ten applications. |
| 04 | **Drug access** | ₹50 lakh sounds like a lot until the drug is ₹1.8 crore a year. There is no domestic orphan-drug pathway. |
| 05 | **Time** | Even when the chain holds, the infusion centre is hours away. The equipment fails. The fund release is delayed. |

The funding exists. The labs exist. The specialists exist. The legal precedent exists (*Master Arnesh Shaw v. Union of India*, Delhi HC, October 2024). **Nidaan is the connective tissue between them.**

---

## What Nidaan does

A first-line physician pastes a free-text clinical note. In six minutes, six AI agents run a structured case conference and return a ranked differential with evidence, the next test to order with cost, the specialist to refer to, and the nearest Centre of Excellence with directions — all in the same report.

```
Patient writes  →  GP adds clinical findings  →  AI does the heavy lifting  →  Confirmed diagnosis
"belly feels       "spleen enlarged,              6 specialist agents +         + nearest CoE
 swollen, bone      platelets 54k"                 NCBI MedGen + HPO +           + NPRD application
 pain at night"                                    PubMed citations               pre-filled
```

One afternoon. Not seven years.

---

## The multi-agent topology — a digital hospital board

```
┌─────────────────────────── Layer 1 · Screeners (Haiku 4.5) ───────────────────────────┐
│                                                                                       │
│   ① Common-disease screener   →   rules out malaria, TB, kala-azar before going       │
│                                    down the rare-disease path                         │
│                                                                                       │
│   ② Phenotype extractor       →   maps free text → HPO terms                          │
│                                    "big belly on the left" → HP:0001744 splenomegaly  │
└─────────────────────────────────────────┬─────────────────────────────────────────────┘
                                          │
┌─────────────────────────── Layer 2 · Specialists (Sonnet 4.6) ────────────────────────┐
│                                                                                       │
│      ③ Metabolic         ④ Neurogenetic         ⑤ Immunologic                         │
│      lysosomal storage,  Duchenne, SMA,         primary immunodeficiencies,           │
│      inborn errors of    trinucleotide          complement deficiencies,              │
│      metabolism (200+)   repeats, mito (200+)   rare autoimmune (200+)                │
│                                                                                       │
│      └────────────────────── asyncio.gather (parallel) ──────────────────────┘        │
│                                                                                       │
│      Each agent has independent tool access to NCBI MedGen, Orphanet,                 │
│      PubMed, and the Human Phenotype Ontology. Each writes its own                    │
│      ranked differential with citations.                                              │
└─────────────────────────────────────────┬─────────────────────────────────────────────┘
                                          │
┌─────────────────────────── Layer 3 · Synthesizer (Opus 4.7) ──────────────────────────┐
│                                                                                       │
│   Reads all three specialist reports. Merges overlapping diagnoses.                   │
│   Surfaces where the experts disagreed and why. Proposes the single                   │
│   test cascade that resolves the question fastest.                                    │
│                                                                                       │
│   Specialist disagreement is the feature — not a bug to hide.                         │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

Three layers of reasoning. Six specialised models. The way a teaching hospital's case conference actually runs, compressed from six weeks into six minutes.

---

## The hero demo — Ahmedabad Gaucher case

```
Day 1, 10:00 AM   Patient submits: "tired all the time, big belly, bruises
                                    for no reason, bone pain at night"

Day 1, 10:05 AM   Doctor adds: "spleen palpable 6 cm below costal margin,
                                platelets 54k, anaemia, no fever"

Day 1, 10:11 AM   Six specialists return:
                  ✓  Most likely:   Gaucher disease type 1 (98% confidence)
                  ✓  Second:        Niemann-Pick type B (8%)
                  ✓  Order:         β-glucocerebrosidase enzyme assay (₹2,500)
                  ✓  Refer to:      Metabolic Geneticist
                  ✓  Disagreement:  Immunologic agent flagged ITP — resolved
                                    by the same enzyme assay
                  ✓  Nearest CoE:   FRIGE Ahmedabad — 8 km
                  ✓  NPRD draft:    pre-filled, ready for CoE signature

Day 1, 10:30 AM   Patient sees: treatment center on a map, ₹50 lakh NPRD
                                application status, what to expect next.
```

---

## Tech stack

**Backend** — `backend/`
- FastAPI + Uvicorn, async throughout
- `anthropic` async SDK orchestrating Opus 4.7 + Sonnet 4.6 + Haiku 4.5
- `httpx` for live medical-database calls
- Server-Sent Events stream agent progress to the UI in real time

**Frontend** — `frontend/`
- Next.js 16 (App Router) + React 19
- NextAuth v5 + Drizzle ORM + Neon Postgres
- Tailwind 4 + shadcn/ui + Framer Motion
- Leaflet for Centre-of-Excellence and NIDAN Kendra maps

**Data sources** *(no scraping; ToS-respectful)*
- **Human Phenotype Ontology** — symptom → HPO term mapping
- **NCBI MedGen** — canonical clinical genetics, OMIM cross-refs
- **Wikipedia REST API** — clinical narrative fallback
- **NPRD 2021 centre registry** — 12 Centres of Excellence + DBT/UMMID NIDAN Kendras (geocoded, baked in at `frontend/lib/centers.ts`)

**Models**
| Layer | Model ID | Why |
|---|---|---|
| Screening, extraction | `claude-haiku-4-5-20251001` | Fast, cheap, deterministic |
| Specialist reasoning | `claude-sonnet-4-6` | Tool-use loop over medical APIs |
| Synthesis | `claude-opus-4-7` | Weighing disagreement is the hardest step — only Opus is good enough |

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

## One system. Four perspectives.

| Role | Route | What they get |
|---|---|---|
| **Doctor** | `/analyze` | Free-text clinical note → ranked differential, next test, referral, citations |
| **Patient** | `/patient/submit` | Submit symptoms in plain language; track status as the case moves; treatment-centre map; NPRD application status |
| **Researcher** | `/research/query` | Cohort counts only — never individual records; minimum-cohort floor for privacy; formal data requests via admin pipeline |
| **Government** | `/government/dashboard` | Aggregate epidemiology by state, disease, quarter; diagnostic-delay metrics; CoE coverage gaps; CSV export |

Patient consent is required for every flow. The government and researcher views see anonymised aggregates; never identifying records.

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
│       ├── analyze/        # Live 6-agent progress (SSE)
│       ├── patient/        # submit · dashboard · consent · community
│       ├── doctor/         # cases · consultations
│       ├── report/         # final differential + CoE map
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

Yes, ~70 million Indians live with some form of rare disease — but most public conversation gets stuck on that headline. The numbers above are the ones that actually decide whether a child with a treatable disease lives or dies.

---

## Real cases that shaped this product

| Patient | Disease | What broke |
|---|---|---|
| Arohi Kajabe (rural Maharashtra) | Gaucher type 1 | NPRD application never approved — father sold land, borrowed $6,000, daughter died |
| 12-year-old girl, malaria-endemic India | Gaucher | Positive malaria test "explained" splenomegaly — diagnosis came years later |
| 12-year-old boy, rural Maharashtra | Wilson's disease | Rural facility had no slit-lamp — KF rings missed; diagnosed at autopsy |
| Shaurya Singh, 13 | Hunter Syndrome | ₹50-lakh cap exhausted; ₹1.8 cr/yr drug priced out — died August 2025 |
| Nidhi Shirol | Pompe (India's first known case) | Lived 17 years on ERT — UPS battery on ventilator failed silently. Died 2017, age 24. |

Each of these is a link in the chain Nidaan is built to hold.

---

## What Nidaan is not

- **Not a diagnosis tool.** It produces a ranked differential with evidence; the doctor confirms.
- **Not a replacement for a geneticist.** It helps the GP decide *when and how* to refer.
- **Not a patient-facing diagnostic.** Patients submit; doctors interpret.
- **Not a general rare-disease encyclopedia.** It covers three categories deeply — metabolic, neurogenetic, immunologic — chosen to match the Indian rare-disease burden distribution.

---

## Acknowledgements

The clinical framing draws on real reporting from *Global Health NOW*, *The Indian Express*, *SCMP*, *Indian J. of Pathology and Oncology*, PubMed central case reports, and the work of ORDI (Organization for Rare Diseases India) — co-founded by Prasanna Shirol, Nidhi's father, who turned his loss into the country's first rare-disease patient advocacy organisation.

The legal precedent — *Master Arnesh Shaw v. Union of India* (Delhi High Court, October 2024) — established the obligation to provide rare-disease care. The Supreme Court hears the Union government's appeal in **March 2026**. The clinical infrastructure to act on a favourable ruling does not yet exist.

That is the gap Nidaan is built into.

---

<div align="center">

**Nidaan** · निदान · *the diagnosis*

Built for the Claude × IIT Bombay Hackathon · May 2026

*The funding exists. The labs exist. The specialists exist. We are the connective tissue between them.*

</div>
