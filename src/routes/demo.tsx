import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import {
  Upload, Sparkles, Loader2, FileSpreadsheet, ShieldCheck, AlertTriangle, Info, Lightbulb, Download,
} from "lucide-react";
import { DqsGauge } from "@/components/dqs-gauge";
import { SAMPLES, scoreDataset, type DatasetSample, type DqsResult } from "@/lib/dqs-mock";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Live Demo — DQS·AI" },
      { name: "description", content: "Score a sample payment dataset live: composite DQS, dimension breakdown, GenAI narrative, and prioritized remediation." },
      { property: "og:title", content: "Live Demo — DQS·AI" },
      { property: "og:description", content: "Run the universal Data Quality Score on KYC, UPI, settlement, and reporting samples." },
    ],
  }),
  component: DemoPage,
});

function DemoPage() {
  const [selected, setSelected] = useState<DatasetSample | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DqsResult | null>(null);
  const [stage, setStage] = useState(0);

  const stages = [
    "Extracting metadata fingerprints…",
    "Classifying dataset context with GenAI…",
    "Running dimension-level checks…",
    "Computing risk-weighted composite score…",
    "Generating explanations and remediation…",
  ];

  function runScan(s: DatasetSample) {
    setSelected(s);
    setResult(null);
    setAnalyzing(true);
    setStage(0);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setStage(i);
      if (i >= stages.length) {
        clearInterval(interval);
        setTimeout(() => {
          setResult(scoreDataset(s));
          setAnalyzing(false);
        }, 350);
      }
    }, 480);
  }

  return (
    <div className="container mx-auto max-w-7xl px-6 pt-16 pb-24">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="text-xs uppercase tracking-widest text-emerald font-medium">Interactive demo</div>
        <h1 className="mt-3 font-display text-5xl md:text-6xl font-bold">
          Score a dataset <span className="gradient-text-primary">in seconds.</span>
        </h1>
        <p className="mt-4 text-muted-foreground">
          Pick one of the sample payment datasets below. DQS·AI will simulate the full
          metadata-only scoring pipeline — no real data leaves your browser.
        </p>
      </div>

      {!selected && <SampleGrid onPick={runScan} />}

      {selected && (
        <div className="space-y-6">
          <SelectedHeader sample={selected} onReset={() => { setSelected(null); setResult(null); }} />

          <AnimatePresence mode="wait">
            {analyzing && <AnalyzingPanel key="loading" stages={stages} stage={stage} />}
            {result && !analyzing && <ResultPanel key="result" sample={selected} result={result} />}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function SampleGrid({ onPick }: { onPick: (s: DatasetSample) => void }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {SAMPLES.map((s) => (
          <motion.button
            key={s.id}
            whileHover={{ y: -4 }}
            onClick={() => onPick(s)}
            className="text-left glass rounded-2xl p-6 hover:bg-white/[0.06] transition-colors border-border"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet/30 to-emerald/30 border border-border flex items-center justify-center">
                  <FileSpreadsheet className="h-5 w-5 text-emerald" />
                </div>
                <div>
                  <div className="font-mono text-sm">{s.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.type}</div>
                </div>
              </div>
              <div className="text-xs font-mono text-muted-foreground">
                {s.rows.toLocaleString()} × {s.columns}
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{s.description}</p>
            <div className="mt-4 inline-flex items-center gap-2 text-xs text-violet font-medium">
              <Sparkles className="h-3.5 w-3.5" /> Run DQS scan
            </div>
          </motion.button>
        ))}
      </div>
      <div className="mt-8 glass rounded-2xl p-6 flex items-center gap-4 text-sm text-muted-foreground">
        <Upload className="h-5 w-5 text-emerald" />
        <div>
          <span className="text-foreground font-medium">Bring your own dataset</span> — in production,
          DQS·AI connects directly to Postgres, Snowflake, S3, and Kafka. The scan never reads raw values.
        </div>
      </div>
    </>
  );
}

function SelectedHeader({ sample, onReset }: { sample: DatasetSample; onReset: () => void }) {
  return (
    <div className="glass rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet/30 to-emerald/30 border border-border flex items-center justify-center">
          <FileSpreadsheet className="h-5 w-5 text-emerald" />
        </div>
        <div>
          <div className="font-mono text-sm">{sample.name}</div>
          <div className="text-xs text-muted-foreground">
            {sample.type} · {sample.rows.toLocaleString()} rows · {sample.columns} columns
          </div>
        </div>
      </div>
      <button
        onClick={onReset}
        className="rounded-full glass-strong px-4 py-2 text-sm hover:bg-white/10 transition-colors"
      >
        ← Choose another dataset
      </button>
    </div>
  );
}

function AnalyzingPanel({ stages, stage }: { stages: string[]; stage: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="glass-strong rounded-3xl p-12"
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

function ResultPanel({ sample, result }: { sample: DatasetSample; result: DqsResult }) {
  const chartData = useMemo(
    () => result.dimensions.map((d) => ({
      name: d.label.slice(0, 4),
      full: d.label,
      score: d.score,
      fill: d.score >= 80 ? "var(--emerald)" : d.score >= 60 ? "var(--violet)" : "var(--rose)",
    })),
    [result]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Top row: gauge + chart */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="glass-strong rounded-3xl p-8 flex flex-col items-center justify-center">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Composite DQS</div>
          <DqsGauge score={result.score} />
          <div className="mt-4 text-xs font-mono text-muted-foreground text-center">{sample.name}</div>
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
                  formatter={(v, _n, p) => [`${v}/100`, (p?.payload as {full:string})?.full ?? ""]}
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
        {result.dimensions.map((d) => (
          <div key={d.key} className="glass rounded-2xl p-5">
            <div className="flex items-baseline justify-between">
              <div className="font-display font-semibold">{d.label}</div>
              <div className="font-mono text-2xl tabular-nums">{d.score}</div>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className={
                d.rating === "High" ? "text-emerald" : d.rating === "Medium" ? "text-violet" : "text-rose"
              }>{d.rating}</span>
              <span className="text-muted-foreground">weight {d.weight}%</span>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet to-emerald"
                style={{ width: `${d.score}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{d.insight}</p>
          </div>
        ))}
      </div>

      {/* Narrative + flags */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 glass-strong rounded-3xl p-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-emerald mb-3">
            <Sparkles className="h-3.5 w-3.5" /> GenAI explanation
          </div>
          <p className="text-foreground/90 leading-relaxed">{result.narrative}</p>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Rows scanned" value={result.metadata.rows.toLocaleString()} />
            <Stat label="Null cells" value={result.metadata.nulls.toLocaleString()} />
            <Stat label="Duplicates" value={result.metadata.duplicates.toLocaleString()} />
            <Stat label="Stale records" value={result.metadata.staleRecords.toLocaleString()} />
          </div>
        </div>
        <div className="glass rounded-3xl p-6 space-y-3">
          <div className="text-xs uppercase tracking-widest text-violet font-medium mb-1">Risk flags</div>
          {result.riskFlags.map((f, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              {f.level === "high" ? <AlertTriangle className="h-4 w-4 text-rose shrink-0 mt-0.5" />
               : f.level === "med" ? <Info className="h-4 w-4 text-amber shrink-0 mt-0.5" />
               : <ShieldCheck className="h-4 w-4 text-emerald shrink-0 mt-0.5" />}
              <span>{f.label}</span>
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
          <button className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs hover:bg-white/10 transition-colors">
            <Download className="h-3.5 w-3.5" /> Export evidence pack
          </button>
        </div>
        <div className="space-y-3">
          {result.recommendations.map((r, i) => (
            <div key={i} className="rounded-xl bg-white/[0.03] border border-border p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
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
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-border px-4 py-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono text-lg tabular-nums">{value}</div>
    </div>
  );
}
