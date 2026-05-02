import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth
from app.config import settings

router = APIRouter(prefix="/api", tags=["photos"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


def _ensure_upload_dir():
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)


@router.post("/landmarks/{landmark_id}/photos", response_model=schemas.PhotoOut, status_code=201)
async def upload_photo(
    landmark_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_current_user),
):
    lm = db.query(models.Landmark).filter(models.Landmark.id == landmark_id).first()
    if not lm:
        raise HTTPException(status_code=404, detail="Landmark not found")

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP, and GIF images are allowed")

    contents = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(status_code=400, detail=f"File too large (max {settings.MAX_UPLOAD_SIZE_MB}MB)")

    _ensure_upload_dir()
    ext = os.path.splitext(file.filename or "image.jpg")[1] or ".jpg"
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_name)

    with open(file_path, "wb") as f:
        f.write(contents)

    photo = models.Photo(
        landmark_id=landmark_id,
        filename=unique_name,
        original_filename=file.filename or unique_name,
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo


@router.delete("/photos/{photo_id}", status_code=204)
def delete_photo(
    photo_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_current_user),
):
    photo = db.query(models.Photo).filter(models.Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    lm = photo.landmark
    if lm.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    file_path = os.path.join(settings.UPLOAD_DIR, photo.filename)
    if os.path.exists(file_path):
        os.remove(file_path)

    db.delete(photo)
    db.commit()


@router.get("/uploads/{filename}")
def serve_upload(filename: str):
    """Serve uploaded images."""
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    # Prevent path traversal
    abs_upload = os.path.abspath(settings.UPLOAD_DIR)
    abs_file = os.path.abspath(file_path)
    if not abs_file.startswith(abs_upload):
        raise HTTPException(status_code=400, detail="Invalid path")
    return FileResponse(abs_file)
