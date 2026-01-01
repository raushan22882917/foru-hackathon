"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

export default function CurlTestPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testDifferentMethods = async () => {
    setLoading(true)
    try {
      const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']
      const results = []

      for (const method of methods) {
        try {
          console.log(`Testing ${method} method...`)
          
          const requestOptions: RequestInit = {
            method: method,
            headers: {
              'Accept': 'application/json',
              'Authorization': 'Bearer 123435',
              'x-api-key': '3ef25752-03e4-4c44-9f9a-2decad0f859c'
            }
          }

          // Add body for POST/PUT/PATCH methods
          if (['POST', 'PUT', 'PATCH'].includes(method)) {
            requestOptions.headers = {
              ...requestOptions.headers,
              'Content-Type': 'application/json'
            }
            requestOptions.body = JSON.stringify({
              title: "Test Thread",
              body: "Test content"
            })
          }

          const response = await fetch('https://foru.ms/api/v1/threads', requestOptions)
          
          let responseData = null
          let responseText = ''
          
          try {
            responseText = await response.text()
            if (responseText) {
              responseData = JSON.parse(responseText)
            }
          } catch (e) {
            responseData = responseText
          }

          results.push({
            method,
            status: response.status,
            statusText: response.statusText,
            success: response.ok,
            allowedMethods: response.headers.get('Allow') || response.headers.get('access-control-allow-methods'),
            data: responseData,
            error: null
          })

        } catch (error) {
          results.push({
            method,
            status: 0,
            statusText: 'Network Error',
            success: false,
            allowedMethods: null,
            data: null,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

      setResult({
        methodTests: results,
        success: results.some(r => r.success)
      })

    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : "Unknown error",
        success: false
      })
    } finally {
      setLoading(false)
    }
  }

  const testSimpleRequest = async () => {
    setLoading(true)
    try {
      // Test a simple request without parameters
      const response = await fetch('https://foru.ms/api/v1/threads', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer 123435',
          'x-api-key': '3ef25752-03e4-4c44-9f9a-2decad0f859c'
        }
      })

      const responseText = await response.text()
      let responseData = null
      
      try {
        responseData = JSON.parse(responseText)
      } catch (e) {
        responseData = responseText
      }

      setResult({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
        success: response.ok
      })

    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : "Unknown error",
        success: false
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Curl Command Test</h1>
        <p className="text-muted-foreground">Test the exact curl command format</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>HTTP Methods Test</CardTitle>
            <CardDescription>Test all HTTP methods to see which are allowed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-xs bg-muted p-3 rounded">
                Tests GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD methods<br/>
                to determine which HTTP methods are supported by the API
              </div>
              <Button onClick={testDifferentMethods} disabled={loading} className="w-full">
                {loading ? "Testing..." : "Test All HTTP Methods"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Simple Request Test</CardTitle>
            <CardDescription>Test without query parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-xs bg-muted p-3 rounded font-mono">
                curl --request GET \<br/>
                &nbsp;&nbsp;--url 'https://foru.ms/api/v1/threads' \<br/>
                &nbsp;&nbsp;--header 'Accept: application/json' \<br/>
                &nbsp;&nbsp;--header 'Authorization: Bearer 123435' \<br/>
                &nbsp;&nbsp;--header 'x-api-key: 3ef25752-03e4-4c44-9f9a-2decad0f859c'
              </div>
              <Button onClick={testSimpleRequest} disabled={loading} className="w-full">
                {loading ? "Testing..." : "Test Simple Request"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Test Results
              <Badge variant={result.success ? "default" : "destructive"}>
                {result.success ? "Success" : "Failed"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.methodTests && (
                <div>
                  <strong>HTTP Methods Test Results:</strong>
                  <div className="mt-2 space-y-2">
                    {result.methodTests.map((test: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Badge variant={test.success ? "default" : "destructive"} className="text-xs">
                            {test.method}
                          </Badge>
                          <span className="text-sm">{test.status} {test.statusText}</span>
                        </div>
                        {test.allowedMethods && (
                          <span className="text-xs text-muted-foreground">
                            Allowed: {test.allowedMethods}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {result.status && (
                <div>
                  <strong>Status:</strong> {result.status} {result.statusText}
                </div>
              )}
              
              {result.error && (
                <div className="text-destructive">
                  <strong>Error:</strong> {result.error}
                </div>
              )}

              {result.headers && (
                <div>
                  <strong>Response Headers:</strong>
                  <Textarea 
                    value={JSON.stringify(result.headers, null, 2)} 
                    readOnly 
                    className="mt-2 font-mono text-xs"
                    rows={6}
                  />
                </div>
              )}

              {result.data && (
                <div>
                  <strong>Response Data:</strong>
                  <Textarea 
                    value={typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)} 
                    readOnly 
                    className="mt-2 font-mono text-xs"
                    rows={10}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}