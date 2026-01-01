"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { foruAuth } from "@/lib/foru-auth"
import { useAuth } from "@/lib/auth-context"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    displayName: "",
    password: "",
    confirmPassword: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // Validate password strength (Foru.ms requirements)
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, and one number")
      return
    }

    setIsLoading(true)

    try {
      const user = await foruAuth.register({
        username: formData.username,
        email: formData.email,
        displayName: formData.displayName,
        password: formData.password,
        emailVerified: true,
        roles: ["user"]
      })
      
      console.log("Registration successful:", user.username)
      
      // Auto-login after registration using auth context
      await login(formData.username, formData.password)
      
      console.log("Auto-login successful, redirecting to dashboard...")
      
      // Redirect to dashboard
      router.push("/dashboard")
      
    } catch (error) {
      console.error("Registration error:", error)
      let errorMessage = "Registration failed"
      
      if (error instanceof Error) {
        errorMessage = error.message
        
        // Handle specific error cases
        if (errorMessage.includes("409") || errorMessage.includes("already exists")) {
          errorMessage = "Username or email already exists. Please try different credentials."
        } else if (errorMessage.includes("400")) {
          errorMessage = "Invalid registration data. Please check your inputs."
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
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>
            Join the Foru.ms community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                name="displayName"
                type="text"
                placeholder="Your display name"
                value={formData.displayName}
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
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
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
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <div className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}