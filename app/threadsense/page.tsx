"use client"

import { useState, useEffect } from "react"
import { getThreads } from "@/lib/foru-api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ThreadSenseDashboard } from "@/components/threadsense-dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function ThreadSensePage() {
  const [threads, setThreads] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    async function fetchThreads() {
      try {
        setIsLoading(true)
        setError("")
        
        // Fetch threads for analysis
        const threadsResponse = await getThreads(50) // Get more threads for better analysis
        setThreads(threadsResponse.threads || [])
        
        console.log("[ThreadSense] Successfully loaded threads:", threadsResponse.threads?.length || 0)
      } catch (err) {
        console.error("[ThreadSense] Failed to load threads:", err)
        setError("Unable to load forum data. This might be due to authentication issues or the forum being empty.")
        // Set empty threads array so the page still renders
        setThreads([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchThreads()
  }, [])

  return (
    <DashboardLayout>
      <div className="w-full">
        {/* Hero Header */}
        <header className="w-full px-6 py-8 md:px-10 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-indigo-900/20 border-b border-purple-200/50 dark:border-purple-700/50">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-lg opacity-20"></div>
                <span className="material-symbols-outlined text-[48px] text-purple-600 relative z-10">psychology</span>
              </div>
              <div>
                <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  ThreadSense AI
                </h1>
                <p className="text-xl text-purple-700 dark:text-purple-300 font-medium">
                  Intelligent Community Brain
                </p>
              </div>
            </div>
            
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              Harness the power of AI to understand your community better. Get intelligent insights, 
              sentiment analysis, smart suggestions, and automated moderation to build a thriving forum.
            </p>

            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200 px-3 py-1">
                <span className="material-symbols-outlined text-[16px] mr-2">auto_awesome</span>
                AI Powered
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1">
                <span className="material-symbols-outlined text-[16px] mr-2">insights</span>
                Real-time Analysis
              </Badge>
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 border-indigo-200 px-3 py-1">
                <span className="material-symbols-outlined text-[16px] mr-2">shield</span>
                Smart Moderation
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 px-3 py-1">
                <span className="material-symbols-outlined text-[16px] mr-2">trending_up</span>
                Community Health
              </Badge>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 space-y-8">
          {/* Error Alert */}
          {error && (
            <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
              <AlertDescription className="text-orange-700 dark:text-orange-300">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Feature Overview Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[32px] text-blue-600">summarize</span>
                  <div>
                    <CardTitle className="text-lg text-blue-900 dark:text-blue-100">TL;DR Bot</CardTitle>
                    <CardDescription className="text-blue-700 dark:text-blue-300">Smart Summaries</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
                  Automatically generate concise summaries for long discussions, helping users quickly understand key points.
                </p>
                <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                  <span className="material-symbols-outlined text-[12px]">check_circle</span>
                  <span>Auto-generated for 5+ replies</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[32px] text-green-600">chat_bubble</span>
                  <div>
                    <CardTitle className="text-lg text-green-900 dark:text-green-100">Smart Reply Assistant</CardTitle>
                    <CardDescription className="text-green-700 dark:text-green-300">AI-Powered Responses</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-800 dark:text-green-200 mb-4">
                  Integrated directly into reply forms, helping users write better, more engaging responses with AI suggestions.
                </p>
                <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                  <span className="material-symbols-outlined text-[12px]">check_circle</span>
                  <span>Built into thread replies</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-700 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[32px] text-yellow-600">sentiment_satisfied</span>
                  <div>
                    <CardTitle className="text-lg text-yellow-900 dark:text-yellow-100">Sentiment Meter</CardTitle>
                    <CardDescription className="text-yellow-700 dark:text-yellow-300">Mood Analysis</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-4">
                  Real-time sentiment analysis to understand community mood and identify positive or negative trends.
                </p>
                <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400">
                  <span className="material-symbols-outlined text-[12px]">check_circle</span>
                  <span>Positive/Neutral/Negative detection</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[32px] text-purple-600">recommend</span>
                  <div>
                    <CardTitle className="text-lg text-purple-900 dark:text-purple-100">Smart Suggestions</CardTitle>
                    <CardDescription className="text-purple-700 dark:text-purple-300">Related Content</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-purple-800 dark:text-purple-200 mb-4">
                  "People discussing this also viewed" - intelligent content recommendations based on context and similarity.
                </p>
                <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400">
                  <span className="material-symbols-outlined text-[12px]">check_circle</span>
                  <span>Context-aware recommendations</span>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Additional AI Features */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-700 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[32px] text-orange-600">shield</span>
                  <div>
                    <CardTitle className="text-lg text-orange-900 dark:text-orange-100">AI Moderator</CardTitle>
                    <CardDescription className="text-orange-700 dark:text-orange-300">Content Safety</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-800 dark:text-orange-200 mb-4">
                  Automatically detect toxic content, spam, and policy violations to maintain a healthy community.
                </p>
                <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400">
                  <span className="material-symbols-outlined text-[12px]">check_circle</span>
                  <span>Real-time content analysis</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-indigo-200 dark:border-indigo-700 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[32px] text-indigo-600">insights</span>
                  <div>
                    <CardTitle className="text-lg text-indigo-900 dark:text-indigo-100">Community Health</CardTitle>
                    <CardDescription className="text-indigo-700 dark:text-indigo-300">Analytics & Insights</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-indigo-800 dark:text-indigo-200 mb-4">
                  Comprehensive analytics dashboard showing community health metrics, engagement trends, and actionable insights.
                </p>
                <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400">
                  <span className="material-symbols-outlined text-[12px]">check_circle</span>
                  <span>Real-time health monitoring</span>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Main ThreadSense Dashboard */}
          <section>
            {isLoading ? (
              <Card>
                <CardHeader>
                  <CardTitle>Loading Forum Analysis...</CardTitle>
                  <CardDescription>Fetching threads and generating AI insights</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <ThreadSenseDashboard threads={threads} />
            )}
          </section>

          {/* How It Works */}
          <section className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">How ThreadSense AI Works</h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Our AI analyzes your forum content in real-time to provide actionable insights and improve community engagement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-[32px] text-white">psychology</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">1. AI Analysis</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Advanced AI models analyze thread content, user interactions, and community patterns in real-time.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-[32px] text-white">insights</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">2. Smart Insights</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Generate actionable insights about sentiment, engagement, content quality, and community health.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-[32px] text-white">auto_awesome</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">3. Automated Actions</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Take intelligent actions like content moderation, smart suggestions, and engagement optimization.
                </p>
              </div>
            </div>
          </section>

          {/* Live Demo Section */}
          <section className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">See ThreadSense in Action</h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Experience the power of AI-driven community intelligence with real forum data.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-white dark:bg-slate-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-blue-600">forum</span>
                    Live Forum Analysis
                  </CardTitle>
                  <CardDescription>
                    Real-time analysis of your forum threads and community health
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Threads Analyzed</span>
                      {isLoading ? (
                        <Skeleton className="h-5 w-12" />
                      ) : (
                        <Badge variant="outline">{threads.length}</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">AI Features Active</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">4/4</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Real-time Processing</span>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600">Active</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-purple-600">auto_awesome</span>
                    AI Capabilities
                  </CardTitle>
                  <CardDescription>
                    Advanced AI features powered by Gemini and custom models
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-green-600">check_circle</span>
                      <span className="text-sm">Sentiment Analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-green-600">check_circle</span>
                      <span className="text-sm">Content Summarization</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-green-600">check_circle</span>
                      <span className="text-sm">Smart Recommendations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-green-600">check_circle</span>
                      <span className="text-sm">Automated Moderation</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-8">
              <Link href="/forum">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                  <span className="material-symbols-outlined text-[20px] mr-2">forum</span>
                  Explore Forum with AI Features
                </Button>
              </Link>
            </div>
          </section>

          {/* Technical Details */}
          <section className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Technical Implementation</h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Built with cutting-edge AI technology and seamlessly integrated with the Foru.ms data model.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                    <span className="material-symbols-outlined text-[20px]">code</span>
                    AI Technology Stack
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-blue-600">psychology</span>
                      <span><strong>Google Gemini AI</strong> - Advanced language understanding</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-blue-600">analytics</span>
                      <span><strong>Sentiment Analysis</strong> - Real-time mood detection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-blue-600">summarize</span>
                      <span><strong>Text Summarization</strong> - Intelligent content condensation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-oriented text-[16px] text-blue-600">shield</span>
                      <span><strong>Content Moderation</strong> - Automated safety checks</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
                    <span className="material-symbols-outlined text-[20px]">database</span>
                    Foru.ms Integration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-green-600">person</span>
                      <span><strong>Users</strong> - Behavior profiling and analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-green-600">forum</span>
                      <span><strong>Threads</strong> - Context and summarization</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-green-600">chat_bubble</span>
                      <span><strong>Posts</strong> - Sentiment and embeddings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-green-600">api</span>
                      <span><strong>Real-time API</strong> - Live data processing</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  )
}