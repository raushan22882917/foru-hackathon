import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const FORMUS_API_URL = process.env.FORMUS_API_URL || "https://foru.ms"
    const FORMUS_API_KEY = process.env.FORMUS_API_KEY || ""
    const FORMUS_BEARER_TOKEN = process.env.FORMUS_BEARER_TOKEN || ""

    console.log("[Test Foru API] Testing API credentials:", {
      hasApiKey: !!FORMUS_API_KEY,
      hasBearer: !!FORMUS_BEARER_TOKEN,
      apiUrl: FORMUS_API_URL,
      keyLength: FORMUS_API_KEY.length,
      bearerLength: FORMUS_BEARER_TOKEN.length
    })

    if (!FORMUS_API_KEY && !FORMUS_BEARER_TOKEN) {
      return NextResponse.json({
        success: false,
        error: "No Foru.ms API credentials configured",
        debug: {
          hasApiKey: false,
          hasBearer: false,
          apiUrl: FORMUS_API_URL
        }
      }, { status: 400 })
    }

    // Test the API with a simple request
    const headers: Record<string, string> = {
      "Accept": "application/json",
    }

    if (FORMUS_API_KEY) {
      headers["x-api-key"] = FORMUS_API_KEY
    }

    if (FORMUS_BEARER_TOKEN) {
      headers["Authorization"] = `Bearer ${FORMUS_BEARER_TOKEN}`
    }

    console.log("[Test Foru API] Making test request to /api/v1/threads...")

    const response = await fetch(`${FORMUS_API_URL}/api/v1/threads?limit=1`, {
      method: 'GET',
      headers,
    })

    console.log("[Test Foru API] Response status:", response.status)
    console.log("[Test Foru API] Response headers:", Object.fromEntries(response.headers.entries()))

    const responseText = await response.text()
    console.log("[Test Foru API] Response body:", responseText.substring(0, 500))

    if (response.ok) {
      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        data = { raw: responseText }
      }

      return NextResponse.json({
        success: true,
        message: "Foru.ms API credentials are valid and working",
        status: response.status,
        data: data,
        debug: {
          hasApiKey: !!FORMUS_API_KEY,
          hasBearer: !!FORMUS_BEARER_TOKEN,
          apiUrl: FORMUS_API_URL,
          keyLength: FORMUS_API_KEY.length,
          bearerLength: FORMUS_BEARER_TOKEN.length
        }
      })
    } else {
      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch (e) {
        errorData = { raw: responseText }
      }

      return NextResponse.json({
        success: false,
        error: `Foru.ms API returned ${response.status}: ${response.statusText}`,
        status: response.status,
        errorData: errorData,
        debug: {
          hasApiKey: !!FORMUS_API_KEY,
          hasBearer: !!FORMUS_BEARER_TOKEN,
          apiUrl: FORMUS_API_URL,
          keyLength: FORMUS_API_KEY.length,
          bearerLength: FORMUS_BEARER_TOKEN.length,
          responseHeaders: Object.fromEntries(response.headers.entries())
        }
      }, { status: response.status })
    }

  } catch (error: any) {
    console.error("[Test Foru API] Test failed:", error)
    
    return NextResponse.json({
      success: false,
      error: error.message || "Unknown error occurred",
      debug: {
        hasApiKey: !!process.env.FORMUS_API_KEY,
        hasBearer: !!process.env.FORMUS_BEARER_TOKEN,
        apiUrl: process.env.FORMUS_API_URL || "https://foru.ms",
        fullError: error.toString()
      }
    }, { status: 500 })
  }
}