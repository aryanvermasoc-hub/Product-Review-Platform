import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      required: true, 
      ref: 'User' // Links this review to a specific User
    },
    product: { 
      type: mongoose.Schema.Types.ObjectId, 
      required: true, 
      ref: 'Product' // Links this review to a specific Product
    },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model('Review', reviewSchema);
export default Review;