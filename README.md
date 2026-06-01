# InvTrack — Inventory & Order Management System

> A production-ready, full-stack inventory management platform built with **FastAPI** and **React**. Manage products, customers, and orders in real time with JWT-secured endpoints and a sleek dark UI.

---

## 🔗 Live Links

| Resource | URL |
|---|---|
| **Frontend (Live App)** | [https://ethara-task-frontend-i2zx.onrender.com](https://ethara-task-frontend-i2zx.onrender.com) || **Backend API** | [https://ethara-task-3597.onrender.com](https://ethara-task-3597.onrender.com) |
| **API Docs (Swagger)** | [https://ethara-task-3597.onrender.com/docs](https://ethara-task-3597.onrender.com/docs) |
| **API Docs (ReDoc)** | [https://ethara-task-3597.onrender.com/redoc](https://ethara-task-3597.onrender.com/redoc) |

---

## 📸 Screenshots

> Dashboard · Products · Customers · Orders — all in a Netflix-inspired dark theme with animated stat cards, real-time data, and responsive layout.

---

## ✨ Features

- **JWT Authentication** — Register and login with bcrypt-hashed passwords and 256-bit JWT tokens
- **Product Management** — Full CRUD with image upload (base64), SKU uniqueness enforcement, stock tracking, and table/grid view toggle
- **Customer Management** — Searchable customer database with paginated table and color-coded avatars
- **Order Management** — Multi-item orders with automatic stock validation (rejects orders when stock is insufficient) and instant stock deduction on placement
- **Live Dashboard** — Animated stat cards showing total products, customers, orders, and inventory units
- **Real-Time Stock Restore** — Deleting an order automatically restores the deducted stock
- **Pagination & Search** — Server-side pagination and search across all resource lists
- **Responsive Design** — Mobile-first layout with collapsible sidebar drawer on small screens

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| Vite | 5 | Build tool & dev server |
| Tailwind CSS | 3 | Utility-first styling |
| React Router DOM | 6 | Client-side routing |
| Axios | 1.6 | HTTP client with JWT interceptors |
| React Hook Form | 7 | Form state management |
| Framer Motion | 11 | Animations |
| react-hot-toast | 2 | Toast notifications |
| lucide-react | 0.378 | Icon library |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| FastAPI | 0.111 | REST API framework |
| SQLAlchemy | 2.0 | ORM |
| Alembic | — | Database migrations |
| Pydantic v2 | — | Request/response validation |
| python-jose | — | JWT token creation & verification |
| bcrypt / passlib | — | Password hashing |
| Uvicorn | — | ASGI server |
| psycopg2 | — | PostgreSQL driver |

### Infrastructure
| Service | Purpose |
|---|---|
| Render | Backend & frontend hosting |
| Neon PostgreSQL | Serverless cloud database (AWS us-east-1) |
| Docker + Docker Compose | Containerized local & production deployment |
| Nginx | Frontend static file server + API reverse proxy |

---

## 📁 Project Structure

```
├── .env.example              # Root env template for Docker Compose
├── docker-compose.yml        # Orchestrates postgres + backend + frontend
│
├── backend/
│   ├── app/
│   │   ├── core/             # Config, security, JWT deps
│   │   ├── database/         # SQLAlchemy session & base
│   │   ├── models/           # User, Product, Customer, Order
│   │   ├── routes/           # auth, products, customers, orders, dashboard
│   │   ├── schemas/          # Pydantic request/response models
│   │   ├── services/         # Business logic layer
│   │   └── main.py           # FastAPI app entry point
│   ├── alembic/              # Database migrations
│   ├── Dockerfile            # Multi-stage Python build
│   ├── .dockerignore
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── components/       # Layout, Modal, Pagination, Logo, etc.
    │   ├── context/          # AuthContext (JWT state)
    │   ├── pages/            # Landing, Login, Register, Dashboard, Products, Customers, Orders
    │   ├── services/         # Axios API client
    │   └── index.css         # Tailwind + custom animations
    ├── Dockerfile            # Multi-stage Node build → Nginx
    ├── .dockerignore
    └── nginx.conf            # SPA routing + API proxy + gzip + security headers
```

---

## 🚀 Running Locally

### Option A — Docker Compose (recommended, zero setup)

Requires: [Docker Desktop](https://www.docker.com/products/docker-desktop/)

```bash
# 1. Clone and enter the project
git clone https://github.com/Codesat45/Ethara-Task.git
cd "Ethara-Task"

# 2. Create your environment file
cp .env.example .env
# Edit .env — at minimum set a strong SECRET_KEY

# 3. Build and start all services
docker compose up --build

# 4. Open the app
#    Frontend  → http://localhost:3000
#    API       → http://localhost:8000
#    Swagger   → http://localhost:8000/docs
```

**Useful commands:**
```bash
docker compose up -d              # run in background
docker compose logs -f backend    # stream backend logs
docker compose logs -f frontend   # stream frontend logs
docker compose down               # stop all containers
docker compose down -v            # stop + delete database volume
docker compose build --no-cache   # force full rebuild
```

---

### Option B — Manual (without Docker)

#### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (or use the Neon cloud DB)

#### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt

cp .env.example .env
# Edit .env — set DATABASE_URL and SECRET_KEY

alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

API → `http://localhost:8000` · Swagger → `http://localhost:8000/docs`

#### Frontend

```bash
cd frontend
npm install

cp .env.example .env
# Set VITE_API_URL=http://localhost:8000/api/v1

npm run dev
```

App → `http://localhost:5173`

---

## 🔌 API Reference

All protected endpoints require `Authorization: Bearer <token>` header.

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | No | Register new user |
| POST | `/api/v1/auth/login` | No | Login, returns JWT |
| GET | `/api/v1/auth/me` | Yes | Get current user |

### Products
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/products` | Yes | List (paginated, searchable) |
| GET | `/api/v1/products/{id}` | Yes | Get single product |
| POST | `/api/v1/products` | Yes | Create product |
| PUT | `/api/v1/products/{id}` | Yes | Update product |
| DELETE | `/api/v1/products/{id}` | Yes | Delete product |

### Customers
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/customers` | Yes | List (paginated, searchable) |
| GET | `/api/v1/customers/{id}` | Yes | Get single customer |
| POST | `/api/v1/customers` | Yes | Create customer |
| PUT | `/api/v1/customers/{id}` | Yes | Update customer |
| DELETE | `/api/v1/customers/{id}` | Yes | Delete customer |

### Orders
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/orders` | Yes | List (paginated) |
| GET | `/api/v1/orders/{id}` | Yes | Get order with items |
| POST | `/api/v1/orders` | Yes | Create order (validates stock) |
| DELETE | `/api/v1/orders/{id}` | Yes | Delete order (restores stock) |

### Dashboard
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/dashboard/stats` | Yes | Aggregate stats |

---

## 🗄 Database Schema

```
users          — id, name, email, hashed_password, is_active, created_at
products       — id, name, sku (unique), description, price, stock_quantity, image_url, created_at
customers      — id, name, email (unique), phone, address, created_at
orders         — id, customer_id, status, total_amount, order_date
order_items    — id, order_id, product_id, quantity, price
```

---

## 🔐 Environment Variables

### Backend (`.env`)
```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
SECRET_KEY=your-super-secret-key
DEBUG=False
ALLOWED_ORIGINS=https://your-frontend.onrender.com
```

### Frontend (`.env`)
```env
VITE_API_URL=https://your-backend.onrender.com/api/v1
```

---

## 📦 Deployment

Both services are deployed on **Render** using Docker containers.

- **Backend**: Dockerfile in `/backend` — runs `uvicorn app.main:app --host 0.0.0.0 --port 8000`
- **Frontend**: Dockerfile in `/frontend` — builds with Vite, served via Nginx
- **Database**: Neon serverless PostgreSQL with connection pooling

---

## 📄 License

MIT — free to use, modify, and distribute.
