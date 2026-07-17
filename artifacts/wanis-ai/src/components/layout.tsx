import * as React from "react"
import { Link, useLocation } from "wouter"
import { Home, HeartPulse, Users, BookOpen, MessageCircle, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { KaabaIcon } from "@/components/KaabaIcon"
import { useMode } from "@/contexts/ModeContext"
import { useLang, type Language } from "@/contexts/LanguageContext"
import { SettingsSheet } from "@/components/SettingsSheet"

const RUFQA_COLOR = "#2F6D4F"

const allNavItems = [
  { nameKey: "home", href: "/", icon: Home },
  { nameKey: "check_in", href: "/check-in", icon: HeartPulse },
  { nameKey: "family", href: "/family", icon: Users },
  { nameKey: "memory", href: "/memory", icon: BookOpen },
  { nameKey: "talk", href: "/companion", icon: MessageCircle },
  { nameKey: "rufqa", href: "/guardian", icon: KaabaIcon, rufqa: true },
] as const

const personalNavItems = [
  { nameKey: "home", href: "/", icon: Home },
  { nameKey: "talk", href: "/companion", icon: MessageCircle },
  { nameKey: "check_in", href: "/check-in", icon: HeartPulse },
] as const

function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLang()
  const langs: { code: Language; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "ar", label: "ع" },
    { code: "fr", label: "FR" },
  ]

  if (compact) {
    return (
      <div className="flex gap-1">
        {langs.map((l) => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${
              lang === l.code
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-1.5 px-4 py-2">
      {langs.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
            lang === l.code
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-black/5"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}

export function Navigation() {
  const [location] = useLocation()
  const { mode } = useMode()
  const { t } = useLang()

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
                key={item.nameKey}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full gap-1.5 transition-colors relative",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("w-7 h-7", isActive && "text-primary")} />
                <span className="text-xs font-semibold tracking-wide">
                  {t(item.nameKey)}
                </span>
                {isActive && (
                  <span className="absolute top-2 w-2 h-2 rounded-full bg-primary" />
                )}
              </Link>
            )
          })}

          {/* Settings trigger in personal mode */}
          <div className="flex flex-col items-center justify-center flex-1 h-full gap-1.5">
            <SettingsSheet triggerClassName="flex flex-col items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors w-full py-2">
              <Settings className="w-7 h-7" />
              <span className="text-xs font-semibold tracking-wide">{t("settings")}</span>
            </SettingsSheet>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Bottom Tab Bar — family mode */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-[80px] bg-background border-t border-border z-50 px-1 pb-safe flex justify-around items-center">
        {allNavItems.map((item) => {
          const isActive =
            location === item.href ||
            (item.href !== "/" && location.startsWith(item.href))
          const isRufqa = "rufqa" in item && item.rufqa

          return (
            <Link
              key={item.nameKey}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full min-h-[48px] gap-0.5 transition-colors relative",
                isActive
                  ? isRufqa ? "" : "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              style={isRufqa && isActive ? { color: RUFQA_COLOR } : undefined}
            >
              <item.icon
                className={cn("w-5 h-5", isRufqa ? "" : isActive ? "text-primary" : "")}
                style={isRufqa ? { color: RUFQA_COLOR } : undefined}
              />
              <span className="text-[9px] font-medium leading-tight text-center px-0.5 truncate max-w-[52px]">
                {t(item.nameKey)}
              </span>
              {isActive && (
                <span
                  className="absolute top-1 w-1.5 h-1.5 rounded-full"
                  style={{
                    background: isRufqa ? RUFQA_COLOR : "hsl(var(--primary))",
                  }}
                />
              )}
            </Link>
          )
        })}
      </div>

      {/* Desktop Sidebar — family mode */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 bg-card border-r border-border z-50">
        <div className="p-6 pb-2">
          <h1 className="text-2xl font-serif font-bold text-foreground">Wanis</h1>
        </div>

        <div className="px-4 pb-2 flex items-center justify-between">
          <SettingsSheet />
          <LanguageSwitcher compact />
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {allNavItems.map((item) => {
            const isActive =
              location === item.href ||
              (item.href !== "/" && location.startsWith(item.href))
            const isRufqa = "rufqa" in item && item.rufqa

            return (
              <Link
                key={item.nameKey}
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
                  className={cn("w-5 h-5 shrink-0", isRufqa ? "text-[#2F6D4F]" : "")}
                />
                <span className="text-base leading-snug">{t(item.nameKey)}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <LanguageSwitcher />
        </div>
      </div>
    </>
  )
}
