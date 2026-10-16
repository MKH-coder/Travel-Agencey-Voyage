"""
voyage_python/models.py
Strongly typed dataclasses representing all domain entities in Voyage.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional

@dataclass
class Coordinates:
    lat: float
    lng: float

@dataclass
class Listing:
    id: str
    title: str
    category: str  # 'PACKAGE' | 'PLACE' | 'HOTEL' | 'FOOD'
    price: float
    rating: float
    reviewCount: int
    location: str
    country: str = "Albania"
    coordinates: Optional[Coordinates] = None
    description: str = ""
    images: List[str] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)
    amenities: List[str] = field(default_factory=list)
    duration: Optional[str] = None
    status: str = "PUBLISHED"
    createdBy: str = "voyage@gmail.com"
    createdByName: str = "Voyage Editorial"

@dataclass
class User:
    uid: str
    email: str
    name: str
    role: str = "USER"  # 'USER' | 'ADMIN' | 'TECH_ADMIN'
    phoneNumber: Optional[str] = None
    customTitle: Optional[str] = None
    department: Optional[str] = None
    mfaEnabled: bool = False
    recoveryEmail: Optional[str] = None
    avatar: Optional[str] = None
    createdAt: Optional[str] = None

@dataclass
class Review:
    id: str
    listingId: str
    userId: str
    userName: str
    userEmail: str
    rating: int
    comment: str
    createdAt: str
    userAvatar: Optional[str] = None

@dataclass
class AuditLog:
    id: str
    action: str
    performedBy: str
    performedByEmail: str
    targetId: str
    targetType: str
    ipAddress: str
    timestamp: str
    details: Dict[str, Any] = field(default_factory=dict)

@dataclass
class DifficultyReward:
    code: str
    discount: str
    discountPercent: int
    offerName: str
    description: str

@dataclass
class FlightLevel:
    id: str
    name: str
    destination: str
    country: str
    flag: str
    distanceTarget: int
    landmarkName: str
    difficultyRewards: Dict[str, DifficultyReward] = field(default_factory=dict)
