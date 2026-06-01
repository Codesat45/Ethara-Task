from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse, CustomerListResponse
from app.services import customer_service
from app.core.deps import get_current_user
from app.models.user import User
from typing import Optional

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.get("", response_model=CustomerListResponse)
def list_customers(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=500),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return customer_service.get_customers(db, page=page, page_size=page_size, search=search)


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return customer_service.get_customer_by_id(db, customer_id)


@router.post("", response_model=CustomerResponse, status_code=201)
def create_customer(customer: CustomerCreate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return customer_service.create_customer(db, customer)


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(customer_id: int, customer: CustomerUpdate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return customer_service.update_customer(db, customer_id, customer)


@router.delete("/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return customer_service.delete_customer(db, customer_id)
