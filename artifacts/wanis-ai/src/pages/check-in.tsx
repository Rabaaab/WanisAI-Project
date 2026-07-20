import { useState, useRef } from "react"
import { useLocation } from "wouter"
import { useCreateCheckIn, useListCheckIns } from "@workspace/api-client-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Link } from "wouter"
import {
  HeartPulse, Send, CheckCircle2, ChevronRight,
  MessageSquareHeart, Mic, MicOff, Loader2,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useLang } from "@/contexts/LanguageContext"

const getSR = () =>
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null

const SR_LANG: Record<string, string> = { en: "en-US", ar: "ar-SA", fr: "fr-FR" }

const ANALYSIS_STEPS = [
  "reading_checkin",
  "comparing_pattern",
  "preparing_suggestion",
  "verifying",
]

export default function CheckIn() {
  const { t, lang } = useLang()
  const [_, setLocation] = useLocation()
  const { data: checkIns } = useListCheckIns()
  const createCheckIn = useCreateCheckIn()

  const [response, setResponse] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedCheckInId, setSubmittedCheckInId] = useState<number | null>(null)
  const [streamingAnalysis, setStreamingAnalysis] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [analysisStep, setAnalysisStep] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [srAvailable] = useState(() => !!getSR())
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const prompt = "Tell me about your week. Who did you talk to? How did you feel?"
  const weekOf = new Date().toISOString().split("T")[0]

  const handleVoice = () => {
    const SR = getSR()
    if (!SR) return

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
      setIsListening(false)
      return
    }

    const recognition = new SR()
    recognitionRef.current = recognition
    recognition.lang = SR_LANG[lang] ?? "en-US"
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      setResponse((prev) => (prev ? prev + " " + transcript : transcript))
      textareaRef.current?.focus()
    }
    recognition.onerror = () => { setIsListening(false); recognitionRef.current = null }
    recognition.onend = () => { setIsListening(false); recognitionRef.current = null }
    recognition.start()
    setIsListening(true)
  }

  const handleSubmit = async () => {
    if (!response.trim()) return
    setIsSubmitting(true)
    try {
      const result = await createCheckIn.mutateAsync({ data: { prompt, response, weekOf } })
      setSubmittedCheckInId(result.id)
      startStreaming(result.id)
    } catch (e) {
      console.error(e)
      setIsSubmitting(false)
    }
  }

  const startStreaming = async (id: number) => {
    setIsStreaming(true)
    setAnalysisStep(0)

    try {
      const res = await fetch(
        `${import.meta.env.BASE_URL}api/check-ins/${id}/analyze`,
        { method: "POST" }
      )
      if (!res.body) throw new Error("No response body")
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const lines = decoder.decode(value).split("\n")
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.status) {
                const stepIdx = ANALYSIS_STEPS.indexOf(data.status)
                if (stepIdx !== -1) setAnalysisStep(stepIdx)
              }
              if (data.done) break
              if (data.content) setStreamingAnalysis((prev) => prev + data.content)
            } catch (_) {}
          }
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsStreaming(false)
      // Advance to the final step just in case
      setAnalysisStep(ANALYSIS_STEPS.length)
    }
  }

  if (submittedCheckInId) {
    return (
      <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-8 pb-24 md:pb-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 pt-10"
        >
          <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-accent" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-foreground">
            {t("thank_you_sharing")}
          </h2>
          <p className="text-lg text-muted-foreground">
            Taking a moment for yourself is a wonderful habit.
          </p>
        </motion.div>

        {/* Visible analysis pipeline steps */}
        {isStreaming && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            {ANALYSIS_STEPS.map((key, idx) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: idx <= analysisStep ? 1 : 0.3, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                  idx === analysisStep
                    ? "bg-primary/10 border border-primary/20"
                    : idx < analysisStep
                    ? "bg-accent/8"
                    : "bg-card/50"
                }`}
              >
                {idx < analysisStep ? (
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                ) : idx === analysisStep ? (
                  <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-border shrink-0" />
                )}
                <span
                  className={`text-sm font-sans ${
                    idx <= analysisStep ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {t(key)}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}

        <Card className="bg-card border-none mt-8 overflow-hidden">
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <MessageSquareHeart className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-serif font-semibold">{t("our_thoughts")}</h3>
            </div>
            <div className="prose prose-blue prose-lg max-w-none text-foreground/80 font-serif leading-relaxed">
              {streamingAnalysis ? (
                <p>{streamingAnalysis}</p>
              ) : (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                  </span>
                  {t("reading_checkin")}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center mt-8">
          <Button
            size="lg"
            variant="outline"
            onClick={() => setLocation(`/check-in/${submittedCheckInId}`)}
            disabled={isStreaming}
          >
            {t("view_full_detail")} <ChevronRight className="ms-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 max-w-3xl mx-auto space-y-8 pb-24 md:pb-10"
    >
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
          {t("weekly_checkin")}
        </h1>
      </header>

      <Card className="border-none shadow-md overflow-hidden bg-white">
        <div className="h-2 bg-primary w-full" />
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-serif text-foreground font-medium">{prompt}</h2>
            <p className="text-muted-foreground text-sm">{t("write_much_little")}</p>
          </div>

          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder={isListening ? t("listening") : t("this_week_i")}
              className="min-h-[200px] text-lg p-6 bg-card border-none resize-none placeholder:text-muted-foreground/50 focus-visible:ring-primary focus-visible:bg-white transition-colors"
            />
            {srAvailable && (
              <button
                type="button"
                onClick={handleVoice}
                disabled={isSubmitting}
                aria-label={isListening ? t("listening") : t("tap_mic")}
                className={[
                  "absolute bottom-3 end-3 w-11 h-11 rounded-full flex items-center justify-center transition-all",
                  isListening
                    ? "bg-destructive text-destructive-foreground shadow-md scale-110"
                    : "bg-primary/10 text-primary hover:bg-primary/20",
                ].join(" ")}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            )}
          </div>

          {srAvailable && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5" />
              {t("tap_mic")}
            </p>
          )}

          <div className="flex justify-end pt-2">
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={!response.trim() || isSubmitting}
              className="w-full md:w-auto text-lg px-8 h-14 rounded-full"
            >
              {isSubmitting ? t("saving") : t("save_reflection")}{" "}
              <Send className="w-5 h-5 ms-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {Array.isArray(checkIns) && checkIns.length > 0 && (
        <div className="pt-8 space-y-4">
          <h3 className="text-xl font-serif font-semibold text-foreground">
            {t("past_checkins")}
          </h3>
          <div className="grid gap-4">
            {checkIns.map((ci) => (
              <Link key={ci.id} href={`/check-in/${ci.id}`}>
                <Card className="hover:shadow-md cursor-pointer border-none bg-card transition-shadow">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">
                        {t("week_of")}{" "}
                        {new Date(ci.weekOf).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {ci.response || "No response provided"}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
