import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import Order from '../models/orderModel.js';
import Banner from '../models/bannerModel.js';
import Notification from '../models/notificationModel.js';

const getDashboardAnalytics = async (req, res) => {
  const [revenueAgg, orderCount, customerCount, productCount, lowStockCount, pendingOrders, topProducts] = await Promise.all([
    Order.aggregate([{ $group: { _id: null, revenue: { $sum: '$totalPrice' }, averageOrderValue: { $avg: '$totalPrice' } } }]),
    Order.countDocuments(),
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments(),
    Product.countDocuments({ countInStock: { $lte: 5 } }),
    Order.countDocuments({ status: { $in: ['pending', 'confirmed', 'processing'] } }),
    Product.find({}).sort({ rating: -1, numReviews: -1 }).limit(5),
  ]);

  const recentOrders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 }).limit(8);
  const revenue = revenueAgg[0]?.revenue || 0;
  const averageOrderValue = Math.round(revenueAgg[0]?.averageOrderValue || 0);

  res.json({
    revenue,
    averageOrderValue,
    orderCount,
    customerCount,
    productCount,
    lowStockCount,
    pendingOrders,
    traffic: {
      sessions: customerCount + orderCount * 3,
      conversionRate: customerCount ? Number(((orderCount / customerCount) * 100).toFixed(1)) : 0,
    },
    topProducts,
    recentOrders,
  });
};

const listCustomers = async (req, res) => {
  const customers = await User.find({}).select('-password').sort({ createdAt: -1 }).limit(200);
  res.json(customers);
};

const listReviews = async (req, res) => {
  const products = await Product.find({ 'reviews.0': { $exists: true } }).select('name image brand reviews');
  const reviews = products.flatMap((product) =>
    product.reviews.map((review) => ({
      ...review.toObject(),
      product: { _id: product._id, name: product.name, image: product.image, brand: product.brand },
    }))
  );
  res.json(reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
};

const moderateReview = async (req, res) => {
  const product = await Product.findOne({ 'reviews._id': req.params.reviewId });
  if (!product) return res.status(404).json({ message: 'Review not found' });

  const review = product.reviews.id(req.params.reviewId);
  review.status = req.body.status;
  await product.save();
  res.json(review);
};

const listBanners = async (req, res) => {
  const banners = await Banner.find({}).sort({ priority: -1, createdAt: -1 });
  res.json(banners);
};

const saveBanner = async (req, res) => {
  const banner = req.params.id
    ? await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    : await Banner.create(req.body);
  res.status(req.params.id ? 200 : 201).json(banner);
};

const listNotifications = async (req, res) => {
  const notifications = await Notification.find({}).sort({ createdAt: -1 }).limit(100);
  res.json(notifications);
};

const createNotification = async (req, res) => {
  const notification = await Notification.create(req.body);
  res.status(201).json(notification);
};

export {
  createNotification,
  getDashboardAnalytics,
  listBanners,
  listCustomers,
  listNotifications,
  listReviews,
  moderateReview,
  saveBanner,
};
