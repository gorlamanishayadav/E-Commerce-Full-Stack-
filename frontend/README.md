# 🛍️ NovaStore Frontend (React + React Router + JWT + Axios)

A modern, responsive e-commerce web application with **Role-Based Protected Routes**, **JWT Authentication**, and integrated dashboards for **Customers**, **Sellers**, and **Admins**.

---

## 🚀 Features

- 🔐 **JWT Token Interceptors**: Automated Bearer token attachment on outgoing requests and transparent refresh token rotation on `401 Unauthorized`.
- 🛡️ **Role-Based Protected Routes**:
  - `/cart`, `/checkout`, `/orders`, `/profile`: Authenticated Users (`CUSTOMER`, `SELLER`, `ADMIN`).
  - `/seller/dashboard`: Protected (`SELLER`, `ADMIN`).
  - `/admin/dashboard`: Protected (`ADMIN` only).
- ⚡ **1-Click Role Logins**: Instant demo access buttons for **Admin**, **Seller**, and **Buyer** on the login page.
- 🛒 **Shopping Cart & Checkout**: Real-time cart synchronization, stock validations, and multi-step order placement.
- 🌟 **Seller Hub**: Create, edit, and delete inventory listings, track units in stock, and manage sold customer orders.
- 👑 **Admin Portal**: User role governance, seller verification, category management, and order status updates (`PENDING`, `SHIPPED`, etc.).
- 🎨 **Modern Design**: Built with Plus Jakarta Sans typography, sleek dark mode aesthetics, glassmorphism, and responsive layout.

---

## 📦 Tech Stack

- **React 18**
- **Create React App / react-scripts**
- **React Router DOM** (Client-side routing & Protected Routes)
- **Axios** (HTTP client with JWT request/response interceptors)
- **Lucide React** (Modern iconography)
- **Vanilla CSS** (Design tokens & smooth micro-interactions)

---

## 🏃 Running the Frontend

```powershell
# Navigate to frontend folder
cd c:\Users\hp\Desktop\Ecommerce\frontend

# Start the React development server
npm start
```

The app will open automatically at: **`http://localhost:3000/`**.

---

## 🔑 Quick Test Credentials

| Role | Username | Password |
| :--- | :--- | :--- |
| **Admin** | `admin` | `Admin@123456` |
| **Seller** | `seller_alex` | `Seller@123456` |
| **Customer** | `customer_jane` | `Customer@123456` |
