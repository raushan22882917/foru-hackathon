"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SmartReplyAssistant } from "@/components/smart-reply-assistant"
import { createPostAction } from "@/app/actions/post-actions"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

interface CreatePostFormProps {
  threadId: string
  threadTitle?: string
  threadContent?: string
  recentPosts?: any[]
  className?: string
}

export function CreatePostForm({ 
  threadId, 
  threadTitle = "",
  threadContent = "",
  recentPosts = [],
  className 
}: CreatePostFormProps) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [selectedTab, setSelectedTab] = useState("write")
  const router = useRouter()
  const { token, isAuthenticated } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!content.trim()) {
      setError("Please enter your reply")
      return
    }

    if (content.trim().length < 5) {
      setError("Reply must be at least 5 characters long")
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createPostAction({
        threadId,
        content: content.trim(),
        authToken: token || undefined // Pass token if available, otherwise undefined
      })

      if (result.success) {
        setContent("")
        setShowAIAssistant(false)
        setSelectedTab("write")
        router.refresh() // Refresh to show new post
      } else {
        setError(result.error || "Failed to post reply. Please try again.")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error("Post creation error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAIReplySelect = (reply: string) => {
    setContent(reply)
    setSelectedTab("write")
  }

  const handleAIReplyImprove = (improvedReply: string) => {
    setContent(improvedReply)
    setSelectedTab("write")
  }

  const toggleAIAssistant = () => {
    setShowAIAssistant(!showAIAssistant)
    if (!showAIAssistant) {
      setSelectedTab("ai-assist")
    }
  }

  return (
    <div className={className}>
      {!isAuthenticated ? (
        <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
          <span className="material-symbols-outlined text-[16px]">info</span>
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            Please log in to post replies and participate in discussions.
          </AlertDescription>
        </Alert>
      ) : (
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="write" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px]">edit</span>
            Write Reply
          </TabsTrigger>
          <TabsTrigger value="ai-assist" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px]">psychology</span>
            AI Assistant
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200 text-xs ml-1">
              Smart
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="write" className="space-y-6 mt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="content" className="text-base font-semibold">
                  Your Reply
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={toggleAIAssistant}
                    className="text-purple-600 border-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    <span className="material-symbols-outlined text-[16px] mr-2">psychology</span>
                    AI Help
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    {content.length}/5000
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <Textarea
                  id="content"
                  placeholder="Share your thoughts, ask questions, or provide helpful information..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[150px] text-base p-4 border-2 border-slate-200 dark:border-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm transition-all duration-200 resize-none"
                  maxLength={5000}
                  disabled={isSubmitting}
                />
                
                {/* Character count indicator */}
                <div className="absolute right-3 bottom-3 text-xs text-muted-foreground bg-white/80 dark:bg-slate-700/80 px-2 py-1 rounded">
                  {content.length < 5 && content.length > 0 && (
                    <span className="text-red-500">Min 5 chars</span>
                  )}
                  {content.length >= 5 && (
                    <span className="text-green-600">✓</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick AI Suggestions */}
            {content.length === 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[18px] text-purple-600">lightbulb</span>
                  <span className="font-semibold text-purple-900 dark:text-purple-100 text-sm">Quick Start Ideas</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setContent("Thanks for sharing this! I have a similar experience...")}
                    className="text-left p-2 text-sm bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 rounded border border-purple-200/50 dark:border-purple-700/50 transition-colors"
                  >
                    Share similar experience
                  </button>
                  <button
                    type="button"
                    onClick={() => setContent("Great question! Here's what I think...")}
                    className="text-left p-2 text-sm bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 rounded border border-purple-200/50 dark:border-purple-700/50 transition-colors"
                  >
                    Answer the question
                  </button>
                  <button
                    type="button"
                    onClick={() => setContent("I'd like to add to this discussion...")}
                    className="text-left p-2 text-sm bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 rounded border border-purple-200/50 dark:border-purple-700/50 transition-colors"
                  >
                    Add to discussion
                  </button>
                  <button
                    type="button"
                    onClick={() => setContent("Could you clarify what you mean by...")}
                    className="text-left p-2 text-sm bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 rounded border border-purple-200/50 dark:border-purple-700/50 transition-colors"
                  >
                    Ask for clarification
                  </button>
                </div>
              </div>
            )}

            {/* Writing Tips */}
            {content.length > 0 && content.length < 50 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] text-blue-600 mt-0.5">tips_and_updates</span>
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">Writing Tip:</p>
                    <p>Consider adding more detail to make your reply more helpful to the community.</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <AlertDescription className="text-red-700 dark:text-red-300">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                  <span>AI assistance available</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">spellcheck</span>
                  <span>Auto-formatting</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setContent("")}
                  disabled={isSubmitting || !content.trim()}
                >
                  Clear
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !content.trim() || content.trim().length < 5}
                  className="gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                      Posting...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      Post Reply
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="ai-assist" className="mt-6">
          <SmartReplyAssistant
            threadContent={threadContent}
            threadTitle={threadTitle}
            recentPosts={recentPosts}
            onReplySelect={handleAIReplySelect}
            onReplyImprove={handleAIReplyImprove}
          />
        </TabsContent>
      </Tabs>
      )}
    </div>
  )
}