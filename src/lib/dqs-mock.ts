export type DimensionKey =
  | "completeness" | "accuracy" | "consistency" | "timeliness" | "uniqueness" | "validity";

export interface DimensionResult {
  key: DimensionKey;
  label: string;
  score: number;
  weight: number;
  rating: "High" | "Medium" | "Low";
  insight: string;
}

export interface DatasetSample {
  id: string;
  name: string;
  type: "KYC" | "Transactions" | "Settlements" | "Reporting";
  rows: number;
  columns: number;
  description: string;
}

export interface DqsResult {
  score: number;
  dimensions: DimensionResult[];
  narrative: string;
  recommendations: { priority: "Critical" | "High" | "Medium"; title: string; detail: string }[];
  riskFlags: { level: "high" | "med" | "low"; label: string }[];
  metadata: { rows: number; columns: number; nulls: number; duplicates: number; staleRecords: number };
}

export const SAMPLES: DatasetSample[] = [
  {
    id: "kyc",
    name: "kyc_customers_q4.csv",
    type: "KYC",
    rows: 482_910,
    columns: 38,
    description: "Customer KYC records with PAN, Aadhaar reference, address, and risk profile.",
  },
  {
    id: "txn",
    name: "upi_transactions_oct.csv",
    type: "Transactions",
    rows: 12_840_221,
    columns: 24,
    description: "UPI transactions including VPA, amount, timestamp, status, and device fingerprint.",
  },
  {
    id: "settle",
    name: "card_settlements_w43.csv",
    type: "Settlements",
    rows: 1_204_558,
    columns: 19,
    description: "Daily card settlement file from acquirer with batch IDs and reconciliation flags.",
  },
  {
    id: "report",
    name: "regulatory_aml_monthly.csv",
    type: "Reporting",
    rows: 38_117,
    columns: 42,
    description: "AML monthly regulatory submission consolidated from multiple source systems.",
  },
];

const rand = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

function rate(score: number): "High" | "Medium" | "Low" {
  return score >= 80 ? "High" : score >= 60 ? "Medium" : "Low";
}

export function scoreDataset(sample: DatasetSample): DqsResult {
  const r = rand(sample.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0));
  const base: Record<DimensionKey, number> = {
    completeness: 70 + r() * 28,
    accuracy: 55 + r() * 35,
    consistency: 50 + r() * 40,
    timeliness: 75 + r() * 22,
    uniqueness: 80 + r() * 18,
    validity: 60 + r() * 35,
  };

  // KYC heavily weights completeness & validity
  const weights: Record<DqsResult["dimensions"][number]["key"], number> = {
    completeness: sample.type === "KYC" ? 0.25 : 0.18,
    accuracy: 0.2,
    consistency: 0.15,
    timeliness: sample.type === "Transactions" ? 0.2 : 0.12,
    uniqueness: 0.1,
    validity: sample.type === "Reporting" ? 0.25 : 0.15,
  };
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  const labels: Record<DimensionKey, string> = {
    completeness: "Completeness",
    accuracy: "Accuracy",
    consistency: "Consistency",
    timeliness: "Timeliness",
    uniqueness: "Uniqueness",
    validity: "Validity",
  };

  const insights: Record<DimensionKey, (s: number) => string> = {
    completeness: (s) => s < 80 ? "Missing values in PAN and address fields impact regulatory submissions." : "All mandatory regulatory fields are present.",
    accuracy: (s) => s < 75 ? "Currency code mismatches and amount precision drift detected." : "Field values align with reference master data.",
    consistency: (s) => s < 70 ? "Status codes differ across source systems for the same transaction." : "Cross-system records reconcile cleanly.",
    timeliness: (s) => s < 80 ? "12% of records arrived after the SLA cutoff window." : "All records ingested within SLA windows.",
    uniqueness: (s) => s < 85 ? "Duplicate transaction IDs detected from retry patterns." : "Primary keys are unique across the dataset.",
    validity: (s) => s < 75 ? "Several fields fail format validation (IFSC, VPA, ISO 4217)." : "All fields conform to expected formats.",
  };

  const dimensions: DimensionResult[] = (Object.keys(base) as DimensionKey[]).map((k) => {
    const score = Math.round(base[k]);
    return {
      key: k,
      label: labels[k],
      score,
      weight: Math.round((weights[k] / totalWeight) * 100),
      rating: rate(score),
      insight: insights[k](score),
    };
  });

  const composite = Math.round(
    dimensions.reduce((acc, d) => acc + d.score * (weights[d.key] / totalWeight), 0)
  );

  const recommendations: DqsResult["recommendations"] = [];
  const sorted = [...dimensions].sort((a, b) => a.score - b.score);
  const recTemplates: Record<DimensionKey, { title: string; detail: string }> = {
    completeness: { title: "Backfill mandatory KYC fields", detail: "Run targeted enrichment on records missing PAN, address proof, and risk-tier classification before next regulatory submission." },
    accuracy: { title: "Reconcile currency & amount precision", detail: "Apply ISO 4217 normalization and align decimal precision across acquirer feeds; estimated 1.2% error reduction." },
    consistency: { title: "Unify status code mapping", detail: "Introduce a canonical transaction-status enum across UPI, card, and wallet sources to eliminate drift." },
    timeliness: { title: "Tighten SLA monitoring", detail: "Add late-arrival alerts at the ingestion layer and route delayed batches to a quarantine pipeline." },
    uniqueness: { title: "De-duplicate retry transactions", detail: "Hash (RRN + amount + timestamp window) to collapse retried records without losing audit trail." },
    validity: { title: "Schema validate at the edge", detail: "Reject records failing IFSC/VPA/ISO format checks at the gateway with structured rejection reasons." },
  };
  sorted.slice(0, 3).forEach((d, i) => {
    recommendations.push({
      priority: i === 0 ? "Critical" : i === 1 ? "High" : "Medium",
      title: recTemplates[d.key].title,
      detail: recTemplates[d.key].detail,
    });
  });

  const riskFlags = [
    composite < 70 ? { level: "high" as const, label: "Regulatory submission at risk" } : null,
    dimensions.find((d) => d.key === "completeness")!.score < 80
      ? { level: "med" as const, label: "KYC completeness below threshold" } : null,
    dimensions.find((d) => d.key === "validity")!.score < 75
      ? { level: "med" as const, label: "Format validity drift detected" } : null,
    { level: "low" as const, label: "Privacy-safe scan completed" },
  ].filter(Boolean) as DqsResult["riskFlags"];

  const narrative =
    `This ${sample.type.toLowerCase()} dataset received a composite DQS of ${composite}/100. ` +
    `The strongest dimension is ${[...dimensions].sort((a, b) => b.score - a.score)[0].label.toLowerCase()}, ` +
    `while ${sorted[0].label.toLowerCase()} is the most pressing concern and contributes the largest share of risk. ` +
    `Addressing the top three remediation actions could lift the score by an estimated ${Math.min(15, 100 - composite)} points and materially reduce regulatory exposure.`;

  return {
    score: composite,
    dimensions,
    narrative,
    recommendations,
    riskFlags,
    metadata: {
      rows: sample.rows,
      columns: sample.columns,
      nulls: Math.round(sample.rows * (1 - dimensions[0].score / 100) * 0.05),
      duplicates: Math.round(sample.rows * (1 - dimensions[4].score / 100) * 0.02),
      staleRecords: Math.round(sample.rows * (1 - dimensions[3].score / 100) * 0.03),
    },
  };
}
