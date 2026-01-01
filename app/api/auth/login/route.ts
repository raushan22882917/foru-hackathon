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
    
    console.log("[Auth API] Login request for:", body.login)
    console.log("[Auth API] Request body:", { login: body.login, password: "***" })

    // First, get the auth token
    const loginResponse = await fetchWithRetry(`${FORMUS_API_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "x-api-key": FORMUS_API_KEY,
      },
      body: JSON.stringify({
        login: body.login,
        password: body.password
      })
    })

    console.log("[Auth API] Login response status:", loginResponse.status)

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text()
      console.error("[Auth API] Login failed:", loginResponse.status, errorText)
      
      let errorMessage = `Login failed: ${loginResponse.status} ${loginResponse.statusText}`
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
        { status: loginResponse.status }
      )
    }

    const authData = await loginResponse.json()
    const token = authData.token

    console.log("[Auth API] Received token:", token ? "Yes" : "No")

    if (!token) {
      return NextResponse.json(
        { error: "No token received from authentication" },
        { status: 500 }
      )
    }

    // Now get user info with the token
    console.log("[Auth API] Getting user info with token...")
    const userResponse = await fetchWithRetry(`${FORMUS_API_URL}/api/v1/auth/me`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
        "x-api-key": FORMUS_API_KEY,
      }
    })

    console.log("[Auth API] User info response status:", userResponse.status)

    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error("[Auth API] Failed to get user info:", userResponse.status, errorText)
      
      return NextResponse.json(
        { error: "Failed to get user information" },
        { status: userResponse.status }
      )
    }

    const userData = await userResponse.json()
    console.log("[Auth API] Login successful for:", userData.username)

    return NextResponse.json({
      user: userData,
      token: token
    })
  } catch (error) {
    console.error("[Auth API] Login error:", error)
    
    let errorMessage = "Internal server error during login"
    if (error instanceof Error) {
      if (error.message.includes("ETIMEDOUT") || error.message.includes("timeout") || error.name === "AbortError") {
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