import express from 'express';
import {
  createProduct,
  deleteProduct,
  getProducts,
  getProductById,
  createProductReview,
  getProductRecommendations,
  getTopProducts,
  updateProduct,
} from '../controllers/productController.js';
import { admin, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/products
router.route('/').get(getProducts).post(protect, admin, createProduct);
router.route('/top').get(getTopProducts);

// GET /api/products/:id
router.route('/:id').get(getProductById);
router.route('/:id').put(protect, admin, updateProduct).delete(protect, admin, deleteProduct);
router.route('/:id/recommendations').get(getProductRecommendations);

// POST /api/products/:id/reviews (Protected Route!)
router.route('/:id/reviews').post(protect, createProductReview);

export default router;
