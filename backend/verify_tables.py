"""
Table Verification Script
==========================
Connects to Neon PostgreSQL and verifies that all required tables exist.

Run from the backend/ directory:
    python verify_tables.py

Expected output after migrations:
    ✅ All required tables exist in Neon PostgreSQL!

    📋 Tables found in database:
       ✅  alembic_version
       ✅  customers
       ✅  order_items
       ✅  orders
       ✅  products
       ✅  users
"""

import os
import sys
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ DATABASE_URL not found in .env")
    sys.exit(1)

# Required tables for this project
REQUIRED_TABLES = {"products", "customers", "orders", "order_items", "users"}

try:
    from sqlalchemy import create_engine, inspect, text

    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        connect_args={"sslmode": "require"},
    )

    with engine.connect() as conn:
        # Get all table names from the public schema
        result = conn.execute(text("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_type = 'BASE TABLE'
            ORDER BY table_name
        """))
        existing_tables = {row[0] for row in result.fetchall()}

    print()
    print("=" * 55)

    # Check required tables
    missing = REQUIRED_TABLES - existing_tables
    if missing:
        print("  ⚠️   Some required tables are MISSING")
        print("=" * 55)
        print(f"  Missing: {', '.join(sorted(missing))}")
        print()
        print("  Run migrations first:")
        print("    alembic upgrade head")
    else:
        print("  ✅  All required tables exist in Neon PostgreSQL!")
        print("=" * 55)

    # List all tables found
    if existing_tables:
        print()
        print(f"  📋 Tables found in database ({len(existing_tables)} total):")
        for table in sorted(existing_tables):
            marker = "✅" if table in REQUIRED_TABLES else "ℹ️ "
            print(f"     {marker}  {table}")
    else:
        print()
        print("  ⚠️  No tables found. Run: alembic upgrade head")

    # Per-table column details for required tables
    print()
    print("  📐 Column details for required tables:")
    print()

    inspector = inspect(engine)
    for table_name in sorted(REQUIRED_TABLES):
        if table_name in existing_tables:
            columns = inspector.get_columns(table_name)
            print(f"  🗂️  {table_name} ({len(columns)} columns)")
            for col in columns:
                nullable = "" if col["nullable"] else " NOT NULL"
                print(f"       • {col['name']:25s} {str(col['type'])}{nullable}")
            print()

    print("=" * 55)
    print()

    if missing:
        sys.exit(1)

except Exception as e:
    print()
    print("=" * 55)
    print("  ❌  Verification FAILED")
    print("=" * 55)
    print(f"  {type(e).__name__}: {e}")
    print("=" * 55)
    print()
    sys.exit(1)
