// server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

// Import middlewares
import { notFound, errorHandler } from "./middlewares/error.middleware.js";

// Import routes
import authRoutes from "./routes/auth.routes.js";
import propertyRoutes from "./routes/property.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import buyerRoutes from "./routes/buyer.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

const app = express();

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// Allowed origins
const allowedOrigins = [
  (process.env.FRONTEND_URL || "").replace(/\/$/, ""),
  "http://localhost:5173"
];

// CORS middleware
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

// Handle preflight OPTIONS requests for all routes
app.options("*", cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  }
};
connectDB();

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/buyers", buyerRoutes);
app.use("/api/payment", paymentRoutes);

// Error handling middlewares
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
