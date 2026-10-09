import type { Express } from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

export async function setupVite(app: Express) {
  const vite = await createViteServer({
    root: path.resolve(process.cwd(), "client"),
    server: { 
      middlewareMode: true,
      allowedHosts: true,
    },
    appType: "spa",
  });

  app.use(vite.middlewares);

  // SPA fallback
  app.use("*", async (req, res, next) => {
    if (req.originalUrl.startsWith("/api")) return next();
    try {
      const template = await vite.transformIndexHtml(
        req.originalUrl,
        (await import("fs")).readFileSync(
          path.resolve(process.cwd(), "client/index.html"),
          "utf-8"
        )
      );
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      next(e);
    }
  });
}
