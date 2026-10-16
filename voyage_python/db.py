"""
voyage_python/db.py
Database accessor and manager for Voyage Albania Platform.
"""

from typing import List, Dict, Any, Optional
from .models import Listing, User, Review, AuditLog

class VoyageDatabase:
    def __init__(self, data: Optional[Dict[str, Any]] = None):
        self._data = data or {}
        self._listings = self._data.get("listings", [])
        self._users = self._data.get("users", [])
        self._reviews = self._data.get("reviews", [])
        self._audit_logs = self._data.get("auditLogs", [])

    def get_listings(self, country: Optional[str] = "Albania") -> List[Dict[str, Any]]:
        if country:
            return [l for l in self._listings if l.get("country") == country]
        return self._listings

    def get_listing_by_id(self, listing_id: str) -> Optional[Dict[str, Any]]:
        for l in self._listings:
            if l.get("id") == listing_id:
                return l
        return None

    def get_users(self) -> List[Dict[str, Any]]:
        return self._users

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        for u in self._users:
            if u.get("email") == email:
                return u
        return None

    def get_reviews_for_listing(self, listing_id: str) -> List[Dict[str, Any]]:
        return [r for r in self._reviews if r.get("listingId") == listing_id]

    def get_audit_logs(self) -> List[Dict[str, Any]]:
        return self._audit_logs

_instance = None

def get_db() -> VoyageDatabase:
    global _instance
    if _instance is None:
        try:
            from data.database import DATABASE
            _instance = VoyageDatabase(DATABASE)
        except ImportError:
            _instance = VoyageDatabase()
    return _instance
