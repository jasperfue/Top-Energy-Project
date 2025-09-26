from langgraph.prebuilt import create_react_agent
from langchain.chat_models import init_chat_model
import logging

from ..core.config import get_settings

model = init_chat_model("grok-4-fast-non-reasoning", model_provider="xai", xai_api_key=get_settings().xai_api_key)
log = logging.getLogger('uvicorn.error')


def get_weather(city: str) -> str:
    """Get weather for a given city."""
    return f"It's always sunny in {city}!"


agent = create_react_agent(
    model=model,

    tools=[get_weather],

    prompt="You are a helpful assistant"

)


def test_custom_agent():
    """Test custom agent."""
    assert agent is not None
    for token, metadata in agent.stream(
            {"messages": [{"role": "user", "content": "what is the weather in sf"}]},
            stream_mode="messages"
    ):
        if "agent" in metadata["langgraph_checkpoint_ns"]:
            log.info(f"token: {token}")
            log.info(f"metadata: {metadata}")

# Run the agent
