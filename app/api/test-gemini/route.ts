import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    
    console.log("[Test Gemini] API Key check:", {
      hasApiKey: !!apiKey,
      keyLength: apiKey?.length || 0,
      keyPrefix: apiKey?.substring(0, 10) || "none",
      isValidFormat: apiKey?.startsWith('AIza') && (apiKey?.length || 0) > 30
    })

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "GEMINI_API_KEY environment variable is not set",
        debug: {
          hasApiKey: false,
          keyLength: 0,
          keyPrefix: "none"
        }
      }, { status: 400 })
    }

    if (!apiKey.startsWith('AIza')) {
      return NextResponse.json({
        success: false,
        error: "GEMINI_API_KEY format appears invalid. Expected format: AIza...",
        debug: {
          hasApiKey: true,
          keyLength: apiKey.length,
          keyPrefix: apiKey.substring(0, 10),
          expectedPrefix: "AIza"
        }
      }, { status: 400 })
    }

    // Test the API key with a simple request
    const ai = new GoogleGenAI({
      apiKey: apiKey
    })

    console.log("[Test Gemini] Testing API key with simple request...")

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Say 'Hello, API test successful!' in exactly those words.",
    })

    const text = response.text || ""
    console.log("[Test Gemini] API response:", text)

    return NextResponse.json({
      success: true,
      message: "Gemini API key is valid and working",
      response: text,
      debug: {
        hasApiKey: true,
        keyLength: apiKey.length,
        keyPrefix: apiKey.substring(0, 10),
        model: "gemini-2.5-flash"
      }
    })

  } catch (error: any) {
    console.error("[Test Gemini] API test failed:", error)
    
    let errorMessage = "Unknown error"
    let errorCode = "UNKNOWN"
    
    if (error.message) {
      errorMessage = error.message
    }
    
    if (error.message?.includes("API key not valid")) {
      errorCode = "INVALID_API_KEY"
      errorMessage = "The provided API key is not valid. Please check your GEMINI_API_KEY environment variable."
    } else if (error.message?.includes("quota")) {
      errorCode = "QUOTA_EXCEEDED"
      errorMessage = "API quota exceeded. Please check your Gemini API usage limits."
    } else if (error.message?.includes("permission")) {
      errorCode = "PERMISSION_DENIED"
      errorMessage = "Permission denied. Please check your API key permissions."
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      errorCode: errorCode,
      debug: {
        hasApiKey: !!process.env.GEMINI_API_KEY,
        keyLength: process.env.GEMINI_API_KEY?.length || 0,
        keyPrefix: process.env.GEMINI_API_KEY?.substring(0, 10) || "none",
        fullError: error.message || error.toString()
      }
    }, { status: 500 })
  }
}