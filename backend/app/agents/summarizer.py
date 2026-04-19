import json
from ..utils.openai_client import call_openai_json
from ..prompts.summarizer_prompt import SUMMARIZER_SYSTEM_PROMPT

def summarize_candidate(analyzer_output: dict) -> dict:
    user_prompt = f"CANDIDATE STRUCTURED DATA:\n{json.dumps(analyzer_output, indent=2)}"
    
    try:
        response_text = call_openai_json(
            system_prompt=SUMMARIZER_SYSTEM_PROMPT,
            user_prompt=user_prompt
        )
        parsed_data = json.loads(response_text)
        return parsed_data
    except Exception as e:
        # Fallback output matching the downstream contract
        return {
            "candidate_brief": f"Failed to summarize candidate: {str(e)}",
            "key_strengths": [],
            "experience_level": "unknown",
            "skill_highlights": []
        }
