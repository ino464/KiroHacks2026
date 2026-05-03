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
        "trail_length_miles": 3.2,
        "elevation_gain_ft": 940,
        "avg_time_minutes": 120,
        "route_coords": [
            [35.2782, -120.6712], [35.2800, -120.6730], [35.2820, -120.6760],
            [35.2840, -120.6790], [35.2860, -120.6810], [35.2875, -120.6825],
            [35.2890, -120.6833], [35.2897, -120.6836],
        ],
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
        "trail_length_miles": 2.8,
        "elevation_gain_ft": 590,
        "avg_time_minutes": 90,
        "route_coords": [
            [35.2630, -120.6680], [35.2645, -120.6695], [35.2660, -120.6710],
            [35.2672, -120.6720], [35.2682, -120.6730], [35.2690, -120.6737],
            [35.2697, -120.6742],
        ],
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
        "trail_length_miles": 1.4,
        "elevation_gain_ft": 420,
        "avg_time_minutes": 60,
        "route_coords": [
            [35.2255, -120.6300], [35.2263, -120.6305], [35.2270, -120.6308],
            [35.2278, -120.6312], [35.2283, -120.6317],
        ],
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
        "trail_length_miles": 3.6,
        "elevation_gain_ft": 200,
        "avg_time_minutes": 75,
        "route_coords": [
            [35.3005, -120.6620], [35.3025, -120.6618], [35.3045, -120.6615],
            [35.3065, -120.6612], [35.3080, -120.6610], [35.3095, -120.6607],
            [35.3108, -120.6603],
        ],
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
        "trail_length_miles": 4.0,
        "elevation_gain_ft": 100,
        "avg_time_minutes": 90,
        "route_coords": [
            [35.2700, -120.8933], [35.2695, -120.8925], [35.2690, -120.8920],
            [35.2683, -120.8917], [35.2675, -120.8910], [35.2665, -120.8905],
            [35.2655, -120.8900], [35.2645, -120.8895], [35.2635, -120.8890],
        ],
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
        "trail_length_miles": 4.6,
        "elevation_gain_ft": 1100,
        "avg_time_minutes": 150,
        "route_coords": [
            [35.2700, -120.8933], [35.2690, -120.8920], [35.2680, -120.8900],
            [35.2665, -120.8875], [35.2650, -120.8850], [35.2635, -120.8830],
            [35.2620, -120.8810], [35.2617, -120.8800],
        ],
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
        "trail_length_miles": 0.5,
        "elevation_gain_ft": 20,
        "avg_time_minutes": 15,
        "route_coords": [
            [35.2705, -120.8925], [35.2703, -120.8928], [35.2700, -120.8933],
        ],
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
        "trail_length_miles": 1.0,
        "elevation_gain_ft": 10,
        "avg_time_minutes": 30,
        "route_coords": [
            [35.3620, -120.8650], [35.3630, -120.8660], [35.3640, -120.8670],
            [35.3648, -120.8680], [35.3655, -120.8690], [35.3658, -120.8697],
        ],
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
        "trail_length_miles": 0.8,
        "elevation_gain_ft": 30,
        "avg_time_minutes": 20,
        "route_coords": [
            [35.3470, -120.8455], [35.3475, -120.8460], [35.3480, -120.8464],
            [35.3483, -120.8467],
        ],
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
        "trail_length_miles": 5.8,
        "elevation_gain_ft": 1600,
        "avg_time_minutes": 210,
        "route_coords": [
            [35.4450, -120.7150], [35.4470, -120.7165], [35.4490, -120.7178],
            [35.4510, -120.7188], [35.4530, -120.7200], [35.4550, -120.7208],
            [35.4565, -120.7213], [35.4583, -120.7217],
        ],
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
        "trail_length_miles": 0.4,
        "elevation_gain_ft": 5,
        "avg_time_minutes": 20,
        "route_coords": [
            [35.1313, -120.6428], [35.1315, -120.6430], [35.1317, -120.6433],
        ],
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
        "trail_length_miles": 0.6,
        "elevation_gain_ft": 5,
        "avg_time_minutes": 20,
        "route_coords": [
            [35.1800, -120.7280], [35.1800, -120.7290], [35.1800, -120.7300],
            [35.1800, -120.7310], [35.1800, -120.7317],
        ],
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
        "trail_length_miles": 1.2,
        "elevation_gain_ft": 150,
        "avg_time_minutes": 30,
        "route_coords": [
            [35.2430, -120.6820], [35.2445, -120.6835], [35.2458, -120.6850],
            [35.2470, -120.6863], [35.2483, -120.6883],
        ],
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
        "trail_length_miles": 2.2,
        "elevation_gain_ft": 300,
        "avg_time_minutes": 60,
        "route_coords": [
            [35.1940, -120.5580], [35.1950, -120.5590], [35.1960, -120.5598],
            [35.1970, -120.5605], [35.1978, -120.5610], [35.1983, -120.5617],
        ],
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
        "trail_length_miles": 3.8,
        "elevation_gain_ft": 500,
        "avg_time_minutes": 120,
        "route_coords": [
            [35.3850, -120.5930], [35.3865, -120.5942], [35.3878, -120.5952],
            [35.3890, -120.5960], [35.3900, -120.5968], [35.3910, -120.5975],
            [35.3917, -120.5983],
        ],
    },
]


def seed():
    db = SessionLocal()
    try:
        existing = db.query(models.Landmark).filter(models.Landmark.is_official == True).count()
        if existing > 0:
            for data in OFFICIAL_LANDMARKS:
                lm = db.query(models.Landmark).filter(
                    models.Landmark.title == data["title"],
                    models.Landmark.is_official == True,
                ).first()
                if lm:
                    if lm.trail_length_miles is None:
                        lm.trail_length_miles = data.get("trail_length_miles")
                    if lm.elevation_gain_ft is None:
                        lm.elevation_gain_ft = data.get("elevation_gain_ft")
                    if lm.avg_time_minutes is None:
                        lm.avg_time_minutes = data.get("avg_time_minutes")
            db.commit()
            print(f"Already have {existing} official landmarks. Updated trail stats.")
            return

        # Strip route_coords before inserting since column was removed
        for data in OFFICIAL_LANDMARKS:
            clean = {k: v for k, v in data.items() if k != "route_coords"}
            lm = models.Landmark(**clean)
            db.add(lm)

        db.commit()
        print(f"Seeded {len(OFFICIAL_LANDMARKS)} official landmarks.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
