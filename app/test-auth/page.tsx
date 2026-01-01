"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestAuthPage() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Status:</strong> {isAuthenticated ? "Authenticated" : "Not authenticated"}
          </div>
          
          {user && (
            <div className="space-y-2">
              <div><strong>User ID:</strong> {user.id}</div>
              <div><strong>Username:</strong> {user.username}</div>
              <div><strong>Display Name:</strong> {user.displayName}</div>
              <div><strong>Email:</strong> {user.email}</div>
            </div>
          )}

          <div className="flex gap-2">
            {isAuthenticated ? (
              <Button onClick={logout} variant="outline">
                Logout
              </Button>
            ) : (
              <div className="space-y-2">
                <p>Not logged in. Go to:</p>
                <div className="flex gap-2">
                  <Button asChild>
                    <a href="/auth/login">Login</a>
                  </Button>
                  <Button asChild variant="outline">
                    <a href="/auth/sign-up">Sign Up</a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}