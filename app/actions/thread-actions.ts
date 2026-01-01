"use server"

import { createThread } from "@/lib/foru-api"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

interface CreateThreadData {
  title: string
  body: string
  tags?: string[]
  communityId?: string
}

interface CreateThreadResult {
  success: boolean
  threadId?: string
  error?: string
}

export async function createThreadAction(data: CreateThreadData): Promise<CreateThreadResult> {
  try {
    // Get user from Foru.ms auth token (stored in cookies or headers)
    const cookieStore = await cookies()
    const token = cookieStore.get('foru_auth_token')?.value

    if (!token) {
      return { success: false, error: "You must be logged in to create a thread" }
    }

    // Decode token to get user ID (basic JWT decode)
    let userId: string
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      userId = payload.id
      
      // Check if token is expired
      if (Date.now() >= payload.exp * 1000) {
        return { success: false, error: "Your session has expired. Please log in again." }
      }
    } catch (error) {
      return { success: false, error: "Invalid authentication token" }
    }

    console.log("[Foru.ms] Creating thread with data:", data)

    // Create thread directly on Foru.ms API
    const thread = await createThread({
      title: data.title,
      body: data.body,
      tags: data.tags || [],
      userId: userId,
      authToken: token, // Pass the auth token for API authentication
    })

    console.log("[Foru.ms] Thread created successfully:", thread.id)

    revalidatePath("/communities")
    revalidatePath("/dashboard")
    revalidatePath("/forum")

    return {
      success: true,
      threadId: thread.id,
    }
  } catch (error) {
    console.error("[Foru.ms] Failed to create thread:", error)

    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
    }
  }
}
