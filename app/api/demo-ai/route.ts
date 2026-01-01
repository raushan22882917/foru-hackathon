import { NextResponse } from "next/server"
import { improveThreadContent, generateThreadSuggestions } from "@/lib/gemini-ai"

export async function POST(request: Request) {
  try {
    const { action, title, body, topic, type } = await request.json()

    if (action === 'improve') {
      const result = await improveThreadContent(title, body, type || 'professional')
      return NextResponse.json({
        success: true,
        result,
        usingRealAI: process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.startsWith('AIza')
      })
    }

    if (action === 'suggest') {
      const result = await generateThreadSuggestions(topic, type || 'discussion')
      return NextResponse.json({
        success: true,
        result,
        usingRealAI: process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.startsWith('AIza')
      })
    }

    return NextResponse.json({
      success: false,
      error: "Invalid action"
    }, { status: 400 })

  } catch (error) {
    console.error("Demo AI error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}