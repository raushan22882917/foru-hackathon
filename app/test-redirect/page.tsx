"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function TestRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    console.log("Test redirect: attempting to redirect to dashboard...")
    router.push("/dashboard")
    
    setTimeout(() => {
      if (window.location.pathname !== "/dashboard") {
        console.log("Test redirect: router.push failed, using window.location...")
        window.location.href = "/dashboard"
      }
    }, 500)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Testing Redirect...</h1>
        <p>If you see this for more than a second, there's a redirect issue.</p>
        <button 
          onClick={() => window.location.href = "/dashboard"}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Manual Redirect to Dashboard
        </button>
      </div>
    </div>
  )
}