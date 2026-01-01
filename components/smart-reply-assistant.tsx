"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { generateSmartReply, improveThreadContent } from "@/lib/gemini-ai"
import { cn } from "@/lib/utils"

interface SmartReplyAssistantProps {
  threadContent: string
  threadTitle: string
  recentPosts: any[]
  onReplySelect: (reply: string) => void
  onReplyImprove: (improvedReply: string) => void
  className?: string
}

interface SmartReplyOption {
  id: string
  content: string
  tone: "professional" | "friendly" | "helpful" | "supportive"
  type: "direct_answer" | "follow_up_question" | "supportive_comment" | "expert_insight"
  confidence: number
}

export function SmartReplyAssistant({ 
  threadContent, 
  threadTitle,
  recentPosts, 
  onReplySelect, 
  onReplyImprove,
  className 
}: SmartReplyAssistantProps) {
  const [replyOptions, setReplyOptions] = useState<SmartReplyOption[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string>("")
  const [selectedTab, setSelectedTab] = useState("suggestions")
  const [userDraft, setUserDraft] = useState("")
  const [isImproving, setIsImproving] = useState(false)
  const [responseAnalysis, setResponseAnalysis] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [improvementSuggestions, setImprovementSuggestions] = useState<string[]>([])

  useEffect(() => {
    generateReplySuggestions()
  }, [threadContent, recentPosts.length])

  const analyzeResponseRelevance = async (userResponse: string) => {
    if (!userResponse.trim()) return null

    try {
      const analysisPrompt = `
MAIN QUESTION: ${threadTitle}
ORIGINAL POST: ${threadContent}
USER RESPONSE: ${userResponse}

Analyze how well this user response addresses the main question. Return JSON with:
{
  "relevanceScore": 0.85,
  "addressesMainQuestion": true,
  "strengths": ["Clear answer", "Good examples"],
  "improvements": ["Add more detail", "Include sources"],
  "overallFeedback": "Good response that addresses the question"
}
`

      const result = await generateSmartReply(analysisPrompt, "professional")
      const jsonMatch = result.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      return null
    } catch (error) {
      console.error('Response analysis failed:', error)
      return null
    }
  }

  const analyzeUserDraft = async () => {
    if (!userDraft.trim() || isAnalyzing) return

    setIsAnalyzing(true)
    try {
      const analysis = await analyzeResponseRelevance(userDraft)
      setResponseAnalysis(analysis)
    } catch (error) {
      console.error('Draft analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateReplySuggestions = async () => {
    if (isGenerating) return

    setIsGenerating(true)
    setError("")

    try {
      const context = `
Thread Title: ${threadTitle}
Thread Content: ${threadContent}
Recent Posts: ${recentPosts.slice(-3).map(p => `${p.user?.username}: ${p.content}`).join('\n')}
      `.trim()

      const [helpfulReply, professionalReply, friendlyReply] = await Promise.all([
        generateSmartReply(context, "helpful"),
        generateSmartReply(context, "professional"), 
        generateSmartReply(context, "friendly")
      ])

      const options: SmartReplyOption[] = [
        {
          id: "helpful-1",
          content: helpfulReply,
          tone: "helpful",
          type: "direct_answer",
          confidence: 0.85
        },
        {
          id: "professional-1", 
          content: professionalReply,
          tone: "professional",
          type: "expert_insight",
          confidence: 0.80
        },
        {
          id: "friendly-1",
          content: friendlyReply,
          tone: "friendly", 
          type: "supportive_comment",
          confidence: 0.75
        }
      ]

      setReplyOptions(options.filter(opt => opt.content && opt.content.length > 20))
    } catch (err) {
      console.error('Smart reply generation failed:', err)
      setError("Unable to generate reply suggestions at this time.")
    } finally {
      setIsGenerating(false)
    }
  }

  const improveUserReply = async (improvementType: "professional" | "clarity" | "engagement" | "grammar") => {
    if (!userDraft.trim() || isImproving) return

    setIsImproving(true)
    setError("")

    try {
      const result = await improveThreadContent("Reply", userDraft, improvementType)
      onReplyImprove(result.improvedBody)
      setImprovementSuggestions(result.suggestions)
    } catch (err) {
      console.error('Reply improvement failed:', err)
      setError("Unable to improve reply at this time.")
    } finally {
      setIsImproving(false)
    }
  }

  return (
    <Card className={cn("border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-indigo-900 flex items-center gap-2">
          Smart Reply Assistant
          <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 text-xs">
            AI Powered
          </Badge>
        </CardTitle>
        <CardDescription className="text-indigo-700">
          Get AI-powered suggestions for better responses
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
            <TabsTrigger value="improve">Improve Draft</TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="space-y-4 mt-6">
            {isGenerating && (
              <div className="space-y-4">
                <div className="text-indigo-600 text-sm font-medium">
                  Generating smart reply suggestions...
                </div>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full bg-indigo-200" />
                ))}
              </div>
            )}

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            {replyOptions.length > 0 && !isGenerating && (
              <div className="space-y-4">
                {replyOptions.map((option) => (
                  <div key={option.id} className="group bg-white/70 rounded-lg p-4 border border-indigo-200/50 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {option.tone}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(option.confidence * 100)}% match
                        </Badge>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {option.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {option.content.length} characters
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onReplySelect(option.content)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Use This Reply
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="improve" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-indigo-900 mb-2 block">
                  Your Draft Reply
                </label>
                <Textarea
                  placeholder="Write your reply here, then use AI to improve it..."
                  value={userDraft}
                  onChange={(e) => setUserDraft(e.target.value)}
                  className="min-h-[120px] bg-white/80 border-indigo-200 focus:border-indigo-400"
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-muted-foreground">
                    {userDraft.length} characters
                  </div>
                  <Button
                    onClick={analyzeUserDraft}
                    disabled={!userDraft.trim() || isAnalyzing}
                    size="sm"
                    variant="outline"
                    className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze Response"}
                  </Button>
                </div>
              </div>

              {responseAnalysis && (
                <div className="bg-white/70 rounded-lg p-4 border border-indigo-200/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-indigo-900">Response Analysis</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant={responseAnalysis.addressesMainQuestion ? "default" : "secondary"}>
                        {responseAnalysis.addressesMainQuestion ? "Addresses Question" : "Partially Relevant"}
                      </Badge>
                      <Badge variant="outline" className="text-indigo-600">
                        {Math.round(responseAnalysis.relevanceScore * 100)}% Relevant
                      </Badge>
                    </div>
                  </div>

                  {responseAnalysis.strengths?.length > 0 && (
                    <div>
                      <h5 className="font-medium text-green-700 mb-2">Strengths</h5>
                      <ul className="space-y-1 text-sm text-green-600">
                        {responseAnalysis.strengths.map((strength: string, index: number) => (
                          <li key={index}>• {strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {responseAnalysis.improvements?.length > 0 && (
                    <div>
                      <h5 className="font-medium text-blue-700 mb-2">Improvements</h5>
                      <ul className="space-y-1 text-sm text-blue-600">
                        {responseAnalysis.improvements.map((improvement: string, index: number) => (
                          <li key={index}>• {improvement}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {responseAnalysis.overallFeedback && (
                    <div className="bg-indigo-50 rounded p-3 border border-indigo-200/50">
                      <p className="text-sm text-indigo-800">
                        <span className="font-medium">Overall:</span> {responseAnalysis.overallFeedback}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => improveUserReply("professional")}
                  disabled={!userDraft.trim() || isImproving}
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  {isImproving ? "Improving..." : "Professional"}
                </Button>
                <Button
                  onClick={() => improveUserReply("clarity")}
                  disabled={!userDraft.trim() || isImproving}
                  variant="outline"
                  size="sm"
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  Clarity
                </Button>
                <Button
                  onClick={() => improveUserReply("engagement")}
                  disabled={!userDraft.trim() || isImproving}
                  variant="outline"
                  size="sm"
                  className="text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  Engagement
                </Button>
                <Button
                  onClick={() => improveUserReply("grammar")}
                  disabled={!userDraft.trim() || isImproving}
                  variant="outline"
                  size="sm"
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  Grammar
                </Button>
              </div>

              {improvementSuggestions.length > 0 && (
                <Alert className="border-indigo-200 bg-indigo-50">
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-semibold text-indigo-900">AI Improvements Applied:</p>
                      <ul className="space-y-1 text-sm text-indigo-800">
                        {improvementSuggestions.map((suggestion, index) => (
                          <li key={index}>✓ {suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}