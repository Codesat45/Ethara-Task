from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.order import OrderCreate, OrderResponse, OrderListResponse
from app.services import order_service
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("", response_model=OrderListResponse)
def list_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return order_service.get_orders(db, page=page, page_size=page_size)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return order_service.get_order_by_id(db, order_id)


@router.post("", response_model=OrderResponse, status_code=201)
def create_order(order: OrderCreate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return order_service.create_order(db, order)


@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return order_service.delete_order(db, order_id)
