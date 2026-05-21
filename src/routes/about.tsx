import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Building2, Calendar, GraduationCap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About BIET Davangere — Ask BIET" },
      {
        name: "description",
        content:
          "Bapuji Institute of Engineering and Technology (BIET), Davangere — an autonomous engineering institution under VTU, established in 1979 by Bapuji Educational Association.",
      },
      { property: "og:title", content: "About BIET Davangere — Ask BIET" },
      {
        property: "og:description",
        content: "Learn about BIET Davangere: history, vision, accreditation and campus.",
      },
    ],
  }),
  component: AboutPage,
});

const HIGHLIGHTS = [
  { icon: Calendar, label: "Established", value: "1979" },
  { icon: Building2, label: "Type", value: "Autonomous · Under VTU" },
  { icon: Award, label: "Accreditation", value: "NAAC · NBA" },
  { icon: GraduationCap, label: "Programmes", value: "UG · PG · PhD" },
  { icon: Users, label: "Trust", value: "Bapuji Educational Association" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <header className="text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">About the institution</p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold tracking-tight">
          Bapuji Institute of Engineering & Technology
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          BIET Davangere is one of Karnataka's premier engineering institutions, founded in 1979 by the
          Bapuji Educational Association and affiliated to Visvesvaraya Technological University.
        </p>
      </header>

      {/* Hero image placeholder */}
      <div className="mt-12 aspect-[16/7] rounded-3xl border bg-secondary/50 grid place-items-center text-muted-foreground shadow-soft overflow-hidden">
        <div className="text-center">
          <Building2 className="h-10 w-10 mx-auto opacity-50" />
          <p className="mt-2 text-sm">Campus image placeholder — drop a hero image here</p>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 sm:grid-cols-5 gap-3">
        {HIGHLIGHTS.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-2xl border bg-card p-4 shadow-soft">
            <Icon className="h-4 w-4 text-brand" />
            <p className="mt-3 text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="mt-0.5 font-semibold text-sm">{value}</p>
          </div>
        ))}
      </div>

      <section className="mt-14 prose dark:prose-invert max-w-none">
        <h2>Vision</h2>
        <p>
          To be a centre of academic excellence in engineering and technology, producing globally competent
          and socially responsible professionals.
        </p>

        <h2>Mission</h2>
        <ul>
          <li>Deliver quality technical education through innovative teaching–learning practices.</li>
          <li>Promote research, entrepreneurship and lifelong learning.</li>
          <li>Inculcate ethical values, leadership and concern for society and environment.</li>
        </ul>

        <h2>Campus & facilities</h2>
        <p>
          Sprawling campus with modern laboratories, central library, hostels, sports facilities, an
          innovation centre and active student chapters of professional bodies.
        </p>
      </section>

      <div className="mt-12 rounded-3xl border bg-card p-8 sm:p-10 text-center shadow-soft">
        <h2 className="font-display text-2xl font-bold">Have a specific question?</h2>
        <p className="mt-2 text-muted-foreground">
          Ask BIET will pull the answer from the official college website.
        </p>
        <Link to="/chat" className="inline-block mt-5">
          <Button size="lg" className="h-11 px-6">Open the assistant</Button>
        </Link>
      </div>
    </div>
  );
}
