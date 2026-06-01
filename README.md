# 📋 Inventory & Order Management System

A production-ready full-stack application for managing products, customers, and orders — built with **FastAPI**, **React**, **PostgreSQL**, and **Docker**.

---

## 🗂 Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── core/           # Config, settings
│   │   ├── database/       # SQLAlchemy session
│   │   ├── models/         # ORM models
│   │   ├── routes/         # API route handlers
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── main.py         # FastAPI app entry point
│   ├── alembic/            # Database migrations
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── render.yaml         # Render deployment config
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Dashboard, Products, Customers, Orders
│   │   ├── services/       # Axios API client
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── vercel.json         # Vercel deployment config
│   └── .env.example
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚀 Quick Start (Docker)

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-username/inventory-management.git
cd inventory-management

# 2. Copy and configure environment variables
cp .env.example .env
# Edit .env and set a strong SECRET_KEY

# 3. Build and start all services
docker-compose up --build

# 4. Access the application
#    Frontend:  http://localhost:3000
#    Backend:   http://localhost:8000
#    API Docs:  http://localhost:8000/docs
```

---

## 🛠 Local Development (Without Docker)

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your local PostgreSQL credentials

# Run database migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:8000/api/v1

# Start development server
npm run dev
```

---

## 📡 API Documentation

Interactive Swagger UI is available at `http://localhost:8000/docs`

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/products` | List products (pagination + search) |
| GET | `/api/v1/products/{id}` | Get product by ID |
| POST | `/api/v1/products` | Create product |
| PUT | `/api/v1/products/{id}` | Update product |
| DELETE | `/api/v1/products/{id}` | Delete product |

### Customers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/customers` | List customers (pagination + search) |
| GET | `/api/v1/customers/{id}` | Get customer by ID |
| POST | `/api/v1/customers` | Create customer |
| PUT | `/api/v1/customers/{id}` | Update customer |
| DELETE | `/api/v1/customers/{id}` | Delete customer |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/orders` | List orders with pagination |
| GET | `/api/v1/orders/{id}` | Get order details |
| POST | `/api/v1/orders` | Create order (validates stock) |
| DELETE | `/api/v1/orders/{id}` | Delete order (restores stock) |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/dashboard/stats` | Get total products, customers, orders, inventory |

### Example: Create Order

```json
POST /api/v1/orders
{
  "customer_id": 1,
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 3, "quantity": 1 }
  ]
}
```

**Insufficient stock response:**
```json
{
  "detail": {
    "success": false,
    "message": "Insufficient stock for product 'Widget A' (SKU: WGT-001). Available: 5, Requested: 7"
  }
}
```

---

## 🔐 Environment Variables

### Root `.env` (Docker Compose)

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | PostgreSQL username | `inventory_user` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `inventory_pass` |
| `POSTGRES_DB` | Database name | `inventory_db` |
| `SECRET_KEY` | JWT secret key | **Must change** |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:5173` |
| `VITE_API_URL` | Frontend API base URL | `http://localhost:8000/api/v1` |

### Backend `.env`

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Full PostgreSQL connection string |
| `SECRET_KEY` | Secret key for security |
| `DEBUG` | Enable debug mode (`true`/`false`) |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |

### Frontend `.env`

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |

---

## ☁️ Deployment

### Backend → Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo, set root directory to `backend/`
4. Set environment variables in Render dashboard:
   - `DATABASE_URL` → Your Neon PostgreSQL connection string
   - `SECRET_KEY` → A strong random secret
   - `ALLOWED_ORIGINS` → Your Vercel frontend URL
5. Render will auto-detect `render.yaml` for configuration

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo, set root directory to `frontend/`
3. Set environment variable:
   - `VITE_API_URL` → Your Render backend URL + `/api/v1`
4. Deploy — `vercel.json` handles SPA routing automatically

### Database → Neon PostgreSQL

1. Create account at [neon.tech](https://neon.tech)
2. Create a new project and database
3. Copy the connection string (format: `postgresql://user:pass@host/db?sslmode=require`)
4. Use this as `DATABASE_URL` in Render

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11, FastAPI, SQLAlchemy, Alembic, Pydantic |
| Frontend | React 18, Vite, Tailwind CSS, Axios, React Router, React Hook Form |
| Database | PostgreSQL 16 |
| Containerization | Docker, Docker Compose |
| Deployment | Render (backend), Vercel (frontend), Neon (database) |

---

## ✅ Business Rules

- **SKU** must be unique across all products
- **Email** must be unique across all customers
- Orders **validate stock** before creation — rejects if insufficient
- Stock is **automatically reduced** after a successful order
- Deleting an order **restores stock** quantities
- All order operations use **database transactions**

---

## 📸 Screenshots

> Add screenshots of your running application here.

- Dashboard overview
- Products list with search
- Create order form
- Order details modal

---

## 📄 License

MIT
