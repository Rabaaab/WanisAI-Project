import { useState, useEffect, useRef } from "react"
import { useGetGuardianProfile, useUpsertGuardianProfile } from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MapPin, User, Activity, Save, Navigation, Phone, X, Loader2, AlertTriangle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { KaabaIcon } from "@/components/KaabaIcon"
import { PhotoUploader, photoSrc } from "@/components/PhotoUploader"
import { useLang } from "@/contexts/LanguageContext"

const RUFQA_GREEN = "#2F6D4F"
const RUFQA_GREEN_LIGHT = "#EDF7F2"

// ── I'm Lost Overlay ─────────────────────────────────────────────────────────

interface LostOverlayProps {
  meetingPointName: string
  meetingPointAddress: string
  groupLeaderPhone: string
  emergencyContactPhone?: string | null
  onClose: () => void
}

function LostOverlay({
  meetingPointName,
  meetingPointAddress,
  groupLeaderPhone,
  emergencyContactPhone,
  onClose,
}: LostOverlayProps) {
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null)
  const [gpsState, setGpsState] = useState<"loading" | "ready" | "denied">("loading")
  const watchRef = useRef<number | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsState("denied")
      return
    }
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGpsState("ready")
      },
      () => setGpsState("denied"),
      { enableHighAccuracy: true, timeout: 10000 }
    )
    return () => {
      if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current)
    }
  }, [])

  const encoded = encodeURIComponent(meetingPointAddress)

  const mapsUrl = gps
    ? `https://www.google.com/maps/dir/?api=1&origin=${gps.lat},${gps.lng}&destination=${encoded}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encoded}`

  const wazeUrl = `https://waze.com/ul?q=${encoded}&navigate=yes`

  const locationText = gps
    ? `https://maps.google.com/?q=${gps.lat},${gps.lng}`
    : null

  const leaderWhatsApp = (() => {
    const phone = groupLeaderPhone.replace(/\D/g, "")
    const msg = locationText
      ? `I need help. I am lost. My location: ${locationText}`
      : `I need help. I am lost. Please call me.`
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
  })()

  const emergencyWhatsApp = emergencyContactPhone
    ? (() => {
        const phone = emergencyContactPhone.replace(/\D/g, "")
        const msg = locationText
          ? `I need help. I am lost. My location: ${locationText}`
          : `I need help. I am lost. Please call me.`
        return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
      })()
    : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col overflow-y-auto"
      style={{ backgroundColor: RUFQA_GREEN_LIGHT }}
    >
      {/* Close button */}
      <div className="flex justify-end p-4">
        <button
          onClick={onClose}
          aria-label="Close"
          className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center text-foreground hover:bg-white transition-colors shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start px-6 pb-12 max-w-lg mx-auto w-full space-y-8 pt-4">
        {/* Heading */}
        <div className="text-center space-y-3">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2"
            style={{ backgroundColor: `${RUFQA_GREEN}20` }}
          >
            <MapPin className="w-10 h-10" style={{ color: RUFQA_GREEN }} />
          </div>
          <h1
            className="text-3xl md:text-4xl font-serif font-bold"
            style={{ color: RUFQA_GREEN }}
          >
            You are safe.
          </h1>
          <p className="text-xl text-foreground/80 font-medium">
            Here is what to do.
          </p>
        </div>

        {/* GPS status */}
        <div className="w-full bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          {gpsState === "loading" ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin shrink-0" style={{ color: RUFQA_GREEN }} />
              <p className="text-base text-foreground/70">Getting your location…</p>
            </>
          ) : gpsState === "ready" && gps ? (
            <>
              <div className="w-3 h-3 rounded-full bg-green-500 shrink-0 animate-pulse" />
              <p className="text-base text-foreground/80">
                Your location: <span className="font-mono text-sm">{gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}</span>
              </p>
            </>
          ) : (
            <>
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
              <p className="text-base text-foreground/70">Location unavailable — links will still work</p>
            </>
          )}
        </div>

        {/* Meeting point */}
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm space-y-1">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Meet here</p>
          <p className="text-2xl font-serif font-bold text-foreground">{meetingPointName}</p>
          <p className="text-base text-foreground/70">{meetingPointAddress}</p>
        </div>

        {/* Navigation buttons */}
        <div className="w-full space-y-3">
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="block">
            <button
              className="w-full h-16 rounded-2xl text-white text-xl font-semibold flex items-center justify-center gap-3 shadow-md transition-opacity hover:opacity-90"
              style={{ backgroundColor: RUFQA_GREEN }}
            >
              <Navigation className="w-6 h-6 shrink-0" />
              Take me to {meetingPointName}
            </button>
          </a>

          <a href={wazeUrl} target="_blank" rel="noopener noreferrer" className="block">
            <button className="w-full h-14 rounded-2xl bg-white border-2 text-lg font-semibold flex items-center justify-center gap-2 shadow-sm transition-opacity hover:opacity-80"
              style={{ borderColor: RUFQA_GREEN, color: RUFQA_GREEN }}
            >
              Open in Waze
            </button>
          </a>
        </div>

        {/* Alert buttons */}
        <div className="w-full space-y-3">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide text-center">Alert someone</p>

          <a href={leaderWhatsApp} target="_blank" rel="noopener noreferrer" className="block">
            <button
              className="w-full h-16 rounded-2xl text-white text-xl font-semibold flex items-center justify-center gap-3 shadow-md transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#25D366" }}
            >
              <Phone className="w-6 h-6 shrink-0" />
              Alert my group leader
            </button>
          </a>

          {emergencyWhatsApp && (
            <a href={emergencyWhatsApp} target="_blank" rel="noopener noreferrer" className="block">
              <button
                className="w-full h-16 rounded-2xl text-white text-xl font-semibold flex items-center justify-center gap-3 shadow-md transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#25D366" }}
              >
                <Phone className="w-6 h-6 shrink-0" />
                Alert emergency contact
              </button>
            </a>
          )}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="text-lg font-medium py-4 px-8 rounded-full border-2 bg-white transition-opacity hover:opacity-70"
          style={{ borderColor: RUFQA_GREEN, color: RUFQA_GREEN }}
        >
          I'm okay — Close
        </button>
      </div>
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Guardian() {
  const { t } = useLang()

  useEffect(() => {
    document.body.classList.add("guardian-theme")
    return () => document.body.classList.remove("guardian-theme")
  }, [])

  const { data: profile, isLoading, refetch } = useGetGuardianProfile()
  const upsertProfile = useUpsertGuardianProfile()

  const [isEditing, setIsEditing] = useState(false)
  const [showLost, setShowLost] = useState(false)
  const [formData, setFormData] = useState({
    pilgrimName: "",
    pilgrimPhotoUrl: "",
    hotelName: "",
    hotelAddress: "",
    hotelPhone: "",
    groupLeaderName: "",
    groupLeaderPhone: "",
    medicalNotes: "",
    emergencyNote: "",
    meetingPointName: "",
    meetingPointAddress: "",
    emergencyContactPhone: "",
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        pilgrimName: profile.pilgrimName || "",
        pilgrimPhotoUrl: profile.pilgrimPhotoUrl || "",
        hotelName: profile.hotelName || "",
        hotelAddress: profile.hotelAddress || "",
        hotelPhone: profile.hotelPhone || "",
        groupLeaderName: profile.groupLeaderName || "",
        groupLeaderPhone: profile.groupLeaderPhone || "",
        medicalNotes: profile.medicalNotes || "",
        emergencyNote: profile.emergencyNote || "",
        meetingPointName: profile.meetingPointName || "",
        meetingPointAddress: profile.meetingPointAddress || "",
        emergencyContactPhone: profile.emergencyContactPhone || "",
      })
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await upsertProfile.mutateAsync({ data: formData })
      setIsEditing(false)
      refetch()
    } catch (err) {
      console.error(err)
    }
  }

  if (isLoading) {
    return (
      <div className="p-10 animate-pulse text-center text-foreground/60">
        {t("rufqa")}…
      </div>
    )
  }

  const isSetup = !!profile?.pilgrimName
  const hasMeetingPoint = !!(profile?.meetingPointName && profile?.meetingPointAddress)

  if (!isSetup && !isEditing) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-card text-center">
        <KaabaIcon className="w-20 h-20 text-primary mb-6" />
        <h1 className="text-3xl font-serif font-bold text-foreground mb-4">
          {t("rufqa")}
        </h1>
        <p className="text-lg text-foreground/80 max-w-md mb-8">
          {t("rufqa_desc")}
        </p>
        <Button
          size="lg"
          onClick={() => setIsEditing(true)}
          className="px-8 h-14 rounded-full text-lg"
        >
          {t("setup_rufqa")}
        </Button>
      </div>
    )
  }

  return (
    <>
      {/* I'm Lost overlay */}
      <AnimatePresence>
        {showLost && profile && (
          <LostOverlay
            meetingPointName={profile.meetingPointName!}
            meetingPointAddress={profile.meetingPointAddress!}
            groupLeaderPhone={profile.groupLeaderPhone}
            emergencyContactPhone={profile.emergencyContactPhone}
            onClose={() => setShowLost(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 md:p-10 max-w-4xl mx-auto space-y-6 pb-24 md:pb-10"
      >
        {/* Active banner */}
        <div className="bg-primary text-primary-foreground p-6 rounded-2xl flex items-start gap-4 shadow-sm">
          <KaabaIcon className="w-8 h-8 shrink-0 mt-0.5 text-primary-foreground" />
          <div>
            <h2 className="text-xl font-serif font-bold">{t("rufqa_active")}</h2>
            <p className="text-primary-foreground/90 mt-1">{t("rufqa_desc")}</p>
          </div>
        </div>

        {/* ── I'm Lost button ── */}
        {isSetup && !isEditing && (
          hasMeetingPoint ? (
            <button
              onClick={() => setShowLost(true)}
              className="w-full h-20 rounded-2xl text-white text-2xl font-serif font-bold shadow-lg flex items-center justify-center gap-3 transition-transform active:scale-95"
              style={{ backgroundColor: RUFQA_GREEN }}
            >
              <MapPin className="w-7 h-7 shrink-0" />
              I'm Lost
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full h-20 rounded-2xl text-2xl font-serif font-bold shadow-sm flex items-center justify-center gap-3 border-2 border-dashed transition-opacity hover:opacity-70"
              style={{ borderColor: RUFQA_GREEN, color: RUFQA_GREEN, backgroundColor: RUFQA_GREEN_LIGHT }}
            >
              <MapPin className="w-7 h-7 shrink-0" />
              Set up "I'm Lost" →
            </button>
          )
        )}

        {isEditing ? (
          <Card className="bg-white border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Edit Safety Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Pilgrim info */}
                  <div className="space-y-4">
                    <h3 className="font-serif font-semibold text-lg border-b border-border pb-2" style={{ color: RUFQA_GREEN }}>
                      {t("pilgrim_info")}
                    </h3>
                    <div className="space-y-2">
                      <Label>{t("full_name")}</Label>
                      <Input
                        required
                        value={formData.pilgrimName}
                        onChange={(e) => setFormData({ ...formData, pilgrimName: e.target.value })}
                      />
                    </div>
                    <PhotoUploader
                      label={t("photo")}
                      value={formData.pilgrimPhotoUrl}
                      onChange={(path) => setFormData({ ...formData, pilgrimPhotoUrl: path })}
                    />
                  </div>

                  {/* Group leader */}
                  <div className="space-y-4">
                    <h3 className="font-serif font-semibold text-lg border-b border-border pb-2" style={{ color: RUFQA_GREEN }}>
                      {t("group_leader")}
                    </h3>
                    <div className="space-y-2">
                      <Label>{t("leader_name")}</Label>
                      <Input
                        required
                        value={formData.groupLeaderName}
                        onChange={(e) => setFormData({ ...formData, groupLeaderName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("leader_phone")}</Label>
                      <Input
                        required
                        placeholder="+966 5X XXX XXXX"
                        value={formData.groupLeaderPhone}
                        onChange={(e) => setFormData({ ...formData, groupLeaderPhone: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Accommodation */}
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="font-serif font-semibold text-lg border-b border-border pb-2" style={{ color: RUFQA_GREEN }}>
                      {t("accommodation")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("hotel_name")}</Label>
                        <Input
                          required
                          value={formData.hotelName}
                          onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("hotel_phone")}</Label>
                        <Input
                          value={formData.hotelPhone}
                          onChange={(e) => setFormData({ ...formData, hotelPhone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("hotel_address")}</Label>
                      <Input
                        required
                        value={formData.hotelAddress}
                        onChange={(e) => setFormData({ ...formData, hotelAddress: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Safe meeting point */}
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="font-serif font-semibold text-lg border-b border-border pb-2" style={{ color: RUFQA_GREEN }}>
                      Safe Meeting Point
                    </h3>
                    <p className="text-sm text-muted-foreground -mt-2">
                      If you get separated, this is where you should go. Saving this unlocks the "I'm Lost" button.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Meeting Point Name</Label>
                        <Input
                          placeholder="e.g. Hotel lobby, Gate 79"
                          value={formData.meetingPointName}
                          onChange={(e) => setFormData({ ...formData, meetingPointName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Meeting Point Address / Landmark</Label>
                        <Input
                          placeholder="e.g. Abraj Al-Bait Towers, Mecca"
                          value={formData.meetingPointAddress}
                          onChange={(e) => setFormData({ ...formData, meetingPointAddress: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Medical & Emergency */}
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="font-serif font-semibold text-lg border-b border-border pb-2" style={{ color: RUFQA_GREEN }}>
                      {t("medical_emergency")}
                    </h3>
                    <div className="space-y-2">
                      <Label>{t("medical_notes")}</Label>
                      <Textarea
                        value={formData.medicalNotes}
                        onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                        className="h-24"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("emergency_note")}</Label>
                      <Textarea
                        value={formData.emergencyNote}
                        onChange={(e) => setFormData({ ...formData, emergencyNote: e.target.value })}
                        placeholder="e.g. Please contact my group leader immediately."
                        className="h-24"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Emergency Contact Phone</Label>
                      <Input
                        placeholder="+966 5X XXX XXXX"
                        value={formData.emergencyContactPhone}
                        onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">
                        A family member or trusted contact — alerted via WhatsApp from the "I'm Lost" screen.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                    {t("cancel")}
                  </Button>
                  <Button type="submit" className="flex-1" disabled={upsertProfile.isPending}>
                    <Save className="w-4 h-4 me-2" /> {t("save_profile")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : profile ? (
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setIsEditing(true)} className="bg-white">
                {t("edit_profile")}
              </Button>
            </div>

            {profile.emergencyNote && (
              <Card className="bg-destructive/10 border-destructive/20">
                <CardContent className="p-6">
                  <h3 className="text-destructive font-bold mb-2 uppercase tracking-wide text-sm">
                    Emergency Note
                  </h3>
                  <p className="text-foreground text-lg">{profile.emergencyNote}</p>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pilgrim card */}
              <Card className="bg-white border-none shadow-sm overflow-hidden">
                <div className="h-3 w-full" style={{ backgroundColor: RUFQA_GREEN }} />
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    {profile.pilgrimPhotoUrl ? (
                      <img
                        src={photoSrc(profile.pilgrimPhotoUrl) ?? profile.pilgrimPhotoUrl}
                        className="w-16 h-16 rounded-full object-cover"
                        alt={profile.pilgrimName}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-primary" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-2xl font-serif font-bold text-foreground">
                        {profile.pilgrimName}
                      </h3>
                      <p className="text-muted-foreground">Rufqa Profile</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-card rounded-xl">
                      <User className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{t("group_leader")}</p>
                        <p className="text-lg">{profile.groupLeaderName}</p>
                        <p className="font-medium" style={{ color: RUFQA_GREEN }}>{profile.groupLeaderPhone}</p>
                      </div>
                    </div>

                    {profile.emergencyContactPhone && (
                      <div className="flex items-start gap-3 p-3 bg-card rounded-xl">
                        <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Emergency Contact</p>
                          <p className="font-medium" style={{ color: RUFQA_GREEN }}>{profile.emergencyContactPhone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Location & medical card */}
              <Card className="bg-white border-none shadow-sm">
                <CardContent className="p-6 space-y-5">
                  <div>
                    <h3 className="text-lg font-serif font-semibold flex items-center gap-2 mb-3">
                      <MapPin className="w-5 h-5 text-primary" /> {t("accommodation")}
                    </h3>
                    <div className="space-y-1">
                      <p className="text-lg font-medium">{profile.hotelName}</p>
                      <p className="text-muted-foreground">{profile.hotelAddress}</p>
                      {profile.hotelPhone && (
                        <p className="text-foreground pt-1">{profile.hotelPhone}</p>
                      )}
                    </div>
                  </div>

                  {profile.meetingPointName && (
                    <div>
                      <h3 className="text-lg font-serif font-semibold flex items-center gap-2 mb-2">
                        <Navigation className="w-5 h-5" style={{ color: RUFQA_GREEN }} />
                        Safe Meeting Point
                      </h3>
                      <p className="text-lg font-medium">{profile.meetingPointName}</p>
                      {profile.meetingPointAddress && (
                        <p className="text-muted-foreground text-sm">{profile.meetingPointAddress}</p>
                      )}
                    </div>
                  )}

                  {profile.medicalNotes && (
                    <div>
                      <h3 className="text-lg font-serif font-semibold flex items-center gap-2 mb-3">
                        <Activity className="w-5 h-5 text-primary" /> Medical
                      </h3>
                      <p className="text-foreground bg-card p-4 rounded-xl">{profile.medicalNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}
      </motion.div>
    </>
  )
}
