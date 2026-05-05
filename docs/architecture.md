# Nidaan — System Architecture

## High-level topology

```
Clinician input
      │
      ▼
┌─────────────────────┐
│  Agent 1: Screener  │  ← Haiku 4.5 (fast, no tools)
│  Common disease?    │
└──────────┬──────────┘
           │ proceed_to_rare_workup = true
           ▼
┌─────────────────────┐
│  Agent 2: Extractor │  ← Haiku 4.5 + HPO API
│  HPO term list      │
└──────────┬──────────┘
           │ structured HPO terms
           ├────────────────────────────────┐
           │                                │
           ▼                                ▼
┌──────────────────────┐     ┌─────────────────────────┐     ┌────────────────────────────┐
│ Agent 3: Metabolic   │     │ Agent 4: Neurogenetic    │     │ Agent 5: Immunologic       │
│ Specialist           │     │ Specialist               │     │ Specialist                 │
│ Opus 4.7             │     │ Opus 4.7                 │     │ Opus 4.7                   │
│ Tools: OMIM, Orphanet│     │ Tools: OMIM, Orphanet    │     │ Tools: OMIM, Orphanet      │
│        PubMed        │     │        PubMed, GeneRev   │     │        PubMed              │
└──────────┬───────────┘     └─────────────┬───────────┘     └─────────────┬──────────────┘
           │                               │                               │
           └───────────────────────────────┼───────────────────────────────┘
                                           │ 3 specialist reports (parallel)
                                           ▼
                              ┌────────────────────────┐
                              │  Agent 6: Synthesizer  │  ← Opus 4.7
                              │  Hierarchical topology │
                              └────────────┬───────────┘
                                           │
                                           ▼
                              Case Conference Report
```

## Why this topology

The March 2026 multi-agent diagnostic evaluation showed:
- **Hierarchical: 50.0% accuracy** ✓ (our design)
- Collaborative: 49.8%
- Single-agent: 48.5%
- **Adversarial: 27.3%** ✗ (destroys accuracy — no devil's advocate agent)

Disagreement between specialists emerges naturally from different domain priors, not from a forced contrarian agent.

---

## Data flow

### Input
```
{
  "case_text": "free text clinical history, symptoms, timeline",
  "labs": "optional structured or free-text lab values",
  "patient_age": "optional",
  "consanguinity": "optional boolean"
}
```

### Internal pipeline

1. **Screener** receives raw case_text → outputs JSON: `{proceed_to_rare_workup, common_diagnosis_likely, screener_note}`
2. **Extractor** receives case_text → calls HPO API → outputs: `{hpo_terms: [{id, name, onset, severity}]}`
3. **Specialists** (parallel, each receives case_text + hpo_terms):
   - Each returns: `{differentials: [{rank, disease_name, omim_id, orpha_code, confidence, evidence, next_tests}]}`
4. **Synthesizer** receives screener note + extractor output + 3 specialist reports → produces final report

### Output
```json
{
  "screener_assessment": {...},
  "hpo_terms": [...],
  "specialist_reports": {
    "metabolic": {...},
    "neurogenetic": {...},
    "immunologic": {...}
  },
  "unified_differential": [
    {
      "rank": 1,
      "disease_name": "Gaucher disease type 1",
      "omim_id": "230800",
      "orpha_code": "355",
      "confidence": "high",
      "flagged_by": ["metabolic"],
      "supporting_evidence": [...],
      "next_tests": ["β-glucocerebrosidase enzyme activity", "GBA gene sequencing"],
      "test_priority_rupee_yield": "high",
      "would_rule_out": [...]
    }
  ],
  "disagreements": [
    {
      "disease": "Niemann-Pick type C",
      "flagged_by": "neurogenetic",
      "not_flagged_by": ["metabolic", "immunologic"],
      "reason_for_disagreement": "...",
      "resolving_test": "filipin staining / NPC1 gene panel"
    }
  ],
  "recommended_tests": [...],
  "hpo_referral_summary": "HP:0001250 (Seizures, onset age 2y) HP:0001290 (Hypotonia) ...",
  "specialist_type_recommended": "Pediatric metabolic geneticist",
  "runtime_seconds": 67
}
```

---

## Tech stack

| Layer | Choice | Reason |
|---|---|---|
| Backend language | Python 3.12 | Async support, Anthropic SDK, familiar |
| Backend framework | FastAPI | Async-native, auto OpenAPI docs, fast |
| Agent orchestration | `asyncio.gather` | Parallel specialist execution |
| AI SDK | `anthropic` Python SDK | Direct access to tool_use, streaming |
| Frontend | Next.js 15 (App Router) | Fast scaffold, good for structured output rendering |
| Styling | Tailwind CSS + shadcn/ui | Clean clinical UI quickly |
| Dev server | Uvicorn | FastAPI default |
| Environment | `.env` file | ANTHROPIC_API_KEY, OMIM_API_KEY |

---

## Performance targets

| Stage | Target | Worst case |
|---|---|---|
| Screener | <5 sec | 10 sec |
| Extractor | <10 sec | 20 sec |
| 3 specialists (parallel) | <60 sec | 90 sec |
| Synthesizer | <20 sec | 30 sec |
| **Total** | **<90 sec** | **~150 sec** |

If specialists blow the budget: downgrade to Sonnet 4.6 for non-demo cases. Hero demo case always runs on Opus 4.7.

---

## Critical guardrail: tool-backed claims

**Every disease named in the final output must have been found via a tool call to OMIM or Orphanet returning a valid ID.**

The synthesizer checks: does each specialist differential entry have an `omim_id` or `orpha_code` that came from a tool call? If not, it drops the entry before ranking.

This is the single most important hallucination guardrail.

---

## Project structure

```
nidaan/
├── backend/
│   ├── main.py               ← FastAPI app, /analyze endpoint
│   ├── pipeline.py           ← Orchestrator: runs all 6 agents in sequence/parallel
│   ├── agents/
│   │   ├── base.py           ← Tool-use loop runner
│   │   ├── screener.py       ← Agent 1
│   │   ├── extractor.py      ← Agent 2
│   │   ├── metabolic.py      ← Agent 3
│   │   ├── neurogenetic.py   ← Agent 4
│   │   ├── immunologic.py    ← Agent 5
│   │   └── synthesizer.py    ← Agent 6
│   ├── tools/
│   │   ├── hpo.py
│   │   ├── omim.py
│   │   ├── orphanet.py
│   │   └── pubmed.py
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── page.tsx          ← Case input form
│   │   └── report/page.tsx   ← Case conference output
│   └── components/
│       ├── CaseInput.tsx
│       ├── DifferentialTable.tsx
│       ├── DisagreementView.tsx
│       ├── AgentReasoningPanel.tsx
│       └── HPOSummary.tsx
└── docs/                     ← This folder
```
