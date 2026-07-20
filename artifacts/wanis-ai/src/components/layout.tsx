import * as React from "react"
import { Link, useLocation } from "wouter"
import { Home, HeartPulse, Users, BookOpen, MessageCircle, Settings, Pill, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { KaabaIcon } from "@/components/KaabaIcon"
import { useMode } from "@/contexts/ModeContext"
import { useLang, type Language } from "@/contexts/LanguageContext"
import { SettingsSheet } from "@/components/SettingsSheet"

const RUFQA_COLOR = "#2F6D4F"

// Page title map for the mobile top bar
const PAGE_TITLES: Record<string, string> = {
  "/": "Wanis",
  "/check-in": "Check-in",
  "/family": "Family",
  "/memory": "Memory",
  "/companion": "Talk",
  "/rufqa": "Rufqa",
  "/duas": "Duas",
  "/recitation": "Recitation",
  "/together": "Together",
  "/medications": "Medications",
  "/doctor-briefs": "Doctor Brief",
}

function getCurrentTitle(location: string) {
  if (PAGE_TITLES[location]) return PAGE_TITLES[location]
  // match /check-in/:id
  if (location.startsWith("/check-in/")) return "Check-in"
  return "Wanis"
}

const allNavItems = [
  { nameKey: "home",       shortLabel: "Home",       href: "/",             icon: Home },
  { nameKey: "check_in",   shortLabel: "Check-in",   href: "/check-in",     icon: HeartPulse },
  { nameKey: "family",     shortLabel: "Family",      href: "/family",       icon: Users },
  { nameKey: "medications", shortLabel: "Meds",       href: "/medications",  icon: Pill },
  { nameKey: "doctor_brief", shortLabel: "Brief",     href: "/doctor-briefs", icon: FileText },
  { nameKey: "memory",     shortLabel: "Memory",      href: "/memory",       icon: BookOpen },
  { nameKey: "talk",       shortLabel: "Talk",        href: "/companion",    icon: MessageCircle },
  { nameKey: "recitation", shortLabel: "Recitation",  href: "/recitation",   icon: BookOpen },
  { nameKey: "rufqa",      shortLabel: "Rufqa",       href: "/rufqa",        icon: KaabaIcon, rufqa: true },
] as const

const personalNavItems = [
  { nameKey: "home",       shortLabel: "Home",       href: "/",           icon: Home },
  { nameKey: "talk",       shortLabel: "Talk",       href: "/companion", icon: MessageCircle },
  { nameKey: "check_in",   shortLabel: "Check-in",   href: "/check-in",  icon: HeartPulse },
  { nameKey: "recitation", shortLabel: "Recitation", href: "/recitation", icon: BookOpen },
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

// ── Mobile Top Bar (family mode only) ─────────────────────────────────────────
function MobileTopBar() {
  const [location] = useLocation()
  const title = getCurrentTitle(location)
  const isRufqa = location === "/rufqa" || location.startsWith("/rufqa")

  return (
    <div
      className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-background border-b border-border
                 flex items-center justify-between px-4"
    >
      {/* Left: brand name or Rufqa accent */}
      {title === "Wanis" ? (
        <div className="flex items-center h-full">
          <img src="/logo.png" alt="WanisAI" className="w-[110px] object-contain pointer-events-none -ml-4 -my-10" />
        </div>
      ) : (
        <span
          className="text-lg font-serif font-bold"
          style={isRufqa ? { color: RUFQA_COLOR } : undefined}
        >
          {title}
        </span>
      )}

      {/* Right: lang + settings */}
      <div className="flex items-center gap-2">
        <LanguageSwitcher compact />
        <SettingsSheet triggerClassName="w-9 h-9 flex items-center justify-center rounded-full bg-card text-muted-foreground hover:text-foreground transition-colors">
          <Settings className="w-4 h-4" />
        </SettingsSheet>
      </div>
    </div>
  )
}

// ── Navigation ─────────────────────────────────────────────────────────────────
export function Navigation() {
  const [location] = useLocation()
  const { mode } = useMode()
  const { t } = useLang()

  // ── Personal mode ─────────────────────────────────────────────────
  if (mode === "personal") {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border pb-safe">
        <div className="flex justify-around items-center h-[64px]">
          {personalNavItems.map((item) => {
            const isActive =
              location === item.href ||
              (item.href !== "/" && location.startsWith(item.href))
            return (
              <Link
                key={item.nameKey}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-[11px] font-semibold">{item.shortLabel}</span>
              </Link>
            )
          })}

          <div className="flex flex-col items-center justify-center flex-1 h-full gap-1">
            <SettingsSheet triggerClassName="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors w-full py-1">
              <Settings className="w-6 h-6" />
              <span className="text-[11px] font-semibold">{t("settings")}</span>
            </SettingsSheet>
          </div>
        </div>
      </div>
    )
  }

  // ── Family mode ───────────────────────────────────────────────────
  return (
    <>
      {/* Mobile top bar */}
      <MobileTopBar />

      {/* Mobile Bottom Tab Bar */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border
                   flex justify-around items-center px-1 pb-safe"
        style={{ height: 64 }}
      >
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
                "flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors",
                isActive
                  ? isRufqa ? "" : "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              style={isRufqa && isActive ? { color: RUFQA_COLOR } : undefined}
            >
              <item.icon
                className="w-5 h-5 shrink-0"
                style={isRufqa ? { color: RUFQA_COLOR } : undefined}
              />
              <span className="text-[10px] font-semibold leading-none">
                {item.shortLabel}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 bg-card border-r border-border z-50">
        <div className="w-full flex items-center justify-center pt-1 shrink-0">
          <img 
            src="/logo.png" 
            alt="WanisAI" 
            className="w-[200px] h-auto object-contain pointer-events-none -mt-12 -mb-12" 
          />
        </div>

        <div className="px-6 pb-2 pt-0 flex items-center justify-between shrink-0">
          <SettingsSheet />
          <LanguageSwitcher compact />
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
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
