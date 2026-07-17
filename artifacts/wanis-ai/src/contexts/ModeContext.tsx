import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useUpsertProfile, useGetProfile } from "@workspace/api-client-react"

export type ExperienceMode = "personal" | "family"

interface ModeContextValue {
  mode: ExperienceMode
  setMode: (m: ExperienceMode) => void
}

const ModeContext = createContext<ModeContextValue>({
  mode: "family",
  setMode: () => {},
})

export function ModeProvider({ children }: { children: ReactNode }) {
  const { data: profile, isLoading } = useGetProfile()
  const upsertProfile = useUpsertProfile()

  const [mode, setModeState] = useState<ExperienceMode>("family")

  // Sync from profile once loaded
  useEffect(() => {
    if (!isLoading && profile?.experienceMode) {
      setModeState(profile.experienceMode as ExperienceMode)
    }
  }, [profile, isLoading])

  const setMode = (m: ExperienceMode) => {
    setModeState(m)
    if (!profile) return
    // Persist optimistically — don't await, don't block UI
    upsertProfile
      .mutateAsync({
        data: {
          name: profile.name ?? "",
          consentGiven: profile.consentGiven ?? false,
          experienceMode: m,
        },
      })
      .catch(() => {
        // Silently ignore persistence errors
      })
  }

  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ModeContext.Provider>
  )
}

export function useMode(): ModeContextValue {
  return useContext(ModeContext)
}
