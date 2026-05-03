from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine
from app import models
from app.routers import auth, landmarks, photos

# Create tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SLO Explorer API",
    description="Discover and share cool spots around San Luis Obispo",
    version="1.0.0",
)

# Allow requests from the frontend (localhost for dev, Vercel URL for prod)
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]
if settings.FRONTEND_URL:
    allowed_origins.append(settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(landmarks.router)
app.include_router(photos.router)


@app.get("/")
def root():
    return {"message": "SLO Explorer API", "docs": "/docs"}


@app.on_event("startup")
def on_startup():
    """Seed official landmarks if the DB is empty."""
    from app.seed_data import seed
    seed()
