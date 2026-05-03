from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from typing import List
from pydantic import BaseModel
from app.database import get_db
from app import models, auth

router = APIRouter(prefix="/api/objectives", tags=["objectives"])


def get_week_start() -> datetime:
    """Returns the most recent Monday at 00:00 UTC."""
    now = datetime.now(timezone.utc)
    days_since_monday = now.weekday()
    monday = now - timedelta(days=days_since_monday)
    return monday.replace(hour=0, minute=0, second=0, microsecond=0)


class Objective(BaseModel):
    id: str
    title: str
    description: str
    target: int
    progress: int
    unit: str
    completed: bool
    icon: str


@router.get("", response_model=List[Objective])
def get_objectives(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_current_user),
):
    week_start = get_week_start()

    # 1. Posts made this week
    posts_this_week = (
        db.query(func.count(models.Landmark.id))
        .filter(
            models.Landmark.author_id == current_user.id,
            models.Landmark.created_at >= week_start,
        )
        .scalar()
    ) or 0

    # 2. Miles hiked this week — sum of new hike logs updated this week
    # We track by updated_at on hike_logs × trail_length
    hike_logs_this_week = (
        db.query(models.HikeLog, models.Landmark.trail_length_miles)
        .join(models.Landmark, models.Landmark.id == models.HikeLog.landmark_id)
        .filter(
            models.HikeLog.user_id == current_user.id,
            models.HikeLog.updated_at >= week_start,
        )
        .all()
    )
    miles_this_week = round(
        sum((log.hike_count * (miles or 0)) for log, miles in hike_logs_this_week), 1
    )

    # 3. Comments posted this week
    comments_this_week = (
        db.query(func.count(models.Comment.id))
        .filter(
            models.Comment.author_id == current_user.id,
            models.Comment.created_at >= week_start,
        )
        .scalar()
    ) or 0

    # 4. Trails logged this week (any hike log updated this week)
    trails_this_week = (
        db.query(func.count(models.HikeLog.id))
        .filter(
            models.HikeLog.user_id == current_user.id,
            models.HikeLog.updated_at >= week_start,
        )
        .scalar()
    ) or 0

    # 5. Photos uploaded this week
    photos_this_week = (
        db.query(func.count(models.Photo.id))
        .filter(
            models.Photo.uploaded_by_id == current_user.id,
            models.Photo.uploaded_at >= week_start,
        )
        .scalar()
    ) or 0

    # 6. Likes given this week
    likes_this_week = (
        db.query(func.count(models.LandmarkLike.id))
        .filter(
            models.LandmarkLike.user_id == current_user.id,
            models.LandmarkLike.created_at >= week_start,
        )
        .scalar()
    ) or 0

    objectives = [
        Objective(
            id="post_spot",
            title="Share a Spot",
            description="Post a new landmark or cool spot on the map",
            target=1,
            progress=min(posts_this_week, 1),
            unit="post",
            completed=posts_this_week >= 1,
            icon="📍",
        ),
        Objective(
            id="hike_miles",
            title="Hit the Trail",
            description="Log at least 5 miles of hiking this week",
            target=5,
            progress=min(int(miles_this_week), 5),
            unit="miles",
            completed=miles_this_week >= 5,
            icon="🥾",
        ),
        Objective(
            id="log_trail",
            title="Trail Logger",
            description="Log a hike on 2 different trails",
            target=2,
            progress=min(trails_this_week, 2),
            unit="trails",
            completed=trails_this_week >= 2,
            icon="🗺️",
        ),
        Objective(
            id="add_photo",
            title="Photographer",
            description="Upload a photo to any trail or spot",
            target=1,
            progress=min(photos_this_week, 1),
            unit="photo",
            completed=photos_this_week >= 1,
            icon="📷",
        ),
        Objective(
            id="leave_comment",
            title="Community Voice",
            description="Leave comments on 3 trails or spots",
            target=3,
            progress=min(comments_this_week, 3),
            unit="comments",
            completed=comments_this_week >= 3,
            icon="💬",
        ),
        Objective(
            id="give_likes",
            title="Spread the Love",
            description="Like 5 spots or trails",
            target=5,
            progress=min(likes_this_week, 5),
            unit="likes",
            completed=likes_this_week >= 5,
            icon="👍",
        ),
    ]

    return objectives
