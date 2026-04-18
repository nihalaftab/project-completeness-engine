import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { analyzeCsv, compositeScore, dimensionWeights, type DatasetStats } from "@/lib/dqs-analyzer";

const InputSchema = z.object({
  csv: z.string().min(20, "CSV is too short").max(5_000_000, "CSV exceeds 5MB limit"),
  filename: z.string().min(1).max(255).default("dataset.csv"),
});

export interface ScoreResponse {
  filename: string;
  detectedType: DatasetStats["detectedType"];
  rows: number;
  columns: number;
  duplicateRows: number;
  composite: number;
  scores: DatasetStats["scores"];
  weights: Record<keyof DatasetStats["scores"], number>;
  perColumn: DatasetStats["perColumn"];
  riskFlags: string[];
  narrative: string;
  recommendations: { priority: "Critical" | "High" | "Medium"; title: string; detail: string }[];
  aiAvailable: boolean;
}

interface AiPayload {
  narrative: string;
  recommendations: ScoreResponse["recommendations"];
}

async function callGenAi(stats: DatasetStats, composite: number): Promise<AiPayload | null> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return null;

  const summary = {
    detectedType: stats.detectedType,
    rows: stats.rows,
    columns: stats.columns,
    composite,
    scores: stats.scores,
    duplicateRows: stats.duplicateRows,
    riskFlags: stats.riskFlags,
    columns_preview: stats.perColumn.slice(0, 12).map((c) => ({
      name: c.name,
      type: c.type,
      nullsPct: Math.round((c.nulls / c.total) * 100),
      uniquenessPct: Math.round(c.uniqueness),
      validityPct: Math.round(c.validity),
    })),
  };

  const system = `You are DQS·AI, an enterprise data quality analyst for payment systems (KYC, UPI, cards, wallets, settlements, regulatory). 
You translate technical metadata into business and compliance language. 
You NEVER invent values that are not in the input. You operate strictly on the metadata summary provided. 
Return ONLY valid JSON matching this shape:
{
  "narrative": "2-4 sentence executive summary in plain language",
  "recommendations": [
    {"priority": "Critical|High|Medium", "title": "Short imperative", "detail": "1-2 sentence remediation"}
  ]
}
Provide exactly 3 recommendations sorted by priority (Critical first).`;

  const user = `Analyze this payment dataset metadata and produce the JSON.\n\nMetadata:\n${JSON.stringify(summary, null, 2)}`;

  try {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!resp.ok) {
      console.error("AI gateway error", resp.status, await resp.text().catch(() => ""));
      return null;
    }
    const json = (await resp.json()) as { choices?: { message?: { content?: string } }[] };
    const content = json.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content) as AiPayload;
    if (!parsed.narrative || !Array.isArray(parsed.recommendations)) return null;
    // sanitize
    return {
      narrative: String(parsed.narrative).slice(0, 1200),
      recommendations: parsed.recommendations.slice(0, 5).map((r) => ({
        priority: (["Critical", "High", "Medium"].includes(r.priority) ? r.priority : "Medium") as "Critical" | "High" | "Medium",
        title: String(r.title || "Improve data quality").slice(0, 120),
        detail: String(r.detail || "").slice(0, 500),
      })),
    };
  } catch (err) {
    console.error("AI call failed", err);
    return null;
  }
}

function fallbackInsights(stats: DatasetStats, composite: number): AiPayload {
  const sorted = [...Object.entries(stats.scores)].sort((a, b) => a[1] - b[1]) as [keyof DatasetStats["scores"], number][];
  const labels: Record<keyof DatasetStats["scores"], string> = {
    completeness: "Completeness", accuracy: "Accuracy", consistency: "Consistency",
    timeliness: "Timeliness", uniqueness: "Uniqueness", validity: "Validity",
  };
  const recTemplates: Record<keyof DatasetStats["scores"], { title: string; detail: string }> = {
    completeness: { title: "Backfill missing mandatory fields", detail: "Run targeted enrichment on columns with the highest null counts before the next regulatory submission." },
    accuracy: { title: "Reconcile reference master data", detail: "Apply currency, code, and amount normalization across source feeds to lift field-level accuracy." },
    consistency: { title: "Unify cross-source schemas", detail: "Introduce a canonical schema and enum mapping so the same record reads identically across systems." },
    timeliness: { title: "Tighten ingestion SLAs", detail: "Add late-arrival alerts and a quarantine pipeline for records arriving outside the freshness window." },
    uniqueness: { title: "De-duplicate primary keys", detail: "Hash composite keys (e.g., RRN + amount + window) to collapse retried records without losing the audit trail." },
    validity: { title: "Schema-validate at the edge", detail: "Reject records failing IFSC/VPA/ISO format checks at the gateway with structured rejection reasons." },
  };
  return {
    narrative: `This ${stats.detectedType.toLowerCase()} dataset received a composite DQS of ${composite}/100 across ${stats.rows.toLocaleString()} rows and ${stats.columns} columns. The strongest dimension is ${labels[sorted[sorted.length - 1][0]].toLowerCase()}, while ${labels[sorted[0][0]].toLowerCase()} is the most pressing concern. Addressing the top three remediation items below is expected to deliver the largest reduction in regulatory and operational risk.`,
    recommendations: sorted.slice(0, 3).map(([k], i) => ({
      priority: (i === 0 ? "Critical" : i === 1 ? "High" : "Medium") as "Critical" | "High" | "Medium",
      ...recTemplates[k],
    })),
  };
}

export const scoreDatasetFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<ScoreResponse> => {
    const stats = analyzeCsv(data.csv);
    const composite = compositeScore(stats);
    const ai = (await callGenAi(stats, composite)) ?? fallbackInsights(stats, composite);

    return {
      filename: data.filename,
      detectedType: stats.detectedType,
      rows: stats.rows,
      columns: stats.columns,
      duplicateRows: stats.duplicateRows,
      composite,
      scores: stats.scores,
      weights: dimensionWeights(stats.detectedType),
      perColumn: stats.perColumn,
      riskFlags: stats.riskFlags,
      narrative: ai.narrative,
      recommendations: ai.recommendations,
      aiAvailable: !!process.env.LOVABLE_API_KEY,
    };
  });
