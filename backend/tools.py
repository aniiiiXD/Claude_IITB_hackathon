"""
Tool definitions and implementations for Nidaan agents.

Disease lookups (search_omim / get_omim_entry) cascade through:
  1. NCBI MedGen via E-utilities (canonical, includes OMIM cross-refs and HPO terms)
  2. Wikipedia REST API (clinical narrative, often includes OMIM/ORPHA in infobox)
  3. Hardcoded stub (last-resort offline mode)

The OMIM API itself is NOT scraped — its ToS forbids it. MedGen is NIH's
public clinical genetics database and is fully API-accessible without a key.
"""

import logging
import os
import re
import time
import xml.etree.ElementTree as ET
from typing import Any

import httpx

log = logging.getLogger("nidaan.tools")

# ─────────────────────────────────────────────────────────────────────────────
# Tool schemas — passed to Anthropic API as tool definitions
# ─────────────────────────────────────────────────────────────────────────────

HPO_TOOLS = [
    {
        "name": "search_hpo",
        "description": "Search the Human Phenotype Ontology for a clinical finding. Returns HP: term IDs and names.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Clinical finding to search, e.g. 'splenomegaly'"},
                "limit": {"type": "integer", "description": "Max results to return", "default": 5}
            },
            "required": ["query"]
        }
    },
    {
        "name": "get_hpo_term",
        "description": "Get details for a specific HPO term by its HP: identifier.",
        "input_schema": {
            "type": "object",
            "properties": {
                "term_id": {"type": "string", "description": "HPO term ID e.g. HP:0001744"}
            },
            "required": ["term_id"]
        }
    }
]

SPECIALIST_TOOLS = [
    {
        "name": "search_omim",
        "description": "Search for a Mendelian disease by name. Returns MIM number, official name, gene, inheritance pattern, and short definition. Backed by NCBI MedGen + Wikipedia (no OMIM API key needed).",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Disease name to search, e.g. 'Gaucher disease type 1'"},
                "limit": {"type": "integer", "description": "Max results", "default": 3}
            },
            "required": ["query"]
        }
    },
    {
        "name": "get_omim_entry",
        "description": "Get the full disease entry for a specific MIM number. Returns clinical features (HPO-linked), gene, inheritance, and a clinical synopsis.",
        "input_schema": {
            "type": "object",
            "properties": {
                "mim_number": {"type": "string", "description": "MIM number e.g. '230800'"}
            },
            "required": ["mim_number"]
        }
    },
    {
        "name": "search_orphanet",
        "description": "Search Orphanet for a rare disease. Returns ORPHA code and disease details.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Disease name to search, e.g. 'Gaucher disease'"},
                "limit": {"type": "integer", "description": "Max results", "default": 3}
            },
            "required": ["query"]
        }
    },
    {
        "name": "get_orphanet_phenotypes",
        "description": "Get HPO phenotype frequencies for a disease from Orphanet.",
        "input_schema": {
            "type": "object",
            "properties": {
                "orpha_code": {"type": "string", "description": "Orphanet code e.g. '355'"}
            },
            "required": ["orpha_code"]
        }
    },
    {
        "name": "search_pubmed",
        "description": "Search PubMed for medical literature. Use for Indian epidemiology data or disease prevalence studies.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "PubMed search query e.g. 'Gaucher disease India prevalence'"},
                "max_results": {"type": "integer", "description": "Max articles to return", "default": 3}
            },
            "required": ["query"]
        }
    }
]


# ─────────────────────────────────────────────────────────────────────────────
# Tool executor
# ─────────────────────────────────────────────────────────────────────────────

async def execute_tool(tool_name: str, tool_input: dict) -> dict:
    handlers = {
        "search_hpo":              search_hpo,
        "get_hpo_term":            get_hpo_term,
        "search_omim":             search_omim,
        "get_omim_entry":          get_omim_entry,
        "search_orphanet":         search_orphanet,
        "get_orphanet_phenotypes": get_orphanet_phenotypes,
        "search_pubmed":           search_pubmed,
    }
    handler = handlers.get(tool_name)
    if not handler:
        return {"error": f"Unknown tool: {tool_name}"}
    try:
        return await handler(**tool_input)
    except Exception as e:
        log.exception("tool failed: %s(%s)", tool_name, tool_input)
        return {"error": str(e), "tool": tool_name, "input": tool_input}


# ─────────────────────────────────────────────────────────────────────────────
# Cache — dedupes calls across the 3 specialist agents querying the same disease
# ─────────────────────────────────────────────────────────────────────────────

_CACHE: dict[str, tuple[float, Any]] = {}
_CACHE_TTL = 30 * 60  # 30 min

def _cache_get(key: str):
    item = _CACHE.get(key)
    if not item:
        return None
    ts, value = item
    if time.time() - ts > _CACHE_TTL:
        _CACHE.pop(key, None)
        return None
    return value

def _cache_set(key: str, value: Any):
    _CACHE[key] = (time.time(), value)


# ─────────────────────────────────────────────────────────────────────────────
# HPO API
# ─────────────────────────────────────────────────────────────────────────────

HPO_BASE = "https://ontology.jax.org/api/hp"

async def search_hpo(query: str, limit: int = 5) -> dict:
    url = f"{HPO_BASE}/search"
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(url, params={"q": query, "limit": limit})
        r.raise_for_status()
        return r.json()


async def get_hpo_term(term_id: str) -> dict:
    url = f"{HPO_BASE}/terms/{term_id}"
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(url)
        r.raise_for_status()
        return r.json()


# ─────────────────────────────────────────────────────────────────────────────
# NCBI E-utilities (PubMed, MedGen, etc.)
# ─────────────────────────────────────────────────────────────────────────────

NCBI_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
NCBI_EMAIL = os.getenv("PUBMED_EMAIL", "nidaan@demo.in")
NCBI_API_KEY = os.getenv("NCBI_API_KEY", "")  # optional — boosts rate limit 3→10 req/s

def _ncbi_params(extra: dict) -> dict:
    p = {"email": NCBI_EMAIL, **extra}
    if NCBI_API_KEY:
        p["api_key"] = NCBI_API_KEY
    return p

async def _ncbi_get(client: httpx.AsyncClient, endpoint: str, params: dict) -> httpx.Response:
    """Single NCBI GET with retry on 429."""
    url = f"{NCBI_BASE}/{endpoint}"
    for attempt in range(3):
        r = await client.get(url, params=_ncbi_params(params))
        if r.status_code != 429:
            return r
        await _sleep(0.5 * (attempt + 1))
    return r

async def _sleep(seconds: float):
    import asyncio
    await asyncio.sleep(seconds)


# ─────────────────────────────────────────────────────────────────────────────
# MedGen — primary OMIM replacement
# ─────────────────────────────────────────────────────────────────────────────

async def _medgen_search(query: str, limit: int = 5) -> list[str]:
    """Return MedGen UIDs matching query."""
    async with httpx.AsyncClient(timeout=15) as client:
        r = await _ncbi_get(client, "esearch.fcgi", {
            "db": "medgen", "term": query, "retmax": limit, "retmode": "json"
        })
        if r.status_code != 200:
            return []
        return r.json().get("esearchresult", {}).get("idlist", [])


async def _medgen_summary(uids: list[str]) -> dict:
    """Fetch summary entries for MedGen UIDs."""
    if not uids:
        return {}
    async with httpx.AsyncClient(timeout=15) as client:
        r = await _ncbi_get(client, "esummary.fcgi", {
            "db": "medgen", "id": ",".join(uids), "retmode": "json"
        })
        if r.status_code != 200:
            return {}
        return r.json().get("result", {})


def _parse_concept_meta(xml_str: str) -> dict:
    """Parse the conceptmeta XML blob from a MedGen esummary entry."""
    out = {
        "omim_ids": [],
        "hpo_terms": [],          # list of {id, name}
        "genes": [],              # list of gene symbols
        "inheritance": [],        # list of mode strings
        "clinical_features": [],  # list of {name, hpo_id?}
    }
    if not xml_str:
        return out
    try:
        root = ET.fromstring(f"<root>{xml_str}</root>")
    except ET.ParseError:
        return out

    # OMIM IDs
    for mim in root.findall(".//OMIM/MIM"):
        if mim.text:
            out["omim_ids"].append(mim.text.strip())

    # Names that reference OMIM (sometimes only place the MIM number appears)
    for name in root.findall(".//Names/Name[@SAB='OMIM']"):
        sdui = name.attrib.get("SDUI", "")
        if sdui.isdigit() and sdui not in out["omim_ids"]:
            out["omim_ids"].append(sdui)

    # HPO-linked clinical features
    for name in root.findall(".//Names/Name[@SAB='HPO']"):
        hp_id = name.attrib.get("CODE") or name.attrib.get("SDUI")
        if hp_id and hp_id.startswith("HP:") and name.text:
            out["hpo_terms"].append({"id": hp_id, "name": name.text.strip()})

    # Mode of inheritance
    for moi in root.findall(".//ModesOfInheritance/ModeOfInheritance"):
        text = (moi.findtext("Name") or moi.text or "").strip()
        if text:
            out["inheritance"].append(text)

    # Associated genes
    for gene in root.findall(".//AssociatedGenes/Gene"):
        sym = gene.attrib.get("gene_symbol") or (gene.text or "").strip()
        if sym:
            out["genes"].append(sym)

    # Clinical features (when not also HPO-linked)
    for cf in root.findall(".//ClinicalFeatures/ClinicalFeature"):
        name_el = cf.find("Name")
        sab = cf.find("SAB")
        if name_el is not None and name_el.text:
            entry = {"name": name_el.text.strip()}
            if sab is not None and sab.text == "HPO":
                hp_id = cf.attrib.get("CODE") or cf.findtext("CODE")
                if hp_id:
                    entry["hpo_id"] = hp_id
            out["clinical_features"].append(entry)

    return out


def _normalize_medgen_entry(uid: str, raw: dict) -> dict:
    """Turn a raw MedGen esummary entry into our shared shape."""
    meta = _parse_concept_meta(raw.get("conceptmeta", ""))
    return {
        "source": "medgen",
        "medgen_uid": uid,
        "title": raw.get("title", ""),
        "definition": (raw.get("definition") or {}).get("value", ""),
        "omim_id": meta["omim_ids"][0] if meta["omim_ids"] else None,
        "all_omim_ids": meta["omim_ids"],
        "gene": meta["genes"][0] if meta["genes"] else None,
        "all_genes": meta["genes"],
        "inheritance": meta["inheritance"][0] if meta["inheritance"] else None,
        "hpo_terms": meta["hpo_terms"],
        "clinical_features": meta["clinical_features"],
    }


# ─────────────────────────────────────────────────────────────────────────────
# Wikipedia REST API — narrative fallback
# ─────────────────────────────────────────────────────────────────────────────

WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php"
WIKIPEDIA_REST = "https://en.wikipedia.org/api/rest_v1"
USER_AGENT = "Nidaan/1.0 (nidaan@demo.in)"

async def _wikipedia_search(query: str, limit: int = 3) -> list[str]:
    """Return Wikipedia article titles matching query."""
    async with httpx.AsyncClient(timeout=10, headers={"User-Agent": USER_AGENT}) as client:
        r = await client.get(WIKIPEDIA_API, params={
            "action": "opensearch", "search": query, "limit": limit, "format": "json"
        })
        if r.status_code != 200:
            return []
        data = r.json()
        # opensearch returns [query, [titles], [descs], [urls]]
        return data[1] if isinstance(data, list) and len(data) > 1 else []


async def _wikipedia_summary(title: str) -> dict | None:
    async with httpx.AsyncClient(timeout=10, headers={"User-Agent": USER_AGENT}) as client:
        r = await client.get(f"{WIKIPEDIA_REST}/page/summary/{title.replace(' ', '_')}")
        if r.status_code != 200:
            return None
        return r.json()


async def _wikipedia_infobox_facts(title: str) -> dict:
    """Fetch the article's infobox text and extract OMIM/ORPHA/Gene/Inheritance lines."""
    async with httpx.AsyncClient(timeout=10, headers={"User-Agent": USER_AGENT}) as client:
        r = await client.get(WIKIPEDIA_API, params={
            "action": "parse", "page": title, "prop": "wikitext",
            "section": 0, "format": "json", "redirects": 1,
        })
        if r.status_code != 200:
            return {}
        wikitext = r.json().get("parse", {}).get("wikitext", {}).get("*", "")

    facts = {}
    # OMIM number (also written as MIM, OMIM_mult)
    for pattern in (r"OMIM(?:_mult)?\s*=\s*(\d{6})", r"\|\s*MIM\s*=\s*(\d{6})"):
        m = re.search(pattern, wikitext)
        if m:
            facts["omim_id"] = m.group(1)
            break
    # Orphanet (OrphaNum, ORPHA, Orphanet — case-insensitive)
    for pattern in (r"OrphaNum\s*=\s*(\d+)", r"ORPHA\s*=\s*(\d+)", r"Orphanet\s*=\s*(\d+)"):
        m = re.search(pattern, wikitext, re.IGNORECASE)
        if m:
            facts["orpha_code"] = m.group(1)
            break
    gene_match = re.search(r"\|\s*[Gg]ene\s*=\s*\[\[([A-Z0-9]+)", wikitext)
    if gene_match:
        facts["gene"] = gene_match.group(1)
    return facts


async def _wikipedia_disease_lookup(query: str) -> dict | None:
    """Compose: search → summary → infobox facts."""
    titles = await _wikipedia_search(query, limit=1)
    if not titles:
        return None
    title = titles[0]
    summary = await _wikipedia_summary(title)
    if not summary or summary.get("type") == "disambiguation":
        return None
    facts = await _wikipedia_infobox_facts(title)
    return {
        "source": "wikipedia",
        "title": summary.get("title", title),
        "definition": summary.get("extract", ""),
        "omim_id": facts.get("omim_id"),
        "all_omim_ids": [facts["omim_id"]] if facts.get("omim_id") else [],
        "gene": facts.get("gene"),
        "all_genes": [facts["gene"]] if facts.get("gene") else [],
        "orpha_code": facts.get("orpha_code"),
        "inheritance": None,
        "hpo_terms": [],
        "clinical_features": [],
    }


# ─────────────────────────────────────────────────────────────────────────────
# search_omim / get_omim_entry — multi-source resolvers
# ─────────────────────────────────────────────────────────────────────────────

async def search_omim(query: str, limit: int = 3) -> dict:
    cache_key = f"search_omim:{query.lower()}:{limit}"
    cached = _cache_get(cache_key)
    if cached is not None:
        log.info("search_omim cache hit: %r", query)
        return {**cached, "cache": True}

    # 1. MedGen
    try:
        uids = await _medgen_search(query, limit=limit)
        if uids:
            summaries = await _medgen_summary(uids)
            results = [_normalize_medgen_entry(uid, summaries.get(uid, {})) for uid in uids if summaries.get(uid)]
            # Prefer entries with an OMIM ID
            results.sort(key=lambda e: 0 if e.get("omim_id") else 1)
            if results:
                payload = {"query": query, "results": results, "source": "medgen"}
                _cache_set(cache_key, payload)
                log.info("search_omim served from medgen: %r → %d hits", query, len(results))
                return payload
    except Exception as e:
        log.warning("medgen search failed for %r: %s", query, e)

    # 2. Wikipedia
    try:
        wiki = await _wikipedia_disease_lookup(query)
        if wiki:
            payload = {"query": query, "results": [wiki], "source": "wikipedia"}
            _cache_set(cache_key, payload)
            log.info("search_omim served from wikipedia: %r", query)
            return payload
    except Exception as e:
        log.warning("wikipedia lookup failed for %r: %s", query, e)

    # 3. Stub
    log.info("search_omim falling back to stub: %r", query)
    return _omim_stub(query)


async def get_omim_entry(mim_number: str) -> dict:
    cache_key = f"get_omim_entry:{mim_number}"
    cached = _cache_get(cache_key)
    if cached is not None:
        log.info("get_omim_entry cache hit: %s", mim_number)
        return {**cached, "cache": True}

    # 1. MedGen by OMIM ID
    try:
        uids = await _medgen_search(f"{mim_number}[MIM]", limit=1)
        if uids:
            summaries = await _medgen_summary(uids)
            entry = _normalize_medgen_entry(uids[0], summaries.get(uids[0], {}))
            if entry.get("title"):
                payload = {"mim_number": mim_number, "entry": entry, "source": "medgen"}
                _cache_set(cache_key, payload)
                log.info("get_omim_entry served from medgen: %s → %s", mim_number, entry["title"])
                return payload
    except Exception as e:
        log.warning("medgen lookup failed for MIM %s: %s", mim_number, e)

    # 2. Stub (Wikipedia is harder without a name; skip directly to stub)
    stub = _omim_entry_stub(mim_number)
    log.info("get_omim_entry falling back to stub: %s", mim_number)
    return stub


# ─────────────────────────────────────────────────────────────────────────────
# Orphanet — try API, fall back to Wikipedia infobox, then stub
# ─────────────────────────────────────────────────────────────────────────────

ORPHANET_BASE = "https://api.orphacode.org/EN/ClinicalEntity"
ORPHANET_KEY = os.getenv("ORPHANET_API_KEY", "orphanet")

async def search_orphanet(query: str, limit: int = 3) -> dict:
    cache_key = f"search_orphanet:{query.lower()}"
    cached = _cache_get(cache_key)
    if cached is not None:
        return {**cached, "cache": True}

    # 1. Orphanet API
    try:
        url = f"{ORPHANET_BASE}/approximateName"
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(url, params={"name": query, "lang": "EN"},
                                 headers={"apiKey": ORPHANET_KEY})
            if r.status_code == 200:
                payload = {"query": query, "results": r.json(), "source": "orphanet"}
                _cache_set(cache_key, payload)
                log.info("search_orphanet served from orphanet API: %r", query)
                return payload
    except Exception as e:
        log.warning("orphanet API failed for %r: %s", query, e)

    # 2. Wikipedia infobox (often has Orphanet code)
    try:
        wiki = await _wikipedia_disease_lookup(query)
        if wiki and wiki.get("orpha_code"):
            entry = {
                "orphaCode": wiki["orpha_code"],
                "name": wiki["title"],
                "summary": wiki.get("definition", ""),
                "source": "wikipedia",
            }
            payload = {"query": query, "results": [entry], "source": "wikipedia"}
            _cache_set(cache_key, payload)
            log.info("search_orphanet served from wikipedia: %r → ORPHA:%s", query, wiki["orpha_code"])
            return payload
    except Exception as e:
        log.warning("wikipedia orphanet lookup failed for %r: %s", query, e)

    log.info("search_orphanet falling back to stub: %r", query)
    return _orphanet_stub(query)


async def get_orphanet_phenotypes(orpha_code: str) -> dict:
    url = f"{ORPHANET_BASE}/ORPHAcode/{orpha_code}/ClinicalSigns"
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            r = await client.get(url, headers={"apiKey": ORPHANET_KEY})
            if r.status_code == 200:
                return {"orpha_code": orpha_code, "phenotypes": r.json(), "source": "orphanet"}
        except Exception as e:
            log.warning("orphanet phenotypes failed for %s: %s", orpha_code, e)
    return {"orpha_code": orpha_code, "phenotypes": [], "error": "API unavailable"}


# ─────────────────────────────────────────────────────────────────────────────
# PubMed
# ─────────────────────────────────────────────────────────────────────────────

async def search_pubmed(query: str, max_results: int = 3) -> dict:
    async with httpx.AsyncClient(timeout=15) as client:
        search_r = await _ncbi_get(client, "esearch.fcgi", {
            "db": "pubmed", "term": query, "retmax": max_results, "retmode": "json"
        })
        search_r.raise_for_status()
        ids = search_r.json().get("esearchresult", {}).get("idlist", [])
        if not ids:
            return {"query": query, "results": []}

        summary_r = await _ncbi_get(client, "esummary.fcgi", {
            "db": "pubmed", "id": ",".join(ids), "retmode": "json"
        })
        summary_r.raise_for_status()
        data = summary_r.json().get("result", {})

        results = []
        for pmid in ids:
            entry = data.get(pmid, {})
            results.append({
                "pmid": pmid,
                "title": entry.get("title", ""),
                "journal": entry.get("fulljournalname", ""),
                "year": entry.get("pubdate", "")[:4] if entry.get("pubdate") else ""
            })
        return {"query": query, "results": results}


# ─────────────────────────────────────────────────────────────────────────────
# Stubs — last-resort offline mode (also used by hardcoded demo cases)
# ─────────────────────────────────────────────────────────────────────────────

_OMIM_KNOWN = {
    "230800": {"mimNumber": "230800", "preferredTitle": "GAUCHER DISEASE, TYPE 1", "gene": "GBA", "inheritance": "Autosomal recessive"},
    "253550": {"mimNumber": "253550", "preferredTitle": "SPINAL MUSCULAR ATROPHY, TYPE II", "gene": "SMN1", "inheritance": "Autosomal recessive"},
    "310200": {"mimNumber": "310200", "preferredTitle": "MUSCULAR DYSTROPHY, DUCHENNE TYPE", "gene": "DMD", "inheritance": "X-linked recessive"},
    "277900": {"mimNumber": "277900", "preferredTitle": "WILSON DISEASE", "gene": "ATP7B", "inheritance": "Autosomal recessive"},
    "301000": {"mimNumber": "301000", "preferredTitle": "WISKOTT-ALDRICH SYNDROME", "gene": "WAS", "inheritance": "X-linked recessive"},
    "257220": {"mimNumber": "257220", "preferredTitle": "NIEMANN-PICK DISEASE, TYPE C1", "gene": "NPC1", "inheritance": "Autosomal recessive"},
    "607616": {"mimNumber": "607616", "preferredTitle": "NIEMANN-PICK DISEASE, TYPE B", "gene": "SMPD1", "inheritance": "Autosomal recessive"},
    "232300": {"mimNumber": "232300", "preferredTitle": "GLYCOGEN STORAGE DISEASE II; POMPE DISEASE", "gene": "GAA", "inheritance": "Autosomal recessive"},
}

_ORPHA_KNOWN = {
    "gaucher": {"orphaCode": "355", "name": "Gaucher disease type 1"},
    "sma":     {"orphaCode": "83418", "name": "Spinal muscular atrophy type 2"},
    "dmd":     {"orphaCode": "98896", "name": "Duchenne muscular dystrophy"},
    "wilson":  {"orphaCode": "905", "name": "Wilson disease"},
    "was":     {"orphaCode": "906", "name": "Wiskott-Aldrich syndrome"},
}

def _omim_stub(query: str) -> dict:
    q = query.lower()
    for entry in _OMIM_KNOWN.values():
        if any(word in entry["preferredTitle"].lower() for word in q.split()):
            return {"query": query, "results": [entry], "source": "stub"}
    return {"query": query, "results": [], "source": "stub", "note": f"No data found for {query!r}"}

def _omim_entry_stub(mim_number: str) -> dict:
    entry = _OMIM_KNOWN.get(mim_number)
    if entry:
        return {"mim_number": mim_number, "entry": entry, "source": "stub"}
    return {"mim_number": mim_number, "entry": {"mimNumber": mim_number}, "source": "stub",
            "note": "No data available"}

def _orphanet_stub(query: str) -> dict:
    q = query.lower()
    for key, entry in _ORPHA_KNOWN.items():
        if key in q or key in entry["name"].lower():
            return {"query": query, "results": [entry], "source": "stub"}
    return {"query": query, "results": [], "source": "stub", "note": f"No data found for {query!r}"}
