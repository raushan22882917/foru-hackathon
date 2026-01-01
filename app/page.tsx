import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col bg-background-light dark:bg-background-dark">
      <header className="border-b border-slate-200 dark:border-border-dark bg-white dark:bg-[#151a2d]">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div 
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 shadow-lg shadow-blue-900/20" 
              style={{
                backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBevMHBoA-YtcbELXMm8KmJH9I8T1Aa-JGzG1GwdsMmzIkaMping2ioe3ZTFT_LUn4k2AWC338GydfvH1IOqlbDTxiiKTmXRkuNdx3m80fzjH3FDhbFQ4zG448CLdT-eNArXaiVc40xoTCNuzfhYP4QjSM8IyLYWjCe5C_ksCwnHdL4u3q0s4t_90ZR80tYk3Mbgln5mswH2gt_AFgAgvlHoj7Y_qjmzZ9X-s3LD6bZ6IhVbFrrpIoyejjMUpseGtEeIJINPfqlTfOL")`
              }}
            />
            <span className="text-xl font-bold text-slate-900 dark:text-white">Foru.ms</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="text-slate-600 dark:text-text-secondary hover:text-primary">
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
              <Link href="/auth/sign-up">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container flex flex-col items-center justify-center gap-8 px-4 py-24 text-center">
          <div className="flex max-w-4xl flex-col gap-6">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20 mb-4">
              <span className="material-symbols-outlined text-[16px] mr-2">auto_awesome</span>
              AI-Powered Community Management
            </div>
            <h1 className="text-balance text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Intelligent Forum Management for{" "}
              <span className="text-primary">Foru.ms</span>
            </h1>
            <p className="text-balance text-xl text-slate-600 dark:text-text-secondary leading-relaxed max-w-3xl mx-auto">
              Streamline your forum operations with intelligent insights, automated moderation, and smart engagement
              tools. Connect your Foru.ms communities and let AI handle the heavy lifting.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 px-8 py-3 text-base font-semibold">
              <Link href="/forum">Browse Forum</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-slate-300 dark:border-border-dark text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-surface-dark px-8 py-3 text-base font-semibold">
              <Link href="/auth/sign-up">Join Community</Link>
            </Button>
          </div>

          <div className="mt-20 grid w-full max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center gap-4 text-center p-6 rounded-xl bg-white dark:bg-[#151a2d] border border-slate-200 dark:border-border-dark shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                <span className="material-symbols-outlined text-[24px] text-primary">auto_awesome</span>
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">AI Insights</h3>
              <p className="text-sm text-slate-600 dark:text-text-secondary leading-relaxed">
                Get intelligent summaries and sentiment analysis of community discussions with real-time monitoring
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 text-center p-6 rounded-xl bg-white dark:bg-[#151a2d] border border-slate-200 dark:border-border-dark shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <span className="material-symbols-outlined text-[24px] text-indigo-600 dark:text-indigo-400">shield</span>
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Smart Moderation</h3>
              <p className="text-sm text-slate-600 dark:text-text-secondary leading-relaxed">
                AI-powered content review with automated flagging, toxicity detection, and moderation suggestions
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 text-center p-6 rounded-xl bg-white dark:bg-[#151a2d] border border-slate-200 dark:border-border-dark shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20">
                <span className="material-symbols-outlined text-[24px] text-purple-600 dark:text-purple-400">bar_chart</span>
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Analytics</h3>
              <p className="text-sm text-slate-600 dark:text-text-secondary leading-relaxed">
                Track community health metrics, engagement trends, and user behavior patterns over time
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 text-center p-6 rounded-xl bg-white dark:bg-[#151a2d] border border-slate-200 dark:border-border-dark shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-500/10 border border-green-500/20">
                <span className="material-symbols-outlined text-[24px] text-green-600 dark:text-green-400">chat_bubble</span>
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Smart Replies</h3>
              <p className="text-sm text-slate-600 dark:text-text-secondary leading-relaxed">
                Generate contextual responses and engage with your community efficiently using AI assistance
              </p>
            </div>
          </div>

          {/* Demo Section */}
          <div className="mt-20 w-full max-w-5xl">
            <div className="rounded-2xl border border-slate-200 dark:border-border-dark bg-white dark:bg-[#151a2d] shadow-xl overflow-hidden">
              <div className="bg-slate-50 dark:bg-[#1c2236] px-6 py-4 border-b border-slate-200 dark:border-border-dark">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-sm font-medium text-slate-600 dark:text-text-secondary">Foru.ms Admin Console</span>
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-50 dark:bg-[#232948] rounded-lg p-4">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">1,240</div>
                    <div className="text-sm text-slate-600 dark:text-text-secondary">Total Threads</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#232948] rounded-lg p-4">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">45</div>
                    <div className="text-sm text-slate-600 dark:text-text-secondary">Active Discussions</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#232948] rounded-lg p-4">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">82%</div>
                    <div className="text-sm text-slate-600 dark:text-text-secondary">AI Sentiment</div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-primary to-blue-600 rounded-lg p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                    <span className="text-xs font-bold uppercase tracking-wider">AI Insights</span>
                  </div>
                  <h4 className="text-lg font-bold mb-1">Trending: React Server Components</h4>
                  <p className="text-sm opacity-90">High engagement detected in #frontend-dev. 3 threads flagged for review.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 dark:border-border-dark py-12 bg-white dark:bg-[#151a2d]">
        <div className="container px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div 
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-6" 
              style={{
                backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBevMHBoA-YtcbELXMm8KmJH9I8T1Aa-JGzG1GwdsMmzIkaMping2ioe3ZTFT_LUn4k2AWC338GydfvH1IOqlbDTxiiKTmXRkuNdx3m80fzjH3FDhbFQ4zG448CLdT-eNArXaiVc40xoTCNuzfhYP4QjSM8IyLYWjCe5C_ksCwnHdL4u3q0s4t_90ZR80tYk3Mbgln5mswH2gt_AFgAgvlHoj7Y_qjmzZ9X-s3LD6bZ6IhVbFrrpIoyejjMUpseGtEeIJINPfqlTfOL")`
              }}
            />
            <span className="font-bold text-slate-900 dark:text-white">Foru.ms</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-text-secondary">
            © 2025 Foru.ms Admin Console. AI-powered community management platform.
          </p>
        </div>
      </footer>
    </div>
  )
}
