import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: "No token provided in request body" })
    }

    // Try to decode the JWT token
    let decodedToken = null
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      decodedToken = {
        id: payload.id,
        username: payload.username,
        email: payload.email,
        exp: payload.exp,
        iat: payload.iat,
        isExpired: Date.now() >= payload.exp * 1000
      }
    } catch (error) {
      decodedToken = { error: "Failed to decode token" }
    }

    // Test the token with Foru.ms API
    let apiTest = null
    try {
      const response = await fetch(`${process.env.FORMUS_API_URL}/api/v1/me`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "x-api-key": process.env.FORMUS_API_KEY || "",
          "Accept": "application/json"
        }
      })

      if (response.ok) {
        const userData = await response.json()
        apiTest = { success: true, user: userData }
      } else {
        const errorText = await response.text()
        apiTest = { success: false, status: response.status, error: errorText }
      }
    } catch (error) {
      apiTest = { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }

    return NextResponse.json({
      tokenReceived: true,
      tokenLength: token.length,
      tokenPreview: token.substring(0, 50) + "...",
      decodedToken,
      apiTest
    })

  } catch (error) {
    return NextResponse.json({ 
      error: "Failed to test client auth",
      details: error instanceof Error ? error.message : "Unknown error"
    })
  }
}