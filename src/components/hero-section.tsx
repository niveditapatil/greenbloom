"use client"

import { ArrowDown, Lock, Zap, Palette, DollarSign } from "lucide-react"

export function HeroSection() {
  return (
    <section className="max-w-5xl mx-auto text-center py-16 md:py-24 px-4">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs font-medium mb-6">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        AI-powered · Free to try
      </div>

      <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-[1.05]">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-600">
          Redesign your yard
        </span>
        <br />
        <span className="text-white">in 15 seconds.</span>
      </h1>

      <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 mb-10 leading-relaxed">
        No landscaper. No sketches. No endless Pinterest boards. Just a photo
        of your yard and the style you love — Greenbloom shows you what it
        could look like.
      </p>

      <a
        href="#wizard"
        className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-lg transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
      >
        Try it with your yard
        <ArrowDown className="h-5 w-5" />
      </a>

      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
        {[
          { icon: DollarSign, label: "100% free" },
          { icon: Lock, label: "Photos never stored" },
          { icon: Zap, label: "~15 second results" },
          { icon: Palette, label: "5 unique styles" },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center justify-center gap-2 text-sm text-gray-400"
          >
            <Icon className="h-4 w-4 text-emerald-400" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
