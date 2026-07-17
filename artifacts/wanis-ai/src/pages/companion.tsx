import { useState, useRef, useEffect } from "react"
import { useLocation } from "wouter"
import { 
  useListAnthropicConversations, 
  useCreateAnthropicConversation,
  useGetAnthropicConversation,
  useListAnthropicMessages
} from "@workspace/api-client-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send, Plus, Bot, User } from "lucide-react"
import { motion } from "framer-motion"

export default function Companion() {
  const { data: conversations, refetch: refetchConvos } = useListAnthropicConversations()
  const createConvo = useCreateAnthropicConversation()
  
  const [activeId, setActiveId] = useState<number | null>(null)
  const { data: messages, refetch: refetchMessages } = useListAnthropicMessages(activeId || 0, {
    query: { enabled: !!activeId, queryKey: ['messages', activeId] }
  })
  
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-select first convo if none active
  useEffect(() => {
    if (!activeId && conversations && conversations.length > 0) {
      setActiveId(conversations[0].id)
    }
  }, [conversations, activeId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const handleNewConversation = async () => {
    try {
      const res = await createConvo.mutateAsync({
        data: { title: "New Chat" }
      })
      refetchConvos()
      setActiveId(res.id)
    } catch (e) {
      console.error(e)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || !activeId) return
    const currentInput = input
    setInput("")
    setIsStreaming(true)
    setStreamingContent("")

    // Optimistically update UI could go here, but let's rely on streaming
    
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/anthropic/conversations/${activeId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: currentInput })
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
                setStreamingContent(prev => prev + data.content);
              }
            } catch (e) {}
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

  return (
    <div className="h-[100dvh] pb-[80px] md:pb-0 flex flex-col md:flex-row bg-background">
      {/* Sidebar for Conversations */}
      <div className="w-full md:w-80 bg-card border-r border-border flex flex-col h-1/3 md:h-full shrink-0">
        <div className="p-4 border-b border-border">
          <Button onClick={handleNewConversation} className="w-full h-12 gap-2" variant="outline">
            <Plus className="w-5 h-5" /> New Conversation
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations?.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-colors min-h-[48px] ${
                activeId === c.id ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-black/5 text-foreground'
              }`}
            >
              <div className="truncate">{c.title}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-2/3 md:h-full relative bg-white">
        {!activeId ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground p-6 text-center">
            <div>
              <Bot className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-xl font-serif">Select or start a conversation</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              {messages?.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 text-lg leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                      : 'bg-card text-foreground rounded-tl-sm shadow-sm border border-card-border'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {isStreaming && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] md:max-w-[75%] rounded-2xl p-4 text-lg leading-relaxed bg-card text-foreground rounded-tl-sm shadow-sm border border-card-border">
                    {streamingContent || (
                      <span className="flex gap-1 items-center h-6">
                        <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce"></span>
                        <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-background border-t border-border">
              <form 
                onSubmit={e => { e.preventDefault(); handleSend(); }}
                className="flex gap-2 max-w-4xl mx-auto relative"
              >
                <Input 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="h-14 pl-6 pr-16 rounded-full bg-white shadow-sm border-input text-lg"
                  disabled={isStreaming}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!input.trim() || isStreaming}
                  className="absolute right-1 top-1 h-12 w-12 rounded-full"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
