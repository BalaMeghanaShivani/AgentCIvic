"""
AgentCivic — Centralized environment configuration.

Loads all environment variables via python-dotenv, validates required
keys on import, and exports them as typed constants.

Usage:
    from config import ASI1_API_KEY, LA_311_BASE_URL, BACKEND_PORT
"""

import os
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Load .env files (project root first, then backend-local)
# ---------------------------------------------------------------------------

try:
    from dotenv import load_dotenv
except ImportError:
    # Minimal fallback if python-dotenv is not installed
    def load_dotenv(*_a, **_kw):
        pass

_PROJECT_ROOT = Path(__file__).resolve().parent.parent
_BACKEND_DIR = Path(__file__).resolve().parent

# Root .env has all keys; backend .env can override
load_dotenv(_PROJECT_ROOT / ".env")
load_dotenv(_BACKEND_DIR / ".env", override=True)


# ===================================================================
# Helper
# ===================================================================

def _require(key: str) -> str:
    """Return env var value or exit with a clear error message."""
    value = os.getenv(key, "").strip()
    if not value or value.startswith("your_"):
        if key == "ASI1_API_KEY":
            print(f"\n⚠️  Warning: Missing required environment variable: {key}")
            print("   → Agents will fail if they try to use the LLM.")
            print("   → See .env.example for documentation.\n", file=sys.stderr)
        else:
            print(
                f"\n❌  Missing required environment variable: {key}\n"
                f"   → Set it in .env or export it before running.\n"
                f"   → See .env.example for documentation.\n",
                file=sys.stderr,
            )
            sys.exit(1)
    return value


def _optional(key: str, default: str = "") -> str:
    """Return env var value or a default — never fails."""
    return os.getenv(key, default).strip() or default


def _int(key: str, default: int) -> int:
    """Return env var as int, with fallback."""
    raw = os.getenv(key, "")
    try:
        return int(raw)
    except (ValueError, TypeError):
        return default


# ===================================================================
# FETCH.AI / ASI:ONE
# ===================================================================

ASI1_API_KEY: str = _require("ASI1_API_KEY")
ASI1_MODEL: str = "asi1-mini"
ASI1_URL: str = "https://api.asi1.ai/v1/chat/completions"

AGENTVERSE_TOKEN: str = _optional("AGENTVERSE_TOKEN")

# Agent seeds (deterministic identity on Agentverse)
ORCHESTRATOR_SEED: str = _optional("AGENTCIVIC_ORCHESTRATOR_SEED", "agentcivic-orchestrator-default-seed")
PROPOSER_SEED: str = _optional("AGENTCIVIC_PROPOSER_SEED", "agentcivic-proposer-default-seed")
VERIFIER_SEED: str = _optional("AGENTCIVIC_VERIFIER_SEED", "agentcivic-verifier-default-seed")
REDTEAM_SEED: str = _optional("AGENTCIVIC_REDTEAM_SEED", "agentcivic-redteam-default-seed")

# Agent ports
ORCHESTRATOR_PORT: int = _int("ORCHESTRATOR_PORT", 8010)
PROPOSER_PORT: int = _int("PROPOSER_PORT", 8011)
VERIFIER_PORT: int = _int("VERIFIER_PORT", 8012)
REDTEAM_PORT: int = _int("REDTEAM_PORT", 8013)


# ===================================================================
# LA 311 OPEN DATA
# ===================================================================

LA_311_APP_TOKEN: str = _optional("LA_311_APP_TOKEN")
LA_311_BASE_URL: str = _optional("LA_311_BASE_URL", "https://data.lacity.org/resource")
LA_311_DATASET_ID: str = _optional("LA_311_DATASET_ID", "rq3b-xjk8")
LA_311_FETCH_LIMIT: int = _int("LA_311_FETCH_LIMIT", 50000)
LA_311_LOOKBACK_DAYS: int = _int("LA_311_LOOKBACK_DAYS", 180)


def la_311_url() -> str:
    """Build the base SODA API URL for the MyLA311 dataset."""
    return f"{LA_311_BASE_URL}/{LA_311_DATASET_ID}.json"


def la_311_soda_params(since_date: str | None = None) -> dict:
    """
    Build SODA query params for the MyLA311 API.

    Args:
        since_date: ISO date string (e.g. '2025-10-25').
                    If None, uses LA_311_LOOKBACK_DAYS from today.

    Returns:
        dict of SODA query parameters ready for requests.get(params=...).
    """
    from datetime import datetime, timedelta

    if since_date is None:
        # The rq3b-xjk8 dataset stops in 2020. Hardcode a 2020 date for the hackathon.
        since_date = "2020-06-01T00:00:00"

    params = {
        "$where": f"createddate > '{since_date}'",
        "$order": "createddate DESC",
        "$limit": str(LA_311_FETCH_LIMIT),
    }
    if LA_311_APP_TOKEN:
        params["$$app_token"] = LA_311_APP_TOKEN
    return params


# ===================================================================
# FASTAPI BACKEND
# ===================================================================

BACKEND_HOST: str = _optional("BACKEND_HOST", "0.0.0.0")
BACKEND_PORT: int = _int("BACKEND_PORT", 8001)
STREAM_PORT: int = _int("STREAM_PORT", 8004)
CORS_ORIGIN: str = _optional("CORS_ORIGIN", "http://localhost:3000")
ENVIRONMENT: str = _optional("ENVIRONMENT", "development")

IS_PRODUCTION: bool = ENVIRONMENT == "production"


# ===================================================================
# PRIME INTELLECT (Optional)
# ===================================================================

PRIME_INTELLECT_API_KEY: str = _optional("PRIME_INTELLECT_API_KEY")
PRIME_INTELLECT_ENDPOINT: str = _optional(
    "PRIME_INTELLECT_ENDPOINT", "https://api.primeintellect.ai/v1/verify"
)


# ===================================================================
# Startup validation summary
# ===================================================================

def print_config_summary() -> None:
    """Print a one-line config status — useful at server boot."""
    asi_ok = "✅" if ASI1_API_KEY else "❌"
    agv_ok = "✅" if AGENTVERSE_TOKEN else "⚠️  (optional)"
    la_ok = "✅" if LA_311_APP_TOKEN else "⚠️  (rate-limited)"
    pi_ok = "✅" if PRIME_INTELLECT_API_KEY else "⚠️  (optional)"

    print(
        f"🔧 AgentCivic config loaded  |  "
        f"ASI:One {asi_ok}  |  Agentverse {agv_ok}  |  "
        f"LA 311 token {la_ok}  |  Prime Intellect {pi_ok}  |  "
        f"env={ENVIRONMENT}"
    )


# Run validation on import
print_config_summary()
