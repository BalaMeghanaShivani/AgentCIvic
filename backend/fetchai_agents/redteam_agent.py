"""
AgentCivic Red Team Agent — Specialist adversarial analysis agent.

This uAgent receives a policy description via the Chat Protocol,
prefixes it with a red-team directive, and forwards it to the
/agents/workflow endpoint for adversarial critique.
"""

import json
import os
from datetime import datetime
from uuid import uuid4

import httpx
from uagents import Agent, Context, Protocol
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    EndSessionContent,
    TextContent,
    chat_protocol_spec,
)

BACKEND_URL = os.getenv("AGENTCIVIC_BACKEND", "http://localhost:8001")

readme = """
![tag:innovationlab](https://img.shields.io/badge/innovationlab-3D8BD3)

## AgentCivic Red Team Analyst

Adversarially stress-tests civic AI policy proposals to find \
failure modes, gaming vectors, bias risks, and unintended harms \
before policies reach city officials.

This agent plays devil's advocate — finding every way a proposed \
policy could fail, be exploited, or produce inequitable outcomes \
despite good intentions.

**Example queries:**
- "Red team this bulky item pickup prioritization policy"
- "What could go wrong with this graffiti removal allocation plan?"
- "Find the failure modes in this neighborhood service equity proposal"

**Input:** Policy proposal to stress-test
**Output:** Adversarial critique with specific failure modes, risks, and recommendations
**Domain:** Red Teaming, AI Safety, Civic Policy, Adversarial Analysis
"""

redteam_agent = Agent(
    name="agentcivic-redteam",
    seed=os.getenv("AGENTCIVIC_REDTEAM_SEED", "agentcivic-redteam-default-seed"),
    port=8013,
    mailbox=f"{os.getenv('AGENTVERSE_TOKEN')}@https://agentverse.ai",
    network="testnet",
)
redteam_agent.readme = readme

chat_proto = Protocol(spec=chat_protocol_spec)

@chat_proto.on_message(ChatAcknowledgement)
async def handle_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    ctx.logger.info(f"Received acknowledgement from {sender}")


def _extract_redteam_critique(data: dict) -> str:
    """Extract the red-team critique from a workflow response."""
    # The workflow response may contain the critique in different shapes
    memo = data.get("policy_memo", "")
    redteam = data.get("redteam", data.get("red_team", {}))

    if isinstance(redteam, dict):
        risks = redteam.get("risks", [])
        recommendations = redteam.get("recommendations", [])

        lines = ["🔴 **Red Team Analysis**\n"]

        if risks:
            lines.append("**Identified Risks:**")
            for r in risks:
                if isinstance(r, dict):
                    lines.append(f"  ⚠️ {r.get('risk', str(r))} (cite: {r.get('citation', 'N/A')})")
                else:
                    lines.append(f"  ⚠️ {r}")

        if recommendations:
            lines.append("\n**Recommendations:**")
            for r in recommendations:
                if isinstance(r, dict):
                    lines.append(f"  → {r.get('recommendation', str(r))}")
                else:
                    lines.append(f"  → {r}")

        if len(lines) > 1:
            return "\n".join(lines)

    # Fallback: return the full memo or raw data
    if memo:
        return f"🔴 **Red Team Analysis**\n\n{memo}"
    return f"🔴 **Red Team Analysis**\n\n{json.dumps(data, indent=2)}"


@chat_proto.on_message(ChatMessage)
async def handle_chat(ctx: Context, sender: str, msg: ChatMessage):
    """Run adversarial red-team analysis on a policy."""

    # 1. Acknowledge immediately
    await ctx.send(sender, ChatAcknowledgement(msg_id=msg.msg_id))

    # 2. Extract user text
    user_text = ""
    for item in msg.content:
        if isinstance(item, TextContent):
            user_text = item.text
            break

    if not user_text:
        user_text = "Analyze current policy for risks"

    ctx.logger.info(f"RedTeam received query: {user_text[:120]}...")

    # 3. Prefix with red-team directive and call workflow
    redteam_query = f"Red team analysis only: {user_text}"

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(
                f"{BACKEND_URL}/agents/workflow",
                json={"query": redteam_query},
            )
            resp.raise_for_status()
            data = resp.json()
            result_text = _extract_redteam_critique(data)
    except httpx.HTTPStatusError as exc:
        ctx.logger.error(f"Backend returned {exc.response.status_code}: {exc.response.text}")
        result_text = (
            f"⚠️ Red Team backend error ({exc.response.status_code}). "
            "Could not complete adversarial analysis."
        )
    except httpx.RequestError as exc:
        ctx.logger.error(f"Backend connection failed: {exc}")
        result_text = (
            "⚠️ Could not reach the AgentCivic backend. Is it running?"
        )

    # 4. Send the result back
    await ctx.send(
        sender,
        ChatMessage(
            timestamp=datetime.now(),
            msg_id=uuid4(),
            content=[
                TextContent(type="text", text=result_text),
                EndSessionContent(type="end-session"),
            ],
        ),
    )
    ctx.logger.info("RedTeam response sent.")


redteam_agent.include(chat_proto)

if __name__ == "__main__":
    redteam_agent.run()
