"use client"

import { useState } from "react"
import { Clock, Wand2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { RealTimeFactSection } from "@/components/real-time-fact-section"
import { StaticFactSection } from "@/components/static-fact-section"

type TabType = "realtime" | "static"

export function FactTabs() {
  const [activeTab, setActiveTab] = useState<TabType>("realtime")

  const getTabClassName = (tabType: TabType) => {
    return `border-color-primary flex items-center gap-1.5 rounded-full px-3 py-2 text-base font-medium hover:bg-transparent hover:text-inherit sm:gap-2 sm:px-6 sm:py-3 sm:text-lg ${
      activeTab === tabType ? "text-foreground" : "text-foreground opacity-50"
    }`
  }

  return (
    <section>
      {/* Tab Navigation */}
      <div className="mb-8 flex justify-center p-2">
        <div className="border-primary/20 border-1 inline-flex gap-1 rounded-full bg-card p-1 sm:gap-2 sm:p-1">
          <Button
            variant={activeTab === "realtime" ? "outline" : "ghost"}
            onClick={() => setActiveTab("realtime")}
            size="lg"
            className={getTabClassName("realtime")}
          >
            <Wand2 className="size-4 text-primary sm:size-6" />
            <span className="whitespace-nowrap">Real-Time Facts</span>
          </Button>
          <Button
            variant={activeTab === "static" ? "outline" : "ghost"}
            onClick={() => setActiveTab("static")}
            size="lg"
            className={getTabClassName("static")}
          >
            <Clock className="size-4 text-primary sm:size-6" />
            <span className="whitespace-nowrap">Classic Facts</span>
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "realtime" && <RealTimeFactSection />}
        {activeTab === "static" && <StaticFactSection />}
      </div>
    </section>
  )
}
