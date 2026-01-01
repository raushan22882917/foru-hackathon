import { NextResponse } from "next/server"

const FORMUS_API_URL = process.env.FORMUS_API_URL || "https://foru.ms"
const FORMUS_API_KEY = process.env.FORMUS_API_KEY || ""
const FORMUS_BEARER_TOKEN = process.env.FORMUS_BEARER_TOKEN || ""

export async function POST() {
  const results = []

  // Test Foru.ms auth endpoints
  const authTests = [
    {
      name: "Register User",
      endpoint: "/api/v1/auth/register",
      method: "POST",
      payload: {
        username: "testuser123",
        email: "test@example.com",
        displayName: "Test User",
        password: "TestPassword123!",
        emailVerified: true,
        roles: ["user"]
      }
    },
    {
      name: "Login User",
      endpoint: "/api/v1/auth/login",
      method: "POST",
      payload: {
        login: "testuser123",
        password: "TestPassword123!"
      }
    },
    {
      name: "Get Current User",
      endpoint: "/api/v1/auth/me",
      method: "GET",
      payload: null
    },
    {
      name: "Get Security Info",
      endpoint: "/api/v1/auth/security",
      method: "GET",
      payload: null
    }
  ]

  for (const test of authTests) {
    try {
      console.log(`Testing ${test.name}`)
      
      const headers: Record<string, string> = {
        "Accept": "application/json",
        "User-Agent": "Foru.ms-Client/1.0"
      }

      if (test.payload) {
        headers["Content-Type"] = "application/json"
      }

      if (FORMUS_API_KEY) {
        headers["x-api-key"] = FORMUS_API_KEY
      }

      if (FORMUS_BEARER_TOKEN) {
        headers["Authorization"] = `Bearer ${FORMUS_BEARER_TOKEN}`
      }

      const response = await fetch(`${FORMUS_API_URL}${test.endpoint}`, {
        method: test.method,
        headers,
        ...(test.payload && { body: JSON.stringify(test.payload) })
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
        test: test.name,
        endpoint: test.endpoint,
        method: test.method,
        payload: test.payload,
        status: response.status,
        statusText: response.statusText,
        success: response.ok,
        data: responseData,
        headers: {
          'content-type': response.headers.get('content-type'),
          'set-cookie': response.headers.get('set-cookie'),
          'authorization': response.headers.get('authorization')
        }
      })

    } catch (error) {
      results.push({
        test: test.name,
        endpoint: test.endpoint,
        error: error instanceof Error ? error.message : "Unknown error",
        success: false
      })
    }
  }

  return NextResponse.json({
    message: "Foru.ms Authentication Test Results",
    results
  })
}