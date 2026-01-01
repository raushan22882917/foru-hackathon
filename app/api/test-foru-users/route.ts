import { NextResponse } from "next/server"

const FORMUS_API_URL = process.env.FORMUS_API_URL || "https://foru.ms"
const FORMUS_API_KEY = process.env.FORMUS_API_KEY || ""
const FORMUS_BEARER_TOKEN = process.env.FORMUS_BEARER_TOKEN || ""

export async function GET() {
  const results = []

  // Test different user-related endpoints
  const testEndpoints = [
    { path: "/api/v1/users", method: "GET" },
    { path: "/api/v1/user", method: "GET" },
    { path: "/api/v1/auth", method: "GET" },
    { path: "/api/v1/me", method: "GET" },
    { path: "/api/v1/profile", method: "GET" },
    { path: "/api/v1/account", method: "GET" },
  ]

  for (const endpoint of testEndpoints) {
    try {
      console.log(`Testing ${endpoint.method} ${endpoint.path}`)
      
      const headers: Record<string, string> = {
        "Accept": "application/json",
        "User-Agent": "Foru.ms-Client/1.0"
      }

      if (FORMUS_API_KEY) {
        headers["x-api-key"] = FORMUS_API_KEY
      }

      if (FORMUS_BEARER_TOKEN) {
        headers["Authorization"] = `Bearer ${FORMUS_BEARER_TOKEN}`
      }

      const response = await fetch(`${FORMUS_API_URL}${endpoint.path}`, {
        method: endpoint.method,
        headers,
      })

      let responseData = null
      try {
        const text = await response.text()
        if (text) {
          try {
            responseData = JSON.parse(text)
          } catch {
            responseData = text.substring(0, 200) + (text.length > 200 ? "..." : "")
          }
        }
      } catch (e) {
        responseData = "Could not read response"
      }

      results.push({
        endpoint: `${endpoint.method} ${endpoint.path}`,
        status: response.status,
        statusText: response.statusText,
        success: response.ok,
        data: responseData
      })

    } catch (error) {
      results.push({
        endpoint: `${endpoint.method} ${endpoint.path}`,
        error: error instanceof Error ? error.message : "Unknown error",
        success: false
      })
    }
  }

  // Also test creating a thread without userId
  try {
    console.log("Testing thread creation without userId")
    
    const headers: Record<string, string> = {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "User-Agent": "Foru.ms-Client/1.0"
    }

    if (FORMUS_API_KEY) {
      headers["x-api-key"] = FORMUS_API_KEY
    }

    if (FORMUS_BEARER_TOKEN) {
      headers["Authorization"] = `Bearer ${FORMUS_BEARER_TOKEN}`
    }

    const response = await fetch(`${FORMUS_API_URL}/api/v1/thread`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: "Test Thread Without User",
        body: "Testing thread creation without explicit userId"
      })
    })

    let responseData = null
    try {
      const text = await response.text()
      if (text) {
        try {
          responseData = JSON.parse(text)
        } catch {
          responseData = text.substring(0, 200) + (text.length > 200 ? "..." : "")
        }
      }
    } catch (e) {
      responseData = "Could not read response"
    }

    results.push({
      endpoint: "POST /api/v1/thread (no userId)",
      status: response.status,
      statusText: response.statusText,
      success: response.ok,
      data: responseData
    })

  } catch (error) {
    results.push({
      endpoint: "POST /api/v1/thread (no userId)",
      error: error instanceof Error ? error.message : "Unknown error",
      success: false
    })
  }

  return NextResponse.json({
    message: "Foru.ms User and Auth Test",
    results
  })
}