import type { Metadata } from "next"
import { Github, Linkedin } from "lucide-react"

export const metadata: Metadata = {
  title: "About · Greenbloom",
  description:
    "The story behind Greenbloom — why we're building the shortest path from a yard photo to a built, rebate-funded landscape.",
}

export default function AboutUsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 md:py-24">
      {/* -------------------------------------------------- */}
      {/*  Mission                                            */}
      {/* -------------------------------------------------- */}
      <p className="text-xs uppercase tracking-wider text-emerald-400 mb-3 font-medium">
        About Greenbloom
      </p>
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
        The shortest path from a yard photo to a built, rebate-funded landscape.
      </h1>
      <p className="text-lg text-gray-400 leading-relaxed mb-10">
        Most homeowners who want to redesign their yard get stuck in the same
        place: paying a landscape architect for designs they can&apos;t iterate
        on, drowning in paperwork for rebates they&apos;ll never claim, and
        hunting for contractors they can&apos;t evaluate. Greenbloom collapses
        those three problems into a single flow — AI handles the design,
        documentation generation handles the rebate paperwork, and a vetted
        marketplace handles the install.
      </p>

      {/* -------------------------------------------------- */}
      {/*  Origin story                                       */}
      {/* -------------------------------------------------- */}
      <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-900/50 p-8 md:p-10 mb-10">
        <p className="text-xs uppercase tracking-wider text-emerald-400 mb-3 font-medium">
          Why I built this
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          I xeriscaped my own yard and left thousands of dollars in rebates on
          the table.
        </h2>
        <p className="text-gray-400 leading-relaxed mb-5">
          The water-conservation rebate was there — the paperwork wasn&apos;t.
          Measuring square footage, documenting plant choices, matching
          everything to my local program&apos;s approved species list, chasing
          down a landscape pro to sign off… it added up to hours I didn&apos;t
          have, so I just skipped it. Thousands of dollars, left on the table,
          because the process was more friction than I was willing to push
          through.
        </p>
        <p className="text-gray-400 leading-relaxed">
          Greenbloom is what I wish I&apos;d had. Today it handles the design
          piece. Next: rebate-eligible plant lists filtered to your zip
          code, documentation generation ready to submit, and a marketplace
          of local contractors who can both build the design and sign off on
          the paperwork — so no one else leaves money on the table.
        </p>
      </div>

      {/* -------------------------------------------------- */}
      {/*  Technology                                         */}
      {/* -------------------------------------------------- */}
      <h2 className="text-2xl font-bold text-white mb-4">Under the hood</h2>
      <p className="text-gray-400 leading-relaxed mb-6">
        Image generation uses FLUX.1 Kontext [pro] via{" "}
        <a
          href="https://fal.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
        >
          fal.ai
        </a>
        , chosen for its ability to preserve structural elements of the input
        photo (the house, driveway, property lines) while completely
        re-imagining the surrounding landscape. The web app is Next.js on
        Vercel. Rate limiting runs on Upstash Redis — a per-IP cap plus a
        site-wide daily ceiling that keeps worst-case AI spend bounded.
        Cloudflare Turnstile gates the generate action against bots. Full
        source and architecture notes are on GitHub.
      </p>

      {/* -------------------------------------------------- */}
      {/*  Who built it                                       */}
      {/* -------------------------------------------------- */}
      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Who built it
      </h2>
      <p className="text-gray-400 leading-relaxed mb-6">
        Greenbloom is built by{" "}
        <span className="text-white font-medium">Nivedita Patil</span>, a
        product manager exploring the intersection of generative AI and
        everyday homeowner problems. If you&apos;re a contractor interested in
        the eventual marketplace, a water utility exploring rebate-program
        partnerships, or a homeowner with feedback on what&apos;s missing, I
        want to hear from you.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <a
          href="https://github.com/niveditapatil/greenbloom"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 hover:border-emerald-500 hover:bg-gray-800 text-gray-300 hover:text-white text-sm font-medium transition-colors"
        >
          <Github className="h-4 w-4" />
          View on GitHub
        </a>
        <a
          href="https://www.linkedin.com/in/niveditapatil/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 hover:border-emerald-500 hover:bg-gray-800 text-gray-300 hover:text-white text-sm font-medium transition-colors"
        >
          <Linkedin className="h-4 w-4" />
          Connect on LinkedIn
        </a>
      </div>
    </main>
  )
}
