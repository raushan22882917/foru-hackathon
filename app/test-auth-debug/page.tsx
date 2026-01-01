"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

export default function AuthDebugPage() {
  const { user, token, isAuthenticated, isLoading } = useAuth()
  const [testResult, setTestResult] = useState<any>(null)
  const [isTestingToken, setIsTestingToken] = useState(false)

  const testToken = async () => {
    if (!token) {
      setTestResult({ error: "No token available" })
      return
    }

    setIsTestingToken(true)
    try {
      const response = await fetch("/api/test-client-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token })
      })

      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({ error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setIsTestingToken(false)
    }
  }

  const testRealThreadCreation = async () => {
    setIsTestingToken(true)
    try {
      const response = await fetch("/api/test-real-thread-creation", {
        method: "POST"
      })

      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({ error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setIsTestingToken(false)
    }
  }

  const testCookies = async () => {
    setIsTestingToken(true)
    try {
      const response = await fetch("/api/test-auth-token")
      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({ error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setIsTestingToken(false)
    }
  }

  if (isLoading) {
    return <div className="p-8">Loading auth state...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth Debug Page</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Current Auth State:</h2>
          <p><strong>Is Authenticated:</strong> {isAuthenticated ? "Yes" : "No"}</p>
          <p><strong>User:</strong> {user ? user.username : "None"}</p>
          <p><strong>Token Present:</strong> {token ? "Yes" : "No"}</p>
          {token && (
            <p><strong>Token Preview:</strong> {token.substring(0, 50)}...</p>
          )}
        </div>

        <div className="space-x-4">
          <Button onClick={testToken} disabled={isTestingToken || !token}>
            {isTestingToken ? "Testing..." : "Test Token with API"}
          </Button>
          <Button onClick={testCookies} disabled={isTestingToken}>
            {isTestingToken ? "Testing..." : "Test Server-Side Cookies"}
          </Button>
          <Button onClick={testRealThreadCreation} disabled={isTestingToken}>
            {isTestingToken ? "Testing..." : "Test Real Thread Creation"}
          </Button>
        </div>

        {testResult && (
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="font-semibold mb-2">Test Result:</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}