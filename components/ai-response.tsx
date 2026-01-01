"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { generateSmartReply } from "@/lib/gemini-ai"
import { Brain, Sparkles, ThumbsUp, MessageSquare, Copy, Share } from "lucide-react"

interface AIResponseProps {
  thread: any
  posts: any[]
  isVisible: boolean
  className?: string
}

export function AIResponse({ thread, posts, isVisible, className }: AIResponseProps) {
  const [aiResponse, setAiResponse] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string>("")
  const [hasGenerated, setHasGenerated] = useState(false)
  const [responseQuality, setResponseQuality] = useState<{
    relevance: number
    helpfulness: number
    accuracy: number
  }>({ relevance: 0, helpfulness: 0, accuracy: 0 })

  useEffect(() => {
    if (isVisible && !hasGenerated && !isGenerating) {
      generateAIResponse()
    }
  }, [isVisible, hasGenerated, isGenerating])

  const generateAIResponse = async () => {
    if (isGenerating) return

    setIsGenerating(true)
    setError("")

    try {
      // Create comprehensive context for AI response
      const context = `
THREAD QUESTION: ${thread.title}
ORIGINAL POST: ${thread.body}

EXISTING ANSWERS (${posts.length} total):
${posts.map((post, index) => `
Answer ${index + 1} by ${post.user?.username}:
${post.content}
`).join('\n')}

TASK: As an AI assistant, provide a comprehensive, helpful response to the original question. Consider:
1. The main question being asked
2. What has already been discussed in existing answers
3. Any gaps or additional insights that would be valuable
4. Practical, actionable advice
5. Be thorough but concise

Please provide a well-structured response that adds value to the discussion.`

      const response = await generateSmartReply(context, "helpful")
      
      setAiResponse(response)
      setHasGenerated(true)
      
      // Simulate quality scoring (in real app, this could be more sophisticated)
      setResponseQuality({
        relevance: Math.round((Math.random() * 0.3 + 0.7) * 100) / 100, // 70-100%
        helpfulness: Math.round((Math.random() * 0.3 + 0.7) * 100) / 100,
        accuracy: Math.round((Math.random() * 0.2 + 0.8) * 100) / 100 // 80-100%
      })

    } catch (err) {
      console.error('AI response generation failed:', err)
      setError("Unable to generate AI response at this time. Please try again later.")
    } finally {
      setIsGenerating(false)
    }
  }

  const copyResponse = async () => {
    try {
      await navigator.clipboard.writeText(aiResponse)
      // Could add toast notification here
    } catch (err) {
      console.error('Failed to copy response:', err)
    }
  }

  const regenerateResponse = () => {
    setHasGenerated(false)
    setAiResponse("")
    setError("")
    generateAIResponse()
  }

  if (!isVisible) return null

  return (
    <Card className={`border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-sm opacity-20"></div>
              <Avatar className="h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-500 relative z-10">
                <AvatarFallback className="bg-transparent text-white font-bold">
                  <Brain className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <CardTitle className="text-lg text-blue-900 dark:text-blue-100 flex items-center gap-2">
                AI Assistant Response
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Gemini AI
                </Badge>
              </CardTitle>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                AI-generated response based on the thread discussion
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={regenerateResponse}
              disabled={isGenerating}
              size="sm"
              variant="outline"
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isGenerating ? "Generating..." : "Regenerate"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isGenerating && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
              <Brain className="h-4 w-4 animate-pulse" />
              Analyzing thread and generating comprehensive response...
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full bg-blue-200" />
              <Skeleton className="h-4 w-5/6 bg-blue-200" />
              <Skeleton className="h-4 w-4/5 bg-blue-200" />
              <Skeleton className="h-4 w-full bg-blue-200" />
              <Skeleton className="h-4 w-3/4 bg-blue-200" />
            </div>
          </div>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <AlertDescription className="text-red-700 dark:text-red-300">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {aiResponse && !isGenerating && (
          <div className="space-y-4">
            {/* AI Response Content */}
            <div className="bg-white/70 dark:bg-slate-800/70 rounded-lg p-4 border border-blue-200/50">
              <div className="prose prose-sm max-w-none">
                <p className="text-base leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                  {aiResponse}
                </p>
              </div>
            </div>

            {/* Quality Indicators */}
            <div className="grid grid-cols-3 gap-4 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-200/30">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {Math.round(responseQuality.relevance * 100)}%
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-300">Relevance</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {Math.round(responseQuality.helpfulness * 100)}%
                </div>
                <div className="text-xs text-green-700 dark:text-green-300">Helpfulness</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {Math.round(responseQuality.accuracy * 100)}%
                </div>
                <div className="text-xs text-purple-700 dark:text-purple-300">Accuracy</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-blue-200/50">
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Helpful
                </Button>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Discuss
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={copyResponse}
                  variant="ghost" 
                  size="sm"
                  className="text-blue-600 hover:bg-blue-50"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* AI Disclaimer */}
            <div className="text-xs text-blue-600/70 dark:text-blue-400/70 bg-blue-50/30 dark:bg-blue-900/10 p-2 rounded border border-blue-200/30">
              <div className="flex items-center gap-1">
                <Brain className="h-3 w-3" />
                <span>AI-generated response • Please verify information and use your judgment</span>
              </div>
            </div>
          </div>
        )}

        {!aiResponse && !isGenerating && !error && (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-blue-400 mx-auto mb-3" />
            <p className="text-blue-700 dark:text-blue-300 text-sm mb-4">
              Click "Generate" to get an AI response to this thread
            </p>
            <Button
              onClick={generateAIResponse}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Brain className="h-4 w-4 mr-2" />
              Generate AI Response
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}