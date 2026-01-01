"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setIsLoading(true)

    try {
      // Note: Foru.ms password reset functionality would need to be implemented
      // For now, show a message that it's not available
      setMessage("Password reset functionality is not yet available. Please contact support for assistance.")
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
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
          <CardTitle className="text-2xl">Reset your password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 p-3 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-3 text-sm text-blue-700 dark:text-blue-300">
                {message}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send reset link"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <div className="text-sm text-muted-foreground">
              Remember your password?{" "}
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