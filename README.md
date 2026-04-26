# AgentCivic

![tag:innovationlab](https://img.shields.io/badge/innovationlab-3D8BD3)

**Multi-agent constitutional AI for Los Angeles civic service equity**

## What It Does

AgentCivic transforms raw MyLA311 complaint data into audited, fairness-aware policy decisions through a pipeline of specialized AI agents. A **Proposer** agent generates equity-targeted policy candidates, a **Verifier** agent checks them against constitutional fairness constraints, and a **Red Team** agent adversarially stress-tests for failure modes before any recommendation reaches city officials. The full pipeline is exposed as an OmegaClaw Skill on Agentverse — any ASI:One user can ask a natural-language question about LA service equity and get a complete, audited policy memo back.

## The Problem

In Los Angeles, neighborhoods like Boyle Heights routinely wait 2–3x longer for pothole repairs and bulky item pickup than neighborhoods like Bel Air — not because of resource scarcity, but because raw complaint volume drives allocation rather than actual need. Duplicate reports, misclassified service requests, and inconsistent data sourcing amplify the gap, creating a feedback loop where well-connected neighborhoods get faster service and under-resourced ones fall further behind.

## Agent Architecture

| Agent | Agentverse Address | Role |
|-------|-------------------|------|
| `agentcivic-orchestrator` | `agent1q[TBD]` | OmegaClaw Skill — full pipeline entry point |
| `agentcivic-proposer` | `agent1q[TBD]` | Generates equity-aware policy proposals |
| `agentcivic-verifier` | `agent1q[TBD]` | Constitutional fairness verification |
| `agentcivic-redteam` | `agent1q[TBD]` | Adversarial stress-testing |

## Tech Stack

- **Fetch.ai uAgents** — agent framework with Chat Protocol
- **Agentverse** — agent hosting and discovery
- **ASI:One (asi1-mini)** — LLM backbone for proposal generation and red-teaming
- **FastAPI** — backend API and pipeline orchestration
- **Next.js** — operational dashboard frontend
- **MyLA311 Open Data** — LA city service request dataset (data.lacity.org)
- **Prime Intellect Verifiers** — constitutional constraint checking

## Data Pipeline

1. **compute_fairness_metrics** — Compute p50/p90 response times per neighborhood and flag worst-K equity gaps
2. **compute_neighborhood_signals** — Derive backlog pressure, aging tail, duplicate rate, and LA-specific signals (anon rate, phone rate, resolution lag)
3. **build_city_state** — Assemble the full city state JSON with fairness metrics, signals, governance constitution, and policy search space
4. **simulator** — Run candidate policies through a simulation engine to estimate equity impact
5. **verifier** — Check simulation results against constitutional constraints (max harm, min improvement, backlog caps)

## Quick Start

```bash
# 0. Set up environment variables
cd backend
cp example.env .env
# Edit .env and add your keys:
#   ASI1_API_KEY        — from https://asi1.ai
#   AGENTVERSE_API_KEY  — from https://agentverse.ai
#   *_SEED              — unique seed phrases per agent

# 1. Clone and enter the repo
git clone https://github.com/stripathy1999/AgentCivic.git
cd AgentCivic

# 2. Backend setup
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
pip install uagents httpx

# 3. Start the FastAPI backend
uvicorn api.app:app --host 0.0.0.0 --port 8001 --reload

# 4. Start the Fetch.ai agents (new terminal)
cd backend
python -m fetchai_agents.bureau

# 5. Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

The backend serves the API on `http://localhost:8001`, agents run on ports `8010–8013`, and the dashboard runs on `http://localhost:3000`.

## Try It on ASI:One

Go to [asi1.ai](https://asi1.ai), enable the **Agents** toggle, and search for **"AgentCivic"**. Ask something like *"Is LA distributing city services fairly across neighborhoods?"* and the orchestrator will run the full pipeline and return an audited policy memo.

## Demo Video

[Link TBD]

## Team

Built at **LA Hacks 2026** for the Fetch.ai OmegaClaw and Best Use of Fetch.ai prize tracks.
