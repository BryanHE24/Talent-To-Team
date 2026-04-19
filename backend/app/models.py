from pydantic import BaseModel

class ApplicationPayload(BaseModel):
    candidate_name: str
    email: str
    role: str
    cv_text: str

class A2AEnvelope(BaseModel):
    task_type: str
    payload: ApplicationPayload
