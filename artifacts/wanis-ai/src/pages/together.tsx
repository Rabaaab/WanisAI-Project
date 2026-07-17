import { useState, useRef, useEffect } from "react"
import {
  useListMemoryPhotos,
  useListTogetherAudio,
  useCreateMemoryPhoto,
  useListAnthropicConversations,
  useCreateAnthropicConversation,
} from "@workspace/api-client-react"
import type { MemoryPhoto, TogetherAudio } from "@workspace/api-client-react"
import { useGetProfile } from "@workspace/api-client-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Mic, MicOff, BookmarkPlus, RefreshCw, Play, Pause, Heart } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { WanisCharacter } from "@/components/WanisCharacter"
import { photoSrc } from "@/components/PhotoUploader"
import { useLang } from "@/contexts/LanguageContext"

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "")

const SYSTEM_PROMPT = `You are Wanis. A family member is looking at a photo of someone they love. They may remember clearly, partially, or not at all — all responses are equally welcome. If they remember something, reflect it warmly back. If they are unsure or silent, gently share what the family noted about this person without any sense of correcting them. Never say 'that's wrong' or imply failure. Keep your response to 2–3 warm, gentle sentences. End by asking if they'd like to save what they just shared as a new memory note.`

const AUDIO_SYSTEM_PROMPT = `You are Wanis. A family member is listening to a familiar sound or song. They may recognise it clearly, vaguely, or not at all — every response is welcome. If they share a memory, reflect it back warmly. If they are unsure, respond with gentle curiosity, not prompting. Never evaluate or correct. Keep your response to 2–3 warm sentences. End by asking if they'd like to save what they just shared as a new memory note.`

const getSR = () =>
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null

const SR_LANG: Record<string, string> = { en: "en-US", ar: "ar-SA", fr: "fr-FR" }

const REMINISCENCE_LABELS: Record<string, string> = {
  music: "Songs & music",
  nasheed: "Nasheeds",
  voice: "Voice & stories only",
}

// ── Streaming hook ─────────────────────────────────────────────────────────────
function useWanisStream() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState("")
  const [finalText, setFinalText] = useState("")
  const [error, setError] = useState("")

  async function stream(conversationId: number, content: string, systemPrompt: string) {
    setIsStreaming(true)
    setStreamingText("")
    setFinalText("")
    setError("")

    try {
      const res = await fetch(
        `${BASE_URL}/api/anthropic/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, systemPrompt }),
        }
      )
      if (!res.ok || !res.body) {
        setError("Wanis couldn't respond. Please try again.")
        return
      }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        for (const line of decoder.decode(value).split("\n")) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.content) {
                accumulated += data.content
                setStreamingText(accumulated)
              }
            } catch (_) {}
          }
        }
      }
      setFinalText(accumulated)
    } catch {
      setError("Couldn't connect. Please check your network.")
    } finally {
      setIsStreaming(false)
      setStreamingText("")
    }
  }

  return { stream, isStreaming, streamingText, finalText, error, setError }
}

// ── Voice mic hook ─────────────────────────────────────────────────────────────
function useMic(lang: string, onResult: (text: string) => void) {
  const [isListening, setIsListening] = useState(false)
  const ref = useRef<any>(null)
  const srAvailable = !!getSR()

  function toggle() {
    const SR = getSR()
    if (!SR) return
    if (isListening && ref.current) {
      ref.current.stop()
      ref.current = null
      setIsListening(false)
      return
    }
    const r = new SR()
    ref.current = r
    r.lang = SR_LANG[lang] ?? "en-US"
    r.interimResults = false
    r.onresult = (e: any) => onResult(e.results[0][0].transcript)
    r.onerror = () => { setIsListening(false); ref.current = null }
    r.onend = () => { setIsListening(false); ref.current = null }
    r.start()
    setIsListening(true)
  }

  return { isListening, toggle, srAvailable }
}

// ── Photo card ─────────────────────────────────────────────────────────────────
function PhotoCard({ conversationId }: { conversationId: number | null }) {
  const { lang } = useLang()
  const { data: photos } = useListMemoryPhotos()
  const createMemory = useCreateMemoryPhoto()

  const [photo, setPhoto] = useState<MemoryPhoto | null>(null)
  const [input, setInput] = useState("")
  const [phase, setPhase] = useState<"idle" | "prompt" | "done">("idle")
  const [saved, setSaved] = useState(false)

  const { stream, isStreaming, streamingText, finalText, error, setError } = useWanisStream()
  const { isListening, toggle, srAvailable } = useMic(lang, (t) =>
    setInput((prev) => (prev ? prev + " " + t : t))
  )

  function pickPhoto() {
    if (!photos || photos.length === 0) return
    const pick = photos[Math.floor(Math.random() * photos.length)]
    setPhoto(pick)
    setInput("")
    setSaved(false)
    setError("")
    setPhase("prompt")
  }

  async function handleSend() {
    if (!conversationId || !photo || !input.trim()) return
    const context = `[Looking at a photo. Person: ${photo.personName}. Their relationship: ${photo.relationship}. Family notes: "${photo.notes || "none"}". The person viewing said: "${input.trim()}"]`
    await stream(conversationId, context, SYSTEM_PROMPT)
    setPhase("done")
  }

  async function handleSave() {
    if (!photo || !input.trim()) return
    await createMemory.mutateAsync({
      data: {
        personName: photo.personName,
        relationship: photo.relationship,
        photoUrl: photo.photoUrl,
        notes: `${photo.notes ? photo.notes + " — " : ""}Memory shared: ${input.trim()}`,
      },
    })
    setSaved(true)
  }

  const hasPhotos = photos && photos.length > 0
  const displayText = isStreaming ? streamingText : finalText

  return (
    <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-primary/6 px-6 py-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Heart className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-serif font-semibold text-foreground text-lg leading-tight">
            Tell me about this
          </h2>
          <p className="text-sm text-muted-foreground">
            A familiar face from your memory vault
          </p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {!hasPhotos && (
          <p className="text-muted-foreground text-center py-4 text-base">
            Add photos in the Memory section so Wanis can show them here.
          </p>
        )}

        {hasPhotos && phase === "idle" && (
          <div className="text-center py-4">
            <WanisCharacter pose="waving" size={80} className="mx-auto mb-4" />
            <p className="text-lg font-serif text-foreground mb-6">
              Would you like to look at a photo together?
            </p>
            <Button
              size="lg"
              className="h-14 px-10 rounded-2xl text-lg font-semibold"
              onClick={pickPhoto}
            >
              Show me a photo
            </Button>
          </div>
        )}

        {phase !== "idle" && photo && (
          <AnimatePresence mode="wait">
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* Photo — name hidden */}
              <div className="relative rounded-2xl overflow-hidden bg-card">
                <img
                  src={photoSrc(photo.photoUrl) ?? photo.photoUrl}
                  alt="A familiar face"
                  className="w-full max-h-72 object-cover"
                />
              </div>

              {/* Wanis prompt */}
              <div className="flex gap-3 items-start">
                <WanisCharacter pose="listening" size={36} className="shrink-0 mt-0.5" />
                <div className="bg-card rounded-2xl rounded-tl-sm p-4 text-base text-foreground leading-relaxed shadow-sm border border-card-border flex-1">
                  Who is this, or what do you remember about this moment?
                </div>
              </div>

              {/* Input */}
              {phase === "prompt" && (
                <div className="space-y-3">
                  <div className="relative">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={isListening ? "Listening…" : "Type or speak your memory…"}
                      className="min-h-[100px] resize-none rounded-2xl pr-14 text-base bg-card border-none shadow-sm"
                      disabled={isStreaming}
                    />
                    {srAvailable && (
                      <button
                        type="button"
                        onClick={toggle}
                        className={`absolute bottom-3 end-3 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          isListening
                            ? "bg-destructive/10 text-destructive"
                            : "bg-primary/10 text-primary hover:bg-primary/20"
                        }`}
                      >
                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 h-12 rounded-xl"
                      onClick={pickPhoto}
                      disabled={isStreaming}
                    >
                      <RefreshCw className="w-4 h-4 me-2" /> Different photo
                    </Button>
                    <Button
                      className="flex-1 h-12 rounded-xl font-semibold"
                      onClick={handleSend}
                      disabled={!input.trim() || isStreaming}
                    >
                      {isStreaming ? (
                        <span className="flex gap-1 items-center">
                          <span className="w-2 h-2 rounded-full bg-white animate-bounce" />
                          <span className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: "0.2s" }} />
                          <span className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: "0.4s" }} />
                        </span>
                      ) : "Share with Wanis"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Wanis response */}
              {(isStreaming || displayText) && (
                <div className="flex gap-3 items-start">
                  <WanisCharacter pose="listening" size={36} className="shrink-0 mt-0.5" />
                  <div className="bg-card rounded-2xl rounded-tl-sm p-4 text-base text-foreground leading-relaxed shadow-sm border border-card-border flex-1">
                    {displayText || (
                      <span className="flex gap-1.5 items-center h-6">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary/40 animate-bounce" />
                        <span className="w-2.5 h-2.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0.2s" }} />
                        <span className="w-2.5 h-2.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0.4s" }} />
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Save + try another */}
              {phase === "done" && finalText && (
                <div className="flex flex-col gap-3 pt-1">
                  {!saved ? (
                    <Button
                      size="lg"
                      className="w-full h-14 rounded-2xl text-lg font-serif font-semibold"
                      onClick={handleSave}
                      disabled={createMemory.isPending}
                    >
                      <BookmarkPlus className="w-5 h-5 me-2" />
                      {createMemory.isPending ? "Saving…" : "Save this memory"}
                    </Button>
                  ) : (
                    <div className="text-center py-2 text-primary font-medium">
                      ✓ Memory saved
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full h-12 rounded-xl"
                    onClick={() => { setPhase("idle"); setPhoto(null) }}
                  >
                    Look at another photo
                  </Button>
                </div>
              )}

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-xl p-3">{error}</p>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

// ── Audio card ─────────────────────────────────────────────────────────────────
function AudioCard({ conversationId }: { conversationId: number | null }) {
  const { lang } = useLang()
  const { data: audioList, isLoading } = useListTogetherAudio()
  const createMemory = useCreateMemoryPhoto()

  const [clip, setClip] = useState<TogetherAudio | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [input, setInput] = useState("")
  const [phase, setPhase] = useState<"idle" | "prompt" | "done">("idle")
  const [saved, setSaved] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const { stream, isStreaming, streamingText, finalText, error, setError } = useWanisStream()
  const { isListening, toggle, srAvailable } = useMic(lang, (t) =>
    setInput((prev) => (prev ? prev + " " + t : t))
  )

  const hasAudio = audioList && audioList.length > 0

  function pickClip() {
    if (!audioList || audioList.length === 0) return
    const pick = audioList[Math.floor(Math.random() * audioList.length)]
    setClip(pick)
    setInput("")
    setSaved(false)
    setError("")
    setPhase("prompt")
    setIsPlaying(false)
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
  }

  function togglePlay() {
    if (!clip) return
    const audioUrl = `${BASE_URL}/api/storage${clip.audioUrl}`
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl)
      audioRef.current.onended = () => setIsPlaying(false)
    }
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  // cleanup on unmount
  useEffect(() => {
    return () => { audioRef.current?.pause() }
  }, [])

  async function handleSend() {
    if (!conversationId || !clip || !input.trim()) return
    const context = `[Listening to a familiar sound titled: "${clip.title}" (uploaded by: ${clip.uploaderName}). The person listening said: "${input.trim()}"]`
    await stream(conversationId, context, AUDIO_SYSTEM_PROMPT)
    setPhase("done")
  }

  async function handleSave() {
    if (!clip || !input.trim()) return
    await createMemory.mutateAsync({
      data: {
        personName: "Shared memory",
        relationship: "Together moment",
        photoUrl: "",
        notes: `While listening to "${clip.title}": ${input.trim()}`,
      },
    })
    setSaved(true)
  }

  const displayText = isStreaming ? streamingText : finalText

  return (
    <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-accent/8 px-6 py-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-accent" stroke="currentColor" strokeWidth={2}>
            <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>
        <div>
          <h2 className="font-serif font-semibold text-foreground text-lg leading-tight">
            A familiar sound
          </h2>
          <p className="text-sm text-muted-foreground">
            Songs and stories from your family
          </p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {isLoading && (
          <div className="text-center py-4 text-muted-foreground animate-pulse">Loading…</div>
        )}

        {!isLoading && !hasAudio && (
          <div className="text-center py-6 space-y-3">
            <WanisCharacter pose="default" size={64} className="mx-auto opacity-60" />
            <p className="text-base text-muted-foreground leading-relaxed">
              Ask your family to add a song or story in Family Circle.
            </p>
          </div>
        )}

        {!isLoading && hasAudio && phase === "idle" && (
          <div className="text-center py-4">
            <WanisCharacter pose="waving" size={80} className="mx-auto mb-4" />
            <p className="text-lg font-serif text-foreground mb-6">
              Shall we listen to something familiar?
            </p>
            <Button
              size="lg"
              className="h-14 px-10 rounded-2xl text-lg font-semibold bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={pickClip}
            >
              Play something
            </Button>
          </div>
        )}

        {phase !== "idle" && clip && (
          <AnimatePresence mode="wait">
            <motion.div
              key={clip.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* Audio player */}
              <div className="bg-card rounded-2xl p-5 flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="w-14 h-14 rounded-full bg-accent flex items-center justify-center shrink-0 shadow-sm hover:opacity-90 transition-opacity"
                >
                  {isPlaying
                    ? <Pause className="w-6 h-6 text-accent-foreground" />
                    : <Play className="w-6 h-6 text-accent-foreground ms-0.5" />
                  }
                </button>
                <div>
                  <p className="font-serif font-semibold text-foreground text-lg">{clip.title}</p>
                  <p className="text-sm text-muted-foreground">Added by {clip.uploaderName}</p>
                </div>
              </div>

              {/* Wanis prompt */}
              <div className="flex gap-3 items-start">
                <WanisCharacter pose="listening" size={36} className="shrink-0 mt-0.5" />
                <div className="bg-card rounded-2xl rounded-tl-sm p-4 text-base text-foreground leading-relaxed shadow-sm border border-card-border flex-1">
                  Does this feel familiar? What does it bring to mind?
                </div>
              </div>

              {/* Input */}
              {phase === "prompt" && (
                <div className="space-y-3">
                  <div className="relative">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={isListening ? "Listening…" : "Share what comes to mind…"}
                      className="min-h-[100px] resize-none rounded-2xl pr-14 text-base bg-card border-none shadow-sm"
                      disabled={isStreaming}
                    />
                    {srAvailable && (
                      <button
                        type="button"
                        onClick={toggle}
                        className={`absolute bottom-3 end-3 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          isListening
                            ? "bg-destructive/10 text-destructive"
                            : "bg-accent/10 text-accent hover:bg-accent/20"
                        }`}
                      >
                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 h-12 rounded-xl"
                      onClick={pickClip}
                      disabled={isStreaming}
                    >
                      <RefreshCw className="w-4 h-4 me-2" /> Different clip
                    </Button>
                    <Button
                      className="flex-1 h-12 rounded-xl font-semibold bg-accent text-accent-foreground hover:bg-accent/90"
                      onClick={handleSend}
                      disabled={!input.trim() || isStreaming}
                    >
                      {isStreaming ? (
                        <span className="flex gap-1 items-center">
                          <span className="w-2 h-2 rounded-full bg-white animate-bounce" />
                          <span className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: "0.2s" }} />
                          <span className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: "0.4s" }} />
                        </span>
                      ) : "Share with Wanis"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Wanis response */}
              {(isStreaming || displayText) && (
                <div className="flex gap-3 items-start">
                  <WanisCharacter pose="listening" size={36} className="shrink-0 mt-0.5" />
                  <div className="bg-card rounded-2xl rounded-tl-sm p-4 text-base text-foreground leading-relaxed shadow-sm border border-card-border flex-1">
                    {displayText || (
                      <span className="flex gap-1.5 items-center h-6">
                        <span className="w-2.5 h-2.5 rounded-full bg-accent/40 animate-bounce" />
                        <span className="w-2.5 h-2.5 rounded-full bg-accent/40 animate-bounce" style={{ animationDelay: "0.2s" }} />
                        <span className="w-2.5 h-2.5 rounded-full bg-accent/40 animate-bounce" style={{ animationDelay: "0.4s" }} />
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Save + try another */}
              {phase === "done" && finalText && (
                <div className="flex flex-col gap-3 pt-1">
                  {!saved ? (
                    <Button
                      size="lg"
                      className="w-full h-14 rounded-2xl text-lg font-serif font-semibold bg-accent text-accent-foreground hover:bg-accent/90"
                      onClick={handleSave}
                      disabled={createMemory.isPending}
                    >
                      <BookmarkPlus className="w-5 h-5 me-2" />
                      {createMemory.isPending ? "Saving…" : "Save this memory"}
                    </Button>
                  ) : (
                    <div className="text-center py-2 text-accent font-medium">
                      ✓ Memory saved
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full h-12 rounded-xl"
                    onClick={() => { setPhase("idle"); setClip(null) }}
                  >
                    Listen to something else
                  </Button>
                </div>
              )}

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-xl p-3">{error}</p>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function Together() {
  const { data: profile } = useGetProfile()
  const { data: conversations, refetch: refetchConvos } = useListAnthropicConversations()
  const createConvo = useCreateAnthropicConversation()
  const [conversationId, setConversationId] = useState<number | null>(null)
  const didInitRef = useRef(false)

  // Set up or resume a Together conversation for today
  useEffect(() => {
    if (!conversations || didInitRef.current) return
    const todayKey = `Together — ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`
    const existing = conversations.find((c) => c.title === todayKey)
    if (existing) {
      setConversationId(existing.id)
      didInitRef.current = true
    } else {
      createConvo.mutateAsync({ data: { title: todayKey } }).then((res) => {
        setConversationId(res.id)
        refetchConvos()
        didInitRef.current = true
      })
    }
  }, [conversations])

  const reminiscenceMode = (profile as any)?.reminiscenceMode as string | null | undefined

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 md:p-10 max-w-2xl mx-auto space-y-6 pb-28 md:pb-12"
    >
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
          Together
        </h1>
        <p className="text-lg text-muted-foreground">
          Gentle moments of remembering
        </p>
        {reminiscenceMode && REMINISCENCE_LABELS[reminiscenceMode] && (
          <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full mt-1">
            {REMINISCENCE_LABELS[reminiscenceMode]}
          </span>
        )}
      </div>

      {/* Cards */}
      <PhotoCard conversationId={conversationId} />
      <AudioCard conversationId={conversationId} />

      {/* Framing note */}
      <p className="text-center text-sm text-muted-foreground pb-4 leading-relaxed max-w-sm mx-auto">
        There are no right or wrong answers here. Every memory is welcome.
      </p>
    </motion.div>
  )
}
