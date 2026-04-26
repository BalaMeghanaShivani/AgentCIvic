"""AgentCivic Orchestrator — Main entry point and OmegaClaw Skill."""

import json
import os
from datetime import datetime
from pathlib import Path
from uuid import uuid4

import httpx
from dotenv import load_dotenv

# Load .env before os.getenv calls
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

## AgentCivic Orchestrator — Civic Equity AI for Los Angeles

Analyzes LA city service equity across neighborhoods using MyLA311 data
and generates constitutional, fairness-verified policy proposals.

Send any natural language question about LA city service fairness,
neighborhood equity gaps, or resource allocation and this agent will
run the full AgentCivic pipeline — data analysis, policy proposal,
constitutional verification, and adversarial red-team review.

**Example queries:**
- "Is LA distributing city services fairly across neighborhoods?"
- "Which neighborhoods have the worst service response times?"
- "What policies would reduce the equity gap in South LA?"
- "Why does Boyle Heights wait longer for repairs than Bel Air?"

**Input:** Natural language query (string)
**Output:** Full policy memo with equity analysis, proposals, and red-team critique
**Data source:** MyLA311 Service Request Data (data.lacity.org)
**Domain:** Civic AI, Urban Equity, Constitutional AI, Policy Analysis
"""

orchestrator = Agent(
    name="agentcivic-orchestrator",
    seed=os.getenv("AGENTCIVIC_ORCHESTRATOR_SEED", "agentcivic-orchestrator-default-seed"),
    port=8010,
    mailbox=f"{os.getenv('AGENTVERSE_TOKEN')}@https://agentverse.ai",
    network="testnet",
)

orchestrator.readme = readme
chat_proto = Protocol(spec=chat_protocol_spec)


@orchestrator.on_event("startup")
async def on_startup(ctx: Context):
    ctx.logger.info(f"Orchestrator address: {orchestrator.address}")
    ctx.logger.info("Ready — waiting for messages via Agentverse mailbox")


@chat_proto.on_message(ChatAcknowledgement)
async def handle_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    ctx.logger.info(f"Acknowledgement received from {sender}")


@chat_proto.on_message(ChatMessage)
async def handle_chat(ctx: Context, sender: str, msg: ChatMessage):
    # 1. Acknowledge immediately — CORRECT constructor
    await ctx.send(sender, ChatAcknowledgement(
        timestamp=datetime.now(),
        acknowledged_msg_id=msg.msg_id,
    ))

    # 2. Extract text
    user_text = next(
        (item.text for item in msg.content if isinstance(item, TextContent)),
        "Analyze current city fairness state"
    )
    ctx.logger.info(f"Query: {user_text[:100]}...")

    # 3. Call FastAPI
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(
                f"{BACKEND_URL}/agents/workflow",
                json={"query": user_text},
            )
            resp.raise_for_status()
            data = resp.json()
            result_text = data.get("policy_memo") or json.dumps(data, indent=2)
    except httpx.HTTPStatusError as e:
        result_text = f"⚠️ Backend error {e.response.status_code}: {e.response.text[:200]}"
    except httpx.RequestError:
        result_text = f"⚠️ Cannot reach backend at {BACKEND_URL}. Is FastAPI running?"

    # 4. Reply
    await ctx.send(sender, ChatMessage(
        timestamp=datetime.now(),
        msg_id=uuid4(),
        content=[
            TextContent(type="text", text=result_text),
            EndSessionContent(type="end-session"),
        ],
    ))
    ctx.logger.info("Response sent.")


orchestrator.include(chat_proto)

if __name__ == "__main__":
    orchestrator.run()