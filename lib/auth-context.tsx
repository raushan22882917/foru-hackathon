"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { foruAuth, type ForuMsUser, ForuMsAuth } from "./foru-auth"

interface AuthContextType {
  user: ForuMsUser | null
  token: string | null
  isLoading: boolean
  login: (login: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ForuMsUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log("[AuthContext] Initializing auth state...")
    // Check for existing auth on mount
    const storedToken = ForuMsAuth.getToken()
    const storedUser = localStorage.getItem('foru_user')

    console.log("[AuthContext] Stored token:", storedToken ? "Present" : "Missing")
    console.log("[AuthContext] Stored user:", storedUser ? "Present" : "Missing")

    if (storedToken && storedUser && !ForuMsAuth.isTokenExpired(storedToken)) {
      try {
        const parsedUser = JSON.parse(storedUser)
        console.log("[AuthContext] Restoring auth state for user:", parsedUser.username)
        setUser(parsedUser)
        setToken(storedToken)
        
        // Set cookie for server-side access
        document.cookie = `foru_auth_token=${storedToken}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days
      } catch (error) {
        console.error("[AuthContext] Failed to parse stored user:", error)
        logout()
      }
    } else {
      console.log("[AuthContext] No valid stored auth found")
    }
    
    console.log("[AuthContext] Auth initialization complete")
    setIsLoading(false)
  }, [])

  const login = async (loginValue: string, password: string) => {
    console.log("[AuthContext] Starting login process...")
    
    const { user: loggedInUser, token: authToken } = await foruAuth.login({
      login: loginValue,
      password
    })

    console.log("[AuthContext] Login successful, updating state...")
    console.log("[AuthContext] User:", loggedInUser.username)
    console.log("[AuthContext] Token:", authToken ? "Present" : "Missing")

    setUser(loggedInUser)
    setToken(authToken)
    
    // Store in localStorage and cookie
    ForuMsAuth.setToken(authToken)
    localStorage.setItem('foru_user', JSON.stringify(loggedInUser))
    document.cookie = `foru_auth_token=${authToken}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days
    
    console.log("[AuthContext] Auth state updated successfully")
    
    // Force a small delay to ensure state is updated
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    ForuMsAuth.removeToken()
    localStorage.removeItem('foru_user')
    
    // Clear cookie
    document.cookie = 'foru_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user && !!token
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="text-muted-foreground mb-4">Please log in to access this page.</p>
            <a href="/auth/login" className="text-primary hover:underline">
              Go to Login
            </a>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}