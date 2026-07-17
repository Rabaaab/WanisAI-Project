/**
 * Wanis illustrated character — simple, warm, line-art style.
 * Available poses: "default" | "listening" | "waving"
 */
export function WanisCharacter({
  pose = "default",
  className = "",
  size = 120,
}: {
  pose?: "default" | "listening" | "waving"
  className?: string
  size?: number
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Warm glow behind */}
      <circle cx="60" cy="62" r="48" fill="hsl(45 66% 47% / 0.12)" />

      {/* Body */}
      <ellipse cx="60" cy="90" rx="22" ry="18" fill="hsl(210 32% 52% / 0.18)" />
      <ellipse cx="60" cy="86" rx="18" ry="22" fill="hsl(40 43% 92%)" stroke="hsl(210 32% 52%)" strokeWidth="1.5" />

      {/* Arms */}
      {pose === "waving" ? (
        <>
          {/* Left arm down */}
          <path d="M42 80 Q34 88 36 96" stroke="hsl(210 32% 52%)" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Right arm waving up */}
          <path d="M78 78 Q90 66 88 56" stroke="hsl(210 32% 52%)" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Waving hand */}
          <circle cx="87" cy="53" r="5" fill="hsl(40 43% 92%)" stroke="hsl(210 32% 52%)" strokeWidth="1.5" />
        </>
      ) : pose === "listening" ? (
        <>
          {/* Both arms gently folded inward */}
          <path d="M42 80 Q38 86 40 92" stroke="hsl(210 32% 52%)" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M78 80 Q82 86 80 92" stroke="hsl(210 32% 52%)" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Subtle lean of hand to cheek */}
          <path d="M80 92 Q84 88 82 84" stroke="hsl(210 32% 52%)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          {/* Default arms relaxed */}
          <path d="M42 80 Q36 88 38 94" stroke="hsl(210 32% 52%)" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M78 80 Q84 88 82 94" stroke="hsl(210 32% 52%)" strokeWidth="2" strokeLinecap="round" fill="none" />
        </>
      )}

      {/* Head */}
      <circle cx="60" cy="52" r="24" fill="hsl(40 43% 92%)" stroke="hsl(210 32% 52%)" strokeWidth="1.5" />

      {/* Headwear / hair — soft rounded cap */}
      <path
        d="M38 50 Q40 30 60 28 Q80 30 82 50"
        fill="hsl(210 32% 52% / 0.20)"
        stroke="hsl(210 32% 52%)"
        strokeWidth="1"
      />

      {/* Eyes */}
      {pose === "listening" ? (
        /* Soft closed eyes — listening / serene */
        <>
          <path d="M50 50 Q53 47 56 50" stroke="hsl(209 30% 24%)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M64 50 Q67 47 70 50" stroke="hsl(209 30% 24%)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        </>
      ) : (
        /* Open warm eyes */
        <>
          <circle cx="52" cy="50" r="4" fill="hsl(209 30% 24%)" />
          <circle cx="68" cy="50" r="4" fill="hsl(209 30% 24%)" />
          <circle cx="53.5" cy="48.5" r="1.2" fill="white" />
          <circle cx="69.5" cy="48.5" r="1.2" fill="white" />
        </>
      )}

      {/* Smile */}
      <path
        d="M50 58 Q60 66 70 58"
        stroke="hsl(209 30% 24%)"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Cheek blush */}
      <circle cx="44" cy="56" r="5" fill="hsl(0 60% 80% / 0.30)" />
      <circle cx="76" cy="56" r="5" fill="hsl(0 60% 80% / 0.30)" />

      {/* Speech bubbles for waving pose */}
      {pose === "waving" && (
        <>
          <circle cx="96" cy="28" r="10" fill="hsl(45 66% 47% / 0.20)" stroke="hsl(45 66% 47%)" strokeWidth="1" />
          <circle cx="96" cy="28" r="2" fill="hsl(45 66% 47%)" />
          <circle cx="93" cy="39" r="4" fill="hsl(45 66% 47% / 0.15)" stroke="hsl(45 66% 47%)" strokeWidth="1" />
        </>
      )}

      {/* Listening soundwave dots */}
      {pose === "listening" && (
        <>
          <circle cx="96" cy="44" r="2.5" fill="hsl(210 32% 52% / 0.5)" />
          <circle cx="96" cy="52" r="2.5" fill="hsl(210 32% 52% / 0.35)" />
          <circle cx="96" cy="60" r="2.5" fill="hsl(210 32% 52% / 0.2)" />
        </>
      )}
    </svg>
  )
}
