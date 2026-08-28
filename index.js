require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

// Import Routes
const dashboardRoutes = require("./routes/dashboardRouter");
const productsRoutes = require("./routes/products");
const authRoutes = require("./routes/authRoutes");

// Import Middleware
const errorHandler = require("./middleware/errorHandler");

const app = express();

// ================= SECURITY & UTILITY MIDDLEWARE =================
// 1. Helmet helps secure Express apps by setting HTTP response headers
app.use(helmet());

// 2. CORS configuration (Allow requests from your future frontend origin)
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

// 3. Body parser to handle JSON payloads securely (limit payload size to prevent DOS)
app.use(express.json({ limit: "10kb" }));

// ================= API ROUTES =================
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/products", productsRoutes);
app.use("/api/v1/auth", authRoutes);

// Handle 404 Not Found for unhandled routes
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "Endpoint not found" });
});

// ================= GLOBAL ERROR HANDLER =================
// Must be declared last, after all routes and middleware
app.use(errorHandler);

// ================= SERVER INITIALIZATION =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running securely on port ${PORT}`);
});