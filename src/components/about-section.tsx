"use client"

import { Github } from "lucide-react"

export function AboutSection() {
  return (
    <section className="max-w-3xl mx-auto px-4 py-16">
      <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-900/50 p-8 md:p-10">
        <p className="text-xs uppercase tracking-wider text-emerald-400 mb-3 font-medium">
          Why I built this
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          I xeriscaped my own yard and left thousands of dollars in rebates on
          the table.
        </h2>
        <p className="text-gray-400 leading-relaxed mb-6">
          The water-conservation rebate was there — the paperwork wasn&apos;t.
          Measuring square footage, documenting plant choices, matching
          everything to my local program&apos;s approved species list, chasing
          down a landscape pro to sign off… it added up to hours I didn&apos;t
          have, so I just skipped it. Thousands of dollars, left on the table,
          because the process was more friction than I was willing to push
          through.
        </p>
        <p className="text-gray-400 leading-relaxed mb-6">
          Greenbloom is what I wish I&apos;d had: a free way to see your yard
          redesigned in whatever style you want, in seconds, without a $500
          design fee or a two-week turnaround. Today the tool handles the
          design piece. Next: rebate-eligible plant lists, documentation
          generation, and a marketplace of local contractors who can both
          build the design and sign off on the paperwork — so no one else
          leaves money on the table.
        </p>
        <p className="text-gray-400 leading-relaxed mb-6">
          Built by{" "}
          <span className="text-white font-medium">Nivedita Patil</span>. The
          redesigns use FLUX.1 Kontext [pro] via fal.ai, running on Next.js /
          Vercel with Upstash rate limiting and Cloudflare Turnstile bot
          protection. Architecture notes, prompt-engineering walkthrough, and
          full source on GitHub.
        </p>
        <a
          href="https://github.com/niveditapatil/greenbloom"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 hover:border-emerald-500 hover:bg-gray-800 text-gray-300 hover:text-white text-sm font-medium transition-colors"
        >
          <Github className="h-4 w-4" />
          View on GitHub
        </a>
      </div>
    </section>
  )
}
