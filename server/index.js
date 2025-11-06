import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectToDatabase } from "./src/config/db.js";
import authRoutes from "./src/routes/auth.js";
import eventRoutes from "./src/routes/events.js";
import swapRoutes from "./src/routes/swaps.js";

dotenv.config();
const app = express();

app.use(express.json());

// Read CLIENT_ORIGIN from environment (set this in Render for production)
// Example value you will set on Render: https://your-frontend-name.onrender.com
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// Note: we allow no-origin requests (e.g., curl, server-to-server) by permitting `!origin`.
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, server-side)
      if (!origin) return callback(null, true);

      // allow local dev origin
      if (origin === "http://localhost:5173") return callback(null, true);

      // allow the configured client origin
      if (CLIENT_ORIGIN && origin === CLIENT_ORIGIN) return callback(null, true);

      // otherwise block
      console.warn(`Blocked CORS request from origin: ${origin}`);
      return callback(new Error("CORS policy: This origin is not allowed"), false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);

// simple health check
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "slotswapper",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api", swapRoutes);

const PORT = process.env.PORT || 5000;

connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
      console.log(`CLIENT_ORIGIN=${CLIENT_ORIGIN}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
