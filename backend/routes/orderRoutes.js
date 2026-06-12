import express from 'express';
import {
  createOrder,
  estimateOrder,
  getMyOrders,
  getOrderById,
  listOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { admin, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/estimate', estimateOrder);
router.post('/', createOrder);
router.get('/mine', protect, getMyOrders);
router.get('/', protect, admin, listOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, admin, updateOrderStatus);

export default router;
