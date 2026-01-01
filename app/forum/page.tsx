import { getThreads, getCommunities } from "@/lib/foru-api"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateThreadDialog } from "@/components/create-thread-dialog"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ThreadSenseDashboard } from "@/components/threadsense-dashboard"
import { TLDRSuggestion } from "@/components/tldr-bot"

export default async function ForumPage() {
  // Fetch real data without authentication
  const [threadsResponse, communities] = await Promise.all([
    getThreads(20),
    getCommunities()
  ])

  const threads = threadsResponse.threads || []

  return (
    <DashboardLayout>
      <div className="w-full">
        {/* Top Header */}
        <header className="w-full px-6 py-5 md:px-10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#f6f6f8] dark:bg-[#101322] z-10 shrink-0">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">Forum</h2>
            <p className="text-slate-500 dark:text-[#929bc9] text-sm font-normal">Community discussions and conversations</p>
          </div>
          {/* Search Bar */}
          <div className="flex items-center w-full md:w-auto md:min-w-[320px]">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#929bc9]">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2.5 text-sm rounded-lg bg-white dark:bg-[#232948] border-slate-200 dark:border-transparent placeholder-slate-400 dark:placeholder-[#929bc9] text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1337ec] focus:border-[#1337ec] focus:outline-none shadow-sm transition-all"
                placeholder="Search discussions..."
                type="text"
              />
            </div>
            <CreateThreadDialog>
              <button className="ml-4 p-2.5 bg-[#1337ec] hover:bg-blue-700 text-white rounded-lg transition-colors">
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
            </CreateThreadDialog>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-10 space-y-8">
          {/* Stats Row */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {/* Total Threads */}
            <div className="flex flex-col gap-1 rounded-xl p-5 border border-slate-200 dark:border-[#323b67] bg-white dark:bg-[#151a2d] shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <p className="text-slate-500 dark:text-[#929bc9] text-sm font-semibold uppercase tracking-wider">Total Threads</p>
                <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                  <span className="material-symbols-outlined text-[20px]">forum</span>
                </div>
              </div>
              <div className="flex items-end gap-3">
                <p className="text-slate-900 dark:text-white text-3xl font-bold leading-none">{threadsResponse.count.toLocaleString()}</p>
                <div className="flex items-center text-[#0bda65] text-sm font-medium mb-1">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  <span className="ml-0.5">+12%</span>
                </div>
              </div>
            </div>

            {/* Communities */}
            <div className="flex flex-col gap-1 rounded-xl p-5 border border-slate-200 dark:border-[#323b67] bg-white dark:bg-[#151a2d] shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <p className="text-slate-500 dark:text-[#929bc9] text-sm font-semibold uppercase tracking-wider">Communities</p>
                <div className="p-1.5 rounded-md bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                  <span className="material-symbols-outlined text-[20px]">groups</span>
                </div>
              </div>
              <div className="flex items-end gap-3">
                <p className="text-slate-900 dark:text-white text-3xl font-bold leading-none">{communities.length}</p>
                <div className="flex items-center text-[#0bda65] text-sm font-medium mb-1">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  <span className="ml-0.5">+8%</span>
                </div>
              </div>
            </div>

            {/* Total Posts */}
            <div className="flex flex-col gap-1 rounded-xl p-5 border border-slate-200 dark:border-[#323b67] bg-white dark:bg-[#151a2d] shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <p className="text-slate-500 dark:text-[#929bc9] text-sm font-semibold uppercase tracking-wider">Total Posts</p>
                <div className="p-1.5 rounded-md bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                  <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                </div>
              </div>
              <div className="flex items-end gap-3">
                <p className="text-slate-900 dark:text-white text-3xl font-bold leading-none">
                  {threads.reduce((sum, t) => sum + (t.reply_count || 0), 0).toLocaleString()}
                </p>
                <div className="flex items-center text-[#0bda65] text-sm font-medium mb-1">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  <span className="ml-0.5">+15%</span>
                </div>
              </div>
            </div>

            {/* Total Views */}
            <div className="flex flex-col gap-1 rounded-xl p-5 border border-slate-200 dark:border-[#323b67] bg-white dark:bg-[#151a2d] shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <p className="text-slate-500 dark:text-[#929bc9] text-sm font-semibold uppercase tracking-wider">Total Views</p>
                <div className="p-1.5 rounded-md bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                  <span className="material-symbols-outlined text-[20px]">visibility</span>
                </div>
              </div>
              <div className="flex items-end gap-3">
                <p className="text-slate-900 dark:text-white text-3xl font-bold leading-none">
                  {threads.reduce((sum, t) => sum + (t.view_count || 0), 0).toLocaleString()}
                </p>
                <div className="flex items-center text-[#0bda65] text-sm font-medium mb-1">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  <span className="ml-0.5">+22%</span>
                </div>
              </div>
            </div>
          </section>

          {/* ThreadSense AI Dashboard */}
          <section className="w-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <span className="material-symbols-outlined text-[28px] text-purple-600">psychology</span>
                  ThreadSense AI
                </h3>
                <p className="text-slate-500 dark:text-[#929bc9] text-sm">Intelligent community insights powered by AI</p>
              </div>
              <Link href="/threadsense">
                <Button variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                  <span className="material-symbols-outlined text-[18px] mr-2">auto_awesome</span>
                  View Full Analysis
                </Button>
              </Link>
            </div>
            <ThreadSenseDashboard threads={threads} />
          </section>

          {/* Recent Discussions */}
          <section className="w-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Recent Discussions</h3>
                <p className="text-slate-500 dark:text-[#929bc9] text-sm">Latest conversations in the community</p>
              </div>
              <CreateThreadDialog>
                <button className="flex items-center justify-center rounded-lg h-10 px-5 bg-[#1337ec] hover:bg-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-900/30 transition-all transform active:scale-95 whitespace-nowrap">
                  <span className="material-symbols-outlined text-[18px] mr-2">add</span>
                  New Discussion
                </button>
              </CreateThreadDialog>
            </div>

            <div className="space-y-4">
              {threads.map((thread) => (
                <div key={thread.id} className="rounded-xl border border-slate-200 dark:border-[#323b67] bg-white dark:bg-[#151a2d] shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-[#1337ec]/10 flex items-center justify-center">
                          <span className="text-[#1337ec] font-bold text-sm">
                            {thread.user?.username?.slice(0, 2).toUpperCase() || 'U'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Link 
                            href={`/forum/thread/${thread.id}`}
                            className="font-bold text-lg text-slate-900 dark:text-white hover:text-[#1337ec] transition-colors"
                          >
                            {thread.title}
                          </Link>
                          {thread.pinned && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400">
                              <span className="material-symbols-outlined text-[12px] mr-1">push_pin</span>
                              Pinned
                            </span>
                          )}
                          {thread.locked && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400">
                              <span className="material-symbols-outlined text-[12px] mr-1">lock</span>
                              Locked
                            </span>
                          )}
                        </div>
                        
                        <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-2 leading-relaxed">
                          {thread.body?.substring(0, 200)}...
                        </p>
                        
                        <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-[#929bc9]">
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">person</span>
                            <span>{thread.user?.username || 'Anonymous'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">schedule</span>
                            <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                            <span>{thread.reply_count || 0} replies</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                            <span>{thread.view_count || 0} views</span>
                          </div>
                          {/* ThreadSense AI Indicators */}
                          <TLDRSuggestion thread={thread} />
                        </div>
                        
                        {thread.tags && thread.tags.length > 0 && (
                          <div className="flex items-center gap-2 mt-3">
                            {thread.tags.slice(0, 3).map((tag) => (
                              <span key={tag.id} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-[#232948] dark:text-slate-300">
                                {tag.name}
                              </span>
                            ))}
                            {thread.tags.length > 3 && (
                              <span className="text-xs text-slate-500 dark:text-[#929bc9]">
                                +{thread.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {threads.length === 0 && (
              <div className="rounded-xl border border-slate-200 dark:border-[#323b67] bg-white dark:bg-[#151a2d] shadow-sm">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-[#232948] flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-[32px] text-slate-400 dark:text-[#929bc9]">forum</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No discussions yet</h3>
                  <p className="text-slate-500 dark:text-[#929bc9] mb-6 max-w-md">Be the first to start a conversation in the community!</p>
                  <CreateThreadDialog>
                    <button className="flex items-center justify-center rounded-lg h-10 px-5 bg-[#1337ec] hover:bg-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-900/30 transition-all">
                      <span className="material-symbols-outlined text-[18px] mr-2">add</span>
                      Create First Discussion
                    </button>
                  </CreateThreadDialog>
                </div>
              </div>
            )}

            {threadsResponse.nextCursor && (
              <div className="flex justify-center mt-8">
                <button className="flex items-center justify-center rounded-lg h-10 px-6 border border-slate-200 dark:border-[#323b67] bg-white dark:bg-[#151a2d] text-slate-900 dark:text-white text-sm font-medium hover:bg-slate-50 dark:hover:bg-[#1e2439] transition-colors">
                  <span className="material-symbols-outlined text-[18px] mr-2">expand_more</span>
                  Load More Discussions
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  )
}