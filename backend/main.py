"""
Nidaan FastAPI server.

POST /analyze        — run the full 6-agent pipeline (blocking, returns full result)
POST /analyze/stream — same pipeline via SSE (yields agent_start/agent_done/complete events)
GET  /health         — health check
"""

import json
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from pipeline import run_pipeline, run_pipeline_streaming

app = FastAPI(title="Nidaan API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    case_text: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze")
async def analyze(req: AnalyzeRequest):
    if not req.case_text.strip():
        raise HTTPException(status_code=400, detail="case_text is required")
    if len(req.case_text) < 50:
        raise HTTPException(status_code=400, detail="case_text too short — provide full clinical history")

    result = await run_pipeline(req.case_text)
    return result


@app.post("/analyze/stream")
async def analyze_stream(req: AnalyzeRequest):
    if not req.case_text.strip():
        raise HTTPException(status_code=400, detail="case_text is required")
    if len(req.case_text) < 50:
        raise HTTPException(status_code=400, detail="case_text too short — provide full clinical history")

    async def event_stream():
        try:
            async for event in run_pipeline_streaming(req.case_text):
                yield f"data: {json.dumps(event)}\n\n"
        except Exception as exc:
            yield f"data: {json.dumps({'event': 'error', 'message': str(exc)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )
