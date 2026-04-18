import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-32">
      <div className="container mx-auto max-w-7xl px-6 py-12 grid gap-8 md:grid-cols-4">
        <div>
          <div className="font-display font-bold text-lg">DQS·AI</div>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs">
            GenAI-driven, privacy-first data quality scoring for payments.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Product</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/solution" className="hover:text-foreground">Solution</Link></li>
            <li><Link to="/demo" className="hover:text-foreground">Live Demo</Link></li>
            <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Compliance</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Privacy-by-design</li>
            <li>SOC 2 ready</li>
            <li>GDPR · DPDP</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} DQS·AI · Built for BFSI and fintech
      </div>
    </footer>
  );
}
