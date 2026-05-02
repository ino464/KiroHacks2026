"""
Seed the database with well-known SLO area hiking trails and landmarks.
Run with: python -m app.seed_data
"""
from app.database import SessionLocal, engine
from app import models

OFFICIAL_LANDMARKS = [
    {
        "title": "Bishop Peak",
        "description": (
            "The highest of the Nine Sisters morros, Bishop Peak rises 1,559 ft and offers "
            "panoramic views of San Luis Obispo and the surrounding valleys. The trail is rocky "
            "and steep near the summit but rewards hikers with stunning 360-degree views."
        ),
        "latitude": 35.2897,
        "longitude": -120.6836,
        "difficulty": "moderate",
        "category": "hiking_trail",
        "is_official": True,
    },
    {
        "title": "Cerro San Luis (Madonna Mountain)",
        "description": (
            "A beloved SLO landmark featuring the iconic 'M' on its slope. The trail winds "
            "through oak woodland and chaparral with great views of downtown SLO. Multiple "
            "access points including the Felsman Loop and Johnson Ranch trails."
        ),
        "latitude": 35.2697,
        "longitude": -120.6742,
        "difficulty": "easy",
        "category": "hiking_trail",
        "is_official": True,
    },
    {
        "title": "Islay Hill Open Space",
        "description": (
            "A short but steep hike up one of the Nine Sisters morros in the Edna Valley. "
            "The summit offers sweeping views of the valley, vineyards, and the Pacific Ocean "
            "on clear days. Great for a quick morning hike."
        ),
        "latitude": 35.2283,
        "longitude": -120.6317,
        "difficulty": "moderate",
        "category": "hiking_trail",
        "is_official": True,
    },
    {
        "title": "Poly Canyon Design Village Trail",
        "description": (
            "A unique trail on Cal Poly's campus leading to an outdoor architecture lab "
            "featuring experimental student-built structures. Flat and easy walking through "
            "a scenic canyon with interesting architectural experiments along the way."
        ),
        "latitude": 35.3108,
        "longitude": -120.6603,
        "difficulty": "easy",
        "category": "hiking_trail",
        "is_official": True,
    },
    {
        "title": "Montana de Oro Bluff Trail",
        "description": (
            "One of the most scenic coastal trails on the Central Coast. The bluff trail "
            "hugs dramatic cliffs above the Pacific with crashing waves, tide pools, and "
            "sea caves. Stunning sunsets and whale watching in season."
        ),
        "latitude": 35.2683,
        "longitude": -120.8917,
        "difficulty": "easy",
        "category": "hiking_trail",
        "is_official": True,
    },
    {
        "title": "Valencia Peak - Montana de Oro",
        "description": (
            "The highest point in Montana de Oro State Park at 1,347 ft. The trail climbs "
            "through coastal scrub with incredible ocean views. On clear days you can see "
            "the Channel Islands. Moderately strenuous with some steep sections."
        ),
        "latitude": 35.2617,
        "longitude": -120.8800,
        "difficulty": "moderate",
        "category": "hiking_trail",
        "is_official": True,
    },
    {
        "title": "Spooner's Cove - Montana de Oro",
        "description": (
            "A beautiful sandy cove surrounded by dramatic cliffs in Montana de Oro State Park. "
            "Popular for tide pooling, picnicking, and watching waves crash into sea caves. "
            "The cove is accessible via a short walk from the parking area."
        ),
        "latitude": 35.2700,
        "longitude": -120.8933,
        "difficulty": "easy",
        "category": "swimming_hole",
        "is_official": True,
    },
    {
        "title": "Morro Rock",
        "description": (
            "An iconic 576-ft volcanic plug rising from the ocean at Morro Bay. The rock "
            "itself is a protected peregrine falcon nesting site and cannot be climbed, "
            "but the surrounding state beach and causeway offer great views and wildlife watching."
        ),
        "latitude": 35.3658,
        "longitude": -120.8697,
        "difficulty": "easy",
        "category": "viewpoint",
        "is_official": True,
    },
    {
        "title": "Morro Bay State Park Heron Rookery",
        "description": (
            "Home to one of the largest Great Blue Heron rookeries on the West Coast. "
            "The eucalyptus grove hosts hundreds of nesting herons from January through "
            "summer. A short walk from the museum with excellent bird watching year-round."
        ),
        "latitude": 35.3483,
        "longitude": -120.8467,
        "difficulty": "easy",
        "category": "wildlife",
        "is_official": True,
    },
    {
        "title": "Cerro Alto Trail",
        "description": (
            "A challenging hike in the Santa Lucia Range near Atascadero. The summit at "
            "2,624 ft offers views of the coast, Morro Bay, and the inland valleys. "
            "The trail passes through oak woodland and chaparral with a creek crossing."
        ),
        "latitude": 35.4583,
        "longitude": -120.7217,
        "difficulty": "hard",
        "category": "hiking_trail",
        "is_official": True,
    },
    {
        "title": "Pismo Beach Monarch Butterfly Grove",
        "description": (
            "One of the largest overwintering sites for monarch butterflies in the US. "
            "From October through February, thousands of monarchs cluster in the eucalyptus "
            "trees. Free docent-led tours available on weekends during peak season."
        ),
        "latitude": 35.1317,
        "longitude": -120.6433,
        "difficulty": "easy",
        "category": "wildlife",
        "is_official": True,
    },
    {
        "title": "Avila Beach Harford Pier",
        "description": (
            "A historic pier in the sheltered Avila Beach cove. Great for fishing, "
            "watching sea lions, and enjoying the calm waters. The beach itself is one "
            "of the warmest and most protected on the Central Coast."
        ),
        "latitude": 35.1800,
        "longitude": -120.7317,
        "difficulty": "easy",
        "category": "viewpoint",
        "is_official": True,
    },
    {
        "title": "Prefumo Canyon Road Viewpoint",
        "description": (
            "A scenic drive and pullout with sweeping views of the Irish Hills and "
            "Edna Valley wine country. Popular with cyclists and offers a quiet escape "
            "from the city just minutes from downtown SLO."
        ),
        "latitude": 35.2483,
        "longitude": -120.6883,
        "difficulty": "easy",
        "category": "viewpoint",
        "is_official": True,
    },
    {
        "title": "Lopez Lake Recreation Area",
        "description": (
            "A reservoir in the Santa Lucia foothills offering hiking, kayaking, "
            "swimming, and camping. The Duna Vista Trail provides great lake views. "
            "Popular for water sports and wildlife including bald eagles in winter."
        ),
        "latitude": 35.1983,
        "longitude": -120.5617,
        "difficulty": "easy",
        "category": "camping",
        "is_official": True,
    },
    {
        "title": "Chumash Trail - Santa Margarita Lake",
        "description": (
            "A scenic trail along the shores of Santa Margarita Lake in the foothills "
            "east of SLO. The lake is a reservoir with great fishing, kayaking, and "
            "wildlife watching. The trail offers views of the water and surrounding hills."
        ),
        "latitude": 35.3917,
        "longitude": -120.5983,
        "difficulty": "moderate",
        "category": "hiking_trail",
        "is_official": True,
    },
]


def seed():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(models.Landmark).filter(models.Landmark.is_official == True).count()
        if existing > 0:
            print(f"Already have {existing} official landmarks. Skipping seed.")
            return

        for data in OFFICIAL_LANDMARKS:
            lm = models.Landmark(**data)
            db.add(lm)

        db.commit()
        print(f"Seeded {len(OFFICIAL_LANDMARKS)} official landmarks.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
