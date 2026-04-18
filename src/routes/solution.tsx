import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Database, Eye, Brain, Calculator, Sparkles, ShieldCheck, MonitorPlay, ArrowDown } from "lucide-react";

export const Route = createFileRoute("/solution")({
  head: () => ({
    meta: [
      { title: "Solution & Architecture — DQS·AI" },
      { name: "description", content: "How DQS·AI ingests metadata, applies GenAI dimension mapping, scores six quality dimensions, and produces explainable, prioritized remediation." },
      { property: "og:title", content: "Solution & Architecture — DQS·AI" },
      { property: "og:description", content: "Privacy-first GenAI workflow from raw ingestion to explainable scoring and audit logs." },
    ],
  }),
  component: SolutionPage,
});

const stages = [
  { icon: Database, title: "Data Input Layer", sub: "Databases · Files · Streams", body: "Connects to Postgres, Snowflake, S3, Kafka, and SFTP drops. Streams or batch — schema is auto-discovered." },
  { icon: Eye, title: "Metadata Extractor", sub: "Privacy-first design", body: "Extracts statistical fingerprints, never raw PAN/Aadhaar/VPA. Sensitive values never leave the source." },
  { icon: Brain, title: "GenAI Dimension Identifier", sub: "Context-aware mapping", body: "An LLM agent classifies the dataset (KYC, transaction, settlement, AML) and selects the dimension checks that matter." },
  { icon: Calculator, title: "Scoring Engine", sub: "Hybrid rules + AI reasoning", body: "Deterministic rule checks combined with AI-judged semantic and contextual quality assessments." },
  { icon: Sparkles, title: "Composite DQS Generator", sub: "Weighted risk calculation", body: "Risk-weighted aggregation produces the 0–100 score, with regulatory-critical dimensions weighted higher." },
  { icon: MonitorPlay, title: "Explanation Agent", sub: "Actionable insights & narratives", body: "Translates technical signals into business and compliance language with prioritized remediation steps." },
  { icon: ShieldCheck, title: "Governance + Audit Layer", sub: "Immutable logs · RBAC", body: "Every score is reproducible. Tamper-evident logs, role-based dashboards, exportable evidence packs." },
];

const genaiRoles = [
  { title: "Explanation", body: "Converts technical outputs into plain-language explanations understandable by business and compliance teams." },
  { title: "Insights", body: "Interprets quality issues in regulatory and operational context — not raw metrics — highlighting impact on analytics reliability." },
  { title: "Recommendations", body: "Generates prioritized, actionable remediation guidance with a fix order designed to reduce risk fastest." },
];

function SolutionPage() {
  return (
    <div>
      <section className="container mx-auto max-w-7xl px-6 pt-20 pb-12 text-center">
        <div className="text-xs uppercase tracking-widest text-emerald font-medium">Solution & architecture</div>
        <h1 className="mt-3 font-display text-5xl md:text-6xl font-bold">
          From raw data to <span className="gradient-text-primary">decision-ready insight.</span>
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
          A seven-stage workflow that scores any payment dataset in seconds — without ever
          touching the sensitive values inside it.
        </p>
      </section>

      <section className="container mx-auto max-w-5xl px-6 py-12">
        <div className="space-y-6">
          {stages.map((s, i) => (
            <div key={s.title}>
              <motion.div
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-6 flex items-start gap-5"
              >
                <div className="h-14 w-14 shrink-0 rounded-xl bg-gradient-to-br from-violet/30 to-emerald/30 border border-border flex items-center justify-center">
                  <s.icon className="h-6 w-6 text-emerald" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-display text-xl font-semibold">{s.title}</h3>
                    <div className="text-xs font-mono text-violet uppercase tracking-wider">{s.sub}</div>
                  </div>
                  <p className="mt-2 text-muted-foreground">{s.body}</p>
                </div>
                <div className="hidden md:flex h-8 w-8 rounded-full bg-white/5 items-center justify-center text-xs font-mono text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </div>
              </motion.div>
              {i < stages.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown className="h-4 w-4 text-muted-foreground/40" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-6 py-24">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-widest text-violet font-medium">Role of GenAI</div>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold">
            Three jobs. One agent.
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {genaiRoles.map((r) => (
            <div key={r.title} className="glass rounded-2xl p-8">
              <div className="text-emerald font-mono text-xs uppercase tracking-widest">{r.title}</div>
              <p className="mt-4 text-foreground/90 leading-relaxed">{r.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
