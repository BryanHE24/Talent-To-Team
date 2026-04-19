from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models import A2AEnvelope
from .orchestrator import run_a2a_pipeline
from .services.meta_service import generate_meta_summary

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

@app.get("/meta-summary")
async def meta_summary_endpoint():
    try:
        meta = generate_meta_summary()
        return {
            "status": "success",
            "meta": meta
        }
    except Exception as e:
        # Graceful fallback if meta-agent or DB throws uncontrollably
        return {
            "status": "success",
            "meta": {
                "top_candidates": [],
                "average_score": 0,
                "hiring_recommendation": "Engine explicitly unavailable, proceeding manually is advised.",
                "insights": ["Meta-agent is temporarily offline.", str(e)]
            }
        }
