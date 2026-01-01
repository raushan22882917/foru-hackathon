"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { threadSenseAI, type CommunityHealthMetrics, type ThreadSenseAnalysis } from "@/lib/threadsense-ai"
import { cn } from "@/lib/utils"

interface ThreadSenseDashboardProps {
  threads: any[]
  className?: string
}

export function ThreadSenseDashboard({ threads, className }: ThreadSenseDashboardProps) {
  const [healthMetrics, setHealthMetrics] = useState<CommunityHealthMetrics | null>(null)
  const [threadAnalyses, setThreadAnalyses] = useState<ThreadSenseAnalysis[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState("overview")

  useEffect(() => {
    const analyzeData = async () => {
      setIsLoading(true)
      try {
        // Analyze community health
        const health = await threadSenseAI.analyzeCommunityHealth(threads)
        setHealthMetrics(health)

        // Analyze top threads
        const topThreads = threads.slice(0, 5) // Analyze top 5 threads
        const analyses = await Promise.all(
          topThreads.map(thread => threadSenseAI.analyzeThread(thread, []))
        )
        setThreadAnalyses(analyses)
      } catch (error) {
        console.error('ThreadSense analysis failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (threads.length > 0) {
      analyzeData()
    } else {
      setIsLoading(false)
    }
  }, [threads])

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-sm opacity-20"></div>
              <span className="material-symbols-outlined text-[32px] text-purple-600 relative z-10 animate-pulse">psychology</span>
            </div>
            <div>
              <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                ThreadSense AI
              </CardTitle>
              <CardDescription>Analyzing community intelligence...</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gradient-to-r from-purple-200 to-blue-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gradient-to-r from-blue-200 to-purple-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gradient-to-r from-purple-200 to-blue-200 rounded animate-pulse w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!healthMetrics) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-8 text-center">
          <span className="material-symbols-outlined text-[48px] text-muted-foreground mb-4 block">psychology</span>
          <p className="text-muted-foreground">No community data available for analysis</p>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-green-600 bg-green-50 border-green-200"
      case "healthy": return "text-blue-600 bg-blue-50 border-blue-200"
      case "concerning": return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "critical": return "text-red-600 bg-red-50 border-red-200"
      default: return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "text-green-600"
      case "negative": return "text-red-600"
      case "mixed": return "text-yellow-600"
      default: return "text-gray-600"
    }
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-sm opacity-20"></div>
              <span className="material-symbols-outlined text-[32px] text-purple-600 relative z-10">psychology</span>
            </div>
            <div>
              <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                ThreadSense AI
              </CardTitle>
              <CardDescription>Intelligent Community Brain</CardDescription>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={cn("px-3 py-1 text-sm font-semibold", getStatusColor(healthMetrics.overall.status))}
          >
            <span className="material-symbols-outlined text-[16px] mr-2">health_and_safety</span>
            {healthMetrics.overall.status.charAt(0).toUpperCase() + healthMetrics.overall.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">dashboard</span>
              Overview
            </TabsTrigger>
            <TabsTrigger value="sentiment" className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">sentiment_satisfied</span>
              Sentiment
            </TabsTrigger>
            <TabsTrigger value="threads" className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">forum</span>
              Threads
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">lightbulb</span>
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Community Health Score */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[24px] text-purple-600">health_and_safety</span>
                      <span className="font-semibold text-purple-900 dark:text-purple-100">Health Score</span>
                    </div>
                    <Badge variant="outline" className="text-purple-600 border-purple-300">
                      {Math.round(healthMetrics.overall.score * 100)}%
                    </Badge>
                  </div>
                  <Progress value={healthMetrics.overall.score * 100} className="h-3" />
                  <p className="text-sm text-purple-700 dark:text-purple-300 mt-2">
                    Community is {healthMetrics.overall.status}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[24px] text-green-600">trending_up</span>
                      <span className="font-semibold text-green-900 dark:text-green-100">Engagement</span>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-300">
                      {healthMetrics.engagement.trend}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700 dark:text-green-300">Avg Replies</span>
                      <span className="font-semibold">{healthMetrics.engagement.averageReplies.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700 dark:text-green-300">Active Users</span>
                      <span className="font-semibold">{healthMetrics.engagement.activeUsers}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[24px] text-blue-600">sentiment_satisfied</span>
                      <span className="font-semibold text-blue-900 dark:text-blue-100">Sentiment</span>
                    </div>
                    <Badge variant="outline" className="text-blue-600 border-blue-300">
                      {healthMetrics.sentiment.trend}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Positive</span>
                      <span className="font-semibold">{healthMetrics.sentiment.positive}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Neutral</span>
                      <span className="font-semibold">{healthMetrics.sentiment.neutral}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-red-600">Negative</span>
                      <span className="font-semibold">{healthMetrics.sentiment.negative}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 rounded-lg border">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{threads.length}</div>
                <div className="text-sm text-muted-foreground">Total Threads</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 rounded-lg border">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {threads.reduce((sum, t) => sum + (t.reply_count || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Posts</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 rounded-lg border">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {threads.reduce((sum, t) => sum + (t.view_count || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Views</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 rounded-lg border">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {healthMetrics.contentQuality.helpfulContent}
                </div>
                <div className="text-sm text-muted-foreground">Helpful Threads</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sentiment" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sentiment Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">sentiment_satisfied</span>
                    Sentiment Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Positive</span>
                      </div>
                      <span className="font-semibold">{healthMetrics.sentiment.positive}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                        <span>Neutral</span>
                      </div>
                      <span className="font-semibold">{healthMetrics.sentiment.neutral}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>Negative</span>
                      </div>
                      <span className="font-semibold">{healthMetrics.sentiment.negative}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sentiment Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">trending_up</span>
                    Sentiment Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <div className={cn("text-4xl font-bold mb-2", getSentimentColor(healthMetrics.sentiment.trend))}>
                        {healthMetrics.sentiment.trend === "improving" ? "📈" : 
                         healthMetrics.sentiment.trend === "declining" ? "📉" : "📊"}
                      </div>
                      <p className="text-lg font-semibold capitalize">{healthMetrics.sentiment.trend}</p>
                      <p className="text-sm text-muted-foreground">Overall trend</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="threads" className="space-y-6 mt-6">
            <div className="space-y-4">
              {threadAnalyses.map((analysis, index) => {
                const thread = threads[index]
                return (
                  <Card key={analysis.threadId} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{thread.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{analysis.summary}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", getSentimentColor(analysis.sentiment.overall))}
                          >
                            {analysis.sentiment.overall}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {analysis.engagement.level} engagement
                          </Badge>
                        </div>
                      </div>

                      {/* AI Insights */}
                      {analysis.aiInsights.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px] text-purple-600">auto_awesome</span>
                            AI Insights
                          </h4>
                          <div className="space-y-1">
                            {analysis.aiInsights.map((insight, i) => (
                              <p key={i} className="text-sm text-muted-foreground">{insight}</p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Suggested Actions */}
                      {analysis.suggestedActions.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {analysis.suggestedActions.map((action, i) => (
                            <Badge 
                              key={i} 
                              variant="secondary" 
                              className={cn(
                                "text-xs",
                                action.priority === "high" ? "bg-red-100 text-red-700 border-red-200" :
                                action.priority === "medium" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                                "bg-blue-100 text-blue-700 border-blue-200"
                              )}
                            >
                              {action.type}: {action.reason}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6 mt-6">
            {/* AI Recommendations */}
            {healthMetrics.recommendations.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-purple-600">lightbulb</span>
                  AI Recommendations
                </h3>
                {healthMetrics.recommendations.map((rec, index) => (
                  <Alert key={index} className={cn(
                    rec.priority === "high" ? "border-red-200 bg-red-50 dark:bg-red-900/20" :
                    rec.priority === "medium" ? "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20" :
                    "border-blue-200 bg-blue-50 dark:bg-blue-900/20"
                  )}>
                    <span className="material-symbols-outlined text-[16px]">
                      {rec.type === "warning" ? "warning" : rec.type === "action" ? "task_alt" : "info"}
                    </span>
                    <AlertDescription>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold mb-1">{rec.title}</p>
                          <p className="text-sm">{rec.description}</p>
                          {rec.actionItems && rec.actionItems.length > 0 && (
                            <ul className="mt-2 text-sm space-y-1">
                              {rec.actionItems.map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="material-symbols-outlined text-[12px] mt-0.5">arrow_right</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <Badge variant="outline" className="ml-4 text-xs">
                          {rec.priority}
                        </Badge>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {/* Community Health Summary */}
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
                  <span className="material-symbols-outlined text-[20px]">psychology</span>
                  Community Intelligence Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <p>
                    <strong>Overall Health:</strong> Your community is currently <strong>{healthMetrics.overall.status}</strong> with 
                    a health score of <strong>{Math.round(healthMetrics.overall.score * 100)}%</strong>.
                  </p>
                  <p>
                    <strong>Engagement:</strong> Members are showing <strong>{healthMetrics.engagement.trend}</strong> engagement 
                    with an average of <strong>{healthMetrics.engagement.averageReplies.toFixed(1)}</strong> replies per thread.
                  </p>
                  <p>
                    <strong>Sentiment:</strong> Community sentiment is trending <strong>{healthMetrics.sentiment.trend}</strong> with 
                    <strong> {healthMetrics.sentiment.positive}</strong> positive discussions.
                  </p>
                  <p>
                    <strong>Content Quality:</strong> <strong>{healthMetrics.contentQuality.helpfulContent}</strong> threads 
                    are generating helpful discussions for the community.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}