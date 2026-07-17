import { useState } from "react"
import { useListMemoryPhotos, useCreateMemoryPhoto, useDeleteMemoryPhoto } from "@workspace/api-client-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ImagePlus, Trash2, Heart } from "lucide-react"
import { motion } from "framer-motion"
import { PhotoUploader, photoSrc } from "@/components/PhotoUploader"
import { useLang } from "@/contexts/LanguageContext"

export default function Memory() {
  const { t } = useLang()
  const { data: photos, isLoading, refetch } = useListMemoryPhotos()
  const createPhoto = useCreateMemoryPhoto()
  const deletePhoto = useDeleteMemoryPhoto()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [formData, setFormData] = useState({
    personName: "",
    relationship: "",
    photoUrl: "",
    notes: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.photoUrl) return
    try {
      await createPhoto.mutateAsync({ data: formData })
      setIsAddOpen(false)
      setFormData({ personName: "", relationship: "", photoUrl: "", notes: "" })
      refetch()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm(t("remove_memory"))) {
      try {
        await deletePhoto.mutateAsync({ id })
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
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
            Who is this?
          </h1>
          <p className="text-lg text-muted-foreground mt-1">
            Familiar faces and fond memories.
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto h-12">
              <ImagePlus className="w-5 h-5 me-2" /> {t("add_memory")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[440px] bg-background border-none rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif">{t("add_memory")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{t("person_name")}</Label>
                <Input required value={formData.personName} onChange={e => setFormData({...formData, personName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>{t("relationship")}</Label>
                <Input required value={formData.relationship} onChange={e => setFormData({...formData, relationship: e.target.value})} placeholder="e.g. My Grandson" />
              </div>
              <PhotoUploader
                label={t("photo")}
                value={formData.photoUrl}
                onChange={(path) => setFormData({ ...formData, photoUrl: path })}
              />
              <div className="space-y-2">
                <Label>{t("a_small_note")}</Label>
                <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="e.g. He loves playing soccer." />
              </div>
              <Button type="submit" className="w-full h-12 text-lg mt-4" disabled={createPhoto.isPending || !formData.photoUrl}>
                {t("save_memory")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          {[1,2].map(i => <div key={i} className="h-96 bg-card rounded-2xl" />)}
        </div>
      ) : photos && photos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {photos.map((photo) => (
            <Card key={photo.id} className="bg-white border-none shadow-md overflow-hidden group">
              <div className="h-64 sm:h-80 relative overflow-hidden bg-secondary">
                <img
                  src={photoSrc(photo.photoUrl) ?? photo.photoUrl}
                  alt={photo.personName}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(photo.id)} className="ml-auto">
                    <Trash2 className="w-4 h-4 mr-2" /> Remove
                  </Button>
                </div>
              </div>
              <CardContent className="p-6 text-center md:text-left">
                <h3 className="text-3xl font-serif font-bold text-foreground">{photo.personName}</h3>
                <p className="text-xl text-primary font-medium mt-1 flex items-center justify-center md:justify-start gap-2">
                  <Heart className="w-5 h-5 fill-current" /> {photo.relationship}
                </p>
                {photo.notes && (
                  <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                    "{photo.notes}"
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-card border-dashed border-2 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <ImagePlus className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-2xl font-serif text-foreground mb-2">No memories added yet</h3>
          <p className="text-muted-foreground mb-8 max-w-md text-lg">
            Add photos of loved ones. It helps to have familiar faces easily accessible.
          </p>
          <Button onClick={() => setIsAddOpen(true)} size="lg" className="h-14 px-8 text-lg rounded-full">
            Add First Photo
          </Button>
        </Card>
      )}
    </motion.div>
  )
}
