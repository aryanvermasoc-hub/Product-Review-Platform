import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
    cartItems: { type: Array, default: [] },
    savedItems: { type: Array, default: [] },
    recentSearches: { type: Array, default: [] },
    recentlyViewed: { type: Array, default: [] },
    recentCategory: { type: String, default: 'All' },
    recentBrand: { type: String, default: '' },
    recentMinRating: { type: Number, default: 0 },
    recentSort: { type: String, default: 'rating' },
  },
  { timestamps: true }
);

// Compare entered password with the hashed password in the database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Hash the password before saving it to the database
userSchema.pre('save', async function (next) {
  // If the password isn't modified, skip hashing (e.g., when updating an email)
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
export default User;