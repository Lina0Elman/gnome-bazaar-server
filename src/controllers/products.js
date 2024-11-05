const Product = require("../models/Product");
const mongoose = require("mongoose");
const NodeCache = require("node-cache");

// Create a cache with a TTL of 5 minutes (300 seconds)
const productCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// Controller function to get supplier products
const getProducts = async (req, res) => {
  try {
    const { productName, category, skip = 0, take = 10 } = req.query; // Build the filter object based on the provided query parameters

    // Create a unique cache key based on query parameters
    const cacheKey = `products_${productName || ""}_${
      category || ""
    }_${skip}_${take}`;

    // Check if data is already cached
    if (productCache.has(cacheKey)) {
      console.log("Returning cached data");
      const cachedProducts = productCache.get(cacheKey);
      return res.json(cachedProducts);
    }

    const filter = { quantity: { $gt: 0 } };
    if (productName) {
      filter.name = { $regex: new RegExp(productName, "i") }; // Case-insensitive search
    }
    if (category) {
      filter.category = category;
    }

    // Fetch filtered and paginated products from the database
    const products = await Product.find(filter)
      .skip(parseInt(skip)) // Skip entries for pagination
      .limit(parseInt(take)) // Limit the number of returned entries
      .exec();

    if (!products.length) {
      return res.status(200).json([]);
    }

    // Convert image buffers to base64
    const productsWithImages = products.map((product) => ({
      ...product._doc,
      price:
        product.price instanceof mongoose.Types.Decimal128
          ? parseFloat(product.price.toString())
          : product.price,
      img: product.img
        ? `data:image/webp;base64,${product.img.toString("base64")}`
        : null,
    }));

    // Store the result in the cache
    productCache.set(cacheKey, productsWithImages);

    // Send the products as a JSON response
    res.json(productsWithImages);
  } catch (err) {
    console.error("Error fetching supplier products:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const uploadSupplierProduct = async (req, res) => {
  const { name, description, price, category, quantity, img } = req.body;
  const userId = req.user.id;

  try {
    // Convert base64 to binary
    const imgBuffer = Buffer.from(img.split(",")[1], "base64");

    const productData = {
      name,
      description,
      price,
      category,
      quantity,
      img: imgBuffer,
    };

    const product = await Product.addProduct(productData, userId);

    // Invalidate the cache after adding a new product
    productCache.flushAll();

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error adding product: " + error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    // Fetch distinct categories from the products collection
    const categories = await Product.distinct("category");

    if (!categories.length) {
      return res.status(200).json([]);
    }

    // Send the categories as a JSON response
    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getProducts, uploadSupplierProduct, productCache, getCategories };
