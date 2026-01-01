// ThreadSense AI - Intelligent Community Brain
// Core AI layer that provides intelligent insights for forum threads and posts

import { 
  analyzeSentiment, 
  detectTrendingTopics, 
  generateRecommendations,
  analyzeContentForModeration,
  generateThreadSummary,
  generateSmartReply
} from "@/lib/gemini-ai"

export interface ThreadSenseAnalysis {
  threadId: string
  summary: string
  sentiment: {
    overall: "positive" | "negative" | "neutral" | "mixed"
    score: number
    confidence: number
  }
  toxicity: {
    flagged: boolean
    severity: "high" | "medium" | "low" | "none"
    categories: string[]
    reasoning: string
  }
  engagement: {
    score: number
    level: "high" | "medium" | "low"
    factors: string[]
  }
  relatedThreads: Array<{
    id: string
    title: string
    similarity: number
    reason: string
  }>
  suggestedActions: Array<{
    type: "moderate" | "promote" | "archive" | "feature"
    priority: "high" | "medium" | "low"
    reason: string
  }>
  aiInsights: string[]
}

export interface CommunityHealthMetrics {
  overall: {
    score: number
    status: "healthy" | "concerning" | "critical" | "excellent"
    trend: "improving" | "stable" | "declining"
  }
  sentiment: {
    positive: number
    neutral: number
    negative: number
    trend: "improving" | "stable" | "declining"
  }
  engagement: {
    averageReplies: number
    averageViews: number
    activeUsers: number
    trend: "growing" | "stable" | "declining"
  }
  contentQuality: {
    score: number
    toxicContent: number
    helpfulContent: number
    trend: "improving" | "stable" | "declining"
  }
  recommendations: Array<{
    type: "action" | "insight" | "warning"
    priority: "high" | "medium" | "low"
    title: string
    description: string
    actionItems?: string[]
  }>
}

export interface SmartSuggestion {
  id: string
  type: "related_thread" | "helpful_resource" | "similar_discussion" | "expert_user"
  title: string
  description: string
  relevanceScore: number
  metadata: Record<string, any>
}

// Main ThreadSense AI class
export class ThreadSenseAI {
  private static instance: ThreadSenseAI
  private analysisCache = new Map<string, ThreadSenseAnalysis>()
  private cacheExpiry = 5 * 60 * 1000 // 5 minutes

  static getInstance(): ThreadSenseAI {
    if (!ThreadSenseAI.instance) {
      ThreadSenseAI.instance = new ThreadSenseAI()
    }
    return ThreadSenseAI.instance
  }

  // Analyze a single thread with all AI insights
  async analyzeThread(thread: any, posts: any[] = []): Promise<ThreadSenseAnalysis> {
    const cacheKey = `${thread.id}-${posts.length}`
    const cached = this.analysisCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached
    }

    try {
      // Generate thread summary
      const summary = await generateThreadSummary(thread, posts)

      // Analyze sentiment of the thread and posts
      const allContent = [thread, ...posts]
      const sentimentAnalysis = await analyzeSentiment(allContent)

      // Check for toxicity/moderation issues
      const combinedContent = `${thread.title} ${thread.body} ${posts.map(p => p.content || p.body).join(' ')}`
      const moderationAnalysis = await analyzeContentForModeration(
        combinedContent.slice(0, 2000), // Limit content length
        thread.user?.username || 'Unknown'
      )

      // Calculate engagement score
      const engagement = this.calculateEngagementScore(thread, posts)

      // Find related threads (simplified - in production, use vector similarity)
      const relatedThreads = await this.findRelatedThreads(thread)

      // Generate suggested actions
      const suggestedActions = this.generateSuggestedActions(thread, posts, sentimentAnalysis, moderationAnalysis, engagement)

      // Generate AI insights
      const aiInsights = this.generateAIInsights(thread, posts, sentimentAnalysis, engagement)

      const analysis: ThreadSenseAnalysis = {
        threadId: thread.id,
        summary,
        sentiment: {
          overall: sentimentAnalysis.overall,
          score: sentimentAnalysis.score,
          confidence: Math.abs(sentimentAnalysis.score) // Simple confidence based on score magnitude
        },
        toxicity: {
          flagged: moderationAnalysis.flagged,
          severity: moderationAnalysis.severity,
          categories: moderationAnalysis.categories,
          reasoning: moderationAnalysis.reasoning
        },
        engagement,
        relatedThreads,
        suggestedActions,
        aiInsights,
        timestamp: Date.now()
      } as ThreadSenseAnalysis & { timestamp: number }

      // Cache the analysis
      this.analysisCache.set(cacheKey, analysis)

      return analysis
    } catch (error) {
      console.error('[ThreadSense AI] Analysis failed:', error)
      
      // Return fallback analysis
      return {
        threadId: thread.id,
        summary: "This thread discusses community topics and contains multiple contributions from members.",
        sentiment: {
          overall: "neutral",
          score: 0,
          confidence: 0.5
        },
        toxicity: {
          flagged: false,
          severity: "none",
          categories: [],
          reasoning: "Unable to analyze content at this time."
        },
        engagement: {
          score: 0.5,
          level: "medium",
          factors: ["Standard community engagement"]
        },
        relatedThreads: [],
        suggestedActions: [],
        aiInsights: ["AI analysis temporarily unavailable"]
      }
    }
  }

  // Calculate engagement score based on thread metrics
  private calculateEngagementScore(thread: any, posts: any[]): ThreadSenseAnalysis['engagement'] {
    const replyCount = posts.length || thread.reply_count || 0
    const viewCount = thread.view_count || 0
    const age = Date.now() - new Date(thread.createdAt).getTime()
    const ageInDays = age / (1000 * 60 * 60 * 24)

    // Calculate engagement factors
    const factors: string[] = []
    let score = 0.5 // Base score

    // Reply engagement
    if (replyCount > 10) {
      score += 0.3
      factors.push("High reply activity")
    } else if (replyCount > 3) {
      score += 0.1
      factors.push("Good reply activity")
    }

    // View engagement
    const viewToReplyRatio = replyCount > 0 ? viewCount / replyCount : 0
    if (viewToReplyRatio > 20) {
      score += 0.2
      factors.push("High view-to-reply ratio")
    }

    // Recency boost
    if (ageInDays < 1) {
      score += 0.1
      factors.push("Recent activity")
    }

    // Thread quality indicators
    if (thread.pinned) {
      score += 0.2
      factors.push("Pinned thread")
    }

    if (thread.title.includes('?')) {
      score += 0.1
      factors.push("Question format encourages responses")
    }

    // Normalize score
    score = Math.min(1, Math.max(0, score))

    let level: "high" | "medium" | "low"
    if (score > 0.7) level = "high"
    else if (score > 0.4) level = "medium"
    else level = "low"

    return { score, level, factors }
  }

  // Find related threads (simplified implementation)
  private async findRelatedThreads(thread: any): Promise<ThreadSenseAnalysis['relatedThreads']> {
    // In a production system, this would use vector embeddings and semantic search
    // For now, we'll use simple keyword matching and tag similarity
    
    const relatedThreads: ThreadSenseAnalysis['relatedThreads'] = []
    
    // Extract keywords from title and body
    const keywords = this.extractKeywords(thread.title + ' ' + (thread.body || ''))
    
    // For demo purposes, generate some related threads based on tags
    if (thread.tags && thread.tags.length > 0) {
      thread.tags.slice(0, 2).forEach((tag: any, index: number) => {
        relatedThreads.push({
          id: `related-${thread.id}-${index}`,
          title: `Other discussions about ${tag.name}`,
          similarity: 0.8 - (index * 0.1),
          reason: `Shares the "${tag.name}" tag`
        })
      })
    }

    // Add keyword-based suggestions
    keywords.slice(0, 2).forEach((keyword, index) => {
      relatedThreads.push({
        id: `keyword-${thread.id}-${index}`,
        title: `Similar discussions about ${keyword}`,
        similarity: 0.7 - (index * 0.1),
        reason: `Contains similar keywords: "${keyword}"`
      })
    })

    return relatedThreads.slice(0, 5) // Limit to 5 suggestions
  }

  // Extract keywords from text (simple implementation)
  private extractKeywords(text: string): string[] {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'])
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word))
      .slice(0, 10)
  }

  // Generate suggested actions based on analysis
  private generateSuggestedActions(
    thread: any, 
    posts: any[], 
    sentiment: any, 
    moderation: any, 
    engagement: any
  ): ThreadSenseAnalysis['suggestedActions'] {
    const actions: ThreadSenseAnalysis['suggestedActions'] = []

    // Moderation actions
    if (moderation.flagged) {
      actions.push({
        type: "moderate",
        priority: moderation.severity === "high" ? "high" : "medium",
        reason: `Content flagged for: ${moderation.categories.join(', ')}`
      })
    }

    // Promotion actions
    if (engagement.score > 0.8 && sentiment.overall === "positive") {
      actions.push({
        type: "feature",
        priority: "medium",
        reason: "High engagement and positive sentiment - consider featuring"
      })
    }

    // Archive suggestions
    const ageInDays = (Date.now() - new Date(thread.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    if (ageInDays > 30 && engagement.score < 0.2) {
      actions.push({
        type: "archive",
        priority: "low",
        reason: "Old thread with low engagement - consider archiving"
      })
    }

    // Promotion for good content
    if (sentiment.overall === "positive" && posts.length > 5) {
      actions.push({
        type: "promote",
        priority: "medium",
        reason: "Active discussion with positive sentiment"
      })
    }

    return actions
  }

  // Generate AI insights
  private generateAIInsights(thread: any, posts: any[], sentiment: any, engagement: any): string[] {
    const insights: string[] = []

    // Engagement insights
    if (engagement.level === "high") {
      insights.push("🔥 This thread is generating high community engagement")
    } else if (engagement.level === "low") {
      insights.push("💡 Consider improving the title or adding more context to boost engagement")
    }

    // Sentiment insights
    if (sentiment.overall === "positive") {
      insights.push("😊 Community sentiment is positive - members are finding this helpful")
    } else if (sentiment.overall === "negative") {
      insights.push("⚠️ Negative sentiment detected - may need moderator attention")
    }

    // Content insights
    if (posts.length === 0) {
      insights.push("🤔 No replies yet - consider promoting or improving visibility")
    } else if (posts.length > 10) {
      insights.push("💬 Active discussion with many participants")
    }

    // Question detection
    if (thread.title.includes('?') || thread.body?.includes('?')) {
      insights.push("❓ Question format detected - likely seeking community help")
    }

    return insights.slice(0, 4) // Limit to 4 insights
  }

  // Analyze community health across all threads
  async analyzeCommunityHealth(threads: any[]): Promise<CommunityHealthMetrics> {
    try {
      if (!threads || threads.length === 0) {
        return this.getEmptyCommunityMetrics()
      }

      // Analyze sentiment across all threads
      const sentimentAnalysis = await analyzeSentiment(threads)
      
      // Calculate engagement metrics
      const totalReplies = threads.reduce((sum, t) => sum + (t.reply_count || 0), 0)
      const totalViews = threads.reduce((sum, t) => sum + (t.view_count || 0), 0)
      const averageReplies = threads.length > 0 ? totalReplies / threads.length : 0
      const averageViews = threads.length > 0 ? totalViews / threads.length : 0

      // Estimate active users (simplified)
      const uniqueUsers = new Set(threads.map(t => t.user?.id).filter(Boolean))
      const activeUsers = uniqueUsers.size

      // Calculate overall health score
      const engagementScore = Math.min(1, averageReplies / 5) // Normalize to 0-1
      const sentimentScore = (sentimentAnalysis.score + 1) / 2 // Convert -1,1 to 0,1
      const activityScore = Math.min(1, threads.length / 20) // Normalize based on thread count
      
      const overallScore = (engagementScore + sentimentScore + activityScore) / 3

      let status: CommunityHealthMetrics['overall']['status']
      if (overallScore > 0.8) status = "excellent"
      else if (overallScore > 0.6) status = "healthy"
      else if (overallScore > 0.4) status = "concerning"
      else status = "critical"

      // Generate recommendations
      const recommendations = await generateRecommendations(threads, sentimentAnalysis)

      return {
        overall: {
          score: overallScore,
          status,
          trend: "stable" // Would need historical data for real trend analysis
        },
        sentiment: {
          positive: sentimentAnalysis.topics.filter(t => t.sentiment === "positive").length,
          neutral: sentimentAnalysis.topics.filter(t => t.sentiment === "neutral").length,
          negative: sentimentAnalysis.topics.filter(t => t.sentiment === "negative").length,
          trend: sentimentAnalysis.overall === "positive" ? "improving" : 
                 sentimentAnalysis.overall === "negative" ? "declining" : "stable"
        },
        engagement: {
          averageReplies,
          averageViews,
          activeUsers,
          trend: averageReplies > 2 ? "growing" : averageReplies > 1 ? "stable" : "declining"
        },
        contentQuality: {
          score: 0.8, // Would need content analysis for real score
          toxicContent: 0, // Would need moderation analysis
          helpfulContent: threads.filter(t => (t.reply_count || 0) > 3).length,
          trend: "stable"
        },
        recommendations
      }
    } catch (error) {
      console.error('[ThreadSense AI] Community health analysis failed:', error)
      return this.getEmptyCommunityMetrics()
    }
  }

  private getEmptyCommunityMetrics(): CommunityHealthMetrics {
    return {
      overall: {
        score: 0.5,
        status: "healthy",
        trend: "stable"
      },
      sentiment: {
        positive: 0,
        neutral: 0,
        negative: 0,
        trend: "stable"
      },
      engagement: {
        averageReplies: 0,
        averageViews: 0,
        activeUsers: 0,
        trend: "stable"
      },
      contentQuality: {
        score: 0.5,
        toxicContent: 0,
        helpfulContent: 0,
        trend: "stable"
      },
      recommendations: []
    }
  }

  // Generate smart suggestions for "People discussing this also viewed"
  async generateSmartSuggestions(threadId: string, limit = 5): Promise<SmartSuggestion[]> {
    // In production, this would use ML models and user behavior data
    // For demo, we'll generate contextual suggestions
    
    const suggestions: SmartSuggestion[] = [
      {
        id: `suggestion-1-${threadId}`,
        type: "related_thread",
        title: "Best practices for community engagement",
        description: "Learn how to create engaging discussions that drive participation",
        relevanceScore: 0.9,
        metadata: { category: "community", engagement: "high" }
      },
      {
        id: `suggestion-2-${threadId}`,
        type: "helpful_resource",
        title: "Community Guidelines and Best Practices",
        description: "Essential reading for new community members",
        relevanceScore: 0.8,
        metadata: { type: "resource", importance: "high" }
      },
      {
        id: `suggestion-3-${threadId}`,
        type: "similar_discussion",
        title: "Weekly Community Roundup",
        description: "Stay updated with the latest community discussions and highlights",
        relevanceScore: 0.7,
        metadata: { frequency: "weekly", type: "roundup" }
      }
    ]

    return suggestions.slice(0, limit)
  }

  // Generate smart reply suggestions
  async generateSmartReplyOptions(threadContent: string, postContent: string): Promise<string[]> {
    try {
      const context = `Thread: ${threadContent}\nPost: ${postContent}`
      
      const replies = await Promise.all([
        generateSmartReply(context, "helpful"),
        generateSmartReply(context, "professional"),
        generateSmartReply(context, "friendly")
      ])

      return replies.filter(reply => reply && reply.length > 10)
    } catch (error) {
      console.error('[ThreadSense AI] Smart reply generation failed:', error)
      return [
        "Thank you for sharing this. I'd like to add some thoughts on this topic.",
        "This is a great point. Have you considered exploring this from a different angle?",
        "I appreciate your perspective. Here's what I've learned from similar situations."
      ]
    }
  }

  // Generate contextual reply suggestions based on thread and recent posts
  async generateContextualReplies(
    threadTitle: string,
    threadContent: string, 
    recentPosts: any[],
    replyType: "answer" | "question" | "support" | "discussion" = "discussion"
  ): Promise<Array<{
    content: string
    tone: "professional" | "friendly" | "helpful" | "supportive"
    type: "direct_answer" | "follow_up_question" | "supportive_comment" | "expert_insight"
    confidence: number
  }>> {
    try {
      // Build comprehensive context
      const context = `
Thread: "${threadTitle}"
Content: ${threadContent}
Recent Discussion: ${recentPosts.slice(-3).map(p => `${p.user?.username || 'User'}: ${p.content || p.body || ''}`).join('\n')}
      `.trim()

      // Generate different types of replies based on context
      const replyPromises = []

      // Always generate a helpful reply
      replyPromises.push(
        generateSmartReply(context, "helpful").then(content => ({
          content,
          tone: "helpful" as const,
          type: "direct_answer" as const,
          confidence: 0.85
        }))
      )

      // Generate professional reply for complex topics
      if (threadContent.length > 200 || recentPosts.length > 2) {
        replyPromises.push(
          generateSmartReply(context, "professional").then(content => ({
            content,
            tone: "professional" as const,
            type: "expert_insight" as const,
            confidence: 0.80
          }))
        )
      }

      // Generate friendly reply for community building
      replyPromises.push(
        generateSmartReply(context, "friendly").then(content => ({
          content,
          tone: "friendly" as const,
          type: "supportive_comment" as const,
          confidence: 0.75
        }))
      )

      // Generate follow-up question if there are recent posts
      if (recentPosts.length > 0) {
        const lastPost = recentPosts[recentPosts.length - 1]
        const followUpContext = `Responding to: ${lastPost.user?.username || 'User'}: ${lastPost.content || lastPost.body || ''}`
        
        replyPromises.push(
          generateSmartReply(followUpContext, "helpful").then(content => ({
            content,
            tone: "helpful" as const,
            type: "follow_up_question" as const,
            confidence: 0.70
          }))
        )
      }

      const replies = await Promise.all(replyPromises)
      
      // Filter out short or invalid replies
      return replies.filter(reply => reply.content && reply.content.length > 20)
    } catch (error) {
      console.error('[ThreadSense AI] Contextual reply generation failed:', error)
      
      // Return fallback replies
      return [
        {
          content: "Thank you for sharing this. I'd like to add some thoughts on this topic.",
          tone: "helpful",
          type: "supportive_comment",
          confidence: 0.6
        },
        {
          content: "This is a great point. Have you considered exploring this from a different angle?",
          tone: "friendly",
          type: "follow_up_question", 
          confidence: 0.6
        },
        {
          content: "I appreciate your perspective. Here's what I've learned from similar situations.",
          tone: "professional",
          type: "expert_insight",
          confidence: 0.6
        }
      ]
    }
  }

  // Clear analysis cache
  clearCache(): void {
    this.analysisCache.clear()
  }
}

// Export singleton instance
export const threadSenseAI = ThreadSenseAI.getInstance()