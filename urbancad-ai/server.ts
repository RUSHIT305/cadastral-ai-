import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { processCadastralAudit } from "./api/_gemini.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      service: "CadastreAI GeoAI Engine",
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY)
    });
  });

  // GeoAI Cadastral Discrepancy & Anomaly Analysis
  app.post("/api/ai/cadastral-audit", async (req, res) => {
    try {
      const result = await processCadastralAudit(req.body);
      return res.json(result);
    } catch (err: any) {
      console.error("AI Audit Error:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Failed to process GeoAI cadastral audit"
      });
    }
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CadastreAI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
