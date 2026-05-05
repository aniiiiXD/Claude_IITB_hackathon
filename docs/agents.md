# Nidaan — Agent Specifications

## Agent 1: Common-Disease Screener

| Property | Value |
|---|---|
| Model | `claude-haiku-4-5-20251001` |
| Tools | None |
| Runs | First, before anything else |
| Max time | 5 seconds |

**Purpose:** Prevent the "zebra hammer" failure mode — rare disease system over-triggering on common presentations.

**Input:** Raw case text

**Output (JSON):**
```json
{
  "common_conditions_considered": [
    {"condition": "Kala-azar", "fits_all_features": false, "explanation": "..."}
  ],
  "common_diagnosis_likely": false,
  "confidence": "high",
  "reasoning": "Organomegaly + seizures + developmental regression together are not explained by any single common condition...",
  "proceed_to_rare_workup": true,
  "screener_note": "Summary for synthesizer"
}
```

**Key prompt constraints:**
- Must evaluate: TB, malaria, kala-azar, typhoid, hepatitis, nutritional deficiencies, hypothyroidism, cerebral palsy from known cause
- Must check: does the common condition explain ALL features, or only some?
- If common fits all → `proceed_to_rare_workup: false`

---

## Agent 2: Phenotype Extractor

| Property | Value |
|---|---|
| Model | `claude-haiku-4-5-20251001` |
| Tools | HPO API (search_hpo_terms, get_hpo_term) |
| Runs | After screener confirms rare workup |
| Max time | 10 seconds |

**Purpose:** Convert free-text clinical history into structured HPO terms with onset and severity.

**Input:** Raw case text

**Output (JSON):**
```json
{
  "hpo_terms": [
    {
      "id": "HP:0001250",
      "name": "Seizures",
      "onset": "age 2 years",
      "severity": "moderate",
      "source_text": "seizures started at age 2"
    },
    {
      "id": "HP:0001744",
      "name": "Splenomegaly",
      "onset": "unknown",
      "severity": "severe",
      "source_text": "massive splenomegaly on exam"
    }
  ],
  "clinical_summary": "One-paragraph structured clinical summary for specialists"
}
```

**Key prompt constraints:**
- Every HPO term must come from a tool call result — no invented IDs
- Must capture onset age when mentioned
- Must flag: consanguinity, family history, regression (not just delay)

---

## Agent 3: Metabolic Specialist

| Property | Value |
|---|---|
| Model | `claude-opus-4-7` |
| Tools | OMIM, Orphanet, PubMed |
| Runs | Parallel with Agents 4 & 5 |
| Domain focus | Inborn Errors of Metabolism (IEM) |
| Indian epidemiology prior | Gaucher #1 IEM (11.2%), lysosomal storage disorders, organic acidemias |

**Input:** case_text + hpo_terms from extractor

**Output (JSON):**
```json
{
  "domain": "metabolic",
  "differentials": [
    {
      "rank": 1,
      "disease_name": "Gaucher disease type 1",
      "omim_id": "230800",
      "orpha_code": "355",
      "confidence": "high",
      "confidence_reasoning": "Splenomegaly + thrombocytopenia + bone pain in Indian patient with consanguinity strongly suggests LSDs. Gaucher is most common IEM at Indian tertiary centers.",
      "matching_features": ["splenomegaly", "thrombocytopenia", "hepatomegaly"],
      "non-matching_features": ["no bone crisis reported"],
      "confirmatory_tests": [
        {"test": "β-glucocerebrosidase enzyme activity (DBS)", "yield": "definitive", "cost_tier": "moderate"},
        {"test": "GBA gene sequencing", "yield": "confirmatory", "cost_tier": "high"}
      ],
      "rule_out_tests": [...]
    }
  ],
  "biochemical_clues": ["elevated ferritin", "thrombocytopenia", "hepatosplenomegaly"],
  "tool_citations": ["OMIM:230800", "ORPHA:355"]
}
```

**Key prompt constraints:**
- Every disease must have OMIM + ORPHA code from tool calls
- Must weight toward Indian epidemiology (Gaucher, Niemann-Pick, Pompe, MPS)
- Must include cost-tiered test recommendations in Indian context
- Top 5 differentials max

---

## Agent 4: Neurogenetic Specialist

| Property | Value |
|---|---|
| Model | `claude-opus-4-7` |
| Tools | OMIM, Orphanet, PubMed |
| Runs | Parallel with Agents 3 & 5 |
| Domain focus | Neuromuscular + Neurodevelopmental disorders |
| Indian epidemiology prior | Duchenne 32.9%, trinucleotide repeats 27.3%, SMA 15.9% of NMND |

**Input:** case_text + hpo_terms from extractor

**Output:** Same structure as Metabolic Specialist, domain = "neurogenetic"

**Key prompt constraints:**
- Distinguish: regression (active neurodegeneration) vs static delay vs progressive
- Flag epileptic encephalopathies separately
- Weight: DMD, SMA, FRDA, myotonic dystrophy, Wilson's for Indian context
- Must call PubMed for any Indian-specific epidemiology claims

---

## Agent 5: Immunologic Specialist

| Property | Value |
|---|---|
| Model | `claude-opus-4-7` |
| Tools | OMIM, Orphanet, PubMed |
| Runs | Parallel with Agents 3 & 4 |
| Domain focus | Primary Immunodeficiencies (PIDs) + rare autoimmune |
| Indian epidemiology prior | Combined immunodeficiencies, complement deficiencies elevated in consanguineous populations |

**Input:** case_text + hpo_terms from extractor

**Output:** Same structure, domain = "immunologic"

**Key prompt constraints:**
- Recurrent infections pattern: type matters (bacterial → antibody defect; fungal/viral → T-cell defect; all types → combined)
- Must flag: failure to thrive + recurrent infections as PID red flag
- IUIS classification for any PID diagnosis suggested
- If no immunologic features: clearly state "No immunologic differentials — immunologic features not present in this case"

---

## Agent 6: Synthesizer

| Property | Value |
|---|---|
| Model | `claude-opus-4-7` |
| Tools | None (all tool-calling done by specialists) |
| Runs | After all 3 specialists complete |
| Topology | Hierarchical |

**Input:** screener_output + extractor_output + metabolic_report + neurogenetic_report + immunologic_report

**Output:** Full case conference report (see architecture.md for full schema)

**Key responsibilities:**
1. **Merge and rank** all specialist differentials into unified top-10
2. **Detect disagreements** — same disease in multiple specialists, or conflicting confidence levels
3. **Validate tool-backing** — drop any disease that lacks OMIM/ORPHA ID from tool calls
4. **Order tests by yield-per-rupee** — tier 1 (cheap/fast), tier 2 (moderate), tier 3 (expensive/send-out)
5. **Generate HPO referral summary** — copy-paste string for referral letters
6. **Write case conference narrative** — 3–5 sentences the clinician can read in 30 seconds

**Key prompt constraints:**
- Do NOT invent new diseases not present in specialist reports
- Disagreements must be shown explicitly, not smoothed over
- Confidence bands: high/medium/low with explicit reasoning
- Must state when specialists agree (increases confidence) vs disagree (increases uncertainty)
- Common-disease screener note must appear at top if screener flagged anything

---

## System prompt design principles (all agents)

1. **Grounding over fluency** — prefer accurate + hedged over fluent + wrong
2. **Tool-first** — make tool calls before making claims
3. **Indian context by default** — prevalence priors, consanguinity awareness, cost context
4. **Explicit uncertainty** — confidence bands, not false precision
5. **No fabrication** — better to say "insufficient data" than guess
