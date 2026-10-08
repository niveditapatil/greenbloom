import type { Metadata } from "next"
import { Github, Linkedin } from "lucide-react"

export const metadata: Metadata = {
  title: "About · Greenbloom",
  description:
    "Greenbloom is an AI landscape-redesign tool. Upload a yard photo, pick a style, see what's possible.",
}

export default function AboutUsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 md:py-24">
      {/* -------------------------------------------------- */}
      {/*  About                                              */}
      {/* -------------------------------------------------- */}
      <p className="text-xs uppercase tracking-wider text-emerald-400 mb-3 font-medium">
        About Greenbloom
      </p>
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
        An AI landscape-redesign tool built end-to-end.
      </h1>
      <p className="text-lg text-gray-400 leading-relaxed mb-6">
        Upload a photo of your yard, pick a style, and get back a
        photorealistic redesign in roughly 15 seconds. The house stays faithful
        to the input; the landscape around it transforms.
      </p>
      <p className="text-lg text-gray-400 leading-relaxed mb-5">
        My yard was a mess. Overgrown, inherited, no idea what I wanted it
        to become. Hiring a designer meant first figuring out what to even
        ask for — and I didn&apos;t know the vocabulary. Was I going for
        xeriscape? Mediterranean? Modern minimalist? I&apos;d never thought
        about my yard in those terms. Weeks of Pinterest and Houzz got me
        to the point where I could at least name the categories, and even
        then, a wall of fragments doesn&apos;t translate into a coherent
        picture.
      </p>
      <p className="text-lg text-gray-400 leading-relaxed mb-5">
        Along the way I noticed something: most landscaped yards, even the
        expensive ones, end up looking surprisingly similar. Not because the
        designers are bad — because clients can&apos;t articulate what
        unique would look like on their lot. My own yard still gets stopped
        by neighbors asking how I did it. The gap isn&apos;t taste or
        budget. It&apos;s having a clear enough vision to brief with.
      </p>
      <p className="text-lg text-gray-400 leading-relaxed mb-8">
        Greenbloom is my take on the top of that funnel: style discovery.
        Upload a photo of your yard, see it rendered in five distinct styles
        in minutes. It won&apos;t produce measurements, a plant list, or a
        material plan — the designer still owns that technical conversion,
        and the contractor still builds it. The point is you walk into the
        designer conversation with a clear visual anchor, not a vague
        instruction, so their time goes to the parts only they can do
        instead of trying to read your mind. The exploration phase
        collapses from weeks of browsing into a 15-minute session.{" "}
        <a
          href="/#wizard"
          className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 font-medium whitespace-nowrap"
        >
          Try it on your yard →
        </a>
      </p>

      {/* -------------------------------------------------- */}
      {/*  Visual proof — one before/after from the gallery   */}
      {/* -------------------------------------------------- */}
      <a href="/#gallery" className="block mb-10 group">
        <div className="rounded-xl border border-gray-800 overflow-hidden group-hover:border-emerald-500/40 transition-colors">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/before-after.jpg"
            alt="Before and after — a Tudor-style home with a plain lawn transformed into a lush tropical landscape"
            className="w-full"
          />
        </div>
        <p className="text-sm text-gray-500 mt-3 text-center">
          One of the gallery&apos;s before/after pairs ·{" "}
          <span className="text-emerald-400 group-hover:text-emerald-300">
            see more real transformations →
          </span>
        </p>
      </a>

      {/* -------------------------------------------------- */}
      {/*  Under the hood                                     */}
      {/* -------------------------------------------------- */}
      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Under the hood
      </h2>
      <p className="text-gray-400 leading-relaxed mb-5">
        What looks like a three-step wizard is the thin surface over a few
        decisions that take real work to get right:
      </p>
      <ul className="list-disc pl-6 space-y-3 text-gray-400 mb-10">
        <li>
          <span className="text-gray-200 font-medium">Model selection by evaluation, not marketing.</span>{" "}
          Multiple leading image-edit models tested side-by-side on the same
          prompts and the same test photos. The pick is based on what
          actually followed instructions and preserved architecture — not on
          which vendor had the louder launch post.
        </li>
        <li>
          <span className="text-gray-200 font-medium">Prompt engineering that holds the house in place.</span>{" "}
          A layered prompt structure wraps architectural preservation around
          creative latitude, so the model can completely redesign the
          landscape while leaving the house pixel-faithful. User asks (&ldquo;add
          a waterfall&rdquo;, &ldquo;no palm trees&rdquo;) are treated as hero elements, not
          background suggestions.
        </li>
        <li>
          <span className="text-gray-200 font-medium">Abuse prevention and cost control.</span>{" "}
          Server-side API key isolation, per-IP and site-wide rate limiting,
          and bot-gating on the generate action. Worst-case daily AI spend is
          bounded in the single digits — a public demo that an attacker
          can&apos;t drain.
        </li>
        <li>
          <span className="text-gray-200 font-medium">UX work that most AI demos skip.</span>{" "}
          Client-side image resizing so any phone photo works, auto-matched
          lighting between input and output, mobile-responsive layout,
          generated OG image for link previews, before/after gallery of real
          transformations, custom favicon and brand mark.
        </li>
      </ul>

      {/* -------------------------------------------------- */}
      {/*  Who built it                                       */}
      {/* -------------------------------------------------- */}
      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Who built it
      </h2>

      <div className="flex items-center gap-4 mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/nivedita.jpg"
          alt="Nivedita Patil"
          className="h-16 w-16 rounded-full object-cover border-2 border-emerald-500/40"
        />
        <div>
          <p className="text-white font-semibold">Nivedita Patil</p>
          <p className="text-sm text-gray-400">
            Product manager · built Greenbloom end-to-end
          </p>
        </div>
      </div>

      <p className="text-gray-400 leading-relaxed mb-6">
        Working at the intersection of generative AI and real-world problems
        people actually have. Open to conversations with contractors, water
        utilities, homeowners, and other PMs working in adjacent spaces.
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
          href="https://www.linkedin.com/in/nivedita-patil"
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
