#!/usr/bin/env python3
"""
Voyage Globetrotter Game & Coupon Feature Python Module
"""

import json
from dataclasses import dataclass
from typing import Dict, List

@dataclass
class FlightDifficultyLevel:
    level_id: str
    name: str
    difficulty: str
    distance_target_m: int
    score_multiplier: float
    coupon_code: str
    discount_percent: int
    offer_name: str

ALBANIA_FLIGHT_DIFFICULTY_FEATURES: List[FlightDifficultyLevel] = [
    FlightDifficultyLevel(
        level_id="lvl_albania_riviera",
        name="Albanian Riviera & Ksamil Isles",
        difficulty="easy",
        distance_target_m=6000,
        score_multiplier=1.0,
        coupon_code="KSAMIL-CRUISE-12",
        discount_percent=12,
        offer_name="Ksamil Scenic Explorer Pass"
    ),
    FlightDifficultyLevel(
        level_id="lvl_albania_riviera",
        name="Albanian Riviera & Ksamil Isles",
        difficulty="hard",
        distance_target_m=9000,
        score_multiplier=1.8,
        coupon_code="KSAMIL-STORM-20",
        discount_percent=20,
        offer_name="Ksamil Balkan Storm Pass"
    ),
    FlightDifficultyLevel(
        level_id="lvl_albania_riviera",
        name="Albanian Riviera & Ksamil Isles",
        difficulty="extreme",
        distance_target_m=12000,
        score_multiplier=2.5,
        coupon_code="KSAMIL-APEX-30",
        discount_percent=30,
        offer_name="Ksamil Nightmare Apex VIP Pass"
    )
]

def get_game_features_json() -> str:
    return json.dumps([vars(lvl) for lvl in ALBANIA_FLIGHT_DIFFICULTY_FEATURES], indent=2)

if __name__ == "__main__":
    print("Python Game & Coupon Features Loaded successfully.")
    print(get_game_features_json())
