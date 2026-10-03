"use client"

import { ChevronDown } from "lucide-react"

const FAQS = [
  {
    q: "Will the AI change my actual house?",
    a: "No — Greenbloom only modifies the landscaping (plants, lawn, pathways, planters) in the generated image. Your real house is never touched. The underlying FLUX.1 Kontext model occasionally introduces minor visual variations in the rendered image, but it has no connection to your home.",
  },
  {
    q: "Is this really free?",
    a: "Yes. No account, no credit card, no watermark. There's a small per-visitor rate limit (5 generations per hour) so one person can't exhaust the daily API budget, and a site-wide daily cap. If you hit either, you'll see a friendly message.",
  },
  {
    q: "Are my photos stored anywhere?",
    a: "Your upload is sent to fal.ai to generate the redesign, then discarded. Greenbloom doesn't save your original or the result on any server. The browser holds them in memory while you're using the app, and clears them when you reload.",
  },
  {
    q: "What AI model powers this?",
    a: "FLUX.1 Kontext [pro] from Black Forest Labs, served via fal.ai. It's a state-of-the-art image-to-image model that preserves the structure of your photo while re-imagining the parts the prompt describes.",
  },
  {
    q: "Can I use the generated images commercially?",
    a: "Yes, per fal.ai's terms. Greenbloom is a hobby project though — not legal advice. If you're planning to use results in a client deliverable, double-check the fal.ai output license at the time you generate.",
  },
  {
    q: "Why does the same yard look different each time I generate?",
    a: "AI image models have randomness baked in — the same prompt and image produce different results every run. That's a feature for creative tools (you can keep clicking “Try another style”), not a bug. Pick the one you love.",
  },
]

export function FaqSection() {
  return (
    <section id="faq" className="max-w-3xl mx-auto px-4 py-16 scroll-mt-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Frequently asked questions
        </h2>
        <p className="text-gray-400">
          Everything most visitors want to know, in one place.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map(({ q, a }) => (
          <details
            key={q}
            className="group rounded-lg border border-gray-800 bg-gray-900/50 overflow-hidden"
          >
            <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none text-white font-medium hover:bg-gray-900 transition-colors">
              <span>{q}</span>
              <ChevronDown className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-180 shrink-0" />
            </summary>
            <div className="px-5 pb-5 text-gray-400 text-sm leading-relaxed">
              {a}
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}
