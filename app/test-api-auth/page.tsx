"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function TestApiAuthPage() {
  const [result, setResult] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: "testuser" + Date.now(),
    email: "test" + Date.now() + "@example.com",
    displayName: "Test User",
    password: "TestPass123" // Strong password that meets requirements
  })

  const testRegister = async () => {
    setLoading(true)
    setResult("Testing registration with real Foru.ms API...")
    
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult(`✅ Registration successful!\nUser ID: ${data.id}\nUsername: ${data.username}\nEmail: ${data.email}\nDisplay Name: ${data.displayName}`)
      } else {
        setResult(`❌ Registration failed: ${data.error}`)
      }
    } catch (error) {
      setResult(`❌ Registration error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    setLoading(true)
    setResult("Testing login with real Foru.ms API...")
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          login: formData.username,
          password: formData.password
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult(`✅ Login successful!\nUser: ${data.user.username}\nDisplay Name: ${data.user.displayName}\nEmail: ${data.user.email}\nToken: ${data.token.substring(0, 30)}...`)
      } else {
        setResult(`❌ Login failed: ${data.error}`)
      }
    } catch (error) {
      setResult(`❌ Login error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Test Real Foru.ms API Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              Must contain uppercase, lowercase, and number
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={testRegister} disabled={loading} className="flex-1">
              {loading ? "Testing..." : "Register"}
            </Button>
            <Button onClick={testLogin} disabled={loading} variant="outline" className="flex-1">
              {loading ? "Testing..." : "Login"}
            </Button>
          </div>

          {result && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap">{result}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}