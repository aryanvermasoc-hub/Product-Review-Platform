import mongoose from 'mongoose';

const bannerSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: String,
    image: String,
    href: String,
    placement: { type: String, default: 'home-hero' },
    active: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;
