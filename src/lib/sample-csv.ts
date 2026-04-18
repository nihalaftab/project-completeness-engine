// Realistic-looking, fully synthetic CSVs used by the demo "sample" buttons.
// These are generated client-side and sent to the server function — no real PII anywhere.

function rng(seed: number) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

function pick<T>(arr: T[], r: () => number) { return arr[Math.floor(r() * arr.length)]; }

export type SampleId = "kyc" | "txn" | "settle" | "report";

export interface SampleMeta {
  id: SampleId;
  filename: string;
  label: string;
  type: "KYC" | "Transactions" | "Settlements" | "Reporting";
  description: string;
  approxRows: number;
}

export const SAMPLE_META: SampleMeta[] = [
  { id: "kyc", filename: "kyc_customers_sample.csv", label: "KYC Customers", type: "KYC",
    description: "Synthetic KYC records with PAN reference, address, and risk tier — includes deliberate quality issues.", approxRows: 800 },
  { id: "txn", filename: "upi_transactions_sample.csv", label: "UPI Transactions", type: "Transactions",
    description: "Synthetic UPI transactions with VPA, RRN, amount, currency, and status — includes retries and SLA breaches.", approxRows: 1200 },
  { id: "settle", filename: "card_settlements_sample.csv", label: "Card Settlements", type: "Settlements",
    description: "Synthetic acquirer settlement file with batch IDs and reconciliation flags.", approxRows: 600 },
  { id: "report", filename: "regulatory_aml_sample.csv", label: "Regulatory AML", type: "Reporting",
    description: "Synthetic AML monthly submission consolidating multiple sources.", approxRows: 400 },
];

export function generateSampleCsv(id: SampleId): string {
  const r = rng(id.split("").reduce((a, c) => a + c.charCodeAt(0), 0));
  switch (id) {
    case "kyc": return generateKyc(r);
    case "txn": return generateTxn(r);
    case "settle": return generateSettle(r);
    case "report": return generateReport(r);
  }
}

function maybeBlank(value: string, r: () => number, p = 0.08) {
  return r() < p ? "" : value;
}

function generateKyc(r: () => number) {
  const headers = ["customer_id", "pan_ref", "full_name_hash", "email", "address_line", "city", "risk_tier", "kyc_date", "ifsc"];
  const cities = ["MUMBAI", "DELHI", "BLR", "CHENNAI", "PUNE", "HYD"];
  const tiers = ["LOW", "MED", "HIGH"];
  const out = [headers.join(",")];
  for (let i = 0; i < 800; i++) {
    const id = `CUST${100000 + i}`;
    const pan = `XXXXX${1000 + Math.floor(r() * 9000)}X`;
    const name = `H${Math.floor(r() * 1e10).toString(16)}`;
    const email = r() < 0.07 ? "not-an-email" : `user${i}@example.com`;
    const addr = `Block ${Math.floor(r() * 50)}`;
    const city = pick(cities, r);
    const tier = pick(tiers, r);
    const date = `2025-${String(1 + Math.floor(r() * 10)).padStart(2, "0")}-${String(1 + Math.floor(r() * 28)).padStart(2, "0")}`;
    const ifsc = r() < 0.06 ? "BADIFSC" : `HDFC0${100000 + Math.floor(r() * 900000)}`;
    out.push([
      id,
      maybeBlank(pan, r, 0.05),
      name,
      maybeBlank(email, r, 0.04),
      maybeBlank(addr, r, 0.12),
      city,
      maybeBlank(tier, r, 0.06),
      date,
      ifsc,
    ].join(","));
    if (r() < 0.02) out.push(out[out.length - 1]); // dup row
  }
  return out.join("\n");
}

function generateTxn(r: () => number) {
  const headers = ["txn_id", "rrn", "vpa", "amount", "currency", "status", "txn_timestamp", "device_id"];
  const statuses = ["SUCCESS", "FAILED", "PENDING", "success", "failed"]; // intentional case drift
  const ccy = ["INR", "USD", "INR", "INR", "EUR", "INR"];
  const out = [headers.join(",")];
  for (let i = 0; i < 1200; i++) {
    const id = `TXN${1_000_000 + i}`;
    const rrn = `${100000000000 + Math.floor(r() * 9e11)}`;
    const vpa = r() < 0.05 ? "bad-vpa" : `user${i}@upi`;
    const amount = (r() * 5000 + 10).toFixed(2);
    const c = pick(ccy, r);
    const status = pick(statuses, r);
    const daysAgo = Math.floor(r() * 200);
    const ts = new Date(Date.now() - daysAgo * 86400000).toISOString();
    const device = `DV${Math.floor(r() * 1e6)}`;
    out.push([
      id,
      maybeBlank(rrn, r, 0.03),
      vpa,
      r() < 0.03 ? "abc" : amount,
      c,
      status,
      ts,
      maybeBlank(device, r, 0.1),
    ].join(","));
    if (r() < 0.04) out.push(out[out.length - 1]); // duplicate retry
  }
  return out.join("\n");
}

function generateSettle(r: () => number) {
  const headers = ["batch_id", "settlement_id", "merchant_id", "gross_amount", "fee", "net_amount", "settle_date", "status"];
  const out = [headers.join(",")];
  for (let i = 0; i < 600; i++) {
    const batch = `B${100 + Math.floor(i / 50)}`;
    const settle = `S${500000 + i}`;
    const m = `M${1000 + Math.floor(r() * 200)}`;
    const gross = (r() * 100000 + 100).toFixed(2);
    const fee = (parseFloat(gross) * 0.02).toFixed(2);
    const net = (parseFloat(gross) - parseFloat(fee)).toFixed(2);
    const d = `2025-10-${String(1 + Math.floor(r() * 28)).padStart(2, "0")}`;
    const status = r() < 0.04 ? "" : pick(["SETTLED", "PENDING", "REJECTED"], r);
    out.push([batch, settle, m, gross, maybeBlank(fee, r, 0.06), net, d, status].join(","));
  }
  return out.join("\n");
}

function generateReport(r: () => number) {
  const headers = ["report_id", "submission_date", "customer_id", "txn_count", "aggregate_amount", "currency", "risk_flag", "branch_code"];
  const out = [headers.join(",")];
  for (let i = 0; i < 400; i++) {
    const id = `RPT${20000 + i}`;
    const d = `2025-${String(1 + Math.floor(r() * 12)).padStart(2, "0")}-15`;
    const cust = `CUST${100000 + Math.floor(r() * 800)}`;
    const cnt = String(Math.floor(r() * 200));
    const agg = (r() * 1e6).toFixed(2);
    const c = pick(["INR", "USD"], r);
    const risk = pick(["LOW", "MED", "HIGH"], r);
    const branch = `BR${1000 + Math.floor(r() * 200)}`;
    out.push([
      id,
      d,
      cust,
      cnt,
      maybeBlank(agg, r, 0.07),
      c,
      maybeBlank(risk, r, 0.08),
      branch,
    ].join(","));
  }
  return out.join("\n");
}
