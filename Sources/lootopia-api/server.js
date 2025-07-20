import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import dotenv from "dotenv";

// Import routes
import { authRoutes } from "./routes/auth.js";
import { userRoutes } from "./routes/users.js";
import { treasureHuntRoutes } from "./routes/treasureHunts.js";
import { stepRoutes } from "./routes/steps.js";
import { digAttemptRoutes } from "./routes/digAttempts.js";
import { reviewRoutes } from "./routes/reviews.js";
import { rewardRoutes } from "./routes/rewards.js";
import { artefactRoutes } from "./routes/artefacts.js";
import { marketplaceRoutes } from "./routes/marketplace.js";

// Import database initialization
import { initializeDatabase } from "./database/init.js";

// Load environment variables
dotenv.config();

const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", prettyJSON());
app.use(
  "*",
  cors({
    origin: "*", // Permet toutes les origines pour le développement
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Health check endpoint
app.get("/", (c) => {
  return c.json({
    message: "Lootopia API Server",
    version: "1.0.0",
    status: "running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.route("/api/auth", authRoutes);
app.route("/api/users", userRoutes);
app.route("/api/treasure-hunts", treasureHuntRoutes);
app.route("/api/steps", stepRoutes);
app.route("/api/dig-attempts", digAttemptRoutes);
app.route("/api/reviews", reviewRoutes);
app.route("/api/rewards", rewardRoutes);
app.route("/api/artefacts", artefactRoutes);
app.route("/api/marketplace", marketplaceRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Not Found" }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error("Server error:", err);
  return c.json(
    {
      error: "Internal Server Error",
      message: err.message,
    },
    500
  );
});

// Initialize database and start server
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    console.log("✅ Database initialized successfully");

    // Start server
    console.log(`🚀 Server starting on port ${PORT}`);
    serve({
      fetch: app.fetch,
      port: PORT,
      hostname: "0.0.0.0", // Permet l'accès depuis d'autres appareils
    });

    console.log(`✅ Lootopia API Server running on http://localhost:${PORT}`);
    console.log(`💰 Crown economy system enabled`);
    console.log(`🏪 Marketplace system enabled`);
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
