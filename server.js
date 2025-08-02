const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use("/api/", limiter);

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/admin", express.static(path.join(__dirname, "admin")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database setup
const dbPath = process.env.DB_PATH || "./database/jewelry.db";
const dbDir = path.dirname(dbPath);

// Create database directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database");
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  // Users table (for admin authentication)
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Products table
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    category TEXT,
    material TEXT DEFAULT 'Silver',
    weight DECIMAL(8,2),
    dimensions TEXT,
    image_url TEXT,
    gallery_images TEXT, -- JSON array of image URLs
    is_featured BOOLEAN DEFAULT 0,
    is_visible BOOLEAN DEFAULT 1,
    stock_quantity INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Contact form submissions
  db.run(`CREATE TABLE IF NOT EXISTS contact_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create default admin user
  createDefaultAdmin();
}

// Create default admin user
async function createDefaultAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@anuvataru.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  db.get(
    "SELECT * FROM users WHERE email = ?",
    [adminEmail],
    async (err, row) => {
      if (err) {
        console.error("Error checking admin user:", err);
        return;
      }

      if (!row) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        db.run(
          "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
          [adminEmail, hashedPassword, "admin"],
          (err) => {
            if (err) {
              console.error("Error creating admin user:", err);
            } else {
              console.log("Default admin user created:", adminEmail);
            }
          }
        );
      }
    }
  );
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "./uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files (jpeg, jpg, png, webp) are allowed"));
    }
  },
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Validation middleware
const validateProduct = [
  body("name").notEmpty().withMessage("Product name is required"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("category").notEmpty().withMessage("Category is required"),
];

const validateContact = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("message").notEmpty().withMessage("Message is required"),
];

// API Routes

// Authentication
app.post(
  "/api/admin/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    db.get(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, user) => {
        if (err) {
          return res.status(500).json({ message: "Database error" });
        }

        if (!user || !(await bcrypt.compare(password, user.password))) {
          return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
          message: "Login successful",
          token,
          user: { id: user.id, email: user.email, role: user.role },
        });
      }
    );
  }
);

// Public API - Get all visible products
app.get("/api/products", (req, res) => {
  const { category, featured } = req.query;
  let query = "SELECT * FROM products WHERE is_visible = 1";
  const params = [];

  if (category) {
    query += " AND category = ?";
    params.push(category);
  }

  if (featured === "true") {
    query += " AND is_featured = 1";
  }

  query += " ORDER BY created_at DESC";

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    // Parse gallery_images JSON for each product
    const products = rows.map((product) => ({
      ...product,
      gallery_images: product.gallery_images
        ? JSON.parse(product.gallery_images)
        : [],
    }));

    res.json(products);
  });
});

// Public API - Get single product
app.get("/api/products/:id", (req, res) => {
  const { id } = req.params;

  db.get(
    "SELECT * FROM products WHERE id = ? AND is_visible = 1",
    [id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }

      if (!row) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Parse gallery_images JSON
      const product = {
        ...row,
        gallery_images: row.gallery_images
          ? JSON.parse(row.gallery_images)
          : [],
      };

      res.json(product);
    }
  );
});

// Contact form submission
app.post("/api/contact", validateContact, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, phone, message } = req.body;

  db.run(
    "INSERT INTO contact_submissions (name, email, phone, message) VALUES (?, ?, ?, ?)",
    [name, email, phone || null, message],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }
      res.json({
        message: "Contact form submitted successfully",
        id: this.lastID,
      });
    }
  );
});

// Admin API Routes (Protected)

// Get all products (admin)
app.get("/api/admin/products", authenticateToken, (req, res) => {
  db.all("SELECT * FROM products ORDER BY created_at DESC", (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    const products = rows.map((product) => ({
      ...product,
      gallery_images: product.gallery_images
        ? JSON.parse(product.gallery_images)
        : [],
    }));

    res.json(products);
  });
});

// Create product
app.post(
  "/api/admin/products",
  authenticateToken,
  upload.single("image"),
  validateProduct,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      price,
      category,
      material,
      weight,
      dimensions,
      is_featured,
      stock_quantity,
    } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    db.run(
      `INSERT INTO products (name, description, price, category, material, weight, dimensions, image_url, is_featured, stock_quantity) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description,
        price,
        category,
        material || "Silver",
        weight,
        dimensions,
        image_url,
        is_featured ? 1 : 0,
        stock_quantity || 1,
      ],
      function (err) {
        if (err) {
          return res.status(500).json({ message: "Database error" });
        }
        res.json({ message: "Product created successfully", id: this.lastID });
      }
    );
  }
);

// Update product
app.put(
  "/api/admin/products/:id",
  authenticateToken,
  upload.single("image"),
  (req, res) => {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      category,
      material,
      weight,
      dimensions,
      is_featured,
      is_visible,
      stock_quantity,
    } = req.body;

    let query = `UPDATE products SET 
    name = COALESCE(?, name),
    description = COALESCE(?, description),
    price = COALESCE(?, price),
    category = COALESCE(?, category),
    material = COALESCE(?, material),
    weight = COALESCE(?, weight),
    dimensions = COALESCE(?, dimensions),
    is_featured = COALESCE(?, is_featured),
    is_visible = COALESCE(?, is_visible),
    stock_quantity = COALESCE(?, stock_quantity),
    updated_at = CURRENT_TIMESTAMP`;

    const params = [
      name,
      description,
      price,
      category,
      material,
      weight,
      dimensions,
      is_featured !== undefined ? (is_featured ? 1 : 0) : null,
      is_visible !== undefined ? (is_visible ? 1 : 0) : null,
      stock_quantity,
    ];

    if (req.file) {
      query += ", image_url = ?";
      params.push(`/uploads/${req.file.filename}`);
    }

    query += " WHERE id = ?";
    params.push(id);

    db.run(query, params, function (err) {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json({ message: "Product updated successfully" });
    });
  }
);

// Delete product
app.delete("/api/admin/products/:id", authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM products WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  });
});

// Toggle product visibility
app.patch(
  "/api/admin/products/:id/visibility",
  authenticateToken,
  (req, res) => {
    const { id } = req.params;
    const { is_visible } = req.body;

    db.run(
      "UPDATE products SET is_visible = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [is_visible ? 1 : 0, id],
      function (err) {
        if (err) {
          return res.status(500).json({ message: "Database error" });
        }

        if (this.changes === 0) {
          return res.status(404).json({ message: "Product not found" });
        }

        res.json({ message: "Product visibility updated successfully" });
      }
    );
  }
);

// Get contact submissions (admin)
app.get("/api/admin/contacts", authenticateToken, (req, res) => {
  db.all(
    "SELECT * FROM contact_submissions ORDER BY created_at DESC",
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }
      res.json(rows);
    }
  );
});

// Mark contact as read
app.patch("/api/admin/contacts/:id/read", authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run(
    "UPDATE contact_submissions SET is_read = 1 WHERE id = ?",
    [id],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }
      res.json({ message: "Contact marked as read" });
    }
  );
});

// Serve static HTML files
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin", "index.html"));
});

app.get("/catalog", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "catalog.html"));
});

app.get("/gallery", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "gallery.html"));
});

app.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "contact.html"));
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "File too large. Maximum size is 5MB." });
    }
  }

  console.error("Error:", error);
  res.status(500).json({ message: "Internal server error" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down server...");
  db.close((err) => {
    if (err) {
      console.error("Error closing database:", err.message);
    } else {
      console.log("Database connection closed.");
    }
    process.exit(0);
  });
});
