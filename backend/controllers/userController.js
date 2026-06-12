import User from '../models/userModel.js';
import Session from '../models/sessionModel.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Helper to generate a JWT token
const generateToken = (id, expiresIn = '30d') => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};

const publicUser = (user, token, session = null) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin,
  role: user.role,
  isEmailVerified: user.isEmailVerified,
  token,
  sessionId: session?._id,
  cartItems: user.cartItems || [],
  savedItems: user.savedItems || [],
  recentSearches: user.recentSearches || [],
  recentlyViewed: user.recentlyViewed || [],
  recentCategory: user.recentCategory || 'All',
  recentBrand: user.recentBrand || '',
  recentMinRating: user.recentMinRating || 0,
  recentSort: user.recentSort || 'rating',
});

const buildSession = async (req, user, rememberMe = false) => {
  const tokenId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + (rememberMe ? 60 : 30) * 24 * 60 * 60 * 1000);

  return Session.create({
    user: user._id,
    tokenId,
    userAgent: req.get('user-agent') || 'Unknown device',
    ipAddress: req.ip,
    rememberMe,
    expiresAt,
  });
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const verificationToken = crypto.randomBytes(24).toString('hex');
  const user = await User.create({
    name,
    email,
    password,
    emailVerificationToken: verificationToken,
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  if (user) {
    const session = await buildSession(req, user);
    res.status(201).json({
      ...publicUser(user, generateToken(user._id), session),
      verificationToken,
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Auth user & get token (Login)
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password, rememberMe = false } = req.body;

  const user = await User.findOne({ email });

  // Assuming your userModel has a matchPassword method using bcrypt
  if (user && (await user.matchPassword(password))) {
    user.lastLoginAt = new Date();
    await user.save();
    const session = await buildSession(req, user, rememberMe);
    res.json(publicUser(user, generateToken(user._id, rememberMe ? '60d' : '30d'), session));
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

const authAdmin = async (req, res) => {
  const { email, password, rememberMe = false } = req.body;
  const user = await User.findOne({ email });

  if (user && (user.isAdmin || ['admin', 'super-admin'].includes(user.role)) && (await user.matchPassword(password))) {
    user.lastLoginAt = new Date();
    await user.save();
    const session = await buildSession(req, user, rememberMe);
    return res.json(publicUser(user, generateToken(user._id, rememberMe ? '60d' : '30d'), session));
  }

  res.status(401).json({ message: 'Invalid admin credentials' });
};

const getProfile = async (req, res) => {
  res.json(req.user);
};

const verifyEmail = async (req, res) => {
  const user = await User.findOne({
    emailVerificationToken: req.params.token,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: 'Verification link is invalid or expired' });
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.json({ message: 'Email verified successfully' });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.json({ message: 'If an account exists, a reset token has been created' });
  }

  const resetToken = crypto.randomBytes(24).toString('hex');
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
  await user.save();

  res.json({ message: 'Password reset token created', resetToken });
};

const resetPassword = async (req, res) => {
  const { password } = req.body;
  const user = await User.findOne({
    passwordResetToken: req.params.token,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: 'Reset link is invalid or expired' });
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({ message: 'Password reset successfully' });
};

const requestOtp = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const otpCode = `${Math.floor(100000 + Math.random() * 900000)}`;
  user.otpCode = otpCode;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  res.json({ message: 'OTP created', otpCode });
};

const verifyOtp = async (req, res) => {
  const { email, otpCode } = req.body;
  const user = await User.findOne({ email, otpCode, otpExpires: { $gt: Date.now() } });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  user.otpCode = undefined;
  user.otpExpires = undefined;
  user.isEmailVerified = true;
  await user.save();

  res.json({ message: 'OTP verified successfully' });
};

const getSessions = async (req, res) => {
  const sessions = await Session.find({ user: req.user._id }).sort({ lastSeenAt: -1 });
  res.json(sessions);
};

const revokeSession = async (req, res) => {
  const session = await Session.findOne({ _id: req.params.id, user: req.user._id });

  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }

  session.revokedAt = new Date();
  await session.save();
  res.json({ message: 'Session revoked' });
};

const socialLogin = async (req, res) => {
  const configuredProviders = ['google', 'github'].filter(
    (provider) => process.env[`${provider.toUpperCase()}_CLIENT_ID`] && process.env[`${provider.toUpperCase()}_CLIENT_SECRET`]
  );

  if (!configuredProviders.includes(req.params.provider)) {
    return res.status(503).json({ message: `${req.params.provider} login is not configured on this deployment` });
  }

  res.status(501).json({ message: 'OAuth callback exchange must be completed with provider credentials' });
};

// @desc    Sync user data (cart, saved, history)
// @route   PUT /api/users/sync
// @access  Private
const syncUserData = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    if (req.body.cartItems !== undefined) user.cartItems = req.body.cartItems;
    if (req.body.savedItems !== undefined) user.savedItems = req.body.savedItems;
    if (req.body.recentSearches !== undefined) user.recentSearches = req.body.recentSearches;
    if (req.body.recentlyViewed !== undefined) user.recentlyViewed = req.body.recentlyViewed;
    if (req.body.recentCategory !== undefined) user.recentCategory = req.body.recentCategory;
    if (req.body.recentBrand !== undefined) user.recentBrand = req.body.recentBrand;
    if (req.body.recentMinRating !== undefined) user.recentMinRating = req.body.recentMinRating;
    if (req.body.recentSort !== undefined) user.recentSort = req.body.recentSort;
    await user.save();
    res.json({ message: 'Data synced successfully' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

export {
  registerUser,
  authUser,
  authAdmin,
  getProfile,
  verifyEmail,
  forgotPassword,
  resetPassword,
  requestOtp,
  verifyOtp,
  getSessions,
  revokeSession,
  socialLogin,
  syncUserData,
};
