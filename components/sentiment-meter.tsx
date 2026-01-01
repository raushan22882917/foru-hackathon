"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { analyzeSentiment } from "@/lib/gemini-ai"
import { cn } from "@/lib/utils"

interface SentimentMeterProps {
  thread: any
  posts?: any[]
  className?: string
  showDetails?: boolean
  autoAnalyze?: boolean
}

interface SentimentData {
  overall: "positive" | "negative" | "neutral" | "mixed"
  score: number
  summary: string
  topics: Array<{
    topic: string
    sentiment: "positive" | "negative" | "neutral"
    mentions: number
  }>
  confidence: number
}

export function SentimentMeter({ 
  thread, 
  posts = [], 
  className, 
  showDetails = false,
  autoAnalyze = false 
}: SentimentMeterProps) {
  const [sentiment, setSentiment] = useState<SentimentData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    if (autoAnalyze && thread && thread.id && posts) {
      // Add a debounce to prevent excessive API calls during development
      const timer = setTimeout(() => {
        analyzeSentimentData()
      }, 2000) // 2 second delay
      
      return () => clearTimeout(timer)
    }
  }, [autoAnalyze, thread?.id, posts?.length])

  const analyzeSentimentData = async () => {
    if (isAnalyzing || !thread || !thread.id) return

    setIsAnalyzing(true)
    setError("")

    try {
      const allContent = [thread, ...posts].filter(Boolean)
      
      if (allContent.length === 0) {
        setError("No content available for analysis")
        return
      }

      const analysis = await analyzeSentiment(allContent)
      
      // Calculate confidence based on content amount and score magnitude
      const contentAmount = allContent.length
      const scoreConfidence = Math.abs(analysis.score)
      const confidence = Math.min(1, (contentAmount / 10 + scoreConfidence) / 2)

      setSentiment({
        overall: analysis.overall,
        score: analysis.score,
        summary: analysis.summary,
        topics: analysis.topics,
        confidence
      })
    } catch (err) {
      console.error('Sentiment analysis failed:', err)
      setError("Unable to analyze sentiment at this time.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getSentimentColor = (sentimentType: string) => {
    switch (sentimentType) {
      case "positive":
        return {
          bg: "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
          border: "border-green-200 dark:border-green-700",
          text: "text-green-700 dark:text-green-300",
          icon: "sentiment_very_satisfied",
          badge: "bg-green-100 text-green-700 border-green-200"
        }
      case "negative":
        return {
          bg: "bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20",
          border: "border-red-200 dark:border-red-700",
          text: "text-red-700 dark:text-red-300",
          icon: "sentiment_very_dissatisfied",
          badge: "bg-red-100 text-red-700 border-red-200"
        }
      case "mixed":
        return {
          bg: "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20",
          border: "border-yellow-200 dark:border-yellow-700",
          text: "text-yellow-700 dark:text-yellow-300",
          icon: "sentiment_neutral",
          badge: "bg-yellow-100 text-yellow-700 border-yellow-200"
        }
      default: // neutral
        return {
          bg: "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20",
          border: "border-gray-200 dark:border-gray-700",
          text: "text-gray-700 dark:text-gray-300",
          icon: "sentiment_satisfied",
          badge: "bg-gray-100 text-gray-700 border-gray-200"
        }
    }
  }

  const getSentimentScore = () => {
    if (!sentiment) return 50
    // Convert -1 to 1 scale to 0 to 100 scale
    return Math.round(((sentiment.score + 1) / 2) * 100)
  }

  const colors = sentiment ? getSentimentColor(sentiment.overall) : getSentimentColor("neutral")

  return (
    <TooltipProvider>
      <Card className={cn(colors.bg, colors.border, className)}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-current rounded-full blur-sm opacity-20"></div>
                <span className={cn("material-symbols-outlined text-[28px] relative z-10", colors.text)}>
                  {sentiment ? colors.icon : "sentiment_satisfied"}
                </span>
              </div>
              <div>
                <CardTitle className={cn("text-xl flex items-center gap-2", colors.text)}>
                  Sentiment Meter
                  {sentiment && (
                    <Badge variant="outline" className={cn("text-xs", colors.badge)}>
                      {sentiment.overall.charAt(0).toUpperCase() + sentiment.overall.slice(1)}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className={colors.text}>
                  {sentiment ? "AI-powered sentiment analysis" : "Analyze discussion sentiment"}
                </CardDescription>
              </div>
            </div>

            {!sentiment && !isAnalyzing && (
              <Button
                onClick={analyzeSentimentData}
                size="sm"
                variant="outline"
                className={cn("border-current hover:bg-current/10", colors.text)}
              >
                <span className="material-symbols-outlined text-[16px] mr-2">psychology</span>
                Analyze
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {isAnalyzing && (
            <div className="space-y-4">
              <div className={cn("flex items-center gap-2 text-sm font-medium", colors.text)}>
                <span className="material-symbols-outlined text-[16px] animate-pulse">psychology</span>
                Analyzing sentiment...
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-current/20 rounded animate-pulse"></div>
                <div className="h-3 bg-current/20 rounded animate-pulse w-3/4"></div>
                <div className="h-3 bg-current/20 rounded animate-pulse w-1/2"></div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-4">
              <span className="material-symbols-outlined text-[32px] text-red-400 mb-2 block">error</span>
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {sentiment && !isAnalyzing && (
            <div className="space-y-6">
              {/* Sentiment Score */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={cn("text-sm font-medium", colors.text)}>Sentiment Score</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className={cn("text-xs", colors.badge)}>
                        {getSentimentScore()}%
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Confidence: {Math.round(sentiment.confidence * 100)}%</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Progress 
                  value={getSentimentScore()} 
                  className="h-3"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Negative</span>
                  <span>Neutral</span>
                  <span>Positive</span>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg p-4 border border-current/20">
                <h4 className={cn("font-semibold text-sm mb-2 flex items-center gap-2", colors.text)}>
                  <span className="material-symbols-outlined text-[16px]">summarize</span>
                  Analysis Summary
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {sentiment.summary}
                </p>
              </div>

              {/* Topic Breakdown */}
              {showDetails && sentiment.topics.length > 0 && (
                <div className="space-y-3">
                  <h4 className={cn("font-semibold text-sm flex items-center gap-2", colors.text)}>
                    <span className="material-symbols-outlined text-[16px]">topic</span>
                    Topic Sentiment
                  </h4>
                  <div className="space-y-2">
                    {sentiment.topics.slice(0, 5).map((topic, index) => (
                      <div key={index} className="flex items-center justify-between bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 border border-current/10">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "material-symbols-outlined text-[16px]",
                            topic.sentiment === "positive" ? "text-green-600" :
                            topic.sentiment === "negative" ? "text-red-600" :
                            "text-gray-600"
                          )}>
                            {topic.sentiment === "positive" ? "sentiment_satisfied" :
                             topic.sentiment === "negative" ? "sentiment_dissatisfied" :
                             "sentiment_neutral"}
                          </span>
                          <span className="text-sm font-medium">{topic.topic}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {topic.mentions} mentions
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs",
                              topic.sentiment === "positive" ? "bg-green-50 text-green-700 border-green-200" :
                              topic.sentiment === "negative" ? "bg-red-50 text-red-700 border-red-200" :
                              "bg-gray-50 text-gray-700 border-gray-200"
                            )}
                          >
                            {topic.sentiment}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 border border-current/10">
                  <div className={cn("text-lg font-bold", colors.text)}>
                    {posts.length + 1}
                  </div>
                  <div className="text-xs text-muted-foreground">Messages</div>
                </div>
                <div className="text-center bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 border border-current/10">
                  <div className={cn("text-lg font-bold", colors.text)}>
                    {sentiment.topics.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Topics</div>
                </div>
                <div className="text-center bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 border border-current/10">
                  <div className={cn("text-lg font-bold", colors.text)}>
                    {Math.round(sentiment.confidence * 100)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Confidence</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={analyzeSentimentData}
                  disabled={isAnalyzing}
                  className={cn("border-current hover:bg-current/10", colors.text)}
                >
                  <span className="material-symbols-outlined text-[16px] mr-2">refresh</span>
                  Refresh
                </Button>
                {!showDetails && sentiment.topics.length > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn("border-current hover:bg-current/10", colors.text)}
                      >
                        <span className="material-symbols-outlined text-[16px] mr-2">info</span>
                        Details
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View detailed topic breakdown</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          )}

          {!sentiment && !isAnalyzing && !error && (
            <div className="text-center py-6">
              <span className="material-symbols-outlined text-[48px] text-muted-foreground mb-3 block">sentiment_satisfied</span>
              <p className="text-sm text-muted-foreground mb-4">
                Click "Analyze" to get AI-powered sentiment insights for this discussion
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">psychology</span>
                  <span>AI Analysis</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">topic</span>
                  <span>Topic Detection</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">insights</span>
                  <span>Smart Insights</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

// Compact sentiment indicator for thread lists
export function SentimentIndicator({ 
  sentiment, 
  className 
}: { 
  sentiment: "positive" | "negative" | "neutral" | "mixed"
  className?: string 
}) {
  const colors = {
    positive: "text-green-600 bg-green-50 border-green-200",
    negative: "text-red-600 bg-red-50 border-red-200", 
    mixed: "text-yellow-600 bg-yellow-50 border-yellow-200",
    neutral: "text-gray-600 bg-gray-50 border-gray-200"
  }

  const icons = {
    positive: "sentiment_very_satisfied",
    negative: "sentiment_very_dissatisfied",
    mixed: "sentiment_neutral", 
    neutral: "sentiment_satisfied"
  }

  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border",
      colors[sentiment],
      className
    )}>
      <span className="material-symbols-outlined text-[12px]">
        {icons[sentiment]}
      </span>
      <span className="capitalize">{sentiment}</span>
    </div>
  )
}