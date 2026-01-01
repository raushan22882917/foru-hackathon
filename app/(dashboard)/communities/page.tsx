import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getThreads } from "@/lib/foru-api"
import { generateThreadSummary } from "@/lib/gemini-ai"
import { CreateThreadDialog } from "@/components/create-thread-dialog"

import { cn } from "@/lib/utils"

export default async function CommunitiesPage() {
  const { threads = [], count } = await getThreads(50)

  const threadsWithAI = await Promise.all(
    threads.slice(0, 10).map(async (thread) => {
      try {
        const hasAI = Math.random() > 0.5 // 50% chance for demo
        const summary = hasAI ? await generateThreadSummary(thread.body || thread.title) : null
        return { ...thread, aiSummary: summary }
      } catch {
        return { ...thread, aiSummary: null }
      }
    }),
  )

  const allTags = Array.from(new Set(threads.flatMap((t) => t.tags.map((tag) => tag.name))))

  return (
    <div className="max-w-[1000px] mx-auto p-4 md:p-8 flex flex-col gap-6 pb-20">
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Community Discussions</h1>

        {/* Hero Search */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-xl opacity-20 blur transition duration-200 group-hover:opacity-40"></div>
          <div className="relative flex items-center bg-card rounded-xl shadow-lg ring-1 ring-border">
            <div className="pl-4 text-primary">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              className="w-full bg-transparent border-none focus:ring-0 text-foreground placeholder:text-muted-foreground h-14 px-4 text-base md:text-lg focus-visible:outline-none"
              placeholder="Search discussions with AI..."
              type="text"
            />
            <div className="pr-2 hidden sm:block">
              <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground bg-muted rounded border border-border">
                ⌘ K
              </kbd>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium transition-transform active:scale-95 shadow-sm">
            All
          </button>
          {allTags.slice(0, 6).map((tag) => (
            <button
              key={tag}
              className="px-4 py-2 rounded-full bg-card border border-border text-muted-foreground hover:bg-accent hover:text-foreground text-sm font-medium transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <select className="bg-transparent border-none text-sm font-bold text-foreground focus:ring-0 p-0 pr-8 cursor-pointer">
            <option>Newest First</option>
            <option>Most Active</option>
            <option>Top Rated</option>
          </select>
        </div>
        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
          <button className="p-1.5 rounded bg-card text-primary shadow-sm">
            <span className="material-symbols-outlined text-[20px] block">view_list</span>
          </button>
          <button className="p-1.5 rounded hover:bg-card text-muted-foreground transition-colors">
            <span className="material-symbols-outlined text-[20px] block">grid_view</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {threadsWithAI.map((thread, idx) => {
          const isPinned = thread.pinned || idx === 0
          const replyCount = thread.replyCount || Math.floor(Math.random() * 100)
          const votes = Math.floor(Math.random() * 300)

          return (
            <article
              key={thread.id}
              className={cn(
                "flex flex-col sm:flex-row gap-4 p-5 rounded-xl transition-shadow",
                isPinned
                  ? "bg-card border-l-4 border-l-primary shadow-sm hover:shadow-md border-y border-r border-border"
                  : "bg-card border border-border shadow-sm hover:border-primary/50",
              )}
            >
              <div className="flex flex-col items-center gap-1 min-w-[50px] text-muted-foreground">
                <button className="hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">expand_less</span>
                </button>
                <span className="text-sm font-bold text-foreground">{votes}</span>
                <button className="hover:text-red-500 transition-colors">
                  <span className="material-symbols-outlined">expand_more</span>
                </button>
              </div>

              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {isPinned && (
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">PINNED</Badge>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {thread.user?.avatar && (
                      <div
                        className="size-5 rounded-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${thread.user.avatar})` }}
                      />
                    )}
                    <span>
                      Posted by{" "}
                      <Link href="#" className="hover:text-primary font-medium text-foreground">
                        @{thread.user?.username || "Anonymous"}
                      </Link>{" "}
                      • {new Date(thread.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {thread.aiSummary && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                      <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                      <span className="text-[10px] font-bold uppercase tracking-wide">AI Summary</span>
                    </div>
                  )}
                </div>

                <Link href={`/communities/thread/${thread.id}`}>
                  <h3 className="text-lg font-bold text-foreground leading-tight hover:text-primary cursor-pointer transition-colors">
                    {thread.title}
                  </h3>
                </Link>

                <p className="text-muted-foreground text-sm line-clamp-2">
                  {thread.aiSummary || thread.body || "No description available"}
                </p>

                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {thread.tags.slice(0, 3).map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="text-xs font-medium bg-muted hover:bg-accent cursor-pointer"
                    >
                      #{tag.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 sm:gap-2 min-w-[100px] border-t sm:border-t-0 sm:border-l border-border pt-3 sm:pt-0 sm:pl-4 mt-2 sm:mt-0">
                <div className="flex -space-x-2">
                  <div className="size-6 rounded-full ring-2 ring-background bg-gradient-to-br from-blue-500 to-purple-500" />
                  <div className="size-6 rounded-full ring-2 ring-background bg-gradient-to-br from-green-500 to-teal-500" />
                  <div className="size-6 rounded-full ring-2 ring-background bg-muted flex items-center justify-center text-[10px] text-muted-foreground font-bold">
                    +{Math.floor(Math.random() * 50)}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                  <span>{replyCount}</span>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {threads.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <span className="material-symbols-outlined text-[48px] text-muted-foreground">forum</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">No threads found</h3>
          <p className="text-muted-foreground mb-6">Start a new discussion to get your community going</p>
          <CreateThreadDialog>
            <Button className="gap-2">
              <span className="material-symbols-outlined text-[20px]">add</span>
              Create Thread
            </Button>
          </CreateThreadDialog>
        </div>
      )}

      {threads.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" size="lg" className="gap-2 bg-transparent">
            Load More Threads
            <span className="material-symbols-outlined text-[20px]">expand_more</span>
          </Button>
        </div>
      )}
    </div>
  )
}
