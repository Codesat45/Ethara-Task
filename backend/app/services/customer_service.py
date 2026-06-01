from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate
import math


def get_customers(
    db: Session,
    page: int = 1,
    page_size: int = 10,
    search: str = None,
):
    query = db.query(Customer)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Customer.name.ilike(search_term),
                Customer.email.ilike(search_term),
                Customer.phone.ilike(search_term),
            )
        )

    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    offset = (page - 1) * page_size
    items = query.order_by(Customer.created_at.desc()).offset(offset).limit(page_size).all()

    return {"items": items, "total": total, "page": page, "page_size": page_size, "total_pages": total_pages}


def get_customer_by_id(db: Session, customer_id: int) -> Customer:
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with id {customer_id} not found",
        )
    return customer


def create_customer(db: Session, customer_data: CustomerCreate) -> Customer:
    # Check email uniqueness
    existing = db.query(Customer).filter(Customer.email == customer_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Customer with email '{customer_data.email}' already exists",
        )

    customer = Customer(**customer_data.dict())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


def update_customer(db: Session, customer_id: int, customer_data: CustomerUpdate) -> Customer:
    customer = get_customer_by_id(db, customer_id)

    update_data = customer_data.dict(exclude_unset=True)

    # Check email uniqueness if email is being updated
    if "email" in update_data and update_data["email"] != customer.email:
        existing = db.query(Customer).filter(Customer.email == update_data["email"]).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Customer with email '{update_data['email']}' already exists",
            )

    for field, value in update_data.items():
        setattr(customer, field, value)

    db.commit()
    db.refresh(customer)
    return customer


def delete_customer(db: Session, customer_id: int) -> dict:
    customer = get_customer_by_id(db, customer_id)
    db.delete(customer)
    db.commit()
    return {"success": True, "message": f"Customer '{customer.name}' deleted successfully"}
