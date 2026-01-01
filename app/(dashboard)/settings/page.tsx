"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    push_notifications: false,
    moderation_alerts: true,
    weekly_digest: true,
    ai_suggestions_enabled: true,
    theme: "dark" as "light" | "dark"
  })
  
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    loadUserPreferences()
  }, [])

  const loadUserPreferences = async () => {
    try {
      if (!isAuthenticated || !user) {
        router.push('/auth/login')
        return
      }

      // Mock user preferences since we removed Supabase
      setPreferences({
        email_notifications: true,
        push_notifications: false,
        moderation_alerts: true,
        weekly_digest: true,
        ai_suggestions_enabled: true,
        theme: 'dark'
      })
    } catch (error) {
      console.error('Error loading preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const savePreferences = async () => {
    try {
      setSaving(true)
      if (!isAuthenticated || !user) return

      // Mock save since we removed Supabase
      console.log('[Settings] Saving preferences:', preferences)
      
      // Show success feedback
      const button = document.querySelector('[data-save-button]') as HTMLButtonElement
      if (button) {
        const originalText = button.textContent
        button.textContent = 'Saved!'
        setTimeout(() => {
          button.textContent = originalText
        }, 2000)
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
    } finally {
      setSaving(false)
    }
  }

  const updatePreference = (key: keyof typeof preferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Loading your preferences...</p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-32 bg-muted rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences and configurations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Configure how you receive updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive updates via email</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.email_notifications}
              onChange={(e) => updatePreference('email_notifications', e.target.checked)}
              className="h-4 w-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Get browser notifications</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.push_notifications}
              onChange={(e) => updatePreference('push_notifications', e.target.checked)}
              className="h-4 w-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Moderation Alerts</Label>
              <p className="text-sm text-muted-foreground">Urgent content flagging alerts</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.moderation_alerts}
              onChange={(e) => updatePreference('moderation_alerts', e.target.checked)}
              className="h-4 w-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Digest</Label>
              <p className="text-sm text-muted-foreground">Summary of community activity</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.weekly_digest}
              onChange={(e) => updatePreference('weekly_digest', e.target.checked)}
              className="h-4 w-4"
            />
          </div>

          <Button 
            onClick={savePreferences} 
            disabled={saving}
            data-save-button
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Features</CardTitle>
          <CardDescription>Control AI-powered tools and suggestions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>AI Suggestions</Label>
              <p className="text-sm text-muted-foreground">Enable smart replies and content recommendations</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.ai_suggestions_enabled}
              onChange={(e) => updatePreference('ai_suggestions_enabled', e.target.checked)}
              className="h-4 w-4"
            />
          </div>

          <div className="space-y-2">
            <Label>AI Model</Label>
            <Badge>Gemini Pro</Badge>
            <p className="text-sm text-muted-foreground">Currently using Google Gemini for AI features</p>
          </div>

          <Button 
            onClick={savePreferences} 
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Update AI Settings'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Access</CardTitle>
          <CardDescription>Manage your API keys and integrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">Foru.ms API Key</Label>
            <Input id="api-key" type="password" placeholder="Enter your Foru.ms API key" />
          </div>
          <Button>Save API Key</Button>
        </CardContent>
      </Card>
    </div>
  )
}
