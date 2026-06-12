import Product from '../models/productModel.js';

// @desc    Fetch all products (with Search, Category, Rating Filter, and Pagination)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const pageSize = Number(req.query.pageSize) || 12;
    const page = Number(req.query.pageNumber) || 1;

    const filterQuery = { isPublished: { $ne: false } };

    // 1. Keyword Search (Relaxed)
    if (req.query.keyword && req.query.keyword.trim() !== '') {
      const keyword = req.query.keyword.trim();
      filterQuery.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { brand: { $regex: keyword, $options: 'i' } },
        { category: { $regex: keyword, $options: 'i' } },
      ];
    }

    // 2. Category Filter (Relaxed)
    if (req.query.category && req.query.category !== 'All' && req.query.category.trim() !== '') {
      filterQuery.category = { $regex: req.query.category.trim(), $options: 'i' };
    }

    // 3. NEW: Rating Filter (Finds products with rating greater than or equal to requested)
    if (req.query.rating && req.query.rating !== '0') {
      filterQuery.rating = { $gte: Number(req.query.rating) };
    }

    if (req.query.brand) {
      filterQuery.brand = { $regex: req.query.brand.trim(), $options: 'i' };
    }

    if (req.query.minPrice || req.query.maxPrice) {
      filterQuery.price = {};
      if (req.query.minPrice) filterQuery.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filterQuery.price.$lte = Number(req.query.maxPrice);
    }

    const sortMap = {
      priceAsc: { price: 1 },
      priceDesc: { price: -1 },
      rating: { rating: -1 },
      newest: { createdAt: -1 },
    };
    const sort = sortMap[req.query.sort] || { rating: -1, numReviews: -1 };

    const count = await Product.countDocuments(filterQuery);
    
    const products = await Product.find(filterQuery)
      .sort(sort)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    const categories = await Product.distinct('category');
    const brands = await Product.distinct('brand');

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      categories,
      brands,
    });
    
  } catch (error) {
    console.error('Error in getProducts:', error);
    res.status(500).json({ message: 'Server Error fetching products' });
  }
};

// @desc    Fetch a single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error in getProductById:', error);
    res.status(500).json({ message: 'Server Error fetching product details' });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const product = new Product({
      name: 'Sample name',
      price: 0,
      user: req.user._id,
      image: '/images/sample.jpg',
      brand: 'Sample brand',
      category: 'Sample category',
      countInStock: 0,
      numReviews: 0,
      description: 'Sample description',
      specifications: {}
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Error in createProduct:', error);
    res.status(500).json({ message: 'Server Error creating product' });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      image,
      brand,
      category,
      countInStock,
      specifications
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.price = price || product.price;
      product.description = description || product.description;
      product.image = image || product.image;
      product.brand = brand || product.brand;
      product.category = category || product.category;
      product.countInStock = countInStock || product.countInStock;
      product.images = req.body.images || product.images;
      product.videos = req.body.videos || product.videos;
      product.variants = req.body.variants || product.variants;
      
      // Update specifications map if provided
      if (specifications) {
        product.specifications = specifications;
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error in updateProduct:', error);
    res.status(500).json({ message: 'Server Error updating product' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.json({ message: 'Product removed successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    res.status(500).json({ message: 'Server Error deleting product' });
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      // Check if user already reviewed this product
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Product already reviewed' });
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;

      // Calculate average rating
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: 'Review added successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error in createProductReview:', error);
    res.status(500).json({ message: 'Server Error creating review' });
  }
};

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = async (req, res) => {
  try {
    // Get top 3 products sorted by rating in descending order
    const products = await Product.find({}).sort({ rating: -1 }).limit(3);
    res.json(products);
  } catch (error) {
    console.error('Error in getTopProducts:', error);
    res.status(500).json({ message: 'Server Error fetching top products' });
  }
};

const getProductRecommendations = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const related = await Product.find({
      _id: { $ne: product._id },
      isPublished: { $ne: false },
      $or: [{ category: product.category }, { brand: product.brand }],
    })
      .sort({ rating: -1, numReviews: -1 })
      .limit(8);

    res.json(related);
  } catch (error) {
    console.error('Error in getProductRecommendations:', error);
    res.status(500).json({ message: 'Server Error fetching recommendations' });
  }
};

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  getProductRecommendations,
};
