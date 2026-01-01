import { NextRequest, NextResponse } from "next/server"

const FORMUS_API_URL = process.env.FORMUS_API_URL || "https://foru.ms"
const FORMUS_API_KEY = process.env.FORMUS_API_KEY || ""

async function fetchWithRetry(url: string, options: RequestInit, retries = 1): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      // Create timeout controller with shorter timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      console.error(`[Auth API] Attempt ${i + 1} failed:`, error)
      
      if (i === retries) {
        throw error
      }
      
      // Wait before retry (shorter wait)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  throw new Error("All retry attempts failed")
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log("[Auth API] Registration request for:", body.username)

    const response = await fetchWithRetry(`${FORMUS_API_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "x-api-key": FORMUS_API_KEY,
      },
      body: JSON.stringify({
        username: body.username,
        email: body.email,
        displayName: body.displayName,
        password: body.password,
        emailVerified: body.emailVerified ?? true,
        roles: body.roles ?? ["user"]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[Auth API] Registration failed:", response.status, errorText)
      
      let errorMessage = `Registration failed: ${response.status} ${response.statusText}`
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch {
        if (errorText) {
          errorMessage = errorText
        }
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }

    const userData = await response.json()
    console.log("[Auth API] Registration successful for:", userData.username)

    return NextResponse.json(userData)
  } catch (error) {
    console.error("[Auth API] Registration error:", error)
    
    let errorMessage = "Internal server error during registration"
    if (error instanceof Error) {
      if (error.message.includes("ETIMEDOUT") || error.message.includes("timeout")) {
        errorMessage = "Connection timeout. The Foru.ms service may be temporarily unavailable. Please try again."
      } else if (error.message.includes("ENOTFOUND") || error.message.includes("network")) {
        errorMessage = "Network error. Please check your connection and try again."
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}