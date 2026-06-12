import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';

// 1. Load environment variables
dotenv.config();

// 2. Connect to MongoDB
connectDB();

// 3. Initialize Express
const app = express();

// 4. Global Middleware
app.use(cors()); 
app.use(express.json()); 
app.use(cookieParser());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 500 }));

// 5. Base Test Route
app.get('/', (req, res) => {
  res.send('Product Review API is running...');
});

// ==========================================
// 6. API ROUTES 
// ==========================================
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js'; 
import orderRoutes from './routes/orderRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/admin', adminRoutes);

// (Review routes are still commented out because we haven't built that controller yet)
// import reviewRoutes from './routes/reviewRoutes.js';
// app.use('/api/reviews', reviewRoutes);

// 7. Define Port and Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running in development mode on port ${PORT}`);
});
