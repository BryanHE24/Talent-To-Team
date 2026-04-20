import logging
import os
from pathlib import Path
from dotenv import load_dotenv

# Load backend/.env regardless of what directory uvicorn was launched from
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=_env_path, override=True)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models import A2AEnvelope
from .orchestrator import run_a2a_pipeline
from .services.meta_service import generate_meta_summary
from .utils.supabase_client import get_supabase_client, seed_application

logging.basicConfig(level=logging.DEBUG)

app = FastAPI(title="HireFlow A2A Orchestrator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/orchestrator")
async def orchestrator_endpoint(envelope: A2AEnvelope):
    if envelope.task_type == "APPLICATION_SUBMITTED":
        try:
            result = run_a2a_pipeline(envelope.payload)
            return {
                "status": "success",
                "pipeline": result["pipeline"],
                "report": result.get("report", {})
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    return {"status": "error", "message": "Unknown task_type"}

@app.get("/debug-db")
async def debug_db_endpoint():
    """Diagnostic endpoint — remove before production."""
    client = get_supabase_client()
    if not client:
        return {"status": "error", "detail": "No Supabase client — check SUPABASE_URL and SUPABASE_KEY in backend/.env"}
    results = {}
    for table in ["roles", "applications", "reports"]:
        try:
            res = client.table(table).select("*").limit(5).execute()
            results[table] = {"count": len(res.data), "sample": res.data}
        except Exception as e:
            results[table] = {"error": str(e)}
    # Also try a test insertion to roles
    try:
        app_id = seed_application("Debug Tester", "debug@test.com", "Debug Role")
        results["seed_test"] = {"application_id": app_id}
    except Exception as e:
        results["seed_test"] = {"error": str(e)}
    return {"status": "ok", "tables": results}

@app.get("/applications")
async def applications_endpoint():
    """Returns all applications with their related role and report data."""
    client = get_supabase_client()
    if not client:
        return {"status": "error", "detail": "No Supabase client — check backend/.env"}
    try:
        res = client.table("applications") \
            .select("id, candidate_name, email, status, created_at, roles(id, title), reports(id, report_json, created_at)") \
            .order("created_at", desc=True) \
            .execute()
        return {"status": "success", "applications": res.data or []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/meta-summary")
async def meta_summary_endpoint():
    try:
        meta = generate_meta_summary()
        # Return fields flat so the frontend can read them directly
        return {
            "status": "success",
            "top_candidates": meta.get("top_candidates", []),
            "average_score": meta.get("average_score", 0),
            "recommendation": meta.get("recommendation") or meta.get("hiring_recommendation", ""),
            "insights": meta.get("insights", []),
        }
    except Exception as e:
        return {
            "status": "success",
            "top_candidates": [],
            "average_score": 0,
            "recommendation": "Meta-agent temporarily offline.",
            "insights": [str(e)],
        }
