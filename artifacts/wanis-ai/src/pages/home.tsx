import { useLocation } from "wouter"
import { useGetProfile, useGetCheckInDashboard } from "@workspace/api-client-react"
import { Button } from "@/components/ui/button"
import { Link } from "wouter"
import { ArrowRight, HeartPulse } from "lucide-react"
import { motion } from "framer-motion"
import { KaabaIcon } from "@/components/KaabaIcon"
import { useMode } from "@/contexts/ModeContext"
import { WanisCharacter } from "@/components/WanisCharacter"
import { PrayerTimes } from "@/components/PrayerTimes"
import { useLang } from "@/contexts/LanguageContext"
import { photoSrc } from "@/components/PhotoUploader"

const RUFQA_GREEN = "#2F6D4F"

// ── Inline SVG illustrations for each tile ──────────────────────────────────

function IllustrationTalk() {
  return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="200" height="140" rx="16" fill="hsl(210 32% 52% / 0.08)" />
      <circle cx="100" cy="80" r="44" fill="hsl(210 32% 52% / 0.14)" />
      {/* Simple character */}
      <circle cx="100" cy="62" r="18" fill="hsl(40 43% 92%)" stroke="hsl(210 32% 52%)" strokeWidth="1.5" />
      <circle cx="95" cy="60" r="3" fill="hsl(209 30% 24%)" />
      <circle cx="105" cy="60" r="3" fill="hsl(209 30% 24%)" />
      <path d="M93 66 Q100 72 107 66" stroke="hsl(209 30% 24%)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <ellipse cx="100" cy="94" rx="14" ry="18" fill="hsl(40 43% 92%)" stroke="hsl(210 32% 52%)" strokeWidth="1.5" />
      {/* Speech bubbles */}
      <rect x="118" y="30" width="52" height="28" rx="12" fill="hsl(45 66% 47% / 0.25)" stroke="hsl(45 66% 47%)" strokeWidth="1" />
      <circle cx="118" cy="58" r="4" fill="hsl(45 66% 47% / 0.2)" stroke="hsl(45 66% 47%)" strokeWidth="1" />
      <circle cx="32" cy="42" width="40" height="24" rx="10" fill="hsl(210 32% 52% / 0.2)" />
      <rect x="28" y="30" width="44" height="24" rx="10" fill="hsl(210 32% 52% / 0.20)" stroke="hsl(210 32% 52%)" strokeWidth="1" />
      <circle cx="28" cy="54" r="4" fill="hsl(210 32% 52% / 0.15)" stroke="hsl(210 32% 52%)" strokeWidth="1" />
      {/* Dots in bubbles */}
      <circle cx="134" cy="44" r="2.5" fill="hsl(45 66% 47%)" />
      <circle cx="144" cy="44" r="2.5" fill="hsl(45 66% 47%)" />
      <circle cx="154" cy="44" r="2.5" fill="hsl(45 66% 47%)" />
      <circle cx="40" cy="42" r="2" fill="hsl(210 32% 52%)" />
      <circle cx="50" cy="42" r="2" fill="hsl(210 32% 52%)" />
      <circle cx="60" cy="42" r="2" fill="hsl(210 32% 52%)" />
    </svg>
  )
}

function IllustrationCheckin() {
  return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="200" height="140" rx="16" fill="hsl(210 32% 52% / 0.06)" />
      {/* Gentle waves */}
      <path d="M0 90 Q50 70 100 90 Q150 110 200 90 L200 140 L0 140Z" fill="hsl(210 32% 52% / 0.08)" />
      <path d="M0 105 Q50 88 100 105 Q150 122 200 105 L200 140 L0 140Z" fill="hsl(210 32% 52% / 0.10)" />
      {/* Heart */}
      <path
        d="M100 54 C100 54 84 42 78 50 C72 58 84 70 100 82 C116 70 128 58 122 50 C116 42 100 54 100 54Z"
        fill="hsl(0 60% 75% / 0.40)"
        stroke="hsl(0 60% 65%)"
        strokeWidth="1.5"
      />
      {/* Stars / sparkles */}
      <circle cx="60" cy="35" r="3" fill="hsl(45 66% 47% / 0.7)" />
      <circle cx="140" cy="30" r="2.5" fill="hsl(45 66% 47% / 0.6)" />
      <circle cx="155" cy="55" r="2" fill="hsl(45 66% 47% / 0.5)" />
      <circle cx="45" cy="55" r="2" fill="hsl(45 66% 47% / 0.5)" />
      {/* Lines of reflection */}
      <line x1="65" y1="100" x2="135" y2="100" stroke="hsl(210 32% 52% / 0.25)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="72" y1="112" x2="128" y2="112" stroke="hsl(210 32% 52% / 0.18)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IllustrationMemory() {
  return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="200" height="140" rx="16" fill="hsl(45 66% 47% / 0.07)" />
      {/* Photo frames */}
      <rect x="20" y="20" width="80" height="64" rx="10" fill="hsl(40 43% 92%)" stroke="hsl(210 32% 52%)" strokeWidth="1.5" />
      <rect x="112" y="36" width="68" height="52" rx="8" fill="hsl(40 43% 92%)" stroke="hsl(210 32% 52%)" strokeWidth="1.5" />
      <rect x="40" y="96" width="120" height="28" rx="8" fill="hsl(40 43% 92%)" stroke="hsl(210 32% 52%)" strokeWidth="1.5" />
      {/* Photo placeholders — warm faces */}
      <circle cx="60" cy="44" r="16" fill="hsl(45 66% 47% / 0.25)" />
      <circle cx="60" cy="39" r="8" fill="hsl(45 66% 47% / 0.5)" />
      <ellipse cx="60" cy="58" rx="12" ry="8" fill="hsl(45 66% 47% / 0.35)" />
      <circle cx="146" cy="55" r="12" fill="hsl(210 32% 52% / 0.25)" />
      <circle cx="146" cy="51" r="6" fill="hsl(210 32% 52% / 0.45)" />
      <ellipse cx="146" cy="64" rx="9" ry="6" fill="hsl(210 32% 52% / 0.30)" />
      {/* Hearts on photos */}
      <path d="M76 22 C76 22 71 19 68 22 C65 25 71 29 76 33 C81 29 87 25 84 22 C81 19 76 22 76 22Z" fill="hsl(0 60% 75% / 0.5)" />
    </svg>
  )
}

function IllustrationFamily() {
  return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="200" height="140" rx="16" fill="hsl(210 32% 52% / 0.07)" />
      {/* Ground */}
      <ellipse cx="100" cy="128" rx="80" ry="14" fill="hsl(210 32% 52% / 0.10)" />
      {/* Three figures — adult, adult, child */}
      {/* Left adult */}
      <circle cx="62" cy="48" r="16" fill="hsl(40 43% 92%)" stroke="hsl(210 32% 52%)" strokeWidth="1.5" />
      <ellipse cx="62" cy="84" rx="13" ry="22" fill="hsl(40 43% 92%)" stroke="hsl(210 32% 52%)" strokeWidth="1.5" />
      <circle cx="57" cy="46" r="2.5" fill="hsl(209 30% 24%)" />
      <circle cx="67" cy="46" r="2.5" fill="hsl(209 30% 24%)" />
      <path d="M56 54 Q62 60 68 54" stroke="hsl(209 30% 24%)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Right adult */}
      <circle cx="138" cy="48" r="16" fill="hsl(40 43% 92%)" stroke="hsl(210 32% 52%)" strokeWidth="1.5" />
      <ellipse cx="138" cy="84" rx="13" ry="22" fill="hsl(40 43% 92%)" stroke="hsl(210 32% 52%)" strokeWidth="1.5" />
      <circle cx="133" cy="46" r="2.5" fill="hsl(209 30% 24%)" />
      <circle cx="143" cy="46" r="2.5" fill="hsl(209 30% 24%)" />
      <path d="M132 54 Q138 60 144 54" stroke="hsl(209 30% 24%)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Center child */}
      <circle cx="100" cy="58" r="12" fill="hsl(45 66% 47% / 0.30)" stroke="hsl(45 66% 47%)" strokeWidth="1.5" />
      <ellipse cx="100" cy="86" rx="10" ry="16" fill="hsl(45 66% 47% / 0.20)" stroke="hsl(45 66% 47%)" strokeWidth="1.5" />
      <circle cx="96" cy="57" r="2" fill="hsl(209 30% 24%)" />
      <circle cx="104" cy="57" r="2" fill="hsl(209 30% 24%)" />
      <path d="M95 63 Q100 68 105 63" stroke="hsl(209 30% 24%)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Connecting hands */}
      <line x1="75" y1="80" x2="88" y2="80" stroke="hsl(210 32% 52%)" strokeWidth="2" strokeLinecap="round" />
      <line x1="112" y1="80" x2="125" y2="80" stroke="hsl(210 32% 52%)" strokeWidth="2" strokeLinecap="round" />
      {/* Heart above */}
      <path d="M100 18 C100 18 93 13 90 18 C87 23 93 28 100 34 C107 28 113 23 110 18 C107 13 100 18 100 18Z" fill="hsl(0 60% 75% / 0.45)" />
    </svg>
  )
}

function IllustrationRufqa() {
  return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="200" height="140" rx="16" fill="hsl(151 39% 31% / 0.07)" />
      {/* Sky gradient */}
      <rect width="200" height="70" rx="16" fill="hsl(210 80% 85% / 0.25)" />
      {/* Ground */}
      <rect x="0" y="100" width="200" height="40" rx="0" fill="hsl(151 39% 31% / 0.10)" />
      {/* Kaaba silhouette */}
      <rect x="74" y="45" width="52" height="56" rx="4" fill="hsl(152 41% 21% / 0.80)" />
      <rect x="88" y="72" width="24" height="30" rx="2" fill="hsl(45 66% 47% / 0.60)" />
      <rect x="80" y="48" width="40" height="8" fill="hsl(45 66% 47% / 0.70)" />
      {/* Crescent moon */}
      <path d="M155 22 A14 14 0 1 1 155 50 A10 10 0 1 0 155 22Z" fill="hsl(45 66% 47%)" />
      {/* Stars */}
      <circle cx="130" cy="28" r="2" fill="hsl(45 66% 47% / 0.8)" />
      <circle cx="168" cy="18" r="1.5" fill="hsl(45 66% 47% / 0.7)" />
      <circle cx="38" cy="30" r="1.5" fill="hsl(45 66% 47% / 0.6)" />
      <circle cx="55" cy="18" r="2" fill="hsl(45 66% 47% / 0.5)" />
      {/* People silhouettes */}
      <circle cx="36" cy="95" r="8" fill="hsl(151 39% 31% / 0.50)" />
      <ellipse cx="36" cy="112" rx="7" ry="10" fill="hsl(151 39% 31% / 0.45)" />
      <circle cx="164" cy="95" r="8" fill="hsl(151 39% 31% / 0.50)" />
      <ellipse cx="164" cy="112" rx="7" ry="10" fill="hsl(151 39% 31% / 0.45)" />
    </svg>
  )
}

function IllustrationDuas() {
  return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="200" height="140" rx="16" fill="hsl(45 66% 47% / 0.08)" />
      {/* Hands in dua */}
      <path d="M60 90 Q70 60 80 50 Q90 42 100 45 Q110 42 120 50 Q130 60 140 90" stroke="hsl(210 32% 52%)" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M55 95 Q65 65 78 54 Q90 44 100 47 Q110 44 122 54 Q135 65 145 95" stroke="hsl(210 32% 52% / 0.5)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Light rays */}
      <line x1="100" y1="15" x2="100" y2="35" stroke="hsl(45 66% 47%)" strokeWidth="2" strokeLinecap="round" />
      <line x1="120" y1="20" x2="114" y2="38" stroke="hsl(45 66% 47% / 0.7)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="80" y1="20" x2="86" y2="38" stroke="hsl(45 66% 47% / 0.7)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="135" y1="30" x2="124" y2="44" stroke="hsl(45 66% 47% / 0.5)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="65" y1="30" x2="76" y2="44" stroke="hsl(45 66% 47% / 0.5)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Arabic calligraphy feel — stylized dots */}
      <circle cx="100" cy="120" r="5" fill="hsl(45 66% 47% / 0.60)" />
      <circle cx="85" cy="118" r="3.5" fill="hsl(45 66% 47% / 0.45)" />
      <circle cx="115" cy="118" r="3.5" fill="hsl(45 66% 47% / 0.45)" />
    </svg>
  )
}

// ── Feature tile data ────────────────────────────────────────────────────────

function getTiles(t: (k: string) => string) {
  return [
    {
      href: "/companion",
      labelKey: "talk",
      descKey: "companion_subtitle",
      illustration: IllustrationTalk,
      accent: "hsl(210 32% 52%)",
      bgFrom: "hsl(210 32% 52% / 0.06)",
    },
    {
      href: "/check-in",
      labelKey: "check_in",
      descKey: "ready_to_reflect",
      illustration: IllustrationCheckin,
      accent: "hsl(0 60% 65%)",
      bgFrom: "hsl(0 60% 65% / 0.06)",
    },
    {
      href: "/memory",
      labelKey: "memory",
      descKey: "no_memories",
      illustration: IllustrationMemory,
      accent: "hsl(45 66% 47%)",
      bgFrom: "hsl(45 66% 47% / 0.06)",
    },
    {
      href: "/family",
      labelKey: "family",
      descKey: "setting_up_family",
      illustration: IllustrationFamily,
      accent: "hsl(210 32% 52%)",
      bgFrom: "hsl(210 32% 52% / 0.06)",
    },
    {
      href: "/guardian",
      labelKey: "rufqa",
      descKey: "rufqa_desc",
      illustration: IllustrationRufqa,
      accent: RUFQA_GREEN,
      bgFrom: `${RUFQA_GREEN}0f`,
    },
    {
      href: "/duas",
      labelKey: "duas",
      descKey: "duas",
      illustration: IllustrationDuas,
      accent: "hsl(45 66% 47%)",
      bgFrom: "hsl(45 66% 47% / 0.06)",
    },
  ]
}

// ── Home page ────────────────────────────────────────────────────────────────

export default function Home() {
  const { data: profile, isLoading: isProfileLoading } = useGetProfile()
  const { data: dashboard } = useGetCheckInDashboard()
  const [_, setLocation] = useLocation()
  const { mode, setMode } = useMode()
  const { t } = useLang()
  const isPersonal = mode === "personal"

  if (isProfileLoading) {
    return (
      <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-6">
        <div className="h-40 bg-card rounded-[2.5rem] animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-44 bg-card rounded-2xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
            <HeartPulse className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-3xl font-serif font-semibold">Welcome to Wanis</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            A quiet companion for your cognitive health journey.
            <br />Let's get things set up.
          </p>
          <Button size="lg" className="w-full mt-8" onClick={() => setLocation("/onboarding")}>
            Start Setup
          </Button>
        </div>
      </div>
    )
  }

  const hasPendingAction =
    dashboard?.actionsCompleted !== undefined &&
    dashboard.totalCheckIns > 0 &&
    dashboard.actionsCompleted < dashboard.totalCheckIns

  const tiles = getTiles(t)
  const personalTiles = tiles.slice(0, 4)
  const displayTiles = isPersonal ? personalTiles : tiles

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="p-5 md:p-10 max-w-2xl mx-auto pb-28 md:pb-12 space-y-6"
    >
      {/* ── Hero pass card ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[hsl(210_32%_46%)] via-[hsl(210_32%_40%)] to-[hsl(210_38%_34%)] p-7 shadow-xl"
      >
        {/* Organic ring */}
        <div
          className="absolute -bottom-16 -end-16 w-64 h-64 rounded-full border border-white/10 pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 flex items-center gap-5">
          {/* Profile photo or Wanis character */}
          <div className="shrink-0">
            {profile.photoUrl ? (
              <img
                src={photoSrc(profile.photoUrl) ?? profile.photoUrl}
                alt={profile.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-white/30 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/15 border-2 border-white/25 flex items-center justify-center shadow-md">
                <WanisCharacter pose="default" size={64} />
              </div>
            )}
          </div>

          {/* Name + status */}
          <div className="flex-1 min-w-0">
            <p className="text-primary-foreground/70 text-xs font-semibold uppercase tracking-widest mb-1">
              {t("hello")},
            </p>
            <h1 className="text-3xl font-serif font-semibold text-primary-foreground leading-tight truncate">
              {profile.name}
            </h1>
            <p className="text-primary-foreground/75 text-sm mt-1.5 font-sans">
              {isPersonal ? t("what_would_you_like") : t("thought_of_you")}
            </p>
          </div>
        </div>

        {/* Check-in CTA */}
        <Link href="/check-in">
          <div className="relative z-10 mt-6 flex items-center justify-between bg-white/12 hover:bg-white/20 transition-colors rounded-2xl px-5 py-3.5 cursor-pointer">
            <div className="flex items-center gap-3">
              <HeartPulse className="w-5 h-5 text-primary-foreground/80 shrink-0" />
              <span className="text-primary-foreground font-sans font-medium text-sm">
                {t("weekly_checkin")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hasPendingAction && (
                <span className="bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {t("suggestion_waiting")}
                </span>
              )}
              <ArrowRight className="w-4 h-4 text-primary-foreground/70" />
            </div>
          </div>
        </Link>
      </motion.div>

      {/* ── Prayer times ── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <PrayerTimes compact />
      </motion.div>

      {/* ── Feature tiles ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="grid grid-cols-2 gap-3"
      >
        {displayTiles.map((tile, idx) => (
          <Link key={tile.href} href={tile.href}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.3 + idx * 0.05 }}
              className="group relative overflow-hidden rounded-2xl cursor-pointer"
              style={{ background: tile.bgFrom }}
            >
              {/* Illustration */}
              <div className="w-full aspect-[10/7] overflow-hidden">
                <tile.illustration />
              </div>

              {/* Label bar */}
              <div className="px-4 py-3">
                <p
                  className={`font-serif font-semibold leading-tight ${
                    isPersonal ? "text-base" : "text-sm"
                  } text-foreground group-hover:opacity-80 transition-opacity`}
                >
                  {t(tile.labelKey)}
                </p>
              </div>

              {/* Bottom accent line */}
              <div
                className="absolute bottom-0 start-0 end-0 h-0.5 opacity-30"
                style={{ background: tile.accent }}
              />
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* ── Recent mood trend — family mode only ── */}
      {!isPersonal && dashboard && dashboard.recentMoods.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="pt-2 space-y-3"
        >
          <h3 className="font-serif text-base font-medium text-muted-foreground tracking-wide">
            Recent mood
          </h3>
          <div className="flex gap-2">
            {dashboard.recentMoods.map((mood, idx) => (
              <div
                key={idx}
                className="flex-1 bg-card rounded-lg p-3 text-center border border-card-border"
              >
                <span className="text-xs font-sans font-medium text-foreground block capitalize truncate">
                  {mood}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5 block font-sans">
                  wk {dashboard.recentMoods.length - idx}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Mode switcher ── */}
      <div className="pt-2 flex justify-center">
        <button
          onClick={() => setMode(isPersonal ? "family" : "personal")}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 py-2 px-4"
        >
          {isPersonal ? "Switch to family view →" : "Switch to simplified view →"}
        </button>
      </div>
    </motion.div>
  )
}
