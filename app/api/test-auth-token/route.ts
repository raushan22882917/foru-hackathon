import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('foru_auth_token')?.value

    if (!token) {
      return NextResponse.json({ 
        error: "No auth token found in cookies",
        cookies: Object.fromEntries(cookieStore.getAll().map(c => [c.name, c.value.substring(0, 20) + "..."]))
      })
    }

    // Try to decode the JWT token
    let decodedToken = null
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      decodedToken = {
        id: payload.id,
        username: payload.username,
        exp: payload.exp,
        iat: payload.iat,
        isExpired: Date.now() >= payload.exp * 1000
      }
    } catch (error) {
      decodedToken = { error: "Failed to decode token" }
    }

    return NextResponse.json({
      tokenFound: true,
      tokenLength: token.length,
      tokenPreview: token.substring(0, 50) + "...",
      decodedToken,
      allCookies: Object.fromEntries(cookieStore.getAll().map(c => [c.name, c.value.substring(0, 20) + "..."]))
    })

  } catch (error) {
    return NextResponse.json({ 
      error: "Failed to check auth token",
      details: error instanceof Error ? error.message : "Unknown error"
    })
  }
}