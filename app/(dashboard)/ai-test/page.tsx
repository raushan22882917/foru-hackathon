"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { improveThreadContent, generateThreadSuggestions } from "@/lib/gemini-ai"

export default function AITestPage() {
  const [title, setTitle] = useState("How to fix login issues?")
  const [body, setBody] = useState("I'm having trouble logging into my account. The password reset doesn't work.")
  const [improvedContent, setImprovedContent] = useState<any>(null)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const testImprovement = async (type: "professional" | "clarity" | "engagement" | "grammar") => {
    setIsLoading(true)
    setError("")
    try {
      const result = await improveThreadContent(title, body, type)
      setImprovedContent(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to improve content")
    } finally {
      setIsLoading(false)
    }
  }

  const testSuggestions = async () => {
    setIsLoading(true)
    setError("")
    try {
      const result = await generateThreadSuggestions("authentication", "question")
      setSuggestions(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate suggestions")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-2xl text-primary">psychology</span>
        <h1 className="text-3xl font-bold">AI Integration Test</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Test Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter thread title..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Body</label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter thread content..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">AI Improvement Tests</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => testImprovement("professional")}
                  disabled={isLoading}
                >
                  Professional
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => testImprovement("clarity")}
                  disabled={isLoading}
                >
                  Clarity
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => testImprovement("engagement")}
                  disabled={isLoading}
                >
                  Engagement
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => testImprovement("grammar")}
                  disabled={isLoading}
                >
                  Grammar
                </Button>
              </div>
            </div>

            <Button onClick={testSuggestions} disabled={isLoading} className="w-full">
              Generate Thread Suggestions
            </Button>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>AI Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                Processing with Gemini AI...
              </div>
            )}

            {improvedContent && (
              <div className="space-y-3">
                <h3 className="font-semibold">Improved Content:</h3>
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <p className="font-medium text-sm">Title:</p>
                  <p className="text-sm mb-2">{improvedContent.improvedTitle}</p>
                  <p className="font-medium text-sm">Body:</p>
                  <p className="text-sm mb-2">{improvedContent.improvedBody}</p>
                  <p className="font-medium text-sm">Suggestions:</p>
                  <ul className="text-sm list-disc list-inside">
                    {improvedContent.suggestions.map((suggestion: string, index: number) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Generated Suggestions:</h3>
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="font-medium text-sm">{suggestion.title}</p>
                    <p className="text-sm text-muted-foreground">{suggestion.body}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}