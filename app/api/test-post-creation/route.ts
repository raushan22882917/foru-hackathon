import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get('foru_auth_token')?.value

    if (!token) {
      return NextResponse.json({ 
        error: "No auth token found. Please log in first.",
        success: false
      })
    }

    // Get request body
    const body = await request.json()
    const { threadId, content } = body

    if (!threadId || !content) {
      return NextResponse.json({
        error: "Missing threadId or content",
        success: false
      })
    }

    // Test creating a post with the real API
    const testPayload = {
      body: content,
      threadId: threadId,
      userId: "user-id-placeholder", // This will be handled by the server with the auth token
      parentId: null,
      extendedData: {}
    }

    const headers: Record<string, string> = {
      "Accept": "application/json",
      "Content-Type": "application/json",
    }

    // Add API key
    if (process.env.FORMUS_API_KEY) {
      headers["x-api-key"] = process.env.FORMUS_API_KEY
    }

    // Add the user's auth token
    headers["Authorization"] = `Bearer ${token}`

    console.log("[Test] Making request to Foru.ms API to create post")
    console.log("[Test] Headers:", { 
      ...headers, 
      "x-api-key": headers["x-api-key"] ? "***" : "NOT_SET",
      "Authorization": "Bearer ***"
    })

    const response = await fetch(`${process.env.FORMUS_API_URL}/api/v1/post`, {
      method: "POST",
      headers,
      body: JSON.stringify(testPayload),
    })

    let responseData = null
    try {
      const text = await response.text()
      if (text) {
        try {
          responseData = JSON.parse(text)
        } catch {
          responseData = text.substring(0, 500) + (text.length > 500 ? "..." : "")
        }
      }
    } catch (e) {
      responseData = "Could not read response"
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      payload: testPayload,
      response: responseData,
      tokenUsed: token.substring(0, 20) + "...",
      apiUrl: process.env.FORMUS_API_URL,
      hasApiKey: !!process.env.FORMUS_API_KEY
    })

  } catch (error) {
    return NextResponse.json({ 
      error: "Failed to test post creation",
      details: error instanceof Error ? error.message : "Unknown error",
      success: false
    })
  }
}