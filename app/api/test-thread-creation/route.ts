import { NextResponse } from "next/server"
import { createThread } from "@/lib/foru-api"

export async function POST() {
  try {
    console.log("Testing thread creation...")

    const testThread = await createThread({
      title: "Test Thread Creation",
      body: "This is a test to verify thread creation works properly with fallback mechanisms.",
      tags: ["test", "demo"],
      userId: "test-user-123"
    })

    return NextResponse.json({
      success: true,
      message: "Thread creation test completed",
      thread: {
        id: testThread.id,
        title: testThread.title,
        isDemo: testThread.id.startsWith('mock-') || testThread.id.startsWith('fallback-'),
        createdAt: testThread.createdAt
      }
    })

  } catch (error) {
    console.error("Thread creation test failed:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}