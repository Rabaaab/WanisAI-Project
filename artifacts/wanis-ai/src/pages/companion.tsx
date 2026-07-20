import { useState, useRef, useEffect } from "react"
import {
  useListGeminiConversations,
  useCreateGeminiConversation,
  useListGeminiMessages,
} from "@workspace/api-client-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mic, MicOff, Send } from "lucide-react"
import { motion } from "framer-motion"
import { WanisCharacter } from "@/components/WanisCharacter"
import { useLang } from "@/contexts/LanguageContext"

const getSR = () =>
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null

const SR_LANG: Record<string, string> = { en: "en-US", ar: "ar-SA", fr: "fr-FR" }

export default function Companion() {
  const { t, lang, setLang } = useLang()
  const { data: conversations, refetch: refetchConvos } =
    useListGeminiConversations()
  const createConvo = useCreateGeminiConversation()

  const [activeId, setActiveId] = useState<number | null>(null)
  const { data: messages, refetch: refetchMessages } = useListGeminiMessages(
    activeId || 0,
    { query: { enabled: !!activeId, queryKey: ["messages", activeId] } }
  )

  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [srAvailable] = useState(() => !!getSR())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const didInitRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  // Auto-create or resume today's conversation
  useEffect(() => {
    if (!Array.isArray(conversations) || didInitRef.current) return

    const today = new Date().toDateString()
    const todayConvo = conversations.find(
      (c) => new Date(c.createdAt).toDateString() === today
    )

    if (todayConvo) {
      setActiveId(todayConvo.id)
      didInitRef.current = true
    } else {
      const todayLabel = new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
      createConvo
        .mutateAsync({ data: { title: todayLabel } })
        .then((res: any) => {
          setActiveId(res.id)
          refetchConvos()
          didInitRef.current = true
        })
        .catch((err) => { console.error("Failed to create conversation", err) })
    }
  }, [conversations])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streamingContent])

  const handleSend = async () => {
    if (!input.trim() || !activeId) return
    const currentInput = input
    setInput("")
    setIsStreaming(true)
    setStreamingContent("")

    try {
      const res = await fetch(
        `${import.meta.env.BASE_URL}api/gemini/conversations/${activeId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: currentInput, lang }),
        }
      )

      if (!res.ok) {
        console.error(`Server error (${res.status}) when sending message`)
        setIsStreaming(false)
        return
      }

      if (!res.body) {
        console.error("No response body from server when sending message")
        setIsStreaming(false)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let gotContent = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const lines = decoder.decode(value).split("\n")
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.error) {
                console.warn("Stream error chunk:", data.error)
              } else if (data.content) {
                gotContent = true
                setStreamingContent((prev) => prev + data.content)
              }
            } catch (_) {}
          }
        }
      }

      if (!gotContent) {
        console.warn("No content received from stream; backend fallback will be used if available.")
      }

      refetchMessages()
    } catch (e) {
      console.error(e)
    } finally {
      setIsStreaming(false)
      setStreamingContent("")
    }
  }

  const handleVoice = () => {
    const SR = getSR()
    if (!SR) return

    // Toggle off if already listening
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
      setInput((prev) => (prev ? prev + " " + transcript : transcript))
      inputRef.current?.focus()
    }
    recognition.onerror = () => {
      setIsListening(false)
      recognitionRef.current = null
    }
    recognition.onend = () => {
      setIsListening(false)
      recognitionRef.current = null
    }
    recognition.start()
    setIsListening(true)
  }

  const hasMessages = Array.isArray(messages) && messages.length > 0
  const showWelcome = activeId && !hasMessages && !isStreaming

  return (
    <div className="h-[100dvh] pb-[80px] md:pb-0 flex flex-col bg-background">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-border bg-card/60">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <WanisCharacter pose={isStreaming ? "listening" : "default"} size={44} />
            <div>
              <h1 className="font-serif font-semibold text-foreground text-lg leading-tight">
                {t("companion_title")}
              </h1>
              <p className="text-xs text-muted-foreground font-sans">
                {isStreaming ? t("wanis_status") : t("companion_subtitle")}
              </p>
            </div>
          </div>
          <div className="flex gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
            {(["en", "ar", "fr"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors ${
                  lang === l
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l === "en" ? "EN" : l === "ar" ? "ع" : "FR"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {showWelcome ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center h-full p-8 text-center gap-6"
          >
            <WanisCharacter pose="waving" size={120} />
            <div className="space-y-3 max-w-sm">
              <p className="text-3xl font-serif font-medium text-foreground leading-snug">
                {t("im_here")}
              </p>
              <p className="text-xl font-serif text-foreground/80 leading-snug">
                {t("whats_on_your_mind")}
              </p>
              <p className="text-base text-muted-foreground font-sans">
                {t("type_or_tap")}
              </p>
            </div>
            <Button
              size="lg"
              className="h-16 px-10 rounded-2xl text-lg font-semibold shadow-md"
              onClick={() => inputRef.current?.focus()}
            >
              {t("start_talking")}
            </Button>
          </motion.div>
        ) : (
          <div className="p-4 md:p-6 space-y-5 max-w-2xl mx-auto">
            {Array.isArray(messages) && messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <WanisCharacter pose="listening" size={32} className="mt-1 me-2 shrink-0" />
                )}
                <div
                  className={`max-w-[80%] md:max-w-[72%] rounded-2xl p-4 text-base leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-card text-foreground rounded-tl-sm shadow-sm border border-card-border"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isStreaming && (
              <div className="flex justify-start items-start gap-2">
                <WanisCharacter pose="listening" size={32} className="mt-1 shrink-0" />
                <div className="max-w-[80%] rounded-2xl p-4 text-base leading-relaxed bg-card text-foreground rounded-tl-sm shadow-sm border border-card-border">
                  {streamingContent || (
                    <span className="flex gap-1.5 items-center h-6">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary/40 animate-bounce" />
                      <span className="w-2.5 h-2.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0.2s" }} />
                      <span className="w-2.5 h-2.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0.4s" }} />
                    </span>
                  )}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="shrink-0 p-4 bg-background border-t border-border">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend() }}
          className="flex gap-2 max-w-2xl mx-auto items-center"
        >
          {srAvailable && (
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={handleVoice}
              disabled={isStreaming}
              aria-label={isListening ? t("listening") : "Speak your message"}
              className={`h-14 w-14 rounded-full shrink-0 border-2 transition-colors ${
                isListening
                  ? "border-destructive text-destructive bg-destructive/5"
                  : "border-border text-muted-foreground hover:text-primary hover:border-primary"
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
          )}

          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? t("listening") : t("type_message")}
            className="h-14 px-6 rounded-full bg-white shadow-sm border-input text-base flex-1"
            disabled={isStreaming || isListening}
          />

          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isStreaming}
            aria-label={t("send")}
            className="h-14 w-14 rounded-full shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  )
}
