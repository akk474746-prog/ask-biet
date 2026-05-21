import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  BookOpen,
  Briefcase,
  Users,
  ArrowRight,
  GraduationCap,
  Mic,
  Send,
  Bot,
  Image as ImageIcon,
  ShieldCheck,
  FileText,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ask BIET — Official AI Assistant for BIET Davangere" },
      {
        name: "description",
        content:
          "Ask BIET is the official AI assistant for Bapuji Institute of Engineering & Technology, Davangere. Get instant, verified answers about admissions, departments, placements, fees and campus from the official BIET website.",
      },
      { property: "og:title", content: "Ask BIET — Official AI Assistant" },
      {
        property: "og:description",
        content:
          "Instant, accurate answers about BIET Davangere, powered by the college's official website.",
      },
    ],
  }),
  component: Home,
});

const SUGGESTIONS = [
  "What are the admission requirements for CSE at BIET?",
  "Tell me about recent placements at BIET.",
  "Which departments and courses does BIET offer?",
  "How do I contact the BIET admissions office?",
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Only official BIET data",
    desc: "Every answer is grounded in content from bietdvg.edu — no guesses, no outside facts.",
  },
  {
    icon: GraduationCap,
    title: "Admissions, fees & courses",
    desc: "KCET/COMEDK guidance, programme details, eligibility and fee structure at a glance.",
  },
  {
    icon: Briefcase,
    title: "Placements & training",
    desc: "Recruiters, packages, training programmes and placement records.",
  },
  {
    icon: BookOpen,
    title: "Syllabus & departments",
    desc: "Department overviews, faculty pages, syllabus and research highlights.",
  },
  {
    icon: Users,
    title: "Campus & student life",
    desc: "Hostel, clubs, events, sports and facilities across the BIET campus.",
  },
  {
    icon: FileText,
    title: "Notices & circulars",
    desc: "PDFs, announcements and circulars from the official website, made searchable.",
  },
];

const STATS = [
  { value: "1979", label: "Established" },
  { value: "10+", label: "Departments" },
  { value: "UG · PG · PhD", label: "Programmes" },
  { value: "NAAC · NBA", label: "Accredited" },
];

function Home() {
  return (
    <div className="bg-background">
      {/* ============== HERO ============== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[520px] w-[1100px] rounded-full bg-brand/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground shadow-soft">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
                </span>
                Official BIET AI Assistant
              </span>

              <h1 className="mt-6 font-display text-4xl sm:text-6xl font-bold tracking-tight leading-[1.05]">
                Everything about{" "}
                <span className="text-gradient-brand">BIET Davangere</span>,
                <br className="hidden sm:block" /> answered instantly.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                Ask BIET is an AI assistant trained <strong>only</strong> on the official Bapuji
                Institute of Engineering & Technology website. Get accurate answers on admissions,
                departments, placements, fees and campus — without digging through PDFs.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/chat">
                  <Button size="lg" className="h-12 px-6 text-base shadow-soft">
                    <Sparkles className="h-4 w-4" />
                    Ask the assistant
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/departments">
                  <Button size="lg" variant="outline" className="h-12 px-6 text-base">
                    Browse departments
                  </Button>
                </Link>
              </div>

              <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg">
                {STATS.map((s) => (
                  <div key={s.label} className="rounded-xl border bg-card p-3 shadow-soft">
                    <p className="font-display font-bold text-base">{s.value}</p>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat preview card */}
            <ChatPreview />
          </div>
        </div>
      </section>

      {/* ============== SUGGESTIONS ============== */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground text-center">
          Popular questions
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
          {SUGGESTIONS.map((s) => (
            <Link
              key={s}
              to="/chat"
              search={{ q: s }}
              className="rounded-full border bg-card px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-brand/40 hover:shadow-soft transition"
            >
              {s}
            </Link>
          ))}
        </div>
      </section>

      {/* ============== CAMPUS GALLERY (placeholders) ============== */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Campus</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold">A glimpse of BIET</h2>
          <p className="mt-3 text-muted-foreground">
            Replace these tiles with real photos of the BIET campus, labs and events.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {["Main building", "Library", "Labs", "Auditorium", "Hostel", "Sports", "Events", "Innovation centre"].map(
            (label, i) => (
              <div
                key={label}
                className={`rounded-2xl border bg-secondary/40 shadow-soft overflow-hidden hover:shadow-glow hover:-translate-y-1 transition group ${
                  i === 0 || i === 5 ? "lg:row-span-2 aspect-square lg:aspect-auto" : "aspect-[4/3]"
                }`}
              >
                <div className="h-full w-full grid place-items-center text-muted-foreground">
                  <div className="text-center px-4">
                    <ImageIcon className="h-7 w-7 mx-auto opacity-40 group-hover:opacity-60 transition" />
                    <p className="mt-2 text-xs font-medium">{label}</p>
                    <p className="text-[10px] text-muted-foreground/70">Image placeholder</p>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </section>

      {/* ============== FEATURES ============== */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">What it can do</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold">
            Built for students, parents & visitors.
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border bg-card p-6 shadow-soft hover:shadow-glow hover:-translate-y-0.5 transition"
            >
              <div className="h-11 w-11 rounded-xl bg-secondary grid place-items-center">
                <Icon className="h-5 w-5 text-brand" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============== CTA ============== */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="rounded-3xl border bg-card p-10 sm:p-14 text-center shadow-soft relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand/15 blur-3xl" />
          <div className="relative">
            <Building2 className="h-8 w-8 mx-auto text-brand" />
            <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold">
              Have a question about BIET?
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              The assistant is ready 24/7 and only uses data from the official BIET website.
            </p>
            <Link to="/chat" className="inline-block mt-7">
              <Button size="lg" className="h-12 px-7 text-base">
                <Sparkles className="h-4 w-4" />
                Open Ask BIET
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ChatPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 bg-gradient-brand opacity-10 blur-2xl rounded-3xl" />
      <div className="relative rounded-3xl border bg-card shadow-soft overflow-hidden">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <div className="h-2.5 w-2.5 rounded-full bg-destructive/50" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
          <p className="ml-3 text-xs text-muted-foreground font-medium">Ask BIET</p>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex justify-end">
            <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary text-primary-foreground px-3.5 py-2 text-sm">
              What's the eligibility for CSE at BIET?
            </div>
          </div>
          <div className="flex gap-2.5">
            <div className="h-7 w-7 shrink-0 rounded-lg bg-gradient-brand grid place-items-center shadow-soft">
              <Bot className="h-3.5 w-3.5 text-brand-foreground" />
            </div>
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm border bg-secondary/60 px-3.5 py-2.5 text-sm leading-relaxed">
              <p>
                For B.E. in Computer Science at BIET Davangere, candidates need a valid{" "}
                <strong>KCET</strong> or <strong>COMEDK</strong> rank with 10+2 (PCM).
              </p>
              <p className="mt-2 text-xs text-muted-foreground">Source: bietdvg.edu/admissions</p>
            </div>
          </div>
          <div className="flex gap-2.5">
            <div className="h-7 w-7 shrink-0 rounded-lg bg-gradient-brand grid place-items-center shadow-soft">
              <Bot className="h-3.5 w-3.5 text-brand-foreground" />
            </div>
            <div className="rounded-2xl rounded-tl-sm border bg-secondary/60 px-3.5 py-2.5 text-sm inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce" style={{ animationDelay: "0.15s" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce" style={{ animationDelay: "0.3s" }} />
            </div>
          </div>
        </div>

        <div className="border-t p-3 flex items-center gap-2">
          <div className="flex-1 rounded-xl border bg-background px-3.5 py-2.5 text-sm text-muted-foreground">
            Ask about admissions, fees, placements…
          </div>
          <Button size="icon-sm" variant="outline" aria-label="Voice">
            <Mic className="h-4 w-4" />
          </Button>
          <Button size="icon-sm" aria-label="Send">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
