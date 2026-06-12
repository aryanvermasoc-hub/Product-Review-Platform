import express from 'express';
import {
  createNotification,
  getDashboardAnalytics,
  listBanners,
  listCustomers,
  listNotifications,
  listReviews,
  moderateReview,
  saveBanner,
} from '../controllers/adminController.js';
import { admin, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, admin);
router.get('/analytics', getDashboardAnalytics);
router.get('/customers', listCustomers);
router.get('/reviews', listReviews);
router.put('/reviews/:reviewId', moderateReview);
router.get('/banners', listBanners);
router.post('/banners', saveBanner);
router.put('/banners/:id', saveBanner);
router.get('/notifications', listNotifications);
router.post('/notifications', createNotification);

export default router;
