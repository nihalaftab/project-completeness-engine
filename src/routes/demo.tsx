import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "framer-motion";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import {
  Upload, Sparkles, Loader2, FileSpreadsheet, ShieldCheck, AlertTriangle, Info, Lightbulb, Download, X,
} from "lucide-react";
import { DqsGauge } from "@/components/dqs-gauge";
import { scoreDatasetFn, type ScoreResponse } from "@/server/score-dataset.functions";
import { SAMPLE_META, generateSampleCsv, type SampleId } from "@/lib/sample-csv";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Live Demo — DQS·AI" },
      { name: "description", content: "Score a real CSV dataset live: composite DQS, dimension breakdown, GenAI narrative, and prioritized remediation." },
      { property: "og:title", content: "Live Demo — DQS·AI" },
      { property: "og:description", content: "Run the universal Data Quality Score on KYC, UPI, settlement, and reporting datasets." },
    ],
  }),
  component: DemoPage,
});

const labelMap: Record<keyof ScoreResponse["scores"], string> = {
  completeness: "Completeness",
  accuracy: "Accuracy",
  consistency: "Consistency",
  timeliness: "Timeliness",
  uniqueness: "Uniqueness",
  validity: "Validity",
};

function DemoPage() {
  const scoreFn = useServerFn(scoreDatasetFn);
  const [analyzing, setAnalyzing] = useState(false);
  const [stage, setStage] = useState(0);
  const [result, setResult] = useState<ScoreResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const stages = [
    "Reading CSV and extracting metadata fingerprints…",
    "Classifying dataset context with GenAI…",
    "Running dimension-level checks…",
    "Computing risk-weighted composite score…",
    "Generating explanations and remediation…",
  ];

  const runScan = useCallback(async (csv: string, filename: string) => {
    setError(null);
    setResult(null);
    setAnalyzing(true);
    setStage(0);

    // Animate stage progression while server runs
    const interval = setInterval(() => {
      setStage((s) => Math.min(s + 1, stages.length - 1));
    }, 600);

    try {
      const res = await scoreFn({ data: { csv, filename } });
      clearInterval(interval);
      setStage(stages.length);
      setTimeout(() => {
        setResult(res);
        setAnalyzing(false);
      }, 250);
    } catch (e) {
      clearInterval(interval);
      setAnalyzing(false);
      setError(e instanceof Error ? e.message : "Failed to score dataset");
    }
  }, [scoreFn, stages.length]);

  const handleSample = (id: SampleId) => {
    const meta = SAMPLE_META.find((s) => s.id === id)!;
    const csv = generateSampleCsv(id);
    runScan(csv, meta.filename);
  };

  const handleFile = async (file: File) => {
    if (file.size > 5_000_000) {
      setError("File too large — please upload a CSV under 5 MB.");
      return;
    }
    if (!/\.csv$/i.test(file.name)) {
      setError("Please upload a .csv file.");
      return;
    }
    const text = await file.text();
    runScan(text, file.name);
  };

  const reset = () => { setResult(null); setError(null); };

  return (
    <div className="container mx-auto max-w-7xl px-6 pt-16 pb-24">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="text-xs uppercase tracking-widest text-emerald font-medium">Interactive demo · Live backend</div>
        <h1 className="mt-3 font-display text-5xl md:text-6xl font-bold">
          Score a dataset <span className="gradient-text-primary">in seconds.</span>
        </h1>
        <p className="mt-4 text-muted-foreground">
          Upload your own CSV or pick a sample below. The scan runs on our privacy-first backend —
          metadata only, never raw values — and returns a real GenAI-powered analysis.
        </p>
      </div>

      {!result && !analyzing && (
        <UploadZone
          onFile={handleFile}
          onSample={handleSample}
          fileRef={fileRef}
          drag={drag}
          setDrag={setDrag}
        />
      )}

      {error && (
        <div className="glass border-rose/40 rounded-2xl p-4 mt-6 flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-rose" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {analyzing && <AnalyzingPanel key="loading" stages={stages} stage={stage} />}
        {result && !analyzing && (
          <ResultPanel key="result" result={result} onReset={reset} />
        )}
      </AnimatePresence>
    </div>
  );
}

function UploadZone({
  onFile, onSample, fileRef, drag, setDrag,
}: {
  onFile: (f: File) => void;
  onSample: (id: SampleId) => void;
  fileRef: React.RefObject<HTMLInputElement | null>;
  drag: boolean;
  setDrag: (b: boolean) => void;
}) {
  return (
    <>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault(); setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onFile(f);
        }}
        className={
          "relative rounded-3xl p-12 text-center transition-all " +
          (drag ? "glass-strong glow-primary scale-[1.01]" : "glass")
        }
      >
        <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-violet/30 to-emerald/30 border border-border flex items-center justify-center">
          <Upload className="h-6 w-6 text-emerald" />
        </div>
        <h3 className="mt-5 font-display text-2xl font-semibold">Drop a CSV here</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          Up to 5 MB · Headers in the first row · Privacy-first metadata-only scan
        </p>
        <button
          onClick={() => fileRef.current?.click()}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet to-emerald px-6 py-3 text-sm font-medium text-background glow-primary"
        >
          Choose CSV file
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
      </div>

      <div className="mt-10">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
          Or try a synthetic sample
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {SAMPLE_META.map((s) => (
            <motion.button
              key={s.id}
              whileHover={{ y: -4 }}
              onClick={() => onSample(s.id)}
              className="text-left glass rounded-2xl p-6 hover:bg-white/[0.06] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet/30 to-emerald/30 border border-border flex items-center justify-center">
                    <FileSpreadsheet className="h-5 w-5 text-emerald" />
                  </div>
                  <div>
                    <div className="font-mono text-sm">{s.filename}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s.type}</div>
                  </div>
                </div>
                <div className="text-xs font-mono text-muted-foreground">~{s.approxRows} rows</div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{s.description}</p>
              <div className="mt-4 inline-flex items-center gap-2 text-xs text-violet font-medium">
                <Sparkles className="h-3.5 w-3.5" /> Run live DQS scan
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </>
  );
}

function AnalyzingPanel({ stages, stage }: { stages: string[]; stage: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="glass-strong rounded-3xl p-12 mt-6"
    >
      <div className="flex items-center gap-3 text-emerald">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="font-display text-xl">Analyzing dataset…</span>
      </div>
      <div className="mt-8 space-y-3">
        {stages.map((s, i) => (
          <div key={s} className="flex items-center gap-3 text-sm">
            <div className={`h-2 w-2 rounded-full ${i < stage ? "bg-emerald" : i === stage ? "bg-violet animate-pulse" : "bg-white/10"}`} />
            <span className={i <= stage ? "text-foreground" : "text-muted-foreground/50"}>{s}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ResultPanel({ result, onReset }: { result: ScoreResponse; onReset: () => void }) {
  const chartData = useMemo(
    () => (Object.keys(result.scores) as (keyof ScoreResponse["scores"])[]).map((k) => ({
      name: labelMap[k].slice(0, 4),
      full: labelMap[k],
      score: result.scores[k],
      fill: result.scores[k] >= 80 ? "var(--emerald)" : result.scores[k] >= 60 ? "var(--violet)" : "var(--rose)",
    })),
    [result]
  );

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dqs-evidence-${result.filename.replace(/\.csv$/i, "")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="space-y-6 mt-2"
    >
      {/* Header */}
      <div className="glass rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet/30 to-emerald/30 border border-border flex items-center justify-center">
            <FileSpreadsheet className="h-5 w-5 text-emerald" />
          </div>
          <div>
            <div className="font-mono text-sm">{result.filename}</div>
            <div className="text-xs text-muted-foreground">
              {result.detectedType} · {result.rows.toLocaleString()} rows · {result.columns} columns
              {result.duplicateRows > 0 && ` · ${result.duplicateRows.toLocaleString()} duplicate rows`}
            </div>
          </div>
        </div>
        <button
          onClick={onReset}
          className="rounded-full glass-strong px-4 py-2 text-sm hover:bg-white/10 transition-colors"
        >
          ← Score another dataset
        </button>
      </div>

      {/* Top row: gauge + chart */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="glass-strong rounded-3xl p-8 flex flex-col items-center justify-center">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Composite DQS</div>
          <DqsGauge score={result.composite} />
          <div className="mt-4 text-xs font-mono text-muted-foreground text-center">{result.filename}</div>
        </div>
        <div className="md:col-span-2 glass rounded-3xl p-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold">Dimension scores</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald" /> High
              <span className="h-2 w-2 rounded-full bg-violet ml-3" /> Medium
              <span className="h-2 w-2 rounded-full bg-rose ml-3" /> Low
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip
                  cursor={{ fill: "oklch(1 0 0 / 0.04)" }}
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v, _n, p) => [`${v}/100`, (p?.payload as { full: string })?.full ?? ""]}
                  labelFormatter={() => ""}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {chartData.map((c, i) => <Cell key={i} fill={c.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Dimension cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(Object.keys(result.scores) as (keyof ScoreResponse["scores"])[]).map((k) => {
          const score = result.scores[k];
          const rating = score >= 80 ? "High" : score >= 60 ? "Medium" : "Low";
          return (
            <div key={k} className="glass rounded-2xl p-5">
              <div className="flex items-baseline justify-between">
                <div className="font-display font-semibold">{labelMap[k]}</div>
                <div className="font-mono text-2xl tabular-nums">{score}</div>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className={
                  rating === "High" ? "text-emerald" : rating === "Medium" ? "text-violet" : "text-rose"
                }>{rating}</span>
                <span className="text-muted-foreground">weight {result.weights[k]}%</span>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet to-emerald"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Narrative + flags */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 glass-strong rounded-3xl p-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-emerald">
              <Sparkles className="h-3.5 w-3.5" /> GenAI explanation
            </div>
            {result.aiAvailable && (
              <span className="text-[10px] font-mono uppercase tracking-widest text-violet/80">
                google/gemini-2.5-flash
              </span>
            )}
          </div>
          <p className="text-foreground/90 leading-relaxed">{result.narrative}</p>
        </div>
        <div className="glass rounded-3xl p-6 space-y-3">
          <div className="text-xs uppercase tracking-widest text-violet font-medium mb-1">Risk flags</div>
          {result.riskFlags.map((f, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              {/threshold|duplicate|fail/i.test(f)
                ? <AlertTriangle className="h-4 w-4 text-amber shrink-0 mt-0.5" />
                : /no high/i.test(f)
                ? <ShieldCheck className="h-4 w-4 text-emerald shrink-0 mt-0.5" />
                : <Info className="h-4 w-4 text-violet shrink-0 mt-0.5" />}
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="glass-strong rounded-3xl p-8">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-emerald" />
            <h3 className="font-display text-xl font-semibold">Prioritized remediation</h3>
          </div>
          <button
            onClick={exportJson}
            className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs hover:bg-white/10 transition-colors"
          >
            <Download className="h-3.5 w-3.5" /> Export evidence pack (JSON)
          </button>
        </div>
        <div className="space-y-3">
          {result.recommendations.map((r, i) => (
            <div key={i} className="rounded-xl bg-white/[0.03] border border-border p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={
                      "text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full " +
                      (r.priority === "Critical" ? "bg-rose/15 text-rose"
                        : r.priority === "High" ? "bg-amber/15 text-amber"
                        : "bg-violet/15 text-violet")
                    }>
                      {r.priority}
                    </span>
                    <h4 className="font-display font-semibold">{r.title}</h4>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{r.detail}</p>
                </div>
                <div className="text-xs font-mono text-muted-foreground shrink-0">#{i + 1}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Column-level metadata */}
      <div className="glass rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold">Column-level metadata</h3>
          <span className="text-xs text-muted-foreground">{result.perColumn.length} columns scanned</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-widest text-muted-foreground border-b border-border">
                <th className="py-2 pr-4">Column</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4 text-right">Nulls</th>
                <th className="py-2 pr-4 text-right">Unique</th>
                <th className="py-2 pr-4 text-right">Invalid</th>
                <th className="py-2 pr-4 text-right">Completeness</th>
                <th className="py-2 text-right">Validity</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              {result.perColumn.slice(0, 20).map((c) => (
                <tr key={c.name} className="border-b border-border/40 hover:bg-white/[0.02]">
                  <td className="py-2 pr-4 text-foreground">{c.name}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{c.type}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{c.nulls}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{c.unique}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{c.invalid}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{c.completeness.toFixed(0)}%</td>
                  <td className="py-2 text-right tabular-nums">{c.validity.toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          {result.perColumn.length > 20 && (
            <div className="mt-2 text-xs text-muted-foreground">
              Showing first 20 of {result.perColumn.length} columns.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
