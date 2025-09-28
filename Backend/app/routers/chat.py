import json

from fastapi import APIRouter
import logging

from fastapi import APIRouter
from langchain.chat_models import init_chat_model
from langchain_core.messages import message_to_dict
from langgraph.prebuilt import create_react_agent
from pydantic import BaseModel
from starlette.responses import StreamingResponse

from ..core.config import get_settings

model = init_chat_model("grok-4-fast-non-reasoning", model_provider="xai", xai_api_key=get_settings().xai_api_key)
log = logging.getLogger('uvicorn.error')

router = APIRouter()


def get_weather(city: str) -> str:
    """Get weather for a given city."""
    return f"It's always sunny in {city}!"


agent = create_react_agent(
    model=model,

    tools=[get_weather],

    prompt="You are a helpful assistant"

)


def prompt_agent(prompt: str):
    assert agent is not None
    for token, metadata in agent.stream(
            {"messages": [{"role": "user", "content": prompt}]},
            stream_mode="messages"
    ):
        log.info(f"token: {message_to_dict(token)}")
        payload = json.dumps(message_to_dict(token), ensure_ascii=False)
        yield payload + "\n"


class UserPrompt(BaseModel):
    content: str


@router.post("/chat")
def chat(user_prompt: UserPrompt):
    return StreamingResponse(prompt_agent(user_prompt.content, ), media_type="application/x-ndjson; charset=utf-8")
