"""
AgentCivic Zone-2 API

Lightweight FastAPI layer exposing Zone-2 capabilities:
- Metrics (read-only evidence)
- City State (primary briefing packet)
- Budget Context (read-only budget data)
- Simulation (policy testing)
- Verification (constitution enforcement)
- Refresh (recompute Zone-2 outputs)
"""

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
import json
import asyncio
from pathlib import Path
import logging
import httpx
import os
import sys
from datetime import datetime

# uAgents for remote messaging
from uagents.query import query
from uagents import Model

# Add backend directory to path to ensure we can import local modules
BACKEND_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if BACKEND_ROOT not in sys.path:
    sys.path.append(BACKEND_ROOT)

from config.settings import settings

from api.models import (
    SimulateRequest, SimulateResponse,
    VerifyRequest, VerifyResponse,
    RefreshResponse, HealthResponse
)
from api.runner import (
    run_simulator, run_verifier, run_refresh, check_required_files
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Agentverse / Remote Agent Config ---
REMOTE_ORCHESTRATOR = os.getenv("REMOTE_ORCHESTRATOR_ADDRESS", "agent1qtg9u5nhc7mx89j5xwx397pdz3jn05g4h4rlzkk0pg2jqu5s2h3k5jhdwwm")

class RemoteChatMessage(Model):
    message: str

class RemoteChatResponse(Model):
    response: str

# Initialize FastAPI
app = FastAPI(
    title="AgentCivic Zone-2 API",
    description="API layer for AgentCivic Zone-2 capabilities",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths
# Paths
from config.paths import PROCESSED_DIR as DATA_DIR, BUDGET_DIR


@app.get("/")
async def root():
    """
    Root endpoint - API information and available endpoints.
    """
    return {
        "name": "AgentCivic Zone-2 API",
        "version": "1.0.0",
        "description": "API layer for AgentCivic Zone-2 capabilities",
        "endpoints": {
            "GET /": "This endpoint - API information",
            "GET /health": "Health check - verify required files exist",
            "GET /services": "Get list of available service types",
            "GET /fairness_metrics": "Read-only fairness metrics evidence",
            "GET /city_state": "Primary briefing packet for agents",
            "POST /simulate": "Run policy simulation",
            "POST /verify": "Verify policy against constitution",
            "POST /refresh": "Recompute all Zone-2 outputs",
            "GET /docs": "Interactive API documentation (Swagger UI)",
            "GET /redoc": "Alternative API documentation (ReDoc)"
        },
        "documentation": {
            "interactive": "http://localhost:8080/docs",
            "redoc": "http://localhost:8080/redoc"
        }
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint.
    
    Verifies that required Zone-2 output files exist.
    """
    all_exist, missing = check_required_files()
    
    if all_exist:
        return HealthResponse(
            status="healthy",
            missing_files=[],
            message="All required Zone-2 files are present"
        )
    else:
        return HealthResponse(
            status="degraded",
            missing_files=missing,
            message=f"Missing {len(missing)} required files. Run /refresh to regenerate."
        )


@app.get("/budget_context")
def get_budget_context(service_type: Optional[str] = Query(None, description="Optional service type to filter budget context")):
    """
    Budget context for governance, not decision-making.
    
    Returns read-only budget data from precomputed files.
    Budget does NOT make decisions or act as an agent.
    
    Query Parameters:
    - service_type (optional): Filter by specific service type
    
    Returns:
    - If service_type provided: Budget context for that service's department
    - If no service_type: All department budget contexts
    """
    
    # Load required files
    dept_summary_file = DATA_DIR / "department_budget_summary.json"
    budget_metrics_file = DATA_DIR / "budget_metrics.json"
    service_mapping_file = BUDGET_DIR / "service_type_to_department.json"
    
    missing_files = [
        str(path)
        for path in (dept_summary_file, budget_metrics_file, service_mapping_file)
        if not path.exists()
    ]
    if missing_files:
        raise HTTPException(
            status_code=404,
            detail=(
                "Budget data files not found. Run budget pipeline to generate. "
                f"Missing: {missing_files}"
            ),
        )

    try:
        with open(dept_summary_file, 'r') as f:
            dept_summary = json.load(f)
        with open(budget_metrics_file, 'r') as f:
            budget_metrics = json.load(f)
        with open(service_mapping_file, 'r') as f:
            service_mapping = json.load(f)
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Invalid JSON in budget data files: {e}",
        )
    
    # Budget constraints (hardcoded)
    budget_constraints = {
        "max_budget_stress_ratio": 0.15,
        "recommended_budget_stress_ratio": 0.05
    }
    
    # Assumptions
    assumptions = [
        "Budget is spending-only",
        "Latest fiscal year used",
        "Service-to-department mapping is static",
        "Costs are estimated, not allocated"
    ]
    
    if service_type:
        normalized_service = service_type.strip()
        if not normalized_service:
            raise HTTPException(
                status_code=400,
                detail="Service type cannot be empty or whitespace.",
            )
        mapping_lookup = {key.lower(): key for key in service_mapping.keys()}
        lookup_key = normalized_service.lower()
        if lookup_key in mapping_lookup:
            service_type = mapping_lookup[lookup_key]
        # Filter for specific service type
        if service_type not in service_mapping:
            raise HTTPException(
                status_code=400,
                detail=f"Service type '{service_type}' not found in mapping. Available: {list(service_mapping.keys())}"
            )
        
        department = service_mapping[service_type]
        
        # Find budget metrics for this service type
        service_budget = next((b for b in budget_metrics if b['service_type'] == service_type), None)
        
        if not service_budget:
            raise HTTPException(
                status_code=404,
                detail=f"Budget metrics not found for service type '{service_type}'"
            )
        
        return {
            "service_type": service_type,
            "department": department,
            "budget_year": service_budget['fiscal_year'],
            "annual_budget_usd": service_budget['department_annual_budget_usd'],
            "estimated_budget_per_incident_usd": service_budget['estimated_budget_per_incident_usd'],
            "budget_constraints": budget_constraints,
            "assumptions": assumptions
        }
    else:
        # Return all budget contexts
        budget_contexts = []
        
        for metric in budget_metrics:
            budget_contexts.append({
                "department": metric['department'],
                "budget_year": metric['fiscal_year'],
                "annual_budget_usd": metric['department_annual_budget_usd'],
                "estimated_budget_per_incident_usd": metric['estimated_budget_per_incident_usd']
            })
        
        return {
            "budget_contexts": budget_contexts
        }


@app.get("/fairness_metrics")
async def get_fairness_metrics():
    """
    Read-only evidence: Returns fairness metrics.
    
    No computation triggered.
    """
    metrics_file = DATA_DIR / "fairness_metrics.json"
    
    if not metrics_file.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Fairness metrics not found at {metrics_file}. Run /refresh to generate."
        )
    
    try:
        with open(metrics_file, 'r') as f:
            data = json.load(f)
        
        # Sanitize for NaN just in case
        def sanitize(obj):
            if isinstance(obj, float) and (obj != obj): # NaN check
                return None
            if isinstance(obj, list):
                return [sanitize(i) for i in obj]
            if isinstance(obj, dict):
                return {k: sanitize(v) for k, v in obj.items()}
            return obj

        return JSONResponse(content={"metrics": sanitize(data)})
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Invalid JSON in fairness_metrics.json: {e}")


@app.get("/city_state")
async def get_city_state():
    """
    Primary briefing packet for agents.
    
    Returns comprehensive city state including:
    - City context and baselines
    - Neighborhood profiles with fairness metrics
    - Governance constraints (constitution)
    - Derived insights (worst neighborhoods, etc.)
    """
    city_state_file = DATA_DIR / "city_state.json"
    
    if not city_state_file.exists():
        raise HTTPException(
            status_code=404,
            detail=f"City state not found at {city_state_file}. Run /refresh to generate."
        )
    
    try:
        with open(city_state_file, 'r') as f:
            data = json.load(f)
            
        def sanitize(obj):
            import math
            if isinstance(obj, float) and math.isnan(obj):
                return None
            if isinstance(obj, list):
                return [sanitize(i) for i in obj]
            if isinstance(obj, dict):
                return {k: sanitize(v) for k, v in obj.items()}
            return obj

        return JSONResponse(content=sanitize(data))
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Invalid JSON in city_state.json: {e}")


@app.post("/simulate", response_model=SimulateResponse)
async def simulate_policy(request: SimulateRequest):
    """
    Run one policy simulation.
    
    Accepts policy parameters, runs simulator.py, and returns only the result
    for the requested policy (not the full scenario_results.json).
    
    Parameters are validated against constraints defined in sim/policies.py.
    """
    logger.info(f"Simulating policy: {request.policy_id}")
    
    # Convert request to policy dict
    policy_dict = {
        "policy_id": request.policy_id,
        "parameters": request.parameters.model_dump()
    }
    
    try:
        result = run_simulator(policy_dict)
        logger.info(f"Simulation completed for {request.policy_id}")
        return SimulateResponse(**result)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {e}")
    except Exception as e:
        logger.error(f"Unexpected error during simulation: {e}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")


@app.post("/verify", response_model=VerifyResponse)
async def verify_policy(request: VerifyRequest):
    """
    Constitution enforcement.
    
    Accepts a simulated policy result and returns verification verdict
    (whether it passes all constitutional constraints).
    """
    logger.info(f"Verifying policy: {request.policy_result.policy_id}")
    
    # Convert to dict for verifier
    policy_result_dict = request.policy_result.model_dump()
    
    try:
        verdict = run_verifier(policy_result_dict)
        logger.info(f"Verification completed for {request.policy_result.policy_id}")
        return VerifyResponse(**verdict)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=f"Verification failed: {e}")
    except Exception as e:
        logger.error(f"Unexpected error during verification: {e}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")


@app.post("/refresh", response_model=RefreshResponse)
async def refresh_zone2():
    """
    Recompute Zone-2 outputs.
    
    Sequentially runs:
    1. compute_fairness_metrics.py
    2. compute_neighborhood_signals.py
    3. build_city_state.py
    
    Safe to call multiple times. Returns status and timestamp.
    """
    logger.info("Starting Zone-2 refresh")
    
    try:
        result = run_refresh()
        logger.info("Zone-2 refresh completed successfully")
        return RefreshResponse(**result)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=f"Refresh failed: {e}")
    except Exception as e:
        logger.error(f"Unexpected error during refresh: {e}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")


@app.get("/agents/health")
async def agent_health():
    """
    Local agent pipeline health check — no AgentIQ required.
    """
    city_state_file = DATA_DIR / "city_state.json"
    return {
        "ok": True,
        "details": "Local agent pipeline ready",
        "city_state_available": city_state_file.exists(),
        "agents": ["proposer", "redteam", "arbiter"],
        "mode": "local",
    }

@app.get("/agents/stream")
async def agent_stream(service: str, request: Request): # Need Request to get query params? No, simplified
    """
    Proxy SSE stream to AgentIQ.
    """
    # AgentIQ expects a POST to /generate/stream with {"initial_tool_input": ...}
    # We convert the GET query param 'service' into that payload.
    url = f"{settings.AGENTIQ_URL}/generate/stream"
    payload = {
        "initial_tool_input": {
            "payload": {
                "service": service 
            }
        }
    }
    
    # We need to stream the response back
    # Using httpx stream
    
    async def event_generator():
        async with httpx.AsyncClient() as client:
            try:
                # Use POST for NAT streaming
                # set timeout to None for long streaming
                turn_counter = 0
                current_agent = "System"
                accumulated_payloads = {}  # Track outputs from each agent
                
                async with client.stream("POST", url, json=payload, timeout=None) as response:
                     async for line in response.aiter_lines():
                         if not line:
                             continue
                             
                         # Parse nat event
                         # Format: intermediate_data: {"id": ...}
                         if line.startswith("intermediate_data: "):
                             try:
                                 json_str = line[len("intermediate_data: "):]
                                 event_data = json.loads(json_str)
                                 
                                 # Extract info
                                 # event_data keys: id, type, name, payload (markdown)
                                 name = event_data.get("name", "Unknown")
                                 content_md = event_data.get("payload", "")
                                 
                                 # Stateful agent mapping
                                 # Update current_agent if we see a specific function start
                                 if "propose" in name.lower():
                                     current_agent = "Proposer"
                                 elif "verify" in name.lower():
                                     current_agent = "Constitution Checker"
                                 elif "redteam" in name.lower():
                                     current_agent = "Red Team"
                                 elif "memo" in name.lower():
                                     current_agent = "Memo Writer"
                                 # Note: Retrieve usually maps to System or we can leave it as previous
                                 
                                 agent = current_agent
                                 
                                 # Filter out System messages (function inputs/outputs logs)
                                 if agent == "System":
                                     continue
                                     
                                 # NOTE: Input filter disabled - was blocking valid agent outputs
                                 # The "**Input:**" marker can appear in agent output documentation
                                 
                                 # Try to extract structured payload from markdown code block
                                 structured_payload = None
                                 candidate = None
                                 
                                 # Strategy 1: Regex for code blocks
                                 import re
                                 matches = re.findall(r"```(?:\w+)?\s+(.*?)\s+```", content_md, re.DOTALL)
                                 if matches:
                                     candidate = matches[-1]
                                 
                                 # Strategy 2: Look for **Output:** marker and take everything after
                                 if not candidate and "**Output:**" in content_md:
                                     parts = content_md.split("**Output:**")
                                     if len(parts) > 1:
                                         candidate = parts[-1].strip()

                                 # Parsing Logic (common)
                                 if candidate:
                                     # First try JSON
                                     try:
                                         structured_payload = json.loads(candidate)
                                     except Exception:
                                         # Fallback to python literal eval (single quotes)
                                         try:
                                             import ast
                                             # Sanitize common non-literals
                                             safe_candidate = candidate.replace(" nan,", " None,").replace(": nan", ": None")
                                             structured_payload = ast.literal_eval(safe_candidate)
                                         except Exception:
                                             pass
                                 
                                 if structured_payload is not None:
                                      # Handle list wrapper (common in nat if multiple outputs possible)
                                      if isinstance(structured_payload, list):
                                          if len(structured_payload) > 0:
                                               structured_payload = structured_payload[0]
                                      
                                      # Unwrap "payload" wrapper if present (common in nat)
                                      if isinstance(structured_payload, dict) and "payload" in structured_payload:
                                           structured_payload = structured_payload["payload"]
                                      
                                      # Accumulate by agent
                                      accumulated_payloads[agent] = structured_payload
                                 
                                 # Construct AgentMessage
                                 turn_counter += 1
                                 msg = {
                                     "agent": agent,
                                     "content": content_md,
                                     "turn": turn_counter,
                                     "payload": structured_payload
                                 }
                                 
                                 # Yield SSE event
                                 yield f"data: {json.dumps(msg)}\n\n".encode('utf-8')

                             except Exception as parse_err:
                                 logger.error(f"Error parsing intermediate_data: {parse_err}")
                                 continue
                         
                         # Check for other event types?
                         # For now, just handle intermediate_data
                
                # Stream finished successfully
                # Build final payload matching frontend expectations
                final_payload = {}
                
                # Frontend expects: policies, chosen_policy, verifier_outputs, redteam
                if "Proposer" in accumulated_payloads:
                    proposer_data = accumulated_payloads["Proposer"]
                    if isinstance(proposer_data, dict):
                        final_payload["policies"] = proposer_data.get("policies", [])
                
                if "Constitution Checker" in accumulated_payloads:
                    checker_data = accumulated_payloads["Constitution Checker"]
                    if isinstance(checker_data, dict):
                        final_payload["verifier_outputs"] = checker_data.get("verifier_outputs", [])
                        final_payload["chosen_policy"] = checker_data.get("chosen_policy", None)
                
                if "Red Team" in accumulated_payloads:
                    redteam_data = accumulated_payloads["Red Team"]
                    if isinstance(redteam_data, dict):
                        final_payload["redteam"] = redteam_data.get("redteam", None)
                
                if "Memo Writer" in accumulated_payloads:
                    memo_data = accumulated_payloads["Memo Writer"]
                    if isinstance(memo_data, dict):
                        final_payload["memo"] = memo_data.get("memo", "")
                
                logger.info(f"Stream done. Final payload keys: {list(final_payload.keys())}")
                
                yield b"event: done\n"
                yield f"data: {json.dumps(final_payload)}\n\n".encode('utf-8')

            except Exception as e:
                logger.error(f"Stream proxy error: {e}")
                err_msg = {"agent": "System", "content": f"Stream error: {str(e)}", "turn": 0}
                yield f"data: {json.dumps(err_msg)}\n\n".encode('utf-8')

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.post("/agents/propose")
async def agent_propose(request: Request):
    """Run proposer agent locally against city_state.json"""
    import asyncio
    from agents.proposer import propose_policies_with_debug
    from agents.city_state import build_city_state, get_services_from_fairness, load_json
    city_state_file = DATA_DIR / "city_state.json"
    if not city_state_file.exists():
        raise HTTPException(status_code=404, detail="city_state.json not found. Run /refresh first.")
    try:
        data = await request.json() if request.headers.get("content-type", "").startswith("application/json") else {}
    except Exception:
        data = {}
    service = data.get("service", None)
    city_state = load_json(city_state_file)
    try:
        result = await asyncio.get_event_loop().run_in_executor(
            None, propose_policies_with_debug, city_state
        )
        return result
    except Exception as e:
        logger.error(f"Proposer error: {e}")
        raise HTTPException(status_code=500, detail=f"Proposer failed: {str(e)}")


@app.post("/agents/redteam")
async def agent_redteam(request: Request):
    """Run redteam agent locally against city_state.json"""
    import asyncio
    from agents.redteam import redteam_review_with_debug
    from agents.city_state import load_json
    city_state_file = DATA_DIR / "city_state.json"
    if not city_state_file.exists():
        raise HTTPException(status_code=404, detail="city_state.json not found. Run /refresh first.")
    try:
        data = await request.json() if request.headers.get("content-type", "").startswith("application/json") else {}
    except Exception:
        data = {}
    city_state = load_json(city_state_file)
    policies = data.get("policies", [])
    service = city_state.get("city_context", {}).get("service_type", "Environment")
    payload = {"city_state": city_state, "policies": policies}
    try:
        result = await asyncio.get_event_loop().run_in_executor(
            None, redteam_review_with_debug, service, payload
        )
        return result
    except Exception as e:
        logger.error(f"RedTeam error: {e}")
        raise HTTPException(status_code=500, detail=f"RedTeam failed: {str(e)}")


@app.post("/agents/memo")
async def agent_memo(request: Request):
    """Run arbiter/memo agent locally against city_state.json"""
    import asyncio
    from agents.arbiter import build_memo_with_debug
    from agents.city_state import load_json
    city_state_file = DATA_DIR / "city_state.json"
    if not city_state_file.exists():
        raise HTTPException(status_code=404, detail="city_state.json not found. Run /refresh first.")
    try:
        data = await request.json() if request.headers.get("content-type", "").startswith("application/json") else {}
    except Exception:
        data = {}
    city_state = load_json(city_state_file)
    policies = data.get("policies", [])
    redteam = data.get("redteam", {})
    service = city_state.get("city_context", {}).get("service_type", "Environment")
    payload = {"city_state": city_state, "policies": policies, "redteam": redteam}
    try:
        result = await asyncio.get_event_loop().run_in_executor(
            None, build_memo_with_debug, service, payload
        )
        return result
    except Exception as e:
        logger.error(f"Memo error: {e}")
        raise HTTPException(status_code=500, detail=f"Memo failed: {str(e)}")


@app.get("/agents/evidence")
async def agent_evidence(service: Optional[str] = None):
    """Retrieve evidence cards locally from city_state.json"""
    import asyncio
    from agents.rag import retrieve_evidence_cards
    from agents.city_state import load_json
    city_state_file = DATA_DIR / "city_state.json"
    if not city_state_file.exists():
        raise HTTPException(status_code=404, detail="city_state.json not found. Run /refresh first.")
    city_state = load_json(city_state_file)
    try:
        cards = await asyncio.get_event_loop().run_in_executor(
            None, retrieve_evidence_cards, city_state
        )
        return {"evidence_cards": cards, "service": service}
    except Exception as e:
        logger.error(f"Evidence error: {e}")
        raise HTTPException(status_code=500, detail=f"Evidence retrieval failed: {str(e)}")


@app.post("/agents/workflow")
async def agent_workflow(request: Request):
    """Run the full Proposer → RedTeam → Memo pipeline locally. Used by the Orchestrator uAgent."""
    import asyncio
    from agents.proposer import propose_policies_with_debug
    from agents.redteam import redteam_review_with_debug
    from agents.arbiter import build_memo_with_debug
    from agents.city_state import load_json
    city_state_file = DATA_DIR / "city_state.json"
    if not city_state_file.exists():
        raise HTTPException(status_code=404, detail="city_state.json not found. Run /refresh first.")
    try:
        data = await request.json()
    except Exception:
        data = {}
    query = data.get("query", "Analyze city equity")
    city_state = load_json(city_state_file)
    try:
        # Step 1: Propose
        propose_result = await asyncio.get_event_loop().run_in_executor(
            None, propose_policies_with_debug, city_state
        )
        policies = propose_result.get("policies", [])
        service = city_state.get("city_context", {}).get("service_type", "Environment")
        
        # Step 2: RedTeam
        redteam_payload = {"city_state": city_state, "policies": [p.model_dump() if hasattr(p, 'model_dump') else p for p in policies]}
        redteam_result = await asyncio.get_event_loop().run_in_executor(
            None, redteam_review_with_debug, service, redteam_payload
        )
        
        # Step 3: Memo
        memo_payload = {
            "city_state": city_state, 
            "policies": [p.model_dump() if hasattr(p, 'model_dump') else p for p in policies],
            "redteam": redteam_result.get("parsed_json", {})
        }
        memo_result = await asyncio.get_event_loop().run_in_executor(
            None, build_memo_with_debug, service, memo_payload
        )
        return {
            "query": query,
            "policies": propose_result.get("parsed_json", []),
            "redteam": redteam_result,
            "policy_memo": memo_result.get("memo", "") if isinstance(memo_result.get("memo"), str) else memo_result.get("result", {}).memo if hasattr(memo_result.get("result"), 'memo') else "",
            "memo_parsed": memo_result.get("parsed_json", {}),
            "validation_status": memo_result.get("validation_status", "unknown"),
        }
    except Exception as e:
        logger.error(f"Workflow error: {e}")
        raise HTTPException(status_code=500, detail=f"Workflow failed: {str(e)}")


@app.get("/services")
async def get_services():
    """
    Returns a list of unique service types available in the fairness metrics.
    """
    metrics_file = DATA_DIR / "fairness_metrics.json"
    if not metrics_file.exists():
        return {"services": []}
    
    try:
        with open(metrics_file, 'r') as f:
            data = json.load(f)
        services = sorted(list(set(row['service_type'] for row in data if row.get('service_type'))))
        return {"services": services}
    except Exception as e:
        logger.error(f"Error fetching services: {e}")
        return {"services": []}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)

@app.post("/agents/remote-chat")
async def trigger_remote_agent(request: Request):
    """
    Send a message to a remote agent (e.g. teammate's cloud agent) 
    without needing its seed.
    """
    try:
        try:
            body = await request.json()
        except Exception:
            body = {}
            
        target_address = body.get("address", REMOTE_ORCHESTRATOR)
        user_query = body.get("message", "Run AgentCivic analysis")
        
        logger.info(f"Triggering remote agent {target_address} with query: {user_query}")
        
        # We use a temporary agent (query) to send the message
        # Note: This requires the AGENTVERSE_API_KEY to be set in environment
        response = await query(
            destination=target_address, 
            message=RemoteChatMessage(message=user_query), 
            timeout=15.0
        )
        
        if response:
            # Assuming the agent returns a RemoteChatResponse or similar
            # If it's a raw string, we wrap it
            return {"ok": True, "agent_response": response.payload if hasattr(response, 'payload') else str(response)}
        
        return {"ok": False, "error": "No response from remote agent"}
        
    except Exception as e:
        logger.error(f"Remote trigger error: {e}")
        return JSONResponse(
            status_code=500, 
            content={"ok": False, "error": str(e)}
        )
