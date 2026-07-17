import { createContext, useContext, useState, useCallback } from "react"
import { useGetProfile, useUpsertProfile } from "@workspace/api-client-react"

export type ExperienceMode = "personal" | "family"

interface ModeContextValue {
  mode: ExperienceMode
  isLoading: boolean
  setMode: (mode: ExperienceMode) => Promise<void>
}

const ModeContext = createContext<ModeContextValue>({
  mode: "family",
  isLoading: false,
  setMode: async () => {},
})

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const { data: profile, isLoading } = useGetProfile()
  const upsertProfile = useUpsertProfile()
  const [localMode, setLocalMode] = useState<ExperienceMode | null>(null)

  const derivedMode: ExperienceMode =
    localMode ?? (profile?.experienceMode === "personal" ? "personal" : "family")

  const setMode = useCallback(
    async (newMode: ExperienceMode) => {
      setLocalMode(newMode)
      if (!profile) return
      try {
        await upsertProfile.mutateAsync({
          data: {
            name: profile.name,
            consentGiven: profile.consentGiven,
            dateOfBirth: profile.dateOfBirth ?? undefined,
            photoUrl: profile.photoUrl ?? undefined,
            consentNotes: profile.consentNotes ?? undefined,
            guardianModeEnabled: profile.guardianModeEnabled,
            experienceMode: newMode,
          },
        })
      } catch (e) {
        setLocalMode(null)
        console.error("Failed to save experience mode", e)
      }
    },
    [profile, upsertProfile]
  )

  return (
    <ModeContext.Provider value={{ mode: derivedMode, isLoading, setMode }}>
      {children}
    </ModeContext.Provider>
  )
}

export function useMode() {
  return useContext(ModeContext)
}
