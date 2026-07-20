import { useState, useRef } from "react"
import {
  useListFamilyMembers,
  useCreateFamilyMember,
  useDeleteFamilyMember,
  useListTogetherAudio,
  useCreateTogetherAudio,
  useDeleteTogetherAudio,
  useGetLatestFamilyLetter,
  useGenerateFamilyLetter,
  useListRoutines,
  useCreateRoutine,
  useDeleteRoutine,
  useGetProfile,
} from "@workspace/api-client-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Heart, Music, Phone, Plus, Shield, Trash2, Upload, User, Clock } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { PhotoUploader, photoSrc } from "@/components/PhotoUploader"
import { useUpload } from "@workspace/object-storage-web"
import { useLang } from "@/contexts/LanguageContext"

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Family() {
  const { t, lang } = useLang()
  const { data: familyMembers, isLoading, refetch } = useListFamilyMembers()
  const createFamilyMember = useCreateFamilyMember()
  const deleteFamilyMember = useDeleteFamilyMember()

  const { data: latestLetter, isLoading: isLoadingLetter, refetch: refetchLetter } = useGetLatestFamilyLetter()
  const generateLetter = useGenerateFamilyLetter()
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateLetter = async () => {
    setIsGenerating(true)
    try {
      await generateLetter.mutateAsync({ data: { lang } })
      await refetchLetter()
    } catch (err) {
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    phone: "",
    photoUrl: "",
    isEmergencyContact: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createFamilyMember.mutateAsync({
        data: {
          ...formData,
          isEmergencyContact: formData.isEmergencyContact || false,
        },
      })
      setIsAddOpen(false)
      setFormData({ name: "", relationship: "", phone: "", photoUrl: "", isEmergencyContact: false })
      refetch()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm(t("remove_family_member"))) {
      try {
        await deleteFamilyMember.mutateAsync({ id })
        refetch()
      } catch (err) {
        console.error(err)
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 pb-24 md:pb-10"
    >
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
            {t("family_circle")}
          </h1>
          <p className="text-lg text-muted-foreground mt-1">
            {t("people_who_matter")}
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="hidden md:flex gap-2">
              <Plus className="w-5 h-5" /> {t("add_member")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-background border-none rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif">
                {t("add_family_member")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{t("name")}</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sarah"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("relationship")}</Label>
                <Input
                  required
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  placeholder="e.g. Daughter"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("phone_number")}</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +1 555 123 4567"
                />
              </div>

              {/* ── Photo upload (replaces URL text field) ── */}
              <PhotoUploader
                value={formData.photoUrl}
                onChange={(objectPath) => setFormData({ ...formData, photoUrl: objectPath })}
              />

              <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
                <div className="space-y-0.5">
                  <Label>{t("emergency_contact")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("emergency_contact_desc")}
                  </p>
                </div>
                <Switch
                  checked={formData.isEmergencyContact}
                  onCheckedChange={(c) =>
                    setFormData({ ...formData, isEmergencyContact: c })
                  }
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-lg mt-4"
                disabled={createFamilyMember.isPending}
              >
                {t("save_member")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
        <p className="text-sm text-foreground/80 leading-relaxed">
          {lang === "ar"
            ? "أضف الأشخاص والصور هنا. ستظهر صورهم تلقائيًا في الذاكرة وفي تجربة «Tell me about this»."
            : lang === "fr"
              ? "Ajoutez les personnes et les photos ici. Leurs images apparaîtront automatiquement dans Mémoire et dans l’expérience «Tell me about this»."
              : "Add people and photos here. Their pictures will appear automatically in Memory and in the “Tell me about this” experience."}
        </p>
      </div>

      {/* Letter from Wanis Card */}
      <Card className="bg-card border border-card-border overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-foreground">
                  {t("letter_from_wanis")}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {t("family_letter")}
                </p>
              </div>
            </div>

            <Button
              onClick={handleGenerateLetter}
              disabled={isGenerating || isLoadingLetter}
              className="w-full sm:w-auto"
            >
              {t("generate_letter")}
            </Button>
          </div>

          {(isGenerating || isLoadingLetter) ? (
            <div className="py-8 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <p className="text-sm text-muted-foreground animate-pulse">
                {t("letter_loading")}
              </p>
            </div>
          ) : latestLetter?.letter ? (
            <div className="bg-background/50 border border-border/50 rounded-2xl p-5 space-y-3">
              <p className="text-base text-foreground leading-relaxed whitespace-pre-line font-serif italic">
                "{latestLetter.letter}"
              </p>
            </div>
          ) : (
            <div className="p-6 border border-dashed border-border rounded-2xl flex flex-col items-center text-center gap-2">
              <p className="text-sm text-muted-foreground max-w-md">
                {lang === "ar"
                  ? "يقوم ونيس بكتابة رسالة أسبوعية تلخص مزاج وتواصل قريبك بناءً على تسجيلات حالهم ومحادثاتهم."
                  : lang === "fr"
                    ? "Wanis rédige une lettre hebdomadaire résumant l'humeur et la connexion de votre proche en fonction de ses bilans et de ses conversations."
                    : "Wanis compiles a weekly letter summarizing your loved one's mood and connection based on their check-ins and companion conversations."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-card rounded-2xl" />
          ))}
        </div>
      ) : Array.isArray(familyMembers) && familyMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {familyMembers.map((member) => (
            <Card
              key={member.id}
              className="bg-white border-none shadow-sm overflow-hidden group"
            >
              <div className="h-32 bg-secondary/50 relative">
                {member.photoUrl ? (
                  <img
                    src={photoSrc(member.photoUrl)}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary/20">
                    <User className="w-16 h-16" />
                  </div>
                )}
                {member.isEmergencyContact && (
                  <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-sm">
                    <Shield className="w-3 h-3" /> {t("emergency_contact")}
                  </div>
                )}
              </div>
              <CardContent className="p-6 relative">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-foreground">
                      {member.name}
                    </h3>
                    <p className="text-muted-foreground flex items-center gap-1.5 mt-1">
                      <Heart className="w-4 h-4 text-primary" />
                      {member.relationship}
                    </p>
                  </div>
                </div>

                {member.phone && (
                  <div className="flex items-center gap-2 text-foreground/80 mt-4 bg-card p-3 rounded-xl">
                    <Phone className="w-4 h-4 text-primary" />
                    <span>{member.phone}</span>
                  </div>
                )}

                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleDelete(member.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-card border-dashed border-2 p-12 text-center flex flex-col items-center justify-center">
          <User className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-serif text-foreground mb-2">
            {t("family_circle_empty")}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {t("add_family_desc")}
          </p>
          <Button onClick={() => setIsAddOpen(true)} size="lg">
            {t("add_first_member")}
          </Button>
        </Card>
      )}

      {/* ── Routines section ── */}
      <RoutinesSection />

      {/* ── Sounds & Stories section ── */}
      <SoundsSection />

      {/* Mobile fab */}
      <div className="md:hidden fixed bottom-[100px] right-6 z-50">
        <Button
          size="icon"
          className="w-14 h-14 rounded-full shadow-lg"
          onClick={() => setIsAddOpen(true)}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </motion.div>
  )
}

// ── Routines section ──────────────────────────────────────────────────────────

function RoutinesSection() {
  const { data: routines, refetch: refetchRoutines } = useListRoutines()
  const createRoutine = useCreateRoutine()
  const deleteRoutine = useDeleteRoutine()

  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    time: "",
    description: "",
    frequency: "daily",
    appointmentDate: ""
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name.trim()) return
    try {
      await createRoutine.mutateAsync({ data: formData })
      setFormData({ name: "", time: "", description: "", frequency: "daily", appointmentDate: "" })
      setIsOpen(false)
      refetchRoutines()
    } catch (err) {
      console.error(err)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Remove this routine?")) return
    await deleteRoutine.mutateAsync({ id })
    refetchRoutines()
  }

  return (
    <div className="space-y-4 pt-4 border-t border-border mt-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" /> Daily Routines
          </h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Keep track of medications, meals, appointments, and daily habits.
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2 hidden md:flex">
              <Plus className="w-4 h-4" /> Add routine
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[420px] bg-background border-none rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif">Add a routine</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Routine Name</Label>
                <Input
                  required
                  placeholder="e.g. Morning Medication"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  placeholder="e.g. 08:00 AM"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Appointment Date (Optional)</Label>
                <Input
                  type="date"
                  value={formData.appointmentDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      appointmentDate: e.target.value,
                      frequency: e.target.value ? "appointment" : "daily",
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="e.g. Take with food"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-lg mt-2"
                disabled={!formData.name.trim() || createRoutine.isPending}
              >
                Save
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Button variant="outline" className="w-full md:hidden gap-2" onClick={() => setIsOpen(true)}>
        <Plus className="w-4 h-4" /> Add a routine
      </Button>

      {Array.isArray(routines) && routines.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {routines.map((r) => (
            <div
              key={r.id}
              className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{r.name}</p>
                {r.time && <p className="text-sm font-medium text-primary">{r.time}</p>}
                {r.appointmentDate && (
                  <p className="text-xs font-semibold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full inline-block mt-1">
                    Appointment: {new Date(r.appointmentDate).toLocaleDateString()}
                  </p>
                )}
                {r.description && <p className="text-sm text-muted-foreground mt-0.5">{r.description}</p>}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0 -mt-1 -mr-2"
                onClick={() => handleDelete(r.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {routines && routines.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-2">
          No routines added yet.
        </p>
      )}
    </div>
  )
}

// ── Sounds & Stories section ───────────────────────────────────────────────────

function SoundsSection() {
  const { data: profile } = useGetProfile()
  const { data: clips, refetch: refetchClips } = useListTogetherAudio()
  const createClip = useCreateTogetherAudio()
  const deleteClip = useDeleteTogetherAudio()

  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [uploaderName, setUploaderName] = useState("")
  const [audioUrl, setAudioUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { uploadFile, isUploading, error: uploadError } = useUpload({
    onSuccess: (res) => {
      setAudioUrl(res.objectPath)
      setUploading(false)
    },
  })

  async function handleAudioFile(file: File) {
    if (!file.type.startsWith("audio/")) return
    setUploading(true)
    await uploadFile(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !uploaderName.trim() || !audioUrl) return
    try {
      await createClip.mutateAsync({ data: { title, uploaderName, audioUrl } })
      setTitle("")
      setUploaderName("")
      setAudioUrl("")
      setIsOpen(false)
      refetchClips()
    } catch (err) {
      console.error(err)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Remove this audio clip?")) return
    await deleteClip.mutateAsync({ id })
    refetchClips()
  }

  return (
    <div className="space-y-4 pt-4 border-t border-border">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
            <Music className="w-6 h-6 text-accent" /> Sounds &amp; Stories
          </h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Upload meaningful songs, nasheeds, or voice recordings here. They become available in the Together experience.
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2 hidden md:flex">
              <Upload className="w-4 h-4" /> Add a sound
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[420px] bg-background border-none rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif">Add a sound or story</DialogTitle>
            </DialogHeader>

            {profile?.reminiscenceMode && profile.reminiscenceMode !== "music" && (
              <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 text-sm text-foreground/80 my-2">
                <p className="font-semibold text-accent mb-1 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Preference Note
                </p>
                <p>
                  The user prefers <strong>
                    {profile.reminiscenceMode === "nasheed" ? "nasheeds (vocal-only)" : "voice and stories only"}
                  </strong>. 
                  Please respect this choice and avoid uploading musical instruments.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  required
                  placeholder="e.g. Baba's favourite nasheed"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Your name</Label>
                <Input
                  required
                  placeholder="e.g. Fatima"
                  value={uploaderName}
                  onChange={(e) => setUploaderName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Audio file</Label>
                {audioUrl ? (
                  <div className="flex items-center gap-2 p-3 bg-card rounded-xl text-sm">
                    <Music className="w-4 h-4 text-accent shrink-0" />
                    <span className="flex-1 truncate text-foreground">File uploaded ✓</span>
                    <button type="button" onClick={() => setAudioUrl("")} className="text-muted-foreground hover:text-destructive text-xs">
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="w-full h-24 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-accent/50 hover:bg-card transition-colors"
                    disabled={uploading || isUploading}
                  >
                    {uploading || isUploading ? (
                      <span className="text-sm">Uploading…</span>
                    ) : (
                      <>
                        <Upload className="w-6 h-6" />
                        <span className="text-sm">Tap to choose an audio file</span>
                        <span className="text-xs opacity-60">MP3, M4A, WAV</span>
                      </>
                    )}
                  </button>
                )}
                {uploadError && (
                  <p className="text-xs text-destructive">{uploadError.message}</p>
                )}
                <input
                  ref={inputRef}
                  type="file"
                  accept="audio/*"
                  className="sr-only"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAudioFile(f) }}
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-lg mt-2"
                disabled={!title.trim() || !uploaderName.trim() || !audioUrl || createClip.isPending}
              >
                Save
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile button */}
      <Button variant="outline" className="w-full md:hidden gap-2" onClick={() => setIsOpen(true)}>
        <Upload className="w-4 h-4" /> Add a sound or story
      </Button>

      {Array.isArray(clips) && clips.length > 0 && (
        <div className="space-y-2">
          {clips.map((clip) => (
            <div
              key={clip.id}
              className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                <Music className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{clip.title}</p>
                <p className="text-sm text-muted-foreground">Added by {clip.uploaderName}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                onClick={() => handleDelete(clip.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {clips && clips.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-2">
          No sounds uploaded yet. Add one above to use it in Together.
        </p>
      )}
    </div>
  )
}
