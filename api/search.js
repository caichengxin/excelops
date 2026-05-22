export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "https://getexcelops.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { query } = req.body || {};
  if (!query || query.trim().length < 2) {
    return res.status(400).json({ error: "Query too short" });
  }

  const SHORTCUTS = [
    { id:"copy-excel-shortcut", action:"Copy", cat:"Basics", win:"Ctrl + C", mac:"Cmd + C", tags:["copy","clipboard","duplicate"] },
    { id:"cut-excel-shortcut", action:"Cut", cat:"Basics", win:"Ctrl + X", mac:"Cmd + X", tags:["cut","move","clipboard"] },
    { id:"paste-excel-shortcut", action:"Paste", cat:"Basics", win:"Ctrl + V", mac:"Cmd + V", tags:["paste","clipboard","insert"] },
    { id:"undo-excel-shortcut", action:"Undo", cat:"Basics", win:"Ctrl + Z", mac:"Cmd + Z", tags:["undo","reverse","back","mistake"] },
    { id:"redo-excel-shortcut", action:"Redo", cat:"Basics", win:"Ctrl + Y", mac:"Cmd + Shift + Z", tags:["redo","repeat","forward"] },
    { id:"save-excel-shortcut", action:"Save", cat:"Basics", win:"Ctrl + S", mac:"Cmd + S", tags:["save","file"] },
    { id:"save-as-excel-shortcut", action:"Save As", cat:"Basics", win:"F12", mac:"Cmd + Shift + S", tags:["save as","rename","export"] },
    { id:"new-workbook-excel-shortcut", action:"New Workbook", cat:"Basics", win:"Ctrl + N", mac:"Cmd + N", tags:["new","workbook","blank"] },
    { id:"open-file-excel-shortcut", action:"Open File", cat:"Basics", win:"Ctrl + O", mac:"Cmd + O", tags:["open","file"] },
    { id:"close-workbook-excel-shortcut", action:"Close Workbook", cat:"Basics", win:"Ctrl + W", mac:"Cmd + W", tags:["close","exit","workbook"] },
    { id:"print-excel-shortcut", action:"Print", cat:"Basics", win:"Ctrl + P", mac:"Cmd + P", tags:["print","printer"] },
    { id:"find-excel-shortcut", action:"Find", cat:"Basics", win:"Ctrl + F", mac:"Cmd + F", tags:["find","search","lookup"] },
    { id:"spell-check-excel-shortcut", action:"Spell Check", cat:"Basics", win:"F7", mac:"F7", tags:["spell","check","spelling"] },
    { id:"select-all-excel-shortcut", action:"Select All", cat:"Basics", win:"Ctrl + A", mac:"Cmd + A", tags:["select","all","everything"] },
    { id:"edit-cell-excel-shortcut", action:"Edit Cell", cat:"Cell Editing", win:"F2", mac:"F2", tags:["edit","cell","modify"] },
    { id:"delete-content-excel-shortcut", action:"Delete Cell Content", cat:"Cell Editing", win:"Delete", mac:"Delete", tags:["delete","clear","erase"] },
    { id:"clear-all-excel-shortcut", action:"Clear All", cat:"Cell Editing", win:"Alt → H → E → A", mac:"No direct shortcut", tags:["clear","all","format","reset"] },
    { id:"fill-down-excel-shortcut", action:"Fill Down", cat:"Cell Editing", win:"Ctrl + D", mac:"Cmd + D", tags:["fill","down","copy","repeat"] },
    { id:"fill-right-excel-shortcut", action:"Fill Right", cat:"Cell Editing", win:"Ctrl + R", mac:"Cmd + R", tags:["fill","right","copy","repeat"] },
    { id:"line-break-excel-shortcut", action:"Cell Line Break", cat:"Cell Editing", win:"Alt + Enter", mac:"Ctrl + Option + Enter", tags:["line break","newline","multiline","wrap"] },
    { id:"bulk-fill-excel-shortcut", action:"Fill Same Value into Multiple Cells", cat:"Cell Editing", win:"Ctrl + Enter", mac:"Cmd + Enter", tags:["fill","multiple","bulk","same value"] },
    { id:"repeat-action-excel-shortcut", action:"Repeat Last Action", cat:"Cell Editing", win:"F4 / Ctrl + Y", mac:"Cmd + Y", tags:["repeat","last action","f4"] },
    { id:"add-comment-excel-shortcut", action:"Add Comment / Note", cat:"Cell Editing", win:"Shift + F2", mac:"Fn + Shift + F2", tags:["comment","note","annotation"] },
    { id:"fill-series-excel-shortcut", action:"Fill Series (AutoFill)", cat:"Cell Editing", win:"Alt → H → FI → S", mac:"No direct shortcut", tags:["fill series","autofill","sequence","numbers","dates"] },
    { id:"autofilter-excel-shortcut", action:"Toggle AutoFilter", cat:"Data", win:"Ctrl + Shift + L", mac:"Cmd + Shift + F", tags:["filter","sort","dropdown","autofilter"] },
    { id:"insert-date-excel-shortcut", action:"Insert Current Date", cat:"Data", win:"Ctrl + ;", mac:"Ctrl + ;", tags:["date","today","timestamp"] },
    { id:"insert-time-excel-shortcut", action:"Insert Current Time", cat:"Data", win:"Ctrl + Shift + ;", mac:"Ctrl + Shift + ;", tags:["time","now","timestamp"] },
    { id:"remove-duplicates-excel-shortcut", action:"Remove Duplicates", cat:"Data", win:"Alt → A → M", mac:"No direct shortcut", tags:["duplicate","remove","unique","clean"] },
    { id:"pivot-table-excel-shortcut", action:"Create Pivot Table", cat:"Data", win:"Alt → N → V → T", mac:"No direct shortcut", tags:["pivot","summarize","group","aggregate"] },
    { id:"find-replace-excel-shortcut", action:"Find & Replace", cat:"Data", win:"Ctrl + H", mac:"Cmd + H", tags:["find","replace","search","change"] },
    { id:"flash-fill-excel-shortcut", action:"Flash Fill", cat:"Data", win:"Ctrl + E", mac:"Cmd + E", tags:["flash fill","pattern","autofill","split","text"] },
    { id:"sort-az-excel-shortcut", action:"Sort A to Z", cat:"Data", win:"Alt → A → S → A", mac:"No direct shortcut", tags:["sort","ascending","az","order"] },
    { id:"text-to-columns-excel-shortcut", action:"Text to Columns", cat:"Data", win:"Alt → A → E", mac:"No direct shortcut", tags:["text","split","columns","delimiter","csv"] },
    { id:"paste-values-excel-shortcut", action:"Paste Values Only", cat:"Data", win:"Ctrl + Alt + V → V → Enter", mac:"Cmd + Ctrl + V → V → Enter", tags:["paste","values","no formula"] },
    { id:"bold-excel-shortcut", action:"Bold", cat:"Formatting", win:"Ctrl + B", mac:"Cmd + B", tags:["bold","format","text"] },
    { id:"italic-excel-shortcut", action:"Italic", cat:"Formatting", win:"Ctrl + I", mac:"Cmd + I", tags:["italic","format","text"] },
    { id:"underline-excel-shortcut", action:"Underline", cat:"Formatting", win:"Ctrl + U", mac:"Cmd + U", tags:["underline","format","text"] },
    { id:"paste-special-excel-shortcut", action:"Paste Special", cat:"Formatting", win:"Ctrl + Alt + V", mac:"Cmd + Ctrl + V", tags:["paste","special","values","transpose"] },
    { id:"format-cells-excel-shortcut", action:"Format Cells Dialog", cat:"Formatting", win:"Ctrl + 1", mac:"Cmd + 1", tags:["format","cells","dialog","number","border"] },
    { id:"wrap-text-excel-shortcut", action:"Wrap Text", cat:"Formatting", win:"Alt → H → W", mac:"No direct shortcut", tags:["wrap","text","overflow","cell"] },
    { id:"merge-center-excel-shortcut", action:"Merge & Center", cat:"Formatting", win:"Alt → H → M → C", mac:"No direct shortcut", tags:["merge","center","combine"] },
    { id:"currency-format-excel-shortcut", action:"Apply Currency Format", cat:"Formatting", win:"Ctrl + Shift + $", mac:"Cmd + Shift + $", tags:["currency","dollar","format","money"] },
    { id:"percent-format-excel-shortcut", action:"Apply Percentage Format", cat:"Formatting", win:"Ctrl + Shift + %", mac:"Cmd + Shift + %", tags:["percent","percentage","format"] },
    { id:"conditional-format-excel-shortcut", action:"Conditional Formatting", cat:"Formatting", win:"Alt → H → L", mac:"No direct shortcut", tags:["conditional","formatting","highlight","color"] },
    { id:"select-column-excel-shortcut", action:"Select Entire Column", cat:"Navigation", win:"Ctrl + Space", mac:"Ctrl + Space", tags:["select","column","entire"] },
    { id:"select-row-excel-shortcut", action:"Select Entire Row", cat:"Navigation", win:"Shift + Space", mac:"Shift + Space", tags:["select","row","entire"] },
    { id:"go-to-special-excel-shortcut", action:"Go To Special", cat:"Navigation", win:"Ctrl + G → Alt + S", mac:"Cmd + G → S", tags:["go to","special","blank","navigate"] },
    { id:"jump-to-end-excel-shortcut", action:"Jump to Last Used Cell", cat:"Navigation", win:"Ctrl + Arrow Key", mac:"Cmd + Arrow Key", tags:["jump","last","end","navigate"] },
    { id:"next-sheet-excel-shortcut", action:"Move to Next Sheet", cat:"Navigation", win:"Ctrl + Page Down", mac:"Fn + Ctrl + Down", tags:["sheet","tab","next","navigate"] },
    { id:"prev-sheet-excel-shortcut", action:"Move to Previous Sheet", cat:"Navigation", win:"Ctrl + Page Up", mac:"Fn + Ctrl + Up", tags:["sheet","tab","previous","navigate"] },
    { id:"new-sheet-excel-shortcut", action:"New Sheet", cat:"Navigation", win:"Shift + F11", mac:"Fn + Shift + F11", tags:["new","sheet","tab","insert"] },
    { id:"lock-reference-excel-shortcut", action:"Lock Cell Reference ($)", cat:"Formulas", win:"F4", mac:"Cmd + T", tags:["lock","dollar","absolute","reference","anchor"] },
    { id:"autosum-excel-shortcut", action:"AutoSum", cat:"Formulas", win:"Alt + =", mac:"Cmd + Shift + T", tags:["sum","add","total","autosum"] },
    { id:"evaluate-formula-excel-shortcut", action:"Evaluate Formula", cat:"Formulas", win:"Alt → M → V", mac:"No direct shortcut", tags:["evaluate","formula","debug","error"] },
    { id:"show-formulas-excel-shortcut", action:"Show Formulas", cat:"Formulas", win:"Ctrl + `", mac:"Ctrl + `", tags:["show","formulas","audit","toggle"] },
    { id:"trace-dependents-excel-shortcut", action:"Trace Dependents", cat:"Formulas", win:"Ctrl + ]", mac:"Ctrl + ]", tags:["trace","dependents","arrows","audit"] },
    { id:"recalculate-excel-shortcut", action:"Recalculate All Formulas", cat:"Formulas", win:"F9", mac:"F9", tags:["calculate","recalculate","refresh","f9"] },
    { id:"freeze-panes-excel-shortcut", action:"Freeze Panes", cat:"View", win:"Alt → W → F → F", mac:"No direct shortcut", tags:["freeze","lock","scroll","header","panes"] },
    { id:"split-window-excel-shortcut", action:"Split Window", cat:"View", win:"Alt → W → S", mac:"No direct shortcut", tags:["split","window","pane","compare"] },
    { id:"zoom-in-excel-shortcut", action:"Zoom In", cat:"View", win:"Ctrl + Mouse Scroll Up", mac:"Cmd + Mouse Scroll Up", tags:["zoom","in","magnify"] },
    { id:"zoom-out-excel-shortcut", action:"Zoom Out", cat:"View", win:"Ctrl + Mouse Scroll Down", mac:"Cmd + Mouse Scroll Down", tags:["zoom","out","shrink"] },
    { id:"hide-row-excel-shortcut", action:"Hide Row", cat:"View", win:"Ctrl + 9", mac:"Cmd + 9", tags:["hide","row","unhide"] },
    { id:"hide-column-excel-shortcut", action:"Hide Column", cat:"View", win:"Ctrl + 0", mac:"Cmd + 0", tags:["hide","column","unhide"] },
    { id:"group-rows-excel-shortcut", action:"Group Rows", cat:"View", win:"Alt + Shift + →", mac:"Cmd + Shift + K", tags:["group","rows","collapse","expand"] },
    { id:"insert-row-excel-shortcut", action:"Insert Row", cat:"Insert & Delete", win:"Ctrl + Shift + +", mac:"Cmd + Shift + +", tags:["insert","row","add","new"] },
    { id:"delete-row-excel-shortcut", action:"Delete Row", cat:"Insert & Delete", win:"Ctrl + -", mac:"Cmd + -", tags:["delete","row","remove"] },
    { id:"insert-column-excel-shortcut", action:"Insert Column", cat:"Insert & Delete", win:"Ctrl + Shift + +", mac:"Cmd + Shift + +", tags:["insert","column","add","new"] },
    { id:"delete-column-excel-shortcut", action:"Delete Column", cat:"Insert & Delete", win:"Ctrl + -", mac:"Cmd + -", tags:["delete","column","remove"] },
    { id:"insert-cells-excel-shortcut", action:"Insert Cells", cat:"Insert & Delete", win:"Ctrl + Shift + +", mac:"Cmd + Shift + +", tags:["insert","cells","shift"] },
    { id:"delete-cells-excel-shortcut", action:"Delete Cells", cat:"Insert & Delete", win:"Ctrl + -", mac:"Cmd + -", tags:["delete","cells","shift"] },
    { id:"insert-sheet-excel-shortcut", action:"Insert New Sheet", cat:"Insert & Delete", win:"Shift + F11", mac:"Fn + Shift + F11", tags:["insert","sheet","new","tab"] },
    { id:"delete-sheet-excel-shortcut", action:"Delete Sheet", cat:"Insert & Delete", win:"Alt → H → D → S", mac:"No direct shortcut", tags:["delete","sheet","remove","tab"] },
    { id:"rename-sheet-excel-shortcut", action:"Rename Sheet", cat:"Insert & Delete", win:"Alt → H → O → R", mac:"Double-click tab", tags:["rename","sheet","tab","name"] },
    { id:"insert-hyperlink-excel-shortcut", action:"Insert Hyperlink", cat:"Insert & Delete", win:"Ctrl + K", mac:"Cmd + K", tags:["hyperlink","link","url","insert"] },
  ];

  const shortcutList = SHORTCUTS.map(s =>
    `- ${s.action} (${s.cat}): tags=[${s.tags.join(", ")}], id=${s.id}`
  ).join("\n");

  const prompt = `You are an Excel shortcut search assistant. Given a user's natural language query, return the IDs of the most relevant Excel shortcuts from the list below.

User query: "${query}"

Available shortcuts:
${shortcutList}

Rules:
- Return ONLY a JSON array of shortcut IDs, maximum 6 results
- Order by relevance (most relevant first)
- If nothing matches well, return the 3 most loosely related ones
- Return ONLY the JSON array, no explanation, no markdown

Example output: ["freeze-panes-excel-shortcut","hide-row-excel-shortcut","split-window-excel-shortcut"]`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${process.env.GEMINI_API_KEY_2}`,
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
    const clean = raw.replace(/```json|```/g, "").trim();
    const ids = JSON.parse(clean);

    const results = ids
      .map(id => SHORTCUTS.find(s => s.id === id))
      .filter(Boolean);

    return res.status(200).json({ results });
  } catch (err) {
    console.error("Gemini error:", err);
    return res.status(500).json({ error: "Search failed", results: [] });
  }
}
