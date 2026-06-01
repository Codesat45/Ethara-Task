from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from fastapi import HTTPException, status
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.customer import Customer
from app.schemas.order import OrderCreate
import math


def get_orders(db: Session, page: int = 1, page_size: int = 10):
    query = db.query(Order).options(
        joinedload(Order.customer),
        joinedload(Order.items).joinedload(OrderItem.product),
    )

    total = db.query(Order).count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    offset = (page - 1) * page_size
    items = query.order_by(Order.created_at.desc()).offset(offset).limit(page_size).all()

    # Enrich response with names
    result = []
    for order in items:
        order_dict = _serialize_order(order)
        result.append(order_dict)

    return {"items": result, "total": total, "page": page, "page_size": page_size, "total_pages": total_pages}


def get_order_by_id(db: Session, order_id: int):
    order = (
        db.query(Order)
        .options(
            joinedload(Order.customer),
            joinedload(Order.items).joinedload(OrderItem.product),
        )
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Order with id {order_id} not found")
    return _serialize_order(order)


def create_order(db: Session, order_data: OrderCreate):
    # Validate customer exists
    customer = db.query(Customer).filter(Customer.id == order_data.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with id {order_data.customer_id} not found",
        )

    # Validate stock for all items BEFORE making any changes (atomic check)
    product_map = {}
    for item in order_data.items:
        product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {item.product_id} not found",
            )
        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "success": False,
                    "message": f"Insufficient stock for product '{product.name}' (SKU: {product.sku}). "
                               f"Available: {product.stock_quantity}, Requested: {item.quantity}",
                },
            )
        product_map[item.product_id] = product

    # Create order
    order = Order(customer_id=order_data.customer_id, status="pending", total_amount=0)
    db.add(order)
    db.flush()  # Get order ID without committing

    total_amount = 0
    for item in order_data.items:
        product = product_map[item.product_id]
        item_price = product.price
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=item_price,
        )
        db.add(order_item)

        # Deduct stock
        product.stock_quantity -= item.quantity
        total_amount += float(item_price) * item.quantity

    order.total_amount = round(total_amount, 2)
    db.commit()
    db.refresh(order)

    return get_order_by_id(db, order.id)


def delete_order(db: Session, order_id: int) -> dict:
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Order with id {order_id} not found")

    # Restore stock for each item
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.stock_quantity += item.quantity

    db.delete(order)
    db.commit()
    return {"success": True, "message": f"Order #{order_id} deleted and stock restored"}


def get_dashboard_stats(db: Session):
    total_products = db.query(func.count(Product.id)).scalar()
    total_customers = db.query(func.count(Customer.id)).scalar()
    total_orders = db.query(func.count(Order.id)).scalar()
    total_inventory = db.query(func.coalesce(func.sum(Product.stock_quantity), 0)).scalar()

    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "total_inventory": int(total_inventory),
    }


def _serialize_order(order: Order) -> dict:
    """Convert order ORM object to dict with enriched data."""
    items = []
    for item in order.items:
        items.append({
            "id": item.id,
            "product_id": item.product_id,
            "quantity": item.quantity,
            "price": item.price,
            "product_name": item.product.name if item.product else None,
            "product_sku": item.product.sku if item.product else None,
        })

    return {
        "id": order.id,
        "customer_id": order.customer_id,
        "order_date": order.order_date,
        "total_amount": order.total_amount,
        "status": order.status,
        "created_at": order.created_at,
        "customer_name": order.customer.name if order.customer else None,
        "items": items,
    }
