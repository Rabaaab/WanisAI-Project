import { useState } from "react"
import { useLocation } from "wouter"
import { useUpsertProfile } from "@workspace/api-client-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { HeartPulse, Check, ArrowRight, ShieldAlert, User, Users } from "lucide-react"
import type { ExperienceMode } from "@/contexts/ModeContext"
import { PhotoUploader } from "@/components/PhotoUploader"
import { useLang } from "@/contexts/LanguageContext"

const TOTAL_STEPS = 4

export default function Onboarding() {
  const [_, setLocation] = useLocation()
  const [step, setStep] = useState(1)
  const upsertProfile = useUpsertProfile()
  const { t } = useLang()

  const [name, setName] = useState("")
  const [dob, setDob] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")
  const [experienceMode, setExperienceMode] = useState<ExperienceMode>("family")

  const handleComplete = async () => {
    try {
      await upsertProfile.mutateAsync({
        data: {
          name: name || "Friend",
          dateOfBirth: dob || undefined,
          photoUrl: photoUrl || undefined,
          consentGiven: true,
          consentNotes: "Given during onboarding flow",
          guardianModeEnabled: false,
          experienceMode,
        },
      })
      setLocation("/")
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Step indicators */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-500 ${
                  step >= i ? "bg-primary w-8" : "bg-primary/20 w-4"
                }`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Basics */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-3">
                <HeartPulse className="w-12 h-12 text-primary mx-auto mb-4" />
                <h1 className="text-3xl font-serif font-bold text-foreground">
                  Welcome.
                </h1>
                <p className="text-lg text-muted-foreground">
                  Let's start with the basics.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    What should we call you?
                  </label>
                  <Input
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-14 text-lg bg-white border-none shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Date of Birth (optional)
                  </label>
                  <Input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="h-14 text-lg bg-white border-none shadow-sm"
                  />
                </div>

                <PhotoUploader
                  label="Your photo (optional)"
                  value={photoUrl}
                  onChange={setPhotoUrl}
                />

                <Button
                  size="lg"
                  className="w-full h-14 mt-8 rounded-xl text-lg"
                  onClick={() => setStep(2)}
                  disabled={!name.trim()}
                >
                  Continue <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Who will use this device? */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-3">
                <h1 className="text-3xl font-serif font-bold text-foreground">
                  Who will mainly use this?
                </h1>
                <p className="text-lg text-muted-foreground">
                  We'll set up the right view for you.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setExperienceMode("personal")}
                  className={`w-full rounded-2xl p-6 text-left border-2 transition-all flex items-start gap-4 min-h-[88px] ${
                    experienceMode === "personal"
                      ? "border-primary bg-primary/5"
                      : "border-border bg-white hover:border-primary/40"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-serif font-semibold text-foreground">
                      I will — this is my app
                    </p>
                    <p className="text-sm text-muted-foreground font-sans leading-snug">
                      Large buttons, simple screens, one step at a time.
                    </p>
                  </div>
                  {experienceMode === "personal" && (
                    <Check className="w-5 h-5 text-primary ml-auto shrink-0 mt-1" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setExperienceMode("family")}
                  className={`w-full rounded-2xl p-6 text-left border-2 transition-all flex items-start gap-4 min-h-[88px] ${
                    experienceMode === "family"
                      ? "border-primary bg-primary/5"
                      : "border-border bg-white hover:border-primary/40"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-serif font-semibold text-foreground">
                      I'm setting this up for a family member
                    </p>
                    <p className="text-sm text-muted-foreground font-sans leading-snug">
                      Full dashboard with history and all settings visible.
                    </p>
                  </div>
                  {experienceMode === "family" && (
                    <Check className="w-5 h-5 text-primary ml-auto shrink-0 mt-1" />
                  )}
                </button>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-14 rounded-xl text-lg bg-transparent"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  size="lg"
                  className="w-full h-14 rounded-xl text-lg"
                  onClick={() => setStep(3)}
                >
                  Continue <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Consent */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-3">
                <ShieldAlert className="w-12 h-12 text-accent mx-auto mb-4" />
                <h1 className="text-3xl font-serif font-bold text-foreground">
                  Your Choices
                </h1>
                <p className="text-lg text-muted-foreground">
                  A note on privacy and consent.
                </p>
              </div>

              <Card className="bg-card border-none">
                <CardContent className="p-6 space-y-4">
                  <p className="text-foreground/80 leading-relaxed">
                    You are setting this up while fully lucent. This is your
                    personal guardian.
                  </p>
                  <p className="text-foreground/80 leading-relaxed">
                    By continuing, you agree that if your memory changes over
                    time, the family members you invite can see your check-ins
                    to help care for you.
                  </p>
                  <p className="text-foreground/80 leading-relaxed font-medium">
                    You are in control.
                  </p>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-14 rounded-xl text-lg bg-transparent"
                  onClick={() => setStep(2)}
                >
                  Back
                </Button>
                <Button
                  size="lg"
                  className="w-full h-14 rounded-xl text-lg bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={() => setStep(4)}
                >
                  I Understand
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: All set */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8 text-center"
            >
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-12 h-12 text-primary" />
              </div>
              <h1 className="text-3xl font-serif font-bold text-foreground">
                All Set
              </h1>
              <p className="text-lg text-muted-foreground max-w-[280px] mx-auto">
                Thank you, {name}. Your space is ready. You can change the view
                at any time from the home screen.
              </p>

              <Button
                size="lg"
                className="w-full h-14 mt-8 rounded-xl text-lg"
                onClick={handleComplete}
                disabled={upsertProfile.isPending}
              >
                {upsertProfile.isPending ? "Setting up…" : "Go to Home"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
