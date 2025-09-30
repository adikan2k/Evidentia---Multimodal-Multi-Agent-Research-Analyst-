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

# ---- TEMP stubs ----
_jobs: Dict[str, Dict] = {}

@app.post("/research/start")
async def start(payload: Dict):
    import uuid
    job_id = str(uuid.uuid4())[:8]
    _jobs[job_id] = {"phase": "planning", "percent": 5, "msg": "Planning sub-questions"}
    return {"job_id": job_id}

@app.get("/status")
async def status(jobId: str):
    phases = ["planning","ingesting","embedding","reranking","drafting","finalizing","done"]
    job = _jobs.get(jobId, {"phase": "planning", "percent": 5})
    i = phases.index(job["phase"])
    if i < len(phases) - 1:
        job["percent"] = min(100, job.get("percent", 0) + 17)
        if job["percent"] >= (i + 1) * (100 // (len(phases) - 1)):
            job["phase"] = phases[i + 1]
    _jobs[jobId] = job
    return job

@app.get("/report")
async def report(id: str):
    html = """
    <h1>Sample Report</h1>
    <p>This is a placeholder. The real writer will produce structured HTML with citations.</p>
    """
    return {
        "html": html,
        "citations": [
            {"claim_span": "Claim example", "quote_span": "Quoted evidence snippet", "url": "https://example.com"}
        ],
    }

