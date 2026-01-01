"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { analyzeSentiment, detectTrendingTopics, generateRecommendations, generateThreadSummary } from "@/lib/gemini-ai"
import { getThreads, getCommunities } from "@/lib/foru-api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { refreshAIInsights } from "@/app/actions/ai-insights-actions"

interface AIInsightsPageProps {
  initialData: {
    threads: any[]
    communities: any[]
    sentiment: any
    trendingTopics: any[]
    recommendations: any[]
    threadSummaries: any[]
  }
}

function AIInsightsContent({ initialData }: AIInsightsPageProps) {
  const [data, setData] = useState(initialData)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      console.log("[AI Insights] Starting refresh via server action...")
      const result = await refreshAIInsights()
      
      if (result.success && result.data) {
        console.log("[AI Insights] Refresh successful, updating data...")
        setData(result.data)
      } else {
        console.error("[AI Insights] Refresh failed:", result.error)
        // Could show a toast notification here
      }
    } catch (error) {
      console.error("[AI Insights] Refresh failed:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Calculate engagement metrics
  const totalPosts = data.threads.reduce((sum, t) => sum + (t.reply_count || 0), 0)
  const totalViews = data.threads.reduce((sum, t) => sum + (t.view_count || 0), 0)
  const avgEngagement = data.threads.length > 0 ? (totalPosts / data.threads.length).toFixed(1) : "0"
  const sentimentScore = Math.round(data.sentiment.score * 100)

  return (
    <DashboardLayout>
      <div className="w-full">
      {/* Top Header */}
      <header className="w-full px-6 py-5 md:px-10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#f6f6f8] dark:bg-[#101322] z-10 shrink-0">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">AI Insights</h2>
          <p className="text-slate-500 dark:text-[#929bc9] text-sm font-normal">Powered by Gemini - Intelligent analysis of your communities</p>
        </div>
        {/* AI Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-700">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">AI Setup Required</span>
          </div>
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <span className={`material-symbols-outlined text-[18px] ${isRefreshing ? 'animate-spin' : ''}`}>refresh</span>
            {isRefreshing ? 'Refreshing...' : 'Refresh Analysis'}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-10 space-y-8">
        {/* AI Metrics Row */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Sentiment Score */}
          <div className="flex flex-col gap-1 rounded-xl p-5 border border-slate-200 dark:border-[#323b67] bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <p className="text-slate-500 dark:text-[#929bc9] text-sm font-semibold uppercase tracking-wider">Sentiment Score</p>
              <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                <span className="material-symbols-outlined text-[20px]">psychology</span>
              </div>
            </div>
            <div className="flex items-end gap-3">
              <p className="text-slate-900 dark:text-white text-3xl font-bold leading-none">{sentimentScore}%</p>
              <div className="flex items-center text-[#0bda65] text-sm font-medium mb-1">
                <span className="material-symbols-outlined text-[16px]">
                  {data.sentiment.overall === 'positive' ? 'trending_up' : data.sentiment.overall === 'negative' ? 'trending_down' : 'trending_flat'}
                </span>
                <span className="ml-0.5 capitalize">{data.sentiment.overall}</span>
              </div>
            </div>
          </div>

          {/* Trending Topics */}
          <div className="flex flex-col gap-1 rounded-xl p-5 border border-slate-200 dark:border-[#323b67] bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <p className="text-slate-500 dark:text-[#929bc9] text-sm font-semibold uppercase tracking-wider">Trending Topics</p>
              <div className="p-1.5 rounded-md bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                <span className="material-symbols-outlined text-[20px]">trending_up</span>
              </div>
            </div>
            <div className="flex items-end gap-3">
              <p className="text-slate-900 dark:text-white text-3xl font-bold leading-none">{data.trendingTopics.length}</p>
              <div className="flex items-center text-[#0bda65] text-sm font-medium mb-1">
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                <span className="ml-0.5">Active</span>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="flex flex-col gap-1 rounded-xl p-5 border border-slate-200 dark:border-[#323b67] bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <p className="text-slate-500 dark:text-[#929bc9] text-sm font-semibold uppercase tracking-wider">Recommendations</p>
              <div className="p-1.5 rounded-md bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                <span className="material-symbols-outlined text-[20px]">lightbulb</span>
              </div>
            </div>
            <div className="flex items-end gap-3">
              <p className="text-slate-900 dark:text-white text-3xl font-bold leading-none">{data.recommendations.length}</p>
              <div className="flex items-center text-[#0bda65] text-sm font-medium mb-1">
                <span className="material-symbols-outlined text-[16px]">insights</span>
                <span className="ml-0.5">Ready</span>
              </div>
            </div>
          </div>

          {/* Engagement Rate */}
          <div className="flex flex-col gap-1 rounded-xl p-5 border border-slate-200 dark:border-[#323b67] bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <p className="text-slate-500 dark:text-[#929bc9] text-sm font-semibold uppercase tracking-wider">Avg Engagement</p>
              <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <span className="material-symbols-outlined text-[20px]">forum</span>
              </div>
            </div>
            <div className="flex items-end gap-3">
              <p className="text-slate-900 dark:text-white text-3xl font-bold leading-none">{avgEngagement}</p>
              <div className="flex items-center text-[#0bda65] text-sm font-medium mb-1">
                <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                <span className="ml-0.5">per thread</span>
              </div>
            </div>
          </div>
        </section>

        {/* AI Analysis Tabs */}
        <section className="w-full">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white dark:bg-[#151a2d] border border-slate-200 dark:border-[#323b67]">
              <TabsTrigger value="overview" className="data-[state=active]:bg-[#1337ec] data-[state=active]:text-white">Overview</TabsTrigger>
              <TabsTrigger value="sentiment" className="data-[state=active]:bg-[#1337ec] data-[state=active]:text-white">Sentiment</TabsTrigger>
              <TabsTrigger value="trending" className="data-[state=active]:bg-[#1337ec] data-[state=active]:text-white">Trending</TabsTrigger>
              <TabsTrigger value="recommendations" className="data-[state=active]:bg-[#1337ec] data-[state=active]:text-white">Recommendations</TabsTrigger>
              <TabsTrigger value="summaries" className="data-[state=active]:bg-[#1337ec] data-[state=active]:text-white">Summaries</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Community Health Overview */}
              <div className="rounded-xl border border-slate-200 dark:border-[#323b67] bg-white dark:bg-[#151a2d] shadow-sm">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30">
                      <span className="material-symbols-outlined text-[24px] text-purple-600 dark:text-purple-400">health_and_safety</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Community Health Overview</h3>
                      <p className="text-slate-500 dark:text-[#929bc9] text-sm">AI-powered analysis of your community's wellbeing</p>
                    </div>
                  </div>
                  
                  <div className="rounded-lg bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/20 p-6 border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base">
                      {data.sentiment.summary}
                    </p>
                    
                    {data.sentiment.summary.includes("API configuration") && (
                      <div className="mt-4 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-[18px] text-orange-600 dark:text-orange-400">info</span>
                          <span className="font-semibold text-orange-800 dark:text-orange-300">Setup Required</span>
                        </div>
                        <p className="text-sm text-orange-700 dark:text-orange-400 mb-3">
                          To enable AI-powered insights, you need to configure a valid Gemini API key:
                        </p>
                        <ol className="text-sm text-orange-700 dark:text-orange-400 space-y-1 ml-4">
                          <li>1. Visit <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Google AI Studio</a></li>
                          <li>2. Create a new API key</li>
                          <li>3. Update your .env file: GEMINI_API_KEY=your_key_here</li>
                          <li>4. Restart the application</li>
                        </ol>
                      </div>
                    )}
                  </div>

                  {data.sentiment.topics && data.sentiment.topics.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px] text-[#1337ec]">topic</span>
                        Discussion Topics Analysis
                      </h4>
                      <div className="grid gap-3">
                        {data.sentiment.topics.slice(0, 5).map((topic: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-[#323b67] bg-slate-50 dark:bg-[#232948]">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#1337ec]/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[16px] text-[#1337ec]">chat_bubble</span>
                              </div>
                              <div>
                                <span className="font-medium text-slate-900 dark:text-white">{topic.topic}</span>
                                <p className="text-sm text-slate-500 dark:text-[#929bc9]">{topic.mentions} mentions</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                topic.sentiment === 'positive' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : topic.sentiment === 'negative'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                  : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                              }`}>
                                <span className="material-symbols-outlined text-[12px] mr-1">
                                  {topic.sentiment === 'positive' ? 'sentiment_satisfied' : topic.sentiment === 'negative' ? 'sentiment_dissatisfied' : 'sentiment_neutral'}
                                </span>
                                {topic.sentiment}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sentiment" className="space-y-6">
              <div className="rounded-xl border border-slate-200 dark:border-[#323b67] bg-white dark:bg-[#151a2d] shadow-sm">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
                      <span className="material-symbols-outlined text-[24px] text-purple-600 dark:text-purple-400">sentiment_satisfied</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Sentiment Analysis</h3>
                      <p className="text-slate-500 dark:text-[#929bc9] text-sm">Community mood and discussion quality breakdown</p>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-3">
                    {/* Positive Sentiment */}
                    <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-green-800 dark:text-green-300">Positive</span>
                        <span className="text-2xl font-bold text-green-800 dark:text-green-300">{data.sentiment.positive || 60}%</span>
                      </div>
                      <div className="h-2 bg-green-200 dark:bg-green-800 rounded-full overflow-hidden">
                        <div className="h-full bg-green-600 dark:bg-green-400 rounded-full" style={{ width: `${data.sentiment.positive || 60}%` }} />
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-400 mt-2">Healthy community engagement</p>
                    </div>

                    {/* Neutral Sentiment */}
                    <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-blue-800 dark:text-blue-300">Neutral</span>
                        <span className="text-2xl font-bold text-blue-800 dark:text-blue-300">{data.sentiment.neutral || 30}%</span>
                      </div>
                      <div className="h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 dark:bg-blue-400 rounded-full" style={{ width: `${data.sentiment.neutral || 30}%` }} />
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-400 mt-2">Balanced discussions</p>
                    </div>

                    {/* Negative Sentiment */}
                    <div className="p-4 rounded-lg bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-700">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-red-800 dark:text-red-300">Negative</span>
                        <span className="text-2xl font-bold text-red-800 dark:text-red-300">{data.sentiment.negative || 10}%</span>
                      </div>
                      <div className="h-2 bg-red-200 dark:bg-red-800 rounded-full overflow-hidden">
                        <div className="h-full bg-red-600 dark:bg-red-400 rounded-full" style={{ width: `${data.sentiment.negative || 10}%` }} />
                      </div>
                      <p className="text-sm text-red-700 dark:text-red-400 mt-2">Areas for improvement</p>
                    </div>
                  </div>

                  <div className="mt-8 p-6 rounded-lg bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/20 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="material-symbols-outlined text-[20px] text-[#1337ec]">insights</span>
                      <span className="font-semibold text-slate-900 dark:text-white">AI Insight</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">
                      Your community maintains a healthy sentiment balance with {data.sentiment.positive || 60}% positive discussions. 
                      This indicates strong engagement and user satisfaction. The low negative sentiment suggests effective moderation and community guidelines.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="trending" className="space-y-6">
              <div className="rounded-xl border border-slate-200 dark:border-[#323b67] bg-white dark:bg-[#151a2d] shadow-sm">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30">
                      <span className="material-symbols-outlined text-[24px] text-green-600 dark:text-green-400">trending_up</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Trending Topics</h3>
                      <p className="text-slate-500 dark:text-[#929bc9] text-sm">Most discussed topics across your communities</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {data.trendingTopics.length > 0 ? data.trendingTopics.map((topic: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-5 rounded-lg border border-slate-200 dark:border-[#323b67] bg-slate-50 dark:bg-[#232948] hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#1337ec]/10 to-blue-500/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[20px] text-[#1337ec]">topic</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white text-lg">{topic.topic}</h4>
                            <p className="text-slate-500 dark:text-[#929bc9] text-sm">{topic.mentions} discussions • {topic.engagement || 'High'} engagement</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            topic.trend === 'rising' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : topic.trend === 'falling'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                          }`}>
                            <span className="material-symbols-outlined text-[16px] mr-1">
                              {topic.trend === 'rising' ? 'trending_up' : topic.trend === 'falling' ? 'trending_down' : 'trending_flat'}
                            </span>
                            {topic.trend || 'stable'}
                          </span>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-[#232948] flex items-center justify-center mx-auto mb-4">
                          <span className="material-symbols-outlined text-[32px] text-slate-400 dark:text-[#929bc9]">trending_up</span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No trending topics yet</h3>
                        <p className="text-slate-500 dark:text-[#929bc9]">AI will identify trending topics as your community grows</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              {data.recommendations.length > 0 ? data.recommendations.map((rec: any, index: number) => (
                <div key={index} className="rounded-xl border border-slate-200 dark:border-[#323b67] bg-white dark:bg-[#151a2d] shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${
                          rec.priority === 'high' 
                            ? 'bg-red-100 dark:bg-red-900/30' 
                            : rec.priority === 'medium'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30'
                            : 'bg-blue-100 dark:bg-blue-900/30'
                        }`}>
                          <span className={`material-symbols-outlined text-[20px] ${
                            rec.priority === 'high' 
                              ? 'text-red-600 dark:text-red-400' 
                              : rec.priority === 'medium'
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-blue-600 dark:text-blue-400'
                          }`}>
                            {rec.priority === 'high' ? 'priority_high' : rec.priority === 'medium' ? 'warning' : 'lightbulb'}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{rec.title}</h3>
                          <p className="text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">{rec.description}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        rec.priority === 'high' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : rec.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {rec.priority} priority
                      </span>
                    </div>
                    
                    {rec.actionItems && rec.actionItems.length > 0 && (
                      <div className="mt-6 p-4 rounded-lg bg-slate-50 dark:bg-[#232948] border border-slate-200 dark:border-[#323b67]">
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-[#1337ec]">checklist</span>
                          Suggested Actions
                        </h4>
                        <ul className="space-y-2">
                          {rec.actionItems.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                              <span className="material-symbols-outlined text-[16px] text-[#1337ec] mt-0.5">arrow_forward</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )) : (
                <div className="rounded-xl border border-slate-200 dark:border-[#323b67] bg-white dark:bg-[#151a2d] shadow-sm">
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-[#232948] flex items-center justify-center mx-auto mb-4">
                      <span className="material-symbols-outlined text-[32px] text-slate-400 dark:text-[#929bc9]">lightbulb</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No recommendations yet</h3>
                    <p className="text-slate-500 dark:text-[#929bc9]">AI will generate recommendations as your community data grows</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="summaries" className="space-y-4">
              {data.threadSummaries.length > 0 ? data.threadSummaries.map((item: any, index: number) => (
                <div key={index} className="rounded-xl border border-slate-200 dark:border-[#323b67] bg-white dark:bg-[#151a2d] shadow-sm">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#1337ec]/10 to-purple-500/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#1337ec] font-bold text-sm">
                          {item.thread.user?.username?.slice(0, 2).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.thread.title}</h3>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                            <span className="material-symbols-outlined text-[12px] mr-1">auto_awesome</span>
                            AI Summary
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-[#929bc9] mb-4">
                          <span>by {item.thread.user?.username || 'Anonymous'}</span>
                          <span>•</span>
                          <span>{item.thread.reply_count || 0} replies</span>
                          <span>•</span>
                          <span>{item.thread.view_count || 0} views</span>
                        </div>
                        <div className="p-4 rounded-lg bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-800 dark:to-purple-900/20 border border-slate-200 dark:border-slate-700">
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{item.summary}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="rounded-xl border border-slate-200 dark:border-[#323b67] bg-white dark:bg-[#151a2d] shadow-sm">
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-[#232948] flex items-center justify-center mx-auto mb-4">
                      <span className="material-symbols-outlined text-[32px] text-slate-400 dark:text-[#929bc9]">summarize</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No summaries available</h3>
                    <p className="text-slate-500 dark:text-[#929bc9]">AI will generate thread summaries as discussions develop</p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </div>
      </div>
    </DashboardLayout>
  )
}

export default async function AIInsightsPage() {
  console.log("[AI Insights] Starting page load...")
  
  // Fetch data for analysis
  let threadsResponse: { threads: any[], nextCursor: string | null, count: number }
  let communities: any[]
  
  try {
    [threadsResponse, communities] = await Promise.all([
      getThreads(100),
      getCommunities()
    ])
    console.log("[AI Insights] Data fetched successfully:", {
      threadsCount: threadsResponse.threads.length,
      communitiesCount: communities.length
    })
  } catch (error) {
    console.error("[AI Insights] Failed to fetch data:", error)
    // Use empty data if API fails
    threadsResponse = { threads: [], nextCursor: null, count: 0 }
    communities = []
  }
  
  const threads = threadsResponse.threads || []
  
  // Generate AI insights
  let sentiment: any = {
    overall: "neutral",
    score: 0,
    summary: threads.length === 0 
      ? "Your community is just getting started! As more discussions develop, AI will provide deeper insights into community sentiment and engagement patterns. Currently, no threads are available for analysis."
      : "Your community is just getting started! As more discussions develop, AI will provide deeper insights into community sentiment and engagement patterns. Currently, AI analysis is unavailable due to API configuration issues.",
    topics: [],
    positive: 50,
    neutral: 30,
    negative: 20
  }
  
  let trendingTopics: any[] = []
  let recommendations: any[] = [
    {
      type: "action",
      priority: "high",
      title: "Configure AI Analysis",
      description: "Set up a valid Gemini API key to enable AI-powered insights, sentiment analysis, and recommendations for your community.",
      actionItems: [
        "Obtain a valid Gemini API key from Google AI Studio",
        "Update the GEMINI_API_KEY environment variable",
        "Restart the application to apply changes",
        "Test the AI functionality using the refresh button"
      ]
    },
    {
      type: "insight",
      priority: "medium",
      title: "Community Growth Strategy",
      description: "Focus on building a strong foundation for your community with engaging content and clear guidelines.",
      actionItems: [
        "Create welcome posts and community guidelines",
        "Encourage member introductions and discussions",
        "Share relevant content to spark conversations",
        "Monitor engagement and respond to member questions"
      ]
    }
  ]
  let threadSummaries: any[] = []

  if (threads.length > 0) {
    try {
      console.log("[AI Insights] Generating AI insights for", threads.length, "threads...")
      const [sentimentResult, trendingResult, recommendationsResult] = await Promise.all([
        analyzeSentiment(threads),
        detectTrendingTopics(threads),
        generateRecommendations(threads, sentiment)
      ])
      
      sentiment = sentimentResult
      trendingTopics = trendingResult
      recommendations = recommendationsResult
      
      // Generate summaries for top threads
      const topThreads = threads.slice(0, 5)
      threadSummaries = await Promise.all(
        topThreads.map(async (thread) => {
          try {
            const summary = await generateThreadSummary(thread, [])
            return { thread, summary }
          } catch (error) {
            return { thread, summary: "Summary unavailable" }
          }
        })
      )
      console.log("[AI Insights] AI insights generated successfully")
    } catch (error) {
      console.error("[AI Insights] Error generating insights:", error)
    }
  } else {
    console.log("[AI Insights] No threads available, using default insights")
  }

  const initialData = {
    threads,
    communities,
    sentiment,
    trendingTopics,
    recommendations,
    threadSummaries
  }

  return <AIInsightsContent initialData={initialData} />
}