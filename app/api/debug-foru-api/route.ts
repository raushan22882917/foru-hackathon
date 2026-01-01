import { NextResponse } from "next/server"

const FORMUS_API_URL = process.env.FORMUS_API_URL || "https://foru.ms"
const FORMUS_API_KEY = process.env.FORMUS_API_KEY || ""
const FORMUS_BEARER_TOKEN = process.env.FORMUS_BEARER_TOKEN || ""

export async function GET() {
  const results = []

  // Test different API endpoints to understand the structure
  const testEndpoints = [
    { path: "/api/v1", method: "GET" },
    { path: "/api", method: "GET" },
    { path: "/api/v1/threads", method: "OPTIONS" },
    { path: "/api/v1/threads", method: "GET" },
    { path: "/api/v1/forum", method: "GET" },
    { path: "/api/v1/posts", method: "GET" },
    { path: "/", method: "GET" },
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

      const responseHeaders = Object.fromEntries(response.headers.entries())
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
        headers: responseHeaders,
        data: responseData,
        success: response.ok
      })

    } catch (error) {
      results.push({
        endpoint: `${endpoint.method} ${endpoint.path}`,
        error: error instanceof Error ? error.message : "Unknown error",
        success: false
      })
    }
  }

  return NextResponse.json({
    message: "Foru.ms API Debug Results",
    apiUrl: FORMUS_API_URL,
    hasApiKey: !!FORMUS_API_KEY,
    hasBearerToken: !!FORMUS_BEARER_TOKEN,
    results
  })
}