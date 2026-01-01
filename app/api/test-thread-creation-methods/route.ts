import { NextResponse } from "next/server"

const FORMUS_API_URL = process.env.FORMUS_API_URL || "https://foru.ms"
const FORMUS_API_KEY = process.env.FORMUS_API_KEY || ""
const FORMUS_BEARER_TOKEN = process.env.FORMUS_BEARER_TOKEN || ""

export async function POST() {
  const results = []

  const testPayload = {
    title: "Test Thread from API",
    body: "This is a test thread created via the API to verify thread creation functionality.",
    slug: "test-thread-from-api"
  }

  // Test different thread creation approaches
  const testMethods = [
    { path: "/api/v1/threads", method: "POST" },
    { path: "/api/v1/thread", method: "POST" },
    { path: "/api/v1/threads", method: "PUT" },
    { path: "/api/v1/posts", method: "POST" },
    { path: "/api/v1/forum/threads", method: "POST" },
    { path: "/threads", method: "POST" },
    { path: "/thread", method: "POST" },
  ]

  for (const testMethod of testMethods) {
    try {
      console.log(`Testing ${testMethod.method} ${testMethod.path}`)
      
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

      const response = await fetch(`${FORMUS_API_URL}${testMethod.path}`, {
        method: testMethod.method,
        headers,
        body: JSON.stringify(testPayload)
      })

      let responseData = null
      try {
        const text = await response.text()
        if (text) {
          try {
            responseData = JSON.parse(text)
          } catch {
            responseData = text.substring(0, 300) + (text.length > 300 ? "..." : "")
          }
        }
      } catch (e) {
        responseData = "Could not read response"
      }

      results.push({
        endpoint: `${testMethod.method} ${testMethod.path}`,
        status: response.status,
        statusText: response.statusText,
        success: response.ok,
        data: responseData,
        headers: {
          'content-type': response.headers.get('content-type'),
          'x-ratelimit-remaining': response.headers.get('x-ratelimit-remaining')
        }
      })

    } catch (error) {
      results.push({
        endpoint: `${testMethod.method} ${testMethod.path}`,
        error: error instanceof Error ? error.message : "Unknown error",
        success: false
      })
    }
  }

  return NextResponse.json({
    message: "Thread Creation Methods Test",
    payload: testPayload,
    results
  })
}