"""Local-only FastAPI bridge from Next.js to Strands Agents SDK."""
import logging

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from typing import Literal

from pydantic import BaseModel, Field, field_validator

load_dotenv()
from agent_service import ask_strands, provider_status  # noqa: E402

app = FastAPI(title="MyPortfolio Demo AI", docs_url="/docs", redoc_url=None)
logger = logging.getLogger("myportfolio")


class ChatTurn(BaseModel):
    role: Literal["user", "assistant"]
    text: str = Field(min_length=1, max_length=500)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=500)
    history: list[ChatTurn] = Field(default_factory=list, max_length=8)

    @field_validator("message")
    @classmethod
    def trim(cls, message: str) -> str:
        cleaned = message.strip()
        if not cleaned:
            raise ValueError("Message must not be blank.")
        return cleaned


@app.get("/api/health")
def health() -> dict:
    return {"service": "myportfolio-agent", "status": "running", "agent": provider_status()}


@app.post("/api/chat")
def chat(request: ChatRequest) -> dict:
    if not provider_status()["ready"]:
        raise HTTPException(status_code=503, detail=provider_status()["message"])
    try:
        return ask_strands(request.message, [turn.model_dump() for turn in request.history])
    except (ValueError, TypeError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception:
        # Avoid leaking prompts, tokens, provider responses, or internal traces to the client.
        logger.exception("Strands agent call failed")
        raise HTTPException(status_code=502, detail="AI provider request failed. Check the backend terminal and model configuration.") from None
