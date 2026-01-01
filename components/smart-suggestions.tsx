"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { threadSenseAI, type SmartSuggestion } from "@/lib/threadsense-ai"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface SmartSuggestionsProps {
  threadId: string
  thread?: any
  className?: string
  maxSuggestions?: number
  autoLoad?: boolean
}

export function SmartSuggestions({ 
  threadId, 
  thread,
  className, 
  maxSuggestions = 5,
  autoLoad = true 
}: SmartSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    if (autoLoad && threadId) {
      loadSuggestions()
    }
  }, [autoLoad, threadId])

  const loadSuggestions = async () => {
    if (isLoading) return

    setIsLoading(true)
    setError("")

    try {
      const smartSuggestions = await threadSenseAI.generateSmartSuggestions(threadId, maxSuggestions)
      setSuggestions(smartSuggestions)
    } catch (err) {
      console.error('Smart suggestions failed:', err)
      setError("Unable to load suggestions at this time.")
    } finally {
      setIsLoading(false)
    }
  }

  const getSuggestionIcon = (type: SmartSuggestion['type']) => {
    switch (type) {
      case "related_thread":
        return "forum"
      case "helpful_resource":
        return "library_books"
      case "similar_discussion":
        return "chat_bubble"
      case "expert_user":
        return "person"
      default:
        return "lightbulb"
    }
  }

  const getSuggestionColor = (type: SmartSuggestion['type']) => {
    switch (type) {
      case "related_thread":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "helpful_resource":
        return "bg-green-50 text-green-700 border-green-200"
      case "similar_discussion":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "expert_user":
        return "bg-orange-50 text-orange-700 border-orange-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return "text-green-600 bg-green-50 border-green-200"
    if (score >= 0.6) return "text-blue-600 bg-blue-50 border-blue-200"
    if (score >= 0.4) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    return "text-gray-600 bg-gray-50 border-gray-200"
  }

  return (
    <Card className={cn("border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 dark:border-indigo-700", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-sm opacity-20"></div>
              <span className="material-symbols-outlined text-[28px] text-indigo-600 relative z-10">recommend</span>
            </div>
            <div>
              <CardTitle className="text-xl text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
                Smart Suggestions
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 border-indigo-200 text-xs">
                  <span className="material-symbols-outlined text-[12px] mr-1">auto_awesome</span>
                  AI Powered
                </Badge>
              </CardTitle>
              <CardDescription className="text-indigo-700 dark:text-indigo-300">
                People discussing this also viewed
              </CardDescription>
            </div>
          </div>

          {!autoLoad && !isLoading && suggestions.length === 0 && (
            <Button
              onClick={loadSuggestions}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <span className="material-symbols-outlined text-[16px] mr-2">psychology</span>
              Load Suggestions
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {isLoading && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 text-sm font-medium">
              <span className="material-symbols-outlined text-[16px] animate-pulse">psychology</span>
              Finding relevant suggestions...
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4 bg-indigo-200" />
                <Skeleton className="h-3 w-full bg-indigo-200" />
                <Skeleton className="h-3 w-1/2 bg-indigo-200" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-6">
            <span className="material-symbols-outlined text-[32px] text-red-400 mb-2 block">error</span>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <Button
              onClick={loadSuggestions}
              size="sm"
              variant="outline"
              className="mt-3"
            >
              Try Again
            </Button>
          </div>
        )}

        {suggestions.length > 0 && !isLoading && (
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="group bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg p-4 border border-indigo-200/50 dark:border-indigo-700/50 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center border",
                      getSuggestionColor(suggestion.type)
                    )}>
                      <span className="material-symbols-outlined text-[20px]">
                        {getSuggestionIcon(suggestion.type)}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {suggestion.title}
                      </h4>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs ml-2 flex-shrink-0", getRelevanceColor(suggestion.relevanceScore))}
                      >
                        {Math.round(suggestion.relevanceScore * 100)}% match
                      </Badge>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-2">
                      {suggestion.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", getSuggestionColor(suggestion.type))}
                        >
                          {suggestion.type.replace('_', ' ')}
                        </Badge>
                        
                        {/* Show metadata badges */}
                        {suggestion.metadata.category && (
                          <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200">
                            {suggestion.metadata.category}
                          </Badge>
                        )}
                        
                        {suggestion.metadata.engagement === "high" && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-200">
                            <span className="material-symbols-outlined text-[10px] mr-1">trending_up</span>
                            Popular
                          </Badge>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="material-symbols-outlined text-[16px] mr-1">arrow_forward</span>
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {suggestions.length >= maxSuggestions && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadSuggestions()}
                  className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                >
                  <span className="material-symbols-outlined text-[16px] mr-2">expand_more</span>
                  Load More Suggestions
                </Button>
              </div>
            )}
          </div>
        )}

        {suggestions.length === 0 && !isLoading && !error && (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-[48px] text-indigo-400 mb-3 block">recommend</span>
            <p className="text-indigo-700 dark:text-indigo-300 text-sm mb-4">
              No suggestions available yet. Our AI is learning from community interactions.
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-indigo-600 dark:text-indigo-400">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">psychology</span>
                <span>AI Learning</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">trending_up</span>
                <span>Improving</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">group</span>
                <span>Community Driven</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Compact suggestions widget for sidebars
export function CompactSuggestions({ 
  threadId, 
  className,
  limit = 3 
}: { 
  threadId: string
  className?: string
  limit?: number 
}) {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Helper function to get suggestion icon
  const getSuggestionIcon = (type: SmartSuggestion['type']) => {
    switch (type) {
      case "related_thread":
        return "forum"
      case "helpful_resource":
        return "library_books"
      case "similar_discussion":
        return "chat_bubble"
      case "expert_user":
        return "person"
      default:
        return "lightbulb"
    }
  }

  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const smartSuggestions = await threadSenseAI.generateSmartSuggestions(threadId, limit)
        setSuggestions(smartSuggestions)
      } catch (error) {
        console.error('Compact suggestions failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (threadId) {
      loadSuggestions()
    }
  }, [threadId, limit])

  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="text-sm font-medium text-muted-foreground">Related</div>
        {Array.from({ length: limit }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    )
  }

  if (suggestions.length === 0) {
    return null
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <span className="material-symbols-outlined text-[16px]">recommend</span>
        Related Discussions
      </div>
      <div className="space-y-2">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="group p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] text-muted-foreground mt-0.5">
                {getSuggestionIcon(suggestion.type)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2">
                  {suggestion.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {Math.round(suggestion.relevanceScore * 100)}%
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {suggestion.type.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}