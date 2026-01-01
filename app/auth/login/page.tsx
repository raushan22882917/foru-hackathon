"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    login: "",
    password: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { login, isAuthenticated, user, isLoading: authLoading } = useAuth()

  // Redirect if already authenticated (only check on initial load)
  useEffect(() => {
    // Only redirect if user was already authenticated when component mounted
    if (!authLoading && isAuthenticated && user) {
      console.log("User already authenticated on page load, redirecting to dashboard...")
      router.replace("/dashboard")
    }
  }, [authLoading]) // Only depend on authLoading to avoid running after login

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      console.log("Starting login process...")
      await login(formData.login, formData.password)
      
      console.log("Login successful, redirecting to dashboard...")
      router.replace("/dashboard")
      
    } catch (error) {
      console.error("Login error:", error)
      let errorMessage = "Login failed"
      
      if (error instanceof Error) {
        errorMessage = error.message
        
        // Handle specific error cases
        if (errorMessage.includes("401") || errorMessage.includes("unauthorized")) {
          errorMessage = "Invalid username/email or password. Please check your credentials."
        } else if (errorMessage.includes("404")) {
          errorMessage = "User not found. Please check your username/email."
        } else if (errorMessage.includes("500")) {
          errorMessage = "Server error. Please try again later."
        }
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div 
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 shadow-lg shadow-blue-900/20" 
              style={{
                backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBevMHBoA-YtcbELXMm8KmJH9I8T1Aa-JGzG1GwdsMmzIkaMping2ioe3ZTFT_LUn4k2AWC338GydfvH1IOqlbDTxiiKTmXRkuNdx3m80fzjH3FDhbFQ4zG448CLdT-eNArXaiVc40xoTCNuzfhYP4QjSM8IyLYWjCe5C_ksCwnHdL4u3q0s4t_90ZR80tYk3Mbgln5mswH2gt_AFgAgvlHoj7Y_qjmzZ9X-s3LD6bZ6IhVbFrrpIoyejjMUpseGtEeIJINPfqlTfOL")`
              }}
            />
            <span className="text-2xl font-bold text-slate-900 dark:text-white">Foru.ms</span>
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your Foru.ms account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login">Username or Email</Label>
              <Input
                id="login"
                name="login"
                type="text"
                placeholder="Enter your username or email"
                value={formData.login}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 p-3 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link 
              href="/auth/forgot-password" 
              className="text-sm text-primary hover:underline"
            >
              Forgot your password?
            </Link>
            <div className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/auth/sign-up" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}