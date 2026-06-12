import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import csv from 'csv-parser';
import connectDB from './config/db.js';
import User from './models/userModel.js';
import Product from './models/productModel.js';
import Review from './models/reviewModel.js';

dotenv.config();
connectDB();

const categoryLimits = {
  'smartphone': 48,
  'laptop': 48,
  'tablet': 48,
  'smartwatch': 48,
  'headphones': 48,
  'earbuds': 47,
  'television': 48,
  'camera': 48,
  'gaming console': 96,
  'refrigerator': 48,
  'washing machine': 48,
  'air conditioner': 48
};

const importData = async () => {
  try {
    await Review.deleteMany();
    await Product.deleteMany();

    const adminUser = await User.findOne({ email: 'aryan.admin@example.com' });
    if (!adminUser) {
      console.error('Admin user not found! Please check your database.');
      process.exit(1);
    }

    const productsToInsert = [];
    const categoryTracker = {};

    Object.keys(categoryLimits).forEach(cat => categoryTracker[cat] = 0);

    console.log('Reading amazon_india_products_cleaned.csv...');

    fs.createReadStream('./data/amazon_india_products_cleaned.csv')
      .pipe(csv())
      .on('data', (row) => {
        
        // ==========================================
        // THE SHIELD: Skip any rows missing a title!
        // ==========================================
        if (!row.product_title || row.product_title.trim() === '') {
          return; 
        }

        const rawCat = (row.category || '').toLowerCase().trim();

        if (categoryLimits[rawCat] !== undefined && categoryTracker[rawCat] < categoryLimits[rawCat]) {
          
          categoryTracker[rawCat]++;

          const formattedCategory = rawCat.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          const inferredBrand = row.product_title.split(' ')[0] || 'Generic';

          productsToInsert.push({
            user: adminUser._id,
            name: row.product_title.trim(), 
            image: row.product_photo || '/images/sample.jpg', 
            description: row.product_title.trim(), 
            brand: inferredBrand, 
            category: formattedCategory, 
            price: parseFloat(row.price_inr) || parseFloat(row.product_price) || 0,
            countInStock: Math.floor(Math.random() * 85) + 5,
            rating: parseFloat(row.product_star_rating) || 0,
            numReviews: parseInt(row.product_num_ratings) || 0,
            specifications: {} 
          });
        }
      })
      .on('end', async () => {
        console.log(`Successfully extracted ${productsToInsert.length} products with perfect data mapping!`);
        console.log('Writing records to MongoDB Atlas...');
        
        await Product.insertMany(productsToInsert);
        
        console.log('Data Import Completed Successfully!');
        process.exit();
      })
      .on('error', (error) => {
        console.error('Error parsing CSV:', error);
        process.exit(1);
      });

  } catch (error) {
    console.error(`System Error: ${error.message}`);
    process.exit(1);
  }
};

importData();