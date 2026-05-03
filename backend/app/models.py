from sqlalchemy import (
    Column, Integer, String, Float, Text, DateTime, ForeignKey,
    Boolean, Enum as SAEnum, UniqueConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class DifficultyLevel(str, enum.Enum):
    easy = "easy"
    moderate = "moderate"
    hard = "hard"
    expert = "expert"


class LandmarkCategory(str, enum.Enum):
    hiking_trail = "hiking_trail"
    viewpoint = "viewpoint"
    swimming_hole = "swimming_hole"
    camping = "camping"
    picnic_area = "picnic_area"
    historical = "historical"
    wildlife = "wildlife"
    other = "other"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    landmarks = relationship("Landmark", back_populates="author")
    hike_logs = relationship("HikeLog", back_populates="user")


class Landmark(Base):
    __tablename__ = "landmarks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    difficulty = Column(SAEnum(DifficultyLevel), nullable=False, default=DifficultyLevel.easy)
    category = Column(SAEnum(LandmarkCategory), nullable=False, default=LandmarkCategory.other)
    is_official = Column(Boolean, default=False)
    trail_length_miles = Column(Float, nullable=True)
    elevation_gain_ft = Column(Integer, nullable=True)
    avg_time_minutes = Column(Integer, nullable=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    author = relationship("User", back_populates="landmarks")
    photos = relationship("Photo", back_populates="landmark", cascade="all, delete-orphan")
    hike_logs = relationship("HikeLog", back_populates="landmark")


class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    landmark_id = Column(Integer, ForeignKey("landmarks.id"), nullable=False)
    uploaded_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    landmark = relationship("Landmark", back_populates="photos")
    uploaded_by = relationship("User")


class HikeLog(Base):
    """Tracks how many times a user has hiked a specific trail."""
    __tablename__ = "hike_logs"
    __table_args__ = (
        UniqueConstraint("user_id", "landmark_id", name="uq_user_landmark"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    landmark_id = Column(Integer, ForeignKey("landmarks.id"), nullable=False)
    hike_count = Column(Integer, nullable=False, default=1)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="hike_logs")
    landmark = relationship("Landmark", back_populates="hike_logs")
