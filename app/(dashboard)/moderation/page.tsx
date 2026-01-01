"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Shield, CheckCircle2, XCircle, Eye, Flag, Sparkles } from "lucide-react"
import { getThreads } from "@/lib/foru-api"
import { analyzeContentForModeration } from "@/lib/gemini-ai"

interface ModerationItem {
  id: string
  type: "post" | "thread"
  content: string
  author: {
    username: string
    avatar_url: string | null
  }
  community: string
  reason: string
  aiConfidence: number
  timestamp: string
  status: "pending" | "approved" | "rejected"
  threadId?: string
  originalData?: any
}

export default function ModerationPage() {
  const [items, setItems] = useState<ModerationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [moderationLogs, setModerationLogs] = useState<any[]>([])

  useEffect(() => {
    loadModerationData()
  }, [])

  const loadModerationData = async () => {
    try {
      setLoading(true)
      
      // Get existing moderation logs
      const { data: logs } = await supabase
        .from("moderation_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20)
      
      setModerationLogs(logs || [])

      // Get recent threads for AI analysis
      const threadsResponse = await getThreads(20)
      const threads = threadsResponse.threads || []
      
      // Analyze threads for potential moderation issues
      const moderationItems: ModerationItem[] = []
      
      for (const thread of threads.slice(0, 10)) {
        try {
          const analysis = await analyzeContentForModeration(thread.body || thread.title)
          
          if (analysis.flagged && analysis.severity !== 'none') {
            // Check if already moderated
            const existingLog = logs?.find(log => 
              log.target_id === thread.id && log.target_type === 'thread'
            )
            
            if (!existingLog) {
              moderationItems.push({
                id: `thread_${thread.id}`,
                type: "thread",
                content: thread.body || thread.title,
                author: {
                  username: thread.user?.username || 'Unknown User',
                  avatar_url: thread.user?.avatar || null
                },
                community: thread.tags?.[0]?.name || 'General',
                reason: analysis.reasoning || analysis.categories.join(', '),
                aiConfidence: Math.round((analysis.severity === 'high' ? 95 : analysis.severity === 'medium' ? 80 : 65)),
                timestamp: thread.created_at || new Date().toISOString(),
                status: "pending",
                threadId: thread.id,
                originalData: thread
              })
            }
          }
        } catch (error) {
          console.error('Error analyzing thread:', thread.id, error)
        }
      }
      
      // Add some processed items from logs
      const processedItems = logs?.slice(0, 5).map(log => ({
        id: `log_${log.id}`,
        type: log.target_type as "post" | "thread",
        content: log.reason || 'Content flagged for review',
        author: {
          username: 'System User',
          avatar_url: null
        },
        community: 'System',
        reason: log.reason || 'Automated flag',
        aiConfidence: log.ai_suggestion ? 85 : 70,
        timestamp: log.created_at,
        status: log.action === 'approve' ? 'approved' as const : 'rejected' as const,
        originalData: log
      })) || []
      
      setItems([...moderationItems, ...processedItems])
    } catch (error) {
      console.error('Error loading moderation data:', error)
      // Fallback to empty state
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    const item = items.find(i => i.id === id)
    if (!item) return

    try {
      // Log the moderation action (removed Supabase dependency)
      console.log(`[Moderation] Approved ${item.type}: ${item.id}`)

      setItems(items.map((item) => (item.id === id ? { ...item, status: "approved" as const } : item)))
    } catch (error) {
      console.error('Error approving item:', error)
    }
  }

  const handleReject = async (id: string) => {
    const item = items.find(i => i.id === id)
    if (!item) return

    try {
      // Log the moderation action (removed Supabase dependency)
      console.log(`[Moderation] Rejected ${item.type}: ${item.id}`)

      setItems(items.map((item) => (item.id === id ? { ...item, status: "rejected" as const } : item)))
    } catch (error) {
      console.error('Error rejecting item:', error)
    }
  }

  const pendingItems = items.filter((item) => item.status === "pending")
  const reviewedItems = items.filter((item) => item.status !== "pending")
  const aiAccuracy = moderationLogs.length > 0 ? 
    Math.round((moderationLogs.filter(log => log.ai_suggestion).length / moderationLogs.length) * 100) : 91

  function formatTimeAgo(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const ModerationCard = ({ item }: { item: ModerationItem }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={item.author.avatar_url || "/placeholder.svg"} alt={item.author.username} />
              <AvatarFallback>{item.author.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold">{item.author.username}</span>
                  <span className="mx-2 text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">{item.community}</span>
                </div>
                <Badge variant={item.type === "post" ? "secondary" : "default"}>{item.type}</Badge>
              </div>
              <p className="text-sm leading-relaxed">{item.content}</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-muted-foreground">{item.reason}</span>
                </div>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">{formatTimeAgo(item.timestamp)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">AI Confidence: {item.aiConfidence}%</span>
                <div className="ml-2 h-2 w-24 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary" style={{ width: `${item.aiConfidence}%` }} />
                </div>
              </div>
            </div>
          </div>

          {item.status === "pending" && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleApprove(item.id)} className="flex-1 bg-transparent">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button variant="outline" onClick={() => handleReject(item.id)} className="flex-1 bg-transparent">
                <XCircle className="mr-2 h-4 w-4" />
                Remove
              </Button>
              <Button variant="outline" className="bg-transparent">
                <Eye className="mr-2 h-4 w-4" />
                View Context
              </Button>
            </div>
          )}

          {item.status === "approved" && (
            <Badge variant="secondary" className="w-full justify-center">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approved
            </Badge>
          )}

          {item.status === "rejected" && (
            <Badge variant="destructive" className="w-full justify-center">
              <XCircle className="mr-2 h-4 w-4" />
              Removed
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Moderation Center</h1>
        <p className="text-muted-foreground">Review AI-flagged content and maintain community standards</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingItems.length}</div>
            <p className="text-xs text-muted-foreground">Items need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviewed Today</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewedItems.length}</div>
            <p className="text-xs text-muted-foreground">Actions taken</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Accuracy</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiAccuracy}%</div>
            <p className="text-xs text-muted-foreground">Based on {moderationLogs.length} actions</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">
            Pending
            {pendingItems.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingItems.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-sm text-muted-foreground">Loading moderation queue...</p>
              </CardContent>
            </Card>
          ) : pendingItems.length > 0 ? (
            pendingItems.map((item) => <ModerationCard key={item.id} item={item} />)
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Shield className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="mb-2 text-lg font-semibold">All caught up!</h3>
                <p className="text-sm text-muted-foreground">No pending items require moderation</p>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={loadModerationData}
                  disabled={loading}
                >
                  Refresh Queue
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reviewed" className="space-y-4">
          {reviewedItems.length > 0 ? (
            reviewedItems.map((item) => <ModerationCard key={item.id} item={item} />)
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Shield className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="mb-2 text-lg font-semibold">No reviewed items</h3>
                <p className="text-sm text-muted-foreground">Reviewed content will appear here</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Settings</CardTitle>
              <CardDescription>Configure AI-powered content filtering</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Auto-flag triggers</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 text-sm">
                    <input type="checkbox" defaultChecked className="rounded" />
                    Harmful language or harassment
                  </label>
                  <label className="flex items-center gap-3 text-sm">
                    <input type="checkbox" defaultChecked className="rounded" />
                    Spam or promotional content
                  </label>
                  <label className="flex items-center gap-3 text-sm">
                    <input type="checkbox" defaultChecked className="rounded" />
                    Personal attacks
                  </label>
                  <label className="flex items-center gap-3 text-sm">
                    <input type="checkbox" className="rounded" />
                    Off-topic discussions
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium">AI Confidence Threshold</h3>
                <p className="text-sm text-muted-foreground">Only flag content when AI is at least this confident</p>
                <div className="flex items-center gap-4">
                  <input type="range" min="50" max="99" defaultValue="80" className="flex-1" />
                  <span className="text-sm font-medium">80%</span>
                </div>
              </div>

              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
