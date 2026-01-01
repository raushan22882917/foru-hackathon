"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { analyzeContentForModeration } from "@/lib/gemini-ai"
import { cn } from "@/lib/utils"

interface ModerationAnalysis {
  flagged: boolean
  severity: "high" | "medium" | "low" | "none"
  categories: string[]
  reasoning: string
  suggestedAction: "remove" | "review" | "approve" | "flag"
  confidence: number
}

interface AIModeratorProps {
  content: string
  author: string
  contentType?: "thread" | "post" | "comment"
  className?: string
  autoAnalyze?: boolean
  onModerationAction?: (action: string, analysis: ModerationAnalysis) => void
}

export function AIModerator({ 
  content, 
  author, 
  contentType = "post",
  className,
  autoAnalyze = false,
  onModerationAction
}: AIModeratorProps) {
  const [analysis, setAnalysis] = useState<ModerationAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string>("")
  const [selectedTab, setSelectedTab] = useState("overview")

  useEffect(() => {
    if (autoAnalyze && content.trim()) {
      analyzeContent()
    }
  }, [autoAnalyze, content])

  const analyzeContent = async () => {
    if (isAnalyzing || !content.trim()) return

    setIsAnalyzing(true)
    setError("")

    try {
      const moderationResult = await analyzeContentForModeration(content, author)
      
      // Calculate confidence based on content length and analysis certainty
      const contentLength = content.length
      const hasSpecificCategories = moderationResult.categories.length > 0
      const confidence = Math.min(1, (contentLength / 500 + (hasSpecificCategories ? 0.3 : 0)) / 1.3)

      setAnalysis({
        ...moderationResult,
        confidence
      })
    } catch (err) {
      console.error('AI moderation failed:', err)
      setError("Unable to analyze content at this time.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return {
          bg: "bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20",
          border: "border-red-200 dark:border-red-700",
          text: "text-red-700 dark:text-red-300",
          badge: "bg-red-100 text-red-700 border-red-200",
          icon: "dangerous"
        }
      case "medium":
        return {
          bg: "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20",
          border: "border-yellow-200 dark:border-yellow-700",
          text: "text-yellow-700 dark:text-yellow-300",
          badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
          icon: "warning"
        }
      case "low":
        return {
          bg: "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
          border: "border-blue-200 dark:border-blue-700",
          text: "text-blue-700 dark:text-blue-300",
          badge: "bg-blue-100 text-blue-700 border-blue-200",
          icon: "info"
        }
      default: // none
        return {
          bg: "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
          border: "border-green-200 dark:border-green-700",
          text: "text-green-700 dark:text-green-300",
          badge: "bg-green-100 text-green-700 border-green-200",
          icon: "verified"
        }
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "remove":
        return "bg-red-100 text-red-700 border-red-200"
      case "review":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "flag":
        return "bg-orange-100 text-orange-700 border-orange-200"
      default: // approve
        return "bg-green-100 text-green-700 border-green-200"
    }
  }

  const handleModerationAction = (action: string) => {
    if (analysis && onModerationAction) {
      onModerationAction(action, analysis)
    }
  }

  const colors = analysis ? getSeverityColor(analysis.severity) : getSeverityColor("none")

  return (
    <Card className={cn(colors.bg, colors.border, className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-current rounded-full blur-sm opacity-20"></div>
              <span className={cn("material-symbols-outlined text-[28px] relative z-10", colors.text)}>
                {analysis ? colors.icon : "shield"}
              </span>
            </div>
            <div>
              <CardTitle className={cn("text-xl flex items-center gap-2", colors.text)}>
                AI Moderator
                {analysis && (
                  <Badge variant="outline" className={cn("text-xs", colors.badge)}>
                    {analysis.severity === "none" ? "Clean" : analysis.severity.charAt(0).toUpperCase() + analysis.severity.slice(1)}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className={colors.text}>
                {analysis ? "Content analysis complete" : "AI-powered content moderation"}
              </CardDescription>
            </div>
          </div>

          {!analysis && !isAnalyzing && (
            <Button
              onClick={analyzeContent}
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
              Analyzing content for policy violations...
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-current/20 rounded animate-pulse"></div>
              <div className="h-3 bg-current/20 rounded animate-pulse w-3/4"></div>
              <div className="h-3 bg-current/20 rounded animate-pulse w-1/2"></div>
            </div>
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

        {analysis && !isAnalyzing && (
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">dashboard</span>
                Overview
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">info</span>
                Details
              </TabsTrigger>
              <TabsTrigger value="actions" className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">gavel</span>
                Actions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Risk Assessment */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={cn("text-sm font-medium", colors.text)}>Risk Level</span>
                  <Badge variant="outline" className={cn("text-xs", colors.badge)}>
                    {analysis.severity === "none" ? "No Risk" : `${analysis.severity.charAt(0).toUpperCase() + analysis.severity.slice(1)} Risk`}
                  </Badge>
                </div>
                <Progress 
                  value={
                    analysis.severity === "high" ? 90 :
                    analysis.severity === "medium" ? 60 :
                    analysis.severity === "low" ? 30 : 10
                  } 
                  className="h-3"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Safe</span>
                  <span>Moderate</span>
                  <span>High Risk</span>
                </div>
              </div>

              {/* Quick Summary */}
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg p-4 border border-current/20">
                <h4 className={cn("font-semibold text-sm mb-2 flex items-center gap-2", colors.text)}>
                  <span className="material-symbols-outlined text-[16px]">summarize</span>
                  Analysis Summary
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                  {analysis.reasoning}
                </p>
                
                {analysis.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {analysis.categories.map((category, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Suggested Action */}
              <div className="flex items-center justify-between bg-white/50 dark:bg-slate-800/50 rounded-lg p-4 border border-current/10">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px] text-slate-600">
                    {analysis.suggestedAction === "remove" ? "delete" :
                     analysis.suggestedAction === "review" ? "rate_review" :
                     analysis.suggestedAction === "flag" ? "flag" : "check_circle"}
                  </span>
                  <div>
                    <p className="font-semibold text-sm">Suggested Action</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {analysis.suggestedAction} this {contentType}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={cn("text-xs", getActionColor(analysis.suggestedAction))}>
                  {analysis.suggestedAction.charAt(0).toUpperCase() + analysis.suggestedAction.slice(1)}
                </Badge>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-6 mt-6">
              {/* Content Analysis */}
              <div className="space-y-4">
                <h4 className={cn("font-semibold text-sm flex items-center gap-2", colors.text)}>
                  <span className="material-symbols-outlined text-[16px]">analytics</span>
                  Content Analysis
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 border border-current/10">
                    <div className="text-center">
                      <div className={cn("text-lg font-bold", colors.text)}>
                        {Math.round(analysis.confidence * 100)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Confidence</div>
                    </div>
                  </div>
                  <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 border border-current/10">
                    <div className="text-center">
                      <div className={cn("text-lg font-bold", colors.text)}>
                        {content.length}
                      </div>
                      <div className="text-xs text-muted-foreground">Characters</div>
                    </div>
                  </div>
                </div>

                {/* Categories Breakdown */}
                {analysis.categories.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="font-medium text-sm">Flagged Categories</h5>
                    <div className="space-y-2">
                      {analysis.categories.map((category, index) => (
                        <div key={index} className="flex items-center justify-between bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 border border-current/10">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px] text-red-600">warning</span>
                            <span className="text-sm font-medium">{category}</span>
                          </div>
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                            Flagged
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Author Context */}
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 border border-current/10">
                  <h5 className="font-medium text-sm mb-2">Author Context</h5>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-slate-600">person</span>
                    <span className="text-sm">{author}</span>
                    <Badge variant="outline" className="text-xs">
                      {contentType} author
                    </Badge>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="actions" className="space-y-6 mt-6">
              {/* Moderation Actions */}
              <div className="space-y-4">
                <h4 className={cn("font-semibold text-sm flex items-center gap-2", colors.text)}>
                  <span className="material-symbols-outlined text-[16px]">gavel</span>
                  Moderation Actions
                </h4>

                <div className="grid gap-3">
                  {analysis.suggestedAction === "remove" && (
                    <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                      <span className="material-symbols-outlined text-[16px]">dangerous</span>
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-red-700 dark:text-red-300">Immediate Action Required</p>
                            <p className="text-sm text-red-600 dark:text-red-400">This content violates community guidelines and should be removed.</p>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleModerationAction("remove")}
                          >
                            Remove
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {analysis.suggestedAction === "review" && (
                    <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                      <span className="material-symbols-outlined text-[16px]">rate_review</span>
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-yellow-700 dark:text-yellow-300">Manual Review Needed</p>
                            <p className="text-sm text-yellow-600 dark:text-yellow-400">This content needs human moderator review.</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleModerationAction("review")}
                            className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                          >
                            Review
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {analysis.suggestedAction === "approve" && (
                    <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-green-700 dark:text-green-300">Content Approved</p>
                            <p className="text-sm text-green-600 dark:text-green-400">This content follows community guidelines.</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleModerationAction("approve")}
                            className="border-green-300 text-green-700 hover:bg-green-100"
                          >
                            Approve
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Additional Actions */}
                  <div className="flex gap-2 pt-4 border-t border-current/20">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={analyzeContent}
                      disabled={isAnalyzing}
                      className={cn("border-current hover:bg-current/10", colors.text)}
                    >
                      <span className="material-symbols-outlined text-[16px] mr-2">refresh</span>
                      Re-analyze
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleModerationAction("flag")}
                      className="text-orange-600 border-orange-200 hover:bg-orange-50"
                    >
                      <span className="material-symbols-outlined text-[16px] mr-2">flag</span>
                      Flag for Review
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {!analysis && !isAnalyzing && !error && (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-[48px] text-muted-foreground mb-3 block">shield</span>
            <p className="text-muted-foreground text-sm mb-4">
              Click "Analyze" to check this content against community guidelines
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">psychology</span>
                <span>AI Analysis</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">policy</span>
                <span>Policy Check</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">security</span>
                <span>Safe Community</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Compact moderation indicator for content lists
export function ModerationIndicator({ 
  severity, 
  flagged,
  className 
}: { 
  severity: "high" | "medium" | "low" | "none"
  flagged: boolean
  className?: string 
}) {
  if (!flagged && severity === "none") {
    return null
  }

  const colors = {
    high: "text-red-600 bg-red-50 border-red-200",
    medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
    low: "text-blue-600 bg-blue-50 border-blue-200",
    none: "text-green-600 bg-green-50 border-green-200"
  }

  const icons = {
    high: "dangerous",
    medium: "warning", 
    low: "info",
    none: "verified"
  }

  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border",
      colors[severity],
      className
    )}>
      <span className="material-symbols-outlined text-[12px]">
        {icons[severity]}
      </span>
      <span>{flagged ? "Flagged" : "Clean"}</span>
    </div>
  )
}