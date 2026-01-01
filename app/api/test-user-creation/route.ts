import { NextResponse } from "next/server"

const FORMUS_API_URL = process.env.FORMUS_API_URL || "https://foru.ms"
const FORMUS_API_KEY = process.env.FORMUS_API_KEY || ""
const FORMUS_BEARER_TOKEN = process.env.FORMUS_BEARER_TOKEN || ""

export async function POST() {
  const results = []

  // Test user creation with different approaches
  const userCreationTests = [
    {
      name: "POST /api/v1/users",
      endpoint: "/api/v1/users",
      method: "POST",
      payload: {
        username: "testuser",
        email: "test@example.com",
        password: "testpassword123"
      }
    },
    {
      name: "POST /api/v1/user",
      endpoint: "/api/v1/user",
      method: "POST", 
      payload: {
        username: "testuser",
        email: "test@example.com",
        password: "testpassword123"
      }
    },
    {
      name: "POST /api/v1/register",
      endpoint: "/api/v1/register",
      method: "POST",
      payload: {
        username: "testuser",
        email: "test@example.com",
        password: "testpassword123"
      }
    },
    {
      name: "POST /api/v1/signup",
      endpoint: "/api/v1/signup", 
      method: "POST",
      payload: {
        username: "testuser",
        email: "test@example.com",
        password: "testpassword123"
      }
    }
  ]

  for (const test of userCreationTests) {
    try {
      console.log(`Testing ${test.name}`)
      
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

      const response = await fetch(`${FORMUS_API_URL}${test.endpoint}`, {
        method: test.method,
        headers,
        body: JSON.stringify(test.payload)
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
        payload: test.payload,
        status: response.status,
        statusText: response.statusText,
        success: response.ok,
        data: responseData
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
    message: "User Creation Test Results",
    results
  })
}