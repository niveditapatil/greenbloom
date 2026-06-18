"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, CreditCard, Users, MapPinned } from "lucide-react"

const ROADMAP_ITEMS = [
  {
    icon: Lock,
    title: "User accounts",
    description:
      "Save your designs to a personal gallery, share with others, and pick up where you left off. Planned with NextAuth + Google sign-in.",
  },
  {
    icon: CreditCard,
    title: "Payment for HD renders",
    description:
      "Pay a small fee to unlock high-resolution renders and bulk variations. Stripe-based, with transparent per-render pricing.",
  },
  {
    icon: Users,
    title: "Contractor marketplace",
    description:
      "Connect with vetted local landscapers who can quote and build the design. Planned after user-account launch.",
  },
  {
    icon: MapPinned,
    title: "Regional plant suggestions",
    description:
      "Use the user's location to suggest plants that actually thrive in their climate zone. Integrates with USDA / OpenEPI data.",
  },
]

export function RoadmapSection() {
  return (
    <Card className="bg-gray-800/60 shadow-xl border border-gray-700/60 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl text-gray-200 flex items-center gap-2">
          <Sparkle /> What&apos;s next
        </CardTitle>
        <p className="text-sm text-gray-400 mt-1">
          Features planned for the next iteration of this portfolio project.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ROADMAP_ITEMS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex gap-3 rounded-lg border border-gray-700 bg-gray-900/40 p-4"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gray-800 text-emerald-400">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-100">{title}</h4>
                  <span className="text-[10px] uppercase tracking-wider bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded">
                    Coming soon
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-400">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function Sparkle() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 text-emerald-400"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
    </svg>
  )
}
