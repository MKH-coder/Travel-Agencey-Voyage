#!/usr/bin/env python3
"""
metadata_config.py
Python Applet Metadata & Platform Capabilities Library.
Converted from metadata.json to Python configuration code.
"""

APP_METADATA = {
    "name": "Travel Platform",
    "description": "Full-stack travel platform with multi-theme engine, destination & hotel explorer, content submission workflow, and tiered admin portal with 2FA and audit logs.",
    "requestFramePermissions": [],
    "majorCapabilities": ["MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API"]
}

def get_app_metadata() -> dict:
    return APP_METADATA
