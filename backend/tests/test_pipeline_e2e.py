import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_full_pipeline_e2e():
    payload = {
        "task_type": "APPLICATION_SUBMITTED",
        "payload": {
            "candidate_name": "E2E Test Candidate",
            "email": "e2e@example.com",
            "role": "FastAPI Tester",
            "cv_text": "Experienced Python and FastAPI tester with 5 years of experience."
        }
    }
    
    response = client.post("/orchestrator", json=payload)
    
    # Assert successful orchestration handle
    assert response.status_code == 200
    
    data = response.json()
    assert data.get("status") == "success"
    
    # Verify exact path traversal
    assert "cv_analyzer" in data["pipeline"]
    assert "summarizer" in data["pipeline"]
    assert "job_matcher" in data["pipeline"]
    assert "report_agent" in data["pipeline"]
    
    report = data["report"]
    assert "final_score" in report
    assert "candidate_recommendation" in report
    assert "stored_report_id" in report
