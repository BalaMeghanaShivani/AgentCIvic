import os
from pathlib import Path
import requests
import logging

logger = logging.getLogger(__name__)

# --- ASI:One API Configuration ---
ASI1_URL = "https://api.asi1.ai/v1/chat/completions"
ASI1_MODEL = "asi1-mini"


def _get_api_key() -> str:
    """Retrieve the ASI:One API key from environment."""
    key = os.getenv("ASI1_API_KEY", "")
    if not key:
        raise RuntimeError(
            "ASI1_API_KEY is not set. "
            "Export it or add it to backend/.env"
        )
    return key


def chat(messages, temperature: float = 0.2, max_tokens: int = 4096) -> str:
    api_key = _get_api_key()

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    }
    payload = {
        "model": ASI1_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    response = requests.post(ASI1_URL, headers=headers, json=payload, timeout=120)
    response.raise_for_status()
    data = response.json()
    # Debug logging
    import pprint
    logger.info(f"ASI:One Response:\n{pprint.pformat(data)}")
    
    if not data.get("choices"):
        return None
    return data["choices"][0]["message"]["content"]


def health_check(timeout_seconds: int = 5) -> bool:
    try:
        api_key = _get_api_key()
    except RuntimeError:
        return False

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    }
    payload = {
        "model": ASI1_MODEL,
        "messages": [
            {"role": "system", "content": "Health check. Reply with OK."},
            {"role": "user", "content": "OK"},
        ],
        "temperature": 0.0,
        "max_tokens": 2,
    }
    try:
        response = requests.post(ASI1_URL, headers=headers, json=payload, timeout=timeout_seconds)
        response.raise_for_status()
        return True
    except requests.RequestException:
        return False
