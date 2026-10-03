"use client"

import { Upload, Palette, Sparkles } from "lucide-react"

const STEPS = [
  {
    icon: Upload,
    number: "01",
    title: "Upload a photo",
    body: "Snap a shot of your front or back yard. JPG, PNG, or WebP, up to 20 MB — Greenbloom auto-resizes everything.",
  },
  {
    icon: Palette,
    number: "02",
    title: "Pick a style",
    body: "Modern, Japanese Zen, Tropical, Mediterranean, or Xeriscape. Optionally add a note (“add a fire pit”, “no palm trees”).",
  },
  {
    icon: Sparkles,
    number: "03",
    title: "See it transformed",
    body: "FLUX.1 Kontext redesigns the landscape in ~15 seconds. Your house, driveway, and property lines stay faithful to the photo.",
  },
]

export function HowItWorksSection() {
  return (
    <section className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          How it works
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Three steps. No account. No waiting list. The AI does the heavy
          lifting.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STEPS.map(({ icon: Icon, number, title, body }) => (
          <div
            key={number}
            className="relative rounded-xl border border-gray-800 bg-gray-900/50 p-6 hover:border-emerald-500/40 transition-colors"
          >
            <div className="absolute -top-3 -right-3 text-5xl font-black text-emerald-500/20 select-none">
              {number}
            </div>
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 mb-4">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
