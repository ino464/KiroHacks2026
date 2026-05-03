from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app import models, schemas, auth
router = APIRouter(prefix="/api", tags=["hikes"])


@router.post("/landmarks/{landmark_id}/hikes", response_model=schemas.HikeLogOut)
def log_hike(
    landmark_id: int,
    data: schemas.HikeLogSet,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_current_user),
):
    """Set how many times the current user has hiked this trail."""
    lm = db.query(models.Landmark).filter(models.Landmark.id == landmark_id).first()
    if not lm:
        raise HTTPException(status_code=404, detail="Landmark not found")
    if data.hike_count < 0:
        raise HTTPException(status_code=400, detail="Hike count cannot be negative")

    log = (
        db.query(models.HikeLog)
        .filter(
            models.HikeLog.user_id == current_user.id,
            models.HikeLog.landmark_id == landmark_id,
        )
        .first()
    )

    if log:
        log.hike_count = data.hike_count
    else:
        log = models.HikeLog(
            user_id=current_user.id,
            landmark_id=landmark_id,
            hike_count=data.hike_count,
        )
        db.add(log)

    db.commit()
    db.refresh(log)
    return log


@router.get("/landmarks/{landmark_id}/leaderboard", response_model=List[schemas.LeaderboardEntry])
def get_leaderboard(landmark_id: int, db: Session = Depends(get_db)):
    """Return top 10 hikers for a trail."""
    lm = db.query(models.Landmark).filter(models.Landmark.id == landmark_id).first()
    if not lm:
        raise HTTPException(status_code=404, detail="Landmark not found")

    results = (
        db.query(models.User.username, models.HikeLog.hike_count)
        .join(models.HikeLog, models.HikeLog.user_id == models.User.id)
        .filter(models.HikeLog.landmark_id == landmark_id)
        .order_by(models.HikeLog.hike_count.desc())
        .limit(10)
        .all()
    )

    return [
        schemas.LeaderboardEntry(rank=i + 1, username=row.username, hike_count=row.hike_count)
        for i, row in enumerate(results)
    ]


@router.get("/landmarks/{landmark_id}/my-hikes", response_model=schemas.HikeLogOut)
def get_my_hike_log(
    landmark_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_current_user),
):
    """Get the current user's hike log for a trail."""
    log = (
        db.query(models.HikeLog)
        .filter(
            models.HikeLog.user_id == current_user.id,
            models.HikeLog.landmark_id == landmark_id,
        )
        .first()
    )
    if not log:
        raise HTTPException(status_code=404, detail="No hike log found")
    return log


@router.get("/users/me/stats", response_model=schemas.UserStats)
def get_my_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_current_user),
):
    """Get the current user's personal stats including miles and medals."""
    total_hikes = (
        db.query(func.sum(models.HikeLog.hike_count))
        .filter(models.HikeLog.user_id == current_user.id)
        .scalar()
    ) or 0

    trail_count = (
        db.query(func.count(models.HikeLog.id))
        .filter(models.HikeLog.user_id == current_user.id)
        .scalar()
    ) or 0

    post_count = (
        db.query(func.count(models.Landmark.id))
        .filter(models.Landmark.author_id == current_user.id)
        .scalar()
    ) or 0

    # Calculate total miles: sum of (hike_count * trail_length_miles) for each log
    hike_logs = (
        db.query(models.HikeLog, models.Landmark.trail_length_miles)
        .join(models.Landmark, models.Landmark.id == models.HikeLog.landmark_id)
        .filter(models.HikeLog.user_id == current_user.id)
        .all()
    )
    total_miles = sum(
        (log.hike_count * (miles or 0))
        for log, miles in hike_logs
    )

    # Find medals: check each trail the user has logged and see if they're top 3
    MEDAL_LABELS = {1: "🥇", 2: "🥈", 3: "🥉"}
    medals = []
    for log, _ in hike_logs:
        # Get leaderboard rank for this trail
        results = (
            db.query(models.User.username, models.HikeLog.hike_count)
            .join(models.HikeLog, models.HikeLog.user_id == models.User.id)
            .filter(models.HikeLog.landmark_id == log.landmark_id)
            .order_by(models.HikeLog.hike_count.desc())
            .limit(3)
            .all()
        )
        for rank, row in enumerate(results, start=1):
            if row.username == current_user.username:
                trail = db.query(models.Landmark).filter(
                    models.Landmark.id == log.landmark_id
                ).first()
                medals.append(schemas.MedalEntry(
                    trail_title=trail.title if trail else "Unknown",
                    rank=rank,
                    medal=MEDAL_LABELS[rank],
                ))
                break

    return schemas.UserStats(
        username=current_user.username,
        total_hikes=total_hikes,
        post_count=post_count,
        trail_count=trail_count,
        total_miles=round(total_miles, 1),
        medals=medals,
        trophies=db.query(func.count(models.Trophy.id)).filter(
            models.Trophy.user_id == current_user.id
        ).scalar() or 0,
    )
