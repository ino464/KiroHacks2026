# SLO Explorer 🏔️

Discover and share cool spots around San Luis Obispo — hiking trails, viewpoints, swimming holes, and more.

## Stack

| Layer | Tech |
|-------|------|
| Backend | Python 3.11+, FastAPI, SQLAlchemy, PostgreSQL |
| Frontend | React 18, Vite, Leaflet.js, Tailwind CSS |
| Auth | JWT (python-jose + passlib/bcrypt) |
| File storage | Local filesystem (easily swappable to S3) |

---

## Quick Start

### 1. Start the database

```bash
cd backend
docker-compose up -d
```

This spins up a PostgreSQL 16 container on port 5432.

### 2. Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy env file (edit if needed)
cp .env.example .env

# Start the API server
uvicorn app.main:app --reload --port 8000
```

The API will be at http://localhost:8000  
Interactive docs: http://localhost:8000/docs

On first startup the server automatically seeds 15 well-known SLO area trails and landmarks.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be at http://localhost:5173

---

## Features

- **Interactive map** centered on San Luis Obispo using OpenStreetMap tiles
- **15 pre-loaded official trails** including Bishop Peak, Montana de Oro, Morro Rock, and more
- **User accounts** — register, log in, post your own spots
- **Create landmarks** by clicking anywhere on the map
- **Filter** by category and difficulty
- **Photo uploads** — add multiple photos to any landmark
- **Difficulty levels**: Easy 🟢 / Moderate 🟡 / Hard 🔴 / Expert 🟣
- **Categories**: Hiking Trail, Viewpoint, Swimming Hole, Camping, Picnic Area, Historical, Wildlife, Other

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app + startup
│   │   ├── config.py        # Settings (env vars)
│   │   ├── database.py      # SQLAlchemy engine/session
│   │   ├── models.py        # DB models (User, Landmark, Photo)
│   │   ├── schemas.py       # Pydantic request/response schemas
│   │   ├── auth.py          # JWT auth helpers
│   │   ├── seed_data.py     # Official SLO landmarks seed
│   │   └── routers/
│   │       ├── auth.py      # /api/auth/*
│   │       ├── landmarks.py # /api/landmarks/*
│   │       └── photos.py    # /api/landmarks/:id/photos, /api/uploads/*
│   ├── docker-compose.yml
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── api.js           # Axios API client
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   └── components/
    │       ├── Navbar.jsx
    │       ├── MapView.jsx          # Main map + filters
    │       ├── LandmarkPopup.jsx    # Click-a-pin detail view
    │       ├── CreateLandmarkModal.jsx
    │       └── AuthModal.jsx
    ├── package.json
    └── vite.config.js       # Proxies /api and /uploads to backend
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | — | Create account |
| POST | /api/auth/login | — | Get JWT token |
| GET | /api/auth/me | ✓ | Current user |
| GET | /api/landmarks | — | List all (filterable) |
| GET | /api/landmarks/:id | — | Full landmark detail |
| POST | /api/landmarks | ✓ | Create landmark |
| PATCH | /api/landmarks/:id | ✓ owner | Update landmark |
| DELETE | /api/landmarks/:id | ✓ owner | Delete landmark |
| POST | /api/landmarks/:id/photos | ✓ | Upload photo |
| DELETE | /api/photos/:id | ✓ owner | Delete photo |
| GET | /uploads/:filename | — | Serve uploaded image |
