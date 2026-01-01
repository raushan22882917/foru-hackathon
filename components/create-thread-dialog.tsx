"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { createThreadAction } from "@/app/actions/thread-actions"
import { improveThreadContent, generateThreadSuggestions } from "@/lib/gemini-ai"

interface CreateThreadDialogProps {
  children: React.ReactNode
  communityId?: string
}

export function CreateThreadDialog({ children, communityId }: CreateThreadDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [aiSuggestions, setAiSuggestions] = useState<{ title: string; body: string }[]>([])
  const [isImproving, setIsImproving] = useState(false)
  const [improvementSuggestions, setImprovementSuggestions] = useState<string[]>([])
  const [showAiHelp, setShowAiHelp] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!title.trim()) {
      setError("Please enter a title for your thread")
      return
    }

    if (title.trim().length < 3) {
      setError("Title must be at least 3 characters long")
      return
    }

    if (!body.trim()) {
      setError("Please enter content for your thread")
      return
    }

    if (body.trim().length < 10) {
      setError("Content must be at least 10 characters long")
      return
    }

    if (body.trim().length > 50000) {
      setError("Content must not exceed 50,000 characters")
      return
    }

    setIsLoading(true)

    try {
      const result = await createThreadAction({
        title: title.trim(),
        body: body.trim(),
        tags: [],
        communityId,
      })

      if (result.success && result.threadId) {
        setTitle("")
        setBody("")
        setAiSuggestions([])
        setImprovementSuggestions([])
        setOpen(false)

        // Refresh the page data and navigate to the new thread
        router.refresh()
        router.push(`/forum/thread/${result.threadId}`)
      } else {
        setError(result.error || "Failed to create thread. Please try again.")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error("Thread creation error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImproveContent = async (improvementType: "professional" | "clarity" | "engagement" | "grammar") => {
    if (!title.trim() && !body.trim()) {
      setError("Please enter some content to improve")
      return
    }

    setIsImproving(true)
    setError("")

    try {
      const result = await improveThreadContent(
        title || "Untitled Thread",
        body || "Please add some content to improve.",
        improvementType
      )

      if (result.improvedTitle !== title) {
        setTitle(result.improvedTitle)
      }
      if (result.improvedBody !== body) {
        setBody(result.improvedBody)
      }
      setImprovementSuggestions(result.suggestions)
    } catch (error) {
      console.error("Content improvement error:", error)
      setError("AI improvement temporarily unavailable. Please try again later.")
    } finally {
      setIsImproving(false)
    }
  }

  const handleGenerateSuggestions = async (topic: string, threadType: "question" | "discussion" | "announcement" | "help") => {
    if (!topic.trim()) {
      setError("Please enter a topic to generate suggestions")
      return
    }

    setIsImproving(true)
    setError("")

    try {
      const suggestions = await generateThreadSuggestions(topic, threadType)
      setAiSuggestions(suggestions)
      setShowAiHelp(true)
    } catch (error) {
      console.error("Suggestion generation error:", error)
      setError("AI suggestions temporarily unavailable. Please try again later.")
    } finally {
      setIsImproving(false)
    }
  }

  const applySuggestion = (suggestion: { title: string; body: string }) => {
    setTitle(suggestion.title)
    setBody(suggestion.body)
    setAiSuggestions([])
    setShowAiHelp(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent 
        side="right" 
        className="w-[95vw] max-w-[1400px] h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-0 shadow-2xl p-0"
      >
        <div className="h-full flex flex-col">
          <SheetHeader className="relative overflow-hidden border-b border-slate-200/50 dark:border-slate-700/50">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-blue-500/5 to-purple-500/5 dark:from-primary/10 dark:via-blue-500/10 dark:to-purple-500/10"></div>
            <div className="absolute inset-0 opacity-20 dark:opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.3) 1px, transparent 0)`,
                backgroundSize: '24px 24px'
              }}></div>
            </div>
            
            <div className="relative z-10 p-8">
              <SheetTitle className="flex items-center gap-4 text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-500 rounded-full blur-sm opacity-20"></div>
                  <span className="material-symbols-outlined text-primary text-5xl relative z-10">edit_note</span>
                </div>
                Create New Thread
                <Badge variant="secondary" className="ml-4 bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20 text-primary font-semibold text-sm px-3 py-1">
                  <span className="material-symbols-outlined text-[16px] mr-2">auto_awesome</span>
                  AI Powered
                </Badge>
              </SheetTitle>
              <SheetDescription className="text-xl text-slate-600 dark:text-slate-300 mt-3">
                Start a new discussion in the community forum. Use AI assistance to write better, more engaging content.
              </SheetDescription>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="grid gap-8 lg:grid-cols-5 p-8 h-full">
              {/* Main Form */}
              <div className="lg:col-span-3">
                <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg p-8 h-full">
                  <form onSubmit={handleSubmit} className="space-y-8 h-full flex flex-col">
                    <div className="space-y-4">
                      <Label htmlFor="title" className="text-base font-semibold flex items-center gap-3">
                        <span className="material-symbols-outlined text-[20px] text-primary">title</span>
                        Title <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="title"
                          placeholder="What's your question or topic?"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="text-lg pl-5 pr-20 py-4 border-2 border-slate-200 dark:border-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm transition-all duration-200"
                          maxLength={200}
                          disabled={isLoading}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground bg-slate-100 dark:bg-slate-600 px-3 py-1 rounded-lg">
                          {title.length}/200
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 flex-1">
                      <Label htmlFor="body" className="text-base font-semibold flex items-center gap-3">
                        <span className="material-symbols-outlined text-[20px] text-primary">description</span>
                        Content <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative h-full">
                        <Textarea
                          id="body"
                          placeholder="Provide details, context, or your question..."
                          value={body}
                          onChange={(e) => setBody(e.target.value)}
                          className="min-h-[300px] h-full text-lg p-5 border-2 border-slate-200 dark:border-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm transition-all duration-200 resize-none"
                          maxLength={50000}
                          disabled={isLoading}
                        />
                        <div className="absolute right-4 bottom-4 text-sm text-muted-foreground bg-slate-100 dark:bg-slate-600 px-3 py-1 rounded-lg">
                          {body.length}/50,000 {body.length < 10 && body.length > 0 && `(min 10)`}
                        </div>
                      </div>
                    </div>

                    {/* AI Improvement Buttons */}
                    <div className="space-y-5">
                      <Label className="text-base font-semibold flex items-center gap-3">
                        <span className="material-symbols-outlined text-[20px] text-primary">auto_awesome</span>
                        AI Content Enhancement
                      </Label>
                      <div className="grid grid-cols-2 gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          onClick={() => handleImproveContent("professional")}
                          disabled={isImproving || isLoading}
                          className="text-base h-14 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30 transition-all duration-200"
                        >
                          <span className="material-symbols-outlined text-[20px] mr-3">business_center</span>
                          {isImproving ? "Enhancing..." : "Professional"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          onClick={() => handleImproveContent("clarity")}
                          disabled={isImproving || isLoading}
                          className="text-base h-14 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-800/30 dark:hover:to-emerald-800/30 transition-all duration-200"
                        >
                          <span className="material-symbols-outlined text-[20px] mr-3">visibility</span>
                          Clarity
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          onClick={() => handleImproveContent("engagement")}
                          disabled={isImproving || isLoading}
                          className="text-base h-14 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-800/30 dark:hover:to-pink-800/30 transition-all duration-200"
                        >
                          <span className="material-symbols-outlined text-[20px] mr-3">favorite</span>
                          Engagement
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          onClick={() => handleImproveContent("grammar")}
                          disabled={isImproving || isLoading}
                          className="text-base h-14 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-700 hover:from-orange-100 hover:to-red-100 dark:hover:from-orange-800/30 dark:hover:to-red-800/30 transition-all duration-200"
                        >
                          <span className="material-symbols-outlined text-[20px] mr-3">spellcheck</span>
                          Grammar
                        </Button>
                      </div>
                    </div>

                    {improvementSuggestions.length > 0 && (
                      <div className="rounded-xl bg-gradient-to-r from-primary/5 via-blue-500/5 to-purple-500/5 border border-primary/20 p-5 text-base backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="material-symbols-outlined text-[22px] text-primary">lightbulb</span>
                          <span className="font-semibold text-primary text-lg">AI Improvements Applied:</span>
                        </div>
                        <ul className="space-y-2 text-muted-foreground">
                          {improvementSuggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <span className="material-symbols-outlined text-[16px] text-green-500 mt-1">check_circle</span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {error && (
                      <div className="rounded-xl bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-700 p-5 text-base text-red-700 dark:text-red-300 flex items-start gap-4">
                        <span className="material-symbols-outlined text-[24px] mt-0.5">error</span>
                        <span>{error}</span>
                      </div>
                    )}

                    <SheetFooter className="gap-4 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setOpen(false)} 
                        disabled={isLoading}
                        className="px-8 py-4 h-14 text-base"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isLoading} 
                        className="gap-3 px-8 py-4 h-14 text-base bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {isLoading ? (
                          <>
                            <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
                            Publishing...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[24px]">send</span>
                            Publish Thread
                          </>
                        )}
                      </Button>
                    </SheetFooter>
                  </form>
                </div>
              </div>

              {/* AI Assistant Sidebar */}
              <div className="lg:col-span-2 space-y-6">
                {/* AI Writing Assistant */}
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-500 rounded-full blur-sm opacity-20"></div>
                        <span className="material-symbols-outlined text-[32px] text-primary relative z-10">psychology</span>
                      </div>
                      <h3 className="font-bold text-2xl bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">AI Writing Assistant</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <Label className="text-base font-medium flex items-center gap-3 mb-3">
                          <span className="material-symbols-outlined text-[18px] text-primary">auto_awesome</span>
                          Generate Ideas
                        </Label>
                        <div className="flex gap-3">
                          <Input
                            placeholder="Enter topic..."
                            className="text-base bg-white/80 dark:bg-slate-700/80 border-slate-200 dark:border-slate-600 py-3"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleGenerateSuggestions(e.currentTarget.value, 'discussion')
                              }
                            }}
                          />
                          <Button
                            size="lg"
                            variant="outline"
                            onClick={(e) => {
                              const input = e.currentTarget.previousElementSibling as HTMLInputElement
                              if (input?.value) {
                                handleGenerateSuggestions(input.value, 'discussion')
                              }
                            }}
                            disabled={isImproving}
                            className="px-4 bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20 hover:from-primary/20 hover:to-blue-500/20"
                          >
                            <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                          </Button>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 text-base border border-slate-200/50 dark:border-slate-600/50">
                        <p className="font-semibold mb-4 flex items-center gap-3">
                          <span className="material-symbols-outlined text-[20px] text-primary">tips_and_updates</span>
                          Writing Tips:
                        </p>
                        <ul className="space-y-3 text-muted-foreground">
                          <li className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-[16px] text-green-500 mt-1">check_circle</span>
                            Be specific and clear in your title
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-[16px] text-green-500 mt-1">check_circle</span>
                            Provide context and background
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-[16px] text-green-500 mt-1">check_circle</span>
                            Ask specific questions
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-[16px] text-green-500 mt-1">check_circle</span>
                            Use proper formatting
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Suggestions */}
                {aiSuggestions.length > 0 && (
                  <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-lg">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <span className="material-symbols-outlined text-[28px] text-primary">lightbulb</span>
                        <h3 className="font-bold text-2xl">AI Suggestions</h3>
                      </div>
                      <div className="space-y-4">
                        {aiSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="p-6 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-gradient-to-r hover:from-primary/5 hover:to-blue-500/5 cursor-pointer transition-all duration-200 group"
                            onClick={() => applySuggestion(suggestion)}
                          >
                            <p className="font-semibold text-base mb-3 group-hover:text-primary transition-colors">{suggestion.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-4">
                              {suggestion.body.substring(0, 200)}...
                            </p>
                            <div className="flex items-center gap-2 mt-3 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="material-symbols-outlined text-[16px]">mouse</span>
                              Click to use
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* AI Status Indicator */}
                <Card className="bg-gradient-to-br from-primary/5 to-blue-500/5 dark:from-primary/10 dark:to-blue-500/10 border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 text-base">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-muted-foreground font-medium">AI Assistant Active</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Enhanced content improvement available with intelligent fallbacks
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
