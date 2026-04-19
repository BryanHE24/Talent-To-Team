import json
from ..utils.openai_client import call_openai_json
from ..prompts.report_agent_prompt import REPORT_AGENT_SYSTEM_PROMPT
from ..utils.supabase_client import store_report

def generate_report(match_output: dict) -> dict:
    user_prompt = f"MATCHER DATA:\n{json.dumps(match_output, indent=2)}"
    
    try:
        response_text = call_openai_json(
            system_prompt=REPORT_AGENT_SYSTEM_PROMPT,
            user_prompt=user_prompt
        )
        parsed_data = json.loads(response_text)
    except Exception as e:
        parsed_data = {
            "candidate_recommendation": "Error",
            "final_score": 0,
            "strengths": [],
            "risks": [],
            "hr_summary": f"Failed to generate report: {str(e)}"
        }

    # Persist structured report to Supabase
    stored_report_id = store_report(parsed_data)
    
    # Enforce strict output contract including the DB record ID
    parsed_data["stored_report_id"] = stored_report_id
    
    return parsed_data
