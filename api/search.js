// ExcelOps Shortcut AI search API
// Vercel serverless function. Requires GEMINI_API_KEY for true AI results.
// If GEMINI_API_KEY is missing or Gemini fails, this returns a local smart-search fallback
// so the Shortcut Finder still works instead of silently failing.

const SHORTCUTS = [
  {
    "id": "copy",
    "action": "Copy",
    "cat": "Basics",
    "tags": [
      "copy",
      "clipboard",
      "duplicate"
    ],
    "desc": "Copies the selected cells to the clipboard. The copied range shows a moving dashed border. Press Escape to cancel.",
    "ribbon": "Home → Copy"
  },
  {
    "id": "cut",
    "action": "Cut",
    "cat": "Basics",
    "tags": [
      "cut",
      "move",
      "clipboard"
    ],
    "desc": "Cuts the selected cells to the clipboard. The cell content is removed once you paste elsewhere.",
    "ribbon": "Home → Cut"
  },
  {
    "id": "paste",
    "action": "Paste",
    "cat": "Basics",
    "tags": [
      "paste",
      "clipboard",
      "insert"
    ],
    "desc": "Pastes the clipboard contents into the selected cell. Pastes everything including values, formulas, and formatting.",
    "ribbon": "Home → Paste"
  },
  {
    "id": "undo",
    "action": "Undo",
    "cat": "Basics",
    "tags": [
      "undo",
      "reverse",
      "back",
      "mistake"
    ],
    "desc": "Reverses the last action. Press repeatedly to undo multiple steps. Excel keeps up to 100 undo steps by default.",
    "ribbon": "Quick Access Toolbar → Undo"
  },
  {
    "id": "redo",
    "action": "Redo",
    "cat": "Basics",
    "tags": [
      "redo",
      "repeat",
      "forward"
    ],
    "desc": "Re-applies the last action that was undone. Only works after using Undo.",
    "ribbon": "Quick Access Toolbar → Redo"
  },
  {
    "id": "save",
    "action": "Save",
    "cat": "Basics",
    "tags": [
      "save",
      "file",
      "disk"
    ],
    "desc": "Saves the current workbook. If the file has never been saved, opens the Save As dialog.",
    "ribbon": "File → Save"
  },
  {
    "id": "save-as",
    "action": "Save As",
    "cat": "Basics",
    "tags": [
      "save as",
      "rename",
      "export",
      "file",
      "f12"
    ],
    "desc": "Opens the Save As dialog to save the file with a new name, location, or format (e.g. .xlsx, .csv, .pdf).",
    "ribbon": "File → Save As"
  },
  {
    "id": "new-wb",
    "action": "New workbook",
    "cat": "Basics",
    "tags": [
      "new",
      "workbook",
      "blank",
      "file"
    ],
    "desc": "Opens a new blank workbook in a separate window.",
    "ribbon": "File → New"
  },
  {
    "id": "open",
    "action": "Open file",
    "cat": "Basics",
    "tags": [
      "open",
      "file",
      "browse"
    ],
    "desc": "Opens the file browser to open an existing Excel workbook.",
    "ribbon": "File → Open"
  },
  {
    "id": "close-wb",
    "action": "Close workbook",
    "cat": "Basics",
    "tags": [
      "close",
      "exit",
      "workbook",
      "file"
    ],
    "desc": "Closes the current workbook. Prompts to save if there are unsaved changes.",
    "ribbon": "File → Close"
  },
  {
    "id": "print",
    "action": "Print",
    "cat": "Basics",
    "tags": [
      "print",
      "printer",
      "page",
      "output"
    ],
    "desc": "Opens the Print dialog where you can preview, set print area, choose printer, and adjust page settings.",
    "ribbon": "File → Print"
  },
  {
    "id": "select-all-basics",
    "action": "Select all",
    "cat": "Basics",
    "tags": [
      "select",
      "all",
      "everything"
    ],
    "desc": "Selects all cells in the current data region. Press again to select the entire sheet.",
    "ribbon": "No menu path — keyboard only"
  },
  {
    "id": "find",
    "action": "Find",
    "cat": "Basics",
    "tags": [
      "find",
      "search",
      "lookup"
    ],
    "desc": "Opens the Find dialog to search for text or values in the sheet. Press Ctrl+H to switch to Find & Replace.",
    "ribbon": "Home → Find & Select → Find"
  },
  {
    "id": "spell-check",
    "action": "Spell check",
    "cat": "Basics",
    "tags": [
      "spell",
      "check",
      "spelling",
      "grammar"
    ],
    "desc": "Runs a spell check on the active sheet, starting from the current cell.",
    "ribbon": "Review → Spelling"
  },
  {
    "id": "edit-cell",
    "action": "Edit cell (enter edit mode)",
    "cat": "Cell Editing",
    "tags": [
      "edit",
      "cell",
      "f2",
      "enter",
      "modify"
    ],
    "desc": "Places the cursor inside the active cell so you can edit its content directly. Press Escape to cancel, Enter to confirm.",
    "ribbon": "No menu path — keyboard only"
  },
  {
    "id": "delete-content",
    "action": "Delete cell content",
    "cat": "Cell Editing",
    "tags": [
      "delete",
      "clear",
      "content",
      "remove",
      "erase"
    ],
    "desc": "Clears the content of selected cells without removing the cells themselves. Formatting is preserved.",
    "ribbon": "Home → Clear → Clear Contents"
  },
  {
    "id": "clear-all",
    "action": "Clear all (content + formatting)",
    "cat": "Cell Editing",
    "tags": [
      "clear",
      "all",
      "format",
      "content",
      "erase",
      "reset"
    ],
    "desc": "Removes both content and formatting from the selected cells. Use with caution — this cannot be undone in one step.",
    "ribbon": "Home → Clear → Clear All"
  },
  {
    "id": "fill-down",
    "action": "Fill Down",
    "cat": "Cell Editing",
    "tags": [
      "fill",
      "down",
      "copy",
      "repeat",
      "ctrl d"
    ],
    "desc": "Copies the content of the top cell into all selected cells below it. Select the source cell and destination cells first.",
    "ribbon": "Home → Fill → Down"
  },
  {
    "id": "fill-right",
    "action": "Fill Right",
    "cat": "Cell Editing",
    "tags": [
      "fill",
      "right",
      "copy",
      "repeat",
      "ctrl r"
    ],
    "desc": "Copies the content of the leftmost cell into all selected cells to its right.",
    "ribbon": "Home → Fill → Right"
  },
  {
    "id": "fill-series",
    "action": "Fill series (AutoFill)",
    "cat": "Cell Editing",
    "tags": [
      "fill",
      "series",
      "autofill",
      "sequence",
      "numbers",
      "dates"
    ],
    "desc": "Fills a range with a series of numbers, dates, or custom sequences. Drag the fill handle from a cell as an alternative.",
    "ribbon": "Home → Fill → Series"
  },
  {
    "id": "line-break",
    "action": "Cell line break",
    "cat": "Cell Editing",
    "tags": [
      "line break",
      "newline",
      "enter",
      "cell",
      "wrap",
      "multiline"
    ],
    "desc": "Inserts a line break inside a cell without moving to the next cell. Useful for multi-line labels or addresses.",
    "ribbon": "No menu path — keyboard only"
  },
  {
    "id": "ctrl-enter",
    "action": "Fill same value into multiple cells",
    "cat": "Cell Editing",
    "tags": [
      "fill",
      "multiple",
      "cells",
      "same",
      "ctrl enter",
      "bulk"
    ],
    "desc": "Select multiple cells, type a value or formula, then press Ctrl+Enter to fill all selected cells at once.",
    "ribbon": "No menu path — keyboard only"
  },
  {
    "id": "repeat-action",
    "action": "Repeat last action",
    "cat": "Cell Editing",
    "tags": [
      "repeat",
      "last",
      "action",
      "f4",
      "redo"
    ],
    "desc": "Repeats the last formatting or editing action on the current selection. Useful for applying the same format to multiple areas.",
    "ribbon": "No menu path — keyboard only"
  },
  {
    "id": "add-comment",
    "action": "Add comment / note",
    "cat": "Cell Editing",
    "tags": [
      "comment",
      "note",
      "annotation",
      "shift f2"
    ],
    "desc": "Inserts a comment (note) on the selected cell. Comments are visible on hover and useful for explaining data.",
    "ribbon": "Review → New Comment"
  },
  {
    "id": "filter",
    "action": "Toggle AutoFilter",
    "cat": "Data",
    "tags": [
      "filter",
      "sort",
      "dropdown",
      "autofilter"
    ],
    "desc": "Add or remove filter dropdowns on your data range. Click the dropdown arrows to filter by value, color, or condition.",
    "ribbon": "Data → Filter"
  },
  {
    "id": "date",
    "action": "Insert current date",
    "cat": "Data",
    "tags": [
      "date",
      "today",
      "timestamp",
      "insert",
      "time"
    ],
    "desc": "Stamps today's date as a static value. Combine with Ctrl+Shift+; for the current time to create a full timestamp.",
    "ribbon": "No menu path — keyboard only"
  },
  {
    "id": "time",
    "action": "Insert current time",
    "cat": "Data",
    "tags": [
      "time",
      "now",
      "timestamp",
      "insert"
    ],
    "desc": "Stamps the current time as a static value. Use after Ctrl+; and a space to get a full date-time stamp.",
    "ribbon": "No menu path — keyboard only"
  },
  {
    "id": "dupe",
    "action": "Remove duplicates",
    "cat": "Data",
    "tags": [
      "duplicate",
      "remove",
      "unique",
      "clean",
      "dedup"
    ],
    "desc": "Scan selected columns for duplicate rows and remove them, keeping only the first occurrence. Choose which columns to check.",
    "ribbon": "Data → Remove Duplicates"
  },
  {
    "id": "pivot",
    "action": "Create pivot table",
    "cat": "Data",
    "tags": [
      "pivot",
      "summarize",
      "group",
      "aggregate",
      "report",
      "table"
    ],
    "desc": "Summarize large datasets by grouping, counting, or aggregating values. One of Excel's most powerful analysis tools.",
    "ribbon": "Insert → PivotTable"
  },
  {
    "id": "find-replace",
    "action": "Find & Replace",
    "cat": "Data",
    "tags": [
      "find",
      "replace",
      "search",
      "change",
      "wildcard"
    ],
    "desc": "Replace one value with another across the sheet or entire workbook. Use wildcards (* ?) for pattern matching.",
    "ribbon": "Home → Find & Select → Replace"
  },
  {
    "id": "flash",
    "action": "Flash Fill",
    "cat": "Data",
    "tags": [
      "flash fill",
      "pattern",
      "autofill",
      "text",
      "split",
      "smart fill"
    ],
    "desc": "Auto-fills a column based on a pattern Excel detects from your examples. Great for splitting names, reformatting dates, or extracting text.",
    "ribbon": "Data → Flash Fill"
  },
  {
    "id": "sort-az",
    "action": "Sort A to Z",
    "cat": "Data",
    "tags": [
      "sort",
      "ascending",
      "az",
      "order",
      "arrange"
    ],
    "desc": "Sorts the selected column or range in ascending order. Select a single cell in the column before using.",
    "ribbon": "Data → Sort A to Z"
  },
  {
    "id": "text-to-col",
    "action": "Text to columns",
    "cat": "Data",
    "tags": [
      "text",
      "split",
      "columns",
      "delimiter",
      "csv",
      "clean"
    ],
    "desc": "Split text in one column into multiple columns by a delimiter like comma, space, or tab. Essential for cleaning imported data.",
    "ribbon": "Data → Text to Columns"
  },
  {
    "id": "paste-val",
    "action": "Paste values only",
    "cat": "Data",
    "tags": [
      "paste",
      "values",
      "no formula",
      "special"
    ],
    "desc": "Pastes only the cell values, stripping all formulas and formatting. Prevents formula errors when moving data between sheets.",
    "ribbon": "Home → Paste → Paste Values"
  },
  {
    "id": "bold",
    "action": "Bold",
    "cat": "Formatting",
    "tags": [
      "bold",
      "format",
      "text",
      "style"
    ],
    "desc": "Toggle bold formatting on selected cells or text within a cell.",
    "ribbon": "Home → Bold"
  },
  {
    "id": "italic",
    "action": "Italic",
    "cat": "Formatting",
    "tags": [
      "italic",
      "format",
      "text",
      "style"
    ],
    "desc": "Toggle italic formatting on selected cells or text within a cell.",
    "ribbon": "Home → Italic"
  },
  {
    "id": "underline",
    "action": "Underline",
    "cat": "Formatting",
    "tags": [
      "underline",
      "format",
      "text",
      "style"
    ],
    "desc": "Toggle underline formatting on selected cells or text within a cell.",
    "ribbon": "Home → Underline"
  },
  {
    "id": "paste-special",
    "action": "Paste Special",
    "cat": "Formatting",
    "tags": [
      "paste",
      "special",
      "values",
      "transpose",
      "format"
    ],
    "desc": "Opens the Paste Special dialog. Choose to paste values, formats, formulas, column widths, or transpose rows to columns.",
    "ribbon": "Home → Paste → Paste Special"
  },
  {
    "id": "format-cells",
    "action": "Format cells dialog",
    "cat": "Formatting",
    "tags": [
      "format",
      "cells",
      "dialog",
      "number",
      "border",
      "font"
    ],
    "desc": "Opens the full Format Cells dialog with tabs for Number, Alignment, Font, Border, Fill, and Protection.",
    "ribbon": "Home → Format → Format Cells"
  },
  {
    "id": "wrap-text",
    "action": "Wrap text",
    "cat": "Formatting",
    "tags": [
      "wrap",
      "text",
      "overflow",
      "cell"
    ],
    "desc": "Makes long text wrap inside the cell instead of overflowing into adjacent cells.",
    "ribbon": "Home → Wrap Text"
  },
  {
    "id": "merge",
    "action": "Merge & center",
    "cat": "Formatting",
    "tags": [
      "merge",
      "center",
      "combine",
      "cells"
    ],
    "desc": "Merges the selected cells into one and centers the content. Use sparingly — merged cells can break formulas and sorting.",
    "ribbon": "Home → Merge & Center"
  },
  {
    "id": "currency",
    "action": "Apply currency format",
    "cat": "Formatting",
    "tags": [
      "currency",
      "dollar",
      "format",
      "number",
      "money"
    ],
    "desc": "Applies the currency format with two decimal places to the selected cells.",
    "ribbon": "Home → Number Format → Currency"
  },
  {
    "id": "percent",
    "action": "Apply percentage format",
    "cat": "Formatting",
    "tags": [
      "percent",
      "percentage",
      "format",
      "number"
    ],
    "desc": "Applies percentage format to the selected cells. Note: 0.5 becomes 50%.",
    "ribbon": "Home → Number Format → Percentage"
  },
  {
    "id": "conditional",
    "action": "Conditional formatting",
    "cat": "Formatting",
    "tags": [
      "conditional",
      "formatting",
      "highlight",
      "color",
      "rules"
    ],
    "desc": "Apply color scales, data bars, or custom rules to highlight cells based on their values.",
    "ribbon": "Home → Conditional Formatting"
  },
  {
    "id": "col",
    "action": "Select entire column",
    "cat": "Navigation",
    "tags": [
      "select",
      "column",
      "entire",
      "ctrl space"
    ],
    "desc": "Selects every cell in the active column. Combine with Shift to extend the selection across multiple columns.",
    "ribbon": "No menu path — keyboard only"
  },
  {
    "id": "row",
    "action": "Select entire row",
    "cat": "Navigation",
    "tags": [
      "select",
      "row",
      "entire",
      "shift space"
    ],
    "desc": "Selects every cell in the active row. Hold Shift after to extend selection to multiple rows.",
    "ribbon": "No menu path — keyboard only"
  },
  {
    "id": "select-all",
    "action": "Select all cells",
    "cat": "Navigation",
    "tags": [
      "select",
      "all",
      "entire",
      "sheet"
    ],
    "desc": "Selects all cells in the current data region. Press again to select the entire sheet.",
    "ribbon": "No menu path — keyboard only"
  },
  {
    "id": "go-to",
    "action": "Go To Special",
    "cat": "Navigation",
    "tags": [
      "go to",
      "special",
      "blank",
      "formula",
      "navigate"
    ],
    "desc": "Navigate to specific cell types: blanks, formulas, constants, errors, or last cell. Essential for cleaning data.",
    "ribbon": "Home → Find & Select → Go To Special"
  },
  {
    "id": "end-arrow",
    "action": "Jump to last used cell in row/column",
    "cat": "Navigation",
    "tags": [
      "jump",
      "last",
      "end",
      "navigate",
      "arrow",
      "move"
    ],
    "desc": "Jumps to the last non-empty cell in the direction of the arrow. If cell is empty, jumps to the next non-empty cell.",
    "ribbon": "No menu path — keyboard only"
  },
  {
    "id": "next-sheet",
    "action": "Move to next sheet",
    "cat": "Navigation",
    "tags": [
      "sheet",
      "tab",
      "next",
      "navigate",
      "switch"
    ],
    "desc": "Switches to the next worksheet tab to the right.",
    "ribbon": "No menu path — keyboard only"
  },
  {
    "id": "prev-sheet",
    "action": "Move to previous sheet",
    "cat": "Navigation",
    "tags": [
      "sheet",
      "tab",
      "previous",
      "navigate",
      "switch"
    ],
    "desc": "Switches to the previous worksheet tab to the left.",
    "ribbon": "No menu path — keyboard only"
  },
  {
    "id": "new-sheet",
    "action": "New sheet",
    "cat": "Navigation",
    "tags": [
      "new",
      "sheet",
      "tab",
      "insert",
      "add"
    ],
    "desc": "Inserts a new blank worksheet to the left of the active sheet.",
    "ribbon": "Right-click tab → Insert Sheet"
  },
  {
    "id": "lock",
    "action": "Lock cell reference ($)",
    "cat": "Formulas",
    "tags": [
      "lock",
      "dollar",
      "absolute",
      "reference",
      "formula",
      "anchor"
    ],
    "desc": "Cycles through absolute and relative references while editing a formula: A1 → $A$1 → A$1 → $A1 → A1. Press while the cursor is on a cell reference.",
    "ribbon": "No menu path — keyboard only"
  },
  {
    "id": "autosum",
    "action": "AutoSum selected range",
    "cat": "Formulas",
    "tags": [
      "sum",
      "add",
      "total",
      "autosum",
      "formula"
    ],
    "desc": "Automatically inserts a SUM formula for the cells above or to the left of the active cell. Works for multiple columns at once.",
    "ribbon": "Home → AutoSum"
  },
  {
    "id": "evaluate",
    "action": "Evaluate formula",
    "cat": "Formulas",
    "tags": [
      "evaluate",
      "formula",
      "debug",
      "step",
      "error"
    ],
    "desc": "Step through a formula one calculation at a time to find errors. Highlights each part of the formula as it evaluates.",
    "ribbon": "Formulas → Evaluate Formula"
  },
  {
    "id": "show-formulas",
    "action": "Show formulas",
    "cat": "Formulas",
    "tags": [
      "show",
      "formulas",
      "audit",
      "toggle",
      "view"
    ],
    "desc": "Toggles between showing formula results and the actual formula text in all cells. Useful for auditing a sheet.",
    "ribbon": "Formulas → Show Formulas"
  },
  {
    "id": "trace",
    "action": "Trace dependents",
    "cat": "Formulas",
    "tags": [
      "trace",
      "dependents",
      "arrows",
      "audit",
      "formula"
    ],
    "desc": "Draws arrows showing which cells depend on the active cell. Useful for understanding formula relationships.",
    "ribbon": "Formulas → Trace Dependents"
  },
  {
    "id": "calc-now",
    "action": "Recalculate all formulas",
    "cat": "Formulas",
    "tags": [
      "calculate",
      "recalculate",
      "refresh",
      "formula",
      "f9"
    ],
    "desc": "Forces Excel to recalculate all formulas in the workbook. Useful when automatic calculation is turned off.",
    "ribbon": "Formulas → Calculate Now"
  },
  {
    "id": "freeze",
    "action": "Freeze panes",
    "cat": "View",
    "tags": [
      "freeze",
      "lock",
      "scroll",
      "header",
      "panes",
      "rows"
    ],
    "desc": "Locks rows or columns so they stay visible while scrolling. Select the cell below and to the right of where you want to freeze.",
    "ribbon": "View → Freeze Panes → Freeze Panes"
  },
  {
    "id": "split",
    "action": "Split window",
    "cat": "View",
    "tags": [
      "split",
      "window",
      "pane",
      "scroll",
      "compare"
    ],
    "desc": "Splits the worksheet into multiple panes that can be scrolled independently. Great for comparing different parts of a large sheet.",
    "ribbon": "View → Split"
  },
  {
    "id": "zoom-in",
    "action": "Zoom in",
    "cat": "View",
    "tags": [
      "zoom",
      "in",
      "magnify",
      "view",
      "size"
    ],
    "desc": "Increases the zoom level to make cells larger. Alternatively use the zoom slider in the bottom-right corner.",
    "ribbon": "View → Zoom → Zoom In"
  },
  {
    "id": "zoom-out",
    "action": "Zoom out",
    "cat": "View",
    "tags": [
      "zoom",
      "out",
      "shrink",
      "view",
      "size"
    ],
    "desc": "Decreases the zoom level to show more cells at once. Useful for seeing the full picture of a large spreadsheet.",
    "ribbon": "View → Zoom → Zoom Out"
  },
  {
    "id": "hide-row",
    "action": "Hide row",
    "cat": "View",
    "tags": [
      "hide",
      "row",
      "visible",
      "unhide"
    ],
    "desc": "Hides the selected rows. Use Ctrl+Shift+9 (or Cmd+Shift+9 on Mac) to unhide. Select surrounding rows first to unhide.",
    "ribbon": "Home → Format → Hide & Unhide → Hide Rows"
  },
  {
    "id": "hide-col",
    "action": "Hide column",
    "cat": "View",
    "tags": [
      "hide",
      "column",
      "visible",
      "unhide"
    ],
    "desc": "Hides the selected columns. Select surrounding columns and press Ctrl+Shift+0 to unhide.",
    "ribbon": "Home → Format → Hide & Unhide → Hide Columns"
  },
  {
    "id": "group-rows",
    "action": "Group rows",
    "cat": "View",
    "tags": [
      "group",
      "rows",
      "collapse",
      "expand",
      "outline"
    ],
    "desc": "Groups selected rows so they can be collapsed/expanded with a click. Useful for organising large reports with sections.",
    "ribbon": "Data → Group"
  },
  {
    "id": "insert-row",
    "action": "Insert row",
    "cat": "Insert & Delete",
    "tags": [
      "insert",
      "row",
      "add",
      "new",
      "plus"
    ],
    "desc": "Inserts a new blank row above the selected row. Select multiple rows first to insert the same number of rows.",
    "ribbon": "Home → Insert → Insert Sheet Rows"
  },
  {
    "id": "delete-row",
    "action": "Delete row",
    "cat": "Insert & Delete",
    "tags": [
      "delete",
      "row",
      "remove",
      "minus"
    ],
    "desc": "Deletes the selected rows and shifts the remaining rows up. Select entire rows with Shift+Space first.",
    "ribbon": "Home → Delete → Delete Sheet Rows"
  },
  {
    "id": "insert-col",
    "action": "Insert column",
    "cat": "Insert & Delete",
    "tags": [
      "insert",
      "column",
      "add",
      "new",
      "plus"
    ],
    "desc": "Inserts a new blank column to the left of the selected column. Select the entire column first with Ctrl+Space.",
    "ribbon": "Home → Insert → Insert Sheet Columns"
  },
  {
    "id": "delete-col",
    "action": "Delete column",
    "cat": "Insert & Delete",
    "tags": [
      "delete",
      "column",
      "remove",
      "minus"
    ],
    "desc": "Deletes the selected columns and shifts remaining columns left. Select entire columns with Ctrl+Space first.",
    "ribbon": "Home → Delete → Delete Sheet Columns"
  },
  {
    "id": "insert-cell",
    "action": "Insert cells / shift down",
    "cat": "Insert & Delete",
    "tags": [
      "insert",
      "cells",
      "shift",
      "down",
      "right"
    ],
    "desc": "Opens the Insert dialog to add cells and shift existing cells down or right. Select the number of cells you want to insert first.",
    "ribbon": "Home → Insert → Insert Cells"
  },
  {
    "id": "delete-cell",
    "action": "Delete cells / shift up",
    "cat": "Insert & Delete",
    "tags": [
      "delete",
      "cells",
      "shift",
      "up",
      "left"
    ],
    "desc": "Opens the Delete dialog to remove cells and shift remaining cells up or left.",
    "ribbon": "Home → Delete → Delete Cells"
  },
  {
    "id": "insert-sheet",
    "action": "Insert new sheet",
    "cat": "Insert & Delete",
    "tags": [
      "insert",
      "sheet",
      "new",
      "tab",
      "worksheet"
    ],
    "desc": "Inserts a new blank worksheet to the left of the current sheet.",
    "ribbon": "Right-click tab → Insert Sheet"
  },
  {
    "id": "delete-sheet",
    "action": "Delete sheet",
    "cat": "Insert & Delete",
    "tags": [
      "delete",
      "sheet",
      "remove",
      "tab",
      "worksheet"
    ],
    "desc": "Permanently deletes the active worksheet. This cannot be undone — make sure you have a backup.",
    "ribbon": "Right-click tab → Delete"
  },
  {
    "id": "rename-sheet",
    "action": "Rename sheet",
    "cat": "Insert & Delete",
    "tags": [
      "rename",
      "sheet",
      "tab",
      "name",
      "worksheet"
    ],
    "desc": "Allows you to rename the active worksheet tab. You can also double-click the tab name directly.",
    "ribbon": "Right-click tab → Rename"
  },
  {
    "id": "insert-hyperlink",
    "action": "Insert hyperlink",
    "cat": "Insert & Delete",
    "tags": [
      "hyperlink",
      "link",
      "url",
      "insert",
      "ctrl k"
    ],
    "desc": "Opens the Insert Hyperlink dialog to add a link to a URL, file, email address, or another location in the workbook.",
    "ribbon": "Insert → Link"
  }
];


const STOP_WORDS = new Set([
  "a", "an", "the", "to", "for", "of", "on", "in", "into", "with", "while", "when", "how", "do", "i", "can", "want", "need", "my", "and", "or", "by", "from", "as", "is", "are", "be", "visible"
]);

const ALIASES = [
  { id: "freeze", terms: ["lock header", "lock row", "keep header visible", "keep top row", "freeze first row", "freeze top row", "sticky header", "scroll with header"] },
  { id: "filter", terms: ["filter data", "dropdown filter", "table filter", "筛选", "过滤", "auto filter"] },
  { id: "dupe", terms: ["delete duplicates", "remove duplicate rows", "dedupe", "unique rows", "去重", "删除重复"] },
  { id: "pivot", terms: ["summarize data", "summary table", "pivot", "pivot table", "透视表", "数据透视表"] },
  { id: "text-to-col", terms: ["split column", "split text", "csv split", "delimiter", "separate names", "分列"] },
  { id: "paste-val", terms: ["paste as values", "values only", "remove formulas", "粘贴值", "只粘贴数值"] },
  { id: "format-cells", terms: ["cell format", "number format", "format dialog", "格式单元格"] },
  { id: "conditional", terms: ["highlight cells", "color rules", "conditional format", "条件格式"] },
  { id: "go-to", terms: ["select blanks", "special cells", "visible cells", "go to special", "定位条件"] },
  { id: "end-arrow", terms: ["jump to end", "last cell", "last used row", "bottom of data", "go to last row"] },
  { id: "next-sheet", terms: ["next tab", "switch sheet", "next worksheet", "下一个工作表"] },
  { id: "prev-sheet", terms: ["previous tab", "prior sheet", "previous worksheet", "上一个工作表"] },
  { id: "lock", terms: ["absolute reference", "dollar sign", "fix reference", "锁定引用", "绝对引用"] },
  { id: "autosum", terms: ["sum column", "quick sum", "total cells", "自动求和"] },
  { id: "show-formulas", terms: ["display formulas", "formula view", "show formula", "显示公式"] },
  { id: "calc-now", terms: ["recalculate", "refresh formulas", "calculate now", "重新计算"] },
  { id: "wrap-text", terms: ["wrap", "make text fit", "multi line", "自动换行"] },
  { id: "merge", terms: ["merge cells", "center across", "合并居中"] },
  { id: "date", terms: ["today date", "insert today", "current date", "当前日期"] },
  { id: "time", terms: ["current time", "insert time", "timestamp time", "当前时间"] },
  { id: "line-break", terms: ["new line in cell", "line break", "multiple lines", "单元格换行"] },
  { id: "find-replace", terms: ["replace text", "find and replace", "批量替换"] },
  { id: "flash", terms: ["auto extract", "clean names", "flash fill", "快速填充"] },
  { id: "insert-row", terms: ["add row", "new row", "insert rows", "插入行"] },
  { id: "delete-row", terms: ["remove row", "delete rows", "删除行"] },
  { id: "insert-col", terms: ["add column", "new column", "insert columns", "插入列"] },
  { id: "delete-col", terms: ["remove column", "delete columns", "删除列"] },
  { id: "rename-sheet", terms: ["rename tab", "sheet name", "change worksheet name", "重命名工作表"] },
  { id: "insert-hyperlink", terms: ["add link", "create hyperlink", "insert link", "超链接"] }
];

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");
}

function sendJson(res, status, body) {
  res.status(status).json(body);
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[→+()/$;:,._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return req.body;
}

function scoreShortcut(shortcut, query) {
  const q = normalize(query);
  if (!q) return 0;

  const tokens = q.split(" ").filter(token => token.length >= 2 && !STOP_WORDS.has(token));
  const haystack = normalize([
    shortcut.id,
    shortcut.action,
    shortcut.cat,
    shortcut.tags?.join(" "),
    shortcut.desc,
    shortcut.ribbon
  ].join(" "));

  let score = 0;
  const action = normalize(shortcut.action);

  if (action === q) score += 120;
  if (action.includes(q)) score += 70;
  if (haystack.includes(q)) score += 50;

  for (const token of tokens) {
    if (token.length < 2) continue;
    if (action.includes(token)) score += 14;
    if ((shortcut.tags || []).some(t => normalize(t).includes(token))) score += 18;
    if (haystack.includes(token)) score += 5;
  }

  for (const alias of ALIASES) {
    if (alias.id !== shortcut.id) continue;
    for (const term of alias.terms) {
      const nt = normalize(term);
      if (q.includes(nt) || nt.includes(q)) score += 80;
      for (const token of tokens) if (nt.includes(token) && token.length >= 3) score += 12;
    }
  }

  return score;
}

function localFallback(query, limit = 5) {
  const scored = SHORTCUTS
    .map(s => ({ ...s, score: scoreShortcut(s, query) }))
    .filter(s => s.score >= 20)
    .sort((a, b) => b.score - a.score || a.action.localeCompare(b.action));

  const topScore = scored[0]?.score || 0;
  const threshold = topScore >= 100 ? Math.max(20, topScore * 0.5) : 20;

  return scored
    .filter(s => s.score >= threshold)
    .slice(0, limit)
    .map(({ id, action, cat, score }) => ({ id, action, cat, score }));
}

function buildPrompt(query) {
  const catalog = SHORTCUTS.map(s => ({
    id: s.id,
    action: s.action,
    category: s.cat,
    keywords: s.tags,
    ribbon: s.ribbon
  }));

  return `You are an Excel keyboard shortcut search engine.\n\nUser query: "${query}"\n\nChoose the 1 to 5 most relevant shortcut ids from this catalog. Prefer exact user intent over keyword overlap. Understand plain English and Chinese queries.\n\nCatalog JSON:\n${JSON.stringify(catalog)}\n\nReturn only valid JSON in this exact shape: {"ids":["id1","id2"]}`;
}

function extractIds(rawText) {
  if (!rawText) return [];
  const raw = String(rawText).trim();

  const attempts = [raw];
  const objectMatch = raw.match(/\{[\s\S]*\}/);
  if (objectMatch) attempts.push(objectMatch[0]);
  const arrayMatch = raw.match(/\[[\s\S]*\]/);
  if (arrayMatch) attempts.push(arrayMatch[0]);

  for (const item of attempts) {
    try {
      const parsed = JSON.parse(item);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
      if (Array.isArray(parsed.ids)) return parsed.ids.filter(Boolean);
    } catch {}
  }
  return [];
}

async function callGemini(query) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return { ok: false, reason: "missing_api_key" };
  }

  const model = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
  const apiVersion = process.env.GEMINI_API_VERSION || "v1";
  const endpoint = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent`;

  const geminiRes = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(query) }] }],
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 160,
        responseMimeType: "application/json"
      }
    })
  });

  let data = null;
  try { data = await geminiRes.json(); } catch { data = null; }

  if (!geminiRes.ok) {
    return {
      ok: false,
      reason: "gemini_http_error",
      status: geminiRes.status,
      message: data?.error?.message || "Gemini request failed"
    };
  }

  const raw = data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("\n") || "";
  const validIds = new Set(SHORTCUTS.map(s => s.id));
  const ids = extractIds(raw).filter(id => validIds.has(id)).slice(0, 5);

  if (!ids.length) return { ok: false, reason: "no_valid_ids" };

  const results = ids
    .map(id => SHORTCUTS.find(s => s.id === id))
    .filter(Boolean)
    .map(s => ({ id: s.id, action: s.action, cat: s.cat }));

  return { ok: true, results, model };
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    return sendJson(res, 200, {
      ok: true,
      endpoint: "/api/search",
      accepts: "POST",
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
      model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
      apiVersion: process.env.GEMINI_API_VERSION || "v1"
    });
  }

  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  const { query, debug } = getBody(req);
  if (!query || String(query).trim().length < 2) {
    return sendJson(res, 400, { error: "Query too short", results: [] });
  }

  const cleanQuery = String(query).trim().slice(0, 120);

  try {
    const ai = await callGemini(cleanQuery);
    if (ai.ok) {
      return sendJson(res, 200, { ok: true, source: "gemini", model: ai.model, results: ai.results });
    }

    const fallback = localFallback(cleanQuery);
    return sendJson(res, 200, {
      ok: true,
      source: "fallback",
      reason: ai.reason,
      results: fallback,
      ...(debug ? { debug: { status: ai.status, message: ai.message } } : {})
    });
  } catch (err) {
    const fallback = localFallback(cleanQuery);
    return sendJson(res, 200, {
      ok: true,
      source: "fallback",
      reason: "exception",
      results: fallback,
      ...(debug ? { debug: { message: err.message } } : {})
    });
  }
};
