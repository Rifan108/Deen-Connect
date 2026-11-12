"use client"

import type React from "react"

import { useState } from "react"
import { Sparkles, BookOpen, Heart, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
  content: string
}

const uniqueFeatures: Feature[] = [
  {
    icon: <BookOpen className="w-6 h-6 text-accent" />,
    title: "Surah Tajweed Tips",
    description: "Learn proper Quran recitation rules",
    content: `Tajweed is the art of reciting the Quran beautifully. Key rules include:
    • Noon Saakinah: Silent Noon rules
    • Meem Saakinah: Silent Meem rules
    • Madd: Elongation rules
    • Qalqalah: Bouncing sound
    • Characteristics of letters (Ghunna, Isti'ala, etc.)`,
  },
  {
    icon: <Heart className="w-6 h-6 text-accent" />,
    title: "Daily Hadith",
    description: "Authentic sayings of Prophet Muhammad",
    content: `"The best of you are those who learn the Quran and teach it."
    - Narrated by Al-Bukhari
    
    Hadith refers to the recorded traditions of the Prophet Muhammad (PBUH). 
    Reading authentic hadith daily strengthens faith and provides guidance for daily life.`,
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-accent" />,
    title: "Islamic Studies Progress",
    description: "Track your learning journey",
    content: `Monitor your progress in:
    • Quran Memorization (Hifz)
    • Hadith Studies
    • Islamic History
    • Fiqh (Islamic Law)
    • Arabic Language Skills`,
  },
  {
    icon: <Sparkles className="w-6 h-6 text-accent" />,
    title: "Interactive Quran Quiz",
    description: "Test your Quranic knowledge",
    content: `Challenge yourself with:
    • Verse identification
    • Surah facts and information
    • Quranic wisdom questions
    • Tajweed rule applications
    Earn rewards for correct answers!`,
  },
]

export default function UniqueFeatures() {
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-6 h-6 text-accent" />
        <h2 className="text-2xl font-serif font-bold text-primary">Exclusive Features</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {uniqueFeatures.map((feature, idx) => (
          <Card
            key={idx}
            className="p-6 cursor-pointer hover:border-accent/50 transition border-primary/20"
            onClick={() => setExpandedFeature(expandedFeature === idx ? null : idx)}
          >
            <div className="flex items-start gap-3 mb-3">
              {feature.icon}
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>

            {expandedFeature === idx && (
              <div className="mt-4 pt-4 border-t border-primary/20">
                <p className="text-sm text-foreground whitespace-pre-line">{feature.content}</p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
