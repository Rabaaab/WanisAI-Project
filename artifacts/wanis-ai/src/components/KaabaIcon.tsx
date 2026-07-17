import { SVGProps } from "react"
import { cn } from "@/lib/utils"

/**
 * Simplified Kaaba silhouette icon — used for the Hajj/Umrah Rufqa nav item.
 * Monochromatic; colour it via `className` (e.g. text-[#2F6D4F]).
 */
export function KaabaIcon({
  className,
  ...props
}: SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      {/* Roof ledge */}
      <rect x="3" y="7" width="18" height="1.8" rx="0.4" />
      {/* Main body */}
      <rect x="4.5" y="8.8" width="15" height="11.2" />
      {/* Kiswa band — decorative stripe near the top (lighter inset) */}
      <rect x="4.5" y="9.8" width="15" height="2.6" fill="white" opacity="0.22" />
      {/* Door — arched rectangle, lighter cutout */}
      <rect x="9.5" y="15.5" width="5" height="4.5" rx="0.6" fill="white" opacity="0.28" />
      {/* Base platform */}
      <rect x="3" y="20" width="18" height="1.6" rx="0.4" opacity="0.75" />
    </svg>
  )
}
