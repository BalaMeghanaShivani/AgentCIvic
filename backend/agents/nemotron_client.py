import os
import requests

# --- ASI:One API Configuration ---
ASI1_URL = "https://api.asi1.ai/v1/chat/completions"
ASI1_MODEL = "asi1-mini"


def chat(messages, temperature: float = 0.2, max_tokens: int = 1200) -> str:
    api_key = os.environ.get("ASI1_API_KEY", "")
    if not api_key:
        raise RuntimeError("ASI1_API_KEY is not set")
    response = requests.post(
        ASI1_URL,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        json={
            "model": ASI1_MODEL,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        },
        timeout=120,
    )
    response.raise_for_status()
    data = response.json()
    return data["choices"][0]["message"]["content"]
