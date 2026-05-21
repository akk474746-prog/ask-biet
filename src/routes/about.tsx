import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, Award, MapPin, Calendar } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About BIET — Ask BIET" },
      { name: "description", content: "Bapuji Institute of Engineering & Technology, Davangere — a premier engineering institute committed to academic excellence and holistic student development." },
      { property: "og:title", content: "About BIET — Ask BIET" },
      { property: "og:description", content: "Learn about Bapuji Institute of Engineering & Technology, Davangere." },
    ],
  }),
  component: About,
});

const STATS = [
  { icon: Calendar, value: "1979", label: "Established" },
  { icon: GraduationCap, value: "10+", label: "Departments" },
  { icon: Award, value: "NAAC A+", label: "Accredited" },
  { icon: MapPin, value: "Davangere", label: "Karnataka" },
];

function About() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-brand font-medium">About</p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold">
          Bapuji Institute of <span className="text-gradient-brand">Engineering & Technology</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto">
          BIET is a premier engineering institution in Davangere, Karnataka, dedicated to nurturing
          innovative engineers and leaders since 1979. With a vibrant campus, accomplished faculty,
          and a strong placement record, BIET continues to shape the next generation of technologists.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STATS.map(({ icon: Icon, value, label }) => (
          <div key={label} className="glass rounded-2xl border p-6 text-center">
            <Icon className="h-5 w-5 text-brand mx-auto" />
            <div className="mt-3 font-display text-2xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="mt-16 grid md:grid-cols-2 gap-6">
        <div className="glass rounded-2xl border p-8">
          <h2 className="font-display text-2xl font-semibold">Our Vision</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            To be a center of excellence in technical education and research, producing globally
            competent engineers who contribute to society with ethics, innovation, and leadership.
          </p>
        </div>
        <div className="glass rounded-2xl border p-8">
          <h2 className="font-display text-2xl font-semibold">Our Mission</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            To provide quality engineering education through state-of-the-art infrastructure,
            industry collaboration, research opportunities, and holistic personality development.
          </p>
        </div>
      </div>

      <div className="mt-10 glass rounded-2xl border p-8">
        <h2 className="font-display text-2xl font-semibold">Programs Offered</h2>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          {[
            "Computer Science & Engineering",
            "Information Science & Engineering",
            "AI & Machine Learning",
            "Electronics & Communication",
            "Electrical & Electronics",
            "Mechanical Engineering",
            "Civil Engineering",
            "MBA",
            "MCA",
          ].map((p) => (
            <div key={p} className="rounded-lg bg-secondary/60 px-3 py-2 border border-border/40">
              {p}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
