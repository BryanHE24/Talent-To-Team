import logging
import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

# Load backend/.env regardless of what directory uvicorn was launched from
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=_env_path, override=True)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
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


# ── Request model for creating a role ────────────────────────────────────────
class CreateRolePayload(BaseModel):
    title: str
    department: Optional[str] = ""
    location: Optional[str] = ""
    employment_type: Optional[str] = "Full-time"
    salary_range: Optional[str] = ""
    description: str
    requirements: str          # comma-separated skills string
    experience_required: Optional[str] = ""
    priority: Optional[str] = "Medium"
    status: Optional[str] = "Open"


# ── Routes ───────────────────────────────────────────────────────────────────

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


@app.get("/roles")
async def roles_endpoint():
    """Returns all roles with applicant counts."""
    client = get_supabase_client()
    if not client:
        return {"status": "error", "detail": "No Supabase client"}
    try:
        # Fetch roles
        roles_res = client.table("roles").select("*").order("created_at", desc=True).execute()
        roles = roles_res.data or []

        # For each role, count applicants
        for role in roles:
            apps_res = client.table("applications") \
                .select("id", count="exact") \
                .eq("role_id", role["id"]) \
                .execute()
            role["applicant_count"] = apps_res.count or 0

        return {"status": "success", "roles": roles}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/roles")
async def create_role_endpoint(payload: CreateRolePayload):
    """Creates a new role. Immediately visible on Candidate Portal."""
    client = get_supabase_client()
    if not client:
        raise HTTPException(status_code=500, detail="No Supabase client")
    try:
        insert_data = {
            "title":       payload.title,
            "description": payload.description,
            "requirements": payload.requirements,
        }
        # Store extended fields in description if columns don't exist yet
        # (avoids schema change; can be migrated later)
        meta = []
        if payload.department:      meta.append(f"Dept: {payload.department}")
        if payload.location:        meta.append(f"Location: {payload.location}")
        if payload.employment_type: meta.append(f"Type: {payload.employment_type}")
        if payload.salary_range:    meta.append(f"Salary: {payload.salary_range}")
        if payload.experience_required: meta.append(f"XP: {payload.experience_required}")
        if payload.priority:        meta.append(f"Priority: {payload.priority}")
        if payload.status:          meta.append(f"Status: {payload.status}")

        if meta:
            insert_data["description"] = payload.description + "\n\n---\n" + " | ".join(meta)

        res = client.table("roles").insert(insert_data).execute()
        created = res.data[0] if res.data else {}
        return {"status": "success", "role": created}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.patch("/roles/{role_id}")
async def update_role_endpoint(role_id: str, payload: dict):
    """Update role fields (status, etc.)."""
    client = get_supabase_client()
    if not client:
        raise HTTPException(status_code=500, detail="No Supabase client")
    try:
        allowed = {k: v for k, v in payload.items() if k in ("title", "description", "requirements", "status")}
        res = client.table("roles").update(allowed).eq("id", role_id).execute()
        return {"status": "success", "role": res.data[0] if res.data else {}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/roles/{role_id}")
async def archive_role_endpoint(role_id: str):
    """Soft-archive a role by marking it Closed."""
    client = get_supabase_client()
    if not client:
        raise HTTPException(status_code=500, detail="No Supabase client")
    try:
        # We don't hard-delete; just mark the role description with [ARCHIVED]
        res_get = client.table("roles").select("description").eq("id", role_id).execute()
        if not res_get.data:
            raise HTTPException(status_code=404, detail="Role not found")
        current_desc = res_get.data[0].get("description", "")
        archived_desc = current_desc.replace("Status: Open", "Status: Closed").replace("Status: Paused", "Status: Closed")
        if "Status: Closed" not in archived_desc:
            archived_desc += "\n\n---\nStatus: Closed"
        client.table("roles").update({"description": archived_desc}).eq("id", role_id).execute()
        return {"status": "success", "archived": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
    return {"status": "ok", "tables": results}
