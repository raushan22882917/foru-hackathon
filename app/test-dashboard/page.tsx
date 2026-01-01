"use client"

import { useAuth } from "@/lib/auth-context"

export default function TestDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Not Authenticated</h1>
          <p>Please log in to access this page.</p>
          <a href="/auth/login" className="text-blue-500 hover:underline">
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Test Dashboard</h1>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Welcome, {user?.username}!</h2>
            <p className="text-gray-600">You have successfully logged in to the dashboard.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">User Info</h3>
              <p><strong>Username:</strong> {user?.username}</p>
              <p><strong>Display Name:</strong> {user?.displayName || 'Not set'}</p>
              <p><strong>User ID:</strong> {user?.id}</p>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Authentication Status</h3>
              <p><strong>Authenticated:</strong> ✅ Yes</p>
              <p><strong>Loading:</strong> {isLoading ? '⏳ Yes' : '✅ No'}</p>
            </div>
          </div>
          
          <div className="mt-8 flex gap-4">
            <a 
              href="/dashboard" 
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Go to Full Dashboard
            </a>
            <a 
              href="/forum" 
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Go to Forum
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}