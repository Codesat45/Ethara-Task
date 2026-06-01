from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from fastapi import HTTPException, status
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate
import math


def get_products(
    db: Session,
    page: int = 1,
    page_size: int = 10,
    search: str = None,
):
    query = db.query(Product)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_term),
                Product.sku.ilike(search_term),
                Product.description.ilike(search_term),
            )
        )

    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    offset = (page - 1) * page_size
    items = query.order_by(Product.created_at.desc()).offset(offset).limit(page_size).all()

    return {"items": items, "total": total, "page": page, "page_size": page_size, "total_pages": total_pages}


def get_product_by_id(db: Session, product_id: int) -> Product:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product with id {product_id} not found")
    return product


def create_product(db: Session, product_data: ProductCreate) -> Product:
    # Check SKU uniqueness
    existing = db.query(Product).filter(Product.sku == product_data.sku).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with SKU '{product_data.sku}' already exists",
        )

    product = Product(**product_data.dict())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product(db: Session, product_id: int, product_data: ProductUpdate) -> Product:
    product = get_product_by_id(db, product_id)

    update_data = product_data.dict(exclude_unset=True)

    # Check SKU uniqueness if SKU is being updated
    if "sku" in update_data and update_data["sku"] != product.sku:
        existing = db.query(Product).filter(Product.sku == update_data["sku"]).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product with SKU '{update_data['sku']}' already exists",
            )

    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int) -> dict:
    product = get_product_by_id(db, product_id)
    db.delete(product)
    db.commit()
    return {"success": True, "message": f"Product '{product.name}' deleted successfully"}
