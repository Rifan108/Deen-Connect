"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight, Quote as QuoteIcon, Share2, Copy } from "lucide-react"
import { toast } from "sonner"

interface Quote {
  arabic?: string
  text: string
  reference: string
  translation: string
}

const QUOTES: Quote[] = [
  {
    arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
    text: "Indeed, with hardship comes ease.",
    reference: "Surah Ash-Sharh • 94:5",
    translation: "Verily, alongside every burden and trial, Allah grants immediate and lasting relief.",
  },
  {
    arabic: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ",
    text: "And He is with you wherever you are.",
    reference: "Surah Al-Hadid • 57:4",
    translation: "Allah encompasses all existence with His boundless mercy, knowledge, and protection.",
  },
  {
    arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ",
    text: "So remember Me; I will remember you.",
    reference: "Surah Al-Baqarah • 2:152",
    translation: "Turn to Allah with presence of heart, and your Lord returns to you with grace.",
  },
  {
    arabic: "أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ",
    text: "The deeds most beloved to Allah are those that are most consistent, even if small.",
    reference: "Sahih al-Bukhari • 6464",
    translation: "Spiritual excellence is built upon quiet daily discipline, not intermittent bursts.",
  },
  {
    arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    text: "Unquestionably, by the remembrance of Allah hearts are assured.",
    reference: "Surah Ar-Ra'd • 13:28",
    translation: "The restless soul finds true tranquility only when anchored in its Creator.",
  },
]

export default function DailyQuote() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const dailyIndex = Math.floor((new Date().getTime() / (1000 * 60 * 60 * 24)) % QUOTES.length)
    setIndex(dailyIndex)
  }, [])

  const quote = QUOTES[index]

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % QUOTES.length)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`"${quote.text}" — ${quote.reference}`)
    toast.success("Quote copied to clipboard")
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="p-8 sm:p-12 border-border bg-gradient-to-br from-card to-muted/30 rounded-3xl space-y-8 shadow-xs">
        <div className="flex items-center justify-between border-b border-border/70 pb-4">
          <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C8A96B]" />
            Spiritual Reflection • Daily Inspiration
          </span>
          <button
            onClick={handleCopy}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-mono transition"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy
          </button>
        </div>

        {quote.arabic && (
          <p className="font-arabic text-3xl text-right text-[#123D32] dark:text-[#C8A96B] leading-relaxed" dir="rtl">
            {quote.arabic}
          </p>
        )}

        <div className="space-y-3">
          <p className="font-serif text-2xl sm:text-3xl text-foreground font-light leading-snug">
            "{quote.text}"
          </p>
          <p className="text-xs font-mono uppercase text-[#C8A96B] tracking-wider font-semibold">
            {quote.reference}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed pt-2 border-t border-border/50">
            {quote.translation}
          </p>
        </div>

        <div className="pt-4 flex items-center justify-between">
          <span className="text-[11px] font-mono text-muted-foreground">
            Reflection {index + 1} of {QUOTES.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            className="rounded-full text-xs gap-1.5 border-border hover:border-[#C8A96B]"
          >
            Next Reflection
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
