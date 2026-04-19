from fastapi import FastAPI
from .models import A2AEnvelope
from .orchestrator import run_a2a_pipeline

app = FastAPI(title="HireFlow A2A Orchestrator")

@app.post("/orchestrator")
async def orchestrator_endpoint(envelope: A2AEnvelope):
    if envelope.task_type == "APPLICATION_SUBMITTED":
        result = run_a2a_pipeline(envelope.payload)
        return {
            "status": "success",
            "pipeline": result["pipeline"],
            "report": result["report"]
        }
    return {"status": "error", "message": "Unknown task_type"}
