import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin, Globe } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Ask BIET" },
      { name: "description", content: "Get in touch with Bapuji Institute of Engineering & Technology, Davangere — address, phone, email and admissions office." },
      { property: "og:title", content: "Contact — Ask BIET" },
      { property: "og:description", content: "Contact details for BIET Davangere." },
    ],
  }),
  component: Contact,
});

const ITEMS = [
  { icon: MapPin, label: "Address", value: "Bapuji Institute of Engineering & Technology, Shamanur Road, Davangere – 577004, Karnataka, India" },
  { icon: Phone, label: "Phone", value: "+91 8192 233 1722" },
  { icon: Mail, label: "Email", value: "principal@bietdvg.edu" },
  { icon: Globe, label: "Website", value: "bietdvg.edu" },
];

function Contact() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-brand font-medium">Contact</p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold">
          Let's <span className="text-gradient-brand">connect.</span>
        </h1>
        <p className="mt-5 text-muted-foreground max-w-xl mx-auto">
          Reach out to the admissions office, visit the campus, or simply ask the AI — we're here to help.
        </p>
      </div>

      <div className="mt-14 grid sm:grid-cols-2 gap-4">
        {ITEMS.map(({ icon: Icon, label, value }) => (
          <div key={label} className="glass rounded-2xl border p-6 flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-brand grid place-items-center shadow-glow shrink-0">
              <Icon className="h-4 w-4 text-brand-foreground" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
              <div className="mt-1 text-sm font-medium leading-relaxed">{value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 glass rounded-2xl border p-8 text-center">
        <h2 className="font-display text-xl font-semibold">Have a quick question?</h2>
        <p className="mt-2 text-sm text-muted-foreground">Skip the wait — ask the AI assistant 24/7.</p>
        <a
          href="/chat"
          className="mt-5 inline-flex items-center justify-center rounded-lg bg-gradient-brand px-5 py-2.5 text-sm font-medium text-brand-foreground shadow-glow hover:opacity-90"
        >
          Open Ask BIET
        </a>
      </div>
    </div>
  );
}
