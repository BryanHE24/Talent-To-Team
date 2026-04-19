import json
from ..utils.openai_client import call_openai_json
from ..prompts.meta_agent_prompt import META_AGENT_SYSTEM_PROMPT

def analyze_candidate_pool(candidates_list: list) -> dict:
    if not candidates_list:
        return {
            "top_candidates": [],
            "average_score": 0,
            "hiring_recommendation": "No candidates available for analysis.",
            "insights": ["The candidate pool is currently empty."]
        }
        
    user_prompt = f"CANDIDATES POOL DATA:\n{json.dumps(candidates_list, indent=2)}"
    
    try:
        response_text = call_openai_json(
            system_prompt=META_AGENT_SYSTEM_PROMPT,
            user_prompt=user_prompt
        )
        parsed_data = json.loads(response_text)
    except Exception as e:
        parsed_data = {
            "top_candidates": [],
            "average_score": 0,
            "hiring_recommendation": "Error analyzing candidates.",
            "insights": [f"Meta-agent failed: {str(e)}"]
        }
        
    return parsed_data
