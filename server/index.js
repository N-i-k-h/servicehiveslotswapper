import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectToDatabase } from "./src/config/db.js";
import authRoutes from "./src/routes/auth.js";
import eventRoutes from "./src/routes/events.js";
import swapRoutes from "./src/routes/swaps.js";

dotenv.config();
const app = express();

// === Middleware ===
app.use(express.json());

// ✅ Allow both local dev and deployed frontend to access backend
app.use(
  cors({
    origin: [
      process.env.CLIENT_ORIGIN || "http://localhost:5173",
      "https://servicehiveslotswapper-frontend3.onrender.com", // your Render frontend
    ],
    credentials: true,
  })
);

// === Health Check ===
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "slotswapper",
    timestamp: new Date().toISOString(),
  });
});

// === API Routes ===
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api", swapRoutes);

// === Serve Frontend Build ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendPath = path.join(__dirname, "client", "dist");
app.use(express.static(frontendPath));

// ✅ Catch-all route for React Router (handles SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// === Start Server ===
const PORT = process.env.PORT || 5000;

connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(
        `🌍 CORS allowed for: ${process.env.CLIENT_ORIGIN || "http://localhost:5173"}`
      );
    });
  })
  .catch((err) => {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  });
