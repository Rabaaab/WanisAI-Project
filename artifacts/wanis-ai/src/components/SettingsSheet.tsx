import { useState } from "react"
import { Settings, LogOut, RefreshCw, Users, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMode } from "@/contexts/ModeContext"
import { useUpsertProfile, useGetProfile } from "@workspace/api-client-react"
import { useLocation } from "wouter"

export function SettingsSheet() {
  const [open, setOpen] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const { mode, setMode } = useMode()
  const upsertProfile = useUpsertProfile()
  const { data: profile } = useGetProfile()
  const [_, setLocation] = useLocation()

  const handleReset = async () => {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }
    // Clear profile and restart onboarding
    try {
      await upsertProfile.mutateAsync({
        data: {
          name: "",
          consentGiven: false,
          guardianModeEnabled: false,
          experienceMode: "family",
        },
      })
    } catch (_) {}
    setOpen(false)
    setLocation("/onboarding")
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Settings"
        className="flex items-center justify-center w-10 h-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Backdrop + panel */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => { setOpen(false); setConfirmReset(false) }}
          />

          {/* Panel */}
          <div className="relative z-10 w-full max-w-sm mx-4 bg-background rounded-3xl shadow-2xl p-6 space-y-5 mb-4 md:mb-0">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif font-semibold text-foreground">Settings</h2>
              <button
                onClick={() => { setOpen(false); setConfirmReset(false) }}
                className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-black/5 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {profile?.name && (
              <div className="flex items-center gap-3 p-3 bg-card rounded-2xl">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{profile.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{mode} mode</p>
                </div>
              </div>
            )}

            {/* Experience mode toggle */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide px-1">Experience</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setMode("personal"); setOpen(false) }}
                  className={[
                    "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                    mode === "personal"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40",
                  ].join(" ")}
                >
                  <User className="w-6 h-6" />
                  <span className="text-sm font-semibold">Simple</span>
                  <span className="text-xs opacity-70 leading-tight text-center">For me</span>
                </button>
                <button
                  onClick={() => { setMode("family"); setOpen(false) }}
                  className={[
                    "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                    mode === "family"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40",
                  ].join(" ")}
                >
                  <Users className="w-6 h-6" />
                  <span className="text-sm font-semibold">Full</span>
                  <span className="text-xs opacity-70 leading-tight text-center">For family</span>
                </button>
              </div>
            </div>

            {/* Reset / switch account */}
            <div className="pt-2 border-t border-border">
              {confirmReset ? (
                <div className="space-y-3">
                  <p className="text-sm text-foreground font-medium text-center">
                    This will clear your profile and restart setup. Are you sure?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setConfirmReset(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      disabled={upsertProfile.isPending}
                      onClick={handleReset}
                    >
                      Yes, Reset
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleReset}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                >
                  <LogOut className="w-5 h-5 shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-semibold">Reset / Switch Account</p>
                    <p className="text-xs opacity-70">Clear profile and start fresh</p>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
