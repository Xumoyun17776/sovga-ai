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
import { warmLivePriceBoard } from "./services/livePriceBoard.js";
import { startLiveCatalog } from "./services/liveCatalog.js";
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
const HOST = process.env.HOST || "127.0.0.1";

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
    const mongoStore: any = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 30 * 24 * 60 * 60,
    });
    // If MongoDB is unreachable, every request touching the session used to fail
    // with a 500 (users appeared logged in, then everything broke). Fall back to
    // the in-memory store whenever a Mongo session call errors.
    const memory = new session.MemoryStore();
    let mongoHealthy = true;
    const call = (method: string, args: any[]) => {
      const cb = typeof args[args.length - 1] === "function" ? args.pop() : () => {};
      if (!mongoHealthy) return (memory as any)[method](...args, cb);
      try {
        mongoStore[method](...args, (err: any, result: any) => {
          if (err) {
            if (mongoHealthy) console.warn("⚠️ [Session] MongoDB session store unavailable, using memory store:", err?.message || err);
            mongoHealthy = false;
            setTimeout(() => { mongoHealthy = true; }, 60_000);
            return (memory as any)[method](...args, cb);
          }
          cb(null, result);
        });
      } catch (err: any) {
        mongoHealthy = false;
        (memory as any)[method](...args, cb);
      }
    };
    class ResilientStore extends session.Store {
      get(sid: string, cb: any) { call("get", [sid, cb]); }
      set(sid: string, sess: any, cb: any) { call("set", [sid, sess, cb]); }
      destroy(sid: string, cb: any) { call("destroy", [sid, cb]); }
      touch(sid: string, sess: any, cb: any) { call("touch", [sid, sess, cb]); }
    }
    sessionStore = new ResilientStore();
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
      secure: process.env.NODE_ENV === "production",
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
  // Keep the HTML shell fresh so browsers don't request chunks from an older build.
  // Vite fingerprints files under /assets, so those can be cached long-term.
  const path = await import("path");
  const publicDir = path.resolve(process.cwd(), "dist/public");
  app.use(express.static(publicDir, {
    etag: true,
    setHeaders(res, filePath) {
      const isBuildAsset = filePath.includes(`${path.sep}assets${path.sep}`);
      res.setHeader("Cache-Control", isBuildAsset
        ? "public, max-age=31536000, immutable"
        : "no-cache");
    },
  }));
  app.get("*", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(path.join(publicDir, "index.html"));
  });
}

app.listen(Number(PORT), HOST, () => {
  startPriceTrackerWorker();
  warmLivePriceBoard();
  startLiveCatalog();

  console.log(`\n======================================================`);
  console.log(`🎁 Sovg'a AI Server is listening on ${HOST}:${PORT}`);
  console.log(`  ➜ Local:   http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});

