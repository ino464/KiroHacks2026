from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.models import DifficultyLevel, LandmarkCategory


# --- Auth ---

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


# --- Photos ---

class PhotoOut(BaseModel):
    id: int
    filename: str
    original_filename: str
    uploaded_by_id: Optional[int] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True


# --- Landmarks ---

class LandmarkCreate(BaseModel):
    title: str
    description: str
    latitude: float
    longitude: float
    difficulty: DifficultyLevel
    category: LandmarkCategory


class LandmarkUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[DifficultyLevel] = None
    category: Optional[LandmarkCategory] = None


class LandmarkOut(BaseModel):
    id: int
    title: str
    description: str
    latitude: float
    longitude: float
    difficulty: DifficultyLevel
    category: LandmarkCategory
    is_official: bool
    trail_length_miles: Optional[float] = None
    elevation_gain_ft: Optional[int] = None
    avg_time_minutes: Optional[int] = None
    author: Optional[UserOut] = None
    photos: List[PhotoOut] = []
    created_at: datetime

    class Config:
        from_attributes = True


class LandmarkSummary(BaseModel):
    """Lightweight version for map pins — no photos list."""
    id: int
    title: str
    latitude: float
    longitude: float
    difficulty: DifficultyLevel
    category: LandmarkCategory
    is_official: bool
    photo_count: int = 0

    class Config:
        from_attributes = True


# --- Hike Logs ---

class HikeLogSet(BaseModel):
    """Set (or update) how many times the current user has hiked a trail."""
    hike_count: int


class HikeLogOut(BaseModel):
    id: int
    user_id: int
    landmark_id: int
    hike_count: int
    updated_at: datetime

    class Config:
        from_attributes = True


class LeaderboardEntry(BaseModel):
    rank: int
    username: str
    hike_count: int


class MedalEntry(BaseModel):
    trail_title: str
    rank: int
    medal: str  # "🥇", "🥈", "🥉"


class UserStats(BaseModel):
    username: str
    total_hikes: int
    post_count: int
    trail_count: int
    total_miles: float
    medals: List[MedalEntry]


# --- Likes ---

class LikeAction(BaseModel):
    is_like: bool  # True = like, False = dislike


class LikeSummary(BaseModel):
    likes: int
    dislikes: int
    user_vote: Optional[bool] = None  # True/False/None


# --- Comments ---

class CommentCreate(BaseModel):
    body: str


class CommentOut(BaseModel):
    id: int
    body: str
    author: UserOut
    created_at: datetime
    likes: int = 0
    dislikes: int = 0
    user_vote: Optional[bool] = None

    class Config:
        from_attributes = True
