// Pure server-side CSV analyzer. Privacy-first: only metadata signatures.
// No raw values are returned to the client; only counts, ratios, sample column names.

export interface ColumnStats {
  name: string;
  type: "string" | "number" | "date" | "mixed" | "empty";
  total: number;
  nulls: number;
  unique: number;
  invalid: number;
  duplicateRate: number;
  completeness: number;
  uniqueness: number;
  validity: number;
}

export interface DatasetStats {
  rows: number;
  columns: number;
  columnNames: string[];
  perColumn: ColumnStats[];
  duplicateRows: number;
  // Aggregate dimension scores 0-100
  scores: {
    completeness: number;
    accuracy: number;
    consistency: number;
    timeliness: number;
    uniqueness: number;
    validity: number;
  };
  detectedType: "KYC" | "Transactions" | "Settlements" | "Reporting" | "Generic";
  riskFlags: string[];
}

// Lightweight CSV parser supporting quoted fields and commas inside quotes.
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else { field += c; }
    } else {
      if (c === '"') { inQuotes = true; }
      else if (c === ",") { cur.push(field); field = ""; }
      else if (c === "\n") { cur.push(field); rows.push(cur); cur = []; field = ""; }
      else if (c === "\r") { /* skip */ }
      else { field += c; }
    }
  }
  if (field.length > 0 || cur.length > 0) { cur.push(field); rows.push(cur); }
  return rows.filter((r) => r.length > 0 && !(r.length === 1 && r[0] === ""));
}

const PATTERNS = {
  date: /^\d{4}-\d{1,2}-\d{1,2}([ T]\d{1,2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$|^\d{1,2}\/\d{1,2}\/\d{2,4}$/,
  number: /^-?\d+(\.\d+)?$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  vpa: /^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/,
  iso4217: /^[A-Z]{3}$/,
};

function detectType(name: string, sample: string): keyof typeof PATTERNS | "string" | "number" {
  const n = name.toLowerCase();
  if (n.includes("date") || n.includes("time") || n.includes("_at") || n.includes("timestamp")) return "date";
  if (n === "email" || n.includes("email")) return "email";
  if (n.includes("ifsc")) return "ifsc";
  if (n.includes("vpa") || n.includes("upi")) return "vpa";
  if (n.includes("currency") || n === "ccy") return "iso4217";
  if (PATTERNS.number.test(sample)) return "number";
  if (PATTERNS.date.test(sample)) return "date";
  return "string";
}

function detectDatasetType(headers: string[]): DatasetStats["detectedType"] {
  const h = headers.join(" ").toLowerCase();
  if (/(pan|aadhaar|kyc|customer|address|risk_tier)/.test(h)) return "KYC";
  if (/(vpa|upi|rrn|txn|transaction|amount)/.test(h)) return "Transactions";
  if (/(settle|batch|acquirer|reconcil)/.test(h)) return "Settlements";
  if (/(aml|regulatory|report|submission)/.test(h)) return "Reporting";
  return "Generic";
}

export function analyzeCsv(text: string): DatasetStats {
  const rows = parseCsv(text);
  if (rows.length < 2) {
    throw new Error("CSV must have a header row and at least one data row.");
  }
  const headers = rows[0].map((h) => h.trim());
  const data = rows.slice(1);
  const totalRows = data.length;
  const numCols = headers.length;

  // Detect column types from first non-empty value
  const colTypes: string[] = headers.map((h, i) => {
    const sample = data.find((r) => (r[i] ?? "").trim().length > 0)?.[i]?.trim() ?? "";
    return detectType(h, sample);
  });

  const perColumn: ColumnStats[] = headers.map((name, i) => {
    let nulls = 0, invalid = 0;
    const values = new Set<string>();
    const valueCounts = new Map<string, number>();
    for (const row of data) {
      const raw = (row[i] ?? "").trim();
      if (raw === "" || raw.toLowerCase() === "null" || raw.toLowerCase() === "n/a") {
        nulls++; continue;
      }
      values.add(raw);
      valueCounts.set(raw, (valueCounts.get(raw) ?? 0) + 1);
      const t = colTypes[i];
      if (t === "number" && !PATTERNS.number.test(raw)) invalid++;
      else if (t === "date" && !PATTERNS.date.test(raw)) invalid++;
      else if (t === "email" && !PATTERNS.email.test(raw)) invalid++;
      else if (t === "ifsc" && !PATTERNS.ifsc.test(raw)) invalid++;
      else if (t === "vpa" && !PATTERNS.vpa.test(raw)) invalid++;
      else if (t === "iso4217" && !PATTERNS.iso4217.test(raw)) invalid++;
    }
    const nonNull = totalRows - nulls;
    const dupCount = nonNull - values.size;
    return {
      name,
      type: (colTypes[i] === "number" ? "number"
        : colTypes[i] === "date" ? "date"
        : nonNull === 0 ? "empty" : "string") as ColumnStats["type"],
      total: totalRows,
      nulls,
      unique: values.size,
      invalid,
      duplicateRate: nonNull > 0 ? dupCount / nonNull : 0,
      completeness: totalRows > 0 ? ((totalRows - nulls) / totalRows) * 100 : 0,
      uniqueness: nonNull > 0 ? (values.size / nonNull) * 100 : 0,
      validity: nonNull > 0 ? ((nonNull - invalid) / nonNull) * 100 : 100,
    };
  });

  // Duplicate rows by full-row hash (sampled if huge)
  const seen = new Set<string>();
  let dupRows = 0;
  for (const r of data) {
    const key = r.join("|");
    if (seen.has(key)) dupRows++;
    else seen.add(key);
  }

  // Aggregate dimension scores
  const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
  const completeness = avg(perColumn.map((c) => c.completeness));
  const validity = avg(perColumn.map((c) => c.validity));
  // Uniqueness: candidate primary keys (high uniqueness columns) + low row dup rate
  const idCols = perColumn.filter((c) => /id$|_id$|^id$|rrn|txn/.test(c.name.toLowerCase()));
  const uniqueness = idCols.length > 0
    ? Math.min(100, avg(idCols.map((c) => c.uniqueness)) * (1 - dupRows / Math.max(1, totalRows)))
    : Math.max(0, 100 - (dupRows / Math.max(1, totalRows)) * 100);

  // Consistency: are date/number columns formatted uniformly? proxied by validity of typed cols
  const typedCols = perColumn.filter((c) => c.type === "date" || c.type === "number");
  const consistency = typedCols.length > 0 ? avg(typedCols.map((c) => c.validity)) : 85;

  // Timeliness: look at most recent date column
  let timeliness = 85;
  const dateColIdx = colTypes.findIndex((t) => t === "date");
  if (dateColIdx >= 0) {
    const now = Date.now();
    let recentCount = 0, total = 0;
    const cutoff = now - 90 * 24 * 60 * 60 * 1000; // 90 days
    for (const row of data) {
      const v = (row[dateColIdx] ?? "").trim();
      if (!v) continue;
      const t = Date.parse(v);
      if (!Number.isNaN(t)) {
        total++;
        if (t >= cutoff) recentCount++;
      }
    }
    if (total > 0) timeliness = (recentCount / total) * 100;
  }

  // Accuracy: blend of validity + format conformance (proxy)
  const accuracy = validity * 0.7 + completeness * 0.3;

  const scores = {
    completeness: Math.round(completeness),
    accuracy: Math.round(accuracy),
    consistency: Math.round(consistency),
    timeliness: Math.round(timeliness),
    uniqueness: Math.round(uniqueness),
    validity: Math.round(validity),
  };

  const detectedType = detectDatasetType(headers);
  const riskFlags: string[] = [];
  if (scores.completeness < 80) riskFlags.push(`Completeness ${scores.completeness}% — below regulatory threshold`);
  if (scores.uniqueness < 80 && idCols.length > 0) riskFlags.push("Duplicate identifiers detected in primary-key columns");
  if (scores.validity < 80) riskFlags.push("Format validation failures present");
  if (dupRows > 0) riskFlags.push(`${dupRows.toLocaleString()} duplicate rows detected`);
  if (riskFlags.length === 0) riskFlags.push("No high-severity risks detected");

  return {
    rows: totalRows,
    columns: numCols,
    columnNames: headers,
    perColumn,
    duplicateRows: dupRows,
    scores,
    detectedType,
    riskFlags,
  };
}

export function compositeScore(stats: DatasetStats): number {
  const weights: Record<keyof DatasetStats["scores"], number> = (() => {
    switch (stats.detectedType) {
      case "KYC": return { completeness: 0.28, accuracy: 0.18, consistency: 0.12, timeliness: 0.1, uniqueness: 0.12, validity: 0.2 };
      case "Transactions": return { completeness: 0.18, accuracy: 0.18, consistency: 0.14, timeliness: 0.22, uniqueness: 0.16, validity: 0.12 };
      case "Settlements": return { completeness: 0.2, accuracy: 0.22, consistency: 0.2, timeliness: 0.16, uniqueness: 0.12, validity: 0.1 };
      case "Reporting": return { completeness: 0.22, accuracy: 0.18, consistency: 0.14, timeliness: 0.12, uniqueness: 0.1, validity: 0.24 };
      default: return { completeness: 0.2, accuracy: 0.18, consistency: 0.16, timeliness: 0.16, uniqueness: 0.14, validity: 0.16 };
    }
  })();
  const total = (Object.keys(weights) as (keyof typeof weights)[])
    .reduce((acc, k) => acc + stats.scores[k] * weights[k], 0);
  return Math.round(total);
}

export function dimensionWeights(detectedType: DatasetStats["detectedType"]) {
  switch (detectedType) {
    case "KYC": return { completeness: 28, accuracy: 18, consistency: 12, timeliness: 10, uniqueness: 12, validity: 20 };
    case "Transactions": return { completeness: 18, accuracy: 18, consistency: 14, timeliness: 22, uniqueness: 16, validity: 12 };
    case "Settlements": return { completeness: 20, accuracy: 22, consistency: 20, timeliness: 16, uniqueness: 12, validity: 10 };
    case "Reporting": return { completeness: 22, accuracy: 18, consistency: 14, timeliness: 12, uniqueness: 10, validity: 24 };
    default: return { completeness: 20, accuracy: 18, consistency: 16, timeliness: 16, uniqueness: 14, validity: 16 };
  }
}
