"use client"

import { useCallback, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Turnstile } from "@marsidev/react-turnstile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ChevronRight,
  Loader2,
  Sparkles,
  Upload,
  RotateCcw,
  AlertTriangle,
  Download,
} from "lucide-react"
import { FaqSection } from "@/components/faq-section"
import { GallerySection } from "@/components/gallery-section"
import { HeroSection } from "@/components/hero-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { RoadmapSection } from "@/components/roadmap-section"

/* ------------------------------------------------------------------ */
/*  Style catalog                                                      */
/* ------------------------------------------------------------------ */

type Style = {
  id: string
  name: string
  description: string
  gradient: string
}

const STYLES: Style[] = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean lines, geometric planters, minimalist plantings",
    gradient: "from-slate-500 to-slate-700",
  },
  {
    id: "zen",
    name: "Japanese Zen",
    description: "Raked gravel, stone arrangements, moss, Japanese maple",
    gradient: "from-emerald-500 to-teal-700",
  },
  {
    id: "tropical",
    name: "Tropical",
    description: "Palms, banana plants, lush ferns, vibrant flowers",
    gradient: "from-lime-500 to-emerald-700",
  },
  {
    id: "mediterranean",
    name: "Mediterranean",
    description: "Olive trees, lavender, cypress, terracotta, Tuscan villa vibes",
    gradient: "from-amber-500 to-orange-700",
  },
  {
    id: "xeriscape",
    name: "Xeriscape / Desert",
    description: "Saguaros, agaves, decomposed granite, water-wise Southwest",
    gradient: "from-orange-500 to-red-700",
  },
]

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

// Users may drag in anything from a phone photo to an Unsplash original.
// We accept up to 20 MB raw and auto-resize client-side so the payload we
// send to /api/generate always fits well under Vercel's ~4.5 MB body cap.
const MAX_FILE_SIZE_MB = 20

// Target max dimensions and quality for the resized output. 1920px wide
// is more than Kontext needs for a quality redesign, and q=0.85 JPEG keeps
// the base64 payload comfortably under 2 MB in practice.
const RESIZE_MAX_DIMENSION = 1920
const RESIZE_JPEG_QUALITY = 0.85

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Failed to decode image"))
    }
    img.src = url
  })
}

/**
 * Resize a user-uploaded image to fit inside RESIZE_MAX_DIMENSION on its
 * longest side (preserving aspect ratio) and re-encode as JPEG. Returns a
 * base64 data URL ready to POST to /api/generate.
 *
 * If the image is already smaller than the target, the original is still
 * re-encoded as JPEG — this strips EXIF (incl. GPS) and normalizes format
 * so the server-side guard that insists on "data:image/" always sees JPEG.
 */
async function resizeImageToDataUrl(file: File): Promise<string> {
  const img = await loadImage(file)
  const { width: w, height: h } = img

  const longest = Math.max(w, h)
  const scale = longest > RESIZE_MAX_DIMENSION ? RESIZE_MAX_DIMENSION / longest : 1
  const targetW = Math.round(w * scale)
  const targetH = Math.round(h * scale)

  const canvas = document.createElement("canvas")
  canvas.width = targetW
  canvas.height = targetH
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas not supported in this browser")
  ctx.drawImage(img, 0, 0, targetW, targetH)

  return canvas.toDataURL("image/jpeg", RESIZE_JPEG_QUALITY)
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

export function Greenbloom() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<string>(STYLES[0].id)
  const [selectedModel, setSelectedModel] = useState<"flux2" | "nano-banana">(
    "flux2",
  )
  const [prompt, setPrompt] = useState("")
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    setError(null)
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, or WebP).")
      return
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Image is too large. Please keep it under ${MAX_FILE_SIZE_MB} MB.`)
      return
    }
    try {
      // Auto-resize so even multi-MB phone / Unsplash photos become a
      // compact JPEG data URL before we send it to the server.
      const dataUrl = await resizeImageToDataUrl(file)
      setImageDataUrl(dataUrl)
    } catch {
      setError("Couldn't read that file. Try a different image.")
    }
  }, [])

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) void handleFile(file)
  }

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) void handleFile(file)
  }

  const handleGenerate = async () => {
    if (!imageDataUrl) {
      setError("Please upload a yard photo first.")
      setStep(1)
      return
    }
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setError("Please complete the captcha below.")
      return
    }

    setError(null)
    setIsGenerating(true)
    setResultUrl(null)
    setStep(3)

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageDataUrl,
          style: selectedStyle,
          model: selectedModel,
          prompt,
          turnstileToken,
        }),
      })
      const data = (await res.json()) as { imageUrl?: string; error?: string }
      if (!res.ok) {
        setError(data.error ?? "Generation failed. Please try again.")
        setIsGenerating(false)
        return
      }
      if (!data.imageUrl) {
        setError("No image was returned. Please try again.")
        setIsGenerating(false)
        return
      }
      setResultUrl(data.imageUrl)
    } catch (err) {
      console.error(err)
      setError("Network error. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleStartOver = () => {
    setStep(1)
    setImageDataUrl(null)
    setPrompt("")
    setResultUrl(null)
    setError(null)
    setTurnstileToken(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleTryAnotherStyle = () => {
    // Keep the uploaded photo — just reset the style choice and result,
    // then send the user back to the customize step.
    setResultUrl(null)
    setError(null)
    setPrompt("")
    setStep(2)
  }

  const currentStyle = STYLES.find((s) => s.id === selectedStyle)!

  return (
    <div id="top">
      {/* ---------------------------------------------------- */}
      {/*  Marketing hero                                        */}
      {/* ---------------------------------------------------- */}
      <HeroSection />

      <main className="max-w-4xl mx-auto space-y-12 px-4">
        {/* ---------------------------------------------------- */}
        {/*  Live wizard — the actual product                      */}
        {/* ---------------------------------------------------- */}
        <Card id="wizard" className="bg-gray-800 shadow-xl border-0 overflow-hidden scroll-mt-8">
          <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
            <CardTitle className="text-2xl text-center flex items-center justify-center">
              <Sparkles className="mr-2" />
              {step === 1 && "Step 1 of 3 — Upload your yard"}
              {step === 2 && "Step 2 of 3 — Choose a style"}
              {step === 3 && "Step 3 of 3 — Your redesign"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {/* ======================================== STEP 1 */}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <label
                    htmlFor="file-upload"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={onDrop}
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-600 rounded-lg bg-gray-700/40 hover:bg-gray-700/60 transition cursor-pointer"
                  >
                    {imageDataUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={imageDataUrl}
                        alt="Your yard"
                        className="max-h-60 object-contain rounded"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-400 text-center px-4">
                        <Upload className="h-10 w-10" />
                        <p className="text-base">
                          <span className="font-medium text-emerald-400">
                            Click to upload
                          </span>{" "}
                          or drag a photo here
                        </p>
                        <p className="text-xs text-gray-500">
                          JPG, PNG, or WebP · up to {MAX_FILE_SIZE_MB} MB
                        </p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={onFileInputChange}
                      className="hidden"
                    />
                  </label>

                  {error && (
                    <div className="flex items-start gap-2 text-sm text-rose-300 bg-rose-900/30 border border-rose-800 rounded p-3">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <Button
                    onClick={() => setStep(2)}
                    disabled={!imageDataUrl}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next: pick a style{" "}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              )}

              {/* ======================================== STEP 2 */}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Model picker — temporary for comparison testing.
                      Remove once a winner is chosen. */}
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                    <Label className="text-amber-300 text-xs uppercase tracking-wider mb-2 block">
                      Testing — pick a model
                    </Label>
                    <div className="flex gap-2">
                      {([
                        { id: "flux2", label: "FLUX.2 Pro" },
                        { id: "nano-banana", label: "Nano Banana 2" },
                      ] as const).map((m) => {
                        const isSelected = selectedModel === m.id
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setSelectedModel(m.id)}
                            className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition ${
                              isSelected
                                ? "border-amber-400 bg-amber-500/20 text-amber-100"
                                : "border-gray-700 bg-gray-800/60 text-gray-300 hover:border-gray-500"
                            }`}
                          >
                            {m.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-300 mb-3 block">
                      Choose a style
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {STYLES.map((style) => {
                        const isSelected = selectedStyle === style.id
                        return (
                          <button
                            key={style.id}
                            type="button"
                            onClick={() => setSelectedStyle(style.id)}
                            className={`text-left rounded-lg p-4 transition border-2 ${
                              isSelected
                                ? "border-emerald-400 bg-gradient-to-br " +
                                  style.gradient
                                : "border-gray-700 bg-gray-700/50 hover:border-gray-500"
                            }`}
                          >
                            <div className="font-semibold text-white">
                              {style.name}
                            </div>
                            <div
                              className={`text-sm mt-1 ${
                                isSelected ? "text-white/90" : "text-gray-400"
                              }`}
                            >
                              {style.description}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="prompt" className="text-gray-300">
                      Anything specific? (optional)
                    </Label>
                    <Textarea
                      id="prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
                      placeholder="e.g., add a cascading stone waterfall, include an outdoor dining area with pergola, use drought-tolerant plants only"
                      className="mt-2 bg-gray-700 border-gray-600 text-gray-100"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tip: be specific. &ldquo;cascading stone waterfall&rdquo; works
                      much better than &ldquo;water feature&rdquo;. {prompt.length}/500
                    </p>
                  </div>

                  {TURNSTILE_SITE_KEY && (
                    <div className="flex justify-center">
                      <Turnstile
                        siteKey={TURNSTILE_SITE_KEY}
                        onSuccess={(token) => setTurnstileToken(token)}
                        onExpire={() => setTurnstileToken(null)}
                        options={{ theme: "dark" }}
                      />
                    </div>
                  )}

                  {error && (
                    <div className="flex items-start gap-2 text-sm text-rose-300 bg-rose-900/30 border border-rose-800 rounded p-3">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="flex-1 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate design
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ======================================== STEP 3 */}
              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {isGenerating && (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                      <Loader2 className="h-12 w-12 text-emerald-400 animate-spin" />
                      <p className="text-gray-300">
                        Redesigning your yard in{" "}
                        <span className="text-emerald-400">
                          {currentStyle.name}
                        </span>{" "}
                        style…
                      </p>
                      <p className="text-xs text-gray-500">
                        This usually takes 15–30 seconds.
                      </p>
                    </div>
                  )}

                  {!isGenerating && error && (
                    <div className="space-y-4">
                      <div className="flex items-start gap-2 text-sm text-rose-300 bg-rose-900/30 border border-rose-800 rounded p-4">
                        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                      <Button
                        onClick={() => setStep(2)}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                      >
                        Try again
                      </Button>
                    </div>
                  )}

                  {!isGenerating && resultUrl && imageDataUrl && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-gray-500 mb-2 text-center">
                            Before
                          </p>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imageDataUrl}
                            alt="Original yard"
                            className="w-full rounded-lg border border-gray-700"
                          />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider text-emerald-400 mb-2 text-center">
                            After · {currentStyle.name}
                          </p>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={resultUrl}
                            alt="AI-redesigned yard"
                            className="w-full rounded-lg border border-emerald-500/40"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row gap-3">
                        <Button
                          onClick={handleTryAnotherStyle}
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Try another style
                        </Button>
                        <a
                          href={resultUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button
                            variant="outline"
                            className="w-full bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Open full-size
                          </Button>
                        </a>
                      </div>
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={handleStartOver}
                          className="text-xs text-gray-400 hover:text-gray-200 underline underline-offset-4"
                        >
                          Upload a different photo
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

      </main>

      {/* ---------------------------------------------------- */}
      {/*  How it works — 3-step diagram                         */}
      {/* ---------------------------------------------------- */}
      <HowItWorksSection />

      {/* ---------------------------------------------------- */}
      {/*  Gallery of real before / after transformations       */}
      {/* ---------------------------------------------------- */}
      <GallerySection />

      {/* ---------------------------------------------------- */}
      {/*  FAQ                                                   */}
      {/* ---------------------------------------------------- */}
      <FaqSection />

      {/* ---------------------------------------------------- */}
      {/*  Roadmap of coming-soon features                       */}
      {/* ---------------------------------------------------- */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <RoadmapSection />
      </div>
    </div>
  )
}
