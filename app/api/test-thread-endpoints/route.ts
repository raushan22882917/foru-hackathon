import { NextResponse } from "next/server"

const FORMUS_API_URL = process.env.FORMUS_API_URL || "https://foru.ms"
const FORMUS_API_KEY = process.env.FORMUS_API_KEY || ""

export async function GET() {
  const results = []

  // Test different thread endpoint patterns
  const testThreadId = "93c91123-ee51-4458-8f6c-ac9cdd8a7398" // The failing thread ID
  
  const endpoints = [
    `/api/v1/thread/${testThreadId}`,
    `/api/v1/threads/${testThreadId}`,
    `/api/v1/thread/${testThreadId}/posts`,
    `/api/v1/threads/${testThreadId}/posts`,
  ]

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing endpoint: ${endpoint}`)
      
      const headers: Record<string, string> = {
        "Accept": "application/json",
        "User-Agent": "Foru.ms-Client/1.0"
      }

      if (FORMUS_API_KEY) {
        headers["x-api-key"] = FORMUS_API_KEY
      }

      const response = await fetch(`${FORMUS_API_URL}${endpoint}`, {
        method: "GET",
        headers
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
        endpoint,
        status: response.status,
        statusText: response.statusText,
        success: response.ok,
        data: responseData
      })

    } catch (error) {
      results.push({
        endpoint,
        error: error instanceof Error ? error.message : "Unknown error",
        success: false
      })
    }
  }

  return NextResponse.json({
    message: "Thread Endpoint Structure Test",
    testThreadId,
    results
  })
}