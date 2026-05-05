"""
Nidaan — 6-agent pipeline orchestrator.

Flow:
  1. Screener        (Haiku 4.5)   — sequential
  2. Extractor       (Haiku 4.5)   — sequential
  3. Metabolic       (Sonnet 4.6)  ─┐
  4. Neurogenetic    (Sonnet 4.6)  ─┼─ parallel (asyncio.gather)
  5. Immunologic     (Sonnet 4.6)  ─┘
  6. Synthesizer     (Opus 4.7)    — sequential, sees all outputs
"""

import asyncio
import json
import logging
import re
import time
from typing import AsyncGenerator
import anthropic

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

from prompts import (
    SCREENER_PROMPT,
    EXTRACTOR_PROMPT,
    METABOLIC_SPECIALIST_PROMPT,
    NEUROGENETIC_SPECIALIST_PROMPT,
    IMMUNOLOGIC_SPECIALIST_PROMPT,
    SYNTHESIZER_PROMPT,
)
from tools import HPO_TOOLS, SPECIALIST_TOOLS, execute_tool

HAIKU   = "claude-haiku-4-5-20251001"
SONNET  = "claude-sonnet-4-6"
OPUS    = "claude-opus-4-7"

client = anthropic.AsyncAnthropic()


# ─────────────────────────────────────────────────────────────────────────────
# Core: run one agent with a tool-use loop
# ─────────────────────────────────────────────────────────────────────────────

async def run_agent(
    system_prompt: str,
    user_message: str,
    model: str,
    tools: list | None = None,
    max_tool_rounds: int = 8,
    max_tokens: int = 4096,
) -> dict:
    """
    Run a single agent. Handles the tool-use loop automatically.
    Returns the final parsed JSON from the agent's last text block.
    """
    messages = [{"role": "user", "content": user_message}]
    kwargs = {
        "model": model,
        "max_tokens": max_tokens,
        "system": system_prompt,
        "messages": messages,
    }
    if tools:
        kwargs["tools"] = tools

    for _ in range(max_tool_rounds):
        response = await client.messages.create(**kwargs)

        if response.stop_reason == "tool_use":
            # Execute every tool the agent called
            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    result = await execute_tool(block.name, block.input)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": json.dumps(result),
                    })

            # Feed results back and continue
            messages.append({"role": "assistant", "content": response.content})
            messages.append({"role": "user", "content": tool_results})
            kwargs["messages"] = messages

        elif response.stop_reason == "end_turn":
            # Extract JSON from the final text block
            for block in response.content:
                if hasattr(block, "text") and block.text.strip():
                    logging.info("Agent raw output (%d chars): %.300s", len(block.text), block.text)
                    return _extract_json(block.text)
            break

    logging.warning("Agent exhausted %d tool rounds without producing a final response (model=%s)", max_tool_rounds, model)
    return {"error": "Agent did not produce a valid JSON response"}


def _extract_json(text: str) -> dict:
    """Extract JSON from a text that may contain markdown code fences."""
    import logging
    # Try direct parse first
    stripped = text.strip()
    try:
        return json.loads(stripped)
    except json.JSONDecodeError:
        pass
    # Strip markdown fences — greedy match so large nested JSON is captured whole
    match = re.search(r"```(?:json)?\s*(\{.*\})\s*```", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass
    # Last resort: find outermost { ... } block
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass
    logging.warning("_extract_json failed. Raw output (first 1000 chars): %s", text[:1000])
    return {"error": "Could not parse agent JSON", "raw": text[:500]}


# ─────────────────────────────────────────────────────────────────────────────
# Individual agent runners
# ─────────────────────────────────────────────────────────────────────────────

async def run_screener(case_text: str) -> dict:
    return await run_agent(
        system_prompt=SCREENER_PROMPT,
        user_message=f"Case to screen:\n\n{case_text}",
        model=HAIKU,
        tools=None,
    )


async def run_extractor(case_text: str) -> dict:
    return await run_agent(
        system_prompt=EXTRACTOR_PROMPT,
        user_message=f"Extract HPO terms from this case:\n\n{case_text}",
        model=HAIKU,
        tools=HPO_TOOLS,
    )


async def run_metabolic(case_text: str, hpo_terms: list, clinical_summary: str) -> dict:
    msg = _specialist_message(case_text, hpo_terms, clinical_summary)
    return await run_agent(
        system_prompt=METABOLIC_SPECIALIST_PROMPT,
        user_message=msg,
        model=SONNET,
        tools=SPECIALIST_TOOLS,
        max_tool_rounds=14,
    )


async def run_neurogenetic(case_text: str, hpo_terms: list, clinical_summary: str) -> dict:
    msg = _specialist_message(case_text, hpo_terms, clinical_summary)
    return await run_agent(
        system_prompt=NEUROGENETIC_SPECIALIST_PROMPT,
        user_message=msg,
        model=SONNET,
        tools=SPECIALIST_TOOLS,
        max_tool_rounds=14,
    )


async def run_immunologic(case_text: str, hpo_terms: list, clinical_summary: str) -> dict:
    msg = _specialist_message(case_text, hpo_terms, clinical_summary)
    return await run_agent(
        system_prompt=IMMUNOLOGIC_SPECIALIST_PROMPT,
        user_message=msg,
        model=SONNET,
        tools=SPECIALIST_TOOLS,
        max_tool_rounds=14,
    )


async def run_synthesizer(
    screener_out: dict,
    extractor_out: dict,
    metabolic_out: dict,
    neurogenetic_out: dict,
    immunologic_out: dict,
) -> dict:
    msg = f"""You are synthesizing the following specialist reports into a final case conference report.

## Screener output
{json.dumps(screener_out, indent=2)}

## Extractor output (HPO terms + clinical summary)
{json.dumps(extractor_out, indent=2)}

## Metabolic specialist report
{json.dumps(metabolic_out, indent=2)}

## Neurogenetic specialist report
{json.dumps(neurogenetic_out, indent=2)}

## Immunologic specialist report
{json.dumps(immunologic_out, indent=2)}

Produce the unified case conference report as specified."""

    return await run_agent(
        system_prompt=SYNTHESIZER_PROMPT,
        user_message=msg,
        model=OPUS,
        tools=None,
        max_tokens=8192,
    )


def _specialist_message(case_text: str, hpo_terms: list, clinical_summary: str) -> str:
    return f"""Review this case and produce your specialist differential.

## Original case text
{case_text}

## Extracted HPO terms
{json.dumps(hpo_terms, indent=2)}

## Clinical summary (from extractor)
{clinical_summary}

Produce your specialist differential as specified."""


# ─────────────────────────────────────────────────────────────────────────────
# Main pipeline entry point
# ─────────────────────────────────────────────────────────────────────────────

async def run_pipeline(case_text: str) -> dict:
    """
    Run the full 6-agent pipeline and return the case conference result.
    Raises ValueError if screener stops the workup.
    """
    start = time.time()

    # ── Agent 1: Screener ───────────────────────────────────────────────────
    screener_out = await run_screener(case_text)

    if not screener_out.get("proceed_to_rare_workup", True):
        return {
            "stopped_at_screener": True,
            "screener": screener_out,
            "message": "Common disease explains this presentation. No rare disease workup indicated.",
        }

    # ── Agent 2: Extractor ──────────────────────────────────────────────────
    extractor_out = await run_extractor(case_text)
    hpo_terms       = extractor_out.get("hpo_terms", [])
    clinical_summary = extractor_out.get("clinical_summary", "")

    # ── Agents 3+4+5: Parallel specialists ─────────────────────────────────
    metabolic_out, neurogenetic_out, immunologic_out = await asyncio.gather(
        run_metabolic(case_text, hpo_terms, clinical_summary),
        run_neurogenetic(case_text, hpo_terms, clinical_summary),
        run_immunologic(case_text, hpo_terms, clinical_summary),
    )

    # ── Agent 6: Synthesizer ────────────────────────────────────────────────
    result = await run_synthesizer(
        screener_out,
        extractor_out,
        metabolic_out,
        neurogenetic_out,
        immunologic_out,
    )

    result["runtime_seconds"] = round(time.time() - start, 1)
    return result


# ─────────────────────────────────────────────────────────────────────────────
# Streaming pipeline — yields SSE event dicts as each agent completes
# ─────────────────────────────────────────────────────────────────────────────

async def run_pipeline_streaming(case_text: str) -> AsyncGenerator[dict, None]:
    start = time.time()

    yield {"event": "agent_start", "agent": "screener"}
    screener_out = await run_screener(case_text)
    yield {"event": "agent_done", "agent": "screener"}

    if not screener_out.get("proceed_to_rare_workup", True):
        yield {"event": "complete", "result": {
            "stopped_at_screener": True,
            "screener": screener_out,
            "message": "Common disease explains this presentation. No rare disease workup indicated.",
            "runtime_seconds": round(time.time() - start, 1),
        }}
        return

    yield {"event": "agent_start", "agent": "extractor"}
    extractor_out = await run_extractor(case_text)
    yield {"event": "agent_done", "agent": "extractor"}

    hpo_terms        = extractor_out.get("hpo_terms", [])
    clinical_summary = extractor_out.get("clinical_summary", "")

    # All three specialists start simultaneously
    yield {"event": "agent_start", "agent": "metabolic"}
    yield {"event": "agent_start", "agent": "neurogenetic"}
    yield {"event": "agent_start", "agent": "immunologic"}

    metabolic_out, neurogenetic_out, immunologic_out = await asyncio.gather(
        run_metabolic(case_text, hpo_terms, clinical_summary),
        run_neurogenetic(case_text, hpo_terms, clinical_summary),
        run_immunologic(case_text, hpo_terms, clinical_summary),
    )

    yield {"event": "agent_done", "agent": "metabolic"}
    yield {"event": "agent_done", "agent": "neurogenetic"}
    yield {"event": "agent_done", "agent": "immunologic"}

    yield {"event": "agent_start", "agent": "synthesizer"}
    result = await run_synthesizer(
        screener_out, extractor_out, metabolic_out, neurogenetic_out, immunologic_out,
    )
    yield {"event": "agent_done", "agent": "synthesizer"}

    result["runtime_seconds"] = round(time.time() - start, 1)
    yield {"event": "complete", "result": result}
