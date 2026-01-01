"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { testApiConnection, getThreads } from "@/lib/foru-api"

export default function ApiTestPage() {
  const [connectionTest, setConnectionTest] = useState<any>(null)
  const [threadsTest, setThreadsTest] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    try {
      // Test different authentication methods
      console.log("Testing different authentication methods...")
      
      const testMethods = [
        {
          name: "API Key Only",
          headers: { "x-api-key": process.env.FORMUS_API_KEY || "" }
        },
        {
          name: "Bearer Token Only", 
          headers: { "Authorization": `Bearer ${process.env.FORMUS_BEARER_TOKEN || ""}` }
        },
        {
          name: "Both API Key and Bearer",
          headers: { 
            "x-api-key": process.env.FORMUS_API_KEY || "",
            "Authorization": `Bearer ${process.env.FORMUS_BEARER_TOKEN || ""}`
          }
        },
        {
          name: "No Authentication",
          headers: {}
        }
      ]
      
      const results = []
      
      for (const method of testMethods) {
        try {
          console.log(`Testing: ${method.name}`)
          const response = await fetch("https://foru.ms/api/v1/threads?limit=1", {
            method: 'GET',
            headers: {
              "Accept": "application/json",
              ...method.headers
            }
          })
          
          const result = {
            method: method.name,
            status: response.status,
            success: response.ok,
            error: null as string | null
          }
          
          if (!response.ok) {
            const errorText = await response.text()
            result.error = errorText.substring(0, 200)
          }
          
          results.push(result)
          console.log(`${method.name}: ${response.status}`)
          
        } catch (error) {
          results.push({
            method: method.name,
            status: 0,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
          })
        }
      }
      
      setConnectionTest({
        success: results.some(r => r.success),
        message: "Authentication method tests completed",
        data: { authTests: results }
      })

      // Test our API function if any method worked
      const successfulMethod = results.find(r => r.success)
      if (successfulMethod) {
        console.log("Testing threads endpoint with successful auth method...")
        try {
          const threadsResult = await getThreads(5)
          setThreadsTest({
            success: true,
            count: threadsResult.count,
            threadsLength: threadsResult.threads.length,
            firstThread: threadsResult.threads[0] || null,
            nextCursor: threadsResult.nextCursor
          })
        } catch (threadsError) {
          console.error("Threads test failed:", threadsError)
          setThreadsTest({
            success: false,
            error: threadsError instanceof Error ? threadsError.message : "Unknown error"
          })
        }
      } else {
        setThreadsTest({
          success: false,
          error: "No authentication method worked"
        })
      }
      
    } catch (error) {
      console.error("Test failed:", error)
      setConnectionTest({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runTests()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Foru.ms API Test</h1>
        <p className="text-muted-foreground">Test connection to the real Foru.ms API</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              API Connection Test
              {connectionTest && (
                <Badge variant={connectionTest.success ? "default" : "destructive"}>
                  {connectionTest.success ? "Success" : "Failed"}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Basic API connectivity and authentication</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && !connectionTest && (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>Testing connection...</span>
              </div>
            )}
            
            {connectionTest && (
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Status:</strong> {connectionTest.message}
                </p>
                {connectionTest.data?.testResults && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>HTTP Method Tests:</strong></p>
                    {connectionTest.data.testResults.map((test: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-1 rounded bg-muted/50">
                        <span>{test.test} ({test.method})</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={test.success ? "default" : "destructive"} className="text-xs">
                            {test.status || 'Error'} {test.success ? "✓" : "✗"}
                          </Badge>
                          {test.allowedMethods && (
                            <span className="text-xs">Allow: {test.allowedMethods}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {connectionTest.data?.authTests && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>Authentication Tests:</strong></p>
                    {connectionTest.data.authTests.map((test: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-1 rounded bg-muted/50">
                        <span>{test.method}</span>
                        <Badge variant={test.success ? "default" : "destructive"} className="text-xs">
                          {test.status} {test.success ? "✓" : "✗"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
                {connectionTest.data && !connectionTest.data.authTests && !connectionTest.data.testResults && (
                  <div className="text-xs text-muted-foreground">
                    <p>Response keys: {connectionTest.data.responseKeys?.join(", ")}</p>
                    <p>Has threads: {connectionTest.data.hasThreads ? "Yes" : "No"}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Threads Endpoint Test
              {threadsTest && (
                <Badge variant={threadsTest.success ? "default" : "destructive"}>
                  {threadsTest.success ? "Success" : "Failed"}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Fetch threads from the API</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && !threadsTest && (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>Fetching threads...</span>
              </div>
            )}
            
            {threadsTest && (
              <div className="space-y-2">
                {threadsTest.success ? (
                  <div>
                    <p className="text-sm">
                      <strong>Count:</strong> {threadsTest.count}
                    </p>
                    <p className="text-sm">
                      <strong>Threads returned:</strong> {threadsTest.threadsLength}
                    </p>
                    <p className="text-sm">
                      <strong>Next cursor:</strong> {threadsTest.nextCursor || "None"}
                    </p>
                    {threadsTest.firstThread && (
                      <div className="mt-2 p-2 bg-muted rounded text-xs">
                        <p><strong>First thread:</strong> {threadsTest.firstThread.title}</p>
                        <p><strong>ID:</strong> {threadsTest.firstThread.id}</p>
                        <p><strong>Author:</strong> {threadsTest.firstThread.user?.username}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-destructive">
                    <strong>Error:</strong> {threadsTest.error}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
          <CardDescription>Current API configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_FORMUS_API_URL || "https://foru.ms"}</p>
            <p><strong>API Key:</strong> {typeof window !== 'undefined' ? 'Check server logs' : (process.env.FORMUS_API_KEY ? `${process.env.FORMUS_API_KEY.substring(0, 8)}...` : "Not set")}</p>
            <p><strong>Bearer Token:</strong> {typeof window !== 'undefined' ? 'Check server logs' : (process.env.FORMUS_BEARER_TOKEN ? `${process.env.FORMUS_BEARER_TOKEN.substring(0, 8)}...` : "Not set")}</p>
            <div className="mt-4 p-3 bg-muted rounded text-xs">
              <p><strong>Expected curl format:</strong></p>
              <code className="block mt-1 whitespace-pre-wrap">
{`curl --request GET \\
  --url 'https://foru.ms/api/v1/threads' \\
  --header 'Accept: application/json' \\
  --header 'Authorization: Bearer YOUR_TOKEN' \\
  --header 'x-api-key: YOUR_API_KEY'`}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={runTests} disabled={loading}>
          {loading ? "Running Tests..." : "Run Tests Again"}
        </Button>
      </div>
    </div>
  )
}