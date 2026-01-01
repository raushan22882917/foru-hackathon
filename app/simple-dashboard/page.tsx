export default function SimpleDashboardPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Dashboard</h1>
        <p className="text-gray-600">You have successfully logged in!</p>
        <div className="mt-8">
          <a 
            href="/dashboard" 
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go to Full Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}