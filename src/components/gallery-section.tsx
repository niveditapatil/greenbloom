"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Gallery catalog                                                    */
/*                                                                     */
/*  Each entry pairs a user-uploaded "before" photo with one AI-       */
/*  generated "after" result. One entry per style keeps the row        */
/*  showcasing Greenbloom's full stylistic range at a glance.          */
/* ------------------------------------------------------------------ */

type Pair = {
  id: string
  before: string
  after: string
  style: string
  styleColor: string // Tailwind gradient classes for the style badge
}

const PAIRS: Pair[] = [
  {
    id: "yard1-zen",
    before: "/gallery/yard1.jpg",
    after: "/gallery/yard1-zen.jpg",
    style: "Japanese Zen",
    styleColor: "from-emerald-500 to-teal-700",
  },
  {
    id: "yard2-mediterranean",
    before: "/gallery/yard2.jpg",
    after: "/gallery/yard2-mediterranean.jpg",
    style: "Mediterranean",
    styleColor: "from-amber-500 to-orange-700",
  },
  {
    id: "yard3-modern",
    before: "/gallery/yard3.jpg",
    after: "/gallery/yard3-modern.jpg",
    style: "Modern",
    styleColor: "from-slate-500 to-slate-700",
  },
  {
    id: "yard4-xeriscape",
    before: "/gallery/yard4.jpg",
    after: "/gallery/yard4-xeriscape.jpg",
    style: "Xeriscape",
    styleColor: "from-orange-500 to-red-700",
  },
  {
    id: "yard5-tropical",
    before: "/gallery/yard5.jpg",
    after: "/gallery/yard5-tropical.jpg",
    style: "Tropical",
    styleColor: "from-lime-500 to-emerald-700",
  },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function GallerySection() {
  const [activeId, setActiveId] = useState<string>(PAIRS[0].id)
  const active = PAIRS.find((p) => p.id === activeId) ?? PAIRS[0]

  return (
    <section className="max-w-5xl mx-auto mt-16 mb-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-600 mb-3">
          See it in action
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Real yards, real transformations. Click a thumbnail to see the full
          before &amp; after.
        </p>
      </div>

      {/* ------------------------------------------------------------ */}
      {/*  Hero before/after                                            */}
      {/* ------------------------------------------------------------ */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 md:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-6 items-center">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2 text-center">
              Before
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.before}
              alt="Original yard"
              className="w-full rounded-lg border border-gray-700 aspect-[4/3] object-cover"
            />
          </div>
          <div className="hidden md:flex flex-col items-center text-gray-500">
            <ArrowRight className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-emerald-400 mb-2 text-center">
              After · {active.style}
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.after}
              alt={`Yard redesigned in ${active.style} style`}
              className="w-full rounded-lg border border-emerald-500/40 aspect-[4/3] object-cover"
            />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/*  Thumbnail strip                                              */}
      {/* ------------------------------------------------------------ */}
      <div className="grid grid-cols-5 gap-2 md:gap-3">
        {PAIRS.map((pair) => {
          const isActive = pair.id === activeId
          return (
            <button
              key={pair.id}
              type="button"
              onClick={() => setActiveId(pair.id)}
              className={`group relative rounded-lg overflow-hidden border transition-all ${
                isActive
                  ? "border-emerald-500 ring-2 ring-emerald-500/40"
                  : "border-gray-700 hover:border-gray-500 opacity-70 hover:opacity-100"
              }`}
              aria-label={`Show ${pair.style} before and after`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pair.after}
                alt=""
                className="w-full aspect-square object-cover"
              />
              <div
                className={`absolute inset-x-0 bottom-0 bg-gradient-to-t ${pair.styleColor} py-1.5 px-2 text-[10px] md:text-xs text-white font-medium text-center leading-tight`}
              >
                {pair.style}
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
