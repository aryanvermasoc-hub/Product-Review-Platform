# Product Review Platform

A modern, premium full-stack e-commerce and product review platform. It features a rich shopping catalog with instant search, smart filters, product comparisons, live cart estimates, and a comprehensive administrative dashboard for managing orders, products, and user reviews.

## 🚀 Tech Stack

### Frontend
- **Framework:** React.js powered by Vite
- **State Management:** React Context API (`useCart`, `useAuth`)
- **Routing:** React Router DOM
- **Styling & Animations:** Framer Motion (for smooth micro-interactions and scroll reveals), custom CSS
- **Icons:** Lucide React
- **HTTP Client:** Axios (with interceptors for JWT auth management)

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT) & HTTP-only cookies
- **Security & Performance:** `cors`, `helmet`, `express-rate-limit`

## ✨ Key Features

### User Experience (Frontend)
- **Premium Catalog:** Browse products with intelligent pagination.
- **Advanced Filtering:** Instantly filter by Category, Brand, Minimum Rating, and dynamic sorting (price, newest, top-rated).
- **Smart Search:** Live keyword searching with locally cached "Recent Searches" and trending suggestions.
- **Product Comparison:** Select up to 3 products to compare side-by-side.
- **Shopping Cart:** Add to cart functionality with stock validation.
- **Responsive Design:** Highly polished UI with glass-morphism panels, loading skeletons, and fluid animations.

### Robust API (Backend)
- **Order Processing:** Advanced order price calculations handling taxes, shipping logic (free shipping thresholds), and dynamic coupon validation.
- **Coupon Management:** Percentage-based or flat discount codes, featuring active windows, usage limits, and max-discount caps.
- **Product Management:** Full CRUD operations for products, variant management, specifications, and related product recommendations.
- **Review System:** Users can leave ratings and comments, instantly recalculating product aggregates.
- **Admin Dashboard:** Real-time analytics utilizing MongoDB aggregation pipelines (Revenue, Average Order Value, Customer count, Low stock alerts, Traffic conversions).
- **Role-Based Access Control:** Secure routes differentiated by `user`, `admin`, and `super-admin` roles.

## 📂 Project Structure

```text
Product-Review-Platform/
├── backend/
│   ├── config/          # Database connection and environment configs
│   ├── controllers/     # Route logic (Admin, Coupon, Order, Product, etc.)
│   ├── middleware/      # Auth (JWT) and error handling middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express route definitions
│   └── server.js        # Application entry point
└── frontend/
    ├── src/
    │   ├── context/     # Global state management
    │   ├── lib/         # API utilities and axios setup
    │   ├── screens/     # Page components (HomeScreen, etc.)
    │   └── App.jsx      # Root component
    ├── eslint.config.js # Linting configuration
    └── vite.config.js   # Vite build configuration
```

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance (Local or Atlas)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory and add your environment variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
4. Start the server:
   ```bash
   # Development mode
   npm run dev
   # Production mode
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📝 API Endpoints Overview

- **Products:** `/api/products` (GET, POST, PUT, DELETE)
- **Users:** `/api/users` (Auth, Profile sync)
- **Orders:** `/api/orders` (Create, Estimate, Manage)
- **Coupons:** `/api/coupons` (Validate, Create, Manage)
- **Admin:** `/api/admin` (Dashboard analytics, Moderation)
- **Reviews:** `/api/reviews` (Create and view product reviews)

## 🚀 Future Roadmap
* Implement `reviewRoutes.js` and `reviewController.js` to decouple review moderation.
* Add payment gateway integration (Stripe/PayPal) directly into the order flow.
* Enhance user profiles with order tracking and saved comparison lists.

---

*Developed for seamless e-commerce performance and rich user engagement.*