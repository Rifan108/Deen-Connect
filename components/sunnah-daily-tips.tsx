"use client"

import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Sparkles, BookOpen } from "lucide-react"

interface SunnahTip {
  title: string
  description: string
  source: string
  category: string
}

const SUNNAH_TIPS: SunnahTip[] = [
  {
    title: "Using Miswak (Natural Tooth Stick)",
    description:
      "The Prophet Muhammad (ﷺ) emphasized cleansing teeth with Miswak prior to every prayer. Modern oral biology confirms its antibacterial and gum-strengthening tannins.",
    source: "Sahih al-Bukhari • 887",
    category: "Hygiene & Purification",
  },
  {
    title: "Sleeping on the Right Side",
    description:
      "The Prophet (ﷺ) encouraged lying on the right side with the right hand beneath the cheek, aiding respiratory ease and digestive relaxation.",
    source: "Sahih al-Bukhari • 6315",
    category: "Rest & Sleep",
  },
  {
    title: "Drinking Water in Three Mindful Breaths",
    description:
      "Drinking seated and taking pauses allows the body to absorb hydration without sudden cardiac or gastric strain.",
    source: "Sahih Muslim • 2028",
    category: "Nutrition & Mindful Living",
  },
  {
    title: "Walking to the Congregation",
    description:
      "Every step taken toward the house of Allah raises the servant in spiritual station and erases transgression.",
    source: "Sahih Muslim • 666",
    category: "Worship & Habit",
  },
  {
    title: "Initiating the Greeting of Peace (Salam)",
    description:
      "Greeting believers with 'Assalamu Alaikum' fosters communal harmony, diffuses resentment, and spreads peace across the Ummah.",
    source: "Sahih Muslim • 54",
    category: "Character & Etiquette",
  },
  {
    title: "Smiling as Voluntary Charity (Sadaqah)",
    description:
      "A radiant, genuine smile extended toward your brother or sister is recorded with Allah as an act of voluntary charity.",
    source: "Jami' at-Tirmidhi • 1956",
    category: "Character & Kindness",
  },
]

export default function SunnahDailyTips() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentTip = SUNNAH_TIPS[currentIndex]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
            Prophetic Traditions • Sunnah
          </span>
          <h2 className="text-3xl font-serif text-foreground font-normal mt-0.5">
            Daily Sunnah Habits & Etiquettes
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Timeless Prophetic practices that cultivate health, mindfulness, and noble character.
          </p>
        </div>
      </div>

      {/* Featured Story Card */}
      <Card className="p-8 sm:p-10 border-border bg-gradient-to-br from-card via-card to-muted/20 rounded-3xl space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#123D32]/10 dark:bg-[#C8A96B]/20 text-[#123D32] dark:text-[#C8A96B] font-semibold">
            {currentTip.category}
          </span>
          <span className="text-xs font-mono text-muted-foreground">
            {currentIndex + 1} of {SUNNAH_TIPS.length}
          </span>
        </div>

        <div className="space-y-3">
          <h3 className="font-serif text-2xl sm:text-3xl font-light text-foreground">
            {currentTip.title}
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
            {currentTip.description}
          </p>
          <p className="text-xs font-mono text-[#C8A96B] font-semibold pt-1">
            {currentTip.source}
          </p>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-border/60">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentIndex((prev) => (prev - 1 + SUNNAH_TIPS.length) % SUNNAH_TIPS.length)}
            className="rounded-full text-xs gap-1 border-border"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Previous
          </Button>

          <div className="flex items-center gap-1.5">
            {SUNNAH_TIPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIndex ? "w-6 bg-[#C8A96B]" : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % SUNNAH_TIPS.length)}
            className="rounded-full text-xs gap-1 border-border"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </Card>

      {/* Grid of All Sunnah Habits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {SUNNAH_TIPS.map((tip, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`p-4 rounded-2xl border text-left transition space-y-1.5 ${
              idx === currentIndex
                ? "bg-[#123D32] text-[#F7F5EF] border-[#123D32] dark:bg-[#174C3D] shadow-xs"
                : "bg-card border-border hover:border-[#C8A96B]/50 hover:bg-muted/50 text-foreground"
            }`}
          >
            <span className={`text-[10px] font-mono uppercase tracking-wider ${idx === currentIndex ? "text-[#C8A96B]" : "text-muted-foreground"}`}>
              {tip.category}
            </span>
            <h4 className="font-serif font-medium text-sm line-clamp-1">{tip.title}</h4>
            <p className={`text-xs line-clamp-2 ${idx === currentIndex ? "text-[#A9B9A7]" : "text-muted-foreground"}`}>
              {tip.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
