import { useListFamilyMembers, useDeleteFamilyMember } from "@workspace/api-client-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ImagePlus, Trash2, Heart, Users } from "lucide-react"
import { motion } from "framer-motion"
import { photoSrc } from "@/components/PhotoUploader"
import { useLang } from "@/contexts/LanguageContext"
import { Link } from "wouter"

export default function Memory() {
  const { t, lang } = useLang()
  const { data: members, isLoading, refetch } = useListFamilyMembers()
  const deleteMember = useDeleteFamilyMember()

  // Only show members who have a photo (they are the meaningful "who is this" cards)
  const photosWithPeople = Array.isArray(members)
    ? members.filter((m) => m.photoUrl)
    : []

  const handleDelete = async (id: number) => {
    if (confirm("Remove this family member from Memory? This will also remove them from Family Circle.")) {
      try {
        await deleteMember.mutateAsync({ id })
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
            Familiar faces from your family circle.
          </p>
        </div>

        {/* Direct to Family Circle for adding people */}
        <Link href="/family">
          <Button className="w-full md:w-auto h-12 gap-2">
            <Users className="w-5 h-5" /> Manage in Family Circle
          </Button>
        </Link>
      </header>

      {/* Info banner explaining the connection */}
      <div className="bg-primary/6 border border-primary/15 rounded-2xl p-4 flex items-start gap-3">
        <Heart className="w-5 h-5 text-primary shrink-0 mt-0.5 fill-current" />
        <p className="text-sm text-foreground/80 leading-relaxed">
          {lang === "ar"
            ? "هذه الصور تأتي مباشرة من الأشخاص الذين تضيفهم إلى Family Circle. إذا أضفت أو عدلت صورة هناك، ستظهر هنا تلقائيًا."
            : lang === "fr"
              ? "Ces photos viennent directement de la liste que vous gérez dans Family Circle. Si vous ajoutez ou modifiez une photo là-bas, elle apparaîtra ici automatiquement."
              : "These photos come directly from the people you add in Family Circle. If you add or update a photo there, it will appear here automatically."}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-96 bg-card rounded-2xl" />
          ))}
        </div>
      ) : photosWithPeople.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {photosWithPeople.map((member) => (
            <Card key={member.id} className="bg-white border-none shadow-md overflow-hidden group">
              <div className="h-64 sm:h-80 relative overflow-hidden bg-secondary">
                <img
                  src={photoSrc(member.photoUrl) ?? member.photoUrl ?? ""}
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(member.id)}
                    className="ml-auto"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Remove from Family Circle
                  </Button>
                </div>
              </div>
              <CardContent className="p-6 text-center md:text-left">
                <h3 className="text-3xl font-serif font-bold text-foreground">{member.name}</h3>
                <p className="text-xl text-primary font-medium mt-1 flex items-center justify-center md:justify-start gap-2">
                  <Heart className="w-5 h-5 fill-current" /> {member.relationship}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-card border-dashed border-2 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <ImagePlus className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-2xl font-serif text-foreground mb-2">No family photos yet</h3>
          <p className="text-muted-foreground mb-8 max-w-md text-lg">
            Add family members with photos in Family Circle — they will appear here automatically when you come back.
          </p>
          <Link href="/family">
            <Button size="lg" className="h-14 px-8 text-lg rounded-full gap-2">
              <Users className="w-5 h-5" /> Go to Family Circle
            </Button>
          </Link>
        </Card>
      )}
    </motion.div>
  )
}
