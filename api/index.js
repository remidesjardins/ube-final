const express = require("express");
const db = require("../database");
const path = require("path");
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const helmet = require('helmet');
const winston = require('winston');
const cacheHeaders = require('express-cache-headers');
const { body, validationResult } = require('express-validator');

const app = express();
const port = process.env.PORT || 3000;

// Configure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Initialize database connection
const database = db.getDatabase();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Compression middleware
app.use(compression({
  level: 6, // Optimal compression level
  threshold: 0, // Compress all responses
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

// Request size limit
app.use(express.json({ limit: '10kb' }));

// Cache headers middleware
app.use(cacheHeaders({
  '/api/recettes': {
    maxAge: 10
  },
  '/api/recommandations': {
    maxAge: 10
  },
  '/api/recette_by_id': {
    maxAge: 10
  }
}));

// Serve static files with cache control
app.use(express.static(path.join(__dirname, '../public'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// Input validation middleware
const validateInput = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation error', { errors: errors.array() });
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Routes with validation
app.use("/api/admin_login", [
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], validateInput, require("./admin_login"));

app.use("/api/register", [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('nom_user').notEmpty(),
  body('prenom_user').notEmpty()
], validateInput, require("./register"));

// Other routes
app.use("/api/delete_recette", require("./delete_recette"));
app.use("/api/delete_recommandation", require("./delete_recommandation"));
app.use("/api/login", require("./login"));
app.use("/api/recette_by_id", require("./recette_by_id"));
app.use("/api/recettes", require("./recettes"));
app.use("/api/recommandations", require("./recommandations"));
app.use("/api/recommandations_utilisateur", require("./recommandations_utilisateur"));
app.use("/api/update_recette", require("./update_recette"));

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Server error', { error: err.stack });
  res.status(500).json({ 
    error: "Internal Server Error",
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Function to start server with retry logic
function startServer(port) {
  const server = app.listen(port, () => {
    logger.info(`Server started on http://localhost:${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.warn(`Port ${port} is already in use. Trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      logger.error('Error starting server:', err);
      process.exit(1);
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received.');
    server.close(() => {
      logger.info('HTTP server closed.');
      db.closeDatabase();
    });
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT signal received.');
    server.close(() => {
      logger.info('HTTP server closed.');
      db.closeDatabase();
    });
  });
}

// Start the server
startServer(port);
