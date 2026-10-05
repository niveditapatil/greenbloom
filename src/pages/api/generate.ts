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

// Prompt structure ("sandwich" with randomized middle):
//   1. PRESERVATION_CLAUSE — architectural specifics that must stay pixel-
//      identical. FLUX weights the opening tokens.
//   2. One randomly-chosen STYLE_VARIANT for the requested style — gives
//      the model a specific directional brief without being so prescriptive
//      that every output converges to the same template. Each style has
//      multiple variants so repeat generations surprise.
//   3. ANTI_CLICHE — explicit "don't follow the obvious template" guidance.
//   4. LIGHTING_CLAUSE — match input photo exposure.
//   5. CLOSING_PRESERVATION — preservation reasserted at the end (also a
//      high-weight position in FLUX's attention).

const PRESERVATION_CLAUSE =
  "Keep the house and all built architecture exactly as they are in the input photo. The exterior walls, siding, paint color, windows, window frames and trim, doors, door frames, roof, roof material, gutters, chimneys, porch, railings, and every architectural detail must remain pixel-identical to the input image. Only the ground-level landscaping — plants, lawn, mulch, gravel, walkways, planters, and landscape lighting — may change."

const ANTI_CLICHE =
  "Design this as a bespoke installation specific to THIS property, not a template. If specific elements were requested above by the user, those are required — include them exactly as asked. Beyond those explicit requests, avoid predictable landscape clichés: symmetric trees framing the entry, straight paths down the center, 'one of everything' plant collections. Compose asymmetrically. Pick a few hero elements and commit to them rather than cramming every stylistic cue in. The arrangement should feel like a creative studio designed it for this exact yard, not applied a style preset."

const WOW_FACTOR =
  "Make this show-stopping — the kind of yard that makes passers-by slow down for a second look. Push for a single dramatic specimen plant or sculptural focal element as the undeniable hero, strong confident composition, intentional color and texture contrast, high-end material finishes, and generous mature-looking planting (not thin or sparse). Think award-winning magazine feature, not pleasant-but-generic."

const LIGHTING_CLAUSE =
  "Lighting, exposure, and time of day match the input photo exactly — bright and naturally lit, no dim or moody cinematic effects. Photorealistic."

const CLOSING_PRESERVATION =
  "Final reminder: the house and all architecture must stay pixel-perfect and unchanged — only the plants, hardscape surfaces, and landscape lighting may be redesigned."

type StyleVariant = {
  // Short label for debugging / future analytics on which variants land well.
  name: string
  // The creative middle of the prompt — describes aesthetic, hero elements,
  // and material palette for this specific take on the style.
  creative: string
}

const STYLE_VARIANTS: Record<string, StyleVariant[]> = {
  modern: [
    {
      name: "architectural-minimalism",
      creative:
        "Redesign the landscape as a restrained contemporary garden with heavy negative space. Hero: three mature sculptural agaves or a single multi-stem olive as the lone focal point. Ground: wide bands of pale river pebble and dark steel edging, large poured-concrete pavers with crisp dark joints. One or two tight evergreen shapes (boxwood sphere or clipped yew), no flowering plants. Everything geometric, nothing filling corners for balance.",
    },
    {
      name: "ornamental-grass-drift",
      creative:
        "Redesign the landscape as drifts of mixed ornamental grasses — feather reed grass, blue fescue, Mexican feather grass, little bluestem — flowing in asymmetric bands across the yard. No clipped shrubs, no agaves. Hero: the movement and texture of the grasses themselves. Hardscape: smooth limestone slab path, matte black steel planters, decomposed-granite surround. Light, airy, prairie-adjacent but intentionally designed.",
    },
    {
      name: "monochrome-green-garden",
      creative:
        "Redesign the landscape as a densely planted monochromatic green garden. Varied textures of green only (no flowers, no silver foliage): mature Japanese maple as a focal point, hakonechloa grasses in sweeping drifts, hostas in shade areas, mondo grass ground cover, soft ferns against the house. Hardscape: dark basalt stepping stones, charcoal pea-gravel. Lush but restrained.",
    },
  ],
  zen: [
    {
      name: "karesansui-dry-garden",
      creative:
        "Redesign the landscape as an authentic Japanese karesansui dry garden. Large expanse of finely raked white or pale grey gravel with curved rake patterns. Weathered mossy granite boulders in asymmetric odd-numbered groupings as 'islands.' One sculpted Japanese maple with deep crimson leaves as the hero focal point. Low mounds of emerald moss, meandering stepping-stone path of dark basalt. Minimal plantings. Contemplative, deliberately spare.",
    },
    {
      name: "tea-garden-roji",
      creative:
        "Redesign the landscape as a traditional Japanese tea-garden (roji). Winding stepping-stone path through soft moss ground cover, flanking cloud-pruned (niwaki) azalea mounds and pines, bamboo screening along one edge, a stone water basin (tsukubai) with a bamboo spout and small ladle, a single stone lantern. No raked-gravel sea. Enclosed, intimate, procession-based, quieter than a karesansui.",
    },
    {
      name: "modern-japanese",
      creative:
        "Redesign the landscape as a modern Japanese-inspired garden — contemporary minimalist, not traditional. Clusters of black bamboo rising against the house, horsetail reeds in a long steel trough, a drift of hakonechloa grass. Ground: large square ipe-wood deck pavers set in black pebbles. No raked gravel, no stone lanterns, no Japanese maples. Architectural, calm, uses Japanese design logic without the obvious vocabulary.",
    },
  ],
  tropical: [
    {
      name: "modern-tropical",
      creative:
        "Redesign the landscape as a contemporary modern-tropical garden — the resort-architect version of tropical. Hero: three mature architectural traveler's palms or a single clumping giant bird-of-paradise as a dramatic specimen (not symmetric corner palms). Supporting: a sculpted podocarpus hedge for a crisp green wall, structural clumps of golden bamboo, a few mature philodendron selloum with huge sculpted leaves. Hardscape: large pale-concrete pavers set in black river pebble, a horizontal ipe-wood slat screen along one edge, a shallow linear reflecting trough (not a cliché decorative waterfall). Clean lines, mature plants, confident restraint. High-end resort rather than lush jungle.",
    },
    {
      name: "caribbean-courtyard",
      creative:
        "Redesign the landscape as a vibrant Caribbean-island courtyard. Hero: a flowering red hibiscus hedge and clusters of red-and-yellow heliconia and ginger plants. Supporting: variegated crotons for color, ti plants with purple-red leaves, bromeliads tucked between stones. One or two small plumeria trees for scent — no coconut palms or bougainvillea. Ground: crushed seashell path, coral-stone wall accents. Saturated, playful, close to the ground.",
    },
    {
      name: "balinese-resort",
      creative:
        "Redesign the landscape as a mature Balinese resort garden. Hero: clumps of golden bamboo rising to screen the back of the yard. Supporting: frangipani trees in bloom, dracaena spikes, bird-of-paradise, a cycad or two, dense mondo-grass carpets. One carved-stone statue tucked into greenery as focal point. Hardscape: dark river-stone path with moss between joints. Sophisticated, resort-polished, layered — not cliché beach-vacation.",
    },
    {
      name: "palm-forward",
      creative:
        "Redesign the landscape with multiple species of palms as the signature feature (foxtail palms, triangle palms, pygmy date palms — varied heights and textures, not a symmetric pair). Supporting: cascading magenta bougainvillea on a single trellis, hibiscus hedge, orange heliconia clusters. Ground: natural flagstone path. Classic tropical paradise feel but with varied palm species rather than two identical corner palms.",
    },
  ],
  mediterranean: [
    {
      name: "tuscan-olive-grove",
      creative:
        "Redesign the landscape as a Tuscan olive-grove-inspired garden. Hero: a single mature gnarled-trunk silver olive tree as the focal point. Supporting: long aromatic rows of purple lavender and rosemary, sage and oregano in drifts, small cypress accents (no symmetric cypress sentinels). Hardscape: warm-toned decomposed-granite path, dry-stacked limestone retaining wall, one weathered terracotta urn. Sun-baked, aromatic, horizontal composition.",
    },
    {
      name: "provencal-herb-courtyard",
      creative:
        "Redesign the landscape as a Provençal herb-focused courtyard garden. Central pea-gravel patio, surrounded by raised terracotta beds overflowing with culinary herbs: thyme, sage, marjoram, chives, bronze fennel. Climbing white and pink roses on a simple iron trellis against one wall. A pair of standard-trained bay laurels in weathered pots. No olives, no cypresses. Lived-in, aromatic, kitchen-garden energy.",
    },
    {
      name: "greek-island",
      creative:
        "Redesign the landscape as a Greek-island hillside garden. Cascading magenta and coral bougainvillea spilling over low whitewashed walls (where the architecture permits), fig trees with silvery bark, clusters of blue-leaved agave and golden barrel cactus, drifts of silver santolina and curry plant. Ground: tumbled white marble chip. Cobalt-blue glazed pots as accents. Hot, bright, white-and-blue palette rather than Tuscan terracotta.",
    },
  ],
  xeriscape: [
    {
      name: "sonoran-desert",
      creative:
        "Redesign the landscape as a Sonoran desert garden. Hero: a single mature saguaro cactus as the sculptural focal point (not a line of them). Supporting: a palo verde tree with green bark and yellow flowers providing filtered shade, mature blue agaves, clusters of golden barrel cactus, spiny ocotillo with crimson flower tips, red-flowering hesperaloe. Ground: rust-colored decomposed granite with scattered boulders. Zero turf. Water-wise, Arizona-authentic.",
    },
    {
      name: "california-native",
      creative:
        "Redesign the landscape as a California native drought-tolerant garden. Hero: mature manzanita with dark red peeling bark as the signature structural plant. Supporting: ceanothus with blue flowers, white sage, California poppy, deer grass tufts, matilija poppy with huge white flowers. Ground: tan decomposed granite, river-rock dry streambed meandering through. No cacti, no agaves. Soft, naturalistic, California-chaparral feel.",
    },
    {
      name: "mediterranean-dryland",
      creative:
        "Redesign the landscape as a Mediterranean dryland garden mixing structure and softness. Hero: silver-foliaged plants dominate — artemisia, lamb's ear, Russian sage, Mexican feather grass, Jerusalem sage. One or two agaves and a yucca for sculptural anchor. Lavender and rosemary rows at the path edges. Ground: pale pea gravel with dry-stacked flat-stone edging. No saguaros, no palo verdes. Softer and more layered than a Sonoran garden; still zero turf.",
    },
  ],
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
  if (!style || typeof style !== "string" || !STYLE_VARIANTS[style]) {
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
  // Pick one of the style's variants at random so repeat generations surprise
  // instead of converging on the same template.
  const variants = STYLE_VARIANTS[style]
  const variant = variants[Math.floor(Math.random() * variants.length)]
  // User-provided extras are sandwiched: at the TOP of the prompt (first
  // high-weight position in FLUX attention) and REPEATED at the bottom
  // (second high-weight position). Explicit anti-substitution language
  // tells the model "waterfall means a real waterfall, not a bird bath"
  // because FLUX otherwise defaults to the smallest/safest interpretation.
  const userReqTop = userExtra
    ? `CRITICAL REQUIREMENT: The following user-requested element MUST appear as a clearly visible, substantial feature in the final image: "${userExtra}". Treat it as a hero of the composition. Interpret generously and generously-sized — e.g., "water feature" or "waterfall" means a real, substantial cascading stone waterfall or linear reflecting pool, NOT a tiny bird bath, pot of water, decorative urn, or any token small-scale substitute. If the user asked for an object, draw that object at a scale that would read clearly in a photograph.`
    : ""

  const userReqBottom = userExtra
    ? `Final check: did you include "${userExtra}" as a clearly visible, substantial, hero-scale element? If it's small, missing, or substituted with a token version, revise now.`
    : ""

  const fullPrompt = [
    PRESERVATION_CLAUSE,
    userReqTop,
    variant.creative,
    ANTI_CLICHE,
    WOW_FACTOR,
    LIGHTING_CLAUSE,
    userReqBottom,
    CLOSING_PRESERVATION,
  ]
    .filter(Boolean)
    .join(" ")
  // Logged (server-only) so we can trace which variant produced which image.
  console.log(`fal generate: style=${style} variant=${variant.name}`)

  // Guidance scale is hard-coded to the max (10) — lower values produced
  // weak, conservative redesigns in testing. The sandwiched preservation
  // clauses in the sandwich hold the house in place at this setting.
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
