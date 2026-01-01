export interface Profile {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  theme: "light" | "dark"
  email_notifications: boolean
  push_notifications: boolean
  moderation_alerts: boolean
  weekly_digest: boolean
  ai_suggestions_enabled: boolean
  created_at: string
  updated_at: string
}

export interface ActivityLog {
  id: string
  user_id: string
  action_type: string
  entity_type: string | null
  entity_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface ModerationLog {
  id: string
  user_id: string
  action: string
  target_type: string
  target_id: string
  reason: string | null
  ai_suggestion: boolean
  created_at: string
}

export interface ThreadDraft {
  id: string
  user_id: string
  title: string
  body: string
  tags: string[]
  status: "draft" | "posting" | "posted" | "failed"
  error_message: string | null
  foru_thread_id: string | null
  community_id: string | null
  created_at: string
  updated_at: string
}

// Foru.ms API Types
export interface ForumThread {
  id: string
  title: string
  slug: string
  body: string
  locked: boolean
  pinned: boolean
  user: {
    id: string
    username: string
    avatar: string | null
  }
  tags: Array<{
    id: string
    name: string
    description: string
    color: string
  }>
  createdAt: string
  updatedAt: string
  replyCount?: number
  viewCount?: number
}

export interface ForumPost {
  id: string
  content: string
  user: {
    id: string
    username: string
    avatar: string | null
  }
  threadId: string
  upvotes: number
  createdAt: string
  updatedAt: string
  isSolution?: boolean
}
