"""
voyage_python/config.py
Platform configuration, environment keys, and metadata.
"""

from typing import Dict, Any

def get_firebase_config() -> Dict[str, Any]:
    try:
        from firebase_applet_config import FIREBASE_CONFIG
        return FIREBASE_CONFIG
    except ImportError:
        return {}

def get_app_metadata() -> Dict[str, Any]:
    try:
        from metadata_config import APP_METADATA
        return APP_METADATA
    except ImportError:
        return {}
