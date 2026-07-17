import { useState, useEffect } from "react"
import { useLang } from "@/contexts/LanguageContext"

interface Timings {
  Fajr: string
  Dhuhr: string
  Asr: string
  Maghrib: string
  Isha: string
}

function stripTimezone(t: string) {
  return t.replace(/\s*\(.*?\)\s*$/, "").trim()
}

export function PrayerTimes({ compact = false }: { compact?: boolean }) {
  const { t } = useLang()
  const [timings, setTimings] = useState<Timings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    function fetchTimes(lat: number, lng: number) {
      const ts = Math.floor(Date.now() / 1000)
      fetch(
        `https://api.aladhan.com/v1/timings/${ts}?latitude=${lat}&longitude=${lng}&method=2`
      )
        .then((r) => r.json())
        .then((data) => {
          if (cancelled) return
          if (data?.data?.timings) {
            const raw = data.data.timings as Record<string, string>
            setTimings({
              Fajr: stripTimezone(raw.Fajr),
              Dhuhr: stripTimezone(raw.Dhuhr),
              Asr: stripTimezone(raw.Asr),
              Maghrib: stripTimezone(raw.Maghrib),
              Isha: stripTimezone(raw.Isha),
            })
          } else {
            setError(true)
          }
          setLoading(false)
        })
        .catch(() => {
          if (!cancelled) { setError(true); setLoading(false) }
        })
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchTimes(pos.coords.latitude, pos.coords.longitude),
        () => {
          // Fallback: Mecca coordinates
          fetchTimes(21.3891, 39.8579)
        },
        { timeout: 6000 }
      )
    } else {
      fetchTimes(21.3891, 39.8579)
    }

    return () => { cancelled = true }
  }, [])

  const prayers = [
    { key: "prayer_fajr", name: t("prayer_fajr"), time: timings?.Fajr },
    { key: "prayer_dhuhr", name: t("prayer_dhuhr"), time: timings?.Dhuhr },
    { key: "prayer_asr", name: t("prayer_asr"), time: timings?.Asr },
    { key: "prayer_maghrib", name: t("prayer_maghrib"), time: timings?.Maghrib },
    { key: "prayer_isha", name: t("prayer_isha"), time: timings?.Isha },
  ]

  if (error) return null

  if (compact) {
    return (
      <div className="bg-card border border-card-border rounded-2xl p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          {t("prayer_times")}
        </p>
        {loading ? (
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-1 h-10 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {prayers.map((p) => (
              <div
                key={p.key}
                className="flex-1 min-w-[56px] flex flex-col items-center gap-1 bg-background rounded-xl py-2 px-1"
              >
                <span className="text-[10px] font-semibold text-muted-foreground text-center leading-tight">
                  {p.name}
                </span>
                <span className="text-xs font-bold text-foreground tabular-nums">
                  {p.time ?? "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-serif font-semibold text-foreground">{t("prayer_times")}</h3>
      {loading ? (
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-card rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-2">
          {prayers.map((p) => (
            <div
              key={p.key}
              className="flex flex-col items-center gap-1 bg-card rounded-2xl py-3 px-2 border border-card-border"
            >
              <span className="text-[10px] font-semibold text-muted-foreground text-center leading-tight">
                {p.name}
              </span>
              <span className="text-sm font-bold text-foreground tabular-nums">
                {p.time ?? "—"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
