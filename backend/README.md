# 🛒 E-Commerce Backend (Django + MySQL + JWT + RBAC)

A RESTful backend for a multi-role e-commerce platform built with **Django**, **Django REST Framework (DRF)**, **SimpleJWT**, and **MySQL**.

---

## 🌟 Key Features

- 🔐 **JWT Authentication & Custom Claims**: Secure token generation with user profile data, roles, and verification status embedded in token payloads.
- 👥 **Role-Based Access Control (RBAC)**:
  - **Admin**: Full system governance, user role modification, seller verification, category management, order oversight.
  - **Seller**: Inventory management (add, edit, delete own products), image uploads, view customer orders for their items.
  - **Customer**: Product catalog browsing, filtering/searching, shopping cart management, checkout & order placement, product reviews.
  - **Public / Anonymous**: Product & category discovery with pagination, search, and filtering.
- 🗄️ **MySQL Database Integration**: Built using `pymysql` for cross-platform compatibility, `.env` configuration, and dynamic connection management with automated fallback.
- 📦 **Order Lifecycle & Inventory Protection**: Atomic order creation with automatic inventory decrement and out-of-stock validation.
- 🌐 **CORS Ready**: Configured for seamless integration with frontend frameworks (React, Next.js, Vue, Vite).

---

## 🏗️ Architecture & RBAC Permissions Matrix

| Endpoint / Feature | Anonymous | Customer | Seller | Admin |
| :--- | :---: | :---: | :---: | :---: |
| Register / Login (JWT) | ✅ | ✅ | ✅ | ✅ |
| View Profile / Update | ❌ | ✅ | ✅ | ✅ |
| Browse Categories & Products | ✅ | ✅ | ✅ | ✅ |
| Create / Edit Categories | ❌ | ❌ | ❌ | ✅ |
| Create Products | ❌ | ❌ | ✅ | ✅ |
| Edit / Delete Products | ❌ | ❌ | ✅ *(Own products)* | ✅ *(All)* |
| Post Product Review | ❌ | ✅ | ✅ | ✅ |
| Manage Shopping Cart | ❌ | ✅ | ✅ | ✅ |
| Place Order (Checkout) | ❌ | ✅ | ✅ | ✅ |
| View Sold Items / Orders | ❌ | ❌ | ✅ *(Own products)* | ✅ *(All)* |
| Update Order & Payment Status | ❌ | ❌ | ❌ | ✅ |
| Manage Users & Change Roles | ❌ | ❌ | ❌ | ✅ |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Python 3.10+** (Tested on Python 3.14)
- **MySQL Server** (Optional for production; development automatically connects or falls back to SQLite if MySQL is offline)

### 2. Setup Virtual Environment & Install Dependencies

```powershell
# Navigate to backend directory
cd c:\Users\hp\Desktop\Ecommerce\backend

# Create virtual environment (if not already created)
python -m venv .venv

# Activate virtual environment
# On Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# On Windows CMD:
.\.venv\Scripts\activate.bat
# On Linux/macOS:
source .venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

### 3. Configure Database (`.env`)

Edit or create the `.env` file in the `backend/` folder:

```env
SECRET_KEY=your-secure-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# MySQL Database Settings
DB_ENGINE=mysql
DB_NAME=ecommerce_db
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=127.0.0.1
DB_PORT=3306
DB_FALLBACK_TO_SQLITE=True

# JWT Token Lifetimes
ACCESS_TOKEN_LIFETIME_MINUTES=60
REFRESH_TOKEN_LIFETIME_DAYS=7
```

### 4. Run Migrations & Seed Sample Data

```powershell
# Run migrations
python manage.py makemigrations accounts products orders
python manage.py migrate

# Seed database with sample accounts, categories, and products
python seed_data.py
```

### 5. Start the Development Server

```powershell
python manage.py runserver
```

The API will be available at: **`http://127.0.0.1:8000/`**

---

## 🔑 Pre-Seeded Test Credentials

| Role | Username | Password | Email |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `Admin@123456` | `admin@ecommerce.com` |
| **Seller** | `seller_alex` | `Seller@123456` | `alex.seller@ecommerce.com` |
| **Customer** | `customer_jane` | `Customer@123456` | `jane.customer@ecommerce.com` |

---

## 📡 API Endpoint Reference

### 🔐 Authentication & Accounts (`/api/auth/` & `/api/accounts/`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/token/` | Login & receive JWT access + refresh tokens | No |
| `POST` | `/api/auth/token/refresh/` | Refresh expired access token | No |
| `POST` | `/api/accounts/register/` | Register new Customer or Seller | No |
| `GET` / `PATCH` | `/api/accounts/profile/` | Get or update authenticated user profile | Yes |
| `POST` | `/api/accounts/change-password/` | Change account password | Yes |
| `GET` | `/api/accounts/admin/users/` | List all registered users (filter by role) | Admin |
| `GET` / `PATCH` | `/api/accounts/admin/users/<id>/` | View or modify user role / status | Admin |

### 📦 Products & Categories (`/api/products/`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products/categories/` | List all product categories | No |
| `POST` | `/api/products/categories/` | Create a new category | Admin |
| `GET` | `/api/products/items/` | List products (with search & filters) | No |
| `GET` | `/api/products/items/<slug>/` | Get detailed product information | No |
| `POST` | `/api/products/items/` | Create a product | Seller / Admin |
| `PUT` / `PATCH` | `/api/products/items/<slug>/` | Update a product | Product Owner / Admin |
| `DELETE` | `/api/products/items/<slug>/` | Delete a product | Product Owner / Admin |
| `GET` | `/api/products/items/my_products/` | Get list of products created by seller | Seller |
| `POST` | `/api/products/items/<slug>/upload_image/` | Upload image to product | Product Owner / Admin |
| `GET` / `POST` | `/api/products/reviews/` | List or write a product review | Customer (for POST) |

#### Product Filtering & Search Query Parameters:
- `?category_slug=electronics`
- `?min_price=50&max_price=300`
- `?in_stock=true`
- `?search=wireless`
- `?ordering=-price` or `?ordering=created_at`

### 🛒 Cart & Orders (`/api/orders/`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/orders/cart/` | View current user's shopping cart | Customer / Auth |
| `POST` | `/api/orders/cart/` | Add item or increment quantity | Customer / Auth |
| `DELETE` | `/api/orders/cart/` | Clear shopping cart | Customer / Auth |
| `PATCH` | `/api/orders/cart/items/<id>/` | Update quantity of a specific cart item | Customer / Auth |
| `DELETE` | `/api/orders/cart/items/<id>/` | Remove item from cart | Customer / Auth |
| `GET` | `/api/orders/` | List customer's own orders (or all for Admin) | Customer / Admin |
| `POST` | `/api/orders/` | Checkout cart & create new order | Customer |
| `GET` | `/api/orders/<id>/` | View order details | Owner / Admin |
| `GET` | `/api/orders/seller_orders/` | View customer orders containing seller's items | Seller |
| `PATCH` | `/api/orders/<id>/update_status/` | Update order/payment status | Admin |

---

## 🧪 Verification & Testing

To run the automated end-to-end backend test suite:

```powershell
python verify_backend.py
```
