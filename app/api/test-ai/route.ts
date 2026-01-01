import { NextRequest, NextResponse } from "next/server"
import { improveThreadContent, generateThreadSuggestions } from "@/lib/gemini-ai"

export async function GET(request: NextRequest) {
  try {
    console.log("🧪 Testing Gemini AI Integration...")

    const results: any = {
      timestamp: new Date().toISOString(),
      tests: []
    }

    // Test 1: Content Improvement
    console.log("📝 Testing content improvement...")
    try {
      const improvementResult = await improveThreadContent(
        "help with login",
        "i cant login to my account. password reset not working.",
        "professional"
      )
      
      results.tests.push({
        test: "Content Improvement",
        status: "success",
        input: {
          title: "help with login",
          body: "i cant login to my account. password reset not working.",
          type: "professional"
        },
        output: improvementResult
      })
      
      console.log("✅ Content improvement successful!")
    } catch (error) {
      results.tests.push({
        test: "Content Improvement",
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error"
      })
      console.log("❌ Content improvement failed:", error)
    }

    // Test 2: Thread Suggestions
    console.log("💡 Testing thread suggestions...")
    try {
      const suggestions = await generateThreadSuggestions("authentication", "question")
      
      results.tests.push({
        test: "Thread Suggestions",
        status: "success",
        input: {
          topic: "authentication",
          type: "question"
        },
        output: suggestions
      })
      
      console.log("✅ Thread suggestions successful!")
    } catch (error) {
      results.tests.push({
        test: "Thread Suggestions", 
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error"
      })
      console.log("❌ Thread suggestions failed:", error)
    }

    console.log("🎉 AI Integration test completed!")

    return NextResponse.json({
      success: true,
      message: "AI integration test completed",
      results
    })

  } catch (error) {
    console.error("AI test error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}