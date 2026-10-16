"""
voyage_python/catalog.py
Travel catalog query functions and business logic.
"""

from typing import List, Dict, Any, Optional
from .db import get_db

def get_albania_catalog() -> List[Dict[str, Any]]:
    """Returns all verified Albania travel packages and places."""
    return get_db().get_listings(country="Albania")

def filter_by_category(category: str) -> List[Dict[str, Any]]:
    """Filter listings by category: PACKAGE, PLACE, HOTEL, FOOD."""
    clean_cat = category.strip().upper()
    return [l for l in get_albania_catalog() if l.get("category") == clean_cat]

def filter_by_price(max_price: float, min_price: float = 0.0) -> List[Dict[str, Any]]:
    """Filter listings by budget range in USD."""
    return [
        l for l in get_albania_catalog()
        if min_price <= float(l.get("price", 0)) <= max_price
    ]

def search_destinations(query_str: str) -> List[Dict[str, Any]]:
    """Search destinations by keyword in title, location, or tags."""
    q = query_str.lower()
    results = []
    for l in get_albania_catalog():
        title = l.get("title", "").lower()
        loc = l.get("location", "").lower()
        tags = [t.lower() for t in l.get("tags", [])]
        if q in title or q in loc or any(q in t for t in tags):
            results.append(l)
    return results
