"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { likePostAction, unlikePostAction, dislikePostAction, undislikePostAction } from "@/app/actions/post-actions"
import { cn } from "@/lib/utils"

interface PostInteractionsProps {
  postId: string
  initialLikes?: number
  initialDislikes?: number
  userLiked?: boolean
  userDisliked?: boolean
  className?: string
}

export function PostInteractions({ 
  postId, 
  initialLikes = 0, 
  initialDislikes = 0, 
  userLiked = false, 
  userDisliked = false,
  className 
}: PostInteractionsProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [dislikes, setDislikes] = useState(initialDislikes)
  const [isLiked, setIsLiked] = useState(userLiked)
  const [isDisliked, setIsDisliked] = useState(userDisliked)
  const [isLoading, setIsLoading] = useState(false)

  const handleLike = async () => {
    if (isLoading) return
    
    setIsLoading(true)
    try {
      if (isLiked) {
        // Unlike the post
        const result = await unlikePostAction(postId)
        if (result.success) {
          setIsLiked(false)
          setLikes(prev => Math.max(0, prev - 1))
        }
      } else {
        // Like the post
        const result = await likePostAction(postId)
        if (result.success) {
          setIsLiked(true)
          setLikes(prev => prev + 1)
          
          // If user had disliked, remove the dislike
          if (isDisliked) {
            setIsDisliked(false)
            setDislikes(prev => Math.max(0, prev - 1))
          }
        }
      }
    } catch (error) {
      console.error("Failed to toggle like:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDislike = async () => {
    if (isLoading) return
    
    setIsLoading(true)
    try {
      if (isDisliked) {
        // Remove dislike
        const result = await undislikePostAction(postId)
        if (result.success) {
          setIsDisliked(false)
          setDislikes(prev => Math.max(0, prev - 1))
        }
      } else {
        // Dislike the post
        const result = await dislikePostAction(postId)
        if (result.success) {
          setIsDisliked(true)
          setDislikes(prev => prev + 1)
          
          // If user had liked, remove the like
          if (isLiked) {
            setIsLiked(false)
            setLikes(prev => Math.max(0, prev - 1))
          }
        }
      }
    } catch (error) {
      console.error("Failed to toggle dislike:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        disabled={isLoading}
        className={cn(
          "gap-1 h-8 px-2 text-xs",
          isLiked 
            ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30" 
            : "text-muted-foreground hover:text-green-600 dark:hover:text-green-400"
        )}
      >
        <span className={cn(
          "material-symbols-outlined text-[16px]",
          isLiked ? "font-bold" : ""
        )}>
          {isLiked ? "thumb_up" : "thumb_up"}
        </span>
        <span>{likes}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleDislike}
        disabled={isLoading}
        className={cn(
          "gap-1 h-8 px-2 text-xs",
          isDisliked 
            ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30" 
            : "text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
        )}
      >
        <span className={cn(
          "material-symbols-outlined text-[16px]",
          isDisliked ? "font-bold" : ""
        )}>
          {isDisliked ? "thumb_down" : "thumb_down"}
        </span>
        <span>{dislikes}</span>
      </Button>
    </div>
  )
}