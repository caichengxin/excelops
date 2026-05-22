module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { query } = req.body || {};
  if (!query || query.trim().length < 2) {
    return res.status(400).json({ error: "Query too short" });
  }

  const SHORTCUTS = [
    { id:"copy", action:"Copy" },
    { id:"cut", action:"Cut" },
    { id:"paste", action:"Paste" },
    { id:"undo", action:"Undo" },
    { id:"redo", action:"Redo" },
    { id:"save", action:"Save" },
    { id:"save-as", action:"Save As" },
    { id:"new-wb", action:"New Workbook" },
    { id:"open", action:"Open File" },
    { id:"close-wb", action:"Close Workbook" },
    { id:"print", action:"Print" },
    { id:"find", action:"Find" },
    { id:"spell-check", action:"Spell Check" },
    { id:"select-all-basics", action:"Select All" },
    { id:"edit-cell", action:"Edit Cell" },
    { id:"delete-content", action:"Delete Cell Content" },
    { id:"clear-all", action:"Clear All" },
    { id:"fill-down", action:"Fill Down" },
    { id:"fill-right", action:"Fill Right" },
    { id:"line-break", action:"Cell Line Break" },
    { id:"ctrl-enter", action:"Fill Same Value into Multiple Cells" },
    { id:"repeat-action", action:"Repeat Last Action" },
    { id:"add-comment", action:"Add Comment / Note" },
    { id:"fill-series", action:"Fill Series" },
    { id:"filter", action:"Toggle AutoFilter" },
    { id:"date", action:"Insert Current Date" },
    { id:"time", action:"Insert Current Time" },
    { id:"dupe", action:"Remove Duplicates" },
    { id:"pivot", action:"Create Pivot Table" },
    { id:"find-replace", action:"Find & Replace" },
    { id:"flash", action:"Flash Fill" },
    { id:"sort-az", action:"Sort A to Z" },
    { id:"text-to-col", action:"Text to Columns" },
    { id:"paste-val", action:"Paste Values Only" },
    { id:"bold", action:"Bold" },
    { id:"italic", action:"Italic" },
    { id:"underline", action:"Underline" },
    { id:"paste-special", action:"Paste Special" },
    { id:"format-cells", action:"Format Cells Dialog" },
    { id:"wrap-text", action:"Wrap Text" },
    { id:"merge", action:"Merge & Center" },
    { id:"currency", action:"Apply Currency Format" },
    { id:"percent", action:"Apply Percentage Format" },
    { id:"conditional", action:"Conditional Formatting" },
    { id:"col", action:"Select Entire Column" },
    { id:"row", action:"Select Entire Row" },
    { id:"select-all", action:"Select All Cells" },
    { id:"go-to", action:"Go To Special" },
    { id:"end-arrow", action:"Jump to Last Used Cell" },
    { id:"next-sheet", action:"Move to Next Sheet" },
    { id:"prev-sheet", action:"Move to Previous Sheet" },
    { id:"new-sheet", action:"New Sheet" },
    { id:"lock", action:"Lock Cell Reference" },
    { id:"autosum", action:"AutoSum" },
    { id:"evaluate", action:"Evaluate Formula" },
    { id:"show-formulas", action:"Show Formulas" },
    { id:"trace", action:"Trace Dependents" },
    { id:"calc-now", action:"Recalculate All Formulas" },
    { id:"freeze", action:"Freeze Panes" },
    { id:"split", action:"Split Window" },
    { id:"zoom-in", action:"Zoom In" },
    { id:"zoom-out", action:"Zoom Out" },
    { id:"hide-row", action:"Hide Row" },
    { id:"hide-col", action:"Hide Column" },
    { id:"group-rows", action:"Group Rows" },
    { id:"insert-row", action:"Insert Row" },
    { id:"delete-row", action:"Delete Row" },
    { id:"insert-col", action:"Insert Column" },
    { id:"delete-col", action:"Delete Column" },
    { id:"insert-cell", action:"Insert Cells" },
    { id:"delete-cell", action:"Delete Cells" },
    { id:"insert-sheet", action:"Insert New Sheet" },
    { id:"delete-sheet", action:"Delete Sheet" },
    { id:"rename-sheet", action:"Rename Sheet" },
    { id:"insert-hyperlink", action:"Insert Hyperlink" },
  ];

  const prompt = `Return the most relevant Excel shortcut IDs.
Query: "${query}"
Available IDs:
${SHORTCUTS.map(s => `${s.id}: ${s.action}`).join("\n")}
Rules:
- Return 1-5 ids
- JSON array only
- Use exact ids`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 200 }
        })
      }
    );
    const data = await geminiRes.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const match = raw.match(/\[[\s\S]*\]/);
    const ids = match ? JSON.parse(match[0]) : [];
    const results = ids.map(function(id) { return SHORTCUTS.find(function(s) { return s.id === id; }); }).filter(Boolean);
    return res.status(200).json({ results });
  } catch (err) {
    return res.status(500).json({ error: "Search failed", results: [], err: err.message });
  }
}
