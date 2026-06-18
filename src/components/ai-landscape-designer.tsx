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

const MAX_FILE_SIZE_MB = 5

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsDataURL(file)
  })
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

export function AiLandscapeDesigner() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<string>(STYLES[0].id)
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
      const dataUrl = await fileToDataUrl(file)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-gray-100 p-4 md:p-8">
      <header className="max-w-5xl mx-auto text-center mb-10">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-600">
          AI Landscape Designer
        </h1>
        <p className="text-xl text-gray-300">
          Upload a photo of your yard and see it reimagined in seconds.
        </p>
      </header>

      <main className="max-w-4xl mx-auto space-y-12">
        {/* ---------------------------------------------------- */}
        {/*  Hero card                                            */}
        {/* ---------------------------------------------------- */}
        <Card className="bg-gray-800 shadow-xl border-0 overflow-hidden">
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
                      placeholder="e.g., include a small fire pit, keep the existing tree, add pollinator-friendly flowers"
                      className="mt-2 bg-gray-700 border-gray-600 text-gray-100"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {prompt.length}/500
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

        {/* ---------------------------------------------------- */}
        {/*  Roadmap section                                      */}
        {/* ---------------------------------------------------- */}
        <RoadmapSection />

        {/* ---------------------------------------------------- */}
        {/*  Footer                                                */}
        {/* ---------------------------------------------------- */}
        <footer className="text-center text-sm text-gray-500 pt-8 pb-4">
          Built with Next.js · fal.ai (FLUX.1 Kontext pro) · Upstash · Vercel
        </footer>
      </main>
    </div>
  )
}
