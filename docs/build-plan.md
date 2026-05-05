# Nidaan — 48-Hour Build Plan

## Team split

| Person | Role | Primary ownership |
|---|---|---|
| **Person A** | Agent pipeline | System prompts, orchestration, synthesizer logic, tool-use loops |
| **Person B** | Tools & data | API wiring, eval set extraction, eval runs, caching |
| **Person C** | Frontend & demo | Next.js UI, report rendering, pitch deck, rehearsal |

---

## Hour-by-hour sequence

### Hours 0–4: Scaffold everything with mocks

**All three together — do not skip this.**

Goals:
- [ ] Person A: scaffold `pipeline.py` that runs 6 mock agents returning canned JSON
- [ ] Person B: confirm the Ahmedabad Gaucher case runs through pipeline and returns sensible canned output. Identify 4 backup cases.
- [ ] Person C: scaffold Next.js app with hardcoded mock report data rendering in the UI

**Gate:** By hour 4, the full loop works — input → pipeline → output renders — with fake data. No real APIs yet.

Why: This ensures frontend + backend contracts are agreed before anyone builds real logic.

---

### Hours 4–12: Wire real agents and APIs

**Person A:**
- [ ] Write Screener system prompt, test on Gaucher case
- [ ] Write Extractor system prompt + wire HPO API
- [ ] Write Metabolic Specialist system prompt
- [ ] Test end-to-end: screener → extractor → metabolic on Gaucher case

**Person B:**
- [ ] Wire OMIM API (get API key from omim.org, test auth)
- [ ] Wire Orphanet API
- [ ] Wire PubMed E-utilities
- [ ] Run Gaucher case through metabolic specialist alone, check OMIM IDs are real
- [ ] Identify and document 4 backup eval cases with pre-diagnosis text extracted

**Person C:**
- [ ] Build `DifferentialTable` component with real schema
- [ ] Build `DisagreementPanel` component
- [ ] Build loading state / progress tracker
- [ ] Connect frontend to backend API endpoint

**Gate:** By hour 12, the Gaucher case runs end-to-end with real agents and real tools, and output renders in the UI.

---

### Hours 12–24: All 6 agents, first eval run

**Person A:**
- [ ] Write Neurogenetic Specialist system prompt
- [ ] Write Immunologic Specialist system prompt
- [ ] Wire all 3 specialists in parallel (`asyncio.gather`)
- [ ] Write Synthesizer system prompt (hardest agent)
- [ ] First full pipeline run on Gaucher case

**Person B:**
- [ ] Run eval on all 5 cases
- [ ] Report: which cases hit top-5, which missed, what rank the correct dx appeared
- [ ] Identify which specialist is weakest
- [ ] Pre-cache API responses for hero case

**Person C:**
- [ ] Build `TestRecommendations` component
- [ ] Build `HPOSummary` copy-paste block
- [ ] Build `AgentReasoningDrawer` (slide-out for judges to see raw reasoning)
- [ ] Mobile-check the layout

**Gate:** By hour 24, at least 3/5 eval cases produce correct diagnosis in top-5.

---

### Hours 24–36: Iteration + pitch deck v1

**Person A:**
- [ ] Fix prompt issues surfaced by eval
- [ ] Tune synthesizer (most complex — disagreement detection, ranking logic)
- [ ] Add tool-backing validation (drop claims without OMIM/ORPHA ID)

**Person B:**
- [ ] Re-run evals after prompt fixes
- [ ] Test API failure modes (kill OMIM API, confirm cache fallback works)
- [ ] Document final eval results honestly

**Person C:**
- [ ] Pitch deck v1 (slides 1–6 per demo.md arc)
- [ ] Record backup demo video of hero case
- [ ] Polish report UI — focus on disagreement view as visual hero

**Gate:** By hour 36, pitch deck v1 done. System reliably produces correct top-5 on hero case.

---

### Hours 36–44: Rehearsal + final polish

**All three:**
- [ ] Rehearse pitch 2x — full 5 minutes, live demo included
- [ ] Fix bugs surfaced in rehearsal
- [ ] Person C updates deck with real eval numbers
- [ ] Person A: verify hero case runs in <90 seconds consistently
- [ ] Confirm backup demo video is recorded and working

**Gate:** By hour 44, you can run the pitch cold without looking at notes.

---

### Hours 44–48: Buffer + submit

- [ ] Final smoke test of full pipeline
- [ ] Check all API keys are in `.env.example` (not committed)
- [ ] Submit

---

## Risks, ranked by severity

### Risk 1: Specialist agents hallucinate diseases (severity: HIGH)
**Mitigation:** Every disease in output must have OMIM/ORPHA ID from a tool call. Synthesizer drops uncited claims. Person B checks this by hour 12.

### Risk 2: 90-second target missed (severity: HIGH)
**Mitigation:** 3 specialists run in parallel. If still slow, downgrade non-hero cases to Sonnet 4.6. Hero case stays on Opus 4.7. Measure at hour 12.

### Risk 3: Eval cases not findable with clean pre-diagnosis text (severity: MEDIUM)
**Mitigation:** Person B confirms 5 cases by hour 6. If fewer than 5, escalate immediately. Minimum viable demo = 1 hero case + 2 backup cases.

### Risk 4: OMIM API fails during demo (severity: MEDIUM)
**Mitigation:** Pre-cache all API responses for hero case by hour 36. Tool executor falls back to cache if API returns error.

### Risk 5: Judges ask "DeepRare/RareAgents already does this" (severity: LOW)
**Prepared answer:** "Those are research benchmarks on Western/Chinese cohorts. We are deployment-focused, India-specific, with Indian epidemiology priors and consanguinity-aware reasoning. Show them the Gaucher demo."

---

## Definition of done (MVP)

The MVP is done when:
1. Pasting the Ahmedabad Gaucher pre-diagnosis case returns Gaucher in the top-3 differential
2. The report renders in the browser with disagreements visible
3. HPO summary is copy-pasteable
4. Total runtime < 90 seconds
5. The pitch deck tells the story cleanly in 5 minutes

Everything else is stretch.

---

## Stretch goals (only if core is solid by hour 36)

- [ ] Streaming output (SSE) so clinician sees results as they generate, not all at once
- [ ] "Export to PDF" for the case conference report
- [ ] More eval cases (aim for 10)
- [ ] Specialist reference links (OMIM URLs, Orphanet URLs) in output
- [ ] Cost estimates in INR for recommended tests
