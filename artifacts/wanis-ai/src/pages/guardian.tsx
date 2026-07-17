import { useState, useEffect } from "react"
import { useGetGuardianProfile, useUpsertGuardianProfile } from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MapPin, User, Activity, Save } from "lucide-react"
import { motion } from "framer-motion"
import { KaabaIcon } from "@/components/KaabaIcon"
import { PhotoUploader, photoSrc } from "@/components/PhotoUploader"
import { useLang } from "@/contexts/LanguageContext"

export default function Guardian() {
  const { t } = useLang()

  useEffect(() => {
    document.body.classList.add("guardian-theme")
    return () => document.body.classList.remove("guardian-theme")
  }, [])

  const { data: profile, isLoading, refetch } = useGetGuardianProfile()
  const upsertProfile = useUpsertGuardianProfile()

  const [isEditing, setIsEditing] = useState(false)
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
                  <h3 className="font-serif font-semibold text-lg text-primary border-b border-border pb-2">
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
                  <h3 className="font-serif font-semibold text-lg text-primary border-b border-border pb-2">
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
                      value={formData.groupLeaderPhone}
                      onChange={(e) => setFormData({ ...formData, groupLeaderPhone: e.target.value })}
                    />
                  </div>
                </div>

                {/* Accommodation */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="font-serif font-semibold text-lg text-primary border-b border-border pb-2">
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

                {/* Medical & Emergency */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="font-serif font-semibold text-lg text-primary border-b border-border pb-2">
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
            <Card className="bg-white border-none shadow-sm overflow-hidden">
              <div className="h-3 bg-primary w-full" />
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

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-card rounded-xl">
                    <User className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{t("group_leader")}</p>
                      <p className="text-lg">{profile.groupLeaderName}</p>
                      <p className="text-primary font-medium">{profile.groupLeaderPhone}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-sm">
              <CardContent className="p-6 space-y-6">
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
  )
}
