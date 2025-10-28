"use client"

import { useState, useRef, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, Sparkles, User, Bot } from "lucide-react"

interface Message {
  id: number
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const initialMessages: Message[] = [
  {
    id: 1,
    role: "assistant",
    content:
      "Hello! I'm your AI assistant for regression analysis. I can help you understand your data, choose the right model, interpret results, and answer questions about regression techniques. How can I assist you today?",
    timestamp: new Date(),
  },
]

const suggestedQuestions = [
  "Which regression model should I use?",
  "How do I interpret R² score?",
  "What's the difference between Ridge and Lasso?",
  "How can I improve my model's accuracy?",
]

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: messages.length + 2,
        role: "assistant",
        content:
          "That's a great question! Based on your data characteristics, I'd recommend starting with a simple linear regression model to establish a baseline. This will help you understand the basic relationships in your data before moving to more complex models. Would you like me to explain the key metrics to look for?",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleSuggestedQuestion = (question: string) => {
    setInput(question)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 sm:gap-6 h-[calc(100vh-10rem)] sm:h-[calc(100vh-12rem)]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-serif font-normal">AI Assistant</h1>
              <Badge variant="secondary" className="gap-1 text-xs">
                <Sparkles className="w-3 h-3" />
                Powered by AI
              </Badge>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">Get expert guidance on regression analysis</p>
          </div>
        </div>

        {/* Chat Container */}
        <Card className="flex-1 flex flex-col glass-strong">
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 sm:gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-3 sm:p-4 transition-smooth ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground border border-border"
                    }`}
                  >
                    <p className="text-xs sm:text-sm leading-relaxed">{message.content}</p>
                    <p
                      className={`text-[10px] sm:text-xs mt-2 ${
                        message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg p-3 sm:p-4 border border-border">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length === 1 && (
              <div className="px-4 sm:px-6 pb-3 sm:pb-4">
                <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">Suggested questions:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-[10px] sm:text-xs bg-transparent transition-smooth"
                      onClick={() => handleSuggestedQuestion(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="border-t border-border p-3 sm:p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 text-sm"
                />
                <Button onClick={handleSend} disabled={!input.trim() || isTyping} size="icon" className="flex-shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
