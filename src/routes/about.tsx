import { createFileRoute } from "@tanstack/react-router";
import { Building2, Users2, Target } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — DQS·AI" },
      { name: "description", content: "DQS·AI builds GenAI-driven data quality infrastructure for banks, fintechs, and payment processors." },
      { property: "og:title", content: "About — DQS·AI" },
      { property: "og:description", content: "Our mission is to make payment data quality measurable, explainable, and audit-ready." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="container mx-auto max-w-5xl px-6 pt-16 pb-24">
      <div className="text-xs uppercase tracking-widest text-emerald font-medium">About</div>
      <h1 className="mt-3 font-display text-5xl md:text-6xl font-bold">
        Built for the people who <span className="gradient-text-primary">trust the data.</span>
      </h1>
      <p className="mt-6 text-lg text-muted-foreground max-w-3xl">
        Payments runs on data that powers analytics, settlements, fraud detection, and regulatory reporting —
        yet most institutions still measure quality through manual spreadsheets and tribal knowledge. DQS·AI
        was built to change that by giving every payment dataset a single, explainable, auditable score.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {[
          { icon: Target, title: "Mission", body: "Turn data quality from a manual burden into a measurable, explainable, and actionable capability." },
          { icon: Users2, title: "Who we serve", body: "Data analysts and engineers in banks, BFSI, fintechs, and payment processors — plus the compliance teams behind them." },
          { icon: Building2, title: "How we operate", body: "Privacy-first, metadata-only scanning. We score your data without ever storing the raw values." },
        ].map((c) => (
          <div key={c.title} className="glass rounded-2xl p-6">
            <c.icon className="h-6 w-6 text-emerald" />
            <div className="mt-4 font-display text-xl font-semibold">{c.title}</div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 glass-strong rounded-3xl p-10">
        <h2 className="font-display text-3xl font-bold">Impact</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-widest text-violet">Company impact</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• Eliminates ambiguity in dataset quality</li>
              <li>• Reduces manual audit effort by up to 70%</li>
              <li>• Accelerates regulatory submission cycles</li>
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-emerald">Business impact</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• Context-aware quality checks per dataset type</li>
              <li>• Risk-weighted, decision-ready scoring</li>
              <li>• Business and compliance explainability built in</li>
              <li>• Audit-friendly evidence with privacy-by-design</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
