from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import google.generativeai as genai
from app.config import settings

router = APIRouter(prefix="/api/chat", tags=["chat"])

SYSTEM_PROMPT = """You are SLO Trail Guide, a friendly and knowledgeable AI assistant for the SLO Explorer app — a hiking and outdoor discovery platform for San Luis Obispo, California and the surrounding Central Coast area.

You help users with:
- Trail recommendations based on difficulty, distance, and fitness level
- Information about specific trails like Bishop Peak, Montana de Oro, Cerro San Luis, Morro Rock, etc.
- Best times to visit, what to bring, parking tips, and safety advice
- Local wildlife, plants, and points of interest
- Weather considerations for hiking on the Central Coast
- General outdoor and hiking tips

Keep responses friendly, concise, and practical. If asked about something unrelated to hiking, outdoors, or the SLO area, politely redirect the conversation back to trails and outdoor activities.

Key trails in the app:
- Bishop Peak (3.2 mi, 940 ft gain, moderate) — highest of the Nine Sisters
- Cerro San Luis / Madonna Mountain (2.8 mi, 590 ft gain, easy)
- Montana de Oro Bluff Trail (4.0 mi, easy) — stunning coastal cliffs
- Valencia Peak at Montana de Oro (4.6 mi, 1100 ft gain, moderate)
- Cerro Alto (5.8 mi, 1600 ft gain, hard) — near Atascadero
- Poly Canyon Design Village Trail (3.6 mi, easy) — Cal Poly campus
- Islay Hill Open Space (1.4 mi, moderate) — Edna Valley views
- Morro Rock (1.0 mi, easy) — iconic volcanic plug at Morro Bay
- Lopez Lake Recreation Area — camping and hiking
- Chumash Trail at Santa Margarita Lake
"""


class ChatMessage(BaseModel):
    role: str  # "user" or "model"
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]


class ChatResponse(BaseModel):
    reply: str


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not settings.GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="AI chat is not configured")

    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)

        # List available models to find the right one
        available = [m.name for m in genai.list_models()
                     if "generateContent" in m.supported_generation_methods]

        # Pick best available model in order of preference
        preferred = [
            "models/gemini-2.5-flash",
            "models/gemini-2.5-flash-lite",
            "models/gemini-2.0-flash-lite",
            "models/gemini-2.0-flash-001",
            "models/gemini-flash-latest",
        ]
        model_name = next((m for m in preferred if m in available), None)

        if not model_name:
            raise HTTPException(
                status_code=503,
                detail=f"No supported model found. Available: {available[:5]}"
            )

        model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=SYSTEM_PROMPT,
        )

        # Build history for multi-turn conversation
        history = []
        for msg in request.messages[:-1]:
            history.append({
                "role": msg.role,
                "parts": [msg.content],
            })

        chat_session = model.start_chat(history=history)
        response = chat_session.send_message(request.messages[-1].content)

        return ChatResponse(reply=response.text)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")


@router.get("/models")
def list_available_models():
    """Debug endpoint to see what models are available for this API key."""
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        models = [
            {"name": m.name, "methods": m.supported_generation_methods}
            for m in genai.list_models()
            if "generateContent" in m.supported_generation_methods
        ]
        return {"models": models}
    except Exception as e:
        return {"error": str(e)}
