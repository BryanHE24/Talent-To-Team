import os
import json
import uuid
from supabase import create_client, Client

def get_supabase_client() -> Client:
    url = os.environ.get("SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_KEY", "")
    if not url or not key:
        return None
    return create_client(url, key)

def store_report(report_dict: dict) -> str:
    client = get_supabase_client()
    
    if client:
        try:
            result = client.table("reports").insert({
                "report_json": report_dict
            }).execute()
            if result.data:
                return result.data[0]["id"]
        except Exception as e:
            # Proceed to local stub storage if remote insert fails 
            pass

    # Development-safe fallback that provides REAL persistence to disk
    report_id = str(uuid.uuid4())
    fallback_path = os.path.join(os.path.dirname(__file__), '..', '..', 'local_reports_stub.json')
    
    try:
        with open(fallback_path, 'r') as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        data = {}
        
    data[report_id] = report_dict
    
    with open(fallback_path, 'w') as f:
        json.dump(data, f, indent=2)
        
    return f"local-stub-{report_id}"
