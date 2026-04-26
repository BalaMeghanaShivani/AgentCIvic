import logging
from typing import Dict


try:
    from nat.builder.builder import Builder
    from nat.builder.function_info import FunctionInfo
    from nat.cli.register_workflow import register_function
    from nat.data_models.function import FunctionBaseConfig
except ImportError:  # pragma: no cover
    from aiq.builder.builder import Builder  # type: ignore
    from aiq.builder.function_info import FunctionInfo  # type: ignore
    from aiq.cli.register_workflow import register_function  # type: ignore
    from aiq.data_models.function import FunctionBaseConfig  # type: ignore

from .workflow import (
    memo_step,
    propose_step,
    rank_step,
    redteam_step,
    retrieve_step,
    simulate_step,
    verify_step,
)

logger = logging.getLogger(__name__)






class AgentCivicProposeConfig(FunctionBaseConfig, name="agentcivic_propose"):
    description: str = "Propose policies from a city state."


class AgentCivicRetrieveConfig(FunctionBaseConfig, name="agentcivic_retrieve"):
    description: str = "Retrieve evidence cards from city metrics."


class AgentCivicSimulateConfig(FunctionBaseConfig, name="agentcivic_simulate"):
    description: str = "Run simulation for each proposed policy."


class AgentCivicVerifyConfig(FunctionBaseConfig, name="agentcivic_verify"):
    description: str = "Verify simulated policies against governance constraints."


class AgentCivicRankConfig(FunctionBaseConfig, name="agentcivic_rank"):
    description: str = "Rank policies deterministically using quant metrics."


class AgentCivicRedTeamConfig(FunctionBaseConfig, name="agentcivic_redteam"):
    description: str = "Red-team risk review based on sim + verify results."


class AgentCivicMemoConfig(FunctionBaseConfig, name="agentcivic_memo"):
    description: str = "Executive memo based on selected policy and evidence."


@register_function(config_type=AgentCivicProposeConfig)
async def agentcivic_propose(config: AgentCivicProposeConfig, builder: Builder):
    async def _inner(payload: dict) -> dict:
        return {"payload": propose_step(payload)}

    yield FunctionInfo.from_fn(_inner, description=config.description)


@register_function(config_type=AgentCivicRetrieveConfig)
async def agentcivic_retrieve(config: AgentCivicRetrieveConfig, builder: Builder):
    async def _inner(payload: dict) -> dict:
        return {"payload": retrieve_step(payload)}

    yield FunctionInfo.from_fn(_inner, description=config.description)


@register_function(config_type=AgentCivicSimulateConfig)
async def agentcivic_simulate(config: AgentCivicSimulateConfig, builder: Builder):
    async def _inner(payload: dict) -> dict:
        return {"payload": simulate_step(payload)}

    yield FunctionInfo.from_fn(_inner, description=config.description)


@register_function(config_type=AgentCivicVerifyConfig)
async def agentcivic_verify(config: AgentCivicVerifyConfig, builder: Builder):
    async def _inner(payload: dict) -> dict:
        return {"payload": verify_step(payload)}

    yield FunctionInfo.from_fn(_inner, description=config.description)


@register_function(config_type=AgentCivicRankConfig)
async def agentcivic_rank(config: AgentCivicRankConfig, builder: Builder):
    async def _inner(payload: dict) -> dict:
        return {"payload": rank_step(payload)}

    yield FunctionInfo.from_fn(_inner, description=config.description)


@register_function(config_type=AgentCivicRedTeamConfig)
async def agentcivic_redteam(config: AgentCivicRedTeamConfig, builder: Builder):
    async def _inner(payload: dict) -> dict:
        return {"payload": redteam_step(payload)}

    yield FunctionInfo.from_fn(_inner, description=config.description)


@register_function(config_type=AgentCivicMemoConfig)
async def agentcivic_memo(config: AgentCivicMemoConfig, builder: Builder):
    async def _inner(payload: dict) -> dict:
        return {"payload": memo_step(payload)}

    yield FunctionInfo.from_fn(_inner, description=config.description)
