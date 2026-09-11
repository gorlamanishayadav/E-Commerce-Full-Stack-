# 🛒 NovaStore — Full-Stack E-Commerce Platform

A complete, production-ready full-stack e-commerce marketplace powered by **Django REST Framework**, **MySQL**, **JWT Role-Based Access Control (RBAC)**, and **React**.

---

## 🏗️ Architecture & Integration

```
Ecommerce/ (Root Workspace)
├── backend/                  # Django REST Framework (Port 8000)
│   ├── core/                 # Django settings, PyMySQL, SimpleJWT, CORS
│   ├── accounts/             # RBAC User model, JWT Claims, Authentication
│   ├── products/             # Categories, Products, Images, Reviews
│   ├── orders/               # Shopping Cart, Order Fulfillment, Decrement Stock
│   └── seed_data.py          # Pre-seeded test accounts & products
│
├── frontend/                 # React Application (Port 3000)
│   ├── src/api/axiosClient.js# Axios JWT Bearer token & refresh interceptor
│   ├── src/context/          # AuthContext, CartContext, ToastContext
│   ├── src/components/       # ProtectedRoute, Navbar, ProductCard, Modal
│   └── src/pages/            # Shop, Details, Cart, Checkout, Orders, Dashboards
│
├── start_all.js              # Unified runner for both backend and frontend
├── package.json              # Root npm scripts
├── run_app.bat               # 1-Click Windows Batch Launcher
└── run_app.ps1               # 1-Click PowerShell Launcher
```

---

## 🚀 1-Click Quick Launch

You can run both the **Backend API (Port 8000)** and **Frontend React App (Port 3000)** simultaneously using any of the following methods:

### Method A: Single Command at Project Root
```powershell
cd c:\Users\hp\Desktop\Ecommerce
npm start
```

### Method B: Double-Click Batch File (Windows)
Double-click **`run_app.bat`** in the `Ecommerce` folder.

### Method C: Separate Terminals

#### Terminal 1 (Backend):
```powershell
cd c:\Users\hp\Desktop\Ecommerce\backend
.\.venv\Scripts\Activate.ps1
python manage.py runserver 8000
```

#### Terminal 2 (Frontend):
```powershell
cd c:\Users\hp\Desktop\Ecommerce\frontend
npm start
```

Open your browser at: **`http://localhost:3000/`**

---

## 🔑 Pre-Seeded Test Credentials

| Role | Username | Password | Email | Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| 👑 **Admin** | `admin` | `Admin@123456` | `admin@ecommerce.com` | User role management, seller verification, category creation, order status updates. |
| 🏬 **Seller** | `seller_alex` | `Seller@123456` | `alex.seller@ecommerce.com` | Create/edit/delete products, inventory stock tracking, customer order fulfillment. |
| 🛍️ **Customer** | `customer_jane` | `Customer@123456` | `jane.customer@ecommerce.com` | Browse products, cart management, checkout & orders, product reviews. |

*(💡 You can also use the **1-Click Quick Role Sign-in buttons** on the Login page to test each role instantly!)*
