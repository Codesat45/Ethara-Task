from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from app.models.order import OrderStatus


class OrderItemCreate(BaseModel):
    product_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0)


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: Decimal
    product_name: Optional[str] = None
    product_sku: Optional[str] = None

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    customer_id: int = Field(..., gt=0)
    items: List[OrderItemCreate] = Field(..., min_items=1)

    @validator("items")
    def items_not_empty(cls, v):
        if not v:
            raise ValueError("Order must have at least one item")
        return v


class OrderResponse(BaseModel):
    id: int
    customer_id: int
    order_date: datetime
    total_amount: Decimal
    status: str
    created_at: datetime
    customer_name: Optional[str] = None
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True


class OrderListResponse(BaseModel):
    items: list[OrderResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class DashboardStats(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    total_inventory: int
