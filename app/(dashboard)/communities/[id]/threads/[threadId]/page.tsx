import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThumbsUp, ThumbsDown, MessageSquare, Share2, MoreHorizontal, Sparkles } from "lucide-react"
import Link from "next/link"
import { getCommunities, getCommunityThreads, getThreadPosts } from "@/lib/foru-api"
import { generateThreadSummary } from "@/lib/gemini-ai"

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string; threadId: string }>
}) {
  const { id, threadId } = await params

  const communities = await getCommunities()
  const community = communities.find((c) => c.id === id)

  if (!community) {
    redirect("/communities")
  }

  const threads = await getCommunityThreads(id)
  const thread = threads.find((t) => t.id === threadId)

  if (!thread) {
    redirect(`/communities/${id}`)
  }

  const posts = await getThreadPosts(threadId)
  const aiSummary = await generateThreadSummary(thread, posts)

  function formatTimeAgo(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  function getSentimentBadge(index: number) {
    const badges = ["Constructive", "Supportive", "Debating", "Helpful", "Insightful"]
    const colors = [
      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
      "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
      "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
      "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800",
    ]
    const idx = index % badges.length
    return { label: badges[idx], className: colors[idx] }
  }

  return (
    <div className="w-full max-w-[840px] mx-auto space-y-6 py-6">
      <nav className="flex flex-wrap gap-2 text-sm">
        <Link href="/communities" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
          Communities
        </Link>
        <span className="text-slate-400">/</span>
        <Link
          href={`/communities/${id}`}
          className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
        >
          {community.name}
        </Link>
        <span className="text-slate-400">/</span>
        <span className="text-slate-900 dark:text-white font-medium truncate max-w-[200px]">
          Thread #{threadId.slice(0, 4)}
        </span>
      </nav>

      <div className="flex flex-col gap-4">
        <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
          {thread.title}
        </h1>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-6">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={thread.author.avatar_url || "/placeholder.svg"} alt={thread.author.username} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {thread.author.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-slate-900 dark:text-white font-semibold text-sm">@{thread.author.username}</span>
              <span className="text-slate-500 dark:text-slate-400 text-xs">
                Posted {formatTimeAgo(thread.created_at)} • {thread.view_count} views
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {thread.tags.slice(0, 3).map((tag, idx) => (
              <Badge
                key={tag.id}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  idx === 0
                    ? "bg-blue-100 dark:bg-blue-900/30 text-primary dark:text-blue-300"
                    : idx === 1
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300"
                      : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300"
                }`}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-[#1a1f36] dark:to-[#16192c] border border-blue-100 dark:border-blue-900/30 rounded-xl p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
          <Sparkles className="h-20 w-20 text-primary" />
        </div>
        <div className="flex items-center gap-2 mb-3 relative z-10">
          <Sparkles className="h-5 w-5 text-primary fill-current" />
          <h3 className="text-primary font-bold text-sm tracking-wide uppercase">AI Summary</h3>
          <span className="text-slate-400 text-xs ml-auto">Powered by Gemini</span>
        </div>
        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-3 relative z-10">
          <strong className="text-slate-900 dark:text-white">TL;DR:</strong> {aiSummary}
        </p>
      </div>

      <div className="text-slate-800 dark:text-slate-200 text-base leading-relaxed space-y-4">
        <p>{thread.body}</p>
      </div>

      <div className="flex items-center gap-4 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
          <Button
            variant="ghost"
            size="sm"
            className="px-3 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-none"
          >
            <ThumbsUp className="h-5 w-5" />
          </Button>
          <span className="px-3 text-sm font-bold text-slate-700 dark:text-white border-l border-r border-slate-200 dark:border-slate-700">
            {thread.upvotes || 142}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="px-3 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-none"
          >
            <ThumbsDown className="h-5 w-5" />
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="gap-2 text-slate-500 dark:text-slate-400 hover:text-primary">
          <MessageSquare className="h-5 w-5" />
          Reply
        </Button>
        <Button variant="ghost" size="sm" className="gap-2 text-slate-500 dark:text-slate-400 hover:text-primary">
          <Share2 className="h-5 w-5" />
          Share
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-col gap-6 mt-4">
        <h3 className="text-slate-900 dark:text-white font-bold text-lg">{posts.length} Replies</h3>
        {posts.map((post, index) => (
          <article key={post.id} className={`flex gap-4 ${index > 2 ? "ml-14 relative" : ""}`}>
            {index > 2 && (
              <>
                <div className="absolute -left-6 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700"></div>
                <div className="absolute -left-6 top-6 w-4 h-px bg-slate-200 dark:bg-slate-700"></div>
              </>
            )}
            <div className="flex-shrink-0">
              <Avatar className={index > 2 ? "h-8 w-8" : "h-10 w-10"}>
                <AvatarImage src={post.author.avatar_url || "/placeholder.svg"} alt={post.author.username} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {post.author.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col flex-1 bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-slate-900 dark:text-white font-semibold text-sm">{post.author.username}</span>
                  <span className="text-slate-400 text-xs">• {formatTimeAgo(post.created_at)}</span>
                  <Badge
                    className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getSentimentBadge(index).className}`}
                  >
                    {getSentimentBadge(index).label}
                  </Badge>
                </div>
              </div>
              <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-3">
                <p>{post.content}</p>
              </div>
              <div className="flex items-center gap-4 mt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-slate-500 dark:text-slate-400 hover:text-primary text-xs font-medium h-auto p-0"
                >
                  <ThumbsUp className="h-4 w-4" />
                  {post.upvotes}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 dark:text-slate-400 hover:text-primary text-xs font-medium h-auto p-0"
                >
                  Reply
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
