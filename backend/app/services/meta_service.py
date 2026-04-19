from ..utils.supabase_client import get_supabase_client
from ..agents.meta_agent import analyze_candidate_pool

def generate_meta_summary() -> dict:
    client = get_supabase_client()
    if not client:
        return analyze_candidate_pool([])

    try:
        # Fetch applications and their related reports, fallback to empty list
        response = client.table("applications").select("id, candidate_name, role_id, status, reports(report_json)").execute()
        data = response.data or []
    except Exception as e:
        data = []

    # Map database row structure into LLM-friendly flat context
    aggregated_pool = []
    for app in data:
        # Check if reports exist (one-to-many or one-to-one relationship)
        reports = app.get("reports", [])
        report = reports[0] if isinstance(reports, list) and len(reports) > 0 else (reports if not isinstance(reports, list) else None)
        report_json = report.get("report_json", {}) if report else {}
        
        aggregated_pool.append({
            "candidate_name": app.get("candidate_name", "Unknown"),
            "status": app.get("status", "new"),
            "score": report_json.get("final_score", 0),
            "summary": report_json.get("hr_summary", ""),
            "strengths": report_json.get("strengths", []),
            "risks": report_json.get("risks", [])
        })

    return analyze_candidate_pool(aggregated_pool)
