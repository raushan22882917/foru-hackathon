import { NextResponse } from "next/server"

const FORMUS_API_URL = process.env.FORMUS_API_URL || "https://foru.ms"
const FORMUS_API_KEY = process.env.FORMUS_API_KEY || ""
const FORMUS_BEARER_TOKEN = process.env.FORMUS_BEARER_TOKEN || ""

export async function POST() {
  const results = []

  // Test different payload structures for /api/v1/thread
  const testPayloads = [
    {
      name: "Basic payload",
      data: {
        title: "Test Thread",
        body: "Test content",
        slug: "test-thread"
      }
    },
    {
      name: "With content field",
      data: {
        title: "Test Thread",
        content: "Test content",
        slug: "test-thread"
      }
    },
    {
      name: "With description field",
      data: {
        title: "Test Thread",
        description: "Test content",
        slug: "test-thread"
      }
    },
    {
      name: "Minimal payload",
      data: {
        title: "Test Thread",
        body: "Test content"
      }
    },
    {
      name: "With user info",
      data: {
        title: "Test Thread",
        body: "Test content",
        author: "test-user",
        userId: "test-123"
      }
    },
    {
      name: "With forum/category",
      data: {
        title: "Test Thread",
        body: "Test content",
        forum: "general",
        category: "discussion"
      }
    },
    {
      name: "Nested structure",
      data: {
        thread: {
          title: "Test Thread",
          body: "Test content",
          slug: "test-thread"
        }
      }
    }
  ]

  for (const payload of testPayloads) {
    try {
      console.log(`Testing payload: ${payload.name}`)
      
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
        body: JSON.stringify(payload.data)
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
        payloadName: payload.name,
        payload: payload.data,
        status: response.status,
        statusText: response.statusText,
        success: response.ok,
        data: responseData
      })

    } catch (error) {
      results.push({
        payloadName: payload.name,
        payload: payload.data,
        error: error instanceof Error ? error.message : "Unknown error",
        success: false
      })
    }
  }

  return NextResponse.json({
    message: "Thread Payload Structure Test",
    endpoint: "POST /api/v1/thread",
    results
  })
}