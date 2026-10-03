"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"

const LINKS = [
  { href: "/#wizard", label: "Try it" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#gallery", label: "Gallery" },
  { href: "/#faq", label: "FAQ" },
  { href: "/about-us", label: "About" },
]

export function NavBar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800/50 bg-gray-950/70 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <a
          href="/"
          className="flex items-center gap-2 text-white font-bold text-lg tracking-tight"
        >
          <span className="inline-block h-6 w-6 rounded-md bg-gradient-to-br from-emerald-400 to-teal-600" />
          Greenbloom
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7 text-sm text-gray-300">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="hover:text-white transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <a
          href="/#wizard"
          className="hidden md:inline-flex items-center px-4 py-2 rounded-md bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-medium transition-all"
        >
          Try it free
        </a>

        {/* Mobile toggle */}
        <button
          type="button"
          className="md:hidden text-gray-300 hover:text-white"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu drawer */}
      {open && (
        <nav className="md:hidden border-t border-gray-800/50 bg-gray-950/95 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-3 text-sm">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-gray-300 hover:text-white py-1"
              >
                {l.label}
              </a>
            ))}
            <a
              href="/#wizard"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center px-4 py-2 rounded-md bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium"
            >
              Try it free
            </a>
          </div>
        </nav>
      )}
    </header>
  )
}
