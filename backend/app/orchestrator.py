from .models import ApplicationPayload

def route_cv_analyzer(payload: ApplicationPayload) -> dict:
    return {
        "skills": ["Python", "FastAPI"],
        "experience": "4 years",
        "education": "BS Computer Science"
    }

def route_summarizer(analyzer_output: dict) -> dict:
    return {
        "summary": "Strong backend candidate with relevant Python/FastAPI experience.",
        "skills_match": True
    }

def route_job_matcher(summary_output: dict) -> dict:
    return {
        "match_score": 85,
        "recommendation": "Advance to technical interview."
    }

def route_report_agent(match_output: dict) -> dict:
    return {
        "final_decision": "Recommended",
        "score": match_output["match_score"],
        "notes": match_output["recommendation"]
    }

def run_a2a_pipeline(payload: ApplicationPayload) -> dict:
    # Sequential processing mimicking A2A agent chain
    analyzer_out = route_cv_analyzer(payload)
    summarizer_out = route_summarizer(analyzer_out)
    matcher_out = route_job_matcher(summarizer_out)
    report_out = route_report_agent(matcher_out)

    return {
        "pipeline": [
            "cv_analyzer",
            "summarizer",
            "job_matcher",
            "report_agent"
        ],
        "report": report_out
    }
