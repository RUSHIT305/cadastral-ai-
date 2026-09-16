import type { IncomingMessage, ServerResponse } from "http";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;
  res.end(
    JSON.stringify({
      status: "ok",
      service: "CadastreAI GeoAI Engine (Serverless / Vercel Ready)",
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString()
    })
  );
}
