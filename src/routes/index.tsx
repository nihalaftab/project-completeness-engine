import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Shield, Sparkles, Gauge, Layers, Lock, Brain, ArrowRight,
  CheckCircle2, AlertTriangle, FileWarning, Activity, Database,
} from "lucide-react";
import { DqsGauge } from "@/components/dqs-gauge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DQS·AI — Universal Data Quality Score for Payments" },
      { name: "description", content: "GenAI-driven, privacy-first data quality scoring for KYC, UPI, card, wallet, and regulatory datasets. Explainable. Decision-ready." },
      { property: "og:title", content: "DQS·AI — Universal Data Quality Score for Payments" },
      { property: "og:description", content: "Turn data quality into a measurable, explainable, audit-ready capability." },
    ],
  }),
  component: HomePage,
});

const dimensions = [
  { icon: CheckCircle2, label: "Completeness", color: "text-emerald" },
  { icon: Activity, label: "Accuracy", color: "text-violet" },
  { icon: Layers, label: "Consistency", color: "text-amber" },
  { icon: Gauge, label: "Timeliness", color: "text-emerald" },
  { icon: Database, label: "Uniqueness", color: "text-violet" },
  { icon: FileWarning, label: "Validity", color: "text-amber" },
];

const features = [
  { icon: Brain, title: "Context-aware GenAI", body: "Tailors quality checks to dataset type — KYC, transactions, settlements, or reporting — with intelligent, regulation-aware weighting." },
  { icon: Lock, title: "Privacy by design", body: "Operates on metadata signatures, never raw PAN, Aadhaar, VPA or card numbers. Nothing sensitive ever leaves your perimeter." },
  { icon: Sparkles, title: "Plain-language explainability", body: "Translates dimension drift into business and compliance narratives a CFO or DPO can act on — not just dashboards engineers understand." },
  { icon: Shield, title: "Audit-friendly governance", body: "Immutable scoring logs, role-based access, and dimension-level evidence trails — built for SOC 2, RBI, PCI-DSS reviews." },
];

function HomePage() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="container relative mx-auto max-w-7xl px-6 pt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse" />
              GenAI-driven · Privacy-first · BFSI-ready
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight">
              The universal{" "}
              <span className="gradient-text-primary">data quality score</span>
              <br /> built for payments.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
              DQS·AI evaluates KYC, UPI, card, wallet and regulatory datasets and produces a single,
              explainable score from 0–100 — with dimension-level insights and prioritized remediation
              guidance your business and compliance teams can actually act on.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/demo"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet to-emerald px-6 py-3 text-sm font-medium text-background glow-primary"
              >
                Launch interactive demo
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/solution"
                className="inline-flex items-center gap-2 rounded-full glass-strong px-6 py-3 text-sm font-medium hover:bg-white/10 transition-colors"
              >
                How it works
              </Link>
            </div>
          </motion.div>

          {/* Hero card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-16 grid gap-6 md:grid-cols-3"
          >
            <div className="md:col-span-1 glass-strong rounded-3xl p-8 flex flex-col items-center justify-center text-center">
              <DqsGauge score={82} />
              <div className="mt-4 text-xs text-muted-foreground font-mono">
                upi_transactions_oct.csv
              </div>
            </div>
            <div className="md:col-span-2 glass rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">Dimension breakdown</div>
                  <div className="font-display text-xl font-semibold mt-1">Six dimensions, one score</div>
                </div>
                <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-emerald" /> High
                  <span className="h-2 w-2 rounded-full bg-amber ml-3" /> Medium
                  <span className="h-2 w-2 rounded-full bg-rose ml-3" /> Low
                </div>
              </div>
              <div className="grid gap-3">
                {[
                  { label: "Completeness", v: 85, c: "from-emerald to-emerald" },
                  { label: "Accuracy", v: 72, c: "from-violet to-emerald" },
                  { label: "Consistency", v: 64, c: "from-amber to-violet" },
                  { label: "Timeliness", v: 95, c: "from-emerald to-emerald" },
                  { label: "Uniqueness", v: 88, c: "from-emerald to-violet" },
                  { label: "Validity", v: 78, c: "from-violet to-emerald" },
                ].map((d, i) => (
                  <div key={d.label} className="grid grid-cols-[140px_1fr_40px] items-center gap-4">
                    <div className="text-sm text-muted-foreground">{d.label}</div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${d.v}%` }}
                        transition={{ duration: 1, delay: 0.5 + i * 0.08 }}
                        className={`h-full bg-gradient-to-r ${d.c}`}
                      />
                    </div>
                    <div className="text-sm font-mono tabular-nums text-right">{d.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="container mx-auto max-w-7xl px-6 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <div className="text-xs uppercase tracking-widest text-violet font-medium">The problem</div>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold">
              Payments runs on data nobody fully trusts.
            </h2>
            <p className="mt-5 text-muted-foreground text-lg leading-relaxed">
              Banks and fintechs process billions of transactions across cards, UPI, wallets and bank
              transfers. Yet there is no universal, objective way to measure how reliable that data
              actually is — leading to manual audits, regulatory exposure, and decisions made on
              shaky ground.
            </p>
          </div>
          <div className="grid gap-3">
            {[
              "No single quality score decision-makers can trust",
              "Outputs are technical and hard to explain to compliance",
              "Existing tooling focuses on fraud — not data quality",
              "No GenAI-based reasoning or business-friendly narrative",
              "High manual effort during audits and submissions",
            ].map((p) => (
              <div key={p} className="glass rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber shrink-0 mt-0.5" />
                <div className="text-sm">{p}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIMENSIONS */}
      <section className="container mx-auto max-w-7xl px-6 py-24">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-widest text-emerald font-medium">Six dimensions</div>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold">
            One score. Full evidence.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Every DQS is computed from six standardized dimensions — risk-weighted by dataset type
            so KYC completeness counts more than uniqueness in a regulatory submission.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dimensions.map((d, i) => (
            <motion.div
              key={d.label}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-6 hover:bg-white/[0.06] transition-colors group"
            >
              <d.icon className={`h-6 w-6 ${d.color} group-hover:scale-110 transition-transform`} />
              <div className="mt-4 font-display text-xl font-semibold">{d.label}</div>
              <div className="mt-2 text-sm text-muted-foreground">
                Risk-weighted, context-aware checks tailored to your dataset type.
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="container mx-auto max-w-7xl px-6 py-24">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-widest text-violet font-medium">Why DQS·AI</div>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold">
            Decision-ready. By design.
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="glass rounded-2xl p-8">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet/20 to-emerald/20 flex items-center justify-center border border-border">
                <f.icon className="h-6 w-6 text-emerald" />
              </div>
              <h3 className="mt-5 font-display text-2xl font-semibold">{f.title}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto max-w-7xl px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl glass-strong p-12 md:p-16 text-center">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-violet/30 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald/30 blur-3xl" />
          <div className="relative">
            <h2 className="font-display text-4xl md:text-5xl font-bold max-w-2xl mx-auto">
              See your data score itself.
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Run the live demo on a sample payment dataset and walk through dimension scoring,
              GenAI explanations, and prioritized remediation in under 30 seconds.
            </p>
            <Link
              to="/demo"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet to-emerald px-7 py-3.5 text-sm font-medium text-background glow-primary"
            >
              Launch the demo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
