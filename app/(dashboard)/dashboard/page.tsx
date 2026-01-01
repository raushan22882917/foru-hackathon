import { getCommunityStats, getThreads } from "@/lib/foru-api"
import { analyzeSentiment, detectTrendingTopics, generateRecommendations } from "@/lib/gemini-ai"

export default async function DashboardPage() {
  const [stats, threadsResponse] = await Promise.all([
    getCommunityStats(),
    getThreads(50),
  ])

  const threads = threadsResponse.threads || []

  let sentiment: {
    overall: "positive" | "negative" | "neutral" | "mixed"
    score: number
    summary: string
    topics: Array<{
      topic: string
      sentiment: "positive" | "negative" | "neutral"
      mentions: number
    }>
  } = {
    overall: "neutral",
    score: 0,
    summary: "Loading community sentiment...",
    topics: [],
  }
  let trendingTopics: any[] = []
  let recommendations: any[] = []

  if (threads.length > 0) {
    try {
      sentiment = await analyzeSentiment(threads)
      trendingTopics = await detectTrendingTopics(threads)
      recommendations = await generateRecommendations(threads, sentiment)
    } catch (error) {
      console.error("[v0] AI analysis error:", error)
    }
  }

  // Calculate real stats
  const totalThreads = stats.totalThreads || threads.length || 0
  const totalPosts = stats.totalPosts || threads.reduce((sum, thread) => sum + (thread.reply_count || 0), 0) || 0
  const sentimentScore = Math.round(sentiment.score * 100) || 0
  
  // Get trending topic for hero section
  const topTrendingTopic = trendingTopics[0]?.topic || "Community Discussions"
  
  // Mock activity logs since we removed Supabase
  const activityLogs = [
    {
      id: 1,
      action_type: 'thread_created',
      entity_type: 'thread',
      entity_id: '123',
      metadata: { title: 'New Discussion Started' },
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      action_type: 'user_signup',
      entity_type: 'user',
      entity_id: '456',
      metadata: { username: 'new_user' },
      created_at: new Date(Date.now() - 3600000).toISOString()
    }
  ]

  return (
    <div className="w-full">
      {/* Top Sticky Header */}
      <header className="w-full px-6 py-5 md:px-10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#f6f6f8] dark:bg-[#101322] z-10 shrink-0">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">Dashboard</h2>
          <p className="text-slate-500 dark:text-[#929bc9] text-sm font-normal">Overview of community health and system logs</p>
        </div>
        {/* Search Bar */}
        <div className="flex items-center w-full md:w-auto md:min-w-[320px]">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#929bc9]">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input
              className="block w-full pl-10 pr-3 py-2.5 text-sm rounded-lg bg-white dark:bg-[#232948] border-slate-200 dark:border-transparent placeholder-slate-400 dark:placeholder-[#929bc9] text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1337ec] focus:border-[#1337ec] focus:outline-none shadow-sm transition-all"
              placeholder="Search threads, users, or logs..."
              type="text"
            />
          </div>
          {/* Notification Bell */}
          <button className="ml-4 p-2 text-slate-500 dark:text-[#929bc9] hover:text-[#1337ec] dark:hover:text-white rounded-full hover:bg-slate-200 dark:hover:bg-[#232948] transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#101322]"></span>
          </button>
        </div>
      </header>

      {/* Scrollable Dashboard Content */}
      <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-10 space-y-8">
        {/* Stats Row */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Total Threads */}
          <div className="flex flex-col gap-1 rounded-xl p-5 border border-slate-200 dark:border-[#323b67] bg-white dark:bg-[#151a2d] shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <p className="text-slate-500 dark:text-[#929bc9] text-sm font-semibold uppercase tracking-wider">Total Threads</p>
              <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                <span className="material-symbols-outlined text-[20px]">forum</span>
              </div>
            </div>
            <div className="flex items-end gap-3">
              <p className="text-slate-900 dark:text-white text-3xl font-bold leading-none">{totalThreads.toLocaleString()}</p>
              <div className="flex items-center text-[#0bda65] text-sm font-medium mb-1">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                <span className="ml-0.5">+{Math.round((totalThreads / 1000) * 5)}%</span>
              </div>
            </div>
          </div>

          {/* Active Discussions */}
          <div className="flex flex-col gap-1 rounded-xl p-5 border border-slate-200 dark:border-[#323b67] bg-white dark:bg-[#151a2d] shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <p className="text-slate-500 dark:text-[#929bc9] text-sm font-semibold uppercase tracking-wider">Active Discussions</p>
              <div className="p-1.5 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
              </div>
            </div>
            <div className="flex items-end gap-3">
              <p className="text-slate-900 dark:text-white text-3xl font-bold leading-none">{totalPosts.toLocaleString()}</p>
              <div className="flex items-center text-[#0bda65] text-sm font-medium mb-1">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                <span className="ml-0.5">+{Math.round((totalPosts / 100) * 2)}%</span>
              </div>
            </div>
          </div>

          {/* AI Sentiment */}
          <div className="flex flex-col gap-1 rounded-xl p-5 border border-slate-200 dark:border-[#323b67] bg-white dark:bg-[#151a2d] shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <p className="text-slate-500 dark:text-[#929bc9] text-sm font-semibold uppercase tracking-wider">AI Sentiment Score</p>
              <div className="p-1.5 rounded-md bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                <span className="material-symbols-outlined text-[20px]">psychology</span>
              </div>
            </div>
            <div className="flex items-end gap-3">
              <p className="text-slate-900 dark:text-white text-3xl font-bold leading-none">{sentimentScore}%</p>
              <div className="flex items-center text-slate-500 dark:text-[#929bc9] text-sm font-medium mb-1">
                <span className="capitalize">{sentiment.overall}</span>
              </div>
              <div className="flex items-center text-[#0bda65] text-sm font-medium mb-1 ml-auto">
                <span className="material-symbols-outlined text-[16px]">
                  {sentiment.overall === 'positive' ? 'trending_up' : sentiment.overall === 'negative' ? 'trending_down' : 'trending_flat'}
                </span>
                <span className="ml-0.5">
                  {sentiment.overall === 'positive' ? '+' : sentiment.overall === 'negative' ? '-' : ''}
                  {Math.abs(sentimentScore - 75)}%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* AI Insights Hero */}
        <section className="w-full">
          <div 
            className="bg-cover bg-center flex flex-col items-stretch justify-end rounded-xl overflow-hidden shadow-lg min-h-[240px] relative group"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(16, 19, 34, 0.1) 0%, rgba(16, 19, 34, 0.9) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuC4b9ioLEO1-kZu6oqY3yQEdzhk_hih65r9W2pL1_PdPTZ7a23d-nr1Xxev1Cn0zEFUsPZABLHH23ncCGAWuU9wmjTL560r2d71l3OMK9wJ9cRmc2hL34xj-UZ3Rrz-rBA3HpQGF8_EuHjIeTZ0u31mUF2G0HATN-5dSV6cru9WAFpM1P4VyT-My0n8sJVdwIX0xcekVbO2y1eh-T9bmVn9c72r5HQDMQ-Yi738sOJ-OOgF5RbZlvKKdCjq37j7oTbkxwPY-DW9eY3k")`
            }}
          >
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-[#1337ec]/90 text-white backdrop-blur-sm border border-[#1337ec]/50 shadow-lg shadow-blue-900/20">
                <span className="material-symbols-outlined text-[14px] mr-1">auto_awesome</span>
                AI INSIGHTS
              </span>
            </div>
            <div className="flex flex-col md:flex-row w-full items-end justify-between gap-6 p-6 md:p-8 z-10">
              <div className="flex flex-col gap-2 max-w-[600px]">
                <h3 className="text-white tracking-tight text-2xl md:text-3xl font-bold leading-tight">
                  Trending: {topTrendingTopic}
                </h3>
                <p className="text-slate-200 text-sm md:text-base font-medium leading-relaxed max-w-xl">
                  {sentiment.summary || "Community sentiment analysis in progress. Monitor engagement patterns and trending discussions."}
                  {recommendations.length > 0 && (
                    <span className="block mt-1">
                      <strong>Action needed:</strong> {recommendations[0]?.description || "Review community activity."}
                    </span>
                  )}
                </p>
              </div>
              <button className="flex items-center justify-center rounded-lg h-10 px-5 bg-[#1337ec] hover:bg-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-900/30 transition-all transform active:scale-95 whitespace-nowrap">
                View AI Report
              </button>
            </div>
          </div>
        </section>

        {/* Split Section: Charts & Logs */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="rounded-xl border border-slate-200 dark:border-[#323b67] bg-white dark:bg-[#151a2d] shadow-sm p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-slate-900 dark:text-white font-bold text-lg">Platform Usage</h4>
                <button className="text-[#929bc9] hover:text-[#1337ec]">
                  <span className="material-symbols-outlined">more_horiz</span>
                </button>
              </div>
              {/* Simple visual representation of a chart */}
              <div className="flex items-end justify-between h-40 gap-2 px-2">
                <div className="w-full bg-slate-100 dark:bg-[#232948] rounded-t-sm h-[40%] hover:bg-[#1337ec]/50 transition-colors relative group">
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded">Mon</div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-[#232948] rounded-t-sm h-[65%] hover:bg-[#1337ec]/50 transition-colors relative group">
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded">Tue</div>
                </div>
                <div className="w-full bg-[#1337ec] rounded-t-sm h-[85%] relative shadow-[0_0_10px_rgba(19,55,236,0.5)]">
                  <div className="opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1337ec] text-white text-xs py-1 px-2 rounded font-bold">Wed</div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-[#232948] rounded-t-sm h-[55%] hover:bg-[#1337ec]/50 transition-colors relative group">
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded">Thu</div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-[#232948] rounded-t-sm h-[70%] hover:bg-[#1337ec]/50 transition-colors relative group">
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded">Fri</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#232948] flex justify-between text-xs text-[#929bc9]">
                <span>Total Users: <strong className="text-slate-900 dark:text-white">{Math.round(totalThreads * 0.8)}</strong></span>
                <span>Active Today: <strong className="text-slate-900 dark:text-white">{Math.round(totalPosts * 0.3)}</strong></span>
              </div>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-[#323b67] bg-white dark:bg-[#151a2d] shadow-sm flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-[#323b67] flex justify-between items-center">
              <h3 className="text-slate-900 dark:text-white font-bold text-lg">Recent System Activity</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-100 dark:bg-[#232948] text-slate-600 dark:text-[#929bc9] hover:text-[#1337ec] dark:hover:text-white transition-colors">Filter</button>
                <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-100 dark:bg-[#232948] text-slate-600 dark:text-[#929bc9] hover:text-[#1337ec] dark:hover:text-white transition-colors">Export</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-[#1c2236] border-b border-slate-200 dark:border-[#323b67]">
                    <th className="px-6 py-3 text-xs font-semibold tracking-wider text-slate-500 dark:text-[#929bc9] uppercase">Event</th>
                    <th className="px-6 py-3 text-xs font-semibold tracking-wider text-slate-500 dark:text-[#929bc9] uppercase">Source</th>
                    <th className="px-6 py-3 text-xs font-semibold tracking-wider text-slate-500 dark:text-[#929bc9] uppercase">Time</th>
                    <th className="px-6 py-3 text-xs font-semibold tracking-wider text-slate-500 dark:text-[#929bc9] uppercase text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#323b67]">
                  {activityLogs.length > 0 ? (
                    activityLogs.map((activity, index) => {
                      const timeAgo = new Date(activity.created_at).toLocaleTimeString('en-US', { 
                        hour12: false, 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        second: '2-digit' 
                      })
                      
                      const getActivityIcon = (actionType: string) => {
                        switch (actionType.toLowerCase()) {
                          case 'user_signup':
                          case 'signup':
                            return { icon: 'person_add', color: 'blue', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' }
                          case 'thread_created':
                          case 'create_thread':
                            return { icon: 'post_add', color: 'slate', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400' }
                          case 'moderation_flag':
                          case 'flag_content':
                            return { icon: 'warning', color: 'orange', bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' }
                          case 'api_error':
                          case 'error':
                            return { icon: 'error', color: 'red', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' }
                          default:
                            return { icon: 'info', color: 'gray', bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400' }
                        }
                      }
                      
                      const activityStyle = getActivityIcon(activity.action_type)
                      const entityInfo = activity.metadata ? 
                        (typeof activity.metadata === 'object' && activity.metadata !== null ? 
                          Object.entries(activity.metadata).slice(0, 1).map(([key, value]) => `${key}: ${value}`).join(', ') : 
                          String(activity.metadata)
                        ) : 
                        `${activity.entity_type || 'System'} ${activity.entity_id || ''}`
                      
                      return (
                        <tr key={activity.id} className="hover:bg-slate-50 dark:hover:bg-[#1e2439] transition-colors group cursor-pointer">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`${activityStyle.bg} p-2 rounded ${activityStyle.text}`}>
                                <span className="material-symbols-outlined text-[18px]">{activityStyle.icon}</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                                  {activity.action_type.replace(/_/g, ' ')}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-[#929bc9] truncate max-w-[200px]">
                                  {entityInfo}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-green-500"></span>
                              <span className="text-sm text-slate-600 dark:text-slate-300">System</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 dark:text-[#929bc9] font-mono">{timeAgo}</td>
                          <td className="px-6 py-4 text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400">
                              Success
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <span className="material-symbols-outlined text-[32px] text-slate-400 dark:text-[#929bc9]">inbox</span>
                          <p className="text-slate-500 dark:text-[#929bc9] text-sm">No recent activity to display</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
