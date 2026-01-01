"use server"

import { analyzeSentiment, detectTrendingTopics, generateRecommendations, generateThreadSummary } from "@/lib/gemini-ai"
import { getThreads, getCommunities } from "@/lib/foru-api"

export async function refreshAIInsights() {
  try {
    console.log("[AI Insights Action] Starting refresh...")
    
    // Fetch fresh data
    const [threadsResponse, communities] = await Promise.all([
      getThreads(100),
      getCommunities()
    ])
    
    const threads = threadsResponse.threads || []
    
    // Generate fresh AI insights
    let sentiment: any = {
      overall: "neutral",
      score: 0,
      summary: "Your community is just getting started! As more discussions develop, AI will provide deeper insights into community sentiment and engagement patterns.",
      topics: [],
      positive: 50,
      neutral: 30,
      negative: 20
    }
    
    let trendingTopics: any[] = []
    let recommendations: any[] = []
    let threadSummaries: any[] = []

    if (threads.length > 0) {
      try {
        console.log(`[AI Insights Action] Analyzing ${threads.length} threads...`)
        
        // Run AI analysis in parallel
        const [sentimentResult, trendingResult, recommendationsResult] = await Promise.all([
          analyzeSentiment(threads).catch(error => {
            console.error("[AI Insights Action] Sentiment analysis failed:", error)
            return sentiment // fallback
          }),
          detectTrendingTopics(threads).catch(error => {
            console.error("[AI Insights Action] Trending topics failed:", error)
            return []
          }),
          generateRecommendations(threads, sentiment).catch(error => {
            console.error("[AI Insights Action] Recommendations failed:", error)
            return []
          })
        ])
        
        sentiment = sentimentResult
        trendingTopics = trendingResult
        recommendations = recommendationsResult
        
        // Generate summaries for top threads
        const topThreads = threads.slice(0, 5)
        console.log(`[AI Insights Action] Generating summaries for ${topThreads.length} threads...`)
        
        threadSummaries = await Promise.all(
          topThreads.map(async (thread, index) => {
            try {
              const summary = await generateThreadSummary(thread, [])
              console.log(`[AI Insights Action] Generated summary ${index + 1}/${topThreads.length}`)
              return { thread, summary }
            } catch (error) {
              console.error(`[AI Insights Action] Summary failed for thread ${thread.id}:`, error)
              return { thread, summary: "Summary unavailable due to processing error" }
            }
          })
        )
      } catch (error) {
        console.error("[AI Insights Action] Error generating insights:", error)
        // Use fallback data
      }
    } else {
      console.log("[AI Insights Action] No threads found, using default insights")
      // Add some helpful recommendations for empty communities
      recommendations = [
        {
          type: "action",
          priority: "high",
          title: "Configure AI Analysis",
          description: "Set up a valid Gemini API key to enable AI-powered insights, sentiment analysis, and recommendations for your community.",
          actionItems: [
            "Obtain a valid Gemini API key from Google AI Studio (https://makersuite.google.com/app/apikey)",
            "Update the GEMINI_API_KEY environment variable in your .env file",
            "Restart the application to apply changes",
            "Test the AI functionality using the refresh button"
          ]
        },
        {
          type: "action",
          priority: "high",
          title: "Welcome New Community Members",
          description: "Create a welcoming environment for your first community members by setting up introduction threads and community guidelines.",
          actionItems: [
            "Create a 'Welcome & Introductions' thread",
            "Post community guidelines and rules",
            "Share your community's purpose and goals",
            "Encourage members to introduce themselves"
          ]
        },
        {
          type: "insight",
          priority: "medium", 
          title: "Seed Initial Discussions",
          description: "Start meaningful conversations to encourage engagement and show the type of content you want to see.",
          actionItems: [
            "Post thought-provoking questions",
            "Share relevant news or updates",
            "Create polls to gather member opinions",
            "Start topic-specific discussion threads"
          ]
        },
        {
          type: "action",
          priority: "low",
          title: "Set Up Community Structure",
          description: "Organize your community with proper categories and moderation tools to scale effectively.",
          actionItems: [
            "Create topic categories or tags",
            "Set up moderation guidelines",
            "Configure notification settings",
            "Plan regular community events or discussions"
          ]
        }
      ]
    }

    console.log("[AI Insights Action] Refresh completed successfully")
    
    return {
      success: true,
      data: {
        threads,
        communities,
        sentiment,
        trendingTopics,
        recommendations,
        threadSummaries,
        lastUpdated: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error("[AI Insights Action] Refresh failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }
  }
}

export async function generateCommunityReport() {
  try {
    console.log("[AI Insights Action] Generating community report...")
    
    const { data } = await refreshAIInsights()
    
    if (!data) {
      throw new Error("Failed to fetch community data")
    }
    
    const { threads, sentiment, trendingTopics, recommendations } = data
    
    // Calculate key metrics
    const totalThreads = threads.length
    const totalPosts = threads.reduce((sum, t) => sum + (t.reply_count || 0), 0)
    const totalViews = threads.reduce((sum, t) => sum + (t.view_count || 0), 0)
    const avgEngagement = totalThreads > 0 ? (totalPosts / totalThreads).toFixed(1) : "0"
    
    // Generate report summary
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalThreads,
        totalPosts,
        totalViews,
        avgEngagement: parseFloat(avgEngagement),
        sentimentScore: Math.round(sentiment.score * 100),
        sentimentOverall: sentiment.overall,
        trendingTopicsCount: trendingTopics.length,
        recommendationsCount: recommendations.length
      },
      insights: {
        sentiment,
        trendingTopics: trendingTopics.slice(0, 10), // Top 10
        recommendations: recommendations.slice(0, 5), // Top 5
      },
      healthScore: calculateCommunityHealthScore(data)
    }
    
    console.log("[AI Insights Action] Community report generated successfully")
    
    return {
      success: true,
      report
    }
  } catch (error) {
    console.error("[AI Insights Action] Report generation failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate report"
    }
  }
}

function calculateCommunityHealthScore(data: any): number {
  const { threads, sentiment, trendingTopics, recommendations } = data
  
  let score = 0
  let maxScore = 0
  
  // Thread activity (30 points max)
  const threadCount = threads.length
  if (threadCount > 0) {
    score += Math.min(threadCount * 2, 30) // 2 points per thread, max 30
  }
  maxScore += 30
  
  // Sentiment health (25 points max)
  const sentimentScore = sentiment.score || 0
  score += Math.max(0, sentimentScore * 25) // Convert -1 to 1 range to 0-25 points
  maxScore += 25
  
  // Topic diversity (20 points max)
  const topicCount = trendingTopics.length
  score += Math.min(topicCount * 4, 20) // 4 points per topic, max 20
  maxScore += 20
  
  // Engagement quality (15 points max)
  const totalPosts = threads.reduce((sum: number, t: any) => sum + (t.reply_count || 0), 0)
  const avgEngagement = threadCount > 0 ? totalPosts / threadCount : 0
  score += Math.min(avgEngagement * 3, 15) // 3 points per avg reply, max 15
  maxScore += 15
  
  // AI recommendations addressed (10 points max)
  const highPriorityRecs = recommendations.filter((r: any) => r.priority === 'high').length
  score += Math.max(0, 10 - (highPriorityRecs * 2)) // Lose 2 points per high priority rec
  maxScore += 10
  
  // Calculate percentage
  const healthScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  
  return Math.max(0, Math.min(100, healthScore)) // Ensure 0-100 range
}