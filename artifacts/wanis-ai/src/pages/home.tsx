import { useLocation } from "wouter"
import { useGetProfile, useGetCheckInDashboard } from "@workspace/api-client-react"
import { Button } from "@/components/ui/button"
import { Link } from "wouter"
import { ArrowRight, Users, ShieldCheck, HeartPulse } from "lucide-react"
import { motion } from "framer-motion"

export default function Home() {
  const { data: profile, isLoading: isProfileLoading } = useGetProfile()
  const { data: dashboard, isLoading: isDashboardLoading } = useGetCheckInDashboard()
  const [_, setLocation] = useLocation()

  if (isProfileLoading || isDashboardLoading) {
    return (
      <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-6">
        <div className="h-12 bg-card rounded-lg w-2/5 animate-pulse" />
        <div className="h-56 bg-card rounded-[2.5rem] w-full animate-pulse" />
        <div className="space-y-3">
          <div className="h-16 bg-card rounded-xl w-full animate-pulse" />
          <div className="h-16 bg-card rounded-xl w-full animate-pulse" />
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
            A quiet companion for your cognitive health journey.<br />Let's get things set up.
          </p>
          <Button size="lg" className="w-full mt-8" onClick={() => setLocation('/onboarding')}>
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="p-6 md:p-10 max-w-2xl mx-auto pb-24 md:pb-10 space-y-8"
    >
      {/* ── Greeting with ambient presence glow ── */}
      <section className="relative pt-2 pb-4 overflow-visible">
        {/* Slow-breathing ambient warmth — the one signature element */}
        <div className="presence-glow" aria-hidden="true" />

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative z-10 space-y-2"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-semibold tracking-tight text-foreground leading-tight">
            Hello,&nbsp;
            <span className="italic font-medium">{profile.name}</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground font-sans">
            Thought of you — how has this week been?
          </p>
        </motion.div>
      </section>

      {/* ── Hero Check-in card — distinct shape, stands alone ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
      >
        <Link href="/check-in">
          <div className="hero-checkin group cursor-pointer select-none">
            {/* Decorative ring — organic, not icon-in-circle */}
            <div className="hero-ring" aria-hidden="true" />

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="space-y-3">
                <span className="inline-block text-xs font-sans font-semibold uppercase tracking-widest text-primary-foreground/60">
                  Weekly check-in
                </span>
                <h2 className="text-3xl md:text-4xl font-serif font-semibold italic leading-snug text-primary-foreground">
                  Ready to reflect on<br />your week?
                </h2>
                <p className="text-primary-foreground/75 font-sans text-sm md:text-base leading-relaxed max-w-sm">
                  A few quiet minutes with yourself.<br />Your words help Wanis understand how you're really doing.
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

      {/* ── Quiet supporting links — subordinate list rhythm ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="space-y-2"
      >
        <Link href="/family">
          <div className="quiet-card group">
            <div className="quiet-card-accent bg-primary/60" />
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Users className="w-5 h-5 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="font-sans font-medium text-foreground group-hover:text-primary transition-colors text-sm">
                  Family Members
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Your circle</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        </Link>

        <Link href="/guardian">
          <div className="quiet-card group">
            <div className="quiet-card-accent bg-[#2F6D4F]/70" />
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <ShieldCheck className="w-5 h-5 text-[#2F6D4F] shrink-0" />
              <div className="min-w-0">
                <p className="font-sans font-medium text-foreground group-hover:text-[#2F6D4F] transition-colors text-sm">
                  Guardian Mode
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Your safety profile</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-[#2F6D4F] group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        </Link>
      </motion.div>

      {/* ── Recent mood trend — only when data exists ── */}
      {dashboard && dashboard.recentMoods.length > 0 && (
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
    </motion.div>
  )
}
