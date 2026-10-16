#!/usr/bin/env python3
"""
verify_env.py
Validates that all environment keys in .env.example are present in .env
"""

import os
import sys

def parse_env_keys(file_path):
    if not os.path.isfile(file_path):
        return []
    keys = []
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                keys.append(line.split('=', 1)[0].strip())
    return keys

root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
example_path = os.path.join(root_dir, '.env.example')
env_path = os.path.join(root_dir, '.env')

print("🔍 Checking environment configuration...")

if not os.path.isfile(example_path):
    print("⚠️  No .env.example found. Skipping check.")
    sys.exit(0)

example_keys = parse_env_keys(example_path)

if not os.path.isfile(env_path):
    print("⚠️  Notice: Local .env file does not exist yet.")
    print("👉 Create a .env file from .env.example before running integrations:")
    print("   cp .env.example .env\n")
    sys.exit(0)

active_keys = set(parse_env_keys(env_path))
missing_keys = [k for k in example_keys if k not in active_keys]

if missing_keys:
    print(f"⚠️  Missing {len(missing_keys)} keys in .env:")
    for k in missing_keys:
        print(f"   - {k}")
    sys.exit(1)
else:
    print(f"✅ All {len(example_keys)} required environment keys found in .env.")
    sys.exit(0)
