"""
Central Base configuration.
Import this file in alembic/env.py so all models are registered
with the metadata before migrations are generated.
"""
from app.database.session import Base  # noqa: F401 — shared Base

# Import every model here so SQLAlchemy registers them with Base.metadata
# Alembic reads Base.metadata to detect table changes
from app.models.user import User          # noqa: F401
from app.models.product import Product    # noqa: F401
from app.models.customer import Customer  # noqa: F401
from app.models.order import Order, OrderItem  # noqa: F401
