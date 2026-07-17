import { useState, useRef, useEffect } from "react"
import {
  useListAnthropicConversations,
  useCreateAnthropicConversation,
  useListAnthropicMessages,
} from "@workspace/api-client-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mic, MicOff, Send, MessageCircle } from "lucide-react"
import { motion } from "framer-motion"

// SpeechRecognition shim
const getSR = () =>
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null

export default function Companion() {
  const { data: conversations, refetch: refetchConvos } =
    useListAnthropicConversations()
  const createConvo = useCreateAnthropicConversation()

  const [activeId, setActiveId] = useState<number | null>(null)
  const { data: messages, refetch: refetchMessages } = useListAnthropicMessages(
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

  // Auto-create or resume today's conversation on load
  useEffect(() => {
    if (!conversations || didInitRef.current) return

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
        .then((res) => {
          setActiveId(res.id)
          refetchConvos()
          didInitRef.current = true
        })
        .catch(console.error)
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
        `${import.meta.env.BASE_URL}api/anthropic/conversations/${activeId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: currentInput }),
        }
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
              if (data.done) break
              if (data.content) setStreamingContent((prev) => prev + data.content)
            } catch (_) {}
          }
        }
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
    const recognition = new SR()
    recognition.lang = "en-US"
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      setInput((prev) => (prev ? prev + " " + transcript : transcript))
      inputRef.current?.focus()
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
    recognition.start()
    setIsListening(true)
  }

  const hasMessages = messages && messages.length > 0
  const showWelcome = activeId && !hasMessages && !isStreaming

  return (
    <div className="h-[100dvh] pb-[80px] md:pb-0 flex flex-col bg-background">
      {/* Header */}
      <div className="shrink-0 px-6 py-5 border-b border-border bg-card/60">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="font-serif font-semibold text-foreground text-lg leading-tight">
              Wanis is here
            </h1>
            <p className="text-xs text-muted-foreground font-sans">
              Your daily companion
            </p>
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
            className="flex flex-col items-center justify-center h-full p-8 text-center gap-8"
          >
            <div className="space-y-3 max-w-sm">
              <p className="text-3xl font-serif font-medium text-foreground leading-snug">
                I'm here.
              </p>
              <p className="text-xl font-serif text-foreground/80 leading-snug">
                What's on your mind today?
              </p>
              <p className="text-base text-muted-foreground font-sans">
                You can type, or tap the microphone to speak.
              </p>
            </div>
            <Button
              size="lg"
              className="h-16 px-10 rounded-2xl text-lg font-semibold shadow-md"
              onClick={() => inputRef.current?.focus()}
            >
              Start talking
            </Button>
          </motion.div>
        ) : (
          <div className="p-4 md:p-6 space-y-5 max-w-2xl mx-auto">
            {messages?.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] md:max-w-[78%] rounded-2xl p-4 text-base leading-relaxed ${
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
              <div className="flex justify-start">
                <div className="max-w-[88%] md:max-w-[78%] rounded-2xl p-4 text-base leading-relaxed bg-card text-foreground rounded-tl-sm shadow-sm border border-card-border">
                  {streamingContent || (
                    <span className="flex gap-1.5 items-center h-6">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary/40 animate-bounce" />
                      <span
                        className="w-2.5 h-2.5 rounded-full bg-primary/40 animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full bg-primary/40 animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      />
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
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex gap-2 max-w-2xl mx-auto relative items-center"
        >
          {/* Mic button */}
          {srAvailable && (
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={handleVoice}
              disabled={isStreaming}
              aria-label={isListening ? "Listening…" : "Speak your message"}
              className={`h-14 w-14 rounded-full shrink-0 border-2 transition-colors ${
                isListening
                  ? "border-destructive text-destructive bg-destructive/5"
                  : "border-border text-muted-foreground hover:text-primary hover:border-primary"
              }`}
            >
              {isListening ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </Button>
          )}

          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening…" : "Type a message…"}
            className="h-14 pl-6 pr-4 rounded-full bg-white shadow-sm border-input text-base flex-1"
            disabled={isStreaming || isListening}
          />

          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isStreaming}
            aria-label="Send message"
            className="h-14 w-14 rounded-full shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  )
}
