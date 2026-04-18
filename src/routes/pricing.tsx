import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — DQS·AI" },
      { name: "description", content: "Subscription-based enterprise SaaS pricing for DQS·AI. Built for fintech, banks, and BFSI compliance teams." },
      { property: "og:title", content: "Pricing — DQS·AI" },
      { property: "og:description", content: "Predictable, scalable pricing for data quality scoring across payments." },
    ],
  }),
  component: PricingPage,
});

const tiers = [
  {
    name: "Starter",
    price: "$1,200",
    cadence: "/ month",
    blurb: "For analytics teams scoring a handful of datasets.",
    features: ["Up to 10 datasets", "Daily scoring runs", "Email reports", "Standard dimensions", "Community support"],
    highlight: false,
  },
  {
    name: "Growth",
    price: "$4,800",
    cadence: "/ month",
    blurb: "For fintechs and payment processors operating at scale.",
    features: ["Unlimited datasets", "Hourly scoring", "GenAI explanations", "Custom weighting", "RBAC & audit logs", "Priority support"],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "",
    blurb: "For banks and BFSI institutions with regulatory obligations.",
    features: ["Private deployment", "On-prem connectors", "Compliance evidence packs", "SLA & dedicated CSM", "SOC 2 / ISO 27001"],
    highlight: false,
  },
];

function PricingPage() {
  return (
    <div className="container mx-auto max-w-7xl px-6 pt-16 pb-24">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="text-xs uppercase tracking-widest text-emerald font-medium">Pricing</div>
        <h1 className="mt-3 font-display text-5xl md:text-6xl font-bold">
          Subscribe. Scale. <span className="gradient-text-primary">Stay compliant.</span>
        </h1>
        <p className="mt-4 text-muted-foreground">
          DQS·AI runs as B2B Enterprise SaaS — predictable monthly pricing, no upfront infra,
          designed to grow with your data estate.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={
              "rounded-3xl p-8 flex flex-col " +
              (t.highlight ? "glass-strong border-2 border-violet/40 glow-primary" : "glass")
            }
          >
            {t.highlight && (
              <div className="self-start mb-3 text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-violet/20 text-violet">
                Most popular
              </div>
            )}
            <div className="font-display text-xl font-semibold">{t.name}</div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-4xl font-bold">{t.price}</span>
              <span className="text-muted-foreground text-sm">{t.cadence}</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{t.blurb}</p>
            <ul className="mt-6 space-y-2.5 text-sm flex-1">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/contact"
              className={
                "mt-8 inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-colors " +
                (t.highlight
                  ? "bg-gradient-to-r from-violet to-emerald text-background"
                  : "glass hover:bg-white/10")
              }
            >
              {t.name === "Enterprise" ? "Talk to sales" : "Start trial"}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
