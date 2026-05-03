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
    newly_awarded: bool = False  # True if trophy was just awarded this call


def _award_trophy_if_needed(
    db: Session,
    user_id: int,
    objective_id: str,
    objective_title: str,
    completed: bool,
    week_start: datetime,
):
    """Award a trophy if objective is complete and not already awarded this week."""
    if not completed:
        return False
    existing = db.query(models.Trophy).filter(
        models.Trophy.user_id == user_id,
        models.Trophy.objective_id == objective_id,
        models.Trophy.week_start == week_start,
    ).first()
    if existing:
        return False
    db.add(models.Trophy(
        user_id=user_id,
        objective_id=objective_id,
        objective_title=objective_title,
        week_start=week_start,
    ))
    db.commit()
    return True


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

    # 2. Miles hiked this week
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

    # 4. Trails logged this week
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

    raw = [
        ("post_spot",     "Share a Spot",     "Post a new landmark or cool spot on the map",  1,  posts_this_week,    "post",     "📍"),
        ("hike_miles",    "Hit the Trail",    "Log at least 5 miles of hiking this week",      5,  int(miles_this_week), "miles",  "🥾"),
        ("log_trail",     "Trail Logger",     "Log a hike on 2 different trails",              2,  trails_this_week,   "trails",   "🗺️"),
        ("add_photo",     "Photographer",     "Upload a photo to any trail or spot",           1,  photos_this_week,   "photo",    "📷"),
        ("leave_comment", "Community Voice",  "Leave comments on 3 trails or spots",           3,  comments_this_week, "comments", "💬"),
        ("give_likes",    "Spread the Love",  "Like 5 spots or trails",                        5,  likes_this_week,    "likes",    "👍"),
    ]

    objectives = []
    for obj_id, title, desc, target, progress, unit, icon in raw:
        completed = progress >= target
        newly_awarded = _award_trophy_if_needed(
            db, current_user.id, obj_id, title, completed, week_start
        )
        objectives.append(Objective(
            id=obj_id,
            title=title,
            description=desc,
            target=target,
            progress=min(progress, target),
            unit=unit,
            completed=completed,
            icon=icon,
            newly_awarded=newly_awarded,
        ))

    return objectives


@router.get("/trophies/count")
def get_trophy_count(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_current_user),
):
    count = db.query(func.count(models.Trophy.id)).filter(
        models.Trophy.user_id == current_user.id
    ).scalar() or 0
    return {"trophies": count}


@router.get("/trophies/count/{username}")
def get_trophy_count_for_user(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        return {"trophies": 0}
    count = db.query(func.count(models.Trophy.id)).filter(
        models.Trophy.user_id == user.id
    ).scalar() or 0
    return {"trophies": count}
