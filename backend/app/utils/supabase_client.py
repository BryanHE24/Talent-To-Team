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

def seed_application(candidate_name: str, email: str, role_title: str) -> str:
    client = get_supabase_client()
    if not client:
        return None
        
    try:
        # Check if role exists
        role_res = client.table("roles").select("id").eq("title", role_title).execute()
        if role_res.data:
            role_id = role_res.data[0]["id"]
        else:
            # Upsert fallback role
            new_role = client.table("roles").insert({
                "title": role_title,
                "description": "Auto-generated role description",
                "requirements": "Auto-generated requirements"
            }).execute()
            role_id = new_role.data[0]["id"]
            
        # Create candidate application mapping
        app_res = client.table("applications").insert({
            "candidate_name": candidate_name,
            "email": email,
            "cv_url": f"local_simulated_{uuid.uuid4()}.txt",
            "role_id": role_id,
            "status": "new"
        }).execute()
        
        return app_res.data[0]["id"]
    except Exception as e:
        print("SEED APP FAILED:", e)
        return None

def store_report(report_dict: dict, application_id: str = None) -> str:
    client = get_supabase_client()
    
    if client and application_id:
        try:
            result = client.table("reports").insert({
                "application_id": application_id,
                "report_json": report_dict
            }).execute()
            if result.data:
                return result.data[0]["id"]
        except Exception as e:
            # Proceed to local stub storage if remote insert fails 
            print("STORE REPORT FAILED:", e)
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
