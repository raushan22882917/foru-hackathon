// Environment Variables Helper
// This file provides type-safe access to environment variables

export const env = {
  // Database
  postgres: {
    url: process.env.POSTGRES_URL!,
    prismaUrl: process.env.POSTGRES_PRISMA_URL!,
    user: process.env.POSTGRES_USER!,
    password: process.env.POSTGRES_PASSWORD!,
    database: process.env.POSTGRES_DATABASE!,
    host: process.env.POSTGRES_HOST!,
  },

  // Supabase (Server-side)
  supabase: {
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    jwtSecret: process.env.SUPABASE_JWT_SECRET!,
  },

  // Supabase (Client-side)
  supabasePublic: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    redirectUrl: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL,
  },

  // Foru.ms API
  foruMs: {
    apiKey: process.env.FORMUS_API_KEY!,
    apiUrl: process.env.FORMUS_API_URL || "https://foru.ms",
  },

  // AI
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY!,
  },

  // Helper to check if all required variables are set
  validate() {
    const required = ["SUPABASE_URL", "SUPABASE_ANON_KEY", "FORMUS_API_KEY", "GEMINI_API_KEY"]

    const missing = required.filter((key) => !process.env[key])

    if (missing.length > 0) {
      console.error("[v0] Missing required environment variables:", missing)
      return false
    }

    return true
  },
} as const

// Validate on module load (server-side only)
if (typeof window === "undefined") {
  env.validate()
}
