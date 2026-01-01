"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Brain, ChevronDown } from "lucide-react"
import { TLDRBot } from "@/components/tldr-bot"
import { SentimentMeter } from "@/components/sentiment-meter"
import { SmartSuggestions } from "@/components/smart-suggestions"
import { AIModerator } from "@/components/ai-moderator"
import { AIResponse } from "@/components/ai-response"

interface AIInsightsSectionProps {
  thread: any
  posts: any[]
}

export function AIInsightsSection({ thread, posts }: AIInsightsSectionProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between group">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Insights & Analysis
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4">
        {/* AI Response - Shows first when expanded */}
        <AIResponse 
          thread={thread} 
          posts={posts} 
          isVisible={isOpen}
        />
        
        {/* Other AI Features */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <TLDRBot thread={thread} posts={posts} />
          <SentimentMeter thread={thread} posts={posts} />
          <SmartSuggestions threadId={thread.id} thread={thread} />
        </div>
        <AIModerator content={thread.body} author={thread.user.username} />
      </CollapsibleContent>
    </Collapsible>
  )
}