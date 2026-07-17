import { useLocation } from "wouter"
import { useGetProfile, useGetCheckInDashboard } from "@workspace/api-client-react"
import { Button } from "@/components/ui/button"
import { Link } from "wouter"
import { ArrowRight, Users, BookOpen, MessageCircle, HeartPulse } from "lucide-react"
import { motion } from "framer-motion"
import { KaabaIcon } from "@/components/KaabaIcon"
import { useMode } from "@/contexts/ModeContext"

const RUFQA_GREEN = "#2F6D4F"

export default function Home() {
  const { data: profile, isLoading: isProfileLoading } = useGetProfile()
  const { data: dashboard, isLoading: isDashboardLoading } = useGetCheckInDashboard()
  const [_, setLocation] = useLocation()
  const { mode, setMode } = useMode()
  const isPersonal = mode === "personal"

  if (isProfileLoading || isDashboardLoading) {
    return (
      <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-6">
        <div className="h-12 bg-card rounded-lg w-2/5 animate-pulse" />
        <div className="h-56 bg-card rounded-[2.5rem] w-full animate-pulse" />
        <div className="space-y-3">
          <div className="h-24 bg-card rounded-2xl w-full animate-pulse" />
          <div className="h-24 bg-card rounded-2xl w-full animate-pulse" />
          <div className="h-24 bg-card rounded-2xl w-full animate-pulse" />
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

  // Feature card data
  const featureCards = [
    {
      href: "/companion",
      icon: MessageCircle,
      label: "Talk with Wanis",
      description: "Have a conversation. Wanis is here to listen.",
      accentClass: "bg-accent/15",
      iconClass: "text-accent",
      hoverBorder: "hover:border-accent/40",
    },
    {
      href: "/memory",
      icon: BookOpen,
      label: "Memory Companion",
      description: "Look back at photos and memories of people you love.",
      accentClass: "bg-primary/10",
      iconClass: "text-primary",
      hoverBorder: "hover:border-primary/30",
    },
    {
      href: "/family",
      icon: Users,
      label: "Family Circle",
      description: "See your family members and their contact details.",
      accentClass: "bg-primary/10",
      iconClass: "text-primary",
      hoverBorder: "hover:border-primary/30",
    },
    {
      href: "/guardian",
      icon: KaabaIcon,
      label: "Hajj/Umrah Rufqa",
      description: "Your personal safety profile for the pilgrimage.",
      accentClass: "bg-[#2F6D4F]/10",
      iconClass: "text-[#2F6D4F]",
      hoverBorder: "hover:border-[#2F6D4F]/30",
      rufqa: true,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="p-6 md:p-10 max-w-2xl mx-auto pb-28 md:pb-12 space-y-8"
    >
      {/* ── Greeting ── */}
      <section className="relative pt-2 pb-2 overflow-visible">
        <div className="presence-glow" aria-hidden="true" />
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative z-10 space-y-2"
        >
          <h1
            className={`font-serif font-semibold tracking-tight text-foreground leading-tight ${
              isPersonal ? "text-4xl md:text-5xl" : "text-4xl md:text-5xl"
            }`}
          >
            Hello,&nbsp;
            <span className="italic font-medium">{profile.name}</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground font-sans">
            {isPersonal ? "What would you like to do?" : "Thought of you — how has this week been?"}
          </p>
        </motion.div>
      </section>

      {/* ── Hero Check-in card — unchanged ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
      >
        <Link href="/check-in">
          <div className="hero-checkin group cursor-pointer select-none">
            <div className="hero-ring" aria-hidden="true" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="space-y-3">
                <span className="inline-block text-xs font-sans font-semibold uppercase tracking-widest text-primary-foreground/60">
                  Weekly check-in
                </span>
                <h2 className="text-3xl md:text-4xl font-serif font-semibold italic leading-snug text-primary-foreground">
                  Ready to reflect on
                  <br />your week?
                </h2>
                <p className="text-primary-foreground/75 font-sans text-sm md:text-base leading-relaxed max-w-sm">
                  A few quiet minutes with yourself.
                  <br />Your words help Wanis understand how you're really doing.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-2 text-primary-foreground font-sans font-semibold text-sm group-hover:gap-3 transition-all duration-300">
                Begin this week's reflection
                <ArrowRight className="w-4 h-4 shrink-0" />
              </div>
            </div>
            {hasPendingAction && (
              <div className="absolute top-5 right-5 z-20">
                <span className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground text-xs font-sans font-semibold px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-foreground/70 inline-block" />
                  Suggestion waiting
                </span>
              </div>
            )}
          </div>
        </Link>
      </motion.div>

      {/* ── Feature cards ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className={`grid gap-3 ${isPersonal ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}
      >
        {featureCards.map((card) => (
          <Link key={card.href} href={card.href}>
            <div
              className={`feature-card group ${card.hoverBorder}`}
              style={card.rufqa ? { borderColor: `${RUFQA_GREEN}20` } : undefined}
            >
              {/* Colored icon badge */}
              <div
                className={`feature-card-icon ${card.accentClass} shrink-0`}
              >
                <card.icon
                  className={`w-7 h-7 ${card.iconClass}`}
                />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p
                  className={`font-serif font-semibold text-foreground group-hover:text-primary transition-colors leading-snug ${
                    isPersonal ? "text-xl" : "text-lg"
                  }`}
                  style={card.rufqa ? { color: undefined } : undefined}
                >
                  {card.label}
                </p>
                <p
                  className={`text-muted-foreground font-sans mt-0.5 leading-snug ${
                    isPersonal ? "text-base" : "text-sm"
                  }`}
                >
                  {card.description}
                </p>
              </div>

              <ArrowRight
                className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0"
                style={card.rufqa ? {} : undefined}
              />
            </div>
          </Link>
        ))}
      </motion.div>

      {/* ── Recent mood trend — family mode only ── */}
      {!isPersonal && dashboard && dashboard.recentMoods.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
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
