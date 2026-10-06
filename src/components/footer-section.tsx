"use client"

import { Github } from "lucide-react"

export function FooterSection() {
  return (
    <footer className="max-w-5xl mx-auto px-4 py-10 mt-16 border-t border-gray-800">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span>&copy; {new Date().getFullYear()} Greenbloom.</span>
          <span className="hidden md:inline">·</span>
          <span>
            Made by{" "}
            <a
              href="https://github.com/niveditapatil"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-emerald-400 transition-colors"
            >
              Nivedita Patil
            </a>
          </span>
        </div>

        <div className="flex items-center gap-5">
          <a href="/about-us" className="hover:text-emerald-400 transition-colors">
            About
          </a>
          <a
            href="https://github.com/niveditapatil/greenbloom"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}
