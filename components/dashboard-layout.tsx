"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { name: "Forum", href: "/forum", icon: "forum" },
  { name: "ThreadSense AI", href: "/threadsense", icon: "psychology" },
  { name: "Communities", href: "/communities", icon: "groups" },
  { name: "AI Insights", href: "/ai-insights", icon: "auto_awesome" },
  { name: "Moderation", href: "/moderation", icon: "shield" },
  { name: "Analytics", href: "/analytics", icon: "bar_chart" },
  { name: "API Test", href: "/api-test", icon: "api" },
  { name: "Curl Test", href: "/curl-test", icon: "terminal" },
  { name: "Settings", href: "/settings", icon: "settings" },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authCheckComplete, setAuthCheckComplete] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isAuthenticated, isLoading } = useAuth()

  console.log("[DashboardLayout] Render - pathname:", pathname)
  console.log("[DashboardLayout] Auth state:", { isLoading, isAuthenticated, user: user?.username })

  // Give auth context time to initialize and stabilize after login
  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthCheckComplete(true)
    }, 500) // Increased to 500ms to allow auth state to fully propagate

    return () => clearTimeout(timer)
  }, [])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (authCheckComplete && (!isAuthenticated || !user)) {
      console.log("[DashboardLayout] Not authenticated after check complete")
      console.log("[DashboardLayout] isAuthenticated:", isAuthenticated, "user:", user?.username)
      console.log("[DashboardLayout] Current pathname:", pathname)
      // Only redirect if we're not already on a login/auth page
      if (!pathname.startsWith("/auth/")) {
        console.log("[DashboardLayout] Performing redirect to /auth/login")
        router.replace("/auth/login")
      }
    } else if (authCheckComplete && isAuthenticated && user) {
      console.log("[DashboardLayout] User authenticated successfully:", user.username)
    }
  }, [authCheckComplete, isAuthenticated, user, pathname, router])

  // Show loading state
  if (isLoading || !authCheckComplete) {
    console.log("[DashboardLayout] Showing loading state")
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#101322]">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{isLoading ? "Loading auth..." : "Checking authentication..."}</p>
        </div>
      </div>
    )
  }

  // Show loading or redirect state
  if (!authCheckComplete || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#101322]">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    )
  }

  console.log("[DashboardLayout] User authenticated, showing dashboard")
  const displayName = user.displayName || user.username
  const avatarUrl = user.url // Foru.ms user avatar URL

  const handleSignOut = async () => {
    logout()
    router.push("/auth/login")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f6f8] dark:bg-[#101322]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#101322]/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          "bg-[#111422] border-r border-[#323b67]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col p-4 justify-between">
          <div className="flex flex-col gap-6">
            {/* Logo */}
            <div className="flex gap-3 items-center px-2">
              <div 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 shadow-lg shadow-blue-900/20" 
                style={{
                  backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBevMHBoA-YtcbELXMm8KmJH9I8T1Aa-JGzG1GwdsMmzIkaMping2ioe3ZTFT_LUn4k2AWC338GydfvH1IOqlbDTxiiKTmXRkuNdx3m80fzjH3FDhbFQ4zG448CLdT-eNArXaiVc40xoTCNuzfhYP4QjSM8IyLYWjCe5C_ksCwnHdL4u3q0s4t_90ZR80tYk3Mbgln5mswH2gt_AFgAgvlHoj7Y_qjmzZ9X-s3LD6bZ6IhVbFrrpIoyejjMUpseGtEeIJINPfqlTfOL")`
                }}
              />
              <div className="flex flex-col">
                <h1 className="text-white text-base font-bold leading-normal tracking-wide">Foru.ms</h1>
                <p className="text-[#929bc9] text-xs font-normal leading-normal">Admin Console</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                      isActive
                        ? "bg-[#1337ec] text-white shadow-md shadow-blue-900/20"
                        : "text-[#929bc9] hover:bg-[#232948] hover:text-white",
                    )}
                  >
                    <span className="material-symbols-outlined text-[20px] group-hover:text-white">{item.icon}</span>
                    <p className={cn("text-sm leading-normal", isActive ? "font-semibold" : "font-medium")}>
                      {item.name}
                    </p>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Profile Footer */}
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-[#1a2036] border border-[#232948] mt-auto">
            <Avatar className="size-9 ring-2 ring-[#1337ec]/30">
              <AvatarImage src={avatarUrl || "/placeholder-user.jpg"} alt={displayName} />
              <AvatarFallback className="bg-[#1337ec] text-white text-sm">
                {displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1 min-w-0">
              <p className="text-white text-sm font-medium leading-tight truncate">{displayName}</p>
              <p className="text-[#929bc9] text-xs font-normal leading-tight truncate">Super Admin</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-[#929bc9] hover:text-white h-8 w-8 rounded-lg"
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-4 h-16 px-4 border-b border-[#323b67] bg-[#101322] shadow-sm">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="rounded-lg text-white">
            <span className="material-symbols-outlined">menu</span>
          </Button>
          <div className="flex gap-2 items-center">
            <div className="bg-[#1337ec] rounded-xl size-8 shadow-sm" />
            <span className="text-lg font-bold text-white">Foru.ms</span>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto bg-[#f6f6f8] dark:bg-[#101322]">{children}</div>
      </main>
    </div>
  )
}
