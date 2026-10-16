"""
Voyage Python Platform Library
A complete Python library ecosystem for Voyage Albania Travel Platform.
Provides data models, database management, catalog queries, and game/coupon utilities.
"""

from .models import Listing, User, Review, AuditLog, FlightLevel, DifficultyReward
from .db import VoyageDatabase, get_db
from .catalog import get_albania_catalog, filter_by_category, filter_by_price
from .game import get_flight_levels, generate_discount_coupon
from .config import get_firebase_config, get_app_metadata

__version__ = "2.0.0"
__all__ = [
    "Listing",
    "User",
    "Review",
    "AuditLog",
    "FlightLevel",
    "DifficultyReward",
    "VoyageDatabase",
    "get_db",
    "get_albania_catalog",
    "filter_by_category",
    "filter_by_price",
    "get_flight_levels",
    "generate_discount_coupon",
    "get_firebase_config",
    "get_app_metadata",
]
