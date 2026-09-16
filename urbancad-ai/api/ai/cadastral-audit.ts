import type { IncomingMessage, ServerResponse } from "http";
import { processCadastralAudit } from "../_gemini.ts";

async function readJsonBody(req: IncomingMessage & { body?: any }): Promise<any> {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", chunk => {
      raw += chunk;
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on("error", reject);
  });
}

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Method not allowed. Use POST." }));
    return;
  }

  try {
    const body = await readJsonBody(req);
    const result = await processCadastralAudit(body);
    res.statusCode = 200;
    res.end(JSON.stringify(result));
  } catch (err: any) {
    console.error("Vercel Serverless Audit Error:", err);
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        success: false,
        error: err.message || "Failed to process GeoAI cadastral audit"
      })
    );
  }
}
