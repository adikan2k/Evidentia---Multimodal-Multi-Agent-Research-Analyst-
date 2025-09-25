from fastapi import FastAPI
from health import health_router

app = FastAPI(title="Evidentia - Multimodal Multi-Agent Research Analyst")
app.include_router(health_router)
