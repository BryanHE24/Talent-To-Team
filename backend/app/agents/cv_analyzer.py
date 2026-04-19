import json
from ..utils.openai_client import call_openai_json
from ..prompts.cv_analyzer_prompt import CV_ANALYZER_SYSTEM_PROMPT

def analyze_cv(cv_text: str) -> dict:
    user_prompt = f"CV TEXT:\n{cv_text}"
    
    try:
        response_text = call_openai_json(
            system_prompt=CV_ANALYZER_SYSTEM_PROMPT,
            user_prompt=user_prompt
        )
        parsed_data = json.loads(response_text)
        return parsed_data
    except Exception as e:
        # Fallback dictionary matching output contract on failure
        return {
            "skills": [],
            "experience_years": 0,
            "education": [],
            "certifications": [],
            "summary": f"Failed to analyze CV: {str(e)}"
        }
