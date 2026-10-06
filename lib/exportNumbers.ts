/**
 * Download builders for the Document Number Extractor.
 *
 * - Filenames concatenate date + time (document-numbers-YYYY-MM-DD_HH-MM-SS.csv)
 *   so repeated exports never overwrite each other.
 * - File contents are a clean table (header row + one row per number).
 * - The "Excel" export is SpreadsheetML 2003 (.xls), which Excel and
 *   LibreOffice open natively — no library needed.
 */

export type ExportFormat = "csv" | "xls";

/** Filename-safe stamp: 2026-10-06_14-32-05 */
export function formatTimestamp(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}`;
}

/** Readable stamp for inside the file: 2026-10-06 14:32:05 */
export function formatTimestampDisplay(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function csvEscape(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export function buildCsvExport(numbers: string[], exportedAt: Date): string {
  // Clean table only — the site header/footer live on the tool pages, and the
  // timestamp lives in the filename.
  const lines: string[] = ["Phone"];
  numbers.forEach((n) => lines.push(csvEscape(n)));
  return lines.join("\n") + "\n";
}

function xmlEscape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function xmlRow(cells: string[]): string {
  return `<Row>${cells
    .map((c) => `<Cell><Data ss:Type="String">${xmlEscape(c)}</Data></Cell>`)
    .join("")}</Row>`;
}

export function buildExcelExport(numbers: string[], exportedAt: Date): string {
  // Clean table only — the site header/footer live on the tool pages, and the
  // timestamp lives in the filename.
  const rows: string[] = [];
  rows.push(xmlRow(["Phone"]));
  numbers.forEach((n) => {
    rows.push(`<Row><Cell><Data ss:Type="String">${xmlEscape(n)}</Data></Cell></Row>`);
  });
  return [
    `<?xml version="1.0"?>`,
    `<?mso-application progid="Excel.Sheet"?>`,
    `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">`,
    ` <Worksheet ss:Name="Phone numbers">`,
    `  <Table>`,
    `   ${rows.join("\n   ")}`,
    `  </Table>`,
    ` </Worksheet>`,
    `</Workbook>`,
    ``,
  ].join("\n");
}

/**
 * Builds the file for `format`, triggers the browser download and returns the
 * generated filename (empty string when there is nothing to export).
 */
export function exportNumbers(format: ExportFormat, numbers: string[]): string {
  if (typeof window === "undefined" || numbers.length === 0) return "";
  const exportedAt = new Date();
  const stamp = formatTimestamp(exportedAt);
  const content =
    format === "csv" ? buildCsvExport(numbers, exportedAt) : buildExcelExport(numbers, exportedAt);
  const mime = format === "csv" ? "text/csv;charset=utf-8" : "application/vnd.ms-excel";
  const filename = `document-numbers-${stamp}.${format}`;

  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return filename;
}
