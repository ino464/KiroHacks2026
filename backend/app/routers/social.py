from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/api", tags=["social"])


# ── Landmark likes ──────────────────────────────────────────────────────────

@router.post("/landmarks/{landmark_id}/like", response_model=schemas.LikeSummary)
def like_landmark(
    landmark_id: int,
    data: schemas.LikeAction,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_current_user),
):
    lm = db.query(models.Landmark).filter(models.Landmark.id == landmark_id).first()
    if not lm:
        raise HTTPException(status_code=404, detail="Landmark not found")

    existing = db.query(models.LandmarkLike).filter(
        models.LandmarkLike.user_id == current_user.id,
        models.LandmarkLike.landmark_id == landmark_id,
    ).first()

    if existing:
        if existing.is_like == data.is_like:
            # Same vote — remove it (toggle off)
            db.delete(existing)
        else:
            existing.is_like = data.is_like
    else:
        db.add(models.LandmarkLike(
            user_id=current_user.id,
            landmark_id=landmark_id,
            is_like=data.is_like,
        ))
    db.commit()
    return _landmark_like_summary(landmark_id, current_user.id, db)


@router.get("/landmarks/{landmark_id}/like", response_model=schemas.LikeSummary)
def get_landmark_likes(
    landmark_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_current_user),
):
    return _landmark_like_summary(landmark_id, current_user.id if current_user else None, db)


def _landmark_like_summary(landmark_id: int, user_id: Optional[int], db: Session) -> schemas.LikeSummary:
    all_likes = db.query(models.LandmarkLike).filter(
        models.LandmarkLike.landmark_id == landmark_id
    ).all()
    likes = sum(1 for l in all_likes if l.is_like)
    dislikes = sum(1 for l in all_likes if not l.is_like)
    user_vote = None
    if user_id:
        mine = next((l for l in all_likes if l.user_id == user_id), None)
        if mine:
            user_vote = mine.is_like
    return schemas.LikeSummary(likes=likes, dislikes=dislikes, user_vote=user_vote)


# ── Comments ────────────────────────────────────────────────────────────────

@router.get("/landmarks/{landmark_id}/comments", response_model=List[schemas.CommentOut])
def get_comments(
    landmark_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_current_user),
):
    comments = (
        db.query(models.Comment)
        .filter(models.Comment.landmark_id == landmark_id)
        .order_by(models.Comment.created_at.asc())
        .all()
    )
    return [_comment_out(c, current_user.id if current_user else None) for c in comments]


@router.post("/landmarks/{landmark_id}/comments", response_model=schemas.CommentOut, status_code=201)
def create_comment(
    landmark_id: int,
    data: schemas.CommentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_current_user),
):
    if not data.body.strip():
        raise HTTPException(status_code=400, detail="Comment cannot be empty")
    lm = db.query(models.Landmark).filter(models.Landmark.id == landmark_id).first()
    if not lm:
        raise HTTPException(status_code=404, detail="Landmark not found")
    comment = models.Comment(
        landmark_id=landmark_id,
        author_id=current_user.id,
        body=data.body.strip(),
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return _comment_out(comment, current_user.id)


@router.delete("/comments/{comment_id}", status_code=204)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_current_user),
):
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your comment")
    db.delete(comment)
    db.commit()


# ── Comment likes ───────────────────────────────────────────────────────────

@router.post("/comments/{comment_id}/like", response_model=schemas.LikeSummary)
def like_comment(
    comment_id: int,
    data: schemas.LikeAction,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_current_user),
):
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    existing = db.query(models.CommentLike).filter(
        models.CommentLike.user_id == current_user.id,
        models.CommentLike.comment_id == comment_id,
    ).first()

    if existing:
        if existing.is_like == data.is_like:
            db.delete(existing)
        else:
            existing.is_like = data.is_like
    else:
        db.add(models.CommentLike(
            user_id=current_user.id,
            comment_id=comment_id,
            is_like=data.is_like,
        ))
    db.commit()
    return _comment_like_summary(comment_id, current_user.id, db)


def _comment_like_summary(comment_id: int, user_id: int, db: Session) -> schemas.LikeSummary:
    all_likes = db.query(models.CommentLike).filter(
        models.CommentLike.comment_id == comment_id
    ).all()
    likes = sum(1 for l in all_likes if l.is_like)
    dislikes = sum(1 for l in all_likes if not l.is_like)
    mine = next((l for l in all_likes if l.user_id == user_id), None)
    return schemas.LikeSummary(likes=likes, dislikes=dislikes, user_vote=mine.is_like if mine else None)


def _comment_out(comment: models.Comment, user_id: Optional[int]) -> schemas.CommentOut:
    all_likes = comment.likes
    likes = sum(1 for l in all_likes if l.is_like)
    dislikes = sum(1 for l in all_likes if not l.is_like)
    user_vote = None
    if user_id:
        mine = next((l for l in all_likes if l.user_id == user_id), None)
        if mine:
            user_vote = mine.is_like
    return schemas.CommentOut(
        id=comment.id,
        body=comment.body,
        author=comment.author,
        created_at=comment.created_at,
        likes=likes,
        dislikes=dislikes,
        user_vote=user_vote,
    )
