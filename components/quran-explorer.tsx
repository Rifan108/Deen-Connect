"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"

interface Surah {
  number: number
  name: string
  nameArabic: string
  verseCount: number
  revelationType: string
}

const SURAHS: Surah[] = [
  { number: 1, name: "Al-Fatiha", nameArabic: "الفاتحة", verseCount: 7, revelationType: "Meccan" },
  { number: 2, name: "Al-Baqarah", nameArabic: "البقرة", verseCount: 286, revelationType: "Medinan" },
  { number: 3, name: "Ali Imran", nameArabic: "آل عمران", verseCount: 200, revelationType: "Medinan" },
  { number: 36, name: "Ya-Sin", nameArabic: "يس", verseCount: 83, revelationType: "Meccan" },
  { number: 55, name: "Ar-Rahman", nameArabic: "الرحمن", verseCount: 78, revelationType: "Meccan" },
  { number: 67, name: "Al-Mulk", nameArabic: "الملك", verseCount: 30, revelationType: "Meccan" },
  { number: 112, name: "Al-Ikhlas", nameArabic: "الإخلاص", verseCount: 4, revelationType: "Meccan" },
]

export default function QuranExplorer() {
  const [selectedSurah, setSelectedSurah] = useState<Surah>(SURAHS[0])
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="space-y-4">
      {/* Selected Surah Display */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground mb-2">SURAH {selectedSurah.number}</p>
          <h3 className="text-3xl font-serif font-bold text-primary">{selectedSurah.name}</h3>
          <p className="text-2xl text-accent font-bold mt-2">{selectedSurah.nameArabic}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center text-sm">
          <div className="bg-card rounded-lg p-3">
            <p className="text-muted-foreground mb-1">Verses</p>
            <p className="font-bold text-primary text-lg">{selectedSurah.verseCount}</p>
          </div>
          <div className="bg-card rounded-lg p-3">
            <p className="text-muted-foreground mb-1">Revelation</p>
            <p className="font-bold text-accent text-lg">{selectedSurah.revelationType}</p>
          </div>
        </div>
      </Card>

      {/* Surah List */}
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-3 px-4 bg-card hover:bg-card/80 rounded-lg border border-border text-left font-semibold text-primary transition-colors mb-3"
        >
          Browse Surahs {expanded ? "▼" : "▶"}
        </button>

        {expanded && (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {SURAHS.map((surah) => (
              <button
                key={surah.number}
                onClick={() => {
                  setSelectedSurah(surah)
                  setExpanded(false)
                }}
                className={`w-full p-3 rounded-lg transition-colors text-left ${
                  selectedSurah.number === surah.number
                    ? "bg-primary text-primary-foreground"
                    : "bg-card hover:bg-card/80 border border-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold">
                      {surah.number}. {surah.name}
                    </p>
                    <p className="text-sm opacity-75">{surah.nameArabic}</p>
                  </div>
                  <p className="text-xs opacity-75">{surah.verseCount} verses</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
