import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Eye, Pin, Lock, Users, TrendingUp } from "lucide-react"
import Link from "next/link"
import { getCommunities, getCommunityThreads } from "@/lib/foru-api"
import { CreateThreadDialog } from "@/components/create-thread-dialog"

export default async function CommunityThreadsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const communities = await getCommunities()
  const community = communities.find((c) => c.id === id)

  if (!community) {
    redirect("/communities")
  }

  const threads = await getCommunityThreads(id)

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

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-8">
        <div className="relative z-10">
          <div className="mb-3 flex items-center gap-2 text-sm">
            <Link href="/communities" className="text-muted-foreground transition-colors hover:text-primary">
              Communities
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium text-foreground">{community.name}</span>
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight">{community.name}</h1>
          <p className="mt-2 text-pretty text-lg text-muted-foreground">{community.description}</p>
        </div>
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-l-4 border-l-primary bg-gradient-to-br from-primary/5 to-transparent transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <div className="rounded-full bg-primary/10 p-2">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{community.member_count.toLocaleString()}</div>
            <p className="mt-1 text-xs text-muted-foreground">Active community members</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent bg-gradient-to-br from-accent/5 to-transparent transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threads</CardTitle>
            <div className="rounded-full bg-accent/10 p-2">
              <MessageSquare className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{community.thread_count.toLocaleString()}</div>
            <p className="mt-1 text-xs text-muted-foreground">Total discussions</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-3 bg-gradient-to-br from-chart-3/5 to-transparent transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts</CardTitle>
            <div className="rounded-full bg-chart-3/10 p-2">
              <TrendingUp className="h-4 w-4 text-chart-3" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{community.post_count.toLocaleString()}</div>
            <p className="mt-1 text-xs text-muted-foreground">Community responses</p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden transition-all hover:shadow-md">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Discussions</CardTitle>
              <CardDescription>Recent threads in this community</CardDescription>
            </div>
            <CreateThreadDialog communityId={id}>
              <Button className="bg-primary hover:bg-primary/90">
                <MessageSquare className="mr-2 h-4 w-4" />
                New Thread
              </Button>
            </CreateThreadDialog>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {threads.map((thread) => (
              <Link
                key={thread.id}
                href={`/communities/${id}/threads/${thread.id}`}
                className="flex items-start gap-4 p-5 transition-all hover:bg-primary/5"
              >
                <Avatar className="h-12 w-12 ring-2 ring-background">
                  <AvatarImage src={thread.author.avatar_url || "/placeholder.svg"} alt={thread.author.username} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {thread.author.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold leading-none hover:text-primary transition-colors">
                      {thread.title}
                    </h3>
                    {thread.is_pinned && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        <Pin className="mr-1 h-3 w-3" />
                        Pinned
                      </Badge>
                    )}
                    {thread.is_locked && (
                      <Badge variant="outline" className="border-muted-foreground/30">
                        <Lock className="mr-1 h-3 w-3" />
                        Locked
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    by <span className="font-medium text-foreground">{thread.author.username}</span> •{" "}
                    {formatTimeAgo(thread.created_at)}
                  </p>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4" />
                      <span className="font-medium">{thread.reply_count}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Eye className="h-4 w-4" />
                      <span className="font-medium">{thread.view_count}</span>
                    </div>
                    <span className="ml-auto text-xs">Last active {formatTimeAgo(thread.last_activity)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {threads.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <MessageSquare className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">No threads yet</h3>
              <p className="mb-6 text-sm text-muted-foreground max-w-sm">
                Be the first to start a discussion in this community
              </p>
              <CreateThreadDialog communityId={id}>
                <Button className="bg-primary">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Create First Thread
                </Button>
              </CreateThreadDialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
