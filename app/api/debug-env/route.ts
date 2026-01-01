import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const envVars = {
      FORMUS_API_URL: process.env.FORMUS_API_URL || "NOT_SET",
      FORMUS_API_KEY: process.env.FORMUS_API_KEY ? `${process.env.FORMUS_API_KEY.substring(0, 8)}...` : "NOT_SET",
      FORMUS_BEARER_TOKEN: process.env.FORMUS_BEARER_TOKEN ? `${process.env.FORMUS_BEARER_TOKEN.substring(0, 3)}...` : "NOT_SET",
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.substring(0, 8)}...` : "NOT_SET",
      NODE_ENV: process.env.NODE_ENV || "NOT_SET"
    }

    return NextResponse.json({
      success: true,
      message: "Environment variables check",
      envVars,
      debug: {
        hasForumsApiKey: !!process.env.FORMUS_API_KEY,
        hasForumsBearer: !!process.env.FORMUS_BEARER_TOKEN,
        hasGeminiKey: !!process.env.GEMINI_API_KEY,
        forumsKeyLength: process.env.FORMUS_API_KEY?.length || 0,
        forumsBearerLength: process.env.FORMUS_BEARER_TOKEN?.length || 0,
        geminiKeyLength: process.env.GEMINI_API_KEY?.length || 0
      }
    })

  } catch (error: any) {
    console.error("[Debug Env] Error:", error)
    
    return NextResponse.json({
      success: false,
      error: error.message || "Unknown error occurred",
      debug: {
        fullError: error.toString()
      }
    }, { status: 500 })
  }
}