import { SVGProps } from "react"
import { cn } from "@/lib/utils"

export function KaabaIcon({
  className,
  ...props
}: SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path d="M4 21V5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V21H4Z" fill="#1A1A1A" />
      <path d="M4 8H20V10H4V8Z" fill="#D4AF37" />
      <path d="M4 11H20V11.5H4V11Z" fill="#D4AF37" />
      <path d="M10 15.5C10 14.6716 10.6716 14 11.5 14H12.5C13.3284 14 14 14.6716 14 15.5V21H10V15.5Z" fill="#D4AF37" />
      <path d="M12 14V21" stroke="#1A1A1A" strokeWidth="0.5" />
    </svg>
  )
}
