// Foru.ms Authentication Client
interface ForuMsUser {
  id: string
  displayName: string
  username: string
  email: string
  emailVerified: boolean
  isOnline: boolean
  lastSeenAt: string
  bio: string | null
  signature: string | null
  url: string | null
  createdAt: string
  updatedAt: string
  instanceId: string
  extendedData: any
  roles: Array<{
    id: string
    name: string
    description: string | null
    color: string | null
    extendedData: any
    instanceId: string
    createdAt: string
    updatedAt: string
  }>
}

interface AuthResponse {
  token: string
}

interface RegisterData {
  username: string
  email: string
  displayName: string
  password: string
  emailVerified?: boolean
  roles?: string[]
}

interface LoginData {
  login: string // username or email
  password: string
}

class ForuMsAuth {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `/api/auth${endpoint}`
    
    const headers: Record<string, string> = {
      "Accept": "application/json",
      ...options.headers as Record<string, string>
    }

    if (options.body) {
      headers["Content-Type"] = "application/json"
    }

    console.log(`[Foru.ms Auth] ${options.method || 'GET'} ${endpoint}`)

    const response = await fetch(url, {
      ...options,
      headers
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error || `${response.status} ${response.statusText}`
      throw new Error(errorMessage)
    }

    return response.json()
  }

  async register(data: RegisterData): Promise<ForuMsUser> {
    console.log("[Foru.ms Auth] Registering user:", data.username)
    
    const payload = {
      username: data.username,
      email: data.email,
      displayName: data.displayName,
      password: data.password,
      emailVerified: data.emailVerified ?? true,
      roles: data.roles ?? ["user"]
    }

    const user = await this.request<ForuMsUser>("/register", {
      method: "POST",
      body: JSON.stringify(payload)
    })

    console.log("[Foru.ms Auth] User registered successfully:", user.id)
    return user
  }

  async login(data: LoginData): Promise<{ user: ForuMsUser; token: string }> {
    console.log("[Foru.ms Auth] Logging in user:", data.login)
    
    const result = await this.request<{ user: ForuMsUser; token: string }>("/login", {
      method: "POST",
      body: JSON.stringify(data)
    })

    console.log("[Foru.ms Auth] User logged in successfully:", result.user.id)
    return result
  }

  async getCurrentUser(token: string): Promise<ForuMsUser> {
    const user = await this.request<ForuMsUser>("/me", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })

    return user
  }

  // Note: Password reset functionality would need additional API routes
  // For now, these are placeholder methods
  async forgotPassword(email: string): Promise<void> {
    console.log("[Foru.ms Auth] Password reset not implemented via API routes yet")
    throw new Error("Password reset functionality not available")
  }

  async resetPassword(data: { password: string; oldPassword: string; email: string }): Promise<void> {
    console.log("[Foru.ms Auth] Password reset not implemented via API routes yet")
    throw new Error("Password reset functionality not available")
  }

  // Utility methods for client-side auth state management
  static setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('foru_auth_token', token)
    }
  }

  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('foru_auth_token')
    }
    return null
  }

  static removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('foru_auth_token')
    }
  }

  static isTokenExpired(token: string): boolean {
    try {
      // For now, let's assume tokens don't expire to test if this is the issue
      console.log("[ForuMsAuth] Checking token expiration for token:", token.substring(0, 20) + "...")
      
      // Try to decode the JWT payload
      const payload = JSON.parse(atob(token.split('.')[1]))
      console.log("[ForuMsAuth] Token payload exp:", payload.exp)
      console.log("[ForuMsAuth] Current time:", Math.floor(Date.now() / 1000))
      
      const isExpired = Date.now() >= payload.exp * 1000
      console.log("[ForuMsAuth] Token expired:", isExpired)
      
      return isExpired
    } catch (error) {
      console.log("[ForuMsAuth] Error checking token expiration:", error)
      return true
    }
  }
}

export const foruAuth = new ForuMsAuth()
export { ForuMsAuth }
export type { ForuMsUser, RegisterData, LoginData }