from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/api", tags=["profiles", "messages"])

MEDAL_LABELS = {1: "🥇", 2: "🥈", 3: "🥉"}


def _build_profile(user: models.User, db: Session) -> schemas.PublicProfile:
    total_hikes = (
        db.query(func.sum(models.HikeLog.hike_count))
        .filter(models.HikeLog.user_id == user.id)
        .scalar()
    ) or 0

    trail_count = (
        db.query(func.count(models.HikeLog.id))
        .filter(models.HikeLog.user_id == user.id)
        .scalar()
    ) or 0

    post_count = (
        db.query(func.count(models.Landmark.id))
        .filter(models.Landmark.author_id == user.id)
        .scalar()
    ) or 0

    hike_logs = (
        db.query(models.HikeLog, models.Landmark.trail_length_miles)
        .join(models.Landmark, models.Landmark.id == models.HikeLog.landmark_id)
        .filter(models.HikeLog.user_id == user.id)
        .all()
    )
    total_miles = round(sum((log.hike_count * (miles or 0)) for log, miles in hike_logs), 1)

    medals = []
    for log, _ in hike_logs:
        results = (
            db.query(models.User.username, models.HikeLog.hike_count)
            .join(models.HikeLog, models.HikeLog.user_id == models.User.id)
            .filter(models.HikeLog.landmark_id == log.landmark_id)
            .order_by(models.HikeLog.hike_count.desc())
            .limit(3)
            .all()
        )
        for rank, row in enumerate(results, start=1):
            if row.username == user.username:
                trail = db.query(models.Landmark).filter(
                    models.Landmark.id == log.landmark_id
                ).first()
                medals.append(schemas.MedalEntry(
                    trail_title=trail.title if trail else "Unknown",
                    rank=rank,
                    medal=MEDAL_LABELS[rank],
                ))
                break

    return schemas.PublicProfile(
        id=user.id,
        username=user.username,
        joined=user.created_at,
        total_hikes=total_hikes,
        total_miles=total_miles,
        post_count=post_count,
        trail_count=trail_count,
        medals=medals,
        trophies=db.query(func.count(models.Trophy.id)).filter(
            models.Trophy.user_id == user.id
        ).scalar() or 0,
    )


@router.get("/users/{username}/profile", response_model=schemas.PublicProfile)
def get_profile(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return _build_profile(user, db)


# ── Messages ────────────────────────────────────────────────────────────────

@router.get("/messages/conversations", response_model=List[schemas.ConversationSummary])
def get_conversations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_current_user),
):
    """List all conversations for the current user."""
    messages = (
        db.query(models.Message)
        .filter(
            or_(
                models.Message.sender_id == current_user.id,
                models.Message.recipient_id == current_user.id,
            )
        )
        .order_by(models.Message.created_at.desc())
        .all()
    )

    seen = {}
    for msg in messages:
        other_id = msg.recipient_id if msg.sender_id == current_user.id else msg.sender_id
        if other_id not in seen:
            seen[other_id] = msg

    result = []
    for other_id, last_msg in seen.items():
        other = db.query(models.User).filter(models.User.id == other_id).first()
        unread = (
            db.query(func.count(models.Message.id))
            .filter(
                models.Message.sender_id == other_id,
                models.Message.recipient_id == current_user.id,
                models.Message.is_read == False,
            )
            .scalar()
        ) or 0
        result.append(schemas.ConversationSummary(
            other_user_id=other_id,
            other_username=other.username if other else "Unknown",
            last_message=last_msg.body[:60] + ("..." if len(last_msg.body) > 60 else ""),
            last_message_at=last_msg.created_at,
            unread_count=unread,
        ))

    return sorted(result, key=lambda x: x.last_message_at, reverse=True)


@router.get("/messages/{username}", response_model=List[schemas.MessageOut])
def get_conversation(
    username: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_current_user),
):
    """Get full message thread with a specific user."""
    other = db.query(models.User).filter(models.User.username == username).first()
    if not other:
        raise HTTPException(status_code=404, detail="User not found")

    messages = (
        db.query(models.Message)
        .filter(
            or_(
                and_(models.Message.sender_id == current_user.id, models.Message.recipient_id == other.id),
                and_(models.Message.sender_id == other.id, models.Message.recipient_id == current_user.id),
            )
        )
        .order_by(models.Message.created_at.asc())
        .all()
    )

    # Mark incoming as read
    for msg in messages:
        if msg.recipient_id == current_user.id and not msg.is_read:
            msg.is_read = True
    db.commit()

    return [_msg_out(m) for m in messages]


@router.post("/messages/{username}", response_model=schemas.MessageOut, status_code=201)
def send_message(
    username: str,
    data: schemas.MessageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_current_user),
):
    other = db.query(models.User).filter(models.User.username == username).first()
    if not other:
        raise HTTPException(status_code=404, detail="User not found")
    if other.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot message yourself")
    if not data.body.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    msg = models.Message(
        sender_id=current_user.id,
        recipient_id=other.id,
        body=data.body.strip(),
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return _msg_out(msg)


@router.get("/messages/unread/count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_current_user),
):
    count = (
        db.query(func.count(models.Message.id))
        .filter(
            models.Message.recipient_id == current_user.id,
            models.Message.is_read == False,
        )
        .scalar()
    ) or 0
    return {"unread": count}


def _msg_out(msg: models.Message) -> schemas.MessageOut:
    return schemas.MessageOut(
        id=msg.id,
        sender_id=msg.sender_id,
        sender_username=msg.sender.username,
        recipient_id=msg.recipient_id,
        recipient_username=msg.recipient.username,
        body=msg.body,
        is_read=msg.is_read,
        created_at=msg.created_at,
    )
