import { useState, useRef, useEffect } from "react"
import { useLocation } from "wouter"
import { useCreateCheckIn, useListCheckIns } from "@workspace/api-client-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Link } from "wouter"
import { HeartPulse, Send, CheckCircle2, ChevronRight, MessageSquareHeart } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function CheckIn() {
  const [_, setLocation] = useLocation()
  const { data: checkIns, isLoading } = useListCheckIns()
  const createCheckIn = useCreateCheckIn()
  
  const [response, setResponse] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedCheckInId, setSubmittedCheckInId] = useState<number | null>(null)
  
  const [streamingAnalysis, setStreamingAnalysis] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  
  const prompt = "Tell me about your week. Who did you talk to? How did you feel?"
  const weekOf = new Date().toISOString().split('T')[0]

  const handleSubmit = async () => {
    if (!response.trim()) return
    setIsSubmitting(true)
    try {
      const result = await createCheckIn.mutateAsync({
        data: {
          prompt,
          response,
          weekOf
        }
      })
      setSubmittedCheckInId(result.id)
      startStreaming(result.id)
    } catch (e) {
      console.error(e)
      setIsSubmitting(false)
    }
  }

  const startStreaming = async (id: number) => {
    setIsStreaming(true)
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/check-ins/${id}/analyze`, { 
        method: 'POST' 
      });
      if (!res.body) throw new Error("No response body");
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) break;
              if (data.content) {
                setStreamingAnalysis(prev => prev + data.content);
              }
            } catch (e) {
              // Ignore parse errors on partial streams
            }
          }
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsStreaming(false)
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
          <h2 className="text-3xl font-serif font-bold text-foreground">Thank you for sharing</h2>
          <p className="text-lg text-muted-foreground">
            Taking a moment for yourself is a wonderful habit.
          </p>
        </motion.div>

        <Card className="bg-card border-none mt-8 overflow-hidden">
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <MessageSquareHeart className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-serif font-semibold">Our Thoughts</h3>
            </div>
            
            <div className="prose prose-blue prose-lg max-w-none text-foreground/80 font-serif leading-relaxed">
              {streamingAnalysis ? (
                <p>{streamingAnalysis}</p>
              ) : (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                  </span>
                  Reflecting on your words...
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
            View Full Detail <ChevronRight className="ml-2 w-4 h-4" />
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
          Weekly Check-in
        </h1>
      </header>

      <Card className="border-none shadow-md overflow-hidden bg-white">
        <div className="h-2 bg-primary w-full"></div>
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-serif text-foreground font-medium">
              {prompt}
            </h2>
            <p className="text-muted-foreground text-sm">
              Write as much or as little as you like. We're just here to listen.
            </p>
          </div>
          
          <Textarea 
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="This week, I..."
            className="min-h-[200px] text-lg p-6 bg-card border-none resize-none placeholder:text-muted-foreground/50 focus-visible:ring-primary focus-visible:bg-white transition-colors"
          />
          
          <div className="flex justify-end pt-4">
            <Button 
              size="lg" 
              onClick={handleSubmit} 
              disabled={!response.trim() || isSubmitting}
              className="w-full md:w-auto text-lg px-8 h-14 rounded-full"
            >
              {isSubmitting ? "Saving..." : "Save Reflection"} <Send className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {checkIns && checkIns.length > 0 && (
        <div className="pt-8 space-y-4">
          <h3 className="text-xl font-serif font-semibold text-foreground">Past Check-ins</h3>
          <div className="grid gap-4">
            {checkIns.map(ci => (
              <Link key={ci.id} href={`/check-in/${ci.id}`}>
                <Card className="hover-elevate cursor-pointer border-none bg-card">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Week of {new Date(ci.weekOf).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{ci.response || "No response provided"}</p>
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
