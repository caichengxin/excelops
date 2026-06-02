# ExcelOps

Static ExcelOps website with Vercel Functions for the Excel Shortcut Finder AI search.

## Deploy

1. Upload this repository to GitHub.
2. Import the GitHub repository into Vercel.
3. In Vercel, go to **Project Settings → Environment Variables** and add:
   - `GEMINI_API_KEY` = your Google AI Studio Gemini API key
   - `GOOGLE_API_KEY` is also accepted as a fallback name, but `GEMINI_API_KEY` is preferred
   - Optional: `GEMINI_MODEL` = `gemini-3.1-flash-lite`
   - Optional: `GEMINI_API_VERSION` = `v1beta`
   - Optional: `SEARCH_RATE_LIMIT_PER_MINUTE` = `20` to protect Gemini quota
   - Optional: `SEARCH_RATE_LIMIT_WINDOW_MS` = `60000`
4. Redeploy the project after adding the environment variable.

> Important: GitHub Pages can host the static HTML/CSS/JS, but it cannot run `/api/search`. The AI shortcut feature requires Vercel or another host that supports serverless functions.

## Test the AI API after deployment

Open this URL in your browser:

```text
https://your-domain.com/api/health
```

Expected result:

```json
{
  "ok": true,
  "functions": true,
  "geminiConfigured": true
}
```

Then test search:

```bash
curl -X POST https://your-domain.com/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"keep header visible while scrolling"}'
```

A healthy Gemini response returns `"source":"gemini"`. If the key is missing or Gemini is unavailable, the API returns `"source":"fallback"` so the tool still works.

## Included improvements

- Clean internal links without `.html`
- Open Graph and Twitter Card metadata
- Shared social image at `/assets/og-image.png`
- JSON-LD structured data for the home page, template library, articles, and utility pages
- Accessible mobile menu button with `aria-expanded` and `aria-controls`
- Static navigation/footer kept in HTML instead of JavaScript replacement
- Excel Shortcut Finder API health check at `/api/health`
- Robust `/api/search` with Gemini + smart fallback
