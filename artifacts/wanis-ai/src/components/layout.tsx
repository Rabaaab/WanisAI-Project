import * as React from "react"
import { Link, useLocation } from "wouter"
import { Home, HeartPulse, Users, BookOpen, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { KaabaIcon } from "@/components/KaabaIcon"
import { useMode } from "@/contexts/ModeContext"

const RUFQA_COLOR = "#2F6D4F"

const allNavItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Check-in", href: "/check-in", icon: HeartPulse },
  { name: "Family", href: "/family", icon: Users },
  { name: "Memory", href: "/memory", icon: BookOpen },
  { name: "Companion", href: "/companion", icon: MessageCircle },
  { name: "Hajj/Umrah Rufqa", href: "/guardian", icon: KaabaIcon, rufqa: true },
] as const

/** Simplified 3-item nav for personal mode */
const personalNavItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Talk", href: "/companion", icon: MessageCircle },
  { name: "Check-in", href: "/check-in", icon: HeartPulse },
]

export function Navigation() {
  const [location] = useLocation()
  const { mode } = useMode()

  if (mode === "personal") {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border pb-safe">
        <div className="flex justify-around items-center h-[80px]">
          {personalNavItems.map((item) => {
            const isActive =
              location === item.href ||
              (item.href !== "/" && location.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full gap-1.5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon
                  className={cn("w-7 h-7", isActive && "text-primary")}
                />
                <span className="text-xs font-semibold tracking-wide">
                  {item.name}
                </span>
                {isActive && (
                  <span className="absolute top-2 w-2 h-2 rounded-full bg-primary" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Bottom Tab Bar — family mode */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-[80px] bg-background border-t border-border z-50 px-2 pb-safe flex justify-around items-center">
        {allNavItems.map((item) => {
          const isActive =
            location === item.href ||
            (item.href !== "/" && location.startsWith(item.href))
          const isRufqa = "rufqa" in item && item.rufqa

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full min-h-[48px] gap-1 transition-colors relative",
                isActive
                  ? isRufqa
                    ? `text-[${RUFQA_COLOR}]`
                    : "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "w-6 h-6",
                  isRufqa ? `text-[${RUFQA_COLOR}]` : isActive ? "text-primary" : ""
                )}
              />
              <span className="text-[9px] font-medium leading-tight text-center px-0.5">
                {item.name}
              </span>
              {isActive && (
                <span
                  className="absolute top-1 w-1.5 h-1.5 rounded-full"
                  style={{
                    background: isRufqa ? RUFQA_COLOR : undefined,
                    ...(isRufqa ? {} : { backgroundColor: "hsl(var(--primary))" }),
                  }}
                />
              )}
            </Link>
          )
        })}
      </div>

      {/* Desktop Sidebar — family mode */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 bg-card border-r border-border z-50">
        <div className="p-6">
          <h1 className="text-2xl font-serif font-bold text-foreground">Wanis</h1>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {allNavItems.map((item) => {
            const isActive =
              location === item.href ||
              (item.href !== "/" && location.startsWith(item.href))
            const isRufqa = "rufqa" in item && item.rufqa

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors min-h-[48px]",
                  isActive
                    ? isRufqa
                      ? "bg-[#2F6D4F]/10 text-[#2F6D4F] font-medium"
                      : "bg-primary/10 text-primary font-medium"
                    : "text-foreground/70 hover:bg-black/5 hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 shrink-0",
                    isRufqa ? "text-[#2F6D4F]" : ""
                  )}
                />
                <span className="text-base leading-snug">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
