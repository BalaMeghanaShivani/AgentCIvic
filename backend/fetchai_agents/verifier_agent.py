"""AgentCivic Verifier Agent — Constitutional policy verification."""

import json
import os
from datetime import datetime
from pathlib import Path
from uuid import uuid4

import httpx
from dotenv import load_dotenv

for _c in [Path(__file__).parent/".env",
           Path(__file__).parent.parent/".env",
           Path(__file__).parent.parent.parent/".env"]:
    if _c.exists():
        load_dotenv(_c)
        break

from uagents import Agent, Context, Protocol
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement, ChatMessage,
    EndSessionContent, TextContent, chat_protocol_spec,
)

BACKEND_URL = os.getenv("AGENTCIVIC_BACKEND", "http://localhost:8001")

readme = """
![tag:innovationlab](https://img.shields.io/badge/innovationlab-3D8BD3)

## AgentCivic Constitutional Verifier

Verifies civic policy proposals against constitutional fairness
constraints and Prime Intellect equity standards.

Checks proposals for: disparate impact, legal compliance,
resource equity, and unintended consequences before policies
are recommended for city adoption.

**Example queries:**
- "Verify this pothole repair prioritization policy for fairness"
- "Does this resource allocation proposal pass constitutional constraints?"
- "Check if this service policy creates disparate impact"

**Input:** Policy proposal description (natural language or structured)
**Output:** Pass/fail verdict with detailed reasoning and flagged concerns
**Domain:** Constitutional AI, Policy Verification, Civic Equity, Compliance
"""

verifier_agent = Agent(
    name="agentcivic-verifier",
    seed=os.getenv("AGENTCIVIC_VERIFIER_SEED", "agentcivic-verifier-default-seed"),
    port=8012,
    mailbox=f"{os.getenv('AGENTVERSE_TOKEN')}@https://agentverse.ai",
    network="testnet",
)
verifier_agent.readme = readme

chat_proto = Protocol(spec=chat_protocol_spec)


@verifier_agent.on_event("startup")
async def on_startup(ctx: Context):
    ctx.logger.info(f"Verifier address: {verifier_agent.address}")


@chat_proto.on_message(ChatAcknowledgement)
async def handle_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    ctx.logger.info(f"Acknowledgement from {sender}")


def _build_payload(user_text: str) -> dict:
    return {
        "proposal": {
            "policy_id": "user_submitted_policy",
            "parameters": {
                "capacity_shift_pct": 0.10,
                "efficiency_bonus_pct": 0.05,
                "max_reassignments": 1,
            },
            "rationale": user_text,
        },
        "sim_result": {
            "service_type": "Homeless Encampment",
            "description": user_text,
            "worst_k_improvement": 0.0,
            "citywide_p90_change": 0.0,
            "max_neighborhood_harm": 0.0,
            "backlog_growth": 0.0,
        },
    }


def _format_result(result: dict) -> str:
    verified = result.get("verified", result)
    if isinstance(verified, dict):
        passed = verified.get("passed", verified.get("pass", "unknown"))
        reasons = verified.get("reasons", verified.get("violations", []))
        status = "✅ PASSED" if passed else "❌ FAILED"
        lines = [f"🔍 **Verification Result: {status}**\n"]
        if reasons:
            lines.append("**Reasons / Violations:**")
            for r in reasons:
                if isinstance(r, dict):
                    lines.append(f"  • {r.get('constraint','N/A')}: {r.get('detail', str(r))}")
                else:
                    lines.append(f"  • {r}")
        return "\n".join(lines)
    return f"Verification result:\n{json.dumps(result, indent=2)}"


@chat_proto.on_message(ChatMessage)
async def handle_chat(ctx: Context, sender: str, msg: ChatMessage):
    # 1. Acknowledge — CORRECT constructor
    await ctx.send(sender, ChatAcknowledgement(
        timestamp=datetime.now(),
        acknowledged_msg_id=msg.msg_id,
    ))

    # 2. Extract text
    user_text = next(
        (item.text for item in msg.content if isinstance(item, TextContent)),
        "Verify this policy for constitutional compliance"
    )
    ctx.logger.info(f"Query: {user_text[:100]}...")

    # 3. Call backend
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(
                f"{BACKEND_URL}/verify",
                json=_build_payload(user_text),
            )
            resp.raise_for_status()
            result_text = _format_result(resp.json())
    except httpx.HTTPStatusError as e:
        result_text = f"⚠️ Backend error {e.response.status_code}"
    except httpx.RequestError:
        result_text = f"⚠️ Cannot reach backend at {BACKEND_URL}"

    # 4. Reply
    await ctx.send(sender, ChatMessage(
        timestamp=datetime.now(),
        msg_id=uuid4(),
        content=[
            TextContent(type="text", text=result_text),
            EndSessionContent(type="end-session"),
        ],
    ))
    ctx.logger.info("Verifier response sent.")


verifier_agent.include(chat_proto)

if __name__ == "__main__":
    verifier_agent.run()