import { useState } from "react"
import { Settings, LogOut, User, Users, X, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMode } from "@/contexts/ModeContext"
import { useLang, type Language } from "@/contexts/LanguageContext"
import { useUpsertProfile, useGetProfile } from "@workspace/api-client-react"
import { useLocation } from "wouter"

const LANG_LABELS: Record<Language, string> = { en: "English", ar: "العربية", fr: "Français" }

export function SettingsSheet({
  triggerClassName,
  children,
}: {
  triggerClassName?: string
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const { mode, setMode } = useMode()
  const { t, lang, setLang } = useLang()
  const upsertProfile = useUpsertProfile()
  const { data: profile } = useGetProfile()
  const [_, setLocation] = useLocation()

  const handleReset = async () => {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }
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

  const defaultTrigger = (
    <button
      onClick={() => setOpen(true)}
      aria-label={t("settings")}
      className="flex items-center justify-center w-10 h-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors"
    >
      <Settings className="w-5 h-5" />
    </button>
  )

  const customTrigger = children ? (
    <button onClick={() => setOpen(true)} className={triggerClassName}>
      {children}
    </button>
  ) : null

  return (
    <>
      {customTrigger ?? defaultTrigger}

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
              <h2 className="text-xl font-serif font-semibold text-foreground">{t("settings")}</h2>
              <button
                onClick={() => { setOpen(false); setConfirmReset(false) }}
                className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-black/5 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile display */}
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

            {/* Experience mode */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide px-1">
                {t("experience")}
              </p>
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
                  <span className="text-sm font-semibold">{t("simple_mode")}</span>
                  <span className="text-xs opacity-70 text-center">{t("for_me")}</span>
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
                  <span className="text-sm font-semibold">{t("full_mode")}</span>
                  <span className="text-xs opacity-70 text-center">{t("for_family")}</span>
                </button>
              </div>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide px-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                {t("language")}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(["en", "ar", "fr"] as Language[]).map((code) => (
                  <button
                    key={code}
                    onClick={() => setLang(code)}
                    className={[
                      "py-2.5 rounded-xl border-2 text-sm font-semibold transition-all",
                      lang === code
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40",
                    ].join(" ")}
                  >
                    {LANG_LABELS[code]}
                  </button>
                ))}
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
                    <Button variant="outline" className="flex-1" onClick={() => setConfirmReset(false)}>
                      {t("cancel")}
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
                  <div className="text-start">
                    <p className="text-sm font-semibold">{t("switch_account")}</p>
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
