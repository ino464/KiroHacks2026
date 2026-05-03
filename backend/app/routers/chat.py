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
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash-preview-04-17",
            system_instruction=SYSTEM_PROMPT,
        )

        # Build history for multi-turn conversation
        history = []
        messages = request.messages[:-1]  # all but last
        for msg in messages:
            history.append({
                "role": msg.role,
                "parts": [msg.content],
            })

        chat_session = model.start_chat(history=history)
        last_message = request.messages[-1].content
        response = chat_session.send_message(last_message)

        return ChatResponse(reply=response.text)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")
