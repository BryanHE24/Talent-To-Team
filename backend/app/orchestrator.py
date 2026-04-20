from .models import ApplicationPayload
from .agents.cv_analyzer import analyze_cv
from .agents.summarizer import summarize_candidate
from .agents.job_matcher import match_candidate
from .agents.report_agent import generate_report
from .utils.supabase_client import seed_application

def route_cv_analyzer(payload: ApplicationPayload) -> dict:
    # Phase 4: Integrated real CV analyzer agent
    return analyze_cv(payload.cv_text)

def route_summarizer(analyzer_output: dict) -> dict:
    # Phase 5: Integrated real Summarizer agent
    return summarize_candidate(analyzer_output)

def route_job_matcher(summary_output: dict) -> dict:
    # Phase 6: Integrated real Job Matcher agent
    return match_candidate(summary_output)

def route_report_agent(match_output: dict, application_id: str = None) -> dict:
    # Phase 7: Integrated real Report Agent
    return generate_report(match_output, application_id)

def run_a2a_pipeline(payload: ApplicationPayload) -> dict:
    # Seed the Candidate Application Record so the Report joins cleanly for the UI
    application_id = seed_application(payload.candidate_name, payload.email, payload.role)

    # Sequential processing mimicking A2A agent chain
    analyzer_out = route_cv_analyzer(payload)
    summarizer_out = route_summarizer(analyzer_out)
    matcher_out = route_job_matcher(summarizer_out)
    report_out = route_report_agent(matcher_out, application_id)

    return {
        "pipeline": [
            "cv_analyzer",
            "summarizer",
            "job_matcher",
            "report_agent"
        ],
        "report": report_out
    }
