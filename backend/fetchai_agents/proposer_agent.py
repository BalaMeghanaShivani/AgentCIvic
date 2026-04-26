"""AgentCivic Proposer Agent — Specialist policy proposal agent."""

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

CITY_STATE_PATH = (
    Path(__file__).resolve().parent.parent / "data" / "processed" / "city_state.json"
)

readme = """
![tag:innovationlab](https://img.shields.io/badge/innovationlab-3D8BD3)

## AgentCivic Policy Proposer

Specialist agent that generates equity-aware policy proposals for
LA city services based on MyLA311 neighborhood signal data.

Given neighborhood-level service request data, this agent produces
3-5 concrete, actionable policy proposals that address identified
equity gaps, with estimated impact scores for each proposal.

**Example queries:**
- "Propose policies to fix service gaps in East LA"
- "What interventions would reduce illegal dumping response time in South LA?"
- "Generate equity policies for Council District 9"

**Input:** Neighborhood name or service equity question
**Output:** 3-5 structured policy proposals with equity impact estimates
**Domain:** Civic Policy, Urban Equity, Los Angeles, MyLA311
"""

proposer_agent = Agent(
    name="agentcivic-proposer",
    seed=os.getenv("AGENTCIVIC_PROPOSER_SEED", "agentcivic-proposer-default-seed"),
    port=8011,
    mailbox=f"{os.getenv('AGENTVERSE_TOKEN')}@https://agentverse.ai",
    network="testnet",
)

proposer_agent.readme = readme

chat_proto = Protocol(spec=chat_protocol_spec)


@proposer_agent.on_event("startup")
async def on_startup(ctx: Context):
    ctx.logger.info(f"Proposer address: {proposer_agent.address}")


@chat_proto.on_message(ChatAcknowledgement)
async def handle_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    ctx.logger.info(f"Acknowledgement from {sender}")


def _load_city_state() -> dict:
    if CITY_STATE_PATH.exists():
        try:
            return json.loads(CITY_STATE_PATH.read_text())
        except Exception:
            pass
    return {
        "city_context": {
            "service_type": "Homeless Encampment",
            "city_baselines": {"p50_hr": 48.0, "p90_hr": 120.0},
            "service_volume": 500,
        },
        "neighborhoods": [],
        "governance": {
            "worst_k": 3,
            "constraints": {
                "min_worst_k_improvement": 0.15,
                "max_neighborhood_harm": 0.05,
                "max_backlog_growth": 0.10,
                "citywide_p90_must_not_worsen": True,
            },
        },
        "policy_space": {
            "capacity_shift_pct": [0.0, 0.3],
            "efficiency_bonus_pct": [0.0, 0.1],
            "max_reassignments": [0, 3],
        },
    }


def _format_proposals(proposals: list) -> str:
    if not proposals:
        return "No proposals were generated."
    lines = ["📋 **Policy Proposals**\n"]
    for i, p in enumerate(proposals, 1):
        pid = p.get("policy_id", f"policy_{i}")
        params = p.get("parameters", {})
        rationale = p.get("rationale", "N/A")
        lines.append(f"**{i}. {pid}**")
        lines.append(f"   Parameters: {json.dumps(params)}")
        lines.append(f"   Rationale: {rationale}\n")
    return "\n".join(lines)


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
        "Generate policy proposals for LA equity"
    )
    ctx.logger.info(f"Query: {user_text[:100]}...")

    # 3. Call backend
    city_state = _load_city_state()
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(
                f"{BACKEND_URL}/agents/propose",
                json={"city_state": city_state},
            )
            resp.raise_for_status()
            data = resp.json()
            proposals = data.get("proposals", data.get("policies", []))
            result_text = _format_proposals(proposals)
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
    ctx.logger.info("Proposer response sent.")


proposer_agent.include(chat_proto)

if __name__ == "__main__":
    proposer_agent.run()