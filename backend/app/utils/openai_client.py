import os
from openai import OpenAI

def get_openai_client() -> OpenAI:
    # Leverages OPENAI_API_KEY from environment
    return OpenAI()

def call_openai_json(system_prompt: str, user_prompt: str) -> str:
    client = get_openai_client()
    
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        response_format={"type": "json_object"},
        temperature=0.0
    )
    
    return response.choices[0].message.content
