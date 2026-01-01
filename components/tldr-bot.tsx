"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { threadSenseAI } from "@/lib/threadsense-ai"
import { generateThreadSummary } from "@/lib/gemini-ai"
import { cn } from "@/lib/utils"

interface TLDRBotProps {
  thread: any
  posts: any[]
  className?: string
  autoGenerate?: boolean
}

export function TLDRBot({ thread, posts, className, autoGenerate = false }: TLDRBotProps) {
  const [summary, setSummary] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string>("")
  const [showSummary, setShowSummary] = useState(false)

  // Auto-generate summary for long threads
  useEffect(() => {
    if (autoGenerate && posts && posts.length >= 5) {
      // Add debounce to prevent excessive API calls
      const timer = setTimeout(() => {
        generateSummary()
        setShowSummary(true)
      }, 1500)
      
      return () => clearTimeout(timer)
    }
  }, [autoGenerate, posts?.length])

  const generateSummary = async () => {
    if (!thread || isGenerating) return

    setIsGenerating(true)
    setError("")

    try {
      const generatedSummary = await generateThreadSummary(thread, posts)
      setSummary(generatedSummary)
      setShowSummary(true)
    } catch (err) {
      console.error('TL;DR generation failed:', err)
      setError("Unable to generate summary at this time. Please try again later.")
    } finally {
      setIsGenerating(false)
    }
  }

  const shouldShowTLDR = () => {
    // Show TL;DR suggestion for threads with 3+ posts or long content
    const hasMultiplePosts = posts.length >= 3
    const hasLongContent = (thread.body?.length || 0) > 500
    const hasLongPosts = posts.some(post => (post.content?.length || post.body?.length || 0) > 300)
    
    return hasMultiplePosts || hasLongContent || hasLongPosts
  }

  if (!shouldShowTLDR() && !showSummary) {
    return null
  }

  return (
    <Card className={cn("border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-700", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-sm opacity-20"></div>
              <span className="material-symbols-outlined text-[28px] text-blue-600 relative z-10">summarize</span>
            </div>
            <div>
              <CardTitle className="text-xl text-blue-900 dark:text-blue-100 flex items-center gap-2">
                TL;DR Bot
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                  AI Powered
                </Badge>
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                {showSummary ? "Thread summary generated" : "Get an AI-powered summary of this discussion"}
              </CardDescription>
            </div>
          </div>
          
          {!showSummary && (
            <Button
              onClick={generateSummary}
              disabled={isGenerating}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isGenerating ? (
                <>
                  <span className="material-symbols-outlined text-[16px] mr-2 animate-spin">progress_activity</span>
                  Generating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px] mr-2">auto_awesome</span>
                  Generate TL;DR
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {isGenerating && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
              <span className="material-symbols-outlined text-[16px] animate-pulse">psychology</span>
              AI is analyzing the discussion...
            </div>
            <Skeleton className="h-4 w-full bg-blue-200" />
            <Skeleton className="h-4 w-3/4 bg-blue-200" />
            <Skeleton className="h-4 w-1/2 bg-blue-200" />
          </div>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <AlertDescription className="text-red-700 dark:text-red-300">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {summary && showSummary && !isGenerating && (
          <div className="space-y-4">
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[20px] text-blue-600 mt-0.5">lightbulb</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Summary</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Thread Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 border border-blue-200/50 dark:border-blue-700/50">
                <div className="text-lg font-bold text-blue-900 dark:text-blue-100">{posts.length}</div>
                <div className="text-xs text-blue-700 dark:text-blue-300">Replies</div>
              </div>
              <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 border border-blue-200/50 dark:border-blue-700/50">
                <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                  {Math.ceil(((thread.body?.length || 0) + posts.reduce((sum, p) => sum + (p.content?.length || p.body?.length || 0), 0)) / 200)}
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-300">Min Read</div>
              </div>
              <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 border border-blue-200/50 dark:border-blue-700/50">
                <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                  {new Set([thread.user?.id, ...posts.map(p => p.user?.id)].filter(Boolean)).size}
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-300">Participants</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSummary(false)}
                className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <span className="material-symbols-outlined text-[16px] mr-2">close</span>
                Hide Summary
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={generateSummary}
                disabled={isGenerating}
                className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <span className="material-symbols-outlined text-[16px] mr-2">refresh</span>
                Regenerate
              </Button>
            </div>
          </div>
        )}

        {!showSummary && !isGenerating && !error && (
          <div className="text-center py-4">
            <div className="mb-4">
              <span className="material-symbols-outlined text-[48px] text-blue-400 mb-2 block">summarize</span>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                This thread has {posts.length} replies. Get an AI-powered summary to quickly understand the key points.
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-4 text-xs text-blue-600 dark:text-blue-400">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                <span>Saves time</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">psychology</span>
                <span>AI-powered</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">insights</span>
                <span>Key insights</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Smart TL;DR suggestion component for thread lists
export function TLDRSuggestion({ thread, className }: { thread: any; className?: string }) {
  const shouldSuggest = () => {
    const hasMultipleReplies = (thread.reply_count || 0) >= 5
    const hasLongBody = (thread.body?.length || 0) > 800
    const isPopular = (thread.view_count || 0) > 50
    
    return hasMultipleReplies || hasLongBody || isPopular
  }

  if (!shouldSuggest()) {
    return null
  }

  return (
    <div className={cn("inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md text-xs border border-blue-200 dark:border-blue-700", className)}>
      <span className="material-symbols-outlined text-[12px]">summarize</span>
      <span>TL;DR available</span>
    </div>
  )
}