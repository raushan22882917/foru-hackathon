import { GoogleGenAI } from "@google/genai"

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey || apiKey.trim() === "") {
  console.warn("[Gemini AI] GEMINI_API_KEY is not set or invalid. AI features will use fallback data.")
}

// Validate API key format
const isValidApiKey = apiKey && apiKey.startsWith('AIza') && apiKey.length > 30
if (apiKey && !isValidApiKey) {
  console.warn("[Gemini AI] GEMINI_API_KEY format appears invalid. Expected format: AIza... with length > 30")
}

const ai = apiKey && isValidApiKey ? new GoogleGenAI({
  apiKey: apiKey
}) : null

console.log("[Gemini AI] Initialization:", {
  hasApiKey: !!apiKey,
  isValidFormat: isValidApiKey,
  aiClientReady: !!ai
})

export interface SentimentAnalysis {
  overall: "positive" | "negative" | "neutral" | "mixed"
  score: number
  summary: string
  topics: Array<{
    topic: string
    sentiment: "positive" | "negative" | "neutral"
    mentions: number
  }>
}

export interface TrendingTopic {
  topic: string
  mentions: number
  trend: "rising" | "stable" | "falling"
  sentiment: "positive" | "negative" | "neutral"
  relatedThreads: string[]
}

export interface AIRecommendation {
  type: "action" | "insight" | "warning"
  priority: "high" | "medium" | "low"
  title: string
  description: string
  actionItems?: string[]
}

export interface ModerationAnalysis {
  flagged: boolean
  severity: "high" | "medium" | "low" | "none"
  categories: string[]
  reasoning: string
  suggestedAction: "remove" | "review" | "approve" | "flag"
}

// Analyze sentiment from community threads
export async function analyzeSentiment(threads: any[]): Promise<SentimentAnalysis> {
  if (!Array.isArray(threads) || threads.length === 0) {
    console.warn("[Gemini AI] Invalid threads data for sentiment analysis")
    return {
      overall: "neutral",
      score: 0,
      summary: "No threads available for analysis.",
      topics: [],
    }
  }

  if (!ai || !isValidApiKey) {
    console.warn("[Gemini AI] AI client not available, using fallback sentiment analysis")
    return {
      overall: "neutral",
      score: 0,
      summary: "AI analysis unavailable. Please configure a valid GEMINI_API_KEY to enable sentiment analysis.",
      topics: [],
    }
  }

  try {
    const threadContent = threads.map((t) => ({
      title: t.title,
      body: t.body?.slice(0, 200),
      tags: t.tags?.map((tag: any) => tag.name),
    }))

    const prompt = `Analyze the sentiment and topics from these community threads:
${JSON.stringify(threadContent, null, 2)}

Return a JSON response with:
- overall: "positive", "negative", "neutral", or "mixed"
- score: number from -1 (very negative) to 1 (very positive)
- summary: brief summary of community sentiment
- topics: array of {topic, sentiment, mentions} for key topics discussed

Keep it concise and data-focused.`

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })

    const text = response.text || ""

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    throw new Error("Failed to parse AI response")
  } catch (error) {
    console.error("[Gemini AI] Sentiment analysis error:", error)
    // Return fallback data
    return {
      overall: "neutral",
      score: 0,
      summary: "Unable to analyze sentiment at this time. This could be due to an invalid API key or service unavailability.",
      topics: [],
    }
  }
}

// Detect trending topics
export async function detectTrendingTopics(threads: any[]): Promise<TrendingTopic[]> {
  if (!Array.isArray(threads) || threads.length === 0 || !ai || !isValidApiKey) {
    console.warn("[Gemini AI] Cannot detect trending topics - no data or AI client unavailable")
    return []
  }

  try {
    const threadData = threads.map((t) => ({
      id: t.id,
      title: t.title,
      tags: t.tags?.map((tag: any) => tag.name),
      createdAt: t.createdAt,
    }))

    const prompt = `Analyze these community threads and identify trending topics:
${JSON.stringify(threadData, null, 2)}

Return a JSON array of trending topics with:
- topic: topic name
- mentions: number of times mentioned
- trend: "rising", "stable", or "falling"
- sentiment: overall sentiment about this topic
- relatedThreads: array of thread IDs related to this topic

Focus on the top 5-7 most significant topics.`

    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt })
    
    
    const text = response.text || ""

    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    throw new Error("Failed to parse AI response")
  } catch (error) {
    console.error("[Gemini AI] Trending topics error:", error)
    return []
  }
}

// Generate AI recommendations
export async function generateRecommendations(
  threads: any[],
  sentiment: SentimentAnalysis,
): Promise<AIRecommendation[]> {
  if (!Array.isArray(threads) || !ai || !isValidApiKey) {
    console.warn("[Gemini AI] Cannot generate recommendations - no data or AI client unavailable")
    return []
  }

  try {
    const prompt = `Based on this community data:
Sentiment: ${sentiment.overall} (score: ${sentiment.score})
Summary: ${sentiment.summary}
Recent threads: ${threads.length}
Topics: ${sentiment.topics.map((t) => t.topic).join(", ")}

Generate 3-5 actionable recommendations for community managers. Return JSON array with:
- type: "action", "insight", or "warning"
- priority: "high", "medium", or "low"
- title: short title
- description: brief description
- actionItems: optional array of specific action items

Focus on practical, actionable insights.`

    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt })
    
    
    const text = response.text || ""

    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    throw new Error("Failed to parse AI response")
  } catch (error) {
    console.error("[Gemini AI] Recommendations error:", error)
    return []
  }
}

// Generate smart reply
export async function generateSmartReply(
  context: string,
  tone: "professional" | "friendly" | "helpful",
): Promise<string> {
  if (!ai || !isValidApiKey) {
    console.warn("[Gemini AI] AI client not available for smart reply")
    return "Thank you for your message. We appreciate your contribution to the community."
  }

  try {
    const toneInstructions = {
      professional: "Write in a professional, formal tone suitable for business communication.",
      friendly: "Write in a warm, friendly tone that feels personal and approachable.",
      helpful: "Write in a supportive, helpful tone focused on solving problems.",
    }

    const prompt = `Generate a thoughtful reply to this community post or message:

${context}

Requirements:
- ${toneInstructions[tone]}
- Keep it concise (2-3 paragraphs max)
- Be empathetic and constructive
- Provide value to the conversation
- Do not include greetings or signatures

Return only the reply text, no additional formatting.`

    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt })
    
    
    const text = response.text || ""

    return (text || "Thank you for your message. We appreciate your contribution to the community.").trim()
  } catch (error) {
    console.error("[Gemini AI] Smart reply error:", error)
    return "Thank you for your message. We appreciate your contribution to the community."
  }
}

// Analyze content for moderation
export async function analyzeContentForModeration(content: string, author: string): Promise<ModerationAnalysis> {
  if (!ai || !isValidApiKey) {
    console.warn("[Gemini AI] AI client not available for moderation analysis")
    return {
      flagged: false,
      severity: "none",
      categories: [],
      reasoning: "AI moderation unavailable - manual review recommended.",
      suggestedAction: "review",
    }
  }

  try {
    const prompt = `Analyze this community content for moderation:

Content: ${content}
Author: ${author}

Check for:
- Harmful, hateful, or discriminatory content
- Spam or promotional content
- Personal attacks or harassment
- Misinformation or misleading claims
- Inappropriate language or content

Return JSON with:
- flagged: boolean (true if content needs attention)
- severity: "high", "medium", "low", or "none"
- categories: array of issue categories found
- reasoning: brief explanation
- suggestedAction: "remove", "review", "approve", or "flag"

Be balanced - not everything needs flagging. Focus on genuine issues.`

    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt })
    
    
    const text = response.text || ""

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    throw new Error("Failed to parse AI response")
  } catch (error) {
    console.error("[Gemini AI] Moderation analysis error:", error)
    return {
      flagged: false,
      severity: "none",
      categories: [],
      reasoning: "Unable to analyze content at this time.",
      suggestedAction: "review",
    }
  }
}

// Generate thread summary
export async function generateThreadSummary(thread: any, posts: any[]): Promise<string> {
  if (!ai || !isValidApiKey) {
    console.warn("[Gemini AI] AI client not available for thread summary")
    return "This thread discusses community topics and contains multiple contributions from members."
  }

  try {
    // Safely handle posts array
    const safePosts = Array.isArray(posts) ? posts : []
    const postsContent = safePosts.slice(0, 10).map((p) => ({
      author: p.user?.username || "Unknown",
      content: (p.body || p.content || "").slice(0, 300),
    }))

    const prompt = `Summarize this community discussion:

Thread Title: ${thread.title || "Untitled"}
Initial Post: ${(thread.body || "").slice(0, 500)}

Recent Replies:
${JSON.stringify(postsContent, null, 2)}

Provide a concise 2-3 sentence summary of:
1. The main topic/question
2. Key points from the discussion
3. Current status or outcome (if any)

Keep it factual and neutral.`

    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt })
    
    
    const text = response.text || ""

    return (text || "This thread discusses community topics and contains multiple contributions from members.").trim()
  } catch (error) {
    console.error("[Gemini AI] Thread summary error:", error)
    return "This thread discusses community topics and contains multiple contributions from members."
  }
}

// Improve thread content for better clarity and professionalism
export async function improveThreadContent(
  title: string,
  body: string,
  improvementType: "professional" | "clarity" | "engagement" | "grammar" = "professional"
): Promise<{ improvedTitle: string; improvedBody: string; suggestions: string[] }> {
  if (!ai || !isValidApiKey) {
    console.warn("[Gemini AI] AI client not available, using enhanced fallback")
    return getEnhancedFallbackImprovement(title, body, improvementType)
  }

  try {
    const improvementPrompts = {
      professional: "Make this thread more professional and formal while maintaining the original meaning",
      clarity: "Improve the clarity and readability of this thread content",
      engagement: "Make this thread more engaging and likely to receive helpful responses",
      grammar: "Fix grammar, spelling, and formatting issues in this thread"
    }

    const prompt = `${improvementPrompts[improvementType]}. 

Original Title: "${title}"
Original Body: "${body}"

Please provide improved versions. Return your response in this exact JSON format:

{
  "improvedTitle": "your improved title here",
  "improvedBody": "your improved body here", 
  "suggestions": ["what was improved", "specific changes made", "writing tips applied"]
}

Make sure the JSON is valid and properly formatted. Do not include any text outside the JSON.`

    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt })
    
    
    const text = response.text || ""

    console.log("[Gemini AI] Raw response:", text.substring(0, 200) + "...")

    try {
      // Clean the response text to extract JSON
      let jsonText = text.trim()
      
      // Remove markdown code blocks if present
      jsonText = jsonText.replace(/```json\s*/, '').replace(/```\s*$/, '')
      
      // Find JSON object in the response
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        
        // Validate the response has required fields
        if (parsed.improvedTitle && parsed.improvedBody && parsed.suggestions) {
          return {
            improvedTitle: parsed.improvedTitle,
            improvedBody: parsed.improvedBody,
            suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : ["Content improved successfully"]
          }
        }
      }
      
      // If parsing fails, use enhanced fallback
      console.warn("[Gemini AI] Could not parse JSON, using enhanced fallback")
      return getEnhancedFallbackImprovement(title, body, improvementType)
    } catch (parseError) {
      console.error("[Gemini AI] Failed to parse improvement response:", parseError)
      console.error("[Gemini AI] Raw response was:", text)
      
      // Return enhanced fallback
      return getEnhancedFallbackImprovement(title, body, improvementType)
    }
  } catch (error) {
    console.error("[Gemini AI] Thread improvement failed:", error)
    return getEnhancedFallbackImprovement(title, body, improvementType)
  }
}

// Enhanced fallback that actually improves content using basic rules
function getEnhancedFallbackImprovement(
  title: string, 
  body: string, 
  improvementType: "professional" | "clarity" | "engagement" | "grammar"
): { improvedTitle: string; improvedBody: string; suggestions: string[] } {
  let improvedTitle = title
  let improvedBody = body
  const suggestions: string[] = []

  // Basic title improvements
  if (title.length > 0) {
    // Capitalize first letter
    improvedTitle = title.charAt(0).toUpperCase() + title.slice(1)
    
    // Remove excessive punctuation
    improvedTitle = improvedTitle.replace(/[!]{2,}/g, '!').replace(/[?]{2,}/g, '?')
    
    // Add question mark if it seems like a question
    if (improvedTitle.toLowerCase().startsWith('how') || 
        improvedTitle.toLowerCase().startsWith('what') || 
        improvedTitle.toLowerCase().startsWith('why') ||
        improvedTitle.toLowerCase().startsWith('when') ||
        improvedTitle.toLowerCase().startsWith('where')) {
      if (!improvedTitle.endsWith('?')) {
        improvedTitle += '?'
        suggestions.push("Added question mark to clarify this is a question")
      }
    }
  }

  // Basic body improvements
  if (body.length > 0) {
    // Capitalize first letter of sentences
    improvedBody = body.replace(/(^|\. )([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase())
    
    // Fix common contractions for professional tone
    if (improvementType === 'professional') {
      const contractions: { [key: string]: string } = {
        "can't": "cannot",
        "won't": "will not", 
        "don't": "do not",
        "doesn't": "does not",
        "isn't": "is not",
        "aren't": "are not",
        "wasn't": "was not",
        "weren't": "were not",
        "haven't": "have not",
        "hasn't": "has not",
        "hadn't": "had not",
        "wouldn't": "would not",
        "shouldn't": "should not",
        "couldn't": "could not"
      }
      
      let contractionsFixed = 0
      for (const [contraction, expansion] of Object.entries(contractions)) {
        const regex = new RegExp(`\\b${contraction}\\b`, 'gi')
        if (regex.test(improvedBody)) {
          improvedBody = improvedBody.replace(regex, expansion)
          contractionsFixed++
        }
      }
      
      if (contractionsFixed > 0) {
        suggestions.push(`Expanded ${contractionsFixed} contractions for professional tone`)
      }
    }
    
    // Fix spacing around punctuation
    improvedBody = improvedBody.replace(/\s+([,.!?])/g, '$1')
    improvedBody = improvedBody.replace(/([.!?])([A-Z])/g, '$1 $2')
    
    // Remove excessive whitespace
    improvedBody = improvedBody.replace(/\s+/g, ' ').trim()
  }

  // Type-specific improvements
  switch (improvementType) {
    case 'professional':
      suggestions.push("Applied professional formatting and language")
      break
    case 'clarity':
      suggestions.push("Improved sentence structure and clarity")
      break
    case 'engagement':
      if (!improvedBody.includes('?') && !improvedTitle.includes('?')) {
        improvedBody += " What are your thoughts on this?"
        suggestions.push("Added engaging question to encourage responses")
      }
      break
    case 'grammar':
      suggestions.push("Fixed capitalization and punctuation")
      break
  }

  // Only return improvements if something actually changed
  if (improvedTitle === title && improvedBody === body) {
    suggestions.push("Content is already well-formatted")
  }

  return {
    improvedTitle,
    improvedBody,
    suggestions: suggestions.length > 0 ? suggestions : ["Content reviewed and optimized"]
  }
}

// Generate thread suggestions based on topic
export async function generateThreadSuggestions(
  topic: string,
  threadType: "question" | "discussion" | "announcement" | "help" = "discussion"
): Promise<{ title: string; body: string }[]> {
  if (!ai || !isValidApiKey) {
    console.warn("[Gemini AI] AI client not available, using enhanced fallback suggestions")
    return getFallbackThreadSuggestions(topic, threadType)
  }

  try {
    const typePrompts = {
      question: "Generate helpful questions that would spark good discussions",
      discussion: "Generate discussion topics that encourage community engagement", 
      announcement: "Generate announcement-style posts that inform the community",
      help: "Generate help-seeking posts that are clear and specific"
    }

    const prompt = `${typePrompts[threadType]} about "${topic}". 

Generate 3 different thread suggestions. Each should have:
- A clear, engaging title (under 100 characters)
- A well-structured body (2-3 paragraphs, professional tone)

Format as JSON array:
[
  {
    "title": "title 1",
    "body": "body 1"
  },
  {
    "title": "title 2", 
    "body": "body 2"
  },
  {
    "title": "title 3",
    "body": "body 3"
  }
]

Make sure the JSON is valid and properly formatted.`

    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt })
    
    
    const text = response.text || ""

    try {
      // Clean the response text to extract JSON
      let jsonText = text.trim()
      
      // Remove markdown code blocks if present
      jsonText = jsonText.replace(/```json\s*/, '').replace(/```\s*$/, '')
      
      const jsonMatch = jsonText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return Array.isArray(parsed) ? parsed : getFallbackThreadSuggestions(topic, threadType)
      }
      
      return getFallbackThreadSuggestions(topic, threadType)
    } catch (parseError) {
      console.error("[Gemini AI] Failed to parse suggestions response:", parseError)
      return getFallbackThreadSuggestions(topic, threadType)
    }
  } catch (error) {
    console.error("[Gemini AI] Thread suggestions failed:", error)
    return getFallbackThreadSuggestions(topic, threadType)
  }
}

// Generate community health report
export async function generateCommunityHealthReport(
  threads: any[],
  sentiment: SentimentAnalysis,
  trendingTopics: TrendingTopic[],
  recommendations: AIRecommendation[]
): Promise<string> {
  if (!ai || !isValidApiKey) {
    console.warn("[Gemini AI] AI client not available, using fallback health report")
    return getFallbackHealthReport(threads, sentiment, trendingTopics, recommendations)
  }

  try {
    const totalThreads = threads.length
    const totalPosts = threads.reduce((sum, t) => sum + (t.reply_count || 0), 0)
    const avgEngagement = totalThreads > 0 ? (totalPosts / totalThreads).toFixed(1) : "0"

    const prompt = `Generate a comprehensive community health report based on this data:

Community Metrics:
- Total Threads: ${totalThreads}
- Total Posts: ${totalPosts}
- Average Engagement: ${avgEngagement} posts per thread
- Sentiment Score: ${sentiment.score} (${sentiment.overall})
- Trending Topics: ${trendingTopics.length}
- AI Recommendations: ${recommendations.length}

Sentiment Summary: ${sentiment.summary}

Top Trending Topics:
${trendingTopics.slice(0, 5).map(t => `- ${t.topic} (${t.mentions} mentions, ${t.trend})`).join('\n')}

High Priority Recommendations:
${recommendations.filter(r => r.priority === 'high').map(r => `- ${r.title}`).join('\n')}

Generate a professional 2-3 paragraph health report that:
1. Summarizes the current state of the community
2. Highlights key strengths and areas for improvement
3. Provides actionable insights for community managers

Keep it concise, data-driven, and actionable.`

    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt })
    
    

    return (response.text || "" || getFallbackHealthReport(threads, sentiment, trendingTopics, recommendations)).trim()
  } catch (error) {
    console.error("[Gemini AI] Health report generation failed:", error)
    return getFallbackHealthReport(threads, sentiment, trendingTopics, recommendations)
  }
}

function getFallbackHealthReport(
  threads: any[],
  sentiment: SentimentAnalysis,
  trendingTopics: TrendingTopic[],
  recommendations: AIRecommendation[]
): string {
  const totalThreads = threads.length
  const totalPosts = threads.reduce((sum, t) => sum + (t.reply_count || 0), 0)
  const avgEngagement = totalThreads > 0 ? (totalPosts / totalThreads).toFixed(1) : "0"
  
  if (totalThreads === 0) {
    return "Your community is in its early stages with no threads yet. This is a great opportunity to establish a strong foundation by creating welcoming content, setting clear guidelines, and encouraging initial discussions. Focus on creating high-quality seed content that demonstrates the type of conversations you want to foster."
  }
  
  const healthLevel = sentiment.overall === 'positive' ? 'healthy' : sentiment.overall === 'negative' ? 'needs attention' : 'stable'
  const engagementLevel = parseFloat(avgEngagement) > 3 ? 'high' : parseFloat(avgEngagement) > 1 ? 'moderate' : 'low'
  
  return `Your community shows ${healthLevel} activity with ${totalThreads} threads generating ${totalPosts} total posts (${avgEngagement} average per thread). The sentiment analysis indicates ${sentiment.overall} community mood, suggesting ${sentiment.overall === 'positive' ? 'strong member satisfaction and engagement' : sentiment.overall === 'negative' ? 'areas that may need attention from moderators' : 'balanced discussions with room for growth'}. 

With ${engagementLevel} engagement levels and ${trendingTopics.length} trending topics, your community demonstrates ${engagementLevel === 'high' ? 'excellent' : engagementLevel === 'moderate' ? 'good' : 'developing'} member participation. ${recommendations.length > 0 ? `Consider addressing the ${recommendations.filter(r => r.priority === 'high').length} high-priority recommendations to further improve community health.` : 'Continue monitoring engagement patterns and member feedback to maintain community growth.'}`
}

function getFallbackThreadSuggestions(topic: string, threadType: string): { title: string; body: string }[] {
  const suggestions = []
  
  // Generate contextual suggestions based on topic and type
  switch (threadType) {
    case 'question':
      suggestions.push(
        {
          title: `How to get started with ${topic}?`,
          body: `I'm new to ${topic} and looking for guidance on where to begin. What are the essential concepts I should understand first? Any recommended resources or best practices would be greatly appreciated.`
        },
        {
          title: `Common challenges with ${topic}?`,
          body: `What are the most common challenges people face when working with ${topic}? I'd love to hear about your experiences and how you overcame any obstacles.`
        },
        {
          title: `Best tools and resources for ${topic}?`,
          body: `I'm looking for recommendations on the best tools, libraries, or resources for ${topic}. What has worked well for you in your projects?`
        }
      )
      break
      
    case 'help':
      suggestions.push(
        {
          title: `Need help troubleshooting ${topic} issue`,
          body: `I'm experiencing some difficulties with ${topic} and could use some assistance. I've tried the basic troubleshooting steps but haven't been able to resolve the issue. Has anyone encountered similar problems?`
        },
        {
          title: `${topic} not working as expected - seeking advice`,
          body: `I'm implementing ${topic} in my project but it's not behaving as I expected. I'd appreciate any insights or suggestions from the community on what might be going wrong.`
        },
        {
          title: `Step-by-step help needed with ${topic}`,
          body: `I'm looking for detailed guidance on implementing ${topic}. If anyone has experience with this and could provide step-by-step instructions or point me to good tutorials, that would be incredibly helpful.`
        }
      )
      break
      
    case 'announcement':
      suggestions.push(
        {
          title: `New developments in ${topic}`,
          body: `I wanted to share some exciting new developments in the ${topic} space. There have been some significant updates that I think the community would find interesting and valuable.`
        },
        {
          title: `Community update: ${topic} resources`,
          body: `We've compiled some new resources and documentation for ${topic} that should be helpful for everyone. These include updated guides, examples, and best practices.`
        },
        {
          title: `Important changes coming to ${topic}`,
          body: `There are some important changes coming to ${topic} that will affect how we work with it. I wanted to give everyone advance notice and gather feedback from the community.`
        }
      )
      break
      
    default: // discussion
      suggestions.push(
        {
          title: `Let's discuss the future of ${topic}`,
          body: `I'd like to start a discussion about where ${topic} is heading and what trends we're seeing. What are your thoughts on the current state and future direction of ${topic}?`
        },
        {
          title: `Sharing experiences with ${topic}`,
          body: `I've been working with ${topic} for a while now and wanted to share some insights and learn from others' experiences. What has your journey with ${topic} been like?`
        },
        {
          title: `Best practices and tips for ${topic}`,
          body: `What are your go-to best practices when working with ${topic}? I'm always looking to improve my approach and would love to hear what strategies have worked well for others.`
        }
      )
  }
  
  return suggestions
}