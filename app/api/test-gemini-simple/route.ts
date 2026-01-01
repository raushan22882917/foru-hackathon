import { NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "GEMINI_API_KEY not found"
      })
    }

    console.log("Testing Gemini API with key:", apiKey.substring(0, 10) + "...")

    const ai = new GoogleGenAI({
      apiKey: apiKey
    })

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Explain how AI works in a few words",
    })

    return NextResponse.json({
      success: true,
      response: response.text,
      keyLength: apiKey.length
    })

  } catch (error) {
    console.error("Gemini API test error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}