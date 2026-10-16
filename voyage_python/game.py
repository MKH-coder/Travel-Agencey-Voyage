"""
voyage_python/game.py
Flight arcade levels, difficulty configuration, and coupon generation logic.
"""

from typing import Dict, List, Any

DIFFICULTY_CONFIGS: Dict[str, Dict[str, Any]] = {
    "easy": {
        "name": "Scenic Explorer",
        "speedMultiplier": 1.0,
        "fuelDrainMultiplier": 1.0,
        "scoreMultiplier": 1.0,
        "defaultDiscount": 12,
        "couponPrefix": "CRUISE"
    },
    "hard": {
        "name": "Balkan Storm",
        "speedMultiplier": 1.45,
        "fuelDrainMultiplier": 1.5,
        "scoreMultiplier": 1.8,
        "defaultDiscount": 20,
        "couponPrefix": "STORM"
    },
    "extreme": {
        "name": "Nightmare Grand Prix",
        "speedMultiplier": 1.95,
        "fuelDrainMultiplier": 2.1,
        "scoreMultiplier": 2.5,
        "defaultDiscount": 30,
        "couponPrefix": "APEX"
    }
}

def get_flight_levels() -> List[Dict[str, Any]]:
    """Returns official Albania flight game destinations."""
    return [
        {
            "id": "lvl_albania_riviera",
            "name": "Albanian Riviera & Ksamil Isles",
            "country": "Albania",
            "flag": "🇦🇱",
            "distanceTarget": 6000,
            "landmarkName": "Ksamil 4 Isles & Ancient Butrint"
        },
        {
            "id": "lvl_albania_alps",
            "name": "Albanian Alps & Rozafa Citadel",
            "country": "Albania",
            "flag": "🇦🇱",
            "distanceTarget": 8000,
            "landmarkName": "Rozafa Fortress & Valbona Peaks"
        },
        {
            "id": "lvl_albania_berat",
            "name": "Berat City of 1000 Windows",
            "country": "Albania",
            "flag": "🇦🇱",
            "distanceTarget": 9000,
            "landmarkName": "Kala Citadel & Ottoman Mansions"
        }
    ]

def generate_discount_coupon(stage_name: str, difficulty: str = "easy") -> Dict[str, Any]:
    """Generates valid discount coupons based on difficulty and stage."""
    diff_key = difficulty.lower()
    config = DIFFICULTY_CONFIGS.get(diff_key, DIFFICULTY_CONFIGS["easy"])
    clean_stage = stage_name.upper().replace(" ", "-")[:8]
    code = f"{clean_stage}-{config['couponPrefix']}-{config['defaultDiscount']}"
    return {
        "code": code,
        "discountPercent": config["defaultDiscount"],
        "discount": f"{config['defaultDiscount']}% OFF",
        "mode": config["name"],
        "description": f"{config['defaultDiscount']}% OFF verified booking voucher"
    }
