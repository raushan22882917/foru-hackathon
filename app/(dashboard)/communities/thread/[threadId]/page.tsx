import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThumbsUp, MessageSquare, Sparkles, Pin, Lock, Eye, BarChart3 } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getThreadById, getThreadPosts } from "@/lib/foru-api"
import { CreatePostForm } from "@/components/create-post-form"
import { AIInsightsSection } from "@/components/ai-insights-section"

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>
}) {
  const { threadId } = await params

  // Validate threadId before making API calls
  if (!threadId || threadId === 'undefined' || threadId === 'null') {
    console.error("[Communities Thread Page] Invalid thread ID:", threadId)
    redirect("/communities")
  }

  const [thread, posts] = await Promise.all([getThreadById(threadId), getThreadPosts(threadId)])

  if (!thread) {
    redirect("/communities")
  }

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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/communities" className="hover:text-foreground">
          Communities
        </Link>
        <span>/</span>
        <span className="text-foreground">Thread</span>
      </div>

      {/* Thread Header */}
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold leading-tight">{thread.title}</h1>
              {thread.pinned && <Pin className="h-5 w-5 text-orange-500" />}
              {thread.locked && <Lock className="h-5 w-5 text-muted-foreground" />}
            </div>
            
            {/* Tags */}
            {thread.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {thread.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="text-xs">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>Asked by <span className="font-medium text-foreground">{thread.user.username}</span></span>
              <span>•</span>
              <span>{formatTimeAgo(thread.createdAt)}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{thread.viewCount || 0} views</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{posts.length} answers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights - Collapsible */}
      <AIInsightsSection thread={thread} posts={posts} />

      {/* Question/Original Post */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-2">
              <Button variant="ghost" size="sm" className="p-2">
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">{thread.upvotes?.length || 0}</span>
              <Button variant="ghost" size="sm" className="p-2">
                <ThumbsUp className="h-4 w-4 rotate-180" />
              </Button>
            </div>
            
            <div className="flex-1">
              <div className="prose prose-sm max-w-none">
                <p className="text-base leading-relaxed whitespace-pre-wrap">{thread.body}</p>
              </div>
              
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    Share
                  </Button>
                  <Button variant="ghost" size="sm">
                    Follow
                  </Button>
                </div>
                
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={thread.user.avatar || "/placeholder.svg"} alt={thread.user.username} />
                    <AvatarFallback className="text-xs">{thread.user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <div className="font-medium">{thread.user.username}</div>
                    <div className="text-muted-foreground">{formatTimeAgo(thread.createdAt)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answers Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{posts.length} Answer{posts.length !== 1 ? 's' : ''}</h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Sort by votes
            </Button>
          </div>
        </div>

        {posts.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No answers yet. Be the first to help!</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post, index) => (
            <Card key={post.id} className={post.isSolution ? "border-green-200 bg-green-50/50" : ""}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <Button variant="ghost" size="sm" className="p-2">
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">{post.upvotes?.length || 0}</span>
                    <Button variant="ghost" size="sm" className="p-2">
                      <ThumbsUp className="h-4 w-4 rotate-180" />
                    </Button>
                    {post.isSolution && (
                      <div className="mt-2">
                        <Badge className="bg-green-600 text-white text-xs">
                          <Sparkles className="mr-1 h-3 w-3" />
                          Accepted
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-base leading-relaxed whitespace-pre-wrap">{post.content}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          Share
                        </Button>
                        <Button variant="ghost" size="sm">
                          Follow
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={post.user.avatar || "/placeholder.svg"} alt={post.user.username} />
                          <AvatarFallback className="text-xs">{post.user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                          <div className="font-medium">{post.user.username}</div>
                          <div className="text-muted-foreground">{formatTimeAgo(post.createdAt)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Answer Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Answer</CardTitle>
          <CardDescription>
            Help the community by sharing your knowledge and experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreatePostForm 
            threadId={threadId}
            threadTitle={thread.title}
            threadContent={thread.body}
            recentPosts={posts}
          />
        </CardContent>
      </Card>
    </div>
  )
}
