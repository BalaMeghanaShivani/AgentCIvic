"""AgentCivic Bureau — runs all four agents together."""

import os
import sys
from pathlib import Path

# ── Load .env FIRST before any agent imports ──────────────────
from dotenv import load_dotenv

for _candidate in [
    Path(__file__).parent / ".env",
    Path(__file__).parent.parent / ".env",
    Path(__file__).parent.parent.parent / ".env",
]:
    if _candidate.exists():
        load_dotenv(_candidate)
        print(f"✅ Loaded .env from {_candidate.resolve()}")
        break
else:
    print("⚠️  No .env file found — relying on shell environment")

# ── Validate token before doing anything ──────────────────────
token = os.getenv("AGENTVERSE_TOKEN", "")
if not token or "your_" in token:
    print("❌ AGENTVERSE_TOKEN is missing or is still a placeholder.")
    print("   Get it from: https://agentverse.ai → Settings → API Keys")
    print("   Then add it to your .env file.")
    sys.exit(1)

print(f"✅ AGENTVERSE_TOKEN found: {token[:12]}...")

# ── Now safe to import agents ─────────────────────────────────
from uagents import Bureau

from orchestrator      import orchestrator
from proposer_agent    import proposer_agent
from verifier_agent    import verifier_agent
from redteam_agent     import redteam_agent

bureau = Bureau(port=8100)
bureau.add(orchestrator)
bureau.add(proposer_agent)
bureau.add(verifier_agent)
bureau.add(redteam_agent)

if __name__ == "__main__":
    print("\n🚀 Starting AgentCivic Bureau...")
    print("   Agents will connect to Agentverse via mailbox.")
    print("   Keep this terminal running — closing it takes agents offline.\n")
    bureau.run()
