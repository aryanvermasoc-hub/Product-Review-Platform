import Coupon from '../models/couponModel.js';

const validateCoupon = async (req, res) => {
  const { code, itemsPrice = 0 } = req.body;
  const coupon = await Coupon.findOne({ code: code?.toUpperCase(), active: true });
  const now = Date.now();

  if (!coupon || (coupon.startsAt && coupon.startsAt > now) || (coupon.expiresAt && coupon.expiresAt < now)) {
    return res.status(404).json({ message: 'Coupon not found or expired' });
  }

  if (coupon.minOrderValue > itemsPrice) {
    return res.status(400).json({ message: `Minimum order value is ${coupon.minOrderValue}` });
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return res.status(400).json({ message: 'Coupon usage limit reached' });
  }

  const rawDiscount = coupon.type === 'percentage' ? Math.round(itemsPrice * (coupon.value / 100)) : coupon.value;
  const discount = coupon.maxDiscount > 0 ? Math.min(rawDiscount, coupon.maxDiscount) : rawDiscount;

  res.json({ code: coupon.code, discount, description: coupon.description });
};

const listCoupons = async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  res.json(coupons);
};

const createCoupon = async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json(coupon);
};

const updateCoupon = async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
  res.json(coupon);
};

const deleteCoupon = async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
  await Coupon.deleteOne({ _id: coupon._id });
  res.json({ message: 'Coupon deleted' });
};

export { createCoupon, deleteCoupon, listCoupons, updateCoupon, validateCoupon };
