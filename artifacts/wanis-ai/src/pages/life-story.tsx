import { useState } from "react"
import { useListLifeStoryEntries, useCreateLifeStoryEntry } from "@workspace/api-client-react"
import { useLang } from "@/contexts/LanguageContext"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, Music, Pencil, Calendar, ArrowLeft, Loader2 } from "lucide-react"
import { Link } from "wouter"

export default function LifeStory() {
  const { t, isRTL, lang } = useLang()
  const { data: entries, isLoading, refetch } = useListLifeStoryEntries()
  const createEntry = useCreateLifeStoryEntry()
  
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    
    setIsSubmitting(true)
    try {
      await createEntry.mutateAsync({
        data: {
          source: "manual",
          content: content.trim()
        }
      })
      setContent("")
      refetch()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "checkin":
        return <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
      case "conversation":
        return <MessageCircle className="w-5 h-5 text-indigo-500 fill-indigo-500/20" />
      case "together":
        return <Music className="w-5 h-5 text-amber-500 fill-amber-500/20" />
      case "manual":
      default:
        return <Pencil className="w-5 h-5 text-teal-500 fill-teal-500/20" />
    }
  }

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case "checkin":
        return "bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30"
      case "conversation":
        return "bg-indigo-50 border-indigo-100 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900/30"
      case "together":
        return "bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/30"
      case "manual":
      default:
        return "bg-teal-50 border-teal-100 text-teal-700 dark:bg-teal-950/20 dark:border-teal-900/30"
    }
  }

  const getSourceLabel = (source: string) => {
    if (lang === "ar") {
      switch (source) {
        case "checkin": return "تسجيل حال"
        case "conversation": return "محادثة"
        case "together": return "أغنية/قصة"
        case "manual": return "ذكرى مضافة"
        default: return "ذكرى"
      }
    }
    if (lang === "fr") {
      switch (source) {
        case "checkin": return "Bilan"
        case "conversation": return "Conversation"
        case "together": return "Chanson/Histoire"
        case "manual": return "Souvenir ajouté"
        default: return "Souvenir"
      }
    }
    switch (source) {
      case "checkin": return "Check-in"
      case "conversation": return "Conversation"
      case "together": return "Song/Story"
      case "manual": return "Added Memory"
      default: return "Memory"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 max-w-3xl mx-auto space-y-8 pb-24 md:pb-10"
    >
      {/* Header */}
      <header className="space-y-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
          {lang === "ar" ? "العودة للرئيسية" : lang === "fr" ? "Retour" : "Back to Home"}
        </Link>
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
            {t("their_story")}
          </h1>
          <p className="text-lg text-muted-foreground mt-1">
            {t("story_subtitle")}
          </p>
        </div>
      </header>

      {/* Manual memory input form */}
      <Card className="bg-card border border-card-border shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="memory-input" className="text-sm font-bold text-foreground">
                {t("add_a_memory")}
              </label>
              <Textarea
                id="memory-input"
                placeholder={t("memory_placeholder")}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] rounded-2xl bg-background border-border resize-none"
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="px-6 h-10 rounded-xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {t("saving")}
                  </>
                ) : (
                  t("save_entry")
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Timeline Section */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-card rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : Array.isArray(entries) && entries.length > 0 ? (
          <div className="relative border-l border-border ml-4 pl-8 space-y-8 rtl:border-l-0 rtl:border-r rtl:ml-0 rtl:mr-4 rtl:pl-0 rtl:pr-8">
            <AnimatePresence>
              {entries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: isRTL ? 15 : -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group"
                >
                  {/* Timeline bullet icon */}
                  <div className="absolute -left-12 top-1 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform rtl:-left-0 rtl:-right-12">
                    {getSourceIcon(entry.source)}
                  </div>

                  {/* Entry Card */}
                  <div className="bg-card border border-card-border rounded-2xl p-5 shadow-sm space-y-3 group-hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between gap-3">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getSourceBadgeColor(entry.source)}`}>
                        {getSourceLabel(entry.source)}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(entry.createdAt).toLocaleDateString(lang, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-base text-foreground font-serif leading-relaxed whitespace-pre-line">
                      {entry.content}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="p-12 border border-dashed border-border rounded-2xl flex flex-col items-center text-center gap-2">
            <p className="text-base font-semibold text-foreground">
              {lang === "ar" ? "ابدأ قصتهم" : lang === "fr" ? "Commencez leur histoire" : "Begin their story"}
            </p>
            <p className="text-sm text-muted-foreground max-w-sm">
              {t("no_story_yet")}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
