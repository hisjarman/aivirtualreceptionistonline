import "dotenv/config";
import express from "express";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { trustLabSubmissions } from "../../drizzle/schema";
import { getDb } from "../db";
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
  // Public Trust Lab API for the GitHub Pages docs site.
  // Only the public website origins are allowed to read these endpoints.
  const trustLabOrigins = new Set([
    "https://aivirtualreceptionist.online",
    "https://www.aivirtualreceptionist.online",
  ]);
  app.use("/api/trust-lab", (req, res, next) => {
    const origin = req.headers.origin;
    if (origin && trustLabOrigins.has(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });
  app.get("/api/trust-lab/wall", async (_req, res) => {
    try {
      const db = await getDb();
      if (!db) return res.status(503).json({ error: "database_unavailable" });
      const posts = await db.select({
        id: trustLabSubmissions.id,
        kind: trustLabSubmissions.kind,
        title: trustLabSubmissions.title,
        body: trustLabSubmissions.body,
        displayName: trustLabSubmissions.displayName,
        industry: trustLabSubmissions.industry,
        createdAt: trustLabSubmissions.createdAt,
      }).from(trustLabSubmissions)
        .where(eq(trustLabSubmissions.status, "approved"))
        .orderBy(desc(trustLabSubmissions.createdAt))
        .limit(30);
      return res.json({ posts });
    } catch (error) {
      console.error("Trust Lab wall error:", error);
      return res.status(500).json({ error: "server_error" });
    }
  });
  app.post("/api/trust-lab/submit", async (req, res) => {
    const parsed = z.object({
      kind: z.enum(["challenge", "question", "stress_test"]),
      title: z.string().trim().max(180).optional(),
      body: z.string().trim().min(8).max(3000),
      displayName: z.string().trim().max(80).optional(),
      industry: z.string().trim().max(120).optional(),
      impactScore: z.number().int().min(0).max(100).optional(),
      website: z.string().max(200).optional(),
    }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "invalid_submission" });
    if (parsed.data.website) return res.json({ created: true, status: "pending" });
    try {
      const db = await getDb();
      if (!db) return res.status(503).json({ error: "database_unavailable" });
      await db.insert(trustLabSubmissions).values({
        kind: parsed.data.kind,
        title: parsed.data.title || null,
        body: parsed.data.body,
        displayName: parsed.data.displayName || "Anonymous",
        industry: parsed.data.industry || null,
        impactScore: parsed.data.impactScore ?? null,
        status: "pending",
      });
      return res.status(201).json({ created: true, status: "pending" });
    } catch (error) {
      console.error("Trust Lab submission error:", error);
      return res.status(500).json({ error: "server_error" });
    }
  });

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
