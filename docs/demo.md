# Nidaan — Demo Strategy & Eval Set

## Demo philosophy

Use **published, retrospectively-diagnosed Indian cases** from peer-reviewed journals. Feed only the *pre-diagnosis* clinical picture. The actual diagnosis (which took real doctors months/years) should appear in our top-5 differential.

Why published cases:
- Real — judges respect this
- Ground truth is verifiable and on record
- They document actual diagnostic delay → our impact story
- No patient consent issues
- No risk of fabricating a case that looks too clean

---

## Hero Demo Case: Ahmedabad Gaucher (2024)

**The case (pre-diagnosis presentation only):**
> A 39-year-old Indian Muslim male from Ahmedabad, from a consanguineous marriage.  
> 10 months of abdominal distension, low-grade fever, anorexia, and weight loss.  
> Exam: massive splenomegaly, hepatomegaly. Lab: pancytopenia, elevated ferritin.  
> Previously treated for malaria (no response). Treated for kala-azar (no response).  
> Bone marrow biopsy shows foamy macrophages.

**Actual diagnosis:** Gaucher disease type 1 (GBA gene mutation confirmed)

**Why this is a perfect demo case:**
1. The differential includes common Indian infectious diseases (malaria, kala-azar) — our system must handle red herrings
2. Our screener should correctly note: "kala-azar/malaria considered but don't explain full picture"
3. Metabolic specialist should rank Gaucher #1 or #2
4. This proves Indian-context awareness is real, not claimed
5. The real patient had 10 months of diagnostic delay — the impact story writes itself

**Expected Nidaan output for this case:**
- Screener: common conditions considered, proceed to rare workup
- Top differential: Gaucher type 1 (#1), Niemann-Pick type B (#2), HLH (#3)
- Disagreement: Neurogenetic may flag Niemann-Pick type C, Immunologic may flag HLH
- Next test: β-glucocerebrosidase enzyme activity (definitive, tier 1)

---

## Backup Cases (Person B to validate by hour 6)

### Case 2: Pediatric SMA case (India)
**Target:** Spinal Muscular Atrophy type 2
**Presentation:** Infant with progressive proximal weakness, absent deep tendon reflexes, tongue fasciculations, respiratory difficulty
**Source:** Look in *Indian Journal of Pediatrics* or *Annals of Indian Academy of Neurology*
**Neurogenetic specialist should flag this**

### Case 3: Wilson's Disease (India)
**Target:** Wilson's disease
**Presentation:** Adolescent with liver disease (cirrhosis/hepatitis picture) + behavioral changes + Kayser-Fleischer rings
**Source:** *Indian Journal of Gastroenterology* or *Journal of Pediatric Gastroenterology*
**Metabolic specialist should flag this; common-disease screener may flag viral hepatitis first**

### Case 4: Wiskott-Aldrich Syndrome
**Target:** Wiskott-Aldrich Syndrome (PID)
**Presentation:** Male infant, eczema + recurrent bacterial infections + thrombocytopenia
**Source:** Indian PIDNET registry publications
**Immunologic specialist should flag this**

### Case 5: Duchenne Muscular Dystrophy (missed diagnosis)
**Target:** DMD
**Presentation:** 6-year-old boy, walking difficulty, calf pseudohypertrophy, elevated CK (if in labs), treated for nutritional deficiency first
**Source:** *Indian Pediatrics* DMD cohort studies
**Neurogenetic specialist should flag this at rank 1**

---

## Eval scoring methodology

**Metric:** Top-5 hit rate — does the correct diagnosis appear in positions 1–5 of the unified differential?

**Scoring:**
- Rank 1: 5 points
- Rank 2: 4 points
- Rank 3: 3 points
- Rank 4: 2 points
- Rank 5: 1 point
- Not in top 5: 0 points

**Report honestly.** Do not cherry-pick. If we hit 4/5 cases, report 4/5 and explain why we missed the 5th. Judges respect honest evals over uncritical "it works" claims.

**Failure analysis:** For any missed case, document:
- What rank did the correct diagnosis actually appear?
- Which specialist flagged it (if any)?
- What would have improved the result?

---

## Leaderboard slide (for pitch deck)

```
┌────────────────────────────────────────────────────────┐
│           EVAL SET — 5 PUBLISHED INDIAN CASES          │
├──────────────────────┬──────────┬──────────────────────┤
│ Case                 │ True Dx  │ Nidaan Rank     │
├──────────────────────┼──────────┼──────────────────────┤
│ Ahmedabad, 39M       │ Gaucher  │ #1 ✓                 │
│ Pune, 8M infant      │ SMA-II   │ #2 ✓                 │
│ Delhi, 14M           │ Wilson's │ #1 ✓                 │
│ Chennai, 2M          │ WAS      │ #3 ✓                 │
│ Mumbai, 6M           │ DMD      │ #1 ✓                 │
├──────────────────────┼──────────┼──────────────────────┤
│ TOP-5 HIT RATE       │          │ 5/5 (100%)           │
└──────────────────────┴──────────┴──────────────────────┘
```
*(Fill in actual ranks from real eval run — do not pre-fill with perfect scores)*

---

## Pitch arc (5 minutes)

### Slide 1 — The patient (45 sec)
A 39-year-old man in Ahmedabad. Consanguineous marriage. 10 months of abdominal distension, low fever, weight loss. Three doctors. Treated for malaria. Wrong. Treated for kala-azar. Wrong. Real diagnosis: Gaucher disease — treatable since 1991. He waited 10 months.

### Slide 2 — The numbers (45 sec)
- 96 million Indians with rare diseases
- 4–6 year average diagnostic odyssey
- 30% of affected children dead before age 5
- 4,600 endogamous groups → high consanguinity → more recessive disease
- ~50 genetic counsellors in the entire country
The bottleneck isn't testing. It's the first doctor not recognizing the pattern.

### Slide 3 — Live demo (90 sec)
Paste the Ahmedabad case into Nidaan. Progress tracker shows agents running. Report renders:
- **Gaucher appears at rank 1** (or rank 2 with strong confidence)
- Show the disagreement view: Metabolic flagged Gaucher, Neuro flagged Niemann-Pick, Immunologic flagged HLH
- Show next test: β-glucocerebrosidase enzyme activity, dried blood spot
- Show HPO summary: copy-paste for referral letter

**The punchline:** His GP could have seen this in week 1.

### Slide 4 — Architecture + evidence (60 sec)
- 6-agent hierarchical pipeline
- Why hierarchical not adversarial: cite March 2026 paper (50.0% vs 27.3%)
- Every claim is tool-backed: OMIM ID + Orphanet code from API calls
- Show the eval leaderboard: N/5 cases, top-5 hit rate

### Slide 5 — Ethics (60 sec)
Three failure modes we take seriously:
1. **False positives** → unnecessary genetic testing, family anxiety. Mitigation: confidence bands, "only order if screener agrees"
2. **Anchoring bias** → clinician anchors on rank 1, stops thinking. Mitigation: disagreement view forces multiple hypotheses
3. **Equity gaps** → OMIM/Orphanet underrepresent diseases prevalent in South Asia. Mitigation: explicit Indian epidemiology priors baked into agent prompts; we disclose this limitation

### Slide 6 — Close (20 sec)
The Ahmedabad patient waited 10 months. With Nidaan, his GP in week 1 sees Gaucher in the top-5 differential. That's the change we're building toward.

---

## Backup demo video

Record a full end-to-end run of the hero case BEFORE the presentation. If live API fails, play the video. The video should show:
- Case input being typed/pasted
- Progress tracker live
- Full report rendering
- Scrolling through the disagreement view and test recommendations

File: `demo_backup_gaucher.mp4`
