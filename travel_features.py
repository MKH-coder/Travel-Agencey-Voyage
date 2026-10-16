#!/usr/bin/env python3
"""
Voyage Albania Travel Platform - Feature Python Module
Converted from JSON / TypeScript features.
"""

import json
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional

@dataclass
class TravelListing:
    id: str
    title: str
    category: str
    price: float
    rating: float
    review_count: int
    location: str
    country: str = "Albania"
    description: str = ""
    images: List[str] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)

ALBANIA_MASTER_CATALOG = [
    TravelListing(
        id="pkg-albania-9day-luxury-02",
        title="Albania 9-Day Luxury VIP Odyssey: 5-Star Stays & Private Yacht",
        category="PACKAGE",
        price=4630.0,
        rating=5.0,
        review_count=36,
        location="Tirana, Berat, Sarandë, Ksamil & Riviera",
        description="The ultimate VIP itinerary through Albania. 5-star seaside suites in Sarandë, luxury boutique palace in Berat, private chartered speedboats around Ksamil islands, dedicated high-comfort vehicle + driver.",
        images=[
            "https://upload.wikimedia.org/wikipedia/commons/5/51/Ksamil-ksamil_islands.jpg",
            "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/72/Kalaja_e_Porto_Palermos_nga_droni_3_-_Shqip%C3%ABri.jpg/1280px-Kalaja_e_Porto_Palermos_nga_droni_3_-_Shqip%C3%ABri.jpg"
        ],
        tags=["Luxury Tier", "Private Speedboat", "VIP Concierge", "5-Star Seaside Suites"]
    ),
    TravelListing(
        id="list-albania-ksamil-butrint-04",
        title="Ksamil Archipelago, Bora Bora Beach & Butrint Ancient Ruins",
        category="PLACE",
        price=120.0,
        rating=4.98,
        review_count=95,
        location="Ksamil & Butrint, Ionian Coast",
        description="The pearl of the Albanian Riviera. Crystal-clear turquoise waters of Ksamil 4 islands, white sand at Bora Bora Beach, paired with ancient Greco-Roman ruins of Butrint UNESCO park.",
        images=[
            "https://upload.wikimedia.org/wikipedia/commons/0/0e/Ksamill-1.jpg",
            "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9b/Amphitheatre_of_Butrint_2009.jpg/1280px-Amphitheatre_of_Butrint_2009.jpg"
        ],
        tags=["Ksamil Islands", "Bora Bora Beach", "Butrint UNESCO"]
    ),
    TravelListing(
        id="list-albania-berat-castle-05",
        title="Berat UNESCO Fortress & The City of a Thousand Windows",
        category="PLACE",
        price=95.0,
        rating=4.97,
        review_count=88,
        location="Berat, Central Albania",
        description="Explore Mangalem and Gorica quarters, walk up to the inhabited 13th-century Berat Castle, visit Onufri Iconographic Museum.",
        images=[
            "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ae/Berat_UNESCO_2016_Albania.jpg/1280px-Berat_UNESCO_2016_Albania.jpg"
        ],
        tags=["Berat Castle", "UNESCO World Heritage", "Onufri Museum"]
    )
]

def get_albania_catalog_json() -> str:
    """Returns master catalog listings in JSON string format generated from Python dataclasses."""
    return json.dumps([vars(item) for item in ALBANIA_MASTER_CATALOG], indent=2)

if __name__ == "__main__":
    print(f"Loaded {len(ALBANIA_MASTER_CATALOG)} Albania Master Catalog features in Python.")
    print(get_albania_catalog_json())
