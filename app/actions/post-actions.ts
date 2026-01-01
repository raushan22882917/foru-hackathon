"use server"

import { createPost, likePost, unlikePost, dislikePost, undislikePost } from "@/lib/foru-api"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

interface CreatePostData {
  threadId: string
  content: string
  authToken?: string
}

export async function createPostAction(data: CreatePostData) {
  try {
    console.log("[Post Actions] Creating post for thread:", data.threadId)
    
    if (!data.content.trim()) {
      return {
        success: false,
        error: "Content is required"
      }
    }

    if (data.content.trim().length < 5) {
      return {
        success: false,
        error: "Content must be at least 5 characters long"
      }
    }

    if (data.content.length > 5000) {
      return {
        success: false,
        error: "Content must not exceed 5,000 characters"
      }
    }

    // Get auth token from cookies or use provided token
    let authToken = data.authToken
    if (!authToken) {
      const cookieStore = await cookies()
      authToken = cookieStore.get('foru_auth_token')?.value
    }

    // For demo purposes, use the bearer token from env if no user auth token
    if (!authToken) {
      console.log("[Post Actions] No user auth token, using demo token for hackathon demo")
      authToken = process.env.FORMUS_BEARER_TOKEN
    }

    const post = await createPost(data.threadId, data.content.trim(), authToken)
    
    console.log("[Post Actions] Post created successfully:", post.id)
    
    // Revalidate the thread page to show the new post
    revalidatePath(`/forum/thread/${data.threadId}`)
    revalidatePath("/forum")
    
    return {
      success: true,
      postId: post.id,
      post
    }
  } catch (error) {
    console.error("[Post Actions] Failed to create post:", error)
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    
    return {
      success: false,
      error: errorMessage.includes("401") || errorMessage.includes("Unauthorized") 
        ? "Authentication required. Please log in to post replies."
        : errorMessage.includes("403") || errorMessage.includes("Forbidden")
        ? "You don't have permission to post in this thread."
        : errorMessage.includes("404")
        ? "Thread not found. It may have been deleted."
        : "Failed to create post. Please try again."
    }
  }
}

export async function likePostAction(postId: string) {
  try {
    console.log("[Post Actions] Liking post:", postId)
    
    await likePost(postId)
    
    console.log("[Post Actions] Post liked successfully")
    
    // Revalidate to update like counts
    revalidatePath("/forum")
    
    return {
      success: true
    }
  } catch (error) {
    console.error("[Post Actions] Failed to like post:", error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to like post"
    }
  }
}

export async function unlikePostAction(postId: string) {
  try {
    console.log("[Post Actions] Unliking post:", postId)
    
    await unlikePost(postId)
    
    console.log("[Post Actions] Post unliked successfully")
    
    // Revalidate to update like counts
    revalidatePath("/forum")
    
    return {
      success: true
    }
  } catch (error) {
    console.error("[Post Actions] Failed to unlike post:", error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to unlike post"
    }
  }
}

export async function dislikePostAction(postId: string) {
  try {
    console.log("[Post Actions] Disliking post:", postId)
    
    await dislikePost(postId)
    
    console.log("[Post Actions] Post disliked successfully")
    
    // Revalidate to update dislike counts
    revalidatePath("/forum")
    
    return {
      success: true
    }
  } catch (error) {
    console.error("[Post Actions] Failed to dislike post:", error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to dislike post"
    }
  }
}

export async function undislikePostAction(postId: string) {
  try {
    console.log("[Post Actions] Removing dislike from post:", postId)
    
    await undislikePost(postId)
    
    console.log("[Post Actions] Post dislike removed successfully")
    
    // Revalidate to update dislike counts
    revalidatePath("/forum")
    
    return {
      success: true
    }
  } catch (error) {
    console.error("[Post Actions] Failed to remove dislike from post:", error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove dislike"
    }
  }
}