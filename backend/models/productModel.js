import mongoose from 'mongoose';

const embeddedReviewSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    image: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
    images: [{ type: String }],
    videos: [{ type: String }],
    variants: [
      {
        name: String,
        value: String,
        priceDelta: { type: Number, default: 0 },
        countInStock: { type: Number, default: 0 },
      },
    ],
    reviews: [embeddedReviewSchema],
    isPublished: { type: Boolean, default: true },
    
    specifications: {
      type: Map,
      of: String,
      default: {}
    }
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', brand: 'text', category: 'text', description: 'text' });
productSchema.index({ category: 1, rating: -1, price: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
