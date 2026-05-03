import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth
from app.config import settings

router = APIRouter(prefix="/api/landmarks", tags=["landmarks"])


def _photo_count(landmark: models.Landmark) -> int:
    return len(landmark.photos)


@router.get("", response_model=List[schemas.LandmarkSummary])
def list_landmarks(
    category: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    official_only: bool = Query(False),
    db: Session = Depends(get_db),
):
    """Return lightweight landmark list for map pins."""
    q = db.query(models.Landmark)
    if category:
        q = q.filter(models.Landmark.category == category)
    if difficulty:
        q = q.filter(models.Landmark.difficulty == difficulty)
    if official_only:
        q = q.filter(models.Landmark.is_official == True)
    landmarks = q.all()
    result = []
    for lm in landmarks:
        result.append(
            schemas.LandmarkSummary(
                id=lm.id,
                title=lm.title,
                latitude=lm.latitude,
                longitude=lm.longitude,
                difficulty=lm.difficulty,
                category=lm.category,
                is_official=lm.is_official,
                photo_count=_photo_count(lm),
                route_coords=lm.route_coords,
            )
        )
    return result


@router.get("/{landmark_id}", response_model=schemas.LandmarkOut)
def get_landmark(landmark_id: int, db: Session = Depends(get_db)):
    lm = db.query(models.Landmark).filter(models.Landmark.id == landmark_id).first()
    if not lm:
        raise HTTPException(status_code=404, detail="Landmark not found")
    return lm


@router.post("", response_model=schemas.LandmarkOut, status_code=201)
def create_landmark(
    landmark_in: schemas.LandmarkCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_current_user),
):
    lm = models.Landmark(
        **landmark_in.model_dump(),
        author_id=current_user.id,
        is_official=False,
    )
    db.add(lm)
    db.commit()
    db.refresh(lm)
    return lm


@router.patch("/{landmark_id}", response_model=schemas.LandmarkOut)
def update_landmark(
    landmark_id: int,
    landmark_in: schemas.LandmarkUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_current_user),
):
    lm = db.query(models.Landmark).filter(models.Landmark.id == landmark_id).first()
    if not lm:
        raise HTTPException(status_code=404, detail="Landmark not found")
    if lm.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your landmark")
    for field, value in landmark_in.model_dump(exclude_unset=True).items():
        setattr(lm, field, value)
    db.commit()
    db.refresh(lm)
    return lm


@router.delete("/{landmark_id}", status_code=204)
def delete_landmark(
    landmark_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_current_user),
):
    lm = db.query(models.Landmark).filter(models.Landmark.id == landmark_id).first()
    if not lm:
        raise HTTPException(status_code=404, detail="Landmark not found")
    if lm.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your landmark")
    db.delete(lm)
    db.commit()
