import type { NextApiRequest, NextApiResponse } from "next"
import { fal } from "@fal-ai/client"
import { ipLimiter, globalLimiter, isRateLimitEnabled } from "@/lib/ratelimit"

// Allow up to 8 MB request body (room for a 5–6 MB image data URL).
// Extend Vercel's serverless-function timeout to 60s — FLUX.1 Kontext
// generations typically take 10–20s, and the Hobby-tier default of 10s
// would kill them mid-request.
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "8mb",
    },
  },
  maxDuration: 60,
}

const FAL_KEY = process.env.FAL_KEY
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY
const TURNSTILE_ENABLED = Boolean(TURNSTILE_SECRET)

if (FAL_KEY) {
  fal.config({ credentials: FAL_KEY })
}

type GenerateBody = {
  imageDataUrl?: string
  style?: string
  prompt?: string
  turnstileToken?: string
}

type FalImage = { url: string }
type FalKontextResult = { images?: FalImage[] }

// Prompt structure ("sandwich"):
//   1. STRONG preservation clause FIRST with explicit architectural
//      specifics (windows, siding, roof, trim, etc.) — FLUX weights the
//      opening tokens.
//   2. Transformation directive + vivid, species-specific style
//      description in the middle — this is the creative core.
//   3. Preservation RE-ASSERTED at the end — FLUX also weights closing
//      tokens, and without this the house tends to drift.
// Each prompt explicitly scopes the edit to "plants, hardscape surfaces,
// and landscape lighting" so the model doesn't treat the house as fair
// game just because the middle of the prompt said "Completely redesign".
const STYLE_PROMPTS: Record<string, string> = {
  modern:
    "Keep the house and all built architecture exactly as they are in the input photo. The exterior walls, siding, paint color, windows, window frames and trim, doors, door frames, roof, roof material, gutters, chimneys, porch, railings, and every architectural detail must remain pixel-identical to the input image. Only the ground-level landscaping — plants, lawn, mulch, gravel, walkways, planters, and landscape lighting — may change. Completely redesign that landscaping as a high-end contemporary landscape: clean geometric drifts of ornamental grasses (blue fescue, feather reed grass, Mexican feather grass), sculptural mature agaves and large succulents, tightly-clipped evergreen boxwood spheres and yew cubes, and architectural accent trees with smooth bark. Install large-format poured-concrete pavers or smooth limestone slabs as walkways with crisp dark joints, oversized minimalist planters in matte black and weathered concrete, wide bands of black lava rock and pale river pebble as ground cover, Corten-steel edging, and warm recessed LED up-lighting at the base of accent plants. Strong negative space, restrained plant palette, intentional asymmetry, nothing overgrown. Architectural-digest quality, crisp golden-hour light, photorealistic. Final reminder: the house and all architecture must stay pixel-perfect and unchanged — only the plants, hardscape surfaces, and landscape lighting may be redesigned.",
  zen:
    "Keep the house and all built architecture exactly as they are in the input photo. The exterior walls, siding, paint color, windows, window frames and trim, doors, door frames, roof, roof material, gutters, chimneys, porch, railings, and every architectural detail must remain pixel-identical to the input image. Only the ground-level landscaping — plants, lawn, mulch, gravel, walkways, planters, and landscape lighting — may change. Completely redesign that landscaping as an authentic Japanese karesansui zen garden. Replace all existing plants and ground cover with a large expanse of finely raked white and pale grey gravel with concentric curved rake patterns flowing around the focal points. Place weathered mossy granite boulders in asymmetric odd-numbered groupings (threes and fives) as 'islands' rising out of the gravel sea. Add undulating mounds of vivid emerald moss, a single sculpted Japanese maple with deep crimson leaves as the hero focal point, a cloud-pruned (niwaki) black pine, a tall bamboo screen along the back edge, a meandering stepping-stone path of dark basalt, a stone lantern (tōrō), and a small tsukubai water basin with a bamboo spout. Tranquil, contemplative, deliberately asymmetric, spiritual. Kyoto temple-garden quality, soft overcast natural light, photorealistic. Final reminder: the house and all architecture must stay pixel-perfect and unchanged — only the plants, hardscape surfaces, and landscape lighting may be redesigned.",
  tropical:
    "Keep the house and all built architecture exactly as they are in the input photo. The exterior walls, siding, paint color, windows, window frames and trim, doors, door frames, roof, roof material, gutters, chimneys, porch, railings, and every architectural detail must remain pixel-identical to the input image. Only the ground-level landscaping — plants, lawn, mulch, gravel, walkways, planters, and landscape lighting — may change. Completely redesign that landscaping as a lush, mature tropical paradise. Replace all existing plants and ground cover with a dense layered jungle canopy featuring multiple mature tall palm trees as the hero feature (queen palms, royal palms, fan palms, and king palms), big-leafed banana plants with broad green fronds, bird-of-paradise with vivid orange and blue flowers, cascading magenta bougainvillea spilling over walls and trellises, towering tree ferns, clusters of red and orange heliconia, giant-leafed philodendron and monstera, elephant-ear alocasia, and brightly-colored yellow-and-red crotons. Wind a curving natural flagstone path through the planting, add warm landscape uplighting at the base of every palm trunk, and include a small natural boulder waterfall water feature. Abundant, exotic, deeply layered, wildly saturated color. Maui resort quality, warm golden-hour light, photorealistic. Final reminder: the house and all architecture must stay pixel-perfect and unchanged — only the plants, hardscape surfaces, and landscape lighting may be redesigned.",
  mediterranean:
    "Keep the house and all built architecture exactly as they are in the input photo. The exterior walls, siding, paint color, windows, window frames and trim, doors, door frames, roof, roof material, gutters, chimneys, porch, railings, and every architectural detail must remain pixel-identical to the input image. Only the ground-level landscaping — plants, lawn, mulch, gravel, walkways, planters, and landscape lighting — may change. Completely redesign that landscaping as a sun-drenched Mediterranean villa garden inspired by Tuscany, Provence, and the Greek islands. Replace all existing plants and ground cover with mature silver-foliaged olive trees with gnarled trunks as hero focal points, tall columnar Italian cypress trees framing the view, long aromatic rows of purple lavender and rosemary, cascading bougainvillea in magenta and coral spilling over low stone walls, potted lemon and orange citrus trees in weathered terracotta urns, pink oleander, climbing jasmine and grapevines on a wooden pergola, and low cushions of creeping thyme between dry-laid stone pavers. Add warm-toned decomposed granite or pea-gravel paths, a small trickling stone fountain, terracotta urn planters at focal points, and low dry-stacked limestone walls. Warm, sun-baked, aromatic, relaxed, elegant. Tuscan-villa magazine quality, late-afternoon Mediterranean light with long golden shadows, photorealistic. Final reminder: the house and all architecture must stay pixel-perfect and unchanged — only the plants, hardscape surfaces, and landscape lighting may be redesigned.",
  xeriscape:
    "Keep the house and all built architecture exactly as they are in the input photo. The exterior walls, siding, paint color, windows, window frames and trim, doors, door frames, roof, roof material, gutters, chimneys, porch, railings, and every architectural detail must remain pixel-identical to the input image. Only the ground-level landscaping — plants, lawn, mulch, gravel, walkways, planters, and landscape lighting — may change. Completely redesign that landscaping as a sophisticated Sonoran desert xeriscape garden. Replace all existing plants and ground cover with multiple tall saguaro and organ-pipe cacti as hero sculptural focal points, mature blue agaves and century plants, clusters of golden barrel cactus, spiny ocotillo with crimson flower tips, soaptree yuccas, desert spoon (dasylirion), red-flowering hesperaloe, a single mature palo verde tree with green bark and yellow flowers, and an ironwood tree providing filtered shade. Carpet the ground with rust-colored decomposed granite, warm tan and buff gravel, scattered river-washed boulders, and black lava rock accents. Add a curving flagstone or dry-stacked stone-slab path, steel planters with single specimen cacti, and low-glow uplighting at the base of each saguaro. Water-wise, architectural, bold silhouettes against gravel, zero turf. Sedona-resort quality, dramatic late-afternoon desert light with long shadows, photorealistic. Final reminder: the house and all architecture must stay pixel-perfect and unchanged — only the plants, hardscape surfaces, and landscape lighting may be redesigned.",
}

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  if (!TURNSTILE_SECRET) return true
  const formData = new URLSearchParams()
  formData.append("secret", TURNSTILE_SECRET)
  formData.append("response", token)
  formData.append("remoteip", ip)
  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body: formData },
    )
    const data = (await res.json()) as { success?: boolean }
    return Boolean(data.success)
  } catch (err) {
    console.error("Turnstile verify error", err)
    return false
  }
}

function getClientIp(req: NextApiRequest): string {
  const fwd = req.headers["x-forwarded-for"]
  if (typeof fwd === "string") return fwd.split(",")[0].trim()
  if (Array.isArray(fwd) && fwd.length > 0)
    return fwd[0].split(",")[0].trim()
  return req.socket.remoteAddress ?? "unknown"
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return res.status(405).json({ error: "Method not allowed" })
  }

  if (!FAL_KEY) {
    return res.status(503).json({
      error:
        "Image generation isn't configured on the server. Set FAL_KEY in environment variables.",
    })
  }

  const { imageDataUrl, style, prompt, turnstileToken } =
    (req.body ?? {}) as GenerateBody

  // ---- Input validation ----
  if (!imageDataUrl || typeof imageDataUrl !== "string") {
    return res.status(400).json({ error: "A yard photo is required." })
  }
  if (!imageDataUrl.startsWith("data:image/")) {
    return res
      .status(400)
      .json({ error: "Uploaded file must be an image." })
  }
  // Hard cap on encoded size (~6 MB raw image).
  if (imageDataUrl.length > 8 * 1024 * 1024) {
    return res
      .status(413)
      .json({ error: "Image is too large. Please upload under 5 MB." })
  }
  if (!style || typeof style !== "string" || !STYLE_PROMPTS[style]) {
    return res.status(400).json({ error: "Pick a valid style." })
  }

  // ---- Bot check ----
  if (TURNSTILE_ENABLED) {
    if (!turnstileToken || typeof turnstileToken !== "string") {
      return res
        .status(400)
        .json({ error: "Captcha verification missing." })
    }
    const ip = getClientIp(req)
    const ok = await verifyTurnstile(turnstileToken, ip)
    if (!ok) {
      return res
        .status(403)
        .json({ error: "Captcha verification failed. Please try again." })
    }
  }

  // ---- Rate limiting ----
  if (isRateLimitEnabled()) {
    const ip = getClientIp(req)
    const ipResult = await ipLimiter().limit(ip)
    if (!ipResult.success) {
      return res.status(429).json({
        error:
          "You've hit the per-hour limit (5 designs/hour). Please try again later.",
      })
    }
    const globalResult = await globalLimiter().limit("site")
    if (!globalResult.success) {
      return res.status(429).json({
        error:
          "The daily site-wide demo limit has been reached. Please check back tomorrow.",
      })
    }
  }

  // ---- Build prompt ----
  const userExtra = (prompt ?? "").toString().trim().slice(0, 500)
  const fullPrompt = userExtra
    ? `${STYLE_PROMPTS[style]} Additional details from the user: ${userExtra}`
    : STYLE_PROMPTS[style]

  // Guidance scale is hard-coded to the max (10) — lower values produced
  // weak, conservative redesigns in testing. The sandwiched preservation
  // clauses in STYLE_PROMPTS hold the house in place at this setting.
  const GUIDANCE_SCALE = 10

  // ---- Call fal.ai (FLUX.1 Kontext [pro]) ----
  // Trialed [max] ($0.08) but the quality lift wasn't worth the 2x cost.
  // Sticking with [pro] and leaning on tighter prompting to preserve
  // architecture.
  try {
    const result = await fal.subscribe("fal-ai/flux-pro/kontext", {
      input: {
        prompt: fullPrompt,
        image_url: imageDataUrl,
        guidance_scale: GUIDANCE_SCALE,
        num_images: 1,
        safety_tolerance: "2",
        output_format: "jpeg",
      },
      logs: false,
    })

    const data = result?.data as FalKontextResult | undefined
    const url = data?.images?.[0]?.url
    if (!url) {
      return res
        .status(502)
        .json({ error: "Model returned no image. Please try again." })
    }
    return res.status(200).json({ imageUrl: url })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("fal generate error:", message)
    if (/insufficient|credit|balance|quota|payment/i.test(message)) {
      return res.status(503).json({
        error:
          "Demo credits exhausted — the maintainer needs to top up. Check back soon!",
      })
    }
    return res
      .status(500)
      .json({ error: "Something went wrong generating your design." })
  }
}
