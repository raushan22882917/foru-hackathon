import { NextRequest, NextResponse } from "next/server"

const FORMUS_API_URL = process.env.FORMUS_API_URL || "https://foru.ms"
const FORMUS_API_KEY = process.env.FORMUS_API_KEY || ""

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // Remove "Bearer " prefix

    console.log("[Auth API] Getting user info with token")

    const response = await fetch(`${FORMUS_API_URL}/api/v1/auth/me`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
        "x-api-key": FORMUS_API_KEY,
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[Auth API] Failed to get user info:", response.status, errorText)
      
      let errorMessage = `Failed to get user info: ${response.status} ${response.statusText}`
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
    console.log("[Auth API] Successfully retrieved user info for:", userData.username)

    return NextResponse.json(userData)
  } catch (error) {
    console.error("[Auth API] Get user error:", error)
    return NextResponse.json(
      { error: "Internal server error while getting user info" },
      { status: 500 }
    )
  }
}