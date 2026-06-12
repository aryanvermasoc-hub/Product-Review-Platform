import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import Coupon from '../models/couponModel.js';

const calculatePrices = async (items, couponCode) => {
  const productIds = items.map((item) => item.product);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((product) => [product._id.toString(), product]));

  const orderItems = items.map((item) => {
    const product = productMap.get(item.product);
    if (!product) {
      throw new Error('One or more products are unavailable');
    }
    if (product.countInStock < item.qty) {
      throw new Error(`${product.name} does not have enough stock`);
    }

    return {
      name: product.name,
      qty: Number(item.qty),
      image: product.image,
      price: product.price,
      product: product._id,
    };
  });

  const itemsPrice = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const taxPrice = Math.round(itemsPrice * 0.18);
  const shippingPrice = itemsPrice > 49999 ? 0 : 499;
  let discountPrice = 0;
  let coupon = null;

  if (couponCode) {
    coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
    const now = Date.now();
    const validWindow = coupon && (!coupon.startsAt || coupon.startsAt <= now) && (!coupon.expiresAt || coupon.expiresAt >= now);
    const validUsage = coupon && (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit);

    if (!coupon || !validWindow || !validUsage || itemsPrice < coupon.minOrderValue) {
      throw new Error('Coupon is invalid for this order');
    }

    discountPrice = coupon.type === 'percentage' ? Math.round(itemsPrice * (coupon.value / 100)) : coupon.value;
    if (coupon.maxDiscount > 0) {
      discountPrice = Math.min(discountPrice, coupon.maxDiscount);
    }
  }

  const totalPrice = Math.max(itemsPrice + taxPrice + shippingPrice - discountPrice, 0);

  return { orderItems, itemsPrice, taxPrice, shippingPrice, discountPrice, totalPrice, coupon };
};

const estimateOrder = async (req, res) => {
  try {
    const prices = await calculatePrices(req.body.items || [], req.body.couponCode);
    res.json({
      itemsPrice: prices.itemsPrice,
      taxPrice: prices.taxPrice,
      shippingPrice: prices.shippingPrice,
      discountPrice: prices.discountPrice,
      totalPrice: prices.totalPrice,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const { items = [], shippingAddress, paymentMethod = 'Cash on Delivery', couponCode, guestEmail } = req.body;
    const prices = await calculatePrices(items, couponCode);

    const order = await Order.create({
      user: req.user?._id,
      guestEmail,
      orderItems: prices.orderItems,
      shippingAddress,
      paymentMethod,
      couponCode: couponCode?.toUpperCase(),
      itemsPrice: prices.itemsPrice,
      taxPrice: prices.taxPrice,
      shippingPrice: prices.shippingPrice,
      discountPrice: prices.discountPrice,
      totalPrice: prices.totalPrice,
    });

    await Promise.all(
      prices.orderItems.map((item) =>
        Product.updateOne({ _id: item.product }, { $inc: { countInStock: -item.qty } })
      )
    );

    if (prices.coupon) {
      prices.coupon.usedCount += 1;
      await prices.coupon.save();
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
};

const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (req.user.isAdmin || ['admin', 'super-admin'].includes(req.user.role) || order.user?.toString() === req.user._id.toString()) {
    return res.json(order);
  }

  res.status(403).json({ message: 'Not authorized to view this order' });
};

const listOrders = async (req, res) => {
  const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 }).limit(100);
  res.json(orders);
};

const updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  order.status = req.body.status || order.status;
  order.isDelivered = order.status === 'delivered';
  if (order.isDelivered && !order.deliveredAt) order.deliveredAt = new Date();
  await order.save();

  res.json(order);
};

export { createOrder, estimateOrder, getMyOrders, getOrderById, listOrders, updateOrderStatus };
