"""
Database Connection Test Script
================================
Tests the connection to Neon PostgreSQL using the DATABASE_URL from .env

Run from the backend/ directory:
    python test_db_connection.py

Expected output on success:
    ✅ Database Connected Successfully
    📍 Connected to: ep-lucky-cell-aphxy32q-pooler.c-7.us-east-1.aws.neon.tech
    🗄️  Database: neondb
    🐘 PostgreSQL version: PostgreSQL 16.x ...
"""

import os
import sys

# ── Load .env ──────────────────────────────────────────────────────────────────
from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ ERROR: DATABASE_URL not found in .env file")
    print("   Make sure backend/.env contains:")
    print("   DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require")
    sys.exit(1)

# ── Attempt connection ─────────────────────────────────────────────────────────
try:
    from sqlalchemy import create_engine, text

    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        connect_args={"sslmode": "require"},
    )

    with engine.connect() as conn:
        # Test 1: Basic connectivity
        result = conn.execute(text("SELECT version()"))
        pg_version = result.fetchone()[0]

        # Test 2: Current database name
        db_name = conn.execute(text("SELECT current_database()")).fetchone()[0]

        # Test 3: Current user
        db_user = conn.execute(text("SELECT current_user")).fetchone()[0]

        # Test 4: Server host (from connection URL)
        from urllib.parse import urlparse
        parsed = urlparse(DATABASE_URL)
        host = parsed.hostname

    print()
    print("=" * 55)
    print("  ✅  Database Connected Successfully")
    print("=" * 55)
    print(f"  📍 Host     : {host}")
    print(f"  🗄️  Database : {db_name}")
    print(f"  👤 User     : {db_user}")
    print(f"  🐘 Version  : {pg_version.split(',')[0]}")
    print("=" * 55)
    print()

except ImportError as e:
    print(f"\n❌ Missing package: {e}")
    print("   Run: pip install sqlalchemy psycopg2-binary python-dotenv")
    sys.exit(1)

except Exception as e:
    print()
    print("=" * 55)
    print("  ❌  Database Connection FAILED")
    print("=" * 55)
    print(f"  Error Type : {type(e).__name__}")
    print(f"  Message    : {e}")
    print()
    print("  Troubleshooting:")
    print("  1. Check DATABASE_URL in backend/.env")
    print("  2. Ensure Neon project is active (not suspended)")
    print("  3. Verify IP is not blocked in Neon dashboard")
    print("  4. Confirm sslmode=require is in the URL")
    print("=" * 55)
    print()
    sys.exit(1)
