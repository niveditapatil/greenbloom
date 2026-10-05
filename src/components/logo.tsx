type LogoProps = {
  size?: number
  className?: string
}

/**
 * Greenbloom brand mark — a stylized leaf inside a rounded square.
 * Same visual language as the favicon and OG image, scaled for in-page use.
 */
export function Logo({ size = 28, className = "" }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="gb-logo-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#34d399" />
          <stop offset="1" stopColor="#0d9488" />
        </linearGradient>
      </defs>
      {/* Rounded square backdrop */}
      <rect width="64" height="64" rx="14" fill="url(#gb-logo-bg)" />
      {/* Leaf body */}
      <path
        d="M32 10 C 20 22, 15 36, 32 54 C 49 36, 44 22, 32 10 Z"
        fill="#ffffff"
        fillOpacity="0.96"
      />
      {/* Midrib */}
      <path
        d="M32 18 L 32 52"
        stroke="#0d9488"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Side veins */}
      <path
        d="M32 28 L 25 32 M32 36 L 25 40 M32 28 L 39 32 M32 36 L 39 40"
        stroke="#0d9488"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeOpacity="0.7"
      />
    </svg>
  )
}
