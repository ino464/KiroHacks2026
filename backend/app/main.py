from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine
from app import models
from app.routers import auth, landmarks, photos, hikes, social, profiles, chat, objectives

# Create tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SLO Your Soul API",
    description="Discover and share cool spots around San Luis Obispo",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(landmarks.router)
app.include_router(photos.router)
app.include_router(hikes.router)
app.include_router(social.router)
app.include_router(profiles.router)
app.include_router(chat.router)
app.include_router(objectives.router)


@app.get("/")
def root():
    return {"message": "SLO Explorer API", "docs": "/docs"}


@app.on_event("startup")
def on_startup():
    """Seed official landmarks if the DB is empty."""
    from app.seed_data import seed
    seed()
