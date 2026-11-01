import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { publicPlatformScript } from "./publicConfig";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.get("/manus-routes.json", (_req, res) => {
    const candidates = [
      join(process.cwd(), "public/manus-routes.json"),
      join(process.cwd(), "dist/public/manus-routes.json"),
    ];
    const routeFile = candidates.find(path => existsSync(path));
    if (!routeFile) return res.status(404).json({ routes: [] });
    res.type("application/json").send(readFileSync(routeFile, "utf8"));
  });
  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send("User-agent: *\nAllow: /\nSitemap: /sitemap.xml\n");
  });
  app.get("/sitemap.xml", (_req, res) => {
    const urls = ["/", "/features", "/how-it-works", "/pricing", "/about", "/contact", "/blog", "/help", "/industries/plumbers", "/industries/hvac", "/industries/roofers", "/industries/contractors", "/industries/salons", "/industries/real-estate", "/industries/auto-repair", "/industries/cleaning"];
    const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<url><loc>${url}</loc></url>`).join("")}</urlset>`;
    res.type("application/xml").send(xml);
  });
  app.get("/api/platform/config.js", (_req, res) => {
    res.set("Cache-Control", "no-store").type("application/javascript").send(publicPlatformScript());
  });
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = Number(process.env.PORT || "3000");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid PORT");
  server.on("error", error => { console.error("Server failed:", error.message); process.exit(1); });
  server.listen(port, "0.0.0.0", () => console.log(`Server listening on port ${port}`));
}

startServer().catch(error => { console.error(error); process.exit(1); });
