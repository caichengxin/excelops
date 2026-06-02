// Basic deployment health check for ExcelOps API.
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    ok: true,
    api: "excelops",
    functions: true,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
    model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
    apiVersion: process.env.GEMINI_API_VERSION || "v1beta",
    searchRateLimitPerMinute: Number(process.env.SEARCH_RATE_LIMIT_PER_MINUTE || 20)
  });
}
