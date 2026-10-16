#!/usr/bin/env python3
"""
firebase_blueprint.py
Converted from firebase-blueprint.json to a Python schema blueprint library.
"""

FIREBASE_BLUEPRINT = {
  "entities": {
    "User": {
      "title": "User",
      "description": "User profile with role-based access control and MFA metadata",
      "type": "object",
      "properties": {
        "uid": {"type": "string", "description": "Unique identifier of the user"},
        "email": {"type": "string", "format": "email", "description": "Primary email address"},
        "phoneNumber": {"type": "string", "description": "Primary verified phone number"},
        "role": {"type": "string", "enum": ["USER", "ADMIN", "TECH_ADMIN"], "description": "System privilege role"},
        "mfaEnabled": {"type": "boolean", "description": "Whether 2FA is required"},
        "recoveryEmail": {"type": "string", "format": "email", "description": "Backup recovery email for emergency bypass"},
        "createdAt": {"type": "string", "description": "Account registration timestamp"}
      },
      "required": ["uid", "email", "role", "createdAt"]
    },
    "Listing": {
      "title": "Listing",
      "description": "Curated travel place, hotel accommodation, or dining guide",
      "type": "object",
      "properties": {
        "id": {"type": "string", "description": "Unique listing ID"},
        "title": {"type": "string", "description": "Title of the travel destination or experience"},
        "category": {"type": "string", "enum": ["PLACE", "HOTEL", "FOOD"], "description": "Category of travel content"},
        "price": {"type": "number", "description": "Starting price in USD"},
        "description": {"type": "string", "description": "Detailed overview and highlights"},
        "images": {"type": "array", "description": "Image gallery URLs"},
        "status": {"type": "string", "enum": ["DRAFT", "PENDING_APPROVAL", "PUBLISHED", "REJECTED"], "description": "Verification lifecycle status"},
        "createdBy": {"type": "string", "description": "UID of the creating admin"},
        "approvedBy": {"type": "string", "description": "UID of approving Super Admin"},
        "timestamps": {"type": "object", "description": "Creation and modification timestamps"}
      },
      "required": ["id", "title", "category", "price", "description", "status", "createdBy"]
    }
  }
}

def get_blueprint() -> dict:
    return FIREBASE_BLUEPRINT
