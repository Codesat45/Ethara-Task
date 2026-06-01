"""
Alembic environment configuration.
Loads DATABASE_URL from .env using python-dotenv.
Imports all models via app/database/base.py so Alembic can detect schema changes.
"""
import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context
from dotenv import load_dotenv

# ── Path setup ────────────────────────────────────────────────────────────────
# Add the backend/ directory to sys.path so app.* imports work
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# ── Load .env ─────────────────────────────────────────────────────────────────
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

# ── Import Base + all models ──────────────────────────────────────────────────
# base.py imports every model, registering them with Base.metadata
from app.database.base import Base  # noqa: F401

# ── Alembic config object ─────────────────────────────────────────────────────
config = context.config

# Override sqlalchemy.url with the value from .env
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set — check backend/.env")

config.set_main_option("sqlalchemy.url", DATABASE_URL)

# Set up Python logging from alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


# ── Offline migrations (generates SQL without connecting) ─────────────────────
def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode — outputs SQL to stdout."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


# ── Online migrations (connects to DB and applies changes) ────────────────────
def run_migrations_online() -> None:
    """Run migrations in 'online' mode — connects to Neon and applies changes."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,  # NullPool is best for migration scripts
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,       # detect column type changes
            compare_server_default=True,  # detect server default changes
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
