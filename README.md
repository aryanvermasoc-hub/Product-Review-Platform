# Product Review Platform

A premium, full-stack e-commerce and product intelligence platform. Designed for performance, this application features seamless data synchronization, deep technical specification comparisons, and a rich, interactive catalog experience.

## 🌟 Key Features

*   **Smart Catalog & Search:** Advanced faceted filtering (by brand, category, and minimum rating), sorting, and search with a personalized trending/recent searches history.
*   **Spec Battle (Comparison):** A dedicated side-by-side product comparison engine with a VIP sorting algorithm that prioritizes key technical specifications (Processor, RAM, Storage, etc.).
*   **Cloud-Synced User Profiles:** A smart restore system that seamlessly merges anonymous local data (Carts, Saved Items, Recent Views) with cloud MongoDB state upon login.
*   **Community Reviews:** Real-time product ratings and user-generated review submissions.
*   **Integrated Admin Controls:** In-line CRUD controls allowing Super Admins to create, edit, and delete products directly from the live store interface.
*   **Responsive UI:** Fluid animations via Framer Motion with an adaptive layout optimized for all device sizes.

## 💻 Tech Stack

**Frontend Architecture:**
*   [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
*   [React Router v7](https://reactrouter.com/) (Data routing, nested layouts)
*   [Framer Motion](https://www.framer.com/motion/) (Component animations & layout transitions)
*   [Lucide React](https://lucide.dev/) (SVG Iconography)

**Backend Architecture:**
*   [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
*   [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/) (Object Data Modeling)
*   [JSON Web Tokens (JWT)](https://jwt.io/) & [Bcrypt.js](https://www.npmjs.com/package/bcryptjs) (Authentication & Security)
*   [CSV-Parser](https://www.npmjs.com/package/csv-parser) (Automated data seeding)

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   MongoDB (Local instance or MongoDB Atlas cluster)

### 1. Installation
Clone the repository and install dependencies for both the frontend and backend environments:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Variables
Create a `.env` file in the `/backend` directory with your configuration:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
```

### 3. Database Initialization
You can seed the database with the initial dataset and create your super admin account using the built-in scripts:
```bash
cd backend
# Seed the MongoDB database using the provided CSV dataset
node seeder.js
# Generate the primary Super Admin account
node createAdmin.js
```

### 4. Running the Application
Run both the frontend and backend development servers concurrently:

```bash
# Terminal 1: Run the backend API
cd backend
npm run dev

# Terminal 2: Run the Vite frontend
cd frontend
npm run dev
```

+## 📁 Project Structure + +```text +Product-Review-Platform/ +├── backend/ +│ ├── config/ # Database connection and environment configurations +│ ├── controllers/ # Route logic (auth, products, users) +│ ├── data/ # Sample datasets (CSV) for database seeding +│ ├── middleware/ # Custom express middlewares (auth, error handling) +│ ├── models/ # Mongoose database schemas +│ ├── routes/ # Express API route definitions +│ ├── createAdmin.js # Admin user seeding script +│ ├── seeder.js # Product database seeding script +│ └── server.js # Entry point for the backend API +└── frontend/

├── public/ # Static assets
├── src/
│ ├── components/ # Reusable UI components (Header, etc.)
│ ├── context/ # Global state management (Auth, Cart Context API)
│ ├── lib/ # Utility functions and API clients (Axios instance)
│ ├── screens/ # Page-level components (Home, Product, Compare)
│ ├── App.jsx # Root application component
│ └── main.jsx # React DOM rendering entry point
└── package.json # Frontend dependencies and scripts +```
+## 💡 Usage + +1. Browse & Filter: Use the search bar on the homepage or click the category pills to filter products. Use the dropdowns to refine by brand, rating, or price sorting. +2. Spec Battle (Comparison): Click the "Compare" button on up to 3 products from the same category. Navigate to the "Compare" page to view a detailed, side-by-side analysis of their technical specifications, prioritized by importance. +3. User Accounts: Sign up for an account to leave reviews and ratings on products. +4. Cloud Sync: Add items to your cart, save them for later, or search for products while logged out. Once you log in, your local data seamlessly merges with your cloud profile, persisting across all your devices. +5. Admin Controls: Log in using a Super Admin account (created via the createAdmin.js script) and use the "Admin Dashboard" shield icon. As an admin, you can seamlessly create, edit, and delete products directly from the store interface.