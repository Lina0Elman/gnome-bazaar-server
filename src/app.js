
const express = require('express');
const path = require('path');
const cors = require("cors");
const bodyParser = require('body-parser');
const config = require('./../config');
const userRoutes = require('./routes/users');
const productsRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const supplierRoutes = require('./routes/supplier');
const adminRoutes = require('./routes/admin');
const { authenticateToken } = require('./middlewares/auth');

const app = express();

// Increase the size limit for JSON and URL-encoded data
app.use(express.json({ limit: '5mb' })); // Set limit as per your need (e.g., 10MB)
app.use(express.urlencoded({ limit: '5mb', extended: true })); // For URL-encoded data

// Middleware setup
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());


// Exclude auth routes from authentication
app.use(`${config.app.baseName}/token`, authRoutes);

// Apply middleware to all routes except specifics
app.use((req, res, next) => {
  if (req.path === `${config.app.baseName}/user/register`) {
      return next(); // Skip middleware for this route
  }
  authenticateToken(req, res, next); // Apply middleware for all other routes
});

// with auth middleware
app.use(`${config.app.baseName}/user`, userRoutes);
app.use(`${config.app.baseName}/products`, productsRoutes);
app.use(`${config.app.baseName}/supplier`, supplierRoutes);
app.use(`${config.app.baseName}/admin`, adminRoutes);




// app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' folder


app.use(cors({ origin: "*" }));
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleString()}]`);
  console.log(`${req.method} ${req.url}\n`);
  next();
});

app.get(`/image-repo/:img`, async (req, res) => {
  const { img } = req.params;
  console.log(img);

  res.sendFile(path.join(__dirname, "public", 'assets', img));
});

app.get(`${config.app.baseName}/404`, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});



app.get(config.app.baseName, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});


// todo move client to dist under src :)
// app.use(express.static(path.join(__dirname, "dist")));



app.get(`${config.app.baseName}/*`, (req, res, next) => {
  const requestPath = req.path.replace(config.app.baseName, "");
  const filePath = path.join(__dirname, "dist", requestPath);

  if (req.path === config.app.baseName || !path.extname(requestPath)) {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  } else {
    res.sendFile(filePath, (err) => {
      if (err) {
        next();
      }
    });
  }
});


app.use((req, res) => {
  res.redirect(`${config.app.baseName}/404`);
});



// Error handling middleware (optional) -- move to middlewares
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});



module.exports = app;