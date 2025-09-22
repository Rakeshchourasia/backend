import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.routes.js";
import propertyRoutes from "./routes/property.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import buyerRoutes from "./routes/buyer.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

import { notFound, errorHandler } from "./middlewares/error.middleware.js";

dotenv.config();

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// ✅ CORS setup
const allowedOrigins = [
  process.env.FRONTEND_URL?.replace(/\/$/, ""), // from .env
  "http://localhost:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    // --- THIS IS THE DEBUGGING LINE ---
    console.log(`Request from origin: ${origin}`); 

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/buyers", buyerRoutes);
app.use("/api/payment", paymentRoutes);

// Error middlewares
app.use(notFound);
app.use(errorHandler);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  // These options are deprecated but won't cause harm
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => {
  console.error("❌ MongoDB connection failed:", err);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
