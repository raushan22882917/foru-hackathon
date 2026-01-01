"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Copy, RefreshCw, Send, MessageSquare, CheckCircle2 } from "lucide-react"
import { generateSmartReply } from "@/lib/gemini-ai"

export default function SmartReplyPage() {
  const [context, setContext] = useState("")
  const [tone, setTone] = useState<"professional" | "friendly" | "helpful">("professional")
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const generateReplies = async () => {
    if (!context.trim()) return

    setLoading(true)
    try {
      const replies = await generateSmartReply(context, tone)
      setSuggestions(replies)
    } catch (error) {
      console.error("[v0] Smart reply generation error:", error)
      // Fallback to mock data
      const mockReplies = {
        professional: [
          "Thank you for bringing this to our attention. We're currently investigating the issue and will provide an update within the next 24 hours.",
          "I appreciate your feedback. Our team is working on implementing this feature, and we'll notify you once it's available.",
        ],
        friendly: [
          "Hey! Thanks for reaching out. We're on it and will have an answer for you soon!",
          "Great suggestion! We love hearing ideas from our community. Let me share this with the team.",
        ],
        helpful: [
          "I'd be happy to help! Based on what you've described, here are a few steps you can try...",
          "That's a common question - let me walk you through the solution step by step.",
        ],
      }
      setSuggestions(mockReplies[tone])
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border border-accent/20 p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-full bg-accent/10 p-3">
              <Sparkles className="h-6 w-6 text-accent" />
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight">Smart Reply Assistant</h1>
          </div>
          <p className="text-pretty text-lg text-muted-foreground max-w-2xl">
            Generate AI-powered responses for your community discussions with Gemini
          </p>
        </div>
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="transition-all hover:shadow-lg border-primary/20">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Context
            </CardTitle>
            <CardDescription>Paste the message or thread you want to respond to</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <Textarea
              placeholder="Paste the message or thread context here..."
              className="min-h-[200px] text-base resize-none focus-visible:ring-primary"
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />

            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Select Tone
              </label>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={tone === "professional" ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-2 text-sm transition-all ${tone === "professional" ? "bg-primary shadow-sm" : "hover:bg-primary/10"}`}
                  onClick={() => setTone("professional")}
                >
                  Professional
                </Badge>
                <Badge
                  variant={tone === "friendly" ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-2 text-sm transition-all ${tone === "friendly" ? "bg-primary shadow-sm" : "hover:bg-primary/10"}`}
                  onClick={() => setTone("friendly")}
                >
                  Friendly
                </Badge>
                <Badge
                  variant={tone === "helpful" ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-2 text-sm transition-all ${tone === "helpful" ? "bg-primary shadow-sm" : "hover:bg-primary/10"}`}
                  onClick={() => setTone("helpful")}
                >
                  Helpful
                </Badge>
              </div>
            </div>

            <Button
              onClick={generateReplies}
              disabled={!context.trim() || loading}
              className="w-full h-12 text-base bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate AI Replies
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-lg border-accent/20">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              Suggested Replies
            </CardTitle>
            <CardDescription>AI-generated responses powered by Gemini</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {suggestions.length > 0 ? (
              <div className="space-y-4">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-border bg-card/50 p-5 transition-all hover:border-primary/30 hover:shadow-sm"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        Option {index + 1}
                      </Badge>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(suggestion, index)}
                          className="hover:bg-primary/10"
                        >
                          {copiedIndex === index ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="sm" className="hover:bg-accent/10">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground">{suggestion}</p>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={generateReplies}
                  className="w-full border-dashed hover:bg-primary/5 hover:border-primary bg-transparent"
                  disabled={loading}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-accent/10 p-6 mb-4">
                  <Sparkles className="h-12 w-12 text-accent" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">No suggestions yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Add context and select a tone to generate AI-powered reply suggestions
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
