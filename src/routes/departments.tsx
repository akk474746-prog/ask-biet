import { createFileRoute, Link } from "@tanstack/react-router";
import { Cpu, Network, Radio, Zap, Cog, HardHat, FlaskConical, Brain, Calculator, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/departments")({
  head: () => ({
    meta: [
      { title: "Departments — BIET Davangere" },
      {
        name: "description",
        content:
          "Explore BIET's engineering departments: CSE, ISE, ECE, EEE, ME, CE, AI&ML, Chemistry, Mathematics and more.",
      },
      { property: "og:title", content: "Departments at BIET Davangere" },
      {
        property: "og:description",
        content: "All BIET departments — undergraduate and postgraduate programmes.",
      },
    ],
  }),
  component: DepartmentsPage,
});

const DEPARTMENTS = [
  { icon: Cpu, name: "Computer Science & Engineering", short: "CSE", level: "UG · PG · PhD" },
  { icon: Network, name: "Information Science & Engineering", short: "ISE", level: "UG · PG" },
  { icon: Brain, name: "Artificial Intelligence & Machine Learning", short: "AI & ML", level: "UG" },
  { icon: Radio, name: "Electronics & Communication Engineering", short: "ECE", level: "UG · PG · PhD" },
  { icon: Zap, name: "Electrical & Electronics Engineering", short: "EEE", level: "UG · PG" },
  { icon: Cog, name: "Mechanical Engineering", short: "ME", level: "UG · PG · PhD" },
  { icon: HardHat, name: "Civil Engineering", short: "CE", level: "UG · PG" },
  { icon: FlaskConical, name: "Chemistry", short: "CHEM", level: "Basic Sciences" },
  { icon: Calculator, name: "Mathematics", short: "MATH", level: "Basic Sciences" },
  { icon: Lightbulb, name: "Physics", short: "PHY", level: "Basic Sciences" },
];

export default function DepartmentsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <header className="text-center max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Academics</p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold tracking-tight">
          Departments
        </h1>
        <p className="mt-4 text-muted-foreground">
          BIET offers UG, PG and doctoral programmes across engineering and basic sciences. Tap any
          department to ask the assistant for syllabus, faculty or placement details.
        </p>
      </header>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {DEPARTMENTS.map(({ icon: Icon, name, short, level }) => (
          <Link
            key={short}
            to="/chat"
            search={{ q: `Tell me about the ${name} department at BIET.` }}
            className="group rounded-2xl border bg-card p-6 shadow-soft hover:shadow-glow hover:border-brand/40 transition"
          >
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl bg-secondary grid place-items-center group-hover:bg-gradient-brand transition">
                <Icon className="h-5 w-5 text-foreground group-hover:text-brand-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{short}</p>
                <h3 className="mt-0.5 font-display font-semibold leading-tight">{name}</h3>
                <p className="mt-2 text-xs text-muted-foreground">{level}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-14 rounded-3xl border bg-card p-8 text-center shadow-soft">
        <h2 className="font-display text-2xl font-bold">Want syllabus, faculty list or placements?</h2>
        <p className="mt-2 text-muted-foreground">Ask the assistant — it indexes the official BIET site.</p>
        <Link to="/chat" className="inline-block mt-5">
          <Button size="lg" className="h-11 px-6">Open Ask BIET</Button>
        </Link>
      </div>
    </div>
  );
}
