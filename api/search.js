export default async function handler(req, res) {
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
    { id:"copy", action:"Copy", cat:"Basics", tags:["copy","clipboard","duplicate"] },
    { id:"cut", action:"Cut", cat:"Basics", tags:["cut","move","clipboard"] },
    { id:"paste", action:"Paste", cat:"Basics", tags:["paste","clipboard","insert"] },
    { id:"undo", action:"Undo", cat:"Basics", tags:["undo","reverse","back","mistake"] },
    { id:"redo", action:"Redo", cat:"Basics", tags:["redo","repeat","forward"] },
    { id:"save", action:"Save", cat:"Basics", tags:["save","file"] },
    { id:"save-as", action:"Save As", cat:"Basics", tags:["save as","rename","export"] },
    { id:"new-wb", action:"New Workbook", cat:"Basics", tags:["new","workbook","blank"] },
    { id:"open", action:"Open File", cat:"Basics", tags:["open","file"] },
    { id:"close-wb", action:"Close Workbook", cat:"Basics", tags:["close","exit","workbook"] },
    { id:"print", action:"Print", cat:"Basics", tags:["print","printer"] },
    { id:"find", action:"Find", cat:"Basics", tags:["find","search","lookup"] },
    { id:"spell-check", action:"Spell Check", cat:"Basics", tags:["spell","check","spelling"] },
    { id:"select-all-basics", action:"Select All", cat:"Basics", tags:["select","all","everything"] },
    { id:"edit-cell", action:"Edit Cell", cat:"Cell Editing", tags:["edit","cell","modify","f2"] },
    { id:"delete-content", action:"Delete Cell Content", cat:"Cell Editing", tags:["delete","clear","erase","remove content"] },
    { id:"clear-all", action:"Clear All", cat:"Cell Editing", tags:["clear","all","format","reset"] },
    { id:"fill-down", action:"Fill Down", cat:"Cell Editing", tags:["fill","down","copy","repeat"] },
    { id:"fill-right", action:"Fill Right", cat:"Cell Editing", tags:["fill","right","copy","repeat"] },
    { id:"line-break", action:"Cell Line Break", cat:"Cell Editing", tags:["line break","newline","multiline","wrap","alt enter"] },
    { id:"ctrl-enter", action:"Fill Same Value into Multiple Cells", cat:"Cell Editing", tags:["fill","multiple","bulk","same value","ctrl enter"] },
    { id:"repeat-action", action:"Repeat Last Action", cat:"Cell Editing", tags:["repeat","last action","f4"] },
    { id:"add-comment", action:"Add Comment / Note", cat:"Cell Editing", tags:["comment","note","annotation"] },
    { id:"fill-series", action:"Fill Series (AutoFill)", cat:"Cell Editing", tags:["fill series","autofill","sequence","numbers","dates"] },
    { id:"filter", action:"Toggle AutoFilter", cat:"Data", tags:["filter","sort","dropdown","autofilter"] },
    { id:"date", action:"Insert Current Date", cat:"Data", tags:["date","today","timestamp","insert date"] },
    { id:"time", action:"Insert Current Time", cat:"Data", tags:["time","now","timestamp","insert time"] },
    { id:"dupe", action:"Remove Duplicates", cat:"Data", tags:["duplicate","remove","unique","clean","dedup"] },
    { id:"pivot", action:"Create Pivot Table", cat:"Data", tags:["pivot","summarize","group","aggregate","report"] },
    { id:"find-replace", action:"Find & Replace", cat:"Data", tags:["find","replace","search","change"] },
    { id:"flash", action:"Flash Fill", cat:"Data", tags:["flash fill","pattern","autofill","split","text"] },
    { id:"sort-az", action:"Sort A to Z", cat:"Data", tags:["sort","ascending","az","order","arrange"] },
    { id:"text-to-col", action:"Text to Columns", cat:"Data", tags:["text","split","columns","delimiter","csv"] },
    { id:"paste-val", action:"Paste Values Only", cat:"Data", tags:["paste","values","no formula","paste values"] },
    { id:"bold", action:"Bold", cat:"Formatting", tags:["bold","format","text","strong"] },
    { id:"italic", action:"Italic", cat:"Formatting", tags:["italic","format","text"] },
    { id:"underline", action:"Underline", cat:"Formatting", tags:["underline","format","text"] },
    { id:"paste-special", action:"Paste Special", cat:"Formatting", tags:["paste","special","values","transpose"] },
    { id:"format-cells", action:"Format Cells Dialog", cat:"Formatting", tags:["format","cells","dialog","number","border","font"] },
    { id:"wrap-text", action:"Wrap Text", cat:"Formatting", tags:["wrap","text","overflow","cell"] },
    { id:"merge", action:"Merge & Center", cat:"Formatting", tags:["merge","center","combine","cells"] },
    { id:"currency", action:"Apply Currency Format", cat:"Formatting", tags:["currency","dollar","format","money"] },
    { id:"percent", action:"Apply Percentage Format", cat:"Formatting", tags:["percent","percentage","format"] },
    { id:"conditional", action:"Conditional Formatting", cat:"Formatting", tags:["conditional","formatting","highlight","color","rules"] },
    { id:"col", action:"Select Entire Column", cat:"Navigation", tags:["select","column","entire"] },
    { id:"row", action:"Select Entire Row", cat:"Navigation", tags:["select","row","entire"] },
    { id:"select-all", action:"Select All Cells", cat:"Navigation", tags:["select","all","sheet"] },
    { id:"go-to", action:"Go To Special", cat:"Navigation", tags:["go to","special","blank","navigate","find blanks"] },
    { id:"end-arrow", action:"Jump to Last Used Cell", cat:"Navigation", tags:["jump","last","end","navigate","arrow"] },
    { id:"next-sheet", action:"Move to Next Sheet", cat:"Navigation", tags:["sheet","tab","next","navigate","switch"] },
    { id:"prev-sheet", action:"Move to Previous Sheet", cat:"Navigation", tags:["sheet","tab","previous","navigate","switch"] },
    { id:"new-sheet", action:"New Sheet", cat:"Navigation", tags:["new","sheet","tab","insert","create sheet"] },
    { id:"lock", action:"Lock Cell Reference ($)", cat:"Formulas", tags:["lock","dollar","absolute","reference","anchor","fix formula"] },
    { id:"autosum", action:"AutoSum", cat:"Formulas", tags:["sum","add","total","autosum","calculate"] },
    { id:"evaluate", action:"Evaluate Formula", cat:"Formulas", tags:["evaluate","formula","debug","error","step"] },
    { id:"show-formulas", action:"Show Formulas", cat:"Formulas", tags:["show","formulas","audit","toggle"] },
    { id:"trace", action:"Trace Dependents", cat:"Formulas", tags:["trace","dependents","arrows","audit","formula"] },
    { id:"calc-now", action:"Recalculate All Formulas", cat:"Formulas", tags:["calculate","recalculate","refresh","f9"] },
    { id:"freeze", action:"Freeze Panes", cat:"View", tags:["freeze","lock","scroll","header","panes","keep row visible"] },
    { id:"split", action:"Split Window", cat:"View", tags:["split","window","pane","compare"] },
    { id:"zoom-in", action:"Zoom In", cat:"View", tags:["zoom","in","magnify","bigger"] },
    { id:"zoom-out", action:"Zoom Out", cat:"View", tags:["zoom","out","shrink","smaller"] },
    { id:"hide-row", action:"Hide Row", cat:"View", tags:["hide","row","unhide","invisible"] },
    { id:"hide-col", action:"Hide Column", cat:"View", tags:["hide","column","unhide","invisible"] },
    { id:"group-rows", action:"Group Rows", cat:"View", tags:["group","rows","collapse","expand","outline"] },
    { id:"insert-row", action:"Insert Row", cat:"Insert & Delete", tags:["insert","row","add","new row"] },
    { id:"delete-row", action:"Delete Row", cat:"Insert & Delete", tags:["delete","row","remove row"] },
    { id:"insert-col", action:"Insert Column", cat:"Insert & Delete", tags:["insert","column","add","new column"] },
    { id:"delete-col", action:"Delete Column", cat:"Insert & Delete", tags:["delete","column","remove column"] },
    { id:"insert-cell", action:"Insert Cells", cat:"Insert & Delete", tags:["insert","cells","shift"] },
    { id:"delete-cell", action:"Delete Cells", cat:"Insert & Delete", tags:["delete","cells","shift","remove cells"] },
    { id:"insert-sheet", action:"Insert New Sheet", cat:"Insert & Delete", tags:["insert","sheet","new","tab","add sheet"] },
    { id:"delete-sheet", action:"Delete Sheet", cat:"Insert & Delete", tags:["delete","sheet","remove","tab"] },
    { id:"rename-sheet", action:"Rename Sheet", cat:"Insert & Delete", tags:["rename","sheet","tab","name"] },
    { id:"insert-hyperlink", action:"Insert Hyperlink", cat:"Insert & Delete", tags:["hyperlink","link","url","insert link"] },
  ];

  const shortcutList = SHORTCUTS.map(s =>
    `- ${s.action} (${s.cat}): tags=[${s.tags.join(", ")}], id=${s.id}`
  ).join("\n");

  const prompt = `You are an Excel shortcut search assistant. A user typed a natural language query. Your job is to find the most relevant Excel shortcuts from the list below.

User query: "${query}"

Available shortcuts (format: "Action (Category): tags=[...], id=ID"):
${shortcutList}

Instructions:
- ALWAYS return between 1 and 6 shortcut IDs, never return an empty array
- Pick the shortcuts whose action or tags are most relevant to the query
- If the query is vague, pick the most commonly used shortcuts related to the topic
- Return ONLY a raw JSON array of ID strings, no markdown, no code fences, no explanation
- Use the exact id values from the list above

Example — query "create new tab": ["new-sheet","insert-sheet","next-sheet"]
Example — query "copy cells": ["copy","paste","cut","paste-special"]
Example — query "keep header row visible": ["freeze","split","hide-row"]`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
    const results = ids.map(id => SHORTCUTS.find(s => s.id === id)).filter(Boolean);
    return res.status(200).json({ results, raw });
  } catch (err) {
    console.error("Gemini error:", err);
    return res.status(500).json({ error: "Search failed", results: [] });
  }
}
