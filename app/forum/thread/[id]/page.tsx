import { getThreadById, getThreadPosts } from "@/lib/foru-api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreatePostForm } from "@/components/create-post-form"
import { PostInteractions } from "@/components/post-interactions"
import { TLDRBot } from "@/components/tldr-bot"
import { SentimentMeter } from "@/components/sentiment-meter"
import { SmartSuggestions, CompactSuggestions } from "@/components/smart-suggestions"
import { AIModerator } from "@/components/ai-moderator"
import Link from "next/link"
import { notFound } from "next/navigation"

interface ThreadPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { id } = await params
  
  // Validate thread ID before making API calls
  if (!id || id === 'undefined' || id === 'null') {
    console.error("[Forum Thread Page] Invalid thread ID:", id)
    notFound()
  }

  const thread = await getThreadById(id)
  
  if (!thread) {
    notFound()
  }

  const posts = await getThreadPosts(id)

  return (
    <DashboardLayout>
      <div className="w-full">
        {/* Thread Header */}
        <header className="w-full px-6 py-6 md:px-10 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/20 border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-4xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
              <Link href="/forum" className="hover:text-slate-700 dark:hover:text-slate-200">Forum</Link>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span className="text-slate-700 dark:text-slate-300">Thread</span>
            </nav>

            {/* Thread Title and Meta */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 leading-tight">
                    {thread.title}
                  </h1>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-xs">
                          {thread.user?.username?.slice(0, 2).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="font-medium">{thread.user?.username || 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                      <span>{posts.length} replies</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      <span>{thread.view_count || 0} views</span>
                    </div>
                  </div>
                </div>

                {/* Thread Status Badges */}
                <div className="flex gap-2 ml-4">
                  {thread.pinned && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      <span className="material-symbols-outlined text-[12px] mr-1">push_pin</span>
                      Pinned
                    </Badge>
                  )}
                  {thread.locked && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      <span className="material-symbols-outlined text-[12px] mr-1">lock</span>
                      Locked
                    </Badge>
                  )}
                </div>
              </div>

              {/* Tags */}
              {thread.tags && thread.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {thread.tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 px-6 md:px-10 py-8">
            {/* Main Thread Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* ThreadSense AI Features Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TLDRBot thread={thread} posts={posts} autoGenerate={posts.length >= 3} />
                <SentimentMeter thread={thread} posts={posts} autoAnalyze={true} showDetails={false} />
              </div>

              {/* Original Thread Post */}
              <Card className="shadow-sm">
                <CardContent className="p-8">
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="text-lg leading-relaxed whitespace-pre-wrap">
                      {thread.body}
                    </p>
                  </div>
                  
                  {/* Thread Actions */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <PostInteractions 
                      postId={thread.id} 
                      initialLikes={0} 
                      initialDislikes={0}
                    />
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <span className="material-symbols-outlined text-[16px] mr-2">share</span>
                        Share
                      </Button>
                      <Button variant="outline" size="sm">
                        <span className="material-symbols-outlined text-[16px] mr-2">bookmark</span>
                        Save
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Moderator for Thread Content */}
              <AIModerator 
                content={`${thread.title} ${thread.body}`}
                author={thread.user?.username || 'Anonymous'}
                contentType="thread"
                autoAnalyze={false}
              />

              {/* Replies Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Replies ({posts.length})
                  </h2>
                  <Button variant="outline" size="sm">
                    <span className="material-symbols-outlined text-[16px] mr-2">sort</span>
                    Sort by Latest
                  </Button>
                </div>

                {/* Reply Posts */}
                {posts.map((post, index) => (
                  <Card key={post.id} className="shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <span className="text-slate-600 dark:text-slate-400 font-semibold text-sm">
                              {post.user?.username?.slice(0, 2).toUpperCase() || 'U'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {post.user?.username || 'Anonymous'}
                            </span>
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              #{index + 1}
                            </Badge>
                          </div>
                          
                          <div className="prose prose-slate dark:prose-invert max-w-none mb-4">
                            <p className="leading-relaxed whitespace-pre-wrap">
                              {post.content}
                            </p>
                          </div>
                          
                          <PostInteractions 
                            postId={post.id} 
                            initialLikes={post.upvotes || 0} 
                            initialDislikes={0}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {posts.length === 0 && (
                  <Card className="shadow-sm">
                    <CardContent className="p-12 text-center">
                      <span className="material-symbols-outlined text-[48px] text-slate-400 mb-4 block">chat_bubble</span>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No replies yet</h3>
                      <p className="text-slate-500 dark:text-slate-400 mb-6">Be the first to join the conversation!</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Reply Form */}
              {!thread.locked && (
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px]">reply</span>
                      Add Your Reply
                    </CardTitle>
                    <CardDescription>
                      Join the discussion and share your thoughts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CreatePostForm 
                      threadId={id}
                      threadTitle={thread.title}
                      threadContent={thread.body}
                      recentPosts={posts}
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Smart Suggestions */}
              <SmartSuggestions threadId={id} thread={thread} maxSuggestions={3} />

              {/* Thread Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">analytics</span>
                    Thread Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-sm font-medium">
                      {new Date(thread.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Activity</span>
                    <span className="text-sm font-medium">
                      {new Date(thread.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Replies</span>
                    <span className="text-sm font-medium">{posts.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Views</span>
                    <span className="text-sm font-medium">{thread.view_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Participants</span>
                    <span className="text-sm font-medium">
                      {new Set([thread.user?.id, ...posts.map(p => p.user?.id)].filter(Boolean)).size}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Related Discussions */}
              <CompactSuggestions threadId={id} limit={5} />

              {/* ThreadSense AI Link */}
              <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700">
                <CardContent className="p-6 text-center">
                  <span className="material-symbols-outlined text-[32px] text-purple-600 mb-3 block">psychology</span>
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">ThreadSense AI</h3>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
                    Get deeper insights about this thread and community health
                  </p>
                  <Link href="/threadsense">
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                      <span className="material-symbols-outlined text-[16px] mr-2">auto_awesome</span>
                      View AI Analysis
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}