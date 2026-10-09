// Load .env configuration
try {
  if (process.loadEnvFile) {
    process.loadEnvFile();
  }
} catch {
  // .env file missing or already loaded
}

import express from "express";
import { startPriceTrackerWorker } from "./services/priceTrackerWorker.js";
import session from "express-session";
import cors from "cors";
import compression from "compression";
import { registerRoutes } from "./routes.js";

// Safety guards to prevent server crashes from unhandled asynchronous rejections
process.on("unhandledRejection", (reason: any) => {
  console.warn("⚠️ [Unhandled Rejection Caught]:", reason?.message || reason);
});
process.on("uncaughtException", (error: any) => {
  console.error("🔥 [Uncaught Exception Caught]:", error?.message || error);
});

const app = express();
const PORT = process.env.PORT || 3000;

// Trust reverse proxies (Cloudflare, tunnels, etc.)
app.set("trust proxy", 1);

// Performance & Optimization Middleware
app.use(compression({ level: 6 })); // Gzip compression
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Session
// Session configuration
let sessionStore: any = undefined;
if (process.env.USE_MONGO_SESSION === "true" && (process.env.MONGODB_URI || process.env.MONGO_URI)) {
  try {
    const MongoStore = (await import("connect-mongo")).default;
    sessionStore = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 30 * 24 * 60 * 60,
    });
    console.log("🍃 [Session] MongoStore faollashtirildi (sessiyalar MongoDB da saqlanadi)");
  } catch (err: any) {
    console.warn("ℹ️ [Session] MongoStore:", err?.message);
  }
}

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "sovga-ai-dev-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Ensure cookies work smoothly on http://localhost
      httpOnly: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  })
);

// Register API routes
registerRoutes(app);

// Global error handling middleware for API routes
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }
  console.error("🔥 [Global Server Error]:", err?.stack || err?.message || err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err?.message || "Serverda kutilmagan ichki xatolik yuz berdi",
  });
});

// In development, use Vite dev server
if (process.env.NODE_ENV !== "production") {
  const { setupVite } = await import("./vite.js");
  await setupVite(app);
} else {
  // In production, serve static files with aggressive caching (1 year)
  const path = await import("path");
  app.use(express.static(path.resolve(process.cwd(), "dist/public"), {
    maxAge: "1y",
    etag: true,
  }));
  app.get("*", (_req, res) => {
    res.sendFile(path.resolve(process.cwd(), "dist/public/index.html"));
  });
}

import os from "os";

app.listen(Number(PORT), "0.0.0.0", () => {
  startPriceTrackerWorker();
  const nets = os.networkInterfaces();
  const networkIps: string[] = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal) {
        networkIps.push(net.address);
      }
    }
  }

  console.log(`\n======================================================`);
  console.log(`🎁 Sovg'a AI Server is Running Globally (0.0.0.0:${PORT})`);
  console.log(`  ➜ Local:   http://localhost:${PORT}`);
  if (networkIps.length > 0) {
    networkIps.forEach((ip) => {
      console.log(`  ➜ Network: http://${ip}:${PORT}`);
    });
  } else {
    console.log(`  ➜ Network: http://0.0.0.0:${PORT}`);
  }
  console.log(`======================================================\n`);
});

