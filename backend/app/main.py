from typing import Dict
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from health import health_router

app = FastAPI(title="Evidentia – Multimodal Multi-Agent Research Analyst")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(health_router)

# ------------------ Day 5: simple in-memory job store ------------------
from typing import Dict, Any
import time
import uuid

# phases in order
PHASES = ["planning", "ingesting", "embedding", "reranking", "drafting", "finalizing", "done"]

_jobs: Dict[str, Dict[str, Any]] = {}
_reports: Dict[str, Dict[str, Any]] = {}

def _new_job(payload: Dict[str, Any]) -> Dict[str, Any]:
    job_id = str(uuid.uuid4())[:8]
    _jobs[job_id] = {
        "id": job_id,
        "created_at": time.time(),
        "phase": "planning",
        "percent": 5,
        "msg": "Planning sub-questions",
        "options": payload.get("options") or {},
        "query": payload.get("query") or "",
    }
    return _jobs[job_id]

def _advance_job(job: Dict[str, Any]) -> None:
    """Naive auto-advance for demo: each call bumps percent/phase."""
    i = PHASES.index(job["phase"])
    job["percent"] = min(100, job["percent"] + 17)
    if i < len(PHASES) - 1:
        threshold = (i + 1) * (100 // (len(PHASES) - 1))
        if job["percent"] >= threshold:
            job["phase"] = PHASES[i + 1]
            job["msg"] = f"{job['phase'].capitalize()}..."
            if job["phase"] == "done":
                # synthesize a simple placeholder report
                _reports[job["id"]] = {
                    "html": f"""
                      <h1>Sample Report</h1>
                      <p>Query: <strong>{job['query']}</strong></p>
                      <p>This is a placeholder. The real writer will produce structured HTML with citations.</p>
                    """,
                    "citations": [
                        {
                            "claim_span": "Claim example",
                            "quote_span": "Quoted evidence snippet",
                            "url": "https://example.com",
                        }
                    ],
                    "sources": [{"title": "Example Source", "url": "https://example.com"}],
                }

@app.post("/research/start")
async def start_research(payload: Dict[str, Any]):
    job = _new_job(payload)
    return {"job_id": job["id"]}

@app.get("/status")
async def status(jobId: str):
    job = _jobs.get(jobId)
    if not job:
        return {"phase": "planning", "percent": 0, "msg": "Unknown job"}
    _advance_job(job)
    return {"phase": job["phase"], "percent": job["percent"], "msg": job["msg"]}

@app.get("/report")
async def report(jobId: str):
    data = _reports.get(jobId)
    if not data:
        return {"html": "<p>Report not ready yet.</p>", "citations": [], "sources": []}
    return data

# ------------------ Refine actions ------------------
@app.post("/refine/recency")
async def refine_recency(jobId: str):
    rep = _reports.get(jobId)
    if not rep:
        return {"ok": False, "msg": "Report not ready"}
    rep["html"] += "<p><em>Refine: emphasized newer sources.</em></p>"
    return {"ok": True}

@app.post("/refine/counterpoints")
async def refine_counterpoints(jobId: str):
    rep = _reports.get(jobId)
    if not rep:
        return {"ok": False, "msg": "Report not ready"}
    rep["html"] += "<p><em>Refine: added counterpoints section.</em></p>"
    return {"ok": True}

# ------------------ Export ------------------
from fastapi.responses import StreamingResponse
from io import BytesIO

@app.get("/export/pdf")
async def export_pdf(jobId: str):
    # stub: export simple text as "pdf" (real impl: WeasyPrint/Playwright)
    rep = _reports.get(jobId) or {"html": "No report"}
    fake_pdf = BytesIO()
    fake_pdf.write(("PDF placeholder for:\n\n" + rep["html"]).encode("utf-8"))
    fake_pdf.seek(0)
    return StreamingResponse(fake_pdf, media_type="application/pdf",
                             headers={"Content-Disposition": f'attachment; filename="report-{jobId}.pdf"'})


