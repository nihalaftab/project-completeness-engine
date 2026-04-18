import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Send, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — DQS·AI" },
      { name: "description", content: "Talk to the DQS·AI team about scoring your payment data quality." },
      { property: "og:title", content: "Contact — DQS·AI" },
      { property: "og:description", content: "Reach out to schedule a private demo or pilot." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <div className="container mx-auto max-w-3xl px-6 pt-16 pb-24">
      <div className="text-xs uppercase tracking-widest text-emerald font-medium">Contact</div>
      <h1 className="mt-3 font-display text-5xl font-bold">
        Let's score your <span className="gradient-text-primary">data.</span>
      </h1>
      <p className="mt-4 text-muted-foreground">
        Tell us about your dataset volume and we'll set up a private pilot.
      </p>

      <form
        onSubmit={(e) => { e.preventDefault(); setSent(true); }}
        className="mt-10 glass-strong rounded-3xl p-8 space-y-5"
      >
        {sent ? (
          <div className="flex flex-col items-center text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-emerald" />
            <h3 className="mt-4 font-display text-2xl font-semibold">Message received</h3>
            <p className="mt-2 text-sm text-muted-foreground">We'll be in touch within 24 hours.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" name="name" required />
              <Field label="Work email" name="email" type="email" required />
            </div>
            <Field label="Company" name="company" required />
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Message</label>
              <textarea
                required rows={5}
                placeholder="What datasets would you like to score?"
                className="mt-2 w-full rounded-xl bg-white/5 border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet/40 placeholder:text-muted-foreground/60"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet to-emerald px-6 py-3 text-sm font-medium text-background glow-primary"
            >
              Send message <Send className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
              <Mail className="h-3.5 w-3.5" /> Or email us at hello@dqs.ai
            </div>
          </>
        )}
      </form>
    </div>
  );
}

function Field({ label, name, type = "text", required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <input
        name={name} type={type} required={required}
        className="mt-2 w-full rounded-xl bg-white/5 border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet/40"
      />
    </div>
  );
}
