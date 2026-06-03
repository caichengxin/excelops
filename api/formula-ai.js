// ExcelOps Formula AI API
// Uses the same Gemini environment variables as /api/search:
// GEMINI_API_KEY (or GOOGLE_API_KEY), GEMINI_MODEL, GEMINI_API_VERSION.
// Never expose the Gemini key in front-end JavaScript.

const RATE_LIMIT_WINDOW_MS = Number(process.env.FORMULA_AI_RATE_LIMIT_WINDOW_MS || process.env.SEARCH_RATE_LIMIT_WINDOW_MS || 60000);
const RATE_LIMIT_MAX = Number(process.env.FORMULA_AI_RATE_LIMIT_PER_MINUTE || 10);
const RATE_LIMIT_BUCKETS = globalThis.__excelopsFormulaAiRateLimitBuckets || new Map();
globalThis.__excelopsFormulaAiRateLimitBuckets = RATE_LIMIT_BUCKETS;

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(res, status, data) {
  res.status(status).json(data);
}

function getBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return req.body;
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"] || req.headers["X-Forwarded-For"];
  if (forwarded && typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.headers["x-real-ip"] || req.socket?.remoteAddress || "unknown";
}

function checkRateLimit(req) {
  if (!RATE_LIMIT_MAX || RATE_LIMIT_MAX <= 0) {
    return { allowed: true, limit: RATE_LIMIT_MAX, remaining: 9999, resetMs: Date.now() + RATE_LIMIT_WINDOW_MS };
  }

  const now = Date.now();
  const key = String(getClientIp(req) || "unknown").slice(0, 80);
  let bucket = RATE_LIMIT_BUCKETS.get(key);

  if (!bucket || now >= bucket.resetMs) {
    bucket = { count: 0, resetMs: now + RATE_LIMIT_WINDOW_MS };
    RATE_LIMIT_BUCKETS.set(key, bucket);
  }

  bucket.count += 1;

  if (RATE_LIMIT_BUCKETS.size > 500) {
    for (const [bucketKey, value] of RATE_LIMIT_BUCKETS.entries()) {
      if (now >= value.resetMs) RATE_LIMIT_BUCKETS.delete(bucketKey);
    }
  }

  const remaining = Math.max(0, RATE_LIMIT_MAX - bucket.count);
  return {
    allowed: bucket.count <= RATE_LIMIT_MAX,
    limit: RATE_LIMIT_MAX,
    remaining,
    resetMs: bucket.resetMs,
    retryAfter: Math.max(1, Math.ceil((bucket.resetMs - now) / 1000))
  };
}

function setRateLimitHeaders(res, rate) {
  if (!rate) return;
  res.setHeader("X-RateLimit-Limit", String(rate.limit));
  res.setHeader("X-RateLimit-Remaining", String(rate.remaining));
  res.setHeader("X-RateLimit-Reset", String(Math.ceil(rate.resetMs / 1000)));
  if (!rate.allowed) res.setHeader("Retry-After", String(rate.retryAfter));
}

function cleanText(value, maxLength) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function extractJson(text) {
  const raw = String(text || "").trim();
  if (!raw) return null;

  try { return JSON.parse(raw); } catch {}

  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    try { return JSON.parse(fenced[1].trim()); } catch {}
  }

  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try { return JSON.parse(raw.slice(start, end + 1)); } catch {}
  }
  return null;
}

function buildPayload(task, context, baseFormula, useJsonMode) {
  const schemaInstruction = `Return ONLY valid JSON with this exact shape:
{
  "formula": "one copy-ready Excel formula beginning with =",
  "explanation": "1-2 simple sentences explaining what it does",
  "example": "a short example using realistic cell references",
  "notes": ["short note 1", "short note 2"]
}`;

  const prompt = `You are ExcelOps Formula AI. Create a practical Microsoft Excel formula for a business spreadsheet user.

User task: ${task}
Workbook/column context: ${context || "Not provided"}
Starting formula or local result: ${baseFormula || "Not provided"}

Rules:
- Prefer standard Microsoft Excel formulas.
- Use simple cell references like A2, B2, C2 unless the user provided specific columns.
- Return one best formula, not a long list.
- Keep the explanation short and beginner-friendly.
- Do not invent macros, scripts, or external tools.
- If the request is unsafe or impossible, return a helpful formula-adjacent explanation in the JSON fields.

${schemaInstruction}`;

  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 900
    }
  };

  if (useJsonMode) {
    payload.generationConfig.responseMimeType = "application/json";
  }

  return payload;
}

async function postToGemini(endpoint, apiKey, payload) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    const text = await response.text();
    let json = null;
    try { json = JSON.parse(text); } catch {}

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: json?.error?.message || text.slice(0, 300) || response.statusText
      };
    }

    const content = json?.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("\n") || "";
    return { ok: true, text: content, raw: json };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      message: err?.name === "AbortError" ? "Gemini request timed out" : (err?.message || "Gemini request failed")
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

function normalizeAiResult(parsed) {
  const formula = cleanText(parsed?.formula, 500);
  const explanation = cleanText(parsed?.explanation, 700);
  const example = cleanText(parsed?.example, 700);
  const notes = Array.isArray(parsed?.notes)
    ? parsed.notes.map(note => cleanText(note, 180)).filter(Boolean).slice(0, 4)
    : [];

  if (!formula && !explanation && !example) return null;

  return {
    formula: formula || "=IF(A2=\"\",\"Missing\",\"OK\")",
    explanation: explanation || "This formula checks your row and returns a simple result you can adapt to your workbook.",
    example: example || "Use the formula in row 2, then copy it down for the rest of your data.",
    notes
  };
}

async function callGemini({ task, context, baseFormula }) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return { ok: false, reason: "missing_api_key" };

  const model = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
  const configuredVersion = process.env.GEMINI_API_VERSION || "v1beta";
  const versions = [...new Set([configuredVersion, "v1beta", "v1"] )];
  const attempts = [];

  for (const apiVersion of versions) {
    const endpoint = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent`;
    for (const useJsonMode of [true, false]) {
      const result = await postToGemini(endpoint, apiKey, buildPayload(task, context, baseFormula, useJsonMode));
      const label = `${apiVersion}/${useJsonMode ? "json" : "plain"}`;

      if (!result.ok) {
        attempts.push({ label, status: result.status, message: result.message });
        if ([401, 403, 429].includes(result.status)) {
          return { ok: false, reason: "gemini_http_error", status: result.status, message: result.message, attempts };
        }
        continue;
      }

      const parsed = extractJson(result.text);
      const data = normalizeAiResult(parsed);
      if (data) return { ok: true, data, model, apiVersion, mode: useJsonMode ? "json" : "plain" };

      attempts.push({ label, status: 200, message: "Gemini responded, but JSON was not usable." });
    }
  }

  const last = attempts[attempts.length - 1] || {};
  return { ok: false, reason: "no_usable_formula", status: last.status, message: last.message, attempts };
}

function localFallback(task, context, baseFormula) {
  const t = `${task} ${context} ${baseFormula}`.toLowerCase();
  if (t.includes("duplicate") || t.includes("重复")) {
    return {
      formula: "=IF(COUNTIF(A:A,A2)>1,\"Duplicate\",\"Unique\")",
      explanation: "This checks whether the value in A2 appears more than once in column A.",
      example: "Use it to flag duplicate SKUs, emails, or order IDs, then copy the formula down.",
      notes: ["Change A:A and A2 to match your real column.", "This fallback did not use Gemini."]
    };
  }
  if (t.includes("lookup") || t.includes("sku") || t.includes("find") || t.includes("查找")) {
    return {
      formula: "=XLOOKUP(E2,A:A,B:B,\"Not found\")",
      explanation: "This searches for the value in E2 inside column A and returns the matching value from column B.",
      example: "Use it to find a product price, vendor, category, or status by SKU.",
      notes: ["Use VLOOKUP if your Excel version does not support XLOOKUP.", "This fallback did not use Gemini."]
    };
  }
  if (t.includes("sum") || t.includes("total") || t.includes("汇总")) {
    return {
      formula: "=SUMIFS(D:D,A:A,G2,B:B,H2)",
      explanation: "This totals values in column D only when the criteria in columns A and B match your selected values.",
      example: "Use it to total sales by region and product, or cost by vendor and month.",
      notes: ["Change D:D to the numeric column you want to add.", "This fallback did not use Gemini."]
    };
  }
  return {
    formula: baseFormula || "=IF(A2=\"\",\"Missing\",\"OK\")",
    explanation: "This is a safe starter formula. Add your exact column names or cell locations for a more customized result.",
    example: "Use it to flag missing values in A2, then copy the formula down.",
    notes: ["Gemini was unavailable, so ExcelOps returned a local fallback."]
  };
}

async function handleFormulaRequest(req, res, payload) {
  const task = cleanText(payload.task || payload.query, 600);
  const context = cleanText(payload.context, 600);
  const baseFormula = cleanText(payload.baseFormula, 400);
  const debug = Boolean(payload.debug);

  if (!task || task.length < 6) {
    return sendJson(res, 400, { ok: false, error: "Please describe the formula you need in at least a few words." });
  }

  const rate = checkRateLimit(req);
  setRateLimitHeaders(res, rate);

  if (!rate.allowed) {
    return sendJson(res, 200, {
      ok: true,
      source: "fallback",
      reason: "rate_limited",
      retryAfter: rate.retryAfter,
      result: localFallback(task, context, baseFormula)
    });
  }

  const ai = await callGemini({ task, context, baseFormula });
  if (ai.ok) {
    return sendJson(res, 200, {
      ok: true,
      source: "gemini",
      model: ai.model,
      apiVersion: ai.apiVersion,
      mode: ai.mode,
      result: ai.data
    });
  }

  return sendJson(res, 200, {
    ok: true,
    source: "fallback",
    reason: ai.reason,
    result: localFallback(task, context, baseFormula),
    ...(debug ? { debug: { status: ai.status, message: ai.message, attempts: ai.attempts } } : {})
  });
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    return sendJson(res, 200, {
      ok: true,
      endpoint: "/api/formula-ai",
      accepts: "POST JSON: { task, context, baseFormula }",
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
      model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
      apiVersion: process.env.GEMINI_API_VERSION || "v1beta"
    });
  }

  if (req.method !== "POST") {
    return sendJson(res, 405, { ok: false, error: "Method not allowed" });
  }

  return handleFormulaRequest(req, res, getBody(req));
}
