import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, BookOpen, Briefcase, Users, MessageSquare, ArrowRight, GraduationCap, Languages, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ask BIET — Your AI College Assistant" },
      { name: "description", content: "Instant AI answers about admissions, courses, fees, placements, faculty and events at Bapuji Institute of Engineering & Technology." },
      { property: "og:title", content: "Ask BIET — Your AI College Assistant" },
      { property: "og:description", content: "Instant AI answers about admissions, courses and campus life at BIET Davangere." },
    ],
  }),
  component: Home,
});

const FEATURES = [
  { icon: GraduationCap, title: "Admissions", desc: "Eligibility, KCET/COMEDK, and how to apply." },
  { icon: BookOpen, title: "Courses & Departments", desc: "CSE, ISE, ECE, ME, AI/ML and more." },
  { icon: Briefcase, title: "Placements", desc: "Top recruiters, packages and training." },
  { icon: Users, title: "Campus & Faculty", desc: "Hostel, clubs, events, faculty info." },
  { icon: FileText, title: "Fees & Exams", desc: "Fee guidance, exam schedule, results." },
  { icon: Languages, title: "Multilingual", desc: "Replies tuned for students and parents alike." },
];

const SUGGESTIONS = [
  "What are the admission requirements for CSE?",
  "Tell me about placements in 2024",
  "What is the fee structure for engineering?",
  "Which departments are available?",
];

function Home() {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 -left-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl animate-pulse-glow" />
          <div className="absolute top-40 -right-32 h-96 w-96 rounded-full bg-brand/40 blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
        </div>

        <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="flex flex-col items-center text-center">
            <div className="glass inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
              </span>
              Powered by Gemini AI · BIET Davangere
            </div>

            <h1 className="mt-6 font-display text-5xl sm:text-7xl font-bold tracking-tight max-w-4xl">
              The smarter way to{" "}
              <span className="text-gradient-brand">explore BIET.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Ask anything about admissions, courses, placements, fees, events or campus life — and get instant, accurate answers from your AI college assistant.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link to="/chat">
                <Button size="lg" className="bg-gradient-brand text-brand-foreground border-0 shadow-glow hover:opacity-90 h-12 px-6 text-base">
                  <Sparkles className="h-4 w-4" />
                  Start chatting
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="h-12 px-6 text-base glass">
                  About the college
                </Button>
              </Link>
            </div>

            {/* Suggestion chips */}
            <div className="mt-10 flex flex-wrap justify-center gap-2 max-w-3xl">
              {SUGGESTIONS.map((s) => (
                <Link
                  key={s}
                  to="/chat"
                  search={{ q: s }}
                  className="glass rounded-full border px-4 py-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground hover:border-brand/50 transition"
                >
                  <MessageSquare className="inline h-3 w-3 mr-1.5 -mt-0.5" />
                  {s}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl font-bold">Everything you need to know about BIET, in one place.</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Ask BIET understands the college and surfaces the right answer instantly — no more digging through PDFs or waiting for office hours.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass group rounded-2xl p-6 border hover:border-brand/40 hover:shadow-glow transition">
              <div className="h-11 w-11 rounded-xl bg-gradient-brand grid place-items-center shadow-glow group-hover:scale-110 transition">
                <Icon className="h-5 w-5 text-brand-foreground" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="glass rounded-3xl border p-10 sm:p-14 text-center shadow-soft relative overflow-hidden">
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-brand/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
          <div className="relative">
            <h2 className="font-display text-3xl sm:text-4xl font-bold">Ready when you are.</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              No sign-up. No waiting. Open the chat and ask anything about BIET.
            </p>
            <Link to="/chat" className="inline-block mt-7">
              <Button size="lg" className="bg-gradient-brand text-brand-foreground border-0 shadow-glow hover:opacity-90 h-12 px-7 text-base">
                <Sparkles className="h-4 w-4" />
                Ask BIET now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
