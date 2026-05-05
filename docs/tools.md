# Nidaan — External Tools & APIs

## Overview

| API | Used by | Auth | Rate limit concern |
|---|---|---|---|
| HPO API (JAX) | Extractor | None (public) | Low — public, generous |
| OMIM API | All specialists | API key required | Medium — 10 req/sec |
| Orphanet API | All specialists | API key (free) | Low |
| PubMed E-utilities | All specialists | None (public) | Medium — 3 req/sec without key |

---

## 1. HPO API (Human Phenotype Ontology)

**Base URL:** `https://hpo.jax.org/api/hpo`

**Endpoints we use:**

| Endpoint | Purpose |
|---|---|
| `GET /search?q={query}` | Search HPO terms by clinical text |
| `GET /term/{hpo_id}` | Get term details (definition, synonyms) |
| `GET /term/{hpo_id}/diseases` | Get diseases associated with a term |

**Example:** Searching "seizures" → returns `HP:0001250` with definition and associated diseases

**No API key required.** Public and free.

**Tool definitions exposed to agents:**
- `search_hpo_terms(query, max_results)`
- `get_hpo_term(hpo_id)`
- `get_diseases_for_hpo(hpo_id)`

---

## 2. OMIM API

**Base URL:** `https://api.omim.org/api`

**Registration:** Free academic/research key at https://www.omim.org/api

**Endpoints we use:**

| Endpoint | Purpose |
|---|---|
| `GET /entry/search?search={query}` | Search diseases/genes |
| `GET /entry?mimNumber={mim}` | Get full entry with clinical synopsis |

**Key fields we extract:**
- `mimNumber` — unique disease ID (e.g. `230800` for Gaucher disease type 1)
- `titles.preferredTitle` — canonical disease name
- `clinicalSynopsis` — structured phenotype data
- `geneMap` — associated gene(s)
- `textSectionList` — inheritance, molecular genetics

**Environment variable:** `OMIM_API_KEY`

**Tool definitions exposed to agents:**
- `search_omim(query, limit)`
- `get_omim_entry(mim_number)`

---

## 3. Orphanet API

**Base URL:** `https://api.orphacode.org/EN/ClinicalEntity`

**Registration:** Free at https://api.orphacode.org

**Endpoints we use:**

| Endpoint | Purpose |
|---|---|
| `GET /approximateName?name={query}` | Fuzzy search by disease name |
| `GET /ORPHAcode/{code}/ClassificationLevel` | Get disease details |
| `GET /ORPHAcode/{code}/ClinicalSigns` | Get HPO phenotypes with frequencies |

**Key value:** Orphanet has HPO frequency data per disease — we use this to match "how often does this feature appear in confirmed disease X" for confidence scoring.

**Environment variable:** `ORPHANET_API_KEY` (or use public key `orphanet` for testing)

**Tool definitions exposed to agents:**
- `search_orphanet(query, limit)`
- `get_orphanet_entry(orpha_code)`
- `get_orphanet_phenotypes(orpha_code)`

---

## 4. PubMed E-utilities

**Base URL:** `https://eutils.ncbi.nlm.nih.gov/entrez/eutils`

**No API key required** (but registering an email gets higher rate limits)

**Endpoints we use:**

| Endpoint | Purpose |
|---|---|
| `GET /esearch.fcgi?db=pubmed&term={query}` | Search for PMIDs |
| `GET /esummary.fcgi?db=pubmed&id={ids}` | Get article metadata |

**How agents use this:**
- Specialists search PubMed for Indian case reports or epidemiology to support their differentials
- Example query: `"Gaucher disease India prevalence [MeSH Terms]"`
- We use it to cite real evidence, not to pull full text

**Tool definitions exposed to agents:**
- `search_pubmed(query, max_results)`

---

## API fallback strategy (for demo reliability)

**Problem:** Live API calls can fail during a demo. OMIM is particularly important.

**Solution:** Pre-cache all expected tool responses for the hero case (Ahmedabad Gaucher).

```python
# cache/gaucher_hero_case.json
{
  "omim_230800": { ... full OMIM entry ... },
  "orpha_355": { ... full Orphanet entry ... },
  "hpo_HP:0001744": { ... splenomegaly term ... },
  ...
}
```

If a live API call fails, the tool executor falls back to the cache file. The demo always runs.

**Implementation:** Wrap each tool executor with a try/cache fallback. Run `python cache_hero_case.py` before the demo to pre-populate.

---

## What we do NOT use

- **GeneReviews:** Accessible via NCBI Bookshelf but no structured API — mentioned in plan but we'll use PubMed to find GeneReview PMIDs instead
- **IEMbase:** Requires institutional access — use OMIM + Orphanet as substitute
- **ClinVar:** Too variant-specific; not useful at differential stage
- **HGMD:** Paywalled
