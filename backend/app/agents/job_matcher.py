import json
from ..utils.openai_client import call_openai_json
from ..prompts.job_matcher_prompt import JOB_MATCHER_SYSTEM_PROMPT

def match_candidate(summary_output: dict) -> dict:
    user_prompt = f"CANDIDATE SUMMARY DATA:\n{json.dumps(summary_output, indent=2)}"
    
    try:
        response_text = call_openai_json(
            system_prompt=JOB_MATCHER_SYSTEM_PROMPT,
            user_prompt=user_prompt
        )
        parsed_data = json.loads(response_text)
        return parsed_data
    except Exception as e:
        # Fallback output matching the downstream contract
        return {
            "overall_score": 0,
            "category_scores": {
                "skills_fit": 0,
                "experience_fit": 0,
                "role_alignment": 0
            },
            "recommendation": "Error analyzing match",
            "match_rationale": f"Failed to match candidate: {str(e)}"
        }
