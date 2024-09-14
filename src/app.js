
const express = require('express');
const path = require('path');
const cors = require("cors");
const bodyParser = require('body-parser');
const config = require('./../config');
const authMiddleware = require('./middlewares/auth');
const userRoutes = require('./routes/users');

const app = express();


// Middleware setup
// app.use(bodyParser.json());       // Parse JSON bodies
// app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
// app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' folder

// Use custom middleware
// app.use(authMiddleware);

// Register routes
// app.use('/api/users', userRoutes); // Mount user routes on '/api/users'

// Define a basic route (optional)
// app.get('/', (req, res) => {
//     res.send('Hello, world!');
// });


app.use(bodyParser.json());
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

app.post(`${config.app.baseName}/api/token`, (req, res) => {
  const { user, pwd } = req.body;
  console.log(user, pwd);
  if (user !== "admin" || pwd !== "Aa123456!") {
    res.status(401).end();
    return;
  }

  res.json({
    name: "Elad D Gozman",
    expiry: new Date(),
    token: " d",
    isAdmin: true,
    isSupplier: true,
  });
});
app.get(`${config.app.baseName}/404`, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.get(config.app.baseName, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.use(express.static(path.join(__dirname, "dist")));

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